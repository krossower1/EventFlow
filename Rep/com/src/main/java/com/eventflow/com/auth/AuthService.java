package com.eventflow.com.auth;

import com.eventflow.com.model.User;
import com.eventflow.com.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AuthService {

	private static final String VERIFICATION_CODE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	private static final int VERIFICATION_CODE_LENGTH = 6;
	private static final int VERIFICATION_CODE_TTL_MINUTES = 15;
	private static final int SALT_LENGTH = 32;

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final EmailService emailService;
	private final SecureRandom secureRandom = new SecureRandom();

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.emailService = emailService;
	}

	public boolean validateCredentials(String login, String password) {
		return userRepository.findByLogin(login)
			.map(user -> passwordEncoder.matches(password, user.getHaslo()))
			.orElse(false);
	}

	public Optional<User> findUserByLogin(String login) {
		return userRepository.findByLogin(login);
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

	public boolean isEmailVerified(String login) {
		return userRepository.findByLogin(login)
			.map(User::getEmailVerified)
			.map(Boolean::booleanValue)
			.orElse(false);
	}

	@Transactional
	public RegistrationResult registerUser(String imie, String nazwisko, String email, String login, String password) {
		if (userRepository.existsByLogin(login)) {
			return new RegistrationResult("Login juz istnieje");
		}
		if (userRepository.existsByEmail(email)) {
			return new RegistrationResult("Email juz istnieje");
		}

		String encodedPassword = passwordEncoder.encode(password);
		LocalDateTime now = LocalDateTime.now();

		User user = new User();
		user.setImie(imie);
		user.setNazwisko(nazwisko);
		user.setEmail(email);
		user.setLogin(login);
		user.setHaslo(encodedPassword);
		user.setSalt(generateToken(SALT_LENGTH));
		user.setRola("USER");
		user.setAktywnosc(true);
		user.setEmailVerified(false);
		String verificationCode = generateToken(VERIFICATION_CODE_LENGTH);
		user.setVerificationCode(verificationCode);
		user.setVerificationCodeExpiresAt(now.plusMinutes(VERIFICATION_CODE_TTL_MINUTES));
		user.setDataUtw(now);
		userRepository.save(user);
		emailService.sendVerificationCode(email, verificationCode);

		return new RegistrationResult(null);
	}

	public String verifyEmail(String email, String code) {
		Optional<User> optionalUser = userRepository.findByEmail(email);
		if (optionalUser.isEmpty()) {
			return "Email nie zostal znaleziony";
		}

		User user = optionalUser.get();
		if (Boolean.TRUE.equals(user.getEmailVerified())) {
			return "Email jest juz zweryfikowany";
		}
		if (user.getVerificationCode() == null || user.getVerificationCodeExpiresAt() == null) {
			return "Kod weryfikacyjny nie jest aktywny";
		}
		if (user.getVerificationCodeExpiresAt().isBefore(LocalDateTime.now())) {
			return "Kod weryfikacyjny wygasl";
		}

		String normalizedCode = code.trim().toUpperCase();
		if (!user.getVerificationCode().equals(normalizedCode)) {
			return "Niepoprawny kod weryfikacyjny";
		}

		user.setEmailVerified(true);
		user.setVerificationCode(null);
		user.setVerificationCodeExpiresAt(null);
		userRepository.save(user);
		return null;
	}

	// Rozpoczyna proces weryfikacji nowego emaila: generuje kod, ustawia TTL i wysyła wiadomość.
	@Transactional
	public void requestEmailVerification(User user, String newEmail) {
		if (newEmail == null || newEmail.trim().isEmpty()) {
			return;
		}

		String normalizedEmail = newEmail.trim();
		boolean isSameEmail = user.getEmail() != null && user.getEmail().equalsIgnoreCase(normalizedEmail);
		if (!isSameEmail && userRepository.existsByEmail(normalizedEmail)) {
			throw new RuntimeException("Email juz istnieje");
		}

		// Ten sam mechanizm co przy rejestracji: nowy kod + TTL + oznaczenie emaila jako nieweryfikowanego.
		String verificationCode = generateToken(VERIFICATION_CODE_LENGTH);
		user.setEmail(normalizedEmail);
		user.setEmailVerified(false);
		user.setVerificationCode(verificationCode);
		user.setVerificationCodeExpiresAt(LocalDateTime.now().plusMinutes(VERIFICATION_CODE_TTL_MINUTES));
		userRepository.save(user);
		emailService.sendVerificationCode(normalizedEmail, verificationCode);
	}

	private String generateToken(int length) {
		StringBuilder builder = new StringBuilder(length);
		for (int i = 0; i < length; i++) {
			int index = secureRandom.nextInt(VERIFICATION_CODE_CHARACTERS.length());
			builder.append(VERIFICATION_CODE_CHARACTERS.charAt(index));
		}
		return builder.toString();
	}
}
