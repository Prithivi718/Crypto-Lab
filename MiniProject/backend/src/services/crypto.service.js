// encryption.service.js

import {
    generateEd25519KeyPair,
    exportEd25519Keys,
    signMessage,
    verifySignature
} from "../crypto/ed25519.js";


import {
    generateECDHKeyPair,
    getPublicKey,
    computeSharedSecret
} from "../crypto/ecdh.js";


import {
    generateSessionKey
} from "../crypto/hkdf.js";


import {
    generateRSAKeyPair,
    exportRSAKeys,
    encryptRSA,
    decryptRSA
} from "../crypto/rsa.js";


import {
    encryptAESGCM,
    decryptAESGCM
} from "../crypto/aesGcm.js";


// ============================================================
// STEP 1 — ED25519
// ============================================================

// Generate Ed25519 keys
// Returns the raw CryptoKey objects (not exported bytes) so they
// can be passed directly to subtle.sign() / subtle.verify().
export const generateEdKeys = async () => {

    const edKeyPair = await generateEd25519KeyPair();

    return {
        edKeyPair,
        edPublicKey: edKeyPair.publicKey,
        edPrivateKey: edKeyPair.privateKey
    };
};


// Sign data using Ed25519
export const signEd25519 = async (signedData, edPrivateKey) => {

    if (!signedData) {
        throw new Error("Data to sign is required");
    }

    if (!edPrivateKey) {
        throw new Error("Ed25519 private key is required");
    }

    const signature = await signMessage(signedData, edPrivateKey);
    return signature;
};


// Verify Ed25519 signature
export const verifyEd25519 = async (signedData, signature, edPublicKey) => {

    if (!signedData) {
        throw new Error("Signed data is required");
    }

    if (!signature) {
        throw new Error("Signature is required");
    }

    if (!edPublicKey) {
        throw new Error("Ed25519 public key is required");
    }

    return await verifySignature(signedData, signature, edPublicKey);
};


// ============================================================
// STEP 2 — ECDH KEY EXCHANGE
// ============================================================

export const keyExchange = () => {
    // Base A
    const baseA = generateECDHKeyPair();

    const baseAPublicKey = getPublicKey(baseA);

    // Base B
    const baseB = generateECDHKeyPair();
    const baseBPublicKey = getPublicKey(baseB);

    // Base A computes shared secret
    const baseASharedSecret = computeSharedSecret(baseA, baseBPublicKey);

    // Base B computes shared secret
    const baseBSharedSecret = computeSharedSecret(baseB, baseAPublicKey);

    // Verify both shared secrets
    const sharedSecretsMatch = baseASharedSecret.equals(baseBSharedSecret);

    if (!sharedSecretsMatch) {
        throw new Error("Keys do not match");
    }

    return {
        baseA,
        baseB,
        baseAPublicKey,
        baseBPublicKey,
        baseASharedSecret,
        baseBSharedSecret,
        sharedSecretsMatch
    };
};


// ============================================================
// STEP 3 — HKDF SESSION KEY
// ============================================================

export const deriveSessionKey = async (sharedSecret) => {

    if (!sharedSecret) {
        throw new Error("Missing arguement is required");
    }

    const sessionKey = await generateSessionKey(sharedSecret);
    return sessionKey;
};


// ============================================================
// STEP 4 — RSA SESSION KEY PROTECTION
// ============================================================

// Generate receiver RSA keys
// Returns the raw CryptoKey objects (not exported bytes) so they
// can be passed directly to subtle.encrypt() / subtle.decrypt().
export const generateRSAKeys = async () => {

    const rsaKeyPair = await generateRSAKeyPair();

    return {
        rsaKeyPair,
        rsaPublicKey: rsaKeyPair.publicKey,
        rsaPrivateKey: rsaKeyPair.privateKey
    };
};


// Wrap session key using RSA public key
export const wrapSessionKey = async (sessionKey, rsaPublicKey) => {

    if (!sessionKey) {
        throw new Error("Missing Arguement is required");
    }
    if (!rsaPublicKey) {
        throw new Error("Missing Args is required");
    }

    const wrappedSessionKey = await encryptRSA(sessionKey, rsaPublicKey);
    return wrappedSessionKey;
};


// Unwrap session key using RSA private key
export const unwrapSessionKey = async (wrappedSessionKey, rsaPrivateKey) => {

    if (!wrappedSessionKey) {
        throw new Error("Missing Arguement is required");
    }

    if (!rsaPrivateKey) {
        throw new Error("Missing args is required");
    }

    const recoveredSessionKey = await decryptRSA(wrappedSessionKey, rsaPrivateKey);
    return recoveredSessionKey;
};

// ============================================================
// STEP 5 — AES-256-GCM ENCRYPTION
// ============================================================

export const encryptMessage = (message, sessionKey) => {

    if (!message) {
        throw new Error("Message is required");
    }

    if (!sessionKey) {
        throw new Error("Session key is required");
    }

    const encrypted = encryptAESGCM(message, sessionKey);
    return encrypted;
};


// ============================================================
// STEP 5 — AES-256-GCM DECRYPTION
// ============================================================

export const decryptMessage = (ciphertext, sessionKey, iv, authTag) => {

    if (!ciphertext) {
        throw new Error("Missing Argueemnt is required");
    }

    if (!sessionKey) {
        throw new Error("Missing key is required");
    }

    if (!iv) {
        throw new Error("IV is required");
    }

    if (!authTag) {
        throw new Error("Authentication tag is required");
    }

    return decryptAESGCM(
        ciphertext,
        sessionKey,
        iv,
        authTag
    );
};


// ============================================================
// CREATE DATA TO SIGN
// ============================================================

export const createSignedData = ({ senderId, ecdhPublicKey, wrappedSessionKey, ciphertext, iv, authTag }) => {

    return JSON.stringify({
        senderId,
        ecdhPublicKey,
        wrappedSessionKey,
        ciphertext,
        iv,
        authTag
    });
};


// ============================================================
// COMPLETE ENCRYPTION
// ============================================================

export const encryptComplete = async (
    message
) => {

    try {

        // ----------------------------------------------------
        // STEP 1 — Generate Ed25519 keys
        // ----------------------------------------------------

        const {
            edKeyPair,
            edPublicKey,
            edPrivateKey
        } = await generateEdKeys();


        // ----------------------------------------------------
        // STEP 2 — ECDH
        // ----------------------------------------------------

        const {
            baseA,
            baseB,
            baseAPublicKey,
            baseBPublicKey,
            baseASharedSecret,
            sharedSecretsMatch
        } = keyExchange();


        // ----------------------------------------------------
        // STEP 3 — HKDF
        // ----------------------------------------------------

        const sessionKey =
            await deriveSessionKey(
                baseASharedSecret
            );


        // ----------------------------------------------------
        // STEP 4 — RSA
        // ----------------------------------------------------

        const {
            rsaKeyPair,
            rsaPublicKey,
            rsaPrivateKey
        } = await generateRSAKeys();


        const wrappedSessionKey =
            await wrapSessionKey(
                sessionKey,
                rsaKeyPair.publicKey
            );


        // ----------------------------------------------------
        // STEP 5 — AES
        // ----------------------------------------------------

        const encrypted =
            encryptMessage(
                message,
                sessionKey
            );


        const {
            ciphertext,
            iv,
            authTag
        } = encrypted;


        // ----------------------------------------------------
        // STEP 6 — CREATE DATA TO SIGN
        // ----------------------------------------------------

        const signedData =
            createSignedData({
                senderId: "BASE-A",
                ecdhPublicKey: baseAPublicKey,
                wrappedSessionKey,
                ciphertext,
                iv,
                authTag
            });


        // ----------------------------------------------------
        // STEP 7 — ED25519 SIGNATURE
        // ----------------------------------------------------

        const signature =
            await signEd25519(signedData, edPrivateKey);


        // ----------------------------------------------------
        // FINAL ENCRYPTION RESULT
        // ----------------------------------------------------

        return {

            success: true,
            authentication: {
                edPublicKey,
                signature
            },

            keyExchange: {
                baseAPublicKey,
                baseBPublicKey,
                sharedSecretsMatch
            },

            session: { sessionKey },

            rsa: {
                rsaPublicKey,
                wrappedSessionKey
            },

            encryption: {
                ciphertext,
                iv,
                authTag
            },

            // Internal values for
            // local demonstration
            internal: {
                baseA,
                baseB,
                rsaPrivateKey

            }

        };

    } catch (error) {

        console.error("Encryption failed:", error.message);
        throw error;

    }

};


// ============================================================
// COMPLETE DECRYPTION
// ============================================================

export const decryptComplete = async (encryptedData) => {

    try {

        if (!encryptedData) {
            throw new Error("Encrypted data is required"
            );
        }


        // ----------------------------------------------------
        // Extract packet
        // ----------------------------------------------------

        const {
            authentication,
            keyExchange: exchange,
            rsa,
            encryption,
            internal
        } = encryptedData;


        // ----------------------------------------------------
        // STEP 1 — Recreate signed data
        // ----------------------------------------------------

        const signedData =
            createSignedData({

                senderId: "BASE-A",

                ecdhPublicKey:
                    exchange.baseAPublicKey,

                wrappedSessionKey:
                    rsa.wrappedSessionKey,

                ciphertext:
                    encryption.ciphertext,

                iv:
                    encryption.iv,

                authTag:
                    encryption.authTag

            });


        // ----------------------------------------------------
        // STEP 2 — Ed25519 VERIFY
        // ----------------------------------------------------

        const signatureValid =
            await verifyEd25519(
                signedData,
                authentication.signature,
                authentication.edPublicKey
            );


        if (!signatureValid) {

            throw new Error(
                "Ed25519 signature verification failed"
            );

        }


        // ----------------------------------------------------
        // STEP 3 — RSA UNWRAP
        // ----------------------------------------------------

        const recoveredSessionKey =
            await unwrapSessionKey(
                rsa.wrappedSessionKey,
                internal.rsaPrivateKey
            );


        // ----------------------------------------------------
        // STEP 4 — AES DECRYPT
        // ----------------------------------------------------

        const decrypted =
            decryptMessage(
                encryption.ciphertext,
                recoveredSessionKey,
                encryption.iv,
                encryption.authTag
            );


        if (!decrypted.success) {

            throw new Error(
                `AES decryption failed: ${decrypted.error}`
            );

        }


        // ----------------------------------------------------
        // FINAL DECRYPTION RESULT
        // ----------------------------------------------------

        return {

            success: true,

            plaintext:
                decrypted.plaintext,

            authentication: {

                signatureValid

            },

            session: {

                recoveredSessionKey

            },

            decryption: {

                success: true

            }

        };


    } catch (error) {

        console.error(
            "Decryption failed:",
            error.message
        );


        return {

            success: false,

            plaintext: null,

            error: error.message

        };

    }

};