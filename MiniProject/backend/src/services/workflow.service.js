// workflow.service.js
//
// Orchestrates the step-by-step cryptographic workflow state.
// Maintains the state in memory, allowing interactive execution.
//

import { randomUUID } from "node:crypto";
import {
    generateEdKeys,
    keyExchange,
    deriveSessionKey,
    generateRSAKeys,
    wrapSessionKey,
    encryptMessage,
    createSignedData,
    signEd25519,
    verifyEd25519,
    unwrapSessionKey,
    decryptMessage
} from "./crypto.service.js";

// In-memory state store logic (for a real app, use Redis/DB for persistence,
// but in-memory is fine for demonstration).
const activeWorkflows = new Map();

export const initializeWorkflow = (message) => {
    const workflowId = randomUUID();
    const workflowState = {
        workflowId,
        message,
        currentStep: 0,
        status: "initialized",
        completedSteps: [],
        ed25519: {},
        ecdh: {},
        hkdf: {},
        rsa: {},
        aes: {},
        packet: {},
        decryption: {}
    };
    activeWorkflows.set(workflowId, workflowState);

    return {
        workflowId,
        status: workflowState.status,
    };
};

export const getWorkflowState = (workflowId) => {
    const state = activeWorkflows.get(workflowId);
    if (!state) {
        throw new Error("Workflow not found");
    }
    return state;
};

// ============================================================
// STEP RUNNERS
// ============================================================

export const runEncryptionStep = async (workflowId, requestedStep) => {
    const state = getWorkflowState(workflowId);

    if (requestedStep !== state.currentStep + 1) {
        throw new Error(`Invalid step progression. Expected step ${state.currentStep + 1}`);
    }

    let result = {};

    try {
        switch (requestedStep) {
            case 1:
                const edKeys = await generateEdKeys();
                state.ed25519 = edKeys;
                result = {
                    title: "Ed25519 Authentication",
                    description: "Sender generating Ed25519 key pair for digital signature.",
                    algorithm: "Ed25519",
                    details: {
                        publicKeyFormat: "JWK (Conceptual)",
                        keyReady: true
                    }
                };
                break;

            case 2:
                const ecdhData = keyExchange();
                state.ecdh = ecdhData;
                result = {
                    title: "ECDH Key Exchange",
                    description: "Both bases generate keys and independently calculate the same shared secret.",
                    algorithm: "ECDH",
                    details: {
                        sharedSecretsMatch: ecdhData.sharedSecretsMatch,
                    }
                };
                break;

            case 3:
                const sessionKey = await deriveSessionKey(state.ecdh.baseASharedSecret);
                state.hkdf.sessionKey = sessionKey;
                result = {
                    title: "HKDF Key Derivation",
                    description: "Deriving 256-bit AES session key from the ECDH shared secret.",
                    algorithm: "HKDF",
                    details: {
                        sessionKeyLength: sessionKey.length || sessionKey.byteLength
                    }
                };
                break;

            case 4:
                const rsaKeys = await generateRSAKeys();
                state.rsa = rsaKeys;
                const wrappedSessionKey = await wrapSessionKey(state.hkdf.sessionKey, rsaKeys.rsaPublicKey);
                state.rsa.wrappedSessionKey = wrappedSessionKey;
                result = {
                    title: "RSA-OAEP Key Protection",
                    description: "Wrapping AES session key with RSA public key.",
                    algorithm: "RSA-OAEP",
                    details: {
                        wrappedKeyLength: wrappedSessionKey.byteLength
                    }
                };
                break;

            case 5:
                const encrypted = encryptMessage(state.message, state.hkdf.sessionKey);
                state.aes = encrypted;
                result = {
                    title: "AES-256-GCM Message Encryption",
                    description: "Message encrypted using AES-256 session key.",
                    algorithm: "AES-256-GCM",
                    details: {
                        ciphertextHex: encrypted.ciphertext.toString("hex").slice(0, 32) + "...",
                        ivHex: encrypted.iv.toString("hex"),
                        authTagHex: encrypted.authTag.toString("hex")
                    }
                };
                break;

            case 6:
                const signedDataString = createSignedData({
                    senderId: "BASE-A",
                    ecdhPublicKey: state.ecdh.baseAPublicKey,
                    wrappedSessionKey: state.rsa.wrappedSessionKey,
                    ciphertext: state.aes.ciphertext,
                    iv: state.aes.iv,
                    authTag: state.aes.authTag
                });
                state.packet.signedData = signedDataString;

                const signature = await signEd25519(signedDataString, state.ed25519.edPrivateKey);
                state.packet.signature = signature;

                result = {
                    title: "Packet Signing",
                    description: "Creating secure packet and signing with Ed25519.",
                    algorithm: "Ed25519",
                    details: {
                        signatureLength: signature.byteLength
                    }
                };
                break;

            default:
                throw new Error("Invalid encryption step");
        }

        state.currentStep = requestedStep;
        state.completedSteps.push(requestedStep);

        return {
            step: requestedStep,
            phase: "encryption",
            status: "completed",
            ...result
        };

    } catch (error) {
        return {
            step: requestedStep,
            phase: "encryption",
            status: "failed",
            error: error.message
        };
    }
};


export const runDecryptionStep = async (workflowId, requestedStep) => {
    const state = getWorkflowState(workflowId);

    // Decryption steps conceptually follow encryption steps.
    // Enc = steps 1-6. Dec = steps 7-9.

    if (requestedStep !== state.currentStep + 1) {
        throw new Error(`Invalid step progression. Expected step ${state.currentStep + 1}`);
    }

    let result = {};

    try {
        switch (requestedStep) {
            case 7:
                const signatureValid = await verifyEd25519(
                    state.packet.signedData,
                    state.packet.signature,
                    state.ed25519.edPublicKey
                );

                if (!signatureValid) throw new Error("Signature verification failed. Packet tampered.");

                state.decryption.signatureValid = true;

                result = {
                    title: "Signature Verification",
                    description: "Receiver verifies Ed25519 signature.",
                    algorithm: "Ed25519",
                    details: {
                        valid: true
                    }
                };
                break;

            case 8:
                const recoveredSessionKey = await unwrapSessionKey(
                    state.rsa.wrappedSessionKey,
                    state.rsa.rsaPrivateKey
                );
                state.decryption.recoveredSessionKey = recoveredSessionKey;

                result = {
                    title: "RSA Session Key Recovery",
                    description: "Receiver recovers AES session key using RSA private key.",
                    algorithm: "RSA-OAEP",
                    details: {
                        recoveredKeyLength: recoveredSessionKey.byteLength ?? recoveredSessionKey.length
                    }
                };
                break;

            case 9:
                const decryptedData = decryptMessage(
                    state.aes.ciphertext,
                    state.decryption.recoveredSessionKey,
                    state.aes.iv,
                    state.aes.authTag
                );

                if (!decryptedData.success) {
                    throw new Error("AES-GCM decryption failed.");
                }

                state.decryption.plaintext = decryptedData.plaintext;

                result = {
                    title: "AES-256-GCM Decryption",
                    description: "Decrypting ciphertext and verifying auth tag.",
                    algorithm: "AES-256-GCM",
                    details: {
                        plaintext: decryptedData.plaintext
                    }
                };
                break;

            default:
                throw new Error("Invalid decryption step");
        }

        state.currentStep = requestedStep;
        state.completedSteps.push(requestedStep);

        return {
            step: requestedStep,
            phase: "decryption",
            status: "completed",
            ...result
        };

    } catch (error) {
        return {
            step: requestedStep,
            phase: "decryption",
            status: "failed",
            error: error.message
        };
    }
};

export const resetWorkflow = (workflowId) => {
    activeWorkflows.delete(workflowId);
    return true;
};
