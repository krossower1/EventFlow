package com.eventflow.com.auth;

import com.eventflow.com.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public boolean validateCredentials(String username, String password) {
		return userRepository.findByLogin(username)
			.map(user -> passwordEncoder.matches(password, user.getHaslo()))
			.orElse(false);
	}
}
