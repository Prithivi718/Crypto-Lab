import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Scanner;

public class DSA {

    static BigInteger y, r, s;

    // SHA-256 Hash
    static BigInteger hashMessage(String message) throws Exception {

        MessageDigest md = MessageDigest.getInstance("SHA-256");

        byte[] hash = md.digest(
                message.getBytes(StandardCharsets.UTF_8));

        return new BigInteger(1, hash);
    }

    public static void main(String[] args) throws Exception {

        Scanner sc = new Scanner(System.in);
        SecureRandom random = new SecureRandom();

        System.out.println("========== DSA DIGITAL SIGNATURE ==========");

        // ------------------------------------------
        // 1. DSA Parameters
        // ------------------------------------------

        System.out.print("Enter p: ");
        BigInteger p = sc.nextBigInteger();

        System.out.print("Enter q: ");
        BigInteger q = sc.nextBigInteger();

        System.out.print("Enter g: ");
        BigInteger g = sc.nextBigInteger();

        
        System.out.println("\n--- DSA Parameters ---");
        System.out.println("p = " + p);
        System.out.println("q = " + q);
        System.out.println("g = " + g);
        
        // ------------------------------------------
        // 2. Private Key
        // ------------------------------------------
        
        System.out.print("Enter private key x: ");
        BigInteger x = sc.nextBigInteger();


        System.out.println("\n--- Key Generation ---");
        System.out.println("Private Key (x) = " + x);

        // Public Key
        y = g.modPow(x, p);

        System.out.println("Public Key (y)  = g^x mod p");
        System.out.println("y = " + y);

        // ------------------------------------------
        // 3. Message
        // ------------------------------------------

        System.out.print("\nEnter Message: ");
        String message = sc.nextLine();

        System.out.println("\n--- Message ---");
        System.out.println("Message = " + message);

        // ------------------------------------------
        // 4. SHA-256 Hash
        // ------------------------------------------

        BigInteger H = hashMessage(message);

        System.out.println("\n--- SHA-256 Hash ---");
        System.out.println("H = " + H.toString(16));

        // ------------------------------------------
        // 5. Signature Generation
        // ------------------------------------------

        // Choose random k
        BigInteger k;

        do {
            k = new BigInteger(q.bitLength(), random);
        } while (k.compareTo(BigInteger.ONE) <= 0 ||
                k.compareTo(q) >= 0);

        System.out.println("\n--- Signature Generation ---");
        System.out.println("Random k = " + k);

        // r = (g^k mod p) mod q
        r = g.modPow(k, p).mod(q);

        System.out.println("r = (g^k mod p) mod q");
        System.out.println("r = " + r);

        // k inverse mod q
        BigInteger kInverse = k.modInverse(q);

        System.out.println("k^-1 mod q = " + kInverse);

        // s = k^-1(H + xr) mod q
        s = kInverse
                .multiply(H.add(x.multiply(r)))
                .mod(q);

        System.out.println("s = k^-1(H + xr) mod q");
        System.out.println("s = " + s);

        System.out.println("\nDigital Signature = (" + r + ", " + s + ")");

        // ------------------------------------------
        // 6. Signature Verification
        // ------------------------------------------

        System.out.println("\n--- Signature Verification ---");

        // w = s^-1 mod q
        BigInteger w = s.modInverse(q);

        System.out.println("w = s^-1 mod q");
        System.out.println("w = " + w);

        // u1 = H*w mod q
        BigInteger u1 = H.multiply(w).mod(q);

        // u2 = r*w mod q
        BigInteger u2 = r.multiply(w).mod(q);

        System.out.println("u1 = H*w mod q");
        System.out.println("u1 = " + u1);

        System.out.println("u2 = r*w mod q");
        System.out.println("u2 = " + u2);

        // v = ((g^u1 * y^u2) mod p) mod q
        BigInteger gu1 = g.modPow(u1, p);
        BigInteger yu2 = y.modPow(u2, p);

        BigInteger v = gu1
                .multiply(yu2)
                .mod(p)
                .mod(q);

        System.out.println("v = ((g^u1 * y^u2) mod p) mod q");
        System.out.println("v = " + v);

        // ------------------------------------------
        // 7. Final Verification
        // ------------------------------------------

        System.out.println("\n--- Result ---");

        if (v.equals(r)) {
            System.out.println("v = r");
            System.out.println("Signature is VALID.");
        } else {
            System.out.println("v != r");
            System.out.println("Signature is INVALID.");
        }

        sc.close();
    }
}