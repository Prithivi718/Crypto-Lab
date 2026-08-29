import java.util.*;

public class Main {

    public static void main(String[] args) {

        Scanner scr = new Scanner(System.in);
        System.out.println("Enter the secret message: ");

        String secret = scr.nextLine();
        // String secret = "HELLO WORLD";

        // CaesarCipher.demo(secret);

        // VigenereCipher.demo(secret);

        // PlayfairCipher.demo(secret);

        HillCipher.demo(secret);

        scr.close();

    }
}