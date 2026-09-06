// RSA with OAEP (Optimal Assymetric Encryption Padding)

import { webcrypto } from "crypto";
const crypto = webcrypto;

export const generateRSAKeyPair = async () => {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256",
        },
        true, // keys are extractable
        ["encrypt", "decrypt"] // allowed operations
    );

    return keyPair;
}

export const exportRSAKeys = async (keyPair) => {
    // Uses Json WEB key (JWK)
    const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);

    // Uses PCKS-8
    const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

    console.log("Public Key (JWK):", publicKey);
    console.log("Private Key (PKCS8):", privateKey);
    return { publicKey, privateKey };
}


export const importRSAPublicKey = async (jwkKey) => {
    const publicKey = await crypto.subtle.importKey(
        "jwk",
        jwkKey,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        true, // Whether the key is extractable
        ["encrypt"] // allowed operations
    );

    return publicKey;
}

export const encryptRSA = async(sessionKey, publicKey) => {
    try {
        if (!sessionKey){
            throw new Error("Missing required arguements")
        }

        const encryptedSessionKey = await crypto.subtle.encrypt(
            "RSA-OAEP",
            publicKey,
            sessionKey
        )

        return encryptedSessionKey;

    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}

export const decryptRSA = async(encryptedSessionKey, privateKey) => {
    try {
        if (!encryptedSessionKey){
            throw new Error("Missing required arguements")
        }

       
        const decryptedSessionKey = await crypto.subtle.decrypt(
            "RSA-OAEP",
            privateKey,
            encryptedSessionKey
        )

        return new Uint8Array(decryptedSessionKey);

    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}