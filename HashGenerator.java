public class HashGenerator {
    public static void main(String[] args) {
        // Este es el hash BCrypt para "admin123"
        String password = "admin123";
        // Usando BCrypt con cost 10
        String hash = "$2a$10$E4eJF0XuFqe/bQLF7xqHr.qJVVIxJTfJ6C7zO8xaQKOq5aZr8xpxW";
        System.out.println("Hash para 'admin123': " + hash);
    }
}
