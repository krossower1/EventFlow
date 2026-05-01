package com.eventflow.com.config;

import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class WydarzenieSalaRepair {
	private final JdbcTemplate jdbcTemplate;

	public WydarzenieSalaRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void migrateWydarzeniaToSala() {
		String salaIdColumnType = resolveSalaIdColumnType();
		ensureSalaIdColumn(salaIdColumnType);
		migrateValuesFromMiejsceToSala();
		normalizeSalaIdColumnType(salaIdColumnType);
		repairForeignKeys();
		enforceNotNullSalaId(salaIdColumnType);
		dropMiejsceIdColumnIfPresent();
	}

	private void ensureSalaIdColumn(String salaIdColumnType) {
		if (!columnExists("wydarzenia", "sala_id")) {
			jdbcTemplate.execute("ALTER TABLE `wydarzenia` ADD COLUMN `sala_id` " + salaIdColumnType + " NULL");
		}
	}

	private void normalizeSalaIdColumnType(String salaIdColumnType) {
		jdbcTemplate.execute("ALTER TABLE `wydarzenia` MODIFY COLUMN `sala_id` " + salaIdColumnType + " NULL");
	}

	private void migrateValuesFromMiejsceToSala() {
		if (!columnExists("wydarzenia", "miejsce_id")) {
			return;
		}

		List<Long> eventIds = jdbcTemplate.queryForList(
			"SELECT `id` FROM `wydarzenia` WHERE `sala_id` IS NULL",
			Long.class
		);
		for (Long eventId : eventIds) {
			Long miejsceId = jdbcTemplate.queryForObject(
				"SELECT `miejsce_id` FROM `wydarzenia` WHERE `id` = ?",
				Long.class,
				eventId
			);
			if (miejsceId == null) {
				continue;
			}
			Long salaId = firstSalaForMiejsce(miejsceId);
			if (salaId == null) {
				jdbcTemplate.update(
					"INSERT INTO `sale` (`miejsce_id`, `nazwa`, `pojemnosc`, `pietro`, `ma_plan`) VALUES (?, ?, ?, ?, ?)",
					miejsceId,
					"Sala glowna",
					0,
					0,
					false
				);
				salaId = firstSalaForMiejsce(miejsceId);
			}
			if (salaId != null) {
				jdbcTemplate.update("UPDATE `wydarzenia` SET `sala_id` = ? WHERE `id` = ?", salaId, eventId);
			}
		}
	}

	private Long firstSalaForMiejsce(Long miejsceId) {
		List<Long> salaIds = jdbcTemplate.queryForList(
			"SELECT `id` FROM `sale` WHERE `miejsce_id` = ? ORDER BY `id` ASC LIMIT 1",
			Long.class,
			miejsceId
		);
		return salaIds.isEmpty() ? null : salaIds.get(0);
	}

	private void repairForeignKeys() {
		List<String> fkNames = jdbcTemplate.queryForList(
			"""
				SELECT CONSTRAINT_NAME
				FROM information_schema.KEY_COLUMN_USAGE
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'wydarzenia'
				  AND COLUMN_NAME IN ('miejsce_id', 'sala_id')
				  AND REFERENCED_TABLE_NAME IS NOT NULL
				""",
			String.class
		);
		for (String fkName : fkNames) {
			jdbcTemplate.execute("ALTER TABLE `wydarzenia` DROP FOREIGN KEY `" + fkName + "`");
		}

		if (!hasForeignKeyToSale()) {
			jdbcTemplate.execute(
				"ALTER TABLE `wydarzenia` ADD CONSTRAINT `fk_wydarzenia_sala` FOREIGN KEY (`sala_id`) REFERENCES `sale` (`id`)"
			);
		}
	}

	private boolean hasForeignKeyToSale() {
		Integer count = jdbcTemplate.queryForObject(
			"""
				SELECT COUNT(*)
				FROM information_schema.KEY_COLUMN_USAGE
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'wydarzenia'
				  AND COLUMN_NAME = 'sala_id'
				  AND REFERENCED_TABLE_NAME = 'sale'
				""",
			Integer.class
		);
		return count != null && count > 0;
	}

	private void enforceNotNullSalaId(String salaIdColumnType) {
		jdbcTemplate.execute("ALTER TABLE `wydarzenia` MODIFY COLUMN `sala_id` " + salaIdColumnType + " NOT NULL");
	}

	private void dropMiejsceIdColumnIfPresent() {
		if (columnExists("wydarzenia", "miejsce_id")) {
			jdbcTemplate.execute("ALTER TABLE `wydarzenia` DROP COLUMN `miejsce_id`");
		}
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

	private String resolveSalaIdColumnType() {
		String columnType = jdbcTemplate.queryForObject(
			"""
				SELECT COLUMN_TYPE
				FROM information_schema.COLUMNS
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'sale'
				  AND COLUMN_NAME = 'id'
				LIMIT 1
				""",
			String.class
		);
		if (columnType == null || columnType.isBlank()) {
			return "BIGINT";
		}
		return columnType.toUpperCase();
	}
}
