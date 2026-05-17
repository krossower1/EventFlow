package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class ChatSchemaRepair {
	private final JdbcTemplate jdbcTemplate;

	public ChatSchemaRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void ensureChatTables() {
		jdbcTemplate.execute("""
			CREATE TABLE IF NOT EXISTS user_favorites (
			  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			  user_id BIGINT NOT NULL,
			  favorite_user_id BIGINT NOT NULL,
			  created_at TIMESTAMP NOT NULL,
			  CONSTRAINT fk_user_favorites_user FOREIGN KEY (user_id) REFERENCES users(id),
			  CONSTRAINT fk_user_favorites_target FOREIGN KEY (favorite_user_id) REFERENCES users(id),
			  CONSTRAINT uq_user_favorites_pair UNIQUE (user_id, favorite_user_id)
			)
			""");

		jdbcTemplate.execute("""
			CREATE TABLE IF NOT EXISTS chat_messages (
			  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
			  sender_id BIGINT NOT NULL,
			  receiver_id BIGINT NOT NULL,
			  content TEXT NOT NULL,
			  sent_at TIMESTAMP NOT NULL,
			  CONSTRAINT fk_chat_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id),
			  CONSTRAINT fk_chat_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id)
			)
			""");
	}
}
