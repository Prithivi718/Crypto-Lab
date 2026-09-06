// key.service.js
//
// Responsible for coordinating all key generation and
// key-establishment operations used by the application.
//
// It does NOT implement the cryptographic algorithms itself.
// It calls the functions from /crypto.


import {
    generateEd25519KeyPair
} from "../crypto/ed25519.js";

import {
    generateECDHKeyPair,
    getPublicKey,
    getPrivateKey,
    computeSharedSecret
} from "../crypto/ecdh.js";

import {
    generateRSAKeyPair
} from "../crypto/rsa.js";

import {
    generateSessionKey
} from "../crypto/hkdf.js";


// ============================================================
// 1. GENERATE ED25519 KEYS
// ============================================================

export const generateAuthenticationKeys = async () => {

    try {

        const keyPair = await generateEd25519KeyPair();

        return {
            keyPair,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey
        };

    } catch (error) {

        console.error(
            "Failed to generate Ed25519 keys:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 2. GENERATE ECDH KEYS
// ============================================================

export const generateKeyExchangeKeys = () => {

    try {

        const ecdh = generateECDHKeyPair();

        return {
            ecdh,
            publicKey: getPublicKey(ecdh),
            privateKey: getPrivateKey(ecdh)
        };

    } catch (error) {

        console.error(
            "Failed to generate ECDH keys:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 3. GENERATE RSA KEYS
// ============================================================

export const generateSessionKeyProtectionKeys = async () => {

    try {

        const keyPair = await generateRSAKeyPair();

        return {
            keyPair,
            publicKey: keyPair.publicKey,
            privateKey: keyPair.privateKey
        };

    } catch (error) {

        console.error(
            "Failed to generate RSA keys:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 4. CREATE ALL BASE A KEYS
// ============================================================
//
// Base A needs:
//
// Ed25519 → Authentication / Signature
// ECDH    → Key Exchange
// RSA     → Session-Key Protection
//

export const generateBaseAKeys = async () => {

    try {

        const authenticationKeys =
            await generateAuthenticationKeys();

        const keyExchangeKeys =
            generateKeyExchangeKeys();

        const sessionKeyProtectionKeys =
            await generateSessionKeyProtectionKeys();

        return {
            authentication: authenticationKeys,
            keyExchange: keyExchangeKeys,
            sessionKeyProtection: sessionKeyProtectionKeys
        };

    } catch (error) {

        console.error(
            "Failed to generate Base A keys:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 5. CREATE ALL BASE B KEYS
// ============================================================
//
// Base B has its own independent:
//
// Ed25519 key pair
// ECDH key pair
// RSA key pair
//

export const generateBaseBKeys = async () => {

    try {

        const authenticationKeys =
            await generateAuthenticationKeys();

        const keyExchangeKeys =
            generateKeyExchangeKeys();

        const sessionKeyProtectionKeys =
            await generateSessionKeyProtectionKeys();

        return {
            authentication: authenticationKeys,
            keyExchange: keyExchangeKeys,
            sessionKeyProtection: sessionKeyProtectionKeys
        };

    } catch (error) {

        console.error(
            "Failed to generate Base B keys:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 6. GENERATE ECDH SHARED SECRET
// ============================================================
//
// Base A:
//     Private A + Public B
//             ↓
//        Shared Secret
//
// Base B:
//     Private B + Public A
//             ↓
//        Same Shared Secret
//

export const establishSharedSecret = (
    localECDH,
    remotePublicKey
) => {

    try {

        if (!localECDH) {
            throw new Error(
                "Local ECDH key is required"
            );
        }

        if (!remotePublicKey) {
            throw new Error(
                "Remote ECDH public key is required"
            );
        }

        const sharedSecret =
            computeSharedSecret(
                localECDH,
                remotePublicKey
            );

        return sharedSecret;

    } catch (error) {

        console.error(
            "Failed to establish shared secret:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 7. DERIVE AES SESSION KEY USING HKDF
// ============================================================

export const deriveSessionKey = async (
    sharedSecret
) => {

    try {

        if (!sharedSecret) {
            throw new Error(
                "ECDH shared secret is required"
            );
        }

        const sessionKey =
            await generateSessionKey(sharedSecret);

        return sessionKey;

    } catch (error) {

        console.error(
            "Failed to derive session key:",
            error.message
        );

        throw error;
    }
};


// ============================================================
// 8. COMPLETE ECDH → HKDF KEY ESTABLISHMENT
// ============================================================
//
// This combines:
//
// ECDH
//   ↓
// Shared Secret
//   ↓
// HKDF
//   ↓
// AES-256 Session Key
//

export const establishSessionKey = async (
    localECDH,
    remotePublicKey
) => {

    try {

        const sharedSecret =
            establishSharedSecret(
                localECDH,
                remotePublicKey
            );

        const sessionKey =
            await deriveSessionKey(
                sharedSecret
            );

        return {
            sharedSecret,
            sessionKey
        };

    } catch (error) {

        console.error(
            "Failed to establish session key:",
            error.message
        );

        throw error;
    }
};