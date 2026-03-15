import java.util.Scanner;

public class Main {

    private static final Scanner SCANNER = new Scanner(System.in);

    public static void main(String[] args) {
        AuthService authService = new AuthService();

        while (true) {
            System.out.println("=== EventFlow ===");
            System.out.println("1. Register");
            System.out.println("2. Login");
            System.out.println("3. Exit");
            System.out.print("Choose option: ");

            String choice = SCANNER.nextLine().trim();

            switch (choice) {
                case "1":
                    handleRegister(authService);
                    break;
                case "2":
                    handleLogin(authService);
                    break;
                case "3":
                    return;
                default:
                    System.out.println("?");
            }

            System.out.println();
        }
    }

    private static void handleRegister(AuthService authService) {
        System.out.println("--- Registration ---");
        System.out.print("Username: ");
        String username = SCANNER.nextLine().trim();

        System.out.print("Password: ");
        String password = SCANNER.nextLine();

        try {
            boolean ok = authService.register(username, password);
            if (ok) {
                System.out.println("Registration successful.");
            } else {
                System.out.println("Username already exists.");
            }
        } catch (Exception e) {
            System.out.println("Registration failed: " + e.getMessage());
        }
    }

    private static void handleLogin(AuthService authService) {
        System.out.println("--- Login ---");
        System.out.print("Username: ");
        String username = SCANNER.nextLine().trim();

        System.out.print("Password: ");
        String password = SCANNER.nextLine();

        try {
            boolean ok = authService.login(username, password);
            if (ok) {
                System.out.println("Login successful. Welcome, " + username + "!");
            } else {
                System.out.println("Invalid username or password.");
            }
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
        }
    }
}
