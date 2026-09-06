import crypto from "node:crypto";

import {
    encryptAESGCM,
    decryptAESGCM
} from "../crypto/aesGcm.js";

const MESSAGE = "Top Secret Message from BASE-A";

const sessionKey = crypto.randomBytes(32);

console.log("\n========================================");
console.log(" AES-256-GCM ENCRYPTION TEST");
console.log("========================================\n");

try {
    // -----------------------------------------
    // 1. Encrypt
    // -----------------------------------------

    console.log("Original Message:");
    console.log(MESSAGE);

    console.log("\nGenerating 256-bit session key...");
    console.log("Session Key Length:", sessionKey.length, "bytes");

    const encrypted = encryptAESGCM(
        MESSAGE,
        sessionKey
    );

    console.log("\n--- ENCRYPTION RESULT ---");

    console.log("Ciphertext:");
    console.log(encrypted.ciphertext.toString("hex"));

    console.log("\nIV / Nonce:");
    console.log(encrypted.iv.toString("hex"));

    console.log("\nAuthentication Tag:");
    console.log(encrypted.authTag.toString("hex"));

    // -----------------------------------------
    // 2. Decrypt
    // -----------------------------------------

    const decrypted = decryptAESGCM(
        encrypted.ciphertext,
        sessionKey,
        encrypted.iv,
        encrypted.authTag
    );

    console.log("\n--- DECRYPTION RESULT ---");

    if (!decrypted.success) {
        throw new Error(
            `Decryption failed: ${decrypted.error}`
        );
    }

    console.log("Decrypted Message:");
    console.log(decrypted.plaintext);

    // -----------------------------------------
    // 3. Verify
    // -----------------------------------------

    console.log("\n--- VERIFICATION ---");

    if (decrypted.plaintext === MESSAGE) {
        console.log("✅ AES-256-GCM TEST PASSED");
        console.log("Original and decrypted messages match.");
    } else {
        console.log("❌ AES-256-GCM TEST FAILED");
        console.log("Messages do not match.");
    }

} catch (error) {

    console.error("\n❌ TEST FAILED");
    console.error(error.message);
}