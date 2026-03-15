public class User {
    private int id;
    private String username;
    private String passwordHash;
    private String salt;

    public User(int id, String username, String passwordHash, String salt) {
        this.id = id;
        this.username = username;
        this.passwordHash = passwordHash;
        this.salt = salt;
    }

    public User(String username, String passwordHash, String salt) {
        this(0, username, passwordHash, salt);
    }

    public int getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getSalt() {
        return salt;
    }
}

