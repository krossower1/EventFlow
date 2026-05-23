package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SalaLayoutSchemaRepair {
	private final JdbcTemplate jdbcTemplate;

	public SalaLayoutSchemaRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void ensureSalaLayoutColumns() {
		ensureColumn("sale", "layout_width", "INT NULL");
		ensureColumn("sale", "layout_height", "INT NULL");
		ensureColumn("sala_miejsca", "item_type", "VARCHAR(20) NULL");
		ensureColumn("sala_miejsca", "base_label", "VARCHAR(50) NULL");
		ensureColumn("sala_miejsca", "row_label", "VARCHAR(10) NULL");
		ensureColumn("sala_miejsca", "item_width", "INT NULL");
		ensureColumn("sala_miejsca", "item_height", "INT NULL");

		jdbcTemplate.update("UPDATE sale SET layout_width = COALESCE(layout_width, 720), layout_height = COALESCE(layout_height, 420)");
		jdbcTemplate.update("UPDATE sala_miejsca SET item_type = COALESCE(item_type, 'SEAT')");
		jdbcTemplate.update("UPDATE sala_miejsca SET base_label = COALESCE(base_label, seat_key) WHERE item_type = 'SEAT'");
	}

	private void ensureColumn(String tableName, String columnName, String definition) {
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
		if (count != null && count == 0) {
			jdbcTemplate.execute("ALTER TABLE `" + tableName + "` ADD COLUMN `" + columnName + "` " + definition);
		}
	}
}
