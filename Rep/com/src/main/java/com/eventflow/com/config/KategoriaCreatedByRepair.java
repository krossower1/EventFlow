package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class KategoriaCreatedByRepair {
	private final JdbcTemplate jdbcTemplate;

	public KategoriaCreatedByRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void ensureCreatedByUserIdColumn() {
		if (columnExists("kategorie", "created_by_user_id")) {
			return;
		}
		jdbcTemplate.execute("ALTER TABLE `kategorie` ADD COLUMN `created_by_user_id` BIGINT NULL");
	}

	private boolean columnExists(String tableName, String columnName) {
		Integer count = jdbcTemplate.queryForObject(
			"""
				SELECT COUNT(*)
				FROM information_schema.COLUMNS
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = ?
				  AND COLUMN_NAME = ?
				""",
			Integer.class,
			tableName,
			columnName
		);
		return count != null && count > 0;
	}
}
