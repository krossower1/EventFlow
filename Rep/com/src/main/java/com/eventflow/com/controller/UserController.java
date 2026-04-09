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

    @DeleteMapping("/{id}")
    public String deleteUser(@PathVariable Long id, Authentication authentication) {
        // Operacje usuwania/dezaktywacji są zarezerwowane tylko dla ADMIN.
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new RuntimeException("Tylko administrator może usuwać użytkowników");
        }

        // Pobierz aktualnie zalogowanego użytkownika
        String currentLogin = authentication.getName();
        User currentUser = userRepository.findByLogin(currentLogin)
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));

        // Dodatkowa ochrona: admin nie może usunąć samego siebie.
        if (currentUser.getId().equals(id)) {
            throw new RuntimeException("Nie możesz usunąć swojego konta");
        }

        // Usuń użytkownika
        User userToDelete = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if ("ADMIN".equalsIgnoreCase(userToDelete.getRola())) {
            // Konta administratorów są chronione przed modyfikacją przez API.
            throw new RuntimeException("Nie można usuwać kont administratorów");
        }

        userRepository.delete(userToDelete);
        return "Użytkownik " + userToDelete.getLogin() + " został usunięty";
    }

    @PutMapping("/{id}/deactivate")
    public String deactivateUser(@PathVariable Long id, Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (!isAdmin) {
            throw new RuntimeException("Tylko administrator może dezaktywować użytkowników");
        }

        String currentLogin = authentication.getName();
        User currentUser = userRepository.findByLogin(currentLogin)
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));

        if (currentUser.getId().equals(id)) {
            throw new RuntimeException("Nie możesz dezaktywować swojego konta");
        }

        User userToDeactivate = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));

        if ("ADMIN".equalsIgnoreCase(userToDeactivate.getRola())) {
            // Konta administratorów są chronione przed modyfikacją przez API.
            throw new RuntimeException("Nie można dezaktywować kont administratorów");
        }

        if (Boolean.FALSE.equals(userToDeactivate.getAktywnosc())) {
            return "Użytkownik " + userToDeactivate.getLogin() + " jest już nieaktywny";
        }

        // Boolean false mapuje się na 0 w kolumnie MySQL typu tinyint(1).
        userToDeactivate.setAktywnosc(false);
        userRepository.save(userToDeactivate);
        return "Użytkownik " + userToDeactivate.getLogin() + " został dezaktywowany";
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
