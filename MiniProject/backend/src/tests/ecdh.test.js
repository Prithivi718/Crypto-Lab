import {
    generateECDHKeyPair,
    getPublicKey,
    getPrivateKey,
    computeSharedSecret
} from "../crypto/ecdh.js";


const main = () => {

    console.log("======================================");
    console.log("        ECDH KEY EXCHANGE TEST");
    console.log("======================================");


    // =====================================
    // BASE A
    // =====================================

    console.log("\n[1] BASE A - Generating ECDH keys...");

    const baseA = generateECDHKeyPair();

    const baseAPublicKey = getPublicKey(baseA);
    const baseAPrivateKey = getPrivateKey(baseA);

    console.log("Base A Public Key:");
    console.log(baseAPublicKey.toString("hex"));

    console.log("\nBase A Private Key:");
    console.log(baseAPrivateKey.toString("hex"));


    // =====================================
    // BASE B
    // =====================================

    console.log("\n[2] BASE B - Generating ECDH keys...");

    const baseB = generateECDHKeyPair();

    const baseBPublicKey = getPublicKey(baseB);
    const baseBPrivateKey = getPrivateKey(baseB);

    console.log("Base B Public Key:");
    console.log(baseBPublicKey.toString("hex"));

    console.log("\nBase B Private Key:");
    console.log(baseBPrivateKey.toString("hex"));


    // =====================================
    // PUBLIC KEY EXCHANGE
    // =====================================

    console.log("\n[3] Exchanging public keys...");

    console.log("Base A → Base B: Public Key A");
    console.log("Base B → Base A: Public Key B");


    // =====================================
    // BASE A COMPUTES SECRET
    // =====================================

    console.log("\n[4] Base A computing shared secret...");

    const baseASharedSecret = computeSharedSecret(
        baseA,
        baseBPublicKey
    );

    console.log("Base A Shared Secret:");
    console.log(baseASharedSecret.toString("hex"));


    // =====================================
    // BASE B COMPUTES SECRET
    // =====================================

    console.log("\n[5] Base B computing shared secret...");

    const baseBSharedSecret = computeSharedSecret(
        baseB,
        baseAPublicKey
    );

    console.log("Base B Shared Secret:");
    console.log(baseBSharedSecret.toString("hex"));


    // =====================================
    // VERIFY
    // =====================================

    console.log("\n[6] Verifying shared secrets...");

    const secretsMatch = baseASharedSecret.equals(
        baseBSharedSecret
    );

    console.log("Do secrets match?:", secretsMatch);


    // =====================================
    // RESULT
    // =====================================

    console.log("\n======================================");
    console.log("              RESULT");
    console.log("======================================");

    if (secretsMatch) {

        console.log("✓ ECDH KEY EXCHANGE SUCCESSFUL");
        console.log("✓ Base A and Base B have the same shared secret");

    } else {

        console.log("✗ ECDH KEY EXCHANGE FAILED");

    }
};


main();