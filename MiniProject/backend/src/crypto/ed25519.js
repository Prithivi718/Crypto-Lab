// ed25519.js (Edward curvers Digital signature)

import { webcrypto } from "crypto";

const crypto = webcrypto;

export const generateEd25519KeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "Ed25519",
            namedCurve: "Ed25519", // a good practice
        },
        true, // key is extractable (private, public)
        ["sign", "verify"] // operations allowed
    );

    return keyPair;
}

export const exportEd25519Keys = async (keyPair) => {
    // Uses Json WEB key (JWK)
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    // Uses PCKS-8
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    console.log("Public Key (JWK):", publicKey);
    console.log("Private Key (PKCS8):", privateKey);
    return { publicKey, privateKey };
}


export const importEd25519PublicKey = async (jwkKey) => {
    const publicKey = await crypto.subtle.importKey(
        "jwk",
        jwkKey,
        {
            name: "Ed25519",
            namedCurve: "Ed25519", // For Ed25519, this is often redundant but good practice
        },
        true, // Whether the key is extractable
        ["verify"] // allowed operations
    );

    return publicKey;
}

export const exportEd25519PublicKeyHex = async (publicKey) => {
    const raw = await crypto.subtle.exportKey("raw", publicKey);

    return Buffer.from(raw).toString("hex");
};

export const signMessage = async (message, privateKey) => {

    const messageBuffer = new TextEncoder().encode(message);

    const signature = await crypto.subtle.sign(
        "Ed25519",
        privateKey,
        messageBuffer
    );

    return signature;
};

export const verifySignature = async (
    message,
    signature,
    publicKey
) => {

    const messageBuffer = new TextEncoder().encode(message);

    const isValid = await crypto.subtle.verify(
        "Ed25519",
        publicKey,
        signature,
        messageBuffer
    );

    return isValid;
};