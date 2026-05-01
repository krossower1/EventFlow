package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class KategoriaSystemowaRepair {
	private final JdbcTemplate jdbcTemplate;

	public KategoriaSystemowaRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void ensureSystemowaColumn() {
		if (!columnExists("kategorie", "systemowa")) {
			jdbcTemplate.execute("ALTER TABLE `kategorie` ADD COLUMN `systemowa` TINYINT(1) NULL");
		}
		jdbcTemplate.execute("UPDATE `kategorie` SET `systemowa` = 1 WHERE `systemowa` IS NULL AND `created_by_user_id` IS NULL");
		jdbcTemplate.execute("UPDATE `kategorie` SET `systemowa` = 0 WHERE `systemowa` IS NULL");
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
