package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.ChatMessageDto;
import com.eventflow.com.controller.dto.FavoriteUserDto;
import com.eventflow.com.controller.dto.SendChatMessageRequest;
import com.eventflow.com.model.ChatMessage;
import com.eventflow.com.model.User;
import com.eventflow.com.model.UserFavorite;
import com.eventflow.com.repository.ChatMessageRepository;
import com.eventflow.com.repository.UserFavoriteRepository;
import com.eventflow.com.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CREATED;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "http://localhost:3000")
public class ChatController {
	private final UserRepository userRepository;
	private final UserFavoriteRepository userFavoriteRepository;
	private final ChatMessageRepository chatMessageRepository;

	public ChatController(
		UserRepository userRepository,
		UserFavoriteRepository userFavoriteRepository,
		ChatMessageRepository chatMessageRepository
	) {
		this.userRepository = userRepository;
		this.userFavoriteRepository = userFavoriteRepository;
		this.chatMessageRepository = chatMessageRepository;
	}

	@GetMapping("/favorites")
	public List<FavoriteUserDto> getFavorites(Authentication authentication) {
		User currentUser = requireCurrentUser(authentication);
		List<UserFavorite> favorites = userFavoriteRepository.findByUserIdOrderByCreatedAtAsc(currentUser.getId());
		Map<Long, User> usersById = userRepository.findAllById(
			favorites.stream().map(UserFavorite::getFavoriteUserId).distinct().toList()
		).stream().collect(Collectors.toMap(User::getId, Function.identity()));

		return favorites.stream()
			.map(item -> usersById.get(item.getFavoriteUserId()))
			.filter(user -> user != null && !user.getId().equals(currentUser.getId()))
			.map(this::toFavoriteUserDto)
			.toList();
	}

	@PostMapping("/favorites/{favoriteUserId}")
	@Transactional
	public ResponseEntity<String> addFavorite(
		@PathVariable Long favoriteUserId,
		Authentication authentication
	) {
		User currentUser = requireCurrentUser(authentication);
		if (currentUser.getId().equals(favoriteUserId)) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie mozesz dodac siebie do ulubionych.");
		}
		User favoriteUser = userRepository.findById(favoriteUserId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono uzytkownika."));
		if (Boolean.FALSE.equals(favoriteUser.getAktywnosc())) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie mozna dodac nieaktywnego uzytkownika.");
		}
		if (userFavoriteRepository.findByUserIdAndFavoriteUserId(currentUser.getId(), favoriteUserId).isPresent()) {
			return ResponseEntity.ok("Uzytkownik jest juz w ulubionych.");
		}

		UserFavorite favorite = new UserFavorite();
		favorite.setUserId(currentUser.getId());
		favorite.setFavoriteUserId(favoriteUserId);
		favorite.setCreatedAt(LocalDateTime.now());
		userFavoriteRepository.save(favorite);
		return ResponseEntity.status(CREATED).body("Dodano do ulubionych.");
	}

	@DeleteMapping("/favorites/{favoriteUserId}")
	@Transactional
	public ResponseEntity<String> removeFavorite(
		@PathVariable Long favoriteUserId,
		Authentication authentication
	) {
		User currentUser = requireCurrentUser(authentication);
		UserFavorite favorite = userFavoriteRepository.findByUserIdAndFavoriteUserId(currentUser.getId(), favoriteUserId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Ten uzytkownik nie jest w ulubionych."));
		userFavoriteRepository.delete(favorite);
		return ResponseEntity.ok("Usunieto z ulubionych.");
	}

	@GetMapping("/conversations/{otherUserId}")
	public List<ChatMessageDto> getConversation(
		@PathVariable Long otherUserId,
		Authentication authentication
	) {
		User currentUser = requireCurrentUser(authentication);
		ensureFavoriteAccess(currentUser.getId(), otherUserId);
		return chatMessageRepository.findConversation(currentUser.getId(), otherUserId).stream()
			.map(this::toChatMessageDto)
			.toList();
	}

	@PostMapping("/conversations/{otherUserId}")
	@Transactional
	public ResponseEntity<ChatMessageDto> sendMessage(
		@PathVariable Long otherUserId,
		@RequestBody SendChatMessageRequest request,
		Authentication authentication
	) {
		User currentUser = requireCurrentUser(authentication);
		ensureFavoriteAccess(currentUser.getId(), otherUserId);
		if (request == null || request.content() == null || request.content().trim().isEmpty()) {
			throw new ResponseStatusException(BAD_REQUEST, "Wiadomosc nie moze byc pusta.");
		}

		ChatMessage message = new ChatMessage();
		message.setSenderId(currentUser.getId());
		message.setReceiverId(otherUserId);
		message.setContent(request.content().trim());
		message.setSentAt(LocalDateTime.now());
		ChatMessage saved = chatMessageRepository.save(message);
		ensureFavoriteExists(otherUserId, currentUser.getId());
		return ResponseEntity.status(CREATED).body(toChatMessageDto(saved));
	}

	private void ensureFavoriteAccess(Long userId, Long otherUserId) {
		if (userId.equals(otherUserId)) {
			throw new ResponseStatusException(BAD_REQUEST, "Nie mozna otworzyc rozmowy z samym soba.");
		}
		userRepository.findById(otherUserId)
			.orElseThrow(() -> new ResponseStatusException(BAD_REQUEST, "Nie znaleziono uzytkownika."));
		boolean inFavorites = userFavoriteRepository.findByUserIdAndFavoriteUserId(userId, otherUserId).isPresent();
		if (!inFavorites) {
			throw new ResponseStatusException(BAD_REQUEST, "Dodaj uzytkownika do ulubionych, aby rozpoczac rozmowe.");
		}
	}

	private void ensureFavoriteExists(Long userId, Long favoriteUserId) {
		if (userFavoriteRepository.findByUserIdAndFavoriteUserId(userId, favoriteUserId).isPresent()) {
			return;
		}
		UserFavorite favorite = new UserFavorite();
		favorite.setUserId(userId);
		favorite.setFavoriteUserId(favoriteUserId);
		favorite.setCreatedAt(LocalDateTime.now());
		userFavoriteRepository.save(favorite);
	}

	private FavoriteUserDto toFavoriteUserDto(User user) {
		return new FavoriteUserDto(
			user.getId(),
			user.getLogin(),
			user.getImie(),
			user.getNazwisko(),
			user.getEmail(),
			user.getRola()
		);
	}

	private ChatMessageDto toChatMessageDto(ChatMessage message) {
		return new ChatMessageDto(
			message.getId(),
			message.getSenderId(),
			message.getReceiverId(),
			message.getContent(),
			message.getSentAt()
		);
	}

	private User requireCurrentUser(Authentication authentication) {
		if (authentication == null) {
			throw new ResponseStatusException(UNAUTHORIZED, "Brak uwierzytelnienia.");
		}
		return userRepository.findByLogin(authentication.getName())
			.orElseThrow(() -> new ResponseStatusException(UNAUTHORIZED, "Nie znaleziono aktualnego uzytkownika."));
	}
}
