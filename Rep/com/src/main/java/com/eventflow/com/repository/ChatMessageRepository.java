package com.eventflow.com.repository;

import com.eventflow.com.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
	@Query("""
		SELECT m
		FROM ChatMessage m
		WHERE (m.senderId = :userId AND m.receiverId = :otherUserId)
		   OR (m.senderId = :otherUserId AND m.receiverId = :userId)
		ORDER BY m.sentAt ASC, m.id ASC
		""")
	List<ChatMessage> findConversation(Long userId, Long otherUserId);

	@Modifying
	@Query("""
		DELETE FROM ChatMessage m
		WHERE m.senderId = :userId OR m.receiverId = :userId
		""")
	void deleteByUserId(@Param("userId") Long userId);
}
