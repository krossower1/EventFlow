package com.eventflow.com.config;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class MiejsceIloscSalRepair {
	private final JdbcTemplate jdbcTemplate;

	public MiejsceIloscSalRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void migratePojemnoscToIloscSal() {
		if (!columnExists("miejsca", "pojemnosc")) {
			return;
		}

		if (!columnExists("miejsca", "ilosc_sal")) {
			jdbcTemplate.execute("ALTER TABLE `miejsca` ADD COLUMN `ilosc_sal` INT NULL");
		}

		jdbcTemplate.execute("UPDATE `miejsca` SET `ilosc_sal` = `pojemnosc` WHERE `ilosc_sal` IS NULL");
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
