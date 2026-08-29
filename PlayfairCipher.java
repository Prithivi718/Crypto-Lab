import java.util.*;

public class PlayfairCipher {

    // Generate 5x5 key matrix
    private static char[][] generateMatrix(String key) {

        key = (key + "ABCDEFGHIKLMNOPQRSTUVWXYZ")
                .toUpperCase()
                .replace("J", "");

        char[][] matrix = new char[5][5];
        boolean[] used = new boolean[26];

        for (int i = 0, k = 0; i < key.length() && k < 25; i++) {

            char ch = key.charAt(i);

            if (Character.isLetter(ch) && !used[ch - 'A']) {

                used[ch - 'A'] = true;

                matrix[k / 5][k % 5] = ch;

                k++;
            }
        }

        System.out.println("Key Matrix:");

        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix.length; j++) {

                System.out.print(matrix[i][j]);

            }
            System.out.println();

        }

        return matrix;
    }

    // Find position of character
    private static int[] find(char[][] matrix, char ch) {

        if (ch == 'J')
            ch = 'I';

        for (int i = 0; i < 5; i++) {

            for (int j = 0; j < 5; j++) {

                if (matrix[i][j] == ch) {

                    return new int[] { i, j };
                }
            }
        }

        return null;
    }

    // Common function for encryption/decryption
    private static String process(String text, String key, int shift) {

        char[][] matrix = generateMatrix(key);

        text = text.toUpperCase()
                .replace("J", "I")
                .replaceAll("[^A-Z]", "");

        StringBuilder result = new StringBuilder();

        // Prepare text
        for (int i = 0; i < text.length(); i++) {

            char a = text.charAt(i);
            char b = (i + 1 < text.length()) ? text.charAt(i + 1) : 'X';

            if (a == b) {

                b = 'X';

            } else {

                i++;
            }

            int[] p1 = find(matrix, a);
            int[] p2 = find(matrix, b);

            if (p1[0] == p2[0]) { // Same row

                result.append(matrix[p1[0]][(p1[1] + shift + 5) % 5]);
                result.append(matrix[p2[0]][(p2[1] + shift + 5) % 5]);

            } else if (p1[1] == p2[1]) { // Same column

                result.append(matrix[(p1[0] + shift + 5) % 5][p1[1]]);
                result.append(matrix[(p2[0] + shift + 5) % 5][p2[1]]);

            } else { // Rectangle

                result.append(matrix[p1[0]][p2[1]]);
                result.append(matrix[p2[0]][p1[1]]);
            }
        }

        return result.toString();
    }

    public static String encrypt(String text, String key) {

        return process(text, key, 1);
    }

    public static String decrypt(String text, String key) {

        return process(text, key, -1);
    }

    public static void demo(String secret) {
        Scanner scr = new Scanner(System.in);

        System.out.println("\n=== PLAYFAIR CIPHER ===");

        System.out.println("Enter the key string: ");
        String key = scr.nextLine().toUpperCase();

        String encrypted = encrypt(secret, key);

        System.out.println("Plain Text : " + secret);
        System.out.println("Cipher Text: " + encrypted);
        System.out.println("Decrypted  : " + decrypt(encrypted, key));

        scr.close();
    }
}