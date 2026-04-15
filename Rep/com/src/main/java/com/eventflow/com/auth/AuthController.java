package com.eventflow.com.auth;

import com.eventflow.com.auth.dto.LoginRequest;
import com.eventflow.com.auth.dto.LoginResponse;
import com.eventflow.com.auth.dto.RegisterRequest;
import com.eventflow.com.auth.dto.RegisterResponse;
import com.eventflow.com.auth.dto.SessionUserResponse;
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
	private final AuthenticationManager authenticationManager;

	public AuthController(AuthService authService, AuthenticationManager authenticationManager) {
		this.authService = authService;
		this.authenticationManager = authenticationManager;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
		boolean isValid = authService.validateCredentials(request.login(), request.password());

		if (isValid) {
			if (!authService.isEmailVerified(request.login())) {
				return ResponseEntity.status(403).body(new LoginResponse(false, "Email not verified", null, null, null));
			}

			Authentication authentication = authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.login(), request.password())
			);
			SecurityContext context = SecurityContextHolder.createEmptyContext();
			context.setAuthentication(authentication);
			SecurityContextHolder.setContext(context);
			HttpSession session = httpRequest.getSession(true);
			session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, context);

			String rola = authService.getUserRole(request.login());
			String imie = authService.getUserImie(request.login());
			String nazwisko = authService.getUserNazwisko(request.login());
			return ResponseEntity.ok(new LoginResponse(true, "Login successful", rola, imie, nazwisko));
		}

		return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid login or password", null, null, null));
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

	private SessionUserResponse toSessionUser(User user) {
		return new SessionUserResponse(
			user.getLogin(),
			user.getRola(),
			user.getImie(),
			user.getNazwisko()
		);
	}
}
