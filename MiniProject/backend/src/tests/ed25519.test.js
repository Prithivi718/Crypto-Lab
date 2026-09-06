import {
    generateEd25519KeyPair,
    exportKeys,
    signMessage,
    verifySignature
} from "../crypto/ed25519.js";


const main = async () => {

    console.log("=== Ed25519 Digital Signature Test ===");


    // --------------------------------
    // 1. Generate key pair
    // --------------------------------

    console.log("\n1. Generating Ed25519 key pair...");

    const keyPair = await generateEd25519KeyPair();

    console.log("✓ Key pair generated");


    // --------------------------------
    // 2. Export keys
    // --------------------------------

    console.log("\n2. Exporting keys...");

    const keys = await exportKeys(keyPair);

    console.log("Public Key:");
    console.log(keys.publicKey);

    console.log("\nPrivate Key (PKCS8):");
    console.log(keys.privateKey);

    
    // --------------------------------
    // 3. Create message
    // --------------------------------

    const message = "Hello, Ed25519!";

    console.log("\n3. Original message:");
    console.log(message);


    // --------------------------------
    // 4. Sign message
    // --------------------------------

    console.log("\n4. Signing message...");

    const signature = await signMessage(
        message,
        keyPair.privateKey
    );

    console.log("✓ Message signed");

    console.log("Signature:");
    console.log(
        Buffer.from(signature).toString("base64")
    );


    // --------------------------------
    // 5. Verify signature
    // --------------------------------

    console.log("\n5. Verifying signature...");

    const isValid = await verifySignature(
        message,
        signature,
        keyPair.publicKey
    );

    console.log("Signature valid:", isValid);


    // --------------------------------
    // 6. Tampering test
    // --------------------------------

    const modifiedMessage = "Hello, Defence!";

    console.log("\n6. Testing modified message...");
    console.log("Modified message:", modifiedMessage);

    const tamperedResult = await verifySignature(
        modifiedMessage,
        signature,
        keyPair.publicKey
    );

    console.log(
        "Signature valid after modification:",
        tamperedResult
    );
};


main();