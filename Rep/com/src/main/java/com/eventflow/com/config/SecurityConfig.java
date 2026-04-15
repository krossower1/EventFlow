package com.eventflow.com.config;

import com.eventflow.com.repository.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.csrf(csrf -> csrf.disable())
			.cors(Customizer.withDefaults())
			.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers("/api/auth/login").permitAll() // Logowanie jest jawne
						.requestMatchers("/api/auth/register").permitAll()
						.requestMatchers("/api/auth/verify-email").permitAll()
						.requestMatchers("/api/auth/logout").permitAll()
						.requestMatchers("/api/users/**").authenticated()
						.anyRequest().authenticated()                  // Reszta nadal zablokowana
				)
			.logout(logout -> logout
				.logoutUrl("/api/auth/logout")
				.invalidateHttpSession(true)
				.clearAuthentication(true)
				.deleteCookies("JSESSIONID")
				.logoutSuccessHandler((request, response, authentication) -> response.setStatus(200))
			)
			.httpBasic(Customizer.withDefaults());

		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(List.of("http://localhost:3000"));
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of("*"));
		configuration.setAllowCredentials(true);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
		return configuration.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public UserDetailsService userDetailsService(UserRepository userRepository) {
		return username -> userRepository.findByLogin(username)
			.filter(user -> !Boolean.FALSE.equals(user.getAktywnosc()))
			.map(user -> org.springframework.security.core.userdetails.User.withUsername(user.getLogin())
				.password(user.getHaslo())
				.roles(resolveRole(user.getRola()))
				.build())
			.orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException(username));
	}

	private String resolveRole(String role) {
		if (role == null || role.isBlank()) {
			return "USER";
		}
		return role.startsWith("ROLE_") ? role.substring(5) : role;
	}
}
