/**
 * process.service.js
 * Complete one-shot cryptographic execution service for SecureNet.
 * Executes the 9-step cryptographic pipeline in a single pass,
 * records high-resolution timings, and updates the shared Execution Context.
 */

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
} from './crypto.service.js';

import { createExecution, updateExecution } from './executionStore.js';
import { measureAsync, measureSync } from '../utils/timingUtils.js';
import { performance } from 'node:perf_hooks';

/**
 * Executes the complete encryption + decryption + verification pipeline in one call.
 * @param {string} message - Plaintext message to process
 * @param {Object} metadata - Optional metadata (filename, size)
 * @returns {Promise<Object>} Execution result object with executionId and status
 */
export const process_run = async (message, metadata = {}) => {
    if (!message) {
        throw new Error('Message is required');
    }

    const filename = metadata.filename || 'mission.txt';
    const inputSize = metadata.fileSize || Buffer.byteLength(message);

    // 1. Create shared Execution Context
    const execution = createExecution({
        message,
        filename,
        size: inputSize
    });

    const executionId = execution.executionId;
    const startTotal = performance.now();

    try {
        // ----------------------------------------------------
        // STEP 1 — Ed25519 Authentication Key Pair
        // ----------------------------------------------------
        const { result: edRes, durationMs: ed25519GenTime } = await measureAsync(
            'ed25519Gen',
            () => generateEdKeys()
        );
        const { edPublicKey, edPrivateKey } = edRes;

        // ----------------------------------------------------
        // STEP 2 — ECDH Key Exchange
        // ----------------------------------------------------
        const { result: ecdhRes, durationMs: ecdhExchangeTime } = measureSync(
            'ecdhExchange',
            () => keyExchange()
        );
        const {
            baseAPublicKey,
            baseBPublicKey,
            baseASharedSecret,
            baseBSharedSecret,
            sharedSecretsMatch
        } = ecdhRes;

        // ----------------------------------------------------
        // STEP 3 — HKDF Key Derivation
        // ----------------------------------------------------
        const { result: sessionKey, durationMs: hkdfDerivationTime } = await measureAsync(
            'hkdfDerivation',
            () => deriveSessionKey(baseASharedSecret)
        );

        // ----------------------------------------------------
        // STEP 4 — RSA Key Generation & Key Protection
        // ----------------------------------------------------
        const { result: rsaRes, durationMs: rsaGenTime } = await measureAsync(
            'rsaGen',
            () => generateRSAKeys()
        );
        const { rsaPublicKey, rsaPrivateKey } = rsaRes;

        const { result: wrappedSessionKey, durationMs: rsaWrapTime } = await measureAsync(
            'rsaWrap',
            () => wrapSessionKey(sessionKey, rsaPublicKey)
        );

        // ----------------------------------------------------
        // STEP 5 — AES-256-GCM Encryption
        // ----------------------------------------------------
        const { result: encrypted, durationMs: aesEncryptionTime } = measureSync(
            'aesEncryption',
            () => encryptMessage(message, sessionKey)
        );
        const { ciphertext, iv, authTag } = encrypted;

        // ----------------------------------------------------
        // STEP 6 — Secure Packet & Ed25519 Signing
        // ----------------------------------------------------
        const signedData = createSignedData({
            senderId: 'BASE-A',
            ecdhPublicKey: baseAPublicKey,
            wrappedSessionKey,
            ciphertext,
            iv,
            authTag
        });

        const { result: signature, durationMs: ed25519SignTime } = await measureAsync(
            'ed25519Sign',
            () => signEd25519(signedData, edPrivateKey)
        );

        // ----------------------------------------------------
        // STEP 7 — Receiver Ed25519 Signature Verification
        // ----------------------------------------------------
        const { result: signatureValid, durationMs: ed25519VerifyTime } = await measureAsync(
            'ed25519Verify',
            () => verifyEd25519(signedData, signature, edPublicKey)
        );

        if (!signatureValid) {
            throw new Error('Ed25519 signature verification failed');
        }

        // ----------------------------------------------------
        // STEP 8 — RSA Session Key Recovery
        // ----------------------------------------------------
        const { result: recoveredSessionKey, durationMs: rsaUnwrapTime } = await measureAsync(
            'rsaUnwrap',
            () => unwrapSessionKey(wrappedSessionKey, rsaPrivateKey)
        );

        // ----------------------------------------------------
        // STEP 9 — AES-256-GCM Decryption
        // ----------------------------------------------------
        const { result: decrypted, durationMs: aesDecryptionTime } = measureSync(
            'aesDecryption',
            () => decryptMessage(ciphertext, recoveredSessionKey, iv, authTag)
        );

        if (!decrypted.success) {
            throw new Error(`AES decryption failed: ${decrypted.error || 'Unknown error'}`);
        }

        const endTotal = performance.now();
        const totalElapsed = parseFloat((endTotal - startTotal).toFixed(4));

        const plaintextMatch = decrypted.plaintext === message;

        // Build completed Execution Context patch
        const patch = {
            status: 'completed',
            completedAt: new Date().toISOString(),
            process: {
                encryption: {
                    ciphertextHex: ciphertext.toString('hex'),
                    ivHex: iv.toString('hex'),
                    authTagHex: authTag.toString('hex')
                },
                decryption: {
                    plaintext: decrypted.plaintext,
                    decryptionSuccess: decrypted.success
                }
            },
            cryptographicMaterial: {
                ed25519: {
                    edPublicKey: edPublicKey.toString('hex'),
                    edPrivateKey: edPrivateKey.toString('hex')
                },
                ecdh: {
                    baseAPublicKey: baseAPublicKey.toString('hex'),
                    baseBPublicKey: baseBPublicKey.toString('hex'),
                    sharedSecret: baseASharedSecret.toString('hex')
                },
                hkdf: {
                    sessionKey: sessionKey.toString('hex')
                },
                rsa: {
                    rsaPublicKey: rsaPublicKey.toString('hex'),
                    rsaPrivateKey: rsaPrivateKey.toString('hex'),
                    wrappedSessionKey: wrappedSessionKey.toString('hex'),
                    recoveredSessionKey: recoveredSessionKey.toString('hex')
                },
                aes: {
                    sessionKey: sessionKey.toString('hex'),
                    ciphertext: ciphertext.toString('hex'),
                    iv: iv.toString('hex'),
                    authTag: authTag.toString('hex')
                },
                signature: {
                    signature: signature.toString('hex')
                }
            },
            measurements: {
                times: {
                    ed25519Gen: ed25519GenTime,
                    ecdhExchange: ecdhExchangeTime,
                    hkdfDerivation: hkdfDerivationTime,
                    rsaGen: rsaGenTime,
                    rsaWrap: rsaWrapTime,
                    aesEncryption: aesEncryptionTime,
                    ed25519Sign: ed25519SignTime,
                    ed25519Verify: ed25519VerifyTime,
                    rsaUnwrap: rsaUnwrapTime,
                    aesDecryption: aesDecryptionTime,
                    totalElapsed
                },
                sizes: {
                    inputSize,
                    sessionKey: Buffer.isBuffer(sessionKey) ? sessionKey.length : 32,
                    wrappedSessionKey: Buffer.isBuffer(wrappedSessionKey) ? wrappedSessionKey.length : 256,
                    ciphertext: ciphertext.length,
                    iv: iv.length,
                    authTag: authTag.length,
                    signature: signature.length
                }
            },
            verification: {
                sharedSecretsMatch,
                signatureValid,
                decryptionSuccess: decrypted.success,
                plaintextMatch
            }
        };

        updateExecution(executionId, patch);

        return {
            success: true,
            executionId,
            status: 'completed',
            summary: {
                filename,
                inputSize,
                plaintextMatch,
                signatureValid,
                totalElapsedMs: totalElapsed
            },
            timing: patch.measurements.times
        };
    } catch (error) {
        const endTotal = performance.now();
        const totalElapsed = parseFloat((endTotal - startTotal).toFixed(4));

        updateExecution(executionId, {
            status: 'failed',
            error: {
                message: error.message
            },
            measurements: {
                times: {
                    totalElapsed
                }
            }
        });

        console.error(`❌ Process execution ${executionId} failed:`, error.message);

        return {
            success: false,
            executionId,
            status: 'failed',
            error: error.message
        };
    }
};