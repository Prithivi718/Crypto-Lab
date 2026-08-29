import java.math.BigInteger;
import java.security.SecureRandom;
import java.util.Scanner;

public class DiffieHellman {

    private static final SecureRandom random = new SecureRandom();

    // Generate a random secret key in the range [2, q-2]
    private static BigInteger generateSecret(BigInteger q) {
        BigInteger lower = BigInteger.valueOf(2);
        BigInteger upper = q.subtract(BigInteger.valueOf(2));

        if (upper.compareTo(lower) < 0) {
            throw new IllegalArgumentException("q is too small. Use a larger prime number.");
        }

        // BigInteger range = upper.subtract(lower).add(BigInteger.ONE);
        BigInteger secret;

        do {
            secret = new BigInteger(q.bitLength(), random);
        } while (secret.compareTo(lower) < 0 || secret.compareTo(upper) > 0);

        return secret;
    }

    // Visual separator
    private static void line() {
        System.out.println("------------------------------------------------------------");
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.println("============================================================");
        System.out.println("            DIFFIE-HELLMAN KEY EXCHANGE DEMO");
        System.out.println("============================================================");

        System.out.print("Enter prime q: ");
        BigInteger q = sc.nextBigInteger();

        System.out.print("Enter primitive root / alpha: ");
        BigInteger alpha = sc.nextBigInteger();

        // Basic validation
        if (!q.isProbablePrime(20)) {
            System.out.println("\nError: q must be a prime number.");
            sc.close();
            return;
        }

        if (alpha.compareTo(BigInteger.valueOf(2)) < 0 || alpha.compareTo(q.subtract(BigInteger.ONE)) > 0) {
            System.out.println("\nError: alpha must be in the range 2 to q-1.");
            sc.close();
            return;
        }

        line();
        System.out.println("Given values:");
        System.out.println("q     = " + q);
        System.out.println("alpha = " + alpha);
        line();

        // Random private keys
        BigInteger xA = generateSecret(q);
        BigInteger xB = generateSecret(q);

        System.out.println("Step 1: Generate private (secret) keys");
        System.out.println("xA = " + xA + "   (secret key of A)");
        System.out.println("xB = " + xB + "   (secret key of B)");
        line();

        // Public keys
        BigInteger yA = alpha.modPow(xA, q);
        BigInteger yB = alpha.modPow(xB, q);

        System.out.println("Step 2: Compute public keys");
        System.out.println("yA = alpha^xA mod q = " + alpha + "^" + xA + " mod " + q + " = " + yA);
        System.out.println("yB = alpha^xB mod q = " + alpha + "^" + xB + " mod " + q + " = " + yB);
        line();

        // Exchange visualization
        System.out.println("Step 3: Public key exchange");
        System.out.println("A  ----  yA = " + yA + "  ---->  B");
        System.out.println("A  <---  yB = " + yB + "  ----  B");
        line();

        // Shared secret keys
        BigInteger kA = yB.modPow(xA, q);
        BigInteger kB = yA.modPow(xB, q);

        System.out.println("Step 4: Compute shared secret key");
        System.out.println("K_A = yB^xA mod q = " + yB + "^" + xA + " mod " + q + " = " + kA);
        System.out.println("K_B = yA^xB mod q = " + yA + "^" + xB + " mod " + q + " = " + kB);
        line();

        System.out.println("Step 5: Verification");
        if (kA.equals(kB)) {
            System.out.println("K_A = K_B");
            System.out.println("Shared secret key established successfully!");
            System.out.println("Shared Key = " + kA);
        } else {
            System.out.println("Mismatch in shared keys!");
            System.out.println("K_A = " + kA);
            System.out.println("K_B = " + kB);
        }
        line();

        // Compact formula view
        System.out.println("Summary:");
        System.out.println("Public parameters: q = " + q + ", alpha = " + alpha);
        System.out.println("Private keys: xA = " + xA + ", xB = " + xB);
        System.out.println("Public keys:  yA = " + yA + ", yB = " + yB);
        System.out.println("Shared key:   " + kA);

        System.out.println("\nDiffie-Hellman key exchange completed.");
        sc.close();
    }
}