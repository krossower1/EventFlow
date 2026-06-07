package com.eventflow.com.repository;

import com.eventflow.com.model.Zamowienie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ZamowienieRepository extends JpaRepository<Zamowienie, Long> {
	@Query(value = """
		SELECT z.*
		FROM zamowienia z
		WHERE z.user_id = :userId
		""", nativeQuery = true)
	List<Zamowienie> findByUserId(@Param("userId") Long userId);

	@Query(value = """
		SELECT z.*
		FROM zamowienia z
		WHERE z.poz_zam_id IN (:pozZamIds)
		""", nativeQuery = true)
	List<Zamowienie> findByPozZamIdIn(@Param("pozZamIds") List<Long> pozZamIds);

	Zamowienie findFirstByPlatnId(Long platnId);
}
