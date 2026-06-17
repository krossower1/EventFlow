package com.eventflow.com.repository;

import com.eventflow.com.model.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {
	List<UserFavorite> findByUserIdOrderByCreatedAtAsc(Long userId);
	Optional<UserFavorite> findByUserIdAndFavoriteUserId(Long userId, Long favoriteUserId);

	List<UserFavorite> findByFavoriteUserId(Long favoriteUserId);

	@Modifying
	@Query("""
		DELETE FROM UserFavorite f
		WHERE f.userId = :userId OR f.favoriteUserId = :userId
		""")
	void deleteByUserIdOrFavoriteUserId(@Param("userId") Long userId);
}
