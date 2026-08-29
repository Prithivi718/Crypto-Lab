
import java.util.*;

public class CaesarCipher {

    public static String encrypt(String plaintext, int key) {

        StringBuilder ciphertext = new StringBuilder();

        // Convert to uppercase for simplicity
        plaintext = plaintext.toUpperCase();

        // Process each character
        for (char ch : plaintext.toCharArray()) {

            // Encrypt only alphabetic characters
            if (Character.isLetter(ch)) {

                /*
                 * Step 1:
                 * Convert letter to 0–25
                 *
                 * Example:
                 * A -> 0
                 * B -> 1
                 * ...
                 * Z -> 25
                 */
                int plainValue = ch - 'A';

                System.out.println("\nCharacter : " + ch);
                System.out.println(ch + " -> " + plainValue);

                /*
                 * Step 2:
                 * Shift by KEY positions
                 */
                int cipherValue = (plainValue + key) % 26;
                System.out.println("(" + plainValue + " + " + key + ") % 26 = " + cipherValue);

                /*
                 * Step 3:
                 * Convert back to letter
                 */
                char cipherChar = (char) (cipherValue + 'A');
                System.out.println(cipherValue + " -> " + cipherChar);

                ciphertext.append(cipherChar);

            } else {

                // Preserve spaces
                ciphertext.append(ch);
            }
        }

        return ciphertext.toString();
    }

    /*
     * Decrypts Caesar Cipher text.
     *
     * Formula:
     * Plain = (Cipher - Key + 26) mod 26
     */
    public static String decrypt(String ciphertext, int key) {

        StringBuilder plaintext = new StringBuilder();

        ciphertext = ciphertext.toUpperCase();

        for (char ch : ciphertext.toCharArray()) {

            if (Character.isLetter(ch)) {

                int cipherValue = ch - 'A';

                System.out.println("\nCharacter : " + ch);
                System.out.println(ch + " -> " + cipherValue);

                /*
                 * Add 26 before modulo
                 * to avoid negative values.
                 */
                int plainValue = (cipherValue - key + 26) % 26;
                System.out.println("(" + cipherValue + " - " + key + " + 26) % 26 = " + plainValue);

                char plainChar = (char) (plainValue + 'A');
                System.out.println(plainValue + " -> " + plainChar);

                plaintext.append(plainChar);

            } else {

                plaintext.append(ch);
            }
        }

        return plaintext.toString();
    }

    /*
     * Demonstrates both encryption and decryption.
     */
    public static void demo(String secret) {

        // int key = 3;
        Scanner scr = new Scanner(System.in);

        System.out.println("\n========== CAESAR CIPHER ==========");

        System.out.println("Enter the key number: ");
        int key = scr.nextInt();

        System.out.println("Secret Message : " + secret);

        System.out.println("Key            : " + key);

        // Encrypt
        String encrypted = encrypt(secret, key);

        System.out.println("Encrypted Text : " + encrypted);

        // Decrypt
        String decrypted = decrypt(encrypted, key);

        System.out.println("Decrypted Text : " + decrypted);

        scr.close();

    }
}
