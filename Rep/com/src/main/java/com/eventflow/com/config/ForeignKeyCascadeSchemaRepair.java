package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Ustawia klucze obce z {@code ON DELETE CASCADE} w MySQL dla głównych relacji rodzic–dziecko.
 * Działa uzupełniająco do kaskady aplikacyjnej ({@link com.eventflow.com.service.UserCascadeDeleteService}).
 */
@Component
public class ForeignKeyCascadeSchemaRepair {
	private static final Logger log = LoggerFactory.getLogger(ForeignKeyCascadeSchemaRepair.class);

	private record ForeignKeySpec(String table, String column, String refTable, String refColumn, String onDelete) {}

	private static final List<ForeignKeySpec> CASCADE_SPECS = List.of(
		new ForeignKeySpec("sala_miejsca", "sala_id", "sale", "id", "CASCADE"),
		new ForeignKeySpec("sale", "miejsce_id", "miejsca", "id", "CASCADE"),
		new ForeignKeySpec("bilety", "wydarzenie_id", "wydarzenia", "id", "CASCADE"),
		new ForeignKeySpec("poz_zam", "bilet_id", "bilety", "id", "CASCADE"),
		new ForeignKeySpec("personel", "wyd_id", "wydarzenia", "id", "CASCADE"),
		new ForeignKeySpec("opinie", "wyd_id", "wydarzenia", "id", "CASCADE"),
		new ForeignKeySpec("zgloszenia", "wyd_id", "wydarzenia", "id", "CASCADE"),
		new ForeignKeySpec("user_observed_events", "wydarzenie_id", "wydarzenia", "id", "CASCADE"),
		new ForeignKeySpec("user_observed_events", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("user_favorites", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("user_favorites", "favorite_user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("chat_messages", "sender_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("chat_messages", "receiver_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("login_logs", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("user_notifications", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("miejsca", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("organizator", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("personel", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("opinie", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("zgloszenia", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("wyst_bilety", "bilet_id", "bilety", "id", "CASCADE"),
		new ForeignKeySpec("wyst_bilety", "zam_id", "zamowienia", "id", "CASCADE"),
		new ForeignKeySpec("zamowienia", "user_id", "users", "id", "CASCADE"),
		new ForeignKeySpec("zwroty", "platn_id", "platnosci", "id", "CASCADE"),
		new ForeignKeySpec("security_ticket_audits", "ticket_id", "security_tickets", "id", "CASCADE"),
		new ForeignKeySpec("security_tickets", "affected_user_id", "users", "id", "CASCADE")
	);

	private final JdbcTemplate jdbcTemplate;

	public ForeignKeyCascadeSchemaRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void ensureCascadeForeignKeys() {
		for (ForeignKeySpec spec : CASCADE_SPECS) {
			try {
				ensureForeignKey(spec);
			} catch (Exception exception) {
				log.warn(
					"Nie udalo sie ustawic kaskady FK {}.{} -> {}.{} ({}): {}",
					spec.table(),
					spec.column(),
					spec.refTable(),
					spec.refColumn(),
					spec.onDelete(),
					exception.getMessage()
				);
			}
		}
	}

	private void ensureForeignKey(ForeignKeySpec spec) {
		if (!tableExists(spec.table()) || !tableExists(spec.refTable())) {
			return;
		}

		String existingConstraint = findForeignKeyConstraint(spec.table(), spec.column());
		if (existingConstraint != null) {
			String deleteRule = findDeleteRule(spec.table(), existingConstraint);
			if (spec.onDelete().equalsIgnoreCase(deleteRule)) {
				return;
			}
			jdbcTemplate.execute(
				"ALTER TABLE `" + spec.table() + "` DROP FOREIGN KEY `" + existingConstraint + "`"
			);
		}

		String constraintName = buildConstraintName(spec);
		jdbcTemplate.execute(
			"ALTER TABLE `" + spec.table() + "` ADD CONSTRAINT `" + constraintName + "` "
				+ "FOREIGN KEY (`" + spec.column() + "`) REFERENCES `" + spec.refTable() + "` (`"
				+ spec.refColumn() + "`) ON DELETE " + spec.onDelete()
		);
	}

	private boolean tableExists(String tableName) {
		Integer count = jdbcTemplate.queryForObject(
			"""
				SELECT COUNT(*)
				FROM information_schema.TABLES
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = ?
				""",
			Integer.class,
			tableName
		);
		return count != null && count > 0;
	}

	private String findForeignKeyConstraint(String tableName, String columnName) {
		List<String> names = jdbcTemplate.query(
			"""
				SELECT CONSTRAINT_NAME
				FROM information_schema.KEY_COLUMN_USAGE
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = ?
				  AND COLUMN_NAME = ?
				  AND REFERENCED_TABLE_NAME IS NOT NULL
				""",
			(resultSet, rowNum) -> resultSet.getString("CONSTRAINT_NAME"),
			tableName,
			columnName
		);
		return names.isEmpty() ? null : names.get(0);
	}

	private String findDeleteRule(String tableName, String constraintName) {
		return jdbcTemplate.queryForObject(
			"""
				SELECT DELETE_RULE
				FROM information_schema.REFERENTIAL_CONSTRAINTS
				WHERE CONSTRAINT_SCHEMA = DATABASE()
				  AND TABLE_NAME = ?
				  AND CONSTRAINT_NAME = ?
				""",
			String.class,
			tableName,
			constraintName
		);
	}

	private String buildConstraintName(ForeignKeySpec spec) {
		String raw = "fk_" + spec.table() + "_" + spec.column() + "_" + spec.refTable();
		return raw.length() <= 64 ? raw : raw.substring(0, 64);
	}
}
