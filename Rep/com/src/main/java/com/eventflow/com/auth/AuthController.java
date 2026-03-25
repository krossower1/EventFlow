package com.eventflow.com.auth;

import com.eventflow.com.auth.dto.LoginRequest;
import com.eventflow.com.auth.dto.LoginResponse;
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
		boolean isValid = authService.validateCredentials(request.username(), request.password());

		if (isValid) {
			return ResponseEntity.ok(new LoginResponse(true, "Login successful"));
		}

		return ResponseEntity.status(401).body(new LoginResponse(false, "Invalid username or password"));
	}
}
