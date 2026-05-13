package com.eventflow.com.repository;

import com.eventflow.com.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByLogin(String login);
    Optional<User> findByEmail(String email);
    Optional<User> findByTelefon(String telefon);
    boolean existsByLogin(String login);
    boolean existsByEmail(String email);
    boolean existsByTelefon(String telefon);

	/**
	 * Zlicza nowe konta użytkowników pogrupowane po <b>dniu kalendarzowym</b> kolumny {@code data_utw}
	 * w tabeli {@code users}. Wynik jest źródłem danych pod wykres słupkowy rejestracji na stronie Analityka.
	 * <p>
	 * Zapytanie natywne dla MySQL: funkcja {@code DATE(data_utw)} skleja wszystkie rejestracje w obrębie
	 * doby do jednej grupy. Przedział czasu jest półotwarty {@code [fromInclusive, toExclusive)} — typowy
	 * wzorzec „od północy pierwszego dnia do północy dnia następnego po ostatnim”, żeby nie liczyć
	 * podwójnie granicy i żeby łatwo pokryć dokładnie siedem kolejnych dni kalendarzowych.
	 *
	 * @param fromInclusive początek przedziału (zwykle północ pierwszego dnia okna w strefie serwera)
	 * @param toExclusive koniec przedziału wyłączny (zwykle północ <i>po</i> ostatnim dniu okna)
	 * @return wiersze {@code [dzień jako DATE, liczba]}; dni bez rejestracji nie występują — uzupełnienie zerami robi serwis
	 */
	@Query(value = """
		SELECT DATE(u.data_utw) AS day, COUNT(u.id)
		FROM users u
		WHERE u.data_utw IS NOT NULL
		  AND u.data_utw >= :fromInclusive
		  AND u.data_utw < :toExclusive
		GROUP BY DATE(u.data_utw)
		""", nativeQuery = true)
	List<Object[]> countRegistrationsGroupedByDay(
		@Param("fromInclusive") LocalDateTime fromInclusive,
		@Param("toExclusive") LocalDateTime toExclusive
	);
}
