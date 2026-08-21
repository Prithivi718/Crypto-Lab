import java.util.Arrays;
import java.util.Scanner;

public class AES {

    // AES S-Box
    static final int[] SBOX = {
        0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
    };

    // AES Inverse S-Box
    static final int[] INV_SBOX = {
        0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
        0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
        0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
        0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
        0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
        0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
        0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
        0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
        0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
        0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
        0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
        0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
        0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
        0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
        0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
        0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
    };

    // Round Constant Table Rcon
    static final int[] RCON = {
        0x00, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36
    };

    // Helper functions for printing formatted bytes
    static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02X", b));
        }
        return sb.toString();
    }

    static String stateToString(int[][] state) {
        StringBuilder sb = new StringBuilder();
        for (int c = 0; c < 4; c++) {
            for (int r = 0; r < 4; r++) {
                sb.append(String.format("%02X", state[r][c]));
            }
        }
        return sb.toString();
    }

    static byte[] textTo16Bytes(String text) {
        byte[] bytes = new byte[16];
        byte[] textBytes = text.getBytes();
        for (int i = 0; i < 16; i++) {
            bytes[i] = (i < textBytes.length) ? textBytes[i] : (byte) 0x20; // Padding with space
        }
        return bytes;
    }

    static void showCharToBytes(String text) {
        String padded = text.length() >= 16 ? text.substring(0, 16) : String.format("%-16s", text);
        System.out.println("\n  Character-to-Byte Conversion (16 bytes = 128 bits):");
        System.out.println("  " + "-".repeat(52));
        System.out.printf("  %-6s %-8s %-10s %-8s%n", "Char", "ASCII", "Hex", "8-bit Binary");
        System.out.println("  " + "-".repeat(52));
        for (int i = 0; i < 16; i++) {
            char c = padded.charAt(i);
            int ascii = (int) c;
            String hex = String.format("%02X", ascii);
            String bits = String.format("%8s", Integer.toBinaryString(ascii)).replace(' ', '0');
            System.out.printf("  %-6s %-8d %-10s %-8s%n", (c == ' ' ? "SPACE" : String.valueOf(c)), ascii, hex, bits);
        }
        System.out.println("  " + "-".repeat(52));
    }

    // Key Expansion for AES-128
    static int[][][] keyExpansion(byte[] key) {
        System.out.println("\n========================================");
        System.out.println("      ROUND KEY GENERATION DETAILS      ");
        System.out.println("========================================");
        System.out.println("\nInitial 128-bit Key (Hex): " + bytesToHex(key));

        int[][] w = new int[44][4];

        for (int i = 0; i < 4; i++) {
            w[i][0] = key[4 * i] & 0xFF;
            w[i][1] = key[4 * i + 1] & 0xFF;
            w[i][2] = key[4 * i + 2] & 0xFF;
            w[i][3] = key[4 * i + 3] & 0xFF;
        }

        for (int i = 4; i < 44; i++) {
            int[] temp = Arrays.copyOf(w[i - 1], 4);
            if (i % 4 == 0) {
                // RotWord
                int t = temp[0];
                temp[0] = temp[1];
                temp[1] = temp[2];
                temp[2] = temp[3];
                temp[3] = t;

                // SubWord
                for (int j = 0; j < 4; j++) {
                    temp[j] = SBOX[temp[j]];
                }

                // XOR with Rcon
                temp[0] ^= RCON[i / 4];
            }
            for (int j = 0; j < 4; j++) {
                w[i][j] = w[i - 4][j] ^ temp[j];
            }
        }

        int[][][] roundKeys = new int[11][4][4];
        for (int round = 0; round < 11; round++) {
            for (int c = 0; c < 4; c++) {
                for (int r = 0; r < 4; r++) {
                    roundKeys[round][r][c] = w[round * 4 + c][r];
                }
            }
            System.out.println("Round Key K" + round + ": " + stateToString(roundKeys[round]));
        }
        return roundKeys;
    }

    // State operations
    static void addRoundKey(int[][] state, int[][] roundKey) {
        for (int r = 0; r < 4; r++) {
            for (int c = 0; c < 4; c++) {
                state[r][c] ^= roundKey[r][c];
            }
        }
    }

    static void subBytes(int[][] state) {
        for (int r = 0; r < 4; r++) {
            for (int c = 0; c < 4; c++) {
                state[r][c] = SBOX[state[r][c]];
            }
        }
    }

    static void invSubBytes(int[][] state) {
        for (int r = 0; r < 4; r++) {
            for (int c = 0; c < 4; c++) {
                state[r][c] = INV_SBOX[state[r][c]];
            }
        }
    }

    static void shiftRows(int[][] state) {
        for (int r = 1; r < 4; r++) {
            int[] temp = new int[4];
            for (int c = 0; c < 4; c++) {
                temp[c] = state[r][(c + r) % 4];
            }
            state[r] = temp;
        }
    }

    static void invShiftRows(int[][] state) {
        for (int r = 1; r < 4; r++) {
            int[] temp = new int[4];
            for (int c = 0; c < 4; c++) {
                temp[c] = state[r][(c - r + 4) % 4];
            }
            state[r] = temp;
        }
    }

    static int gmul(int a, int b) {
        int p = 0;
        for (int i = 0; i < 8; i++) {
            if ((b & 1) != 0) p ^= a;
            boolean hiBitSet = (a & 0x80) != 0;
            a = (a << 1) & 0xFF;
            if (hiBitSet) a ^= 0x1b;
            b >>= 1;
        }
        return p;
    }

    static void mixColumns(int[][] state) {
        for (int c = 0; c < 4; c++) {
            int a0 = state[0][c], a1 = state[1][c], a2 = state[2][c], a3 = state[3][c];
            state[0][c] = gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;
            state[1][c] = a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;
            state[2][c] = a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);
            state[3][c] = gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
        }
    }

    static void invMixColumns(int[][] state) {
        for (int c = 0; c < 4; c++) {
            int a0 = state[0][c], a1 = state[1][c], a2 = state[2][c], a3 = state[3][c];
            state[0][c] = gmul(a0, 0x0e) ^ gmul(a1, 0x0b) ^ gmul(a2, 0x0d) ^ gmul(a3, 0x09);
            state[1][c] = gmul(a0, 0x09) ^ gmul(a1, 0x0e) ^ gmul(a2, 0x0b) ^ gmul(a3, 0x0d);
            state[2][c] = gmul(a0, 0x0d) ^ gmul(a1, 0x09) ^ gmul(a2, 0x0e) ^ gmul(a3, 0x0b);
            state[3][c] = gmul(a0, 0x0b) ^ gmul(a1, 0x0d) ^ gmul(a2, 0x09) ^ gmul(a3, 0x0e);
        }
    }

    // Encryption with process details
    static byte[] encryptWithDetails(byte[] input, int[][][] roundKeys) {
        System.out.println("\n========================================");
        System.out.println("      ENCRYPTION PROCESS DETAILS        ");
        System.out.println("========================================");

        int[][] state = new int[4][4];
        for (int i = 0; i < 16; i++) {
            state[i % 4][i / 4] = input[i] & 0xFF;
        }

        System.out.println("\nInitial State: " + stateToString(state));
        addRoundKey(state, roundKeys[0]);
        System.out.println("After Initial AddRoundKey (K0): " + stateToString(state));

        for (int round = 1; round <= 10; round++) {
            System.out.println("\n--- Round " + round + " ---");

            subBytes(state);
            System.out.println("After SubBytes:   " + stateToString(state));

            shiftRows(state);
            System.out.println("After ShiftRows:  " + stateToString(state));

            if (round < 10) {
                mixColumns(state);
                System.out.println("After MixColumns: " + stateToString(state));
            }

            addRoundKey(state, roundKeys[round]);
            System.out.println("After AddRoundKey (K" + round + "): " + stateToString(state));
        }

        byte[] output = new byte[16];
        for (int i = 0; i < 16; i++) {
            output[i] = (byte) state[i % 4][i / 4];
        }
        return output;
    }

    // Decryption with process details
    static byte[] decryptWithDetails(byte[] input, int[][][] roundKeys) {
        System.out.println("\n========================================");
        System.out.println("      DECRYPTION PROCESS DETAILS        ");
        System.out.println("========================================");

        int[][] state = new int[4][4];
        for (int i = 0; i < 16; i++) {
            state[i % 4][i / 4] = input[i] & 0xFF;
        }

        System.out.println("\nInitial State: " + stateToString(state));
        addRoundKey(state, roundKeys[10]);
        System.out.println("After Initial AddRoundKey (K10): " + stateToString(state));

        for (int round = 9; round >= 0; round--) {
            System.out.println("\n--- Round " + (10 - round) + " ---");

            invShiftRows(state);
            System.out.println("After InvShiftRows: " + stateToString(state));

            invSubBytes(state);
            System.out.println("After InvSubBytes:  " + stateToString(state));

            addRoundKey(state, roundKeys[round]);
            System.out.println("After AddRoundKey (K" + round + "): " + stateToString(state));

            if (round > 0) {
                invMixColumns(state);
                System.out.println("After InvMixColumns: " + stateToString(state));
            }
        }

        byte[] output = new byte[16];
        for (int i = 0; i < 16; i++) {
            output[i] = (byte) state[i % 4][i / 4];
        }
        return output;
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.println("========================================");
        System.out.println("         AES CIPHER PROGRAM             ");
        System.out.println("  Input: Word or Sentence               ");
        System.out.println("  (First 16 characters used = 128 bits) ");
        System.out.println("========================================");

        System.out.print("\nEnter plaintext (word/sentence) : ");
        String plaintext = scanner.nextLine();

        System.out.print("Enter key       (word/sentence) : ");
        String keyStr = scanner.nextLine();

        System.out.println("\n========================================");
        System.out.println("    PLAINTEXT → 128-BIT CONVERSION      ");
        System.out.println("========================================");
        showCharToBytes(plaintext);

        System.out.println("\n========================================");
        System.out.println("      KEY → 128-BIT CONVERSION          ");
        System.out.println("========================================");
        showCharToBytes(keyStr);

        byte[] plainBytes = textTo16Bytes(plaintext);
        byte[] keyBytes   = textTo16Bytes(keyStr);

        // Generate round keys
        int[][][] roundKeys = keyExpansion(keyBytes);

        // Encrypt
        byte[] cipherBytes = encryptWithDetails(plainBytes, roundKeys);

        System.out.println("\n========================================");
        System.out.println("           ENCRYPTION RESULT            ");
        System.out.println("========================================");
        System.out.println("Plaintext  (text) : " + plaintext);
        System.out.println("Plaintext  (hex)  : " + bytesToHex(plainBytes));
        System.out.println("Key        (text) : " + keyStr);
        System.out.println("Key        (hex)  : " + bytesToHex(keyBytes));
        System.out.println("----------------------------------------");
        System.out.println("Ciphertext (hex)  : " + bytesToHex(cipherBytes));

        // Decrypt
        byte[] decryptedBytes = decryptWithDetails(cipherBytes, roundKeys);
        String decryptedText = new String(decryptedBytes).trim();

        System.out.println("\n========================================");
        System.out.println("           DECRYPTION RESULT            ");
        System.out.println("========================================");
        System.out.println("Ciphertext (hex)  : " + bytesToHex(cipherBytes));
        System.out.println("Key        (text) : " + keyStr);
        System.out.println("----------------------------------------");
        System.out.println("Decrypted  (hex)  : " + bytesToHex(decryptedBytes));
        System.out.println("Decrypted  (text) : " + decryptedText);
        System.out.println("Match             : " + (Arrays.equals(plainBytes, decryptedBytes)
                            ? "YES - Decryption Successful!" : "NO - Mismatch!"));
        System.out.println("========================================");

        scanner.close();
    }
}


































// import java.util.Arrays;
// import java.util.Scanner;

// public class AES {

//     // AES S-Box
//     static final int[] SBOX = {
//         0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
//         0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
//         0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
//         0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
//         0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
//         0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
//         0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
//         0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
//         0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
//         0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
//         0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
//         0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
//         0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
//         0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
//         0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
//         0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
//     };

//     // AES Inverse S-Box
//     static final int[] INV_SBOX = {
//         0x52, 0x09, 0x6a, 0xd5, 0x30, 0x36, 0xa5, 0x38, 0xbf, 0x40, 0xa3, 0x9e, 0x81, 0xf3, 0xd7, 0xfb,
//         0x7c, 0xe3, 0x39, 0x82, 0x9b, 0x2f, 0xff, 0x87, 0x34, 0x8e, 0x43, 0x44, 0xc4, 0xde, 0xe9, 0xcb,
//         0x54, 0x7b, 0x94, 0x32, 0xa6, 0xc2, 0x23, 0x3d, 0xee, 0x4c, 0x95, 0x0b, 0x42, 0xfa, 0xc3, 0x4e,
//         0x08, 0x2e, 0xa1, 0x66, 0x28, 0xd9, 0x24, 0xb2, 0x76, 0x5b, 0xa2, 0x49, 0x6d, 0x8b, 0xd1, 0x25,
//         0x72, 0xf8, 0xf6, 0x64, 0x86, 0x68, 0x98, 0x16, 0xd4, 0xa4, 0x5c, 0xcc, 0x5d, 0x65, 0xb6, 0x92,
//         0x6c, 0x70, 0x48, 0x50, 0xfd, 0xed, 0xb9, 0xda, 0x5e, 0x15, 0x46, 0x57, 0xa7, 0x8d, 0x9d, 0x84,
//         0x90, 0xd8, 0xab, 0x00, 0x8c, 0xbc, 0xd3, 0x0a, 0xf7, 0xe4, 0x58, 0x05, 0xb8, 0xb3, 0x45, 0x06,
//         0xd0, 0x2c, 0x1e, 0x8f, 0xca, 0x3f, 0x0f, 0x02, 0xc1, 0xaf, 0xbd, 0x03, 0x01, 0x13, 0x8a, 0x6b,
//         0x3a, 0x91, 0x11, 0x41, 0x4f, 0x67, 0xdc, 0xea, 0x97, 0xf2, 0xcf, 0xce, 0xf0, 0xb4, 0xe6, 0x73,
//         0x96, 0xac, 0x74, 0x22, 0xe7, 0xad, 0x35, 0x85, 0xe2, 0xf9, 0x37, 0xe8, 0x1c, 0x75, 0xdf, 0x6e,
//         0x47, 0xf1, 0x1a, 0x71, 0x1d, 0x29, 0xc5, 0x89, 0x6f, 0xb7, 0x62, 0x0e, 0xaa, 0x18, 0xbe, 0x1b,
//         0xfc, 0x56, 0x3e, 0x4b, 0xc6, 0xd2, 0x79, 0x20, 0x9a, 0xdb, 0xc0, 0xfe, 0x78, 0xcd, 0x5a, 0xf4,
//         0x1f, 0xdd, 0xa8, 0x33, 0x88, 0x07, 0xc7, 0x31, 0xb1, 0x12, 0x10, 0x59, 0x27, 0x80, 0xec, 0x5f,
//         0x60, 0x51, 0x7f, 0xa9, 0x19, 0xb5, 0x4a, 0x0d, 0x2d, 0xe5, 0x7a, 0x9f, 0x93, 0xc9, 0x9c, 0xef,
//         0xa0, 0xe0, 0x3b, 0x4d, 0xae, 0x2a, 0xf5, 0xb0, 0xc8, 0xeb, 0xbb, 0x3c, 0x83, 0x53, 0x99, 0x61,
//         0x17, 0x2b, 0x04, 0x7e, 0xba, 0x77, 0xd6, 0x26, 0xe1, 0x69, 0x14, 0x63, 0x55, 0x21, 0x0c, 0x7d
//     };

//     // Round Constants
//     static final int[] RCON = {
//         0x00, 0x01, 0x02, 0x04, 0x08, 0x10,
//         0x20, 0x40, 0x80, 0x1b, 0x36
//     };

//     static String bytesToHex(byte[] bytes) {
//         StringBuilder sb = new StringBuilder();

//         for (byte b : bytes) {
//             sb.append(String.format("%02X", b));
//         }

//         return sb.toString();
//     }

//     static byte[] textTo16Bytes(String text) {
//         byte[] bytes = new byte[16];
//         byte[] textBytes = text.getBytes();

//         for (int i = 0; i < 16; i++) {
//             bytes[i] = (i < textBytes.length)
//                     ? textBytes[i]
//                     : (byte) 0x20;
//         }

//         return bytes;
//     }

//     // AES-128 Key Expansion
//     static int[][][] keyExpansion(byte[] key) {

//         int[][] w = new int[44][4];

//         for (int i = 0; i < 4; i++) {
//             w[i][0] = key[4 * i] & 0xFF;
//             w[i][1] = key[4 * i + 1] & 0xFF;
//             w[i][2] = key[4 * i + 2] & 0xFF;
//             w[i][3] = key[4 * i + 3] & 0xFF;
//         }

//         for (int i = 4; i < 44; i++) {

//             int[] temp = Arrays.copyOf(w[i - 1], 4);

//             if (i % 4 == 0) {

//                 // RotWord
//                 int t = temp[0];
//                 temp[0] = temp[1];
//                 temp[1] = temp[2];
//                 temp[2] = temp[3];
//                 temp[3] = t;

//                 // SubWord
//                 for (int j = 0; j < 4; j++) {
//                     temp[j] = SBOX[temp[j]];
//                 }

//                 // Rcon
//                 temp[0] ^= RCON[i / 4];
//             }

//             for (int j = 0; j < 4; j++) {
//                 w[i][j] = w[i - 4][j] ^ temp[j];
//             }
//         }

//         int[][][] roundKeys = new int[11][4][4];

//         for (int round = 0; round < 11; round++) {
//             for (int c = 0; c < 4; c++) {
//                 for (int r = 0; r < 4; r++) {
//                     roundKeys[round][r][c] = w[round * 4 + c][r];
//                 }
//             }
//         }

//         return roundKeys;
//     }

//     static void addRoundKey(int[][] state, int[][] roundKey) {
//         for (int r = 0; r < 4; r++) {
//             for (int c = 0; c < 4; c++) {
//                 state[r][c] ^= roundKey[r][c];
//             }
//         }
//     }

//     static void subBytes(int[][] state) {
//         for (int r = 0; r < 4; r++) {
//             for (int c = 0; c < 4; c++) {
//                 state[r][c] = SBOX[state[r][c]];
//             }
//         }
//     }

//     static void invSubBytes(int[][] state) {
//         for (int r = 0; r < 4; r++) {
//             for (int c = 0; c < 4; c++) {
//                 state[r][c] = INV_SBOX[state[r][c]];
//             }
//         }
//     }

//     static void shiftRows(int[][] state) {
//         for (int r = 1; r < 4; r++) {
//             int[] temp = new int[4];

//             for (int c = 0; c < 4; c++) {
//                 temp[c] = state[r][(c + r) % 4];
//             }

//             state[r] = temp;
//         }
//     }

//     static void invShiftRows(int[][] state) {
//         for (int r = 1; r < 4; r++) {
//             int[] temp = new int[4];

//             for (int c = 0; c < 4; c++) {
//                 temp[c] = state[r][(c - r + 4) % 4];
//             }

//             state[r] = temp;
//         }
//     }

//     static int gmul(int a, int b) {
//         int p = 0;

//         for (int i = 0; i < 8; i++) {

//             if ((b & 1) != 0) {
//                 p ^= a;
//             }

//             boolean hiBitSet = (a & 0x80) != 0;

//             a = (a << 1) & 0xFF;

//             if (hiBitSet) {
//                 a ^= 0x1b;
//             }

//             b >>= 1;
//         }

//         return p;
//     }

//     static void mixColumns(int[][] state) {

//         for (int c = 0; c < 4; c++) {

//             int a0 = state[0][c];
//             int a1 = state[1][c];
//             int a2 = state[2][c];
//             int a3 = state[3][c];

//             state[0][c] =
//                     gmul(a0, 2) ^ gmul(a1, 3) ^ a2 ^ a3;

//             state[1][c] =
//                     a0 ^ gmul(a1, 2) ^ gmul(a2, 3) ^ a3;

//             state[2][c] =
//                     a0 ^ a1 ^ gmul(a2, 2) ^ gmul(a3, 3);

//             state[3][c] =
//                     gmul(a0, 3) ^ a1 ^ a2 ^ gmul(a3, 2);
//         }
//     }

//     static void invMixColumns(int[][] state) {

//         for (int c = 0; c < 4; c++) {

//             int a0 = state[0][c];
//             int a1 = state[1][c];
//             int a2 = state[2][c];
//             int a3 = state[3][c];

//             state[0][c] =
//                     gmul(a0, 0x0e) ^
//                     gmul(a1, 0x0b) ^
//                     gmul(a2, 0x0d) ^
//                     gmul(a3, 0x09);

//             state[1][c] =
//                     gmul(a0, 0x09) ^
//                     gmul(a1, 0x0e) ^
//                     gmul(a2, 0x0b) ^
//                     gmul(a3, 0x0d);

//             state[2][c] =
//                     gmul(a0, 0x0d) ^
//                     gmul(a1, 0x09) ^
//                     gmul(a2, 0x0e) ^
//                     gmul(a3, 0x0b);

//             state[3][c] =
//                     gmul(a0, 0x0b) ^
//                     gmul(a1, 0x0d) ^
//                     gmul(a2, 0x09) ^
//                     gmul(a3, 0x0e);
//         }
//     }

//     // AES Encryption
//     static byte[] encrypt(byte[] input, int[][][] roundKeys) {

//         int[][] state = new int[4][4];

//         for (int i = 0; i < 16; i++) {
//             state[i % 4][i / 4] = input[i] & 0xFF;
//         }

//         // Initial AddRoundKey
//         addRoundKey(state, roundKeys[0]);

//         // 10 AES-128 rounds
//         for (int round = 1; round <= 10; round++) {

//             subBytes(state);
//             shiftRows(state);

//             // MixColumns is skipped in final round
//             if (round < 10) {
//                 mixColumns(state);
//             }

//             addRoundKey(state, roundKeys[round]);
//         }

//         byte[] output = new byte[16];

//         for (int i = 0; i < 16; i++) {
//             output[i] = (byte) state[i % 4][i / 4];
//         }

//         return output;
//     }

//     // AES Decryption
//     static byte[] decrypt(byte[] input, int[][][] roundKeys) {

//         int[][] state = new int[4][4];

//         for (int i = 0; i < 16; i++) {
//             state[i % 4][i / 4] = input[i] & 0xFF;
//         }

//         // Initial AddRoundKey
//         addRoundKey(state, roundKeys[10]);

//         // Reverse rounds
//         for (int round = 9; round >= 0; round--) {

//             invShiftRows(state);
//             invSubBytes(state);

//             addRoundKey(state, roundKeys[round]);

//             if (round > 0) {
//                 invMixColumns(state);
//             }
//         }

//         byte[] output = new byte[16];

//         for (int i = 0; i < 16; i++) {
//             output[i] = (byte) state[i % 4][i / 4];
//         }

//         return output;
//     }

//     public static void main(String[] args) {

//         Scanner scanner = new Scanner(System.in);

//         System.out.print("Enter plaintext (max 16 characters): ");
//         String plaintext = scanner.nextLine();

//         System.out.print("Enter key (max 16 characters): ");
//         String key = scanner.nextLine();

//         byte[] plainBytes = textTo16Bytes(plaintext);
//         byte[] keyBytes = textTo16Bytes(key);

//         // Generate round keys
//         int[][][] roundKeys = keyExpansion(keyBytes);

//         // Encryption
//         byte[] cipherBytes = encrypt(plainBytes, roundKeys);

//         // Decryption
//         byte[] decryptedBytes = decrypt(cipherBytes, roundKeys);

//         String decryptedText = new String(decryptedBytes).trim();

//         // Final results only
//         System.out.println("\nCiphertext : " + bytesToHex(cipherBytes));
//         System.out.println("Decrypted  : " + decryptedText);
//         System.out.println("Match      : " +
//                 (Arrays.equals(plainBytes, decryptedBytes) ? "YES" : "NO"));

//         scanner.close();
//     }
// }