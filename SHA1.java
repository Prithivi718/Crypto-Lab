import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public class SHA1 {

    // SHA-1 initial hash values
    static final int H0_INIT = 0x67452301;
    static final int H1_INIT = 0xEFCDAB89;
    static final int H2_INIT = 0x98BADCFE;
    static final int H3_INIT = 0x10325476;
    static final int H4_INIT = 0xC3D2E1F0;

    // Left rotate
    static int leftRotate(int value, int bits) {
        return (value << bits) | (value >>> (32 - bits));
    }

    // Convert bytes to hexadecimal
    static String toHex(byte[] data) {
        StringBuilder sb = new StringBuilder();

        for (byte b : data) {
            sb.append(String.format("%02x", b & 0xff));
        }

        return sb.toString();
    }

    // Convert integer to 4-byte big-endian array
    static void putInt(byte[] data, int index, int value) {
        data[index]     = (byte) (value >>> 24);
        data[index + 1] = (byte) (value >>> 16);
        data[index + 2] = (byte) (value >>> 8);
        data[index + 3] = (byte) value;
    }

    // Convert 4 bytes to integer
    static int getInt(byte[] data, int index) {
        return ((data[index] & 0xff) << 24)
             | ((data[index + 1] & 0xff) << 16)
             | ((data[index + 2] & 0xff) << 8)
             | (data[index + 3] & 0xff);
    }

    // ==============================
    // SHA-1
    // ==============================
    static String sha1(String message) {

        byte[] messageBytes =
                message.getBytes(StandardCharsets.UTF_8);

        long originalBitLength = (long) messageBytes.length * 8;

        System.out.println("\n========== SHA-1 ==========");

        System.out.println("Original Message : " + message);
        System.out.println("Message Length   : " +
                messageBytes.length + " bytes");
        System.out.println("Message Length   : " +
                originalBitLength + " bits");

        // ==========================================
        // 1. PADDING
        // ==========================================

        int paddedLength =
                ((messageBytes.length + 9 + 63) / 64) * 64;

        byte[] paddedMessage = new byte[paddedLength];

        // Copy original message
        System.arraycopy(
                messageBytes,
                0,
                paddedMessage,
                0,
                messageBytes.length
        );

        // Append 1 bit followed by zeros
        paddedMessage[messageBytes.length] = (byte) 0x80;

        // Append original length in last 8 bytes
        for (int i = 0; i < 8; i++) {
            paddedMessage[paddedLength - 1 - i] =
                    (byte) (originalBitLength >>> (8 * i));
        }

        System.out.println("\n--- Padding ---");
        System.out.println("Padded Length   : "
                + paddedLength + " bytes");

        System.out.println("Number of Blocks: "
                + (paddedLength / 64));

        // ==========================================
        // 2. INITIAL HASH VALUES
        // ==========================================

        int H0 = H0_INIT;
        int H1 = H1_INIT;
        int H2 = H2_INIT;
        int H3 = H3_INIT;
        int H4 = H4_INIT;

        System.out.println("\n--- Initial Hash Values ---");
        System.out.printf("H0 = %08X%n", H0);
        System.out.printf("H1 = %08X%n", H1);
        System.out.printf("H2 = %08X%n", H2);
        System.out.printf("H3 = %08X%n", H3);
        System.out.printf("H4 = %08X%n", H4);

        // ==========================================
        // 3. PROCESS EACH 512-BIT BLOCK
        // ==========================================

        for (int block = 0; block < paddedLength; block += 64) {

            System.out.println("\n================================");
            System.out.println("Processing 512-bit Block "
                    + ((block / 64) + 1));
            System.out.println("================================");

            int[] W = new int[80];

            // --------------------------------------
            // W[0] to W[15]
            // --------------------------------------

            for (int t = 0; t < 16; t++) {
                W[t] = getInt(paddedMessage, block + t * 4);
            }

            System.out.println("\nW[0] to W[15]:");

            for (int t = 0; t < 16; t++) {
                System.out.printf(
                        "W[%02d] = %08X%n",
                        t,
                        W[t]
                );
            }

            // --------------------------------------
            // W[16] to W[79]
            // --------------------------------------

            for (int t = 16; t < 80; t++) {

                W[t] = leftRotate(
                        W[t - 3]
                        ^ W[t - 8]
                        ^ W[t - 14]
                        ^ W[t - 16],
                        1
                );
            }

            System.out.println("\nW[16] to W[79] generated using:");
            System.out.println(
                    "W[t] = ROTL1(W[t-3] ^ W[t-8] ^ W[t-14] ^ W[t-16])"
            );

            // ==========================================
            // 4. INITIALIZE A, B, C, D, E
            // ==========================================

            int A = H0;
            int B = H1;
            int C = H2;
            int D = H3;
            int E = H4;

            System.out.println("\nInitial Working Variables:");

            System.out.printf("A = %08X%n", A);
            System.out.printf("B = %08X%n", B);
            System.out.printf("C = %08X%n", C);
            System.out.printf("D = %08X%n", D);
            System.out.printf("E = %08X%n", E);

            // ==========================================
            // 5. 80 ROUNDS
            // ==========================================

            for (int t = 0; t < 80; t++) {

                int f;
                int K;

                // Round 0 - 19
                if (t <= 19) {

                    f = (B & C) | ((~B) & D);
                    K = 0x5A827999;

                }

                // Round 20 - 39
                else if (t <= 39) {

                    f = B ^ C ^ D;
                    K = 0x6ED9EBA1;

                }

                // Round 40 - 59
                else if (t <= 59) {

                    f = (B & C) | (B & D) | (C & D);
                    K = 0x8F1BBCDC;

                }

                // Round 60 - 79
                else {

                    f = B ^ C ^ D;
                    K = 0xCA62C1D6;
                }

                int TEMP =
                        leftRotate(A, 5)
                        + f
                        + E
                        + K
                        + W[t];

                // Shift variables
                E = D;
                D = C;
                C = leftRotate(B, 30);
                B = A;
                A = TEMP;

                /*
                 * Print only selected rounds to keep output readable.
                 * Prints beginning of every stage and final round.
                 */
                if (t == 0 || t == 19 ||
                    t == 20 || t == 39 ||
                    t == 40 || t == 59 ||
                    t == 60 || t == 79) {

                    System.out.printf(
                            "\nRound %02d%n", t
                    );

                    System.out.printf(
                            "K = %08X%n", K
                    );

                    System.out.printf(
                            "A=%08X B=%08X C=%08X D=%08X E=%08X%n",
                            A, B, C, D, E
                    );
                }
            }

            // ==========================================
            // 6. FINAL ADDITION
            // ==========================================

            H0 += A;
            H1 += B;
            H2 += C;
            H3 += D;
            H4 += E;

            System.out.println("\n--- Hash Value After Block ---");

            System.out.printf("H0 = %08X%n", H0);
            System.out.printf("H1 = %08X%n", H1);
            System.out.printf("H2 = %08X%n", H2);
            System.out.printf("H3 = %08X%n", H3);
            System.out.printf("H4 = %08X%n", H4);
        }

        // ==========================================
        // 7. FINAL 160-BIT DIGEST
        // ==========================================

        byte[] digest = new byte[20];

        putInt(digest, 0, H0);
        putInt(digest, 4, H1);
        putInt(digest, 8, H2);
        putInt(digest, 12, H3);
        putInt(digest, 16, H4);

        return toHex(digest);
    }

    // ==========================================
    // MAIN
    // ==========================================

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        System.out.print("Enter Text: ");
        String message = sc.nextLine();

        String digest = sha1(message);

        System.out.println("\n==============================");
        System.out.println("      SHA-1 MESSAGE DIGEST");
        System.out.println("==============================");
        System.out.println("Text   : " + message);
        System.out.println("Digest : " + digest);

        sc.close();
    }
}