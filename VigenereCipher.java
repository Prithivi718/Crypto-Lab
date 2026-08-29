import java.util.*;

public class VigenereCipher {

    // Encrypt plaintext
    public static String encrypt(String text, String key) {

        text = text.toUpperCase();
        key = key.toUpperCase();

        StringBuilder cipher = new StringBuilder();

        for (int i = 0, j = 0; i < text.length(); i++) {

            char ch = text.charAt(i);

            if (Character.isLetter(ch)) {

                int shift = key.charAt(j % key.length()) - 'A';

                cipher.append((char) ((ch - 'A' + shift) % 26 + 'A'));

                j++;
            } else {
                cipher.append(ch);
            }
        }

        return cipher.toString();
    }

    // Decrypt ciphertext
    public static String decrypt(String text, String key) {

        text = text.toUpperCase();
        key = key.toUpperCase();

        StringBuilder plain = new StringBuilder();

        for (int i = 0, j = 0; i < text.length(); i++) {

            char ch = text.charAt(i);

            if (Character.isLetter(ch)) {

                int shift = key.charAt(j % key.length()) - 'A';

                plain.append((char) ((ch - 'A' - shift + 26) % 26 + 'A'));

                j++;
            } else {
                plain.append(ch);
            }
        }

        return plain.toString();
    }

    // Demo function
    public static void demo(String secret) {

        Scanner scr = new Scanner(System.in);
        System.out.println("Enter KEY string: ");
        String key = scr.nextLine();

        System.out.println("\n== VIGENERE CIPHER ===");

        String encrypted = encrypt(secret, key);

        System.out.println("Plain Text : " + secret);
        System.out.println("Key        : " + key);
        System.out.println("Cipher Text: " + encrypted);

        String decrypted = decrypt(encrypted, key);

        System.out.println("Decrypted  : " + decrypted);

        scr.close();
    }
}