package Practice;

import java.util.Scanner;

public class a4 {

    private static String encryptHill(String plain, int[][] key) {
        StringBuilder cipher = new StringBuilder();

        plain = plain.toUpperCase().replaceAll("[^A-Z]", "");

        // Make text even
        if (plain.length() % 2 != 0) {
            plain += "X";
        }

        for (int i = 0; i < plain.length(); i += 2) {

            int p1 = plain.charAt(i) - 'A';
            int p2 = plain.charAt(i + 1) - 'A';

            int c1 = (key[0][0] * p1 + key[0][1] * p2) % 26;
            int c2 = (key[1][0] * p1 + key[1][1] * p2) % 26;

            cipher.append((char) (c1 + 'A'));
            cipher.append((char) (c2 + 'A'));

        }

        return cipher.toString();
    }

    private static String decryptHill(String cipher, int[][] key) {

        // Inverse of Key Matrix

        // Calc determinant
        int det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26;
        if (det < 0)
            det += 26;

        int detInv = -1;
        for (int i = 1; i <= 26; i++) {
            if ((det * i) % 26 == 1) {
                detInv = i;
                break;
            }
        }

        if (detInv == -1) {
            System.out.println("Key Matrix is not invertible!");
            return "";
        }

        // Build inverse matrix
        int[][] inverseKey = new int[2][2];
        inverseKey[0][0] = (key[1][1] * detInv) % 26;
        inverseKey[0][1] = ((-key[0][1] * detInv) % 26 + 26) % 26;
        inverseKey[1][0] = ((-key[1][0] * detInv) % 26 + 26) % 26;
        inverseKey[1][1] = (key[0][0] * detInv) % 26;

        StringBuilder plain = new StringBuilder();

        for (int i = 0; i < cipher.length(); i += 2) {

            int c1 = cipher.charAt(i) - 'A';
            int c2 = cipher.charAt(i + 1) - 'A';

            int p1 = (inverseKey[0][0] * c1 + inverseKey[0][1] * c2) % 26;
            int p2 = (inverseKey[1][0] * c1 + inverseKey[1][1] * c2) % 26;

            if (p1 < 0)
                p1 += 26;
            if (p2 < 0)
                p2 += 26;

            plain.append((char) (p1 + 'A'));
            plain.append((char) (p2 + 'A'));

        }

        return plain.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("Enter the Secret Message:");
        String s = sc.nextLine();
        int[][] key = new int[2][2];

        System.out.println("Enter 2x2 key matrix (3 3 2 5) :");

        for (int i = 0; i < key.length; i++) {
            for (int j = 0; j < key.length; j++) {
                key[i][j] = sc.nextInt();
            }
        }

        String encrypted = encryptHill(s, key);

        System.out.println("Plain Text : " + s);
        System.out.println("Cipher Text: " + encrypted);

        String decrypted = decryptHill(encrypted, key);

        System.out.println("Decrypted  : " + decrypted);

        sc.close();
    }
}
