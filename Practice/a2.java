package Practice;

import java.util.Scanner;

public class a2 {

    private static char[][] generateKeyMatrix(String key) {
        key = (key + "ABCDEFGHIKLMNOPQRSTUVWXYZ")
                .toUpperCase()
                .replaceAll("J", "");

        char[][] matrix = new char[5][5];
        boolean[] used = new boolean[26];

        // i for key chars and k for matrix indices
        for (int i = 0, k = 0; i < key.length() && k < 25; i++) {
            char ch = key.charAt(i);

            if (Character.isLetter(ch) && !used[ch - 'A']) {
                used[ch - 'A'] = true;

                // Rows Cols
                matrix[k / 5][k % 5] = ch;
                k++;
            }
        }

        // Matrix printing
        System.out.println("Key Matrix:");

        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix.length; j++) {

                System.out.print(matrix[i][j]);

            }
            System.out.println();

        }

        return matrix;
    }

    private static int[] find(char[][] matrix, char ch) {

        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix.length; j++) {
                if (matrix[i][j] == ch) {
                    return new int[] { i, j };
                }
            }
        }

        return null;
    }

    private static String process(String text, String key, int shift) {
        StringBuilder result = new StringBuilder();

        char[][] matrix = generateKeyMatrix(key);
        text = text.toUpperCase()
                .replace("J", "I")
                .replaceAll("[^A-Z]", "");

        // Prepare the text

        for (int i = 0; i < text.length(); i++) {
            char a = text.charAt(i);
            char b = (i + 1 < text.length()) ? text.charAt(i + 1) : 'X';

            // Check a = b to replace with x or continue with next iteration
            if (a == b)
                b = 'X';
            else
                i++;

            // Find the positions of characters in the key matrix
            int[] p1 = find(matrix, a);
            int[] p2 = find(matrix, b);

            // Play with values
            
            // Same row
            if(p1[0] == p2[0]){
                result.append(matrix[p1[0]][(p1[1] + shift + 5) % 5]);
                result.append(matrix[p2[0]][(p2[1] + shift + 5) % 5]);
            }
            
            else if(p1[1] == p2[1]){
                result.append(matrix[(p1[0] + shift + 5) % 5][p1[1]]);
                result.append(matrix[(p2[0] + shift + 5) % 5][p2[1]]);
            }

            else{
                result.append(matrix[p1[0]][p2[1]]);
                result.append(matrix[p2[0]][p1[1]]);
            }
        }

        return result.toString();
    }

    private static String encryptPlayFair(String plain, String key) {
        return process(plain, key, 1);
    }

    private static String decryptPlayFair(String cipher, String key) {
        return process(cipher, key, -1);
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter the secret Message: ");
        String s = sc.nextLine().toUpperCase();

        System.out.println("Enter the Key String: ");
        String key = sc.nextLine();

        String cipher = encryptPlayFair(s, key);
        String plain = decryptPlayFair(cipher, key);

        System.out.println("Plain Text : " + s);
        System.out.println("Cipher Text: " + cipher);
        System.out.println("Decrypted  : " + plain);

        sc.close();
    }
}
