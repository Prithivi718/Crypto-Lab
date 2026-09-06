import { generateSessionKey } from "../crypto/hkdf.js";


// Sample ECDH shared secret
const sampleSharedSecret = new Uint8Array([
    0x10, 0x22, 0x34, 0x48,
    0x56, 0x6A, 0x7C, 0x8E,
    0x90, 0xAB, 0xCD, 0xEF,
    0x11, 0x23, 0x45, 0x67,
    0x89, 0x9A, 0xBC, 0xDE,
    0xF0, 0x12, 0x34, 0x56,
    0x78, 0x9A, 0xBC, 0xDE,
    0xF1, 0xE2, 0xD3, 0xC4
]);


const main = async () => {

    console.log("================================");
    console.log("       HKDF SESSION KEY TEST");
    console.log("================================");


    console.log("\nSample ECDH Shared Secret:");

    console.log(
        Buffer.from(sampleSharedSecret)
            .toString("hex")
    );


    const sessionKey =
        await generateSessionKey(
            sampleSharedSecret
        );


    console.log("\nDerived Session Key:");

    console.log(
        Buffer.from(sessionKey)
            .toString("hex")
    );


    console.log("\nSession Key Length:");

    console.log(
        sessionKey.length,
        "bytes"
    );


    console.log("\nSession Key Size:");

    console.log(
        sessionKey.length * 8,
        "bits"
    );


    console.log("\n================================");
    console.log("            RESULT");
    console.log("================================");

    if (sessionKey.length === 32) {
        console.log(
            "✓ Valid AES-256 session key generated"
        );
    } else {
        console.log(
            "✗ Invalid session key length"
        );
    }
};


main();