package Practice;

import java.util.Scanner;

public class a1 {

    private static String encryptCeasar(String plain, int key) {

        StringBuilder cipher = new StringBuilder();

        for (char ch : plain.toCharArray()) {

            if (Character.isLetter(ch)) {

                // Plain value
                int plainValue = ch - 'A';

                // Cipher value
                int cipherValue = (plainValue + key) % 26;

                // Cipher Char
                char cipherChar = (char) (cipherValue + 'A');

                // Cipher Text
                cipher.append(cipherChar);
            }

            else {
                cipher.append(ch);
            }
        }

        return cipher.toString();
    }

    private static String decryptCeasar(String cipher, int key) {

        StringBuilder plain = new StringBuilder();

        for (char ch : cipher.toCharArray()) {

            if (Character.isLetter(ch)) {

                // Cipher value
                int cipherValue = ch - 'A';

                // Plain value +26 -> to avoid -ve values
                int plainValue = (cipherValue - key + 26) % 26;

                // Plain char
                char plainChar = (char) (plainValue + 'A');

                plain.append(plainChar);

            } else{
                plain.append(ch);
            }
        }

        return plain.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter the secret Message: ");
        String s = sc.nextLine().toUpperCase();

        System.out.println("Enter the key value: ");
        int key = sc.nextInt();

        String cipher = encryptCeasar(s, key);
        String plain = decryptCeasar(cipher, key);

        System.out.println("Caesar Cipher Technique: ");
        System.out.println("Secret text: " + s);
        System.out.println("Encrypted Cipher text: " + cipher);
        System.out.println("Decrypted Text: " + plain);

        sc.close();
    }

}
