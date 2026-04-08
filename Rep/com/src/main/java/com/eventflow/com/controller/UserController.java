package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.UserResponse;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Ważne dla Twojego Reacta!
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserResponse> getAllUsers(Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        return userRepository.findAll().stream()
            .map(user -> mapUser(user, isAdmin))
            .toList();
    }

    private UserResponse mapUser(User user, boolean isAdmin) {
        return new UserResponse(
            user.getId(),
            user.getImie(),
            user.getNazwisko(),
            user.getEmail(),
            user.getLogin(),
            user.getRola(),
            user.getAktywnosc(),
            user.getDataUtw(),
            user.getPlatnosc(),
            isAdmin ? user.getHaslo() : null,
            isAdmin ? user.getSalt() : null
        );
    }
}
