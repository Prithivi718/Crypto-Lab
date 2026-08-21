import java.util.*;

public class ColumnTransposition {

    static void printMatrix(char[][] matrix, int[] key, int[] order) {

        System.out.println("\nBefore column ordering:\n");

        // // Column numbers
        // System.out.print("Column : ");
        // for (int i = 0; i < key.length; i++)
        //     System.out.printf("%-3d", i + 1);
        System.out.println();

        // Key values
        System.out.print("Key    : ");
        for (int value : key)
            System.out.printf("%-3d", value);
        System.out.println();

        // Matrix
        for (char[] row : matrix) {
            System.out.print("         ");
            for (char ch : row)
                System.out.printf("%-3c", ch);
            System.out.println();
        }

        System.out.println("\nAfter column ordering:\n");

        // // Ordered column numbers
        // System.out.print("Column : ");
        // for (int col : order)
        //     System.out.printf("%-3d", col + 1);
        // System.out.println();

        // Ordered key values
        System.out.print("Key    : ");
        for (int col : order)
            System.out.printf("%-3d", key[col]);
        System.out.println();

        // Reordered matrix
        for (char[] row : matrix) {
            System.out.print("         ");
            for (int col : order)
                System.out.printf("%-3c", row[col]);
            System.out.println();
        }
    }

    // Returns column indexes in ascending key order
    static int[] getOrder(int[] key) {

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

    static String encrypt(String text, int[] key) {

        text = text.replaceAll("\\s+", "").toUpperCase();

        int cols = key.length;
        int rows = (text.length() + cols - 1) / cols;

        char[][] matrix = new char[rows][cols];

        int k = 0;

        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {

                if (k < text.length())
                    matrix[i][j] = text.charAt(k++);
                else
                    matrix[i][j] = 'X';
            }
        }

        int[] order = getOrder(key);

        printMatrix(matrix, key, order);

        StringBuilder cipher = new StringBuilder();

        for (int col : order) {
            for (int row = 0; row < rows; row++) {
                cipher.append(matrix[row][col]);
            }
        }

        return cipher.toString();
    }

    static String decrypt(String cipher, int[] key) {

        int cols = key.length;
        int rows = cipher.length() / cols;

        char[][] matrix = new char[rows][cols];

        int[] order = getOrder(key);

        int k = 0;

        // Put ciphertext back column by column
        for (int col : order) {

            for (int row = 0; row < rows; row++) {

                matrix[row][col] = cipher.charAt(k++);
            }
        }

        StringBuilder plain = new StringBuilder();

        // Read row by row
        for (char[] row : matrix) {
            for (char ch : row) {
                plain.append(ch);
            }
        }

        return plain.toString();
    }

    static int[] parseKey(String keyInput) {

        String[] parts = keyInput.trim().split("\\s+");

        int[] key = new int[parts.length];

        for (int i = 0; i < parts.length; i++)
            key[i] = Integer.parseInt(parts[i]);

        return key;
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String plain = sc.nextLine();

        System.out.print("Enter Key String: ");
        String keyInput = sc.nextLine();

        int[] key = parseKey(keyInput);

        String cipher = encrypt(plain, key);

        System.out.println("\nEncrypted Text: " + cipher);

        String decrypted = decrypt(cipher, key);

        System.out.println("Decrypted Text: " + decrypted);

        sc.close();
    }
}