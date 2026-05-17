package com.eventflow.com.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SalaPlanJsonMigration {
	private final JdbcTemplate jdbcTemplate;
	private final ObjectMapper objectMapper;

	public SalaPlanJsonMigration(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
		this.jdbcTemplate = jdbcTemplate;
		this.objectMapper = objectMapper;
	}

	@PostConstruct
	public void migrateSalaPlanJson() {
		ensureSalaMiejscaTable();
		if (!columnExists("sale", "plan_json")) {
			return;
		}

		List<Long> salaIds = jdbcTemplate.queryForList(
			"""
				SELECT s.id
				FROM sale s
				WHERE s.plan_json IS NOT NULL
				  AND TRIM(s.plan_json) <> ''
				  AND NOT EXISTS (
				    SELECT 1
				    FROM sala_miejsca sm
				    WHERE sm.sala_id = s.id
				  )
				""",
			Long.class
		);

		for (Long salaId : salaIds) {
			String rawJson = jdbcTemplate.queryForObject(
				"SELECT plan_json FROM sale WHERE id = ?",
				String.class,
				salaId
			);
			migrateSalaSeats(salaId, rawJson);
		}
	}

	private void migrateSalaSeats(Long salaId, String rawJson) {
		if (rawJson == null || rawJson.isBlank()) {
			return;
		}
		try {
			JsonNode root = objectMapper.readTree(rawJson);
			JsonNode seats = root.path("seats");
			if (!seats.isArray()) {
				return;
			}

			for (JsonNode seat : seats) {
				String seatKey = readSeatKey(seat);
				if (seatKey == null || seatKey.isBlank()) {
					continue;
				}
				int x = seat.path("x").asInt(0);
				int y = seat.path("y").asInt(0);
				int rotation = seat.path("rotation").asInt(0);

				jdbcTemplate.update(
					"""
						INSERT INTO sala_miejsca (sala_id, seat_key, pos_x, pos_y, rotation_deg)
						SELECT ?, ?, ?, ?, ?
						WHERE NOT EXISTS (
						  SELECT 1 FROM sala_miejsca WHERE sala_id = ? AND seat_key = ?
						)
						""",
					salaId,
					seatKey,
					x,
					y,
					rotation,
					salaId,
					seatKey
				);
			}
		} catch (Exception ignored) {
		}
	}

	private String readSeatKey(JsonNode seat) {
		if (seat.hasNonNull("id")) {
			return seat.get("id").asText();
		}
		if (seat.hasNonNull("idKey")) {
			return seat.get("idKey").asText();
		}
		return null;
	}

	private void ensureSalaMiejscaTable() {
		jdbcTemplate.execute(
			"""
				CREATE TABLE IF NOT EXISTS sala_miejsca (
				  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
				  sala_id BIGINT NOT NULL,
				  seat_key VARCHAR(255) NOT NULL,
				  pos_x INT NOT NULL,
				  pos_y INT NOT NULL,
				  rotation_deg INT NOT NULL,
				  CONSTRAINT fk_sala_miejsca_sala FOREIGN KEY (sala_id) REFERENCES sale(id),
				  CONSTRAINT uq_sala_miejsca_sala_seat UNIQUE (sala_id, seat_key)
				)
				"""
		);
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
