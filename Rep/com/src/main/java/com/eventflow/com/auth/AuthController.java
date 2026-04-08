package com.eventflow.com.auth;

import com.eventflow.com.auth.dto.LoginRequest;
import com.eventflow.com.auth.dto.LoginResponse;
import com.eventflow.com.auth.dto.RegisterRequest;
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
			String rola = authService.getUserRole(request.login());
			String imie = authService.getUserImie(request.login());
			String nazwisko = authService.getUserNazwisko(request.login());
			return ResponseEntity.ok(new LoginResponse(true, "Login successful", rola, imie, nazwisko));
		}

		return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid login or password", null, null, null));
	}

	@PostMapping("/register")
	public ResponseEntity<LoginResponse> register(@Valid @RequestBody RegisterRequest request) {
		String error = authService.registerUser(
			request.imie(),
			request.nazwisko(),
			request.email(),
			request.login(),
			request.password()
		);

		if (error != null) {
			return ResponseEntity.badRequest().body(new LoginResponse(false, error, null, null, null));
		}

		return ResponseEntity.status(201).body(new LoginResponse(true, "Registration successful", null, null, null));
	}
}
