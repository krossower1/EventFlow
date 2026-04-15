package com.eventflow.com.auth;

import com.eventflow.com.auth.dto.LoginRequest;
import com.eventflow.com.auth.dto.LoginResponse;
import com.eventflow.com.auth.dto.RegisterRequest;
import com.eventflow.com.auth.dto.RegisterResponse;
import com.eventflow.com.auth.dto.VerifyEmailRequest;
import com.eventflow.com.auth.dto.VerifyEmailResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/login")
	public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
		boolean isValid = authService.validateCredentials(request.login(), request.password());

		if (isValid) {
			if (!authService.isEmailVerified(request.login())) {
				return ResponseEntity.status(403).body(new LoginResponse(false, "Email not verified", null, null, null));
			}
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
}
