-- =============================================================================
-- EventFlow – obiekty bazodanowe dla sekcji „Dzisiejsze zmiany” (patch_notes)
-- Zawiera: tabelę historii, funkcję, triggery, procedurę i przykład transakcji
-- Baza: MySQL 8.x (event_flow)
-- =============================================================================

USE event_flow;

-- -----------------------------------------------------------------------------
-- 1. TABELA HISTORII – osobna tabela na wystąpienia zapisanych zmian
--    Każdy INSERT/UPDATE w patch_notes trafia tu przez trigger (AFTER).
-- -----------------------------------------------------------------------------
DROP TABLE IF EXISTS patch_notes_historia;

CREATE TABLE patch_notes_historia (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  patch_notes_id    BIGINT          NOT NULL,
  akcja             ENUM('INSERT', 'UPDATE') NOT NULL,
  stara_etykieta    VARCHAR(255)    NULL,
  nowa_etykieta     VARCHAR(255)    NULL,
  stary_tekst       TEXT            NULL,
  nowy_tekst        TEXT            NULL,
  zapisano_o        TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_patch_notes_id (patch_notes_id),
  KEY idx_zapisano_o (zapisano_o)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- -----------------------------------------------------------------------------
-- 2. FUNKCJA – automatyczne uzupełnianie dzisiejszej daty w polu etykiety
--    Wywoływana przy zapisie (trigger BEFORE lub procedura).
--
--    Przykłady wejścia → wynik:
--      '' / NULL              → 'Zmiany dnia 11.06.2026'
--      'dzis', 'dziś', 'today' → jak wyżej
--      'CURDATE'              → jak wyżej
--      'Zmiany dnia'          → jak wyżej (sam nagłówek bez daty)
--      'Zmiany dnia CURDATE'  → 'Zmiany dnia 11.06.2026'
--      'Zmiany dnia 29.05.2026' → bez zmian (pełna data już podana)
-- -----------------------------------------------------------------------------
DROP FUNCTION IF EXISTS fn_patch_notes_etykieta_daty;

DELIMITER $$

CREATE FUNCTION fn_patch_notes_etykieta_daty(p_wejscie VARCHAR(255))
RETURNS VARCHAR(255)
DETERMINISTIC
NO SQL
BEGIN
  DECLARE v_oczyszczone VARCHAR(255);
  DECLARE v_dzis        VARCHAR(255);
  DECLARE v_data        VARCHAR(10);

  SET v_data = DATE_FORMAT(CURDATE(), '%d.%m.%Y');
  SET v_dzis = CONCAT('Zmiany dnia ', v_data);

  IF p_wejscie IS NULL OR TRIM(p_wejscie) = '' THEN
    RETURN v_dzis;
  END IF;

  SET v_oczyszczone = TRIM(p_wejscie);

  IF UPPER(v_oczyszczone) = 'CURDATE' THEN
    RETURN v_dzis;
  END IF;

  IF LOWER(v_oczyszczone) IN ('dzis', 'dziś', 'dzisiaj', 'today', 'teraz') THEN
    RETURN v_dzis;
  END IF;

  IF v_oczyszczone = 'Zmiany dnia'
     OR v_oczyszczone REGEXP '^Zmiany dnia[[:space:]]*$' THEN
    RETURN v_dzis;
  END IF;

  IF v_oczyszczone LIKE '%CURDATE%' THEN
    RETURN REPLACE(v_oczyszczone, 'CURDATE', v_data);
  END IF;

  RETURN v_oczyszczone;
END$$

DELIMITER ;


-- -----------------------------------------------------------------------------
-- 3. TRIGGER BEFORE – normalizacja etykiety daty przed zapisem
--    Działa automatycznie przy PUT z aplikacji (JPA → UPDATE patch_notes).
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_patch_notes_przed_update;
DROP TRIGGER IF EXISTS tr_patch_notes_przed_insert;

DELIMITER $$

CREATE TRIGGER tr_patch_notes_przed_update
BEFORE UPDATE ON patch_notes
FOR EACH ROW
BEGIN
  SET NEW.date_label = fn_patch_notes_etykieta_daty(NEW.date_label);
END$$

CREATE TRIGGER tr_patch_notes_przed_insert
BEFORE INSERT ON patch_notes
FOR EACH ROW
BEGIN
  SET NEW.date_label = fn_patch_notes_etykieta_daty(NEW.date_label);
END$$

DELIMITER ;


-- -----------------------------------------------------------------------------
-- 4. TRIGGER AFTER – zapis wystąpień zmian do patch_notes_historia
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS tr_patch_notes_po_update;
DROP TRIGGER IF EXISTS tr_patch_notes_po_insert;

DELIMITER $$

CREATE TRIGGER tr_patch_notes_po_update
AFTER UPDATE ON patch_notes
FOR EACH ROW
BEGIN
  IF NOT (OLD.date_label <=> NEW.date_label)
     OR NOT (OLD.items_text <=> NEW.items_text) THEN
    INSERT INTO patch_notes_historia (
      patch_notes_id,
      akcja,
      stara_etykieta,
      nowa_etykieta,
      stary_tekst,
      nowy_tekst
    ) VALUES (
      NEW.id,
      'UPDATE',
      OLD.date_label,
      NEW.date_label,
      OLD.items_text,
      NEW.items_text
    );
  END IF;
END$$

CREATE TRIGGER tr_patch_notes_po_insert
AFTER INSERT ON patch_notes
FOR EACH ROW
BEGIN
  INSERT INTO patch_notes_historia (
    patch_notes_id,
    akcja,
    stara_etykieta,
    nowa_etykieta,
    stary_tekst,
    nowy_tekst
  ) VALUES (
    NEW.id,
    'INSERT',
    NULL,
    NEW.date_label,
    NULL,
    NEW.items_text
  );
END$$

DELIMITER ;


-- -----------------------------------------------------------------------------
-- 5. PROCEDURA – atomowy zapis zmian z walidacją
--    Pomysł: jedna operacja biznesowa = jedna procedura z transakcją wewnątrz.
--    Trigger BEFORE uzupełni datę, trigger AFTER zapisze historię.
-- -----------------------------------------------------------------------------
DROP PROCEDURE IF EXISTS sp_zapisz_patch_notes;

DELIMITER $$

CREATE PROCEDURE sp_zapisz_patch_notes(
  IN p_id          BIGINT,
  IN p_date_label  VARCHAR(255),
  IN p_items_text  TEXT,
  OUT p_sukces     TINYINT,
  OUT p_komunikat  VARCHAR(255)
)
BEGIN
  DECLARE v_exit_handler TINYINT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    SET p_sukces = 0;
    SET p_komunikat = 'Błąd zapisu – transakcja wycofana (ROLLBACK).';
  END;

  SET p_sukces = 0;
  SET p_komunikat = '';

  IF p_items_text IS NULL OR TRIM(p_items_text) = '' THEN
    SET p_komunikat = 'Brak pozycji zmian – zapis anulowany.';
  ELSE
    START TRANSACTION;

    UPDATE patch_notes
    SET
      date_label = p_date_label,
      items_text = p_items_text
    WHERE id = p_id;

    IF ROW_COUNT() = 0 THEN
      INSERT INTO patch_notes (id, date_label, items_text)
      VALUES (p_id, p_date_label, p_items_text);
    END IF;

    COMMIT;
    SET p_sukces = 1;
    SET p_komunikat = CONCAT(
      'Zapisano zmiany. Etykieta: ',
      fn_patch_notes_etykieta_daty(p_date_label)
    );
  END IF;
END$$

DELIMITER ;


-- -----------------------------------------------------------------------------
-- 6. PRZYKŁAD TRANSAKCJI – masowy zapis + podgląd historii w jednym bloku
--    Pomysł: kilka kroków (aktualizacja + odczyt historii) muszą być spójne;
--    przy błędzie całość się cofa.
-- -----------------------------------------------------------------------------
-- Uruchom poniższy blok ręcznie po wdrożeniu obiektów:

/*
START TRANSACTION;

CALL sp_zapisz_patch_notes(
  1,
  'dzis',
  'Pierwsza zmiana w tej transakcji.\nDruga zmiana w tej transakcji.',
  @sukces,
  @komunikat
);

SELECT @sukces AS sukces, @komunikat AS komunikat;

SELECT
  id,
  akcja,
  stara_etykieta,
  nowa_etykieta,
  zapisano_o
FROM patch_notes_historia
ORDER BY id DESC
LIMIT 5;

COMMIT;
*/


-- -----------------------------------------------------------------------------
-- 7. SZYBKI TEST FUNKCJI (opcjonalnie)
-- -----------------------------------------------------------------------------
-- SELECT fn_patch_notes_etykieta_daty('') AS puste;
-- SELECT fn_patch_notes_etykieta_daty('dzis') AS skrot;
-- SELECT fn_patch_notes_etykieta_daty('CURDATE') AS curdate;
-- SELECT fn_patch_notes_etykieta_daty('Zmiany dnia') AS sam_naglowek;
-- SELECT fn_patch_notes_etykieta_daty('Zmiany dnia 29.05.2026') AS pelna_data;
