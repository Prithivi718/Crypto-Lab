import java.util.*;

public class DoubleColumnarTransposition {

    // Print matrix
    static void printMatrix(char[][] matrix, int[] key, String step) {

        System.out.println("\n" + step);

        for (int k : key)
            System.out.print(k + " ");
        System.out.println();

        for (char[] row : matrix) {
            for (char ch : row)
                System.out.print(ch + " ");
            System.out.println();
        }
    }

    // One transposition
    static String encrypt(String text, int[] key, String step) {

        int cols = key.length;
        int rows = (text.length() + cols - 1) / cols;

        char[][] matrix = new char[rows][cols];

        int k = 0;

        // Fill matrix row-wise
        for (int i = 0; i < rows; i++)
            for (int j = 0; j < cols; j++)
                matrix[i][j] = (k < text.length()) ? text.charAt(k++) : 'X';

        printMatrix(matrix, key, step);

        StringBuilder cipher = new StringBuilder();

        // Read columns using key order
        for (int n = 1; n <= cols; n++)
            for (int j = 0; j < cols; j++)
                if (key[j] == n)
                    for (int i = 0; i < rows; i++)
                        cipher.append(matrix[i][j]);

        return cipher.toString();
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String text = sc.nextLine().replace(" ", "").toUpperCase();

        System.out.print("Enter Key (e.g. 4 3 1 2): ");

        String[] s = sc.nextLine().split(" ");

        int[] key = new int[s.length];

        for (int i = 0; i < s.length; i++)
            key[i] = Integer.parseInt(s[i]);

        String first = encrypt(text, key, "First Transposition");
        System.out.println("Cipher : " + first);

        String second = encrypt(first, key, "Second Transposition");
        System.out.println("Double Cipher : " + second);

        sc.close();
    }
}
