// HKDF algorithm for session key generation

import { webcrypto } from "crypto";
const crypto = webcrypto;

const HASH_ALGORITHM = "SHA-512";
const SESSION_KEY_LENGTH = 32;

export const generateSessionKey = async (sharedKey) => {

    try {

        // check shared key is null
        if (!sharedKey) {
            throw new Error("Missing argument is required!");
        }


        // Shared secret key as HKDF key
        const hkdfKey = await crypto.subtle.importKey(
            "raw",
            sharedKey,
            {
                name: "HKDF"
            },
            false,
            ["deriveBits"]
        );


        // CONFIG of HKDF
        // salt value
        const salt = new TextEncoder().encode(
            "SecureDefenceNetwork-Salt"
        );

        // info useful for Session key generation
        const info = new TextEncoder().encode(
            "AES-256-GCM-Session-Key"
        );


        // Session key generation
        const derivedBits = await crypto.subtle.deriveBits(
            {
                name: "HKDF",
                hash: HASH_ALGORITHM,
                salt,
                info
            },
            hkdfKey,
            SESSION_KEY_LENGTH * 8 // 512 bytes
        );

        const sessionKey = new Uint8Array(derivedBits);

        if (!sessionKey) {
            throw new Error("Value generation is failed!");
        }

        return sessionKey;

    } catch (error) {
        console.error("Error:", error.message);
        throw error;
    }
}