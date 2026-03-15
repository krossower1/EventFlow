import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.sql.SQLException;
import java.util.Base64;

public class AuthService {

    private final UserDao userDao = new UserDao();
    private final SecureRandom random = new SecureRandom();

    public boolean register(String username, String password) throws SQLException {
        if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Username and password must not be empty.");
        }

        if (userDao.usernameExists(username)) {
            return false;
        }

        String salt = generateSalt();
        String hash = hashPassword(password, salt);

        User user = new User(username, hash, salt);
        userDao.insert(user);
        return true;
    }

    public boolean login(String username, String password) throws SQLException {
        if (username == null || password == null) {
            return false;
        }

        User user = userDao.findByUsername(username);
        if (user == null) {
            return false;
        }

        String expectedHash = user.getPasswordHash();
        String actualHash = hashPassword(password, user.getSalt());

        return expectedHash.equals(actualHash);
    }

    private String generateSalt() {
        byte[] saltBytes = new byte[16];
        random.nextBytes(saltBytes);
        return Base64.getEncoder().encodeToString(saltBytes);
    }

    private String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((salt + password).getBytes());
            return Base64.getEncoder().encodeToString(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}

