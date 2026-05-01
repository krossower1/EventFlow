package com.eventflow.com.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.List;

@Component
public class ZamowieniaForeignKeyRepair {
	private static final Logger log = LoggerFactory.getLogger(ZamowieniaForeignKeyRepair.class);
	private final JdbcTemplate jdbcTemplate;

	public ZamowieniaForeignKeyRepair(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@PostConstruct
	public void repairPozZamForeignKey() {
		String sql = """
			SELECT CONSTRAINT_NAME, REFERENCED_TABLE_NAME
			FROM information_schema.KEY_COLUMN_USAGE
			WHERE TABLE_SCHEMA = DATABASE()
			  AND TABLE_NAME = 'zamowienia'
			  AND COLUMN_NAME = 'poz_zam_id'
			  AND REFERENCED_TABLE_NAME IS NOT NULL
			""";

		List<ForeignKeyInfo> constraints = jdbcTemplate.query(
			sql,
			(rs, rowNum) -> new ForeignKeyInfo(rs.getString("CONSTRAINT_NAME"), rs.getString("REFERENCED_TABLE_NAME"))
		);

		for (ForeignKeyInfo constraint : constraints) {
			if ("poz_zam".equalsIgnoreCase(constraint.referencedTableName())) {
				continue;
			}
			String dropSql = "ALTER TABLE `zamowienia` DROP FOREIGN KEY `" + constraint.name() + "`";
			jdbcTemplate.execute(dropSql);

			String addSql = "ALTER TABLE `zamowienia` ADD CONSTRAINT `" + constraint.name()
				+ "` FOREIGN KEY (`poz_zam_id`) REFERENCES `poz_zam` (`id`)";
			jdbcTemplate.execute(addSql);

			log.info(
				"Naprawiono constraint {}: zmieniono referencje z {} na poz_zam.",
				constraint.name(),
				constraint.referencedTableName()
			);
		}
	}

	private record ForeignKeyInfo(String name, String referencedTableName) {
	}
}
