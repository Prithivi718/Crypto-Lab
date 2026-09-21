package Practice;

import java.util.Arrays;
import java.util.Scanner;

public class b1 {

    private static int[] parseKey(String keyInput) {
        String[] parts = keyInput.trim().split("\\s+"); // for integer key string
        // keyInput = keyInput.toUpperCase();
        // int[] key = new int[keyInput.length()];
        int[] key = new int[parts.length];

        for (int i = 0; i < key.length; i++) {
            key[i] = Integer.parseInt(parts[i]); // for integer key string
            // key[i] = keyInput.charAt(i);
        }

        return key;
    }

    private static int[] getOrder(int[] key) {

        Integer[] index = new Integer[key.length];

        for (int i = 0; i < key.length; i++)
            index[i] = i;

        Arrays.sort(index, (a, b) -> {
            if (key[a] != key[b])
                return Integer.compare(key[a], key[b]);

            return Integer.compare(a, b);
        });

        return Arrays.stream(index)
                .mapToInt(Integer::intValue)
                .toArray();
    }

    private static String encrypt(String plain, int[] key) {
        StringBuilder cipher = new StringBuilder();

        plain = plain.toUpperCase().replaceAll("\\s+", "");

        int cols = key.length;
        int rows = (plain.length() + cols - 1) / cols;

        char[][] matrix = new char[rows][cols];

        int k = 0; // for moving the characters in the plaintext

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                if (k < plain.length()) {
                    matrix[i][j] = plain.charAt(k++);
                } else {
                    matrix[i][j] = 'X';
                }
            }
        }

        int[] order = getOrder(key);

        for (int col : order) {
            for (int row = 0; row < rows; row++) {
                cipher.append(matrix[row][col]);
            }
        }

        return cipher.toString();
    }

    private static String decrypt(String cipher, int[] key) {
        StringBuilder plain = new StringBuilder();

        int cols = key.length;
        int rows = (cipher.length() + cols - 1) / cols;

        char[][] matrix = new char[rows][cols];

        int k = 0; // for moving the characters in the plaintext

        int[] order = getOrder(key);
        // Read in the col order
        for (int col: order) {
            for (int row = 0; row < rows; row++) {
                // No need as cipher is already properly managed
                matrix[row][col] = cipher.charAt(k++);

            }
        }


        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                plain.append(matrix[row][col]);
            }
        }

        return plain.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter the secret message: ");
        String s = sc.nextLine();

        System.out.println("Enter the key String (4 3 1 2): ");
        String keyInput = sc.nextLine();

        int[] key = parseKey(keyInput);
        System.out.println("Key: " + Arrays.toString(key));
        String cipher = encrypt(s, key);
        System.out.println("\nEncrypted Text: " + cipher);

        String decrypted = decrypt(cipher, key);
        System.out.println("Decrypted Text: " + decrypted);

        sc.close();
    }
}
