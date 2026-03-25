package com.eventflow.com.auth;

import com.eventflow.com.model.User;
import com.eventflow.com.repository.UserRepository;
import java.util.UUID;
import java.time.LocalDateTime;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AuthDataInitializer {

	@Bean
	CommandLineRunner seedDefaultUser(UserRepository repository, PasswordEncoder passwordEncoder) {
		return args -> repository.findByLogin("admin").ifPresentOrElse(
			user -> { },
			() -> {
				User user = new User();
				String encodedPassword = passwordEncoder.encode("admin123");
				user.setLogin("admin");
				user.setUsername("admin");
				user.setHaslo(encodedPassword);
				user.setPasswordHash(encodedPassword);
				user.setEmail("admin@example.com");
				user.setSalt(UUID.randomUUID().toString());
				user.setRola("ADMIN");
				user.setAktywnosc(true);
				user.setDataUtw(LocalDateTime.now());
				repository.save(user);
			}
		);
	}
}
