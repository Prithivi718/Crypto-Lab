package Practice;

import java.util.Scanner;

public class a3 {

    private static String encryptVigenere(String plain, String key) {
        StringBuilder cipher = new StringBuilder();

        plain = plain.toUpperCase();
        key = key.toUpperCase();

        for (int i = 0, j = 0; i < plain.length(); i++) {
            char ch = plain.charAt(i);

            if (Character.isLetter(ch)) {
                // Find shift value
                int shift = key.charAt(j % key.length()) - 'A';

                int cipherValue = (ch - 'A' + shift) % 26;
                char cipherChar = (char) (cipherValue + 'A');

                cipher.append(cipherChar);
                j++;

            } else {
                cipher.append(ch);
            }
        }

        return cipher.toString();
    }

    private static String decryptVigenere(String cipher, String key) {
        StringBuilder plain = new StringBuilder();

        key = key.toUpperCase();

        for (int i = 0, j = 0; i < cipher.length(); i++) {
            char ch = cipher.charAt(i);

            if (Character.isLetter(ch)) {
                // Find shift value
                int shift = key.charAt(j % key.length()) - 'A';

                int cipherValue = (ch - 'A' - shift + 26) % 26;
                char cipherChar = (char) (cipherValue + 'A');

                plain.append(cipherChar);

                j++;
            } else {
                plain.append(ch);
            }
        }

        return plain.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter Secret message");
        String s = sc.nextLine();

        System.out.println("Enter KEY String: ");
        String key = sc.nextLine();

        String cipher = encryptVigenere(s, key);
        String plain = decryptVigenere(cipher, key);

        System.out.println("Secret Text : " + s);
        System.out.println("Key        : " + key);
        System.out.println("Cipher Text: " + cipher);
        System.out.println("Plain Text: " + plain);

        sc.close();
    }
}
