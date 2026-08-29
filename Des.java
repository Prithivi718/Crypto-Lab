import java.util.Arrays;
import java.util.Scanner;

public class Des {
    static final int[] IP = {
            58, 50, 42, 34, 26, 18, 10, 2, 60, 52, 44, 36, 28, 20, 12, 4,
            62, 54, 46, 38, 30, 22, 14, 6, 64, 56, 48, 40, 32, 24, 16, 8,
            57, 49, 41, 33, 25, 17, 9, 1, 59, 51, 43, 35, 27, 19, 11, 3,
            61, 53, 45, 37, 29, 21, 13, 5, 63, 55, 47, 39, 31, 23, 15, 7
    };

    static final int[] FP = {
            40, 8, 48, 16, 56, 24, 64, 32, 39, 7, 47, 15, 55, 23, 63, 31,
            38, 6, 46, 14, 54, 22, 62, 30, 37, 5, 45, 13, 53, 21, 61, 29,
            36, 4, 44, 12, 52, 20, 60, 28, 35, 3, 43, 11, 51, 19, 59, 27,
            34, 2, 42, 10, 50, 18, 58, 26, 33, 1, 41, 9, 49, 17, 57, 25
    };

    static final int[] E = {
            32, 1, 2, 3, 4, 5, 4, 5, 6, 7, 8, 9, 8, 9, 10, 11, 12, 13, 12, 13, 14, 15, 16, 17,
            16, 17, 18, 19, 20, 21, 20, 21, 22, 23, 24, 25, 24, 25, 26, 27, 28, 29, 28, 29, 30, 31, 32, 1
    };

    static final int[] P = {
            16, 7, 20, 21, 29, 12, 28, 17, 1, 15, 23, 26, 5, 18, 31, 10,
            2, 8, 24, 14, 32, 27, 3, 9, 19, 13, 30, 6, 22, 11, 4, 25
    };

    static final int[] PC1 = {
            57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18,
            10, 2, 59, 51, 43, 35, 27, 19, 11, 3, 60, 52, 44, 36,
            63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22,
            14, 6, 61, 53, 45, 37, 29, 21, 13, 5, 28, 20, 12, 4
    };

    static final int[] PC2 = {
            14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10,
            23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2,
            41, 52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48,
            44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
    };

    static final int[] SHIFTS = { 1, 1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1 };

    static final int[][][] SBOX = {
            {
                    { 14, 4, 13, 1, 2, 15, 11, 8, 3, 10, 6, 12, 5, 9, 0, 7 },
                    { 0, 15, 7, 4, 14, 2, 13, 1, 10, 6, 12, 11, 9, 5, 3, 8 },
                    { 4, 1, 14, 8, 13, 6, 2, 11, 15, 12, 9, 7, 3, 10, 5, 0 },
                    { 15, 12, 8, 2, 4, 9, 1, 7, 5, 11, 3, 14, 10, 0, 6, 13 }
            },
            {
                    { 15, 1, 8, 14, 6, 11, 3, 4, 9, 7, 2, 13, 12, 0, 5, 10 },
                    { 3, 13, 4, 7, 15, 2, 8, 14, 12, 0, 1, 10, 6, 9, 11, 5 },
                    { 0, 14, 7, 11, 10, 4, 13, 1, 5, 8, 12, 6, 9, 3, 2, 15 },
                    { 13, 8, 10, 1, 3, 15, 4, 2, 11, 6, 7, 12, 0, 5, 14, 9 }
            },
            {
                    { 10, 0, 9, 14, 6, 3, 15, 5, 1, 13, 12, 7, 11, 4, 2, 8 },
                    { 13, 7, 0, 9, 3, 4, 6, 10, 2, 8, 5, 14, 12, 11, 15, 1 },
                    { 13, 6, 4, 9, 8, 15, 3, 0, 11, 1, 2, 12, 5, 10, 14, 7 },
                    { 1, 10, 13, 0, 6, 9, 8, 7, 4, 15, 14, 3, 11, 5, 2, 12 }
            },
            {
                    { 7, 13, 14, 3, 0, 6, 9, 10, 1, 2, 8, 5, 11, 12, 4, 15 },
                    { 13, 8, 11, 5, 6, 15, 0, 3, 4, 7, 2, 12, 1, 10, 14, 9 },
                    { 10, 6, 9, 0, 12, 11, 7, 13, 15, 1, 3, 14, 5, 2, 8, 4 },
                    { 3, 15, 0, 6, 10, 1, 13, 8, 9, 4, 5, 11, 12, 7, 2, 14 }
            },
            {
                    { 2, 12, 4, 1, 7, 10, 11, 6, 8, 5, 3, 15, 13, 0, 14, 9 },
                    { 14, 11, 2, 12, 4, 7, 13, 1, 5, 0, 15, 10, 3, 9, 8, 6 },
                    { 4, 2, 1, 11, 10, 13, 7, 8, 15, 9, 12, 5, 6, 3, 0, 14 },
                    { 11, 8, 12, 7, 1, 14, 2, 13, 6, 15, 0, 9, 10, 4, 5, 3 }
            },
            {
                    { 12, 1, 10, 15, 9, 2, 6, 8, 0, 13, 3, 4, 14, 7, 5, 11 },
                    { 10, 15, 4, 2, 7, 12, 9, 5, 6, 1, 13, 14, 0, 11, 3, 8 },
                    { 9, 14, 15, 5, 2, 8, 12, 3, 7, 0, 4, 10, 1, 13, 11, 6 },
                    { 4, 3, 2, 12, 9, 5, 15, 10, 11, 14, 1, 7, 6, 0, 8, 13 }
            },
            {
                    { 4, 11, 2, 14, 15, 0, 8, 13, 3, 12, 9, 7, 5, 10, 6, 1 },
                    { 13, 0, 11, 7, 4, 9, 1, 10, 14, 3, 5, 12, 2, 15, 8, 6 },
                    { 1, 4, 11, 13, 12, 3, 7, 14, 10, 15, 6, 8, 0, 5, 9, 2 },
                    { 6, 11, 13, 8, 1, 4, 10, 7, 9, 5, 0, 15, 14, 2, 3, 12 }
            },
            {
                    { 13, 2, 8, 4, 6, 15, 11, 1, 10, 9, 3, 14, 5, 0, 12, 7 },
                    { 1, 15, 13, 8, 10, 3, 7, 4, 12, 5, 6, 11, 0, 14, 9, 2 },
                    { 7, 11, 4, 1, 9, 12, 14, 2, 0, 6, 10, 13, 15, 3, 5, 8 },
                    { 2, 1, 14, 7, 4, 10, 8, 13, 15, 12, 9, 0, 3, 5, 6, 11 }
            }
    };

    static void permute(int[] in, int[] table, int[] out) {
        for (int i = 0; i < table.length; i++)
            out[i] = in[table[i] - 1];
    }

    static void xorBits(int[] a, int[] b, int[] out) {
        for (int i = 0; i < a.length; i++)
            out[i] = a[i] ^ b[i];
    }

    static int[] leftShift(int[] bits, int n) {
        int[] out = new int[bits.length];
        for (int i = 0; i < bits.length; i++)
            out[i] = bits[(i + n) % bits.length];
        return out;
    }

    static int[] longToBits(long value, int len) {
        int[] bits = new int[len];
        for (int i = len - 1; i >= 0; i--) {
            bits[i] = (int) (value & 1);
            value >>= 1;
        }
        return bits;
    }

    static long bitsToLong(int[] bits) {
        long value = 0;
        for (int bit : bits)
            value = (value << 1) | bit;
        return value;
    }

    static long textToLong(String text) {
        byte[] bytes = new byte[8];
        byte[] src = text.getBytes();
        for (int i = 0; i < 8; i++)
            bytes[i] = (i < src.length) ? src[i] : 0x20;
        long val = 0;
        for (int i = 0; i < 8; i++)
            val = (val << 8) | (bytes[i] & 0xFF);
        return val;
    }

    static String longToText(long val) {
        StringBuilder sb = new StringBuilder();
        for (int i = 7; i >= 0; i--)
            sb.append((char) ((val >> (i * 8)) & 0xFF));
        return sb.toString().trim();
    }

    static String toHex64(long val) {
        return String.format("%016X", val);
    }

    static String toBinary64(long val) {
        return bitsToGroupedString(longToBits(val, 64), 8);
    }

    static String bitsToGroupedString(int[] bits, int group) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < bits.length; i++) {
            sb.append(bits[i]);
            if ((i + 1) % group == 0 && i != bits.length - 1)
                sb.append(' ');
        }
        return sb.toString();
    }

    static void printDivider() {
        System.out.println("--------------------------------------------------");
    }

    static void printSection(String title) {
        System.out.println();
        System.out.println("==================================================");
        System.out.println("  " + title);
        System.out.println("==================================================");
    }

    static void printBits(String label, int[] bits, int group) {
        System.out.printf("%-18s : %s%n", label, bitsToGroupedString(bits, group));
    }

    static void showCharToBits(String text, String title) {
        String padded = text.length() >= 8 ? text.substring(0, 8) : String.format("%-8s", text);

        printSection(title + " → 64-bit conversion");
        System.out.printf("%-8s %-7s %s%n", "Char", "ASCII", "8-bit");
        printDivider();

        StringBuilder fullBits = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            char c = padded.charAt(i);
            int ascii = (int) c;
            String bits = String.format("%8s", Integer.toBinaryString(ascii)).replace(' ', '0');
            System.out.printf("%-8s %-7d %s%n", (c == ' ' ? "SPACE" : String.valueOf(c)), ascii, bits);
            fullBits.append(bits).append(i == 7 ? "" : " ");
        }

        printDivider();
        System.out.println("64-bit block       : " + fullBits);
    }

    static int[] substitute(int[] bits) {
        int[] out = new int[32];
        for (int s = 0; s < 8; s++) {
            int o = s * 6;
            int row = (bits[o] << 1) | bits[o + 5];
            int col = (bits[o + 1] << 3) | (bits[o + 2] << 2) | (bits[o + 3] << 1) | bits[o + 4];
            int v = SBOX[s][row][col];
            for (int b = 3; b >= 0; b--)
                out[s * 4 + (3 - b)] = (v >> b) & 1;
        }
        return out;
    }

    static int[][] generateRoundKeysVerbose(int[] keyBits) {
        printSection("ROUND KEY GENERATION");
        printBits("Initial key", keyBits, 8);

        int[] permKey = new int[56];
        permute(keyBits, PC1, permKey);
        printBits("After PC-1", permKey, 7);

        int[] C = Arrays.copyOfRange(permKey, 0, 28);
        int[] D = Arrays.copyOfRange(permKey, 28, 56);
        printBits("C0", C, 7);
        printBits("D0", D, 7);

        int[][] roundKeys = new int[16][48];
        for (int round = 0; round < 16; round++) {
            C = leftShift(C, SHIFTS[round]);
            D = leftShift(D, SHIFTS[round]);

            int[] CD = new int[56];
            System.arraycopy(C, 0, CD, 0, 28);
            System.arraycopy(D, 0, CD, 28, 28);
            permute(CD, PC2, roundKeys[round]);

            printDivider();
            System.out.println("Round " + (round + 1) + "  |  shift = " + SHIFTS[round]);
            printBits("C" + (round + 1), C, 7);
            printBits("D" + (round + 1), D, 7);
            printBits("K" + (round + 1), roundKeys[round], 6);
        }
        return roundKeys;
    }

    static long desVerbose(long block, int[][] roundKeys, String mode) {
        printSection(mode + " PROCESS");
        printBits("Input (64)", longToBits(block, 64), 8);

        int[] bits = longToBits(block, 64);
        int[] ip = new int[64];
        permute(bits, IP, ip);
        printBits("After IP", ip, 8);

        int[] L = Arrays.copyOfRange(ip, 0, 32);
        int[] R = Arrays.copyOfRange(ip, 32, 64);
        printBits("L0", L, 8);
        printBits("R0", R, 8);

        for (int round = 0; round < 16; round++) {
            printDivider();
            System.out.println("Round " + (round + 1));

            printBits("L" + round, L, 8);
            printBits("R" + round, R, 8);

            int[] expanded = new int[48];
            permute(R, E, expanded);
            printBits("E(R" + round + ")", expanded, 6);

            int[] xored = new int[48];
            xorBits(expanded, roundKeys[round], xored);
            printBits("XOR with K" + (round + 1), xored, 6);

            int[] sBoxOutput = substitute(xored);
            printBits("S-box output", sBoxOutput, 4);

            int[] pOut = new int[32];
            permute(sBoxOutput, P, pOut);
            printBits("After P", pOut, 8);

            int[] newR = new int[32];
            xorBits(L, pOut, newR);
            printBits("New R" + (round + 1), newR, 8);

            L = R;
            R = newR;
        }

        printDivider();
        System.out.println("After 16 rounds");
        printBits("L16", L, 8);
        printBits("R16", R, 8);

        int[] combined = new int[64];
        System.arraycopy(R, 0, combined, 0, 32);
        System.arraycopy(L, 0, combined, 32, 32);
        printBits("Combined", combined, 8);

        int[] fp = new int[64];
        permute(combined, FP, fp);
        printBits("After FP", fp, 8);

        return bitsToLong(fp);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("========================================");
        System.out.println("         DES CIPHER PROGRAM             ");
        System.out.println("  Input: Word or Sentence               ");
        System.out.println("  (First 8 characters used = 64 bits)   ");
        System.out.println("========================================");

        System.out.print("\nEnter plaintext (word/sentence) : ");
        String plaintext = scanner.nextLine();

        System.out.print("Enter key       (word/sentence) : ");
        String keyStr = scanner.nextLine();

        showCharToBits(plaintext, "PLAINTEXT");
        showCharToBits(keyStr, "KEY");

        long plainLong = textToLong(plaintext);
        long keyLong = textToLong(keyStr);

        int[] keyBits = longToBits(keyLong, 64);
        int[][] roundKeys = generateRoundKeysVerbose(keyBits);

        int[][] decryptKeys = new int[16][48];
        for (int i = 0; i < 16; i++)
            decryptKeys[i] = roundKeys[15 - i];

        long ciphertext = desVerbose(plainLong, roundKeys, "ENCRYPTION");
        long decrypted = desVerbose(ciphertext, decryptKeys, "DECRYPTION");

        printSection("FINAL RESULT");
        System.out.println("Plaintext  (text)   : " + longToText(plainLong));
        System.out.println("Plaintext  (binary) : " + toBinary64(plainLong));
        System.out.println("Plaintext  (hex)    : " + toHex64(plainLong));
        System.out.println("Key        (text)   : " + keyStr);
        System.out.println("Key        (binary) : " + toBinary64(keyLong));
        System.out.println("Key        (hex)    : " + toHex64(keyLong));
        printDivider();
        System.out.println("Ciphertext (binary) : " + toBinary64(ciphertext));
        System.out.println("Ciphertext (hex)    : " + toHex64(ciphertext));
        System.out.println("Decrypted  (text)   : " + longToText(decrypted));
        System.out.println("Match               : " + (plainLong == decrypted ? "YES" : "NO"));

        scanner.close();
    }
}