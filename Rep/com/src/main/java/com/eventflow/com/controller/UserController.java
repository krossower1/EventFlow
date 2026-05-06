package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.UserResponse;
import com.eventflow.com.controller.dto.UpdateOwnProfileRequest;
import com.eventflow.com.controller.dto.ChangeOwnPasswordRequest;
import com.eventflow.com.auth.AuthService;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.service.UserCascadeDeleteService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Ważne dla Twojego Reacta!
public class UserController {

    private final UserRepository userRepository;
    private final UserCascadeDeleteService userCascadeDeleteService;
    private final AuthService authService;

    public UserController(
        UserRepository userRepository,
        UserCascadeDeleteService userCascadeDeleteService,
        AuthService authService
    ) {
        this.userRepository = userRepository;
        this.userCascadeDeleteService = userCascadeDeleteService;
        this.authService = authService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers(Authentication authentication) {
        boolean isAdmin = authentication != null && authentication.getAuthorities().stream()
            .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        return userRepository.findAll().stream()
            .map(user -> mapUser(user, isAdmin))
            .toList();
    }

    // Zwraca profil aktualnie zalogowanego użytkownika.
    @GetMapping("/me")
    public UserResponse getOwnProfile(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Brak uwierzytelnienia");
        }
        User currentUser = userRepository.findByLogin(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));
        return mapUser(currentUser, false);
    }

    // Aktualizuje dane własnego profilu oraz uruchamia weryfikację, gdy email został zmieniony.
    @PutMapping("/me")
    public UserResponse updateOwnProfile(@RequestBody UpdateOwnProfileRequest request, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Brak uwierzytelnienia");
        }

        User currentUser = userRepository.findByLogin(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));

        String newImie = safeTrim(request.imie());
        String newNazwisko = safeTrim(request.nazwisko());
        String newEmail = safeTrim(request.email());
        String newTelefon = safeTrim(request.telefon());

        if (!newImie.isEmpty()) {
            currentUser.setImie(newImie);
        }
        if (!newNazwisko.isEmpty()) {
            currentUser.setNazwisko(newNazwisko);
        }

        if (!newTelefon.isEmpty()) {
            // Telefon ma być unikalny globalnie, ale użytkownik może zostawić swój własny numer.
            boolean phoneTakenByOtherUser = userRepository.findByTelefon(newTelefon)
                .map(user -> !user.getId().equals(currentUser.getId()))
                .orElse(false);
            if (phoneTakenByOtherUser) {
                throw new RuntimeException("Podany numer telefonu jest już zajęty");
            }
        }
        currentUser.setTelefon(newTelefon.isEmpty() ? null : newTelefon);
        boolean emailChanged = !newEmail.isEmpty()
            && (currentUser.getEmail() == null || !currentUser.getEmail().equalsIgnoreCase(newEmail));

        if (emailChanged) {
            // Zmiana emaila nie aktywuje się od razu: wysyłanie kodu i czekanie na weryfikację.
            authService.requestEmailVerification(currentUser, newEmail);
        } else {
            userRepository.save(currentUser);
        }

        User saved = userRepository.findById(currentUser.getId())
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));
        return mapUser(saved, false);
    }

    // Endpoint self-service do zmiany własnego hasła.
    @PutMapping("/me/password")
    public String changeOwnPassword(@RequestBody ChangeOwnPasswordRequest request, Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Brak uwierzytelnienia");
        }

        String oldPassword = safeTrim(request.oldPassword());
        String newPassword = safeTrim(request.newPassword());
        String confirmNewPassword = safeTrim(request.confirmNewPassword());
        authService.changeOwnPassword(authentication.getName(), oldPassword, newPassword, confirmNewPassword);
        return "Hasło zostało zmienione";
    }

    @DeleteMapping("/me")
    public String deleteOwnAccount(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Brak uwierzytelnienia");
        }

        User currentUser = userRepository.findByLogin(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));

        userCascadeDeleteService.deleteUserWithDependencies(currentUser);
        return "Twoje konto zostało usunięte";
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

        userCascadeDeleteService.deleteUserWithDependencies(userToDelete);
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
            user.getTelefon(),
            user.getLogin(),
            user.getRola(),
            user.getAktywnosc(),
            user.getDataUtw(),
            user.getPlatnosc(),
            isAdmin ? user.getHaslo() : null,
            isAdmin ? user.getSalt() : null
        );
    }

    // Bezpieczne trimowanie wartości z requestu (null -> pusty string).
    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }
}
