import java.util.*;


class HillCipher {


    // Encrypt plaintext
    public static String encrypt(String text, int[][] key) {

        text = text.toUpperCase().replaceAll("[^A-Z]", "");

        // Make length even
        if (text.length() % 2 != 0) {
            text += "X";
        }

        StringBuilder cipher = new StringBuilder();

        for (int i = 0; i < text.length(); i += 2) {

            int p1 = text.charAt(i) - 'A';
            int p2 = text.charAt(i + 1) - 'A';

            // Matrix multiplication
            int c1 = (key[0][0] * p1 + key[0][1] * p2) % 26;
            int c2 = (key[1][0] * p1 + key[1][1] * p2) % 26;

            cipher.append((char) (c1 + 'A'));
            cipher.append((char) (c2 + 'A'));
        }

        return cipher.toString();
    }

    // Decrypt ciphertext
    public static String decrypt(String text, int[][] key) {

        // Calculate determinant 
	int det = (key[0][0] * key[1][1] - key[0][1] * key[1][0]) % 26; 
	if (det < 0) det += 26;
	// Find determinant inverse 
	int detInv = -1; 
	for (int i = 1; i < 26; i++) {
	   if ((det * i) % 26 == 1) { 
	      detInv = i; 
	      break; 
	   }
        } 

	System.out.println("Determinant Inverse = " + detInv);	

	if (detInv == -1) {
	  System.out.println("Key Matrix is not invertible!"); 
	  return ""; 
	} 

	// Build inverse matrix 
	int[][] inverseKey = new int[2][2];
	inverseKey[0][0] = (key[1][1] * detInv) % 26; 
	inverseKey[0][1] = (-key[0][1] * detInv + 26) % 26; 
	inverseKey[1][0] = (-key[1][0] * detInv + 26) % 26; 
	inverseKey[1][1] = (key[0][0] * detInv) % 26;

        StringBuilder plain = new StringBuilder();

        for (int i = 0; i < text.length(); i += 2) {

            int c1 = text.charAt(i) - 'A';
            int c2 = text.charAt(i + 1) - 'A';

            int p1 = (inverseKey[0][0] * c1 +
                    inverseKey[0][1] * c2) % 26;

            int p2 = (inverseKey[1][0] * c1 +
                    inverseKey[1][1] * c2) % 26;

            plain.append((char) (p1 + 'A'));
            plain.append((char) (p2 + 'A'));
        }

        return plain.toString();
    }

    // Demo function
    public static void demo(String secret) {

	Scanner sc = new Scanner(System.in); 
	int[][] key = new int[2][2];
	System.out.println("Enter 2x2 Key Matrix:"); 
	for (int i = 0; i < 2; i++) { 
	  for (int j = 0; j < 2; j++) { 
	    key[i][j] = sc.nextInt(); 
	  }
	}

        System.out.println("\n=== HILL CIPHER ===");

        String encrypted = encrypt(secret, key);

        System.out.println("Plain Text : " + secret);
        System.out.println("Cipher Text: " + encrypted);

        String decrypted = decrypt(encrypted, key);

        System.out.println("Decrypted  : " + decrypted);
    }
}