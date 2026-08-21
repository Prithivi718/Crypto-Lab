import java.util.Scanner;

public class RailFenceCipher {

    static String encrypt(String text, int depth) {
        StringBuilder[] rail = new StringBuilder[depth];
        for (int i = 0; i < depth; i++) rail[i] = new StringBuilder();

        int row = 0, dir = 1;

        for (char ch : text.toCharArray()) {
            rail[row].append(ch);
            if (row == 0) dir = 1;
            else if (row == depth - 1) dir = -1;
            row += dir;
        }

        StringBuilder cipher = new StringBuilder();
        for (StringBuilder r : rail) cipher.append(r);

        return cipher.toString();
    }

    static String decrypt(String cipher, int depth) {
        char[][] rail = new char[depth][cipher.length()];
        int row = 0, dir = 1;

        // Mark pattern
        for (int i = 0; i < cipher.length(); i++) {
            rail[row][i] = '*';
            if (row == 0) dir = 1;
            else if (row == depth - 1) dir = -1;
            row += dir;
        }

        // Fill cipher
        int k = 0;
        for (int i = 0; i < depth; i++)
            for (int j = 0; j < cipher.length(); j++)
                if (rail[i][j] == '*') rail[i][j] = cipher.charAt(k++);

        // Read plain text
        StringBuilder plain = new StringBuilder();
        row = 0;
        dir = 1;

        for (int i = 0; i < cipher.length(); i++) {
            plain.append(rail[row][i]);
            if (row == 0) dir = 1;
            else if (row == depth - 1) dir = -1;
            row += dir;
        }

        return plain.toString();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Plain Text: ");
        String text = sc.nextLine();

        System.out.print("Enter Depth: ");
        int depth = sc.nextInt();

        String cipher = encrypt(text, depth);
        System.out.println("Encrypted Text: " + cipher);
        System.out.println("Decrypted Text: " + decrypt(cipher, depth));
    }
}