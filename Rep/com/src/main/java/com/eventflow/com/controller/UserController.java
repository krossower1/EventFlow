package com.eventflow.com.controller;

import com.eventflow.com.controller.dto.UserResponse;
import com.eventflow.com.controller.dto.UpdateOwnProfileRequest;
import com.eventflow.com.controller.dto.ChangeOwnPasswordRequest;
import com.eventflow.com.controller.dto.LoginLogResponse;
import com.eventflow.com.controller.dto.ReportSuspiciousLoginRequest;
import com.eventflow.com.controller.dto.SecurityTicketAdminResponse;
import com.eventflow.com.controller.dto.SessionSettingsResponse;
import com.eventflow.com.controller.dto.UpdateSessionSettingsRequest;
import com.eventflow.com.auth.AuthService;
import com.eventflow.com.model.LoginLog;
import com.eventflow.com.model.User;
import com.eventflow.com.repository.LoginLogRepository;
import com.eventflow.com.repository.UserRepository;
import com.eventflow.com.service.SecurityTicketService;
import com.eventflow.com.service.UserCascadeDeleteService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000") // Ważne dla Twojego Reacta!
public class UserController {
    private static final int MIN_SESSION_TIMEOUT_MINUTES = 1;
    private static final int MAX_SESSION_TIMEOUT_MINUTES = 1440;
    private static final int DEFAULT_SESSION_WARNING_MINUTES = 1;
    private static final String SESSION_EXPIRY_ACTION_LOGOUT = "LOGOUT";
    private static final String SESSION_EXPIRY_ACTION_LOCK_SCREEN = "LOCK_SCREEN";
    private static final String SESSION_COUNT_MODE_RELATIVE = "RELATIVE";
    private static final String SESSION_COUNT_MODE_ABSOLUTE = "ABSOLUTE";

    private final UserRepository userRepository;
    private final LoginLogRepository loginLogRepository;
    private final UserCascadeDeleteService userCascadeDeleteService;
    private final AuthService authService;
    /** Tworzenie zgłoszeń bezpieczeństwa z poziomu profilu (historia logowań). */
    private final SecurityTicketService securityTicketService;

    public UserController(
        UserRepository userRepository,
        LoginLogRepository loginLogRepository,
        UserCascadeDeleteService userCascadeDeleteService,
        AuthService authService,
        SecurityTicketService securityTicketService
    ) {
        this.userRepository = userRepository;
        this.loginLogRepository = loginLogRepository;
        this.userCascadeDeleteService = userCascadeDeleteService;
        this.authService = authService;
        this.securityTicketService = securityTicketService;
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

    @GetMapping("/me/session-settings")
    // Zwraca ustawienia sesji aktualnego użytkownika (timeout, ostrzeżenie, tryb liczenia i akcję po wygaśnięciu).
    public SessionSettingsResponse getOwnSessionSettings(Authentication authentication) {
        User currentUser = requireCurrentUser(authentication);
        int durationMinutes = resolveSessionTimeoutMinutes(currentUser.getSessionTimeoutMinutes());
        return new SessionSettingsResponse(
            Boolean.TRUE.equals(currentUser.getSessionTimeoutEnabled()),
            durationMinutes,
            resolveSessionWarningMinutes(currentUser.getSessionWarningMinutes(), durationMinutes),
            resolveSessionExpiryAction(currentUser.getSessionExpiryAction()),
            resolveSessionCountMode(currentUser.getSessionCountMode())
        );
    }

    @PutMapping("/me/session-settings")
    // Aktualizuje ustawienia sesji użytkownika i waliduje ich spójność.
    public SessionSettingsResponse updateOwnSessionSettings(
        @RequestBody UpdateSessionSettingsRequest request,
        Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        if (request == null) {
            throw new RuntimeException("Brak danych ustawień sesji");
        }

        boolean enabled = Boolean.TRUE.equals(request.enabled());
        int durationMinutes = resolveSessionTimeoutMinutes(request.durationMinutes());
        int warningMinutes = resolveSessionWarningMinutes(request.warningMinutes(), durationMinutes);
        String expiryAction = resolveSessionExpiryAction(request.expiryAction());
        String countMode = resolveSessionCountMode(request.countMode());

        if (durationMinutes < MIN_SESSION_TIMEOUT_MINUTES || durationMinutes > MAX_SESSION_TIMEOUT_MINUTES) {
            throw new RuntimeException("Czas sesji musi być w zakresie od 1 do 1440 minut");
        }
        if (warningMinutes < 0 || warningMinutes >= durationMinutes) {
            throw new RuntimeException("Czas ostrzeżenia musi być nieujemny i krótszy niż czas sesji");
        }

        currentUser.setSessionTimeoutEnabled(enabled);
        currentUser.setSessionTimeoutMinutes(durationMinutes);
        currentUser.setSessionWarningMinutes(warningMinutes);
        currentUser.setSessionExpiryAction(expiryAction);
        currentUser.setSessionCountMode(countMode);
        User saved = userRepository.save(currentUser);
        int savedDuration = resolveSessionTimeoutMinutes(saved.getSessionTimeoutMinutes());

        return new SessionSettingsResponse(
            Boolean.TRUE.equals(saved.getSessionTimeoutEnabled()),
            savedDuration,
            resolveSessionWarningMinutes(saved.getSessionWarningMinutes(), savedDuration),
            resolveSessionExpiryAction(saved.getSessionExpiryAction()),
            resolveSessionCountMode(saved.getSessionCountMode())
        );
    }

    @GetMapping("/me/login-history")
    // Zwraca historię logowań bieżącego użytkownika (limitowana liczba rekordów).
    public List<LoginLogResponse> getOwnLoginHistory(
        Authentication authentication,
        @RequestParam(name = "limit", defaultValue = "20") int limit
    ) {
        User currentUser = requireCurrentUser(authentication);
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<LoginLog> logs = loginLogRepository.findByUserOrderByLoginTimeDesc(
            currentUser,
            PageRequest.of(0, safeLimit, Sort.by(Sort.Direction.DESC, "loginTime"))
        );
        return logs.stream()
            .map(log -> new LoginLogResponse(
                log.getId(),
                log.getLoginTime(),
                log.getLocation(),
                log.getDeviceInfo(),
                log.getStatus()
            ))
            .toList();
    }

    /**
     * Zgłoszenie wpisu z własnej historii logowań do skrzynki administratorów.
     * Weryfikuje, że {@link ReportSuspiciousLoginRequest#loginLogId()} należy do zalogowanego użytkownika (w serwisie).
     * Zwraca ten sam kształt JSON co lista admina, żeby ewentualny front mógł od razu pokazać utworzone zgłoszenie.
     */
    @PostMapping("/me/security-tickets/report-login")
    public SecurityTicketAdminResponse reportSuspiciousLoginFromHistory(
        @RequestBody ReportSuspiciousLoginRequest request,
        Authentication authentication
    ) {
        User currentUser = requireCurrentUser(authentication);
        return securityTicketService.reportSuspiciousLoginReturningDto(
            currentUser,
            request.loginLogId(),
            request.note()
        );
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

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null) {
            throw new RuntimeException("Brak uwierzytelnienia");
        }
        return userRepository.findByLogin(authentication.getName())
            .orElseThrow(() -> new RuntimeException("Nie znaleziono aktualnego użytkownika"));
    }

    private int resolveSessionTimeoutMinutes(Integer value) {
        // Domyślny timeout dla starszych rekordów bez ustawionej wartości.
        if (value == null) {
            return 30;
        }
        return value;
    }

    private int resolveSessionWarningMinutes(Integer value, int durationMinutes) {
        // Ostrzeżenie nie może przekroczyć czasu sesji; przy 1 min sesji dopuszczane 0 (bez ostrzeżenia).
        int maxWarning = Math.max(0, durationMinutes - 1);
        if (value == null) {
            return Math.min(DEFAULT_SESSION_WARNING_MINUTES, maxWarning);
        }
        return Math.min(maxWarning, Math.max(0, value));
    }

    private String resolveSessionExpiryAction(String value) {
        // Dozwolone wartości: LOCK_SCREEN lub LOGOUT (fallback).
        if (SESSION_EXPIRY_ACTION_LOCK_SCREEN.equalsIgnoreCase(value)) {
            return SESSION_EXPIRY_ACTION_LOCK_SCREEN;
        }
        return SESSION_EXPIRY_ACTION_LOGOUT;
    }

    private String resolveSessionCountMode(String value) {
        // Dozwolone wartości: ABSOLUTE (bezwzględny) lub RELATIVE (reset aktywnością, fallback).
        if (SESSION_COUNT_MODE_ABSOLUTE.equalsIgnoreCase(value)) {
            return SESSION_COUNT_MODE_ABSOLUTE;
        }
        return SESSION_COUNT_MODE_RELATIVE;
    }
}
