package com.eventflow.com.auth;

import com.eventflow.com.auth.dto.LoginRequest;
import com.eventflow.com.auth.dto.LoginResponse;
import com.eventflow.com.auth.dto.Login2faRequest;
import com.eventflow.com.auth.dto.RegisterRequest;
import com.eventflow.com.auth.dto.RegisterResponse;
import com.eventflow.com.auth.dto.SessionUserResponse;
import com.eventflow.com.auth.dto.TwoFactorCodeRequest;
import com.eventflow.com.auth.dto.TwoFactorSetupResponse;
import com.eventflow.com.auth.dto.TwoFactorStatusResponse;
import com.eventflow.com.auth.dto.VerifyEmailRequest;
import com.eventflow.com.auth.dto.VerifyEmailResponse;
import com.eventflow.com.model.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final TotpService totpService;
	private final AuthenticationManager authenticationManager;

	public AuthController(AuthService authService, TotpService totpService, AuthenticationManager authenticationManager) {
		this.authService = authService;
		this.totpService = totpService;
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		boolean isValid = authService.validateCredentials(request.login(), request.password());

		if (isValid) {
			if (!authService.isEmailVerified(request.login())) {
				return ResponseEntity.status(403).body(new LoginResponse(false, "Email not verified", null, null, null, null, null, false));
			}
			if (authService.isTwoFactorEnabled(request.login())) {
				return ResponseEntity.ok(new LoginResponse(false, "Wymagany kod 2FA", null, null, null, null, null, true));
			}
			return ResponseEntity.ok(completeLogin(request.login(), request.password(), httpRequest));
		}

		return ResponseEntity.status(401).body(new LoginResponse(false, "Niepoprawny login lub hasło", null, null, null, null, null, false));
	}

	/**
	 * Drugi krok logowania dla kont z aktywnym 2FA.
	 * Endpoint oczekuje poprawnego loginu, hasła i jednorazowego kodu TOTP.
	 */
	@PostMapping("/login-2fa")
	public ResponseEntity<LoginResponse> loginWithTwoFactor(@Valid @RequestBody Login2faRequest request, HttpServletRequest httpRequest) {
		boolean isValid = authService.validateCredentials(request.login(), request.password());
		if (!isValid) {
			return ResponseEntity.status(401).body(new LoginResponse(false, "Niepoprawny login lub hasło", null, null, null, null, null, false));
		}
		if (!authService.isEmailVerified(request.login())) {
			return ResponseEntity.status(403).body(new LoginResponse(false, "Email not verified", null, null, null, null, null, false));
		}
		if (!authService.isTwoFactorEnabled(request.login())) {
			return ResponseEntity.ok(completeLogin(request.login(), request.password(), httpRequest));
		}
		if (!authService.isValidTwoFactorCode(request.login(), request.code())) {
			return ResponseEntity.status(401).body(new LoginResponse(false, "Niepoprawny kod 2FA", null, null, null, null, null, true));
		}
		return ResponseEntity.ok(completeLogin(request.login(), request.password(), httpRequest));
	}

	@PostMapping("/register")
	public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
		RegistrationResult result = authService.registerUser(
			request.imie(),
			request.nazwisko(),
			request.email(),
			request.login(),
			request.password()
		);

		if (result.error() != null) {
			return ResponseEntity.badRequest().body(new RegisterResponse(false, result.error()));
		}

		return ResponseEntity.status(201)
			.body(new RegisterResponse(true, "Registration successful. Verify your email to activate the account."));
	}

	@PostMapping("/verify-email")
	public ResponseEntity<VerifyEmailResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
		String error = authService.verifyEmail(request.email(), request.code());
		if (error != null) {
			return ResponseEntity.badRequest().body(new VerifyEmailResponse(false, error));
		}
		return ResponseEntity.ok(new VerifyEmailResponse(true, "Weryfikacja email pozytywna"));
	}

	@GetMapping("/me")
	public ResponseEntity<SessionUserResponse> me(Authentication authentication) {
		if (authentication == null
			|| !authentication.isAuthenticated()
			|| authentication instanceof AnonymousAuthenticationToken) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}

		return authService.findUserByLogin(authentication.getName())
			.map(this::toSessionUser)
			.map(ResponseEntity::ok)
			.orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED).build());
	}

	@GetMapping("/2fa/status")
	public ResponseEntity<TwoFactorStatusResponse> twoFactorStatus(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		boolean enabled = authService.isTwoFactorEnabled(authentication.getName());
		return ResponseEntity.ok(new TwoFactorStatusResponse(enabled));
	}

	/**
	 * Start konfiguracji 2FA dla zalogowanego użytkownika:
	 * generuje sekret i zwraca URI otpauth używane do wygenerowania kodu QR.
	 */
	@PostMapping("/2fa/setup")
	public ResponseEntity<TwoFactorSetupResponse> startTwoFactorSetup(Authentication authentication) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		User user = authService.findUserByLogin(authentication.getName())
			.orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));
		String secret = authService.startTwoFactorSetup(authentication.getName());
		String account = user.getEmail() != null && !user.getEmail().isBlank() ? user.getEmail() : user.getLogin();
		String otpAuthUrl = totpService.buildOtpAuthUrl("EventFlow", account, secret);
		return ResponseEntity.ok(new TwoFactorSetupResponse(true, "Sekret 2FA wygenerowany", secret, otpAuthUrl));
	}

	// Kończy konfigurację 2FA po potwierdzeniu kodem z aplikacji Authenticator.
	@PostMapping("/2fa/enable")
	public ResponseEntity<VerifyEmailResponse> enableTwoFactor(
		@Valid @RequestBody TwoFactorCodeRequest request,
		Authentication authentication
	) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		authService.enableTwoFactor(authentication.getName(), request.code());
		return ResponseEntity.ok(new VerifyEmailResponse(true, "2FA zostało włączone"));
	}

	// Wyłącza 2FA po podaniu poprawnego kodu TOTP.
	@PostMapping("/2fa/disable")
	public ResponseEntity<VerifyEmailResponse> disableTwoFactor(
		@Valid @RequestBody TwoFactorCodeRequest request,
		Authentication authentication
	) {
		if (authentication == null || !authentication.isAuthenticated()) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		authService.disableTwoFactor(authentication.getName(), request.code());
		return ResponseEntity.ok(new VerifyEmailResponse(true, "2FA zostało wyłączone"));
	}

	// Wspólny fragment finalizujący logowanie i zapisujący SecurityContext do sesji.
	private LoginResponse completeLogin(String login, String password, HttpServletRequest httpRequest) {
		Authentication authentication = authenticationManager.authenticate(
			new UsernamePasswordAuthenticationToken(login, password)
		);
		SecurityContext context = SecurityContextHolder.createEmptyContext();
		context.setAuthentication(authentication);
		SecurityContextHolder.setContext(context);
		HttpSession session = httpRequest.getSession(true);
		session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

		String rola = authService.getUserRole(login);
		String imie = authService.getUserImie(login);
		String nazwisko = authService.getUserNazwisko(login);
		User loggedUser = authService.findUserByLogin(login).orElse(null);
		String email = loggedUser != null ? loggedUser.getEmail() : null;
		String telefon = loggedUser != null ? loggedUser.getTelefon() : null;
		return new LoginResponse(true, "Login successful", rola, imie, nazwisko, email, telefon, false);
	}

	private SessionUserResponse toSessionUser(User user) {
		return new SessionUserResponse(
			user.getLogin(),
			user.getRola(),
			user.getImie(),
			user.getNazwisko(),
			user.getEmail(),
			user.getTelefon()
		);
	}
}
