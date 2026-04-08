package com.eventflow.com.auth;

import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.model.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	public boolean validateCredentials(String login, String password) {
		return userRepository.findByLogin(login)
			.map(user -> passwordEncoder.matches(password, user.getHaslo()))
			.orElse(false);
	}

	public String getUserRole(String login) {
		return userRepository.findByLogin(login)
			.map(User::getRola)
			.orElse(null);
	}

	public String getUserImie(String login) {
		return userRepository.findByLogin(login)
			.map(User::getImie)
			.orElse(null);
	}

	public String getUserNazwisko(String login) {
		return userRepository.findByLogin(login)
			.map(User::getNazwisko)
			.orElse(null);
	}

	public String registerUser(String imie, String nazwisko, String email, String login, String password) {
		if (userRepository.existsByLogin(login)) {
			return "Login already exists";
		}
		if (userRepository.existsByEmail(email)) {
			return "Email already exists";
		}

		String encodedPassword = passwordEncoder.encode(password);
		User user = new User();
		user.setImie(imie);
		user.setNazwisko(nazwisko);
		user.setEmail(email);
		user.setLogin(login);
		user.setHaslo(encodedPassword);
		user.setSalt(UUID.randomUUID().toString());
		user.setRola("USER");
		user.setAktywnosc(true);
		user.setDataUtw(LocalDateTime.now());
		userRepository.save(user);
		return null;
	}
}
