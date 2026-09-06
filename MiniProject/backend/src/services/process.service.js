import {
    encryptComplete,
    decryptComplete
} from "./crypto.service.js";


export const process_run = async (message) => {

    try {

        if (!message) {
            throw new Error("Message is required");
        }

        const encryptedData = await encryptComplete(message);

        if (!encryptedData?.success) {
            throw new Error("Encryption process failed");
        }

        const { encryption } = encryptedData;

        console.log("\n========================================");
        console.log(" ORIGINAL MESSAGE");
        console.log("========================================");
        console.log(message);

        console.log("\n========================================");
        console.log(" ENCRYPTED PACKET");
        console.log("========================================");
        console.log("Ciphertext :", encryption.ciphertext.toString("hex"));
        console.log("IV / Nonce :", encryption.iv.toString("hex"));
        console.log("Auth Tag   :", encryption.authTag.toString("hex"));

        const decryptedData = await decryptComplete(encryptedData);

        if (!decryptedData?.success) {
            throw new Error(
                `Decryption process failed: ${decryptedData?.error ?? "unknown error"}`
            );
        }

        console.log("\n========================================");
        console.log(" DECRYPTED MESSAGE");
        console.log("========================================");
        console.log(decryptedData.plaintext);

        const match = message === decryptedData.plaintext;
        console.log("\n" + (match ? "✅ Verification passed." : "❌ Verification failed.") + "\n");

        return {
            success: true,
            encryption: encryptedData,
            decryption: decryptedData
        };

    } catch (error) {

        console.error("\n❌ Process failed:", error.message);

        return {
            success: false,
            encryption: null,
            decryption: null,
            error: error.message
        };
    }
};


process_run("TOP SECRET: Mission Alpha — Deliver package at 0300 hrs.");