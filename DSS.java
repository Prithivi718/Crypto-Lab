import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.Base64;
import java.util.Scanner;

public class DSS {

    // Convert byte array to hexadecimal
    static String toHex(byte[] data) {
        StringBuilder hex = new StringBuilder();

        for (byte b : data) {
            hex.append(String.format("%02x", b & 0xff));
        }

        return hex.toString();
    }

    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);

        try {
            // ==========================================
            // 1. Key Generation
            // ==========================================

            System.out.println("========== DSA DIGITAL SIGNATURE ==========");

            KeyPairGenerator keyGen =
                    KeyPairGenerator.getInstance("DSA");

            keyGen.initialize(1024);

            KeyPair keyPair = keyGen.generateKeyPair();

            PrivateKey privateKey = keyPair.getPrivate();
            PublicKey publicKey = keyPair.getPublic();

            System.out.println("\n--- Key Generation ---");
            System.out.println("DSA Key Size : 1024 bits");
            System.out.println("Private Key  : Generated");
            System.out.println("Public Key   : Generated");


            // ==========================================
            // 2. Message
            // ==========================================

            System.out.print("\nEnter Message: ");
            String message = sc.nextLine();

            byte[] messageBytes =
                    message.getBytes(StandardCharsets.UTF_8);

            System.out.println("\n--- Message ---");
            System.out.println("Message      : " + message);


            // ==========================================
            // 3. SHA-256 Hash
            // ==========================================

            MessageDigest md =
                    MessageDigest.getInstance("SHA-256");

            byte[] digest = md.digest(messageBytes);

            System.out.println("\n--- SHA-256 Hash ---");
            System.out.println("Hash         : " + toHex(digest));


            // ==========================================
            // 4. Signature Generation
            // ==========================================

            Signature sign =
                    Signature.getInstance("SHA256withDSA");

            sign.initSign(privateKey);
            sign.update(messageBytes);

            byte[] signature = sign.sign();

            System.out.println("\n--- Signature Generation ---");
            System.out.println("Signature Generated : Yes");
            System.out.println("Signature (Base64)  : "
                    + Base64.getEncoder()
                           .encodeToString(signature));


            // ==========================================
            // 5. Signature Verification
            // ==========================================

            Signature verify =
                    Signature.getInstance("SHA256withDSA");

            verify.initVerify(publicKey);
            verify.update(messageBytes);

            boolean result = verify.verify(signature);

            System.out.println("\n--- Signature Verification ---");

            if (result) {
                System.out.println("Verification Result : VALID");
                System.out.println("Signature is valid.");
            } else {
                System.out.println("Verification Result : INVALID");
                System.out.println("Signature is invalid.");
            }


        } catch (Exception e) {

            System.out.println("Error: " + e.getMessage());

        } finally {

            sc.close();
        }
    }
}