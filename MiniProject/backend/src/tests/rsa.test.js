import {
    generateRSAKeyPair,
    exportKeys,
    encryptRSA,
    decryptRSA
} from "../crypto/rsa.js";


const main = async () => {

    console.log("======================================");
    console.log("          RSA-OAEP TEST");
    console.log("======================================");


    // =====================================
    // 1. GENERATE RSA KEY PAIR
    // =====================================

    console.log("\n[1] BASE B - Generating RSA key pair...");

    const keyPair = await generateRSAKeyPair();

    console.log("✓ RSA key pair generated");


    // =====================================
    // 2. EXPORT KEYS
    // =====================================

    console.log("\n[2] Exporting RSA keys...");

    const keys = await exportKeys(keyPair);

    console.log("✓ Public key exported");
    console.log("✓ Private key exported");


    // =====================================
    // 3. CREATE SAMPLE SESSION KEY
    // =====================================

    console.log("\n[3] Creating sample AES-256 session key...");

    const sessionKey = crypto.getRandomValues(
        new Uint8Array(32)
    );

    console.log("Original Session Key:");
    console.log(
        Buffer.from(sessionKey).toString("hex")
    );

    console.log("Session Key Length:", sessionKey.length, "bytes");


    // =====================================
    // 4. RSA-OAEP ENCRYPTION
    // =====================================

    console.log("\n[4] RSA-OAEP encrypting session key...");

    const encryptedSessionKey = await encryptRSA(
        sessionKey,
        keyPair.publicKey
    );

    console.log("✓ Session key encrypted");

    console.log(
        "Encrypted Session Key Length:",
        encryptedSessionKey.byteLength,
        "bytes"
    );


    // =====================================
    // 5. RSA-OAEP DECRYPTION
    // =====================================

    console.log("\n[5] RSA-OAEP decrypting session key...");

    const decryptedSessionKey = await decryptRSA(
        encryptedSessionKey,
        keyPair.privateKey
    );

    console.log("✓ Session key decrypted");


    // =====================================
    // 6. DISPLAY DECRYPTED KEY
    // =====================================

    console.log("\nDecrypted Session Key:");

    console.log(
        Buffer.from(decryptedSessionKey).toString("hex")
    );


    // =====================================
    // 7. VERIFY
    // =====================================

    console.log("\n[6] Comparing session keys...");

    const keysMatch = Buffer.from(sessionKey).equals(
        Buffer.from(decryptedSessionKey)
    );

    console.log("Do session keys match?:", keysMatch);


    // =====================================
    // RESULT
    // =====================================

    console.log("\n======================================");
    console.log("              RESULT");
    console.log("======================================");

    if (keysMatch) {

        console.log("✓ RSA-OAEP ENCRYPTION SUCCESSFUL");
        console.log("✓ RSA-OAEP DECRYPTION SUCCESSFUL");
        console.log("✓ Original session key recovered");

    } else {

        console.log("✗ RSA-OAEP TEST FAILED");

    }
};


main();