/**
 * workflow.service.js
 * Interactive, step-by-step cryptographic demonstration workflow service.
 * Manages sequential execution across the 9 cryptographic steps while updating
 * the central Execution Context and generating lightweight pipeline telemetry.
 */

import { randomUUID } from 'node:crypto';
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

import { createExecution, getExecution, updateExecution } from './executionStore.js';
import { maskSensitive } from '../utils/maskSensitive.js';
import { measureAsync, measureSync } from '../utils/timingUtils.js';

const activeWorkflows = new Map();

/**
 * Initializes a new workflow session tied to a central Execution Context.
 * @param {Object} inputData - { message, filename, fileSize }
 * @returns {Object} Workflow session info
 */
export const startWorkflow = (inputData = {}) => {
    const message = typeof inputData === 'string' ? inputData : (inputData.message || 'Thanks a lot GPT');
    const filename = inputData.filename || 'mission.txt';
    const fileSize = inputData.fileSize || Buffer.byteLength(message);

    const execution = createExecution({
        message,
        filename,
        size: fileSize
    });

    const workflowId = `workflow-${randomUUID()}`;
    const workflowState = {
        workflowId,
        executionId: execution.executionId,
        currentStep: 0,
        status: 'running',
        completedSteps: [],
        stepData: {}
    };

    activeWorkflows.set(workflowId, workflowState);

    return {
        success: true,
        workflowId,
        executionId: execution.executionId
    };
};

export const initializeWorkflow = (message) => {
    return startWorkflow({ message });
};

/**
 * Legacy support / helper function to retrieve workflow session state.
 */
export const getWorkflowState = (workflowId) => {
    const state = activeWorkflows.get(workflowId);
    if (!state) {
        throw new Error('Workflow not found');
    }
    return state;
};

/**
 * Executes a specific workflow step sequentially (1 through 9).
 * @param {string} workflowId 
 * @param {number} requestedStep 
 * @returns {Promise<Object>} Enriched step response + telemetry
 */
export const executeStep = async (workflowId, requestedStep) => {
    const state = getWorkflowState(workflowId);
    const execution = getExecution(state.executionId);

    if (!execution) {
        throw new Error('Execution Context not found for workflow');
    }

    if (requestedStep !== state.currentStep + 1) {
        throw new Error(`Invalid step progression. Expected step ${state.currentStep + 1}`);
    }

    const isEncryptionPhase = requestedStep <= 6;
    const phase = isEncryptionPhase ? 'encryption' : 'decryption';

    let stepDetails = {};
    let algorithm = '';
    let title = '';
    let description = '';
    let durationMs = 0;
    let lastOperationName = '';

    try {
        switch (requestedStep) {
            // ----------------------------------------------------
            // STEP 1 — Ed25519 Authentication
            // ----------------------------------------------------
            case 1: {
                algorithm = 'Ed25519';
                title = 'Ed25519 Authentication';
                description = 'Sender generating Ed25519 key pair for digital signature.';
                lastOperationName = 'Ed25519 Gen';

                const { result, durationMs: dMs } = await measureAsync(
                    'ed25519Gen',
                    () => generateEdKeys()
                );
                durationMs = dMs;

                const { edPublicKey, edPrivateKey } = result;

                state.stepData.ed25519 = result;

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        ed25519: {
                            edPublicKey: edPublicKey.toString('hex'),
                            edPrivateKey: edPrivateKey.toString('hex')
                        }
                    },
                    measurements: {
                        times: { ed25519Gen: durationMs }
                    }
                });

                stepDetails = {
                    publicKey: maskSensitive(edPublicKey),
                    publicKeyFormat: 'JWK',
                    keyReady: true
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 2 — ECDH Key Exchange
            // ----------------------------------------------------
            case 2: {
                algorithm = 'ECDH';
                title = 'ECDH Key Exchange';
                description = 'Both bases generate keys and independently calculate the same shared secret.';
                lastOperationName = 'ECDH Exchange';

                const { result, durationMs: dMs } = measureSync(
                    'ecdhExchange',
                    () => keyExchange()
                );
                durationMs = dMs;

                const {
                    baseAPublicKey,
                    baseBPublicKey,
                    baseASharedSecret,
                    baseBSharedSecret,
                    sharedSecretsMatch
                } = result;

                state.stepData.ecdh = result;

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        ecdh: {
                            baseAPublicKey: baseAPublicKey.toString('hex'),
                            baseBPublicKey: baseBPublicKey.toString('hex'),
                            sharedSecret: baseASharedSecret.toString('hex')
                        }
                    },
                    verification: { sharedSecretsMatch },
                    measurements: {
                        times: { ecdhExchange: durationMs }
                    }
                });

                stepDetails = {
                    baseAPublicKey: maskSensitive(baseAPublicKey),
                    baseBPublicKey: maskSensitive(baseBPublicKey),
                    sharedSecret: maskSensitive(baseASharedSecret),
                    sharedSecretsMatch
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 3 — HKDF Key Derivation
            // ----------------------------------------------------
            case 3: {
                algorithm = 'HKDF';
                title = 'HKDF Key Derivation';
                description = 'Deriving 256-bit AES session key from the ECDH shared secret.';
                lastOperationName = 'HKDF Derivation';

                const sharedSecret = state.stepData.ecdh.baseASharedSecret;
                const { result: sessionKey, durationMs: dMs } = await measureAsync(
                    'hkdfDerivation',
                    () => deriveSessionKey(sharedSecret)
                );
                durationMs = dMs;

                state.stepData.sessionKey = sessionKey;

                const salt = '9e410000000000000000000000000000';
                const hkdfInfo = '7365637572656e65742d73657373696f6e';

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        hkdf: {
                            salt,
                            hkdfInfo,
                            sessionKey: sessionKey.toString('hex')
                        }
                    },
                    measurements: {
                        times: { hkdfDerivation: durationMs },
                        sizes: { sessionKey: sessionKey.length || 32 }
                    }
                });

                stepDetails = {
                    salt: maskSensitive(salt),
                    hkdfInfo: maskSensitive(hkdfInfo),
                    sessionKey: maskSensitive(sessionKey),
                    sessionKeyLength: sessionKey.length || 32
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 4 — RSA-OAEP Key Protection
            // ----------------------------------------------------
            case 4: {
                algorithm = 'RSA-OAEP';
                title = 'RSA-OAEP Key Protection';
                description = 'Wrapping AES session key with RSA public key.';
                lastOperationName = 'RSA Wrap';

                const { result: rsaRes, durationMs: genMs } = await measureAsync(
                    'rsaGen',
                    () => generateRSAKeys()
                );
                const { rsaPublicKey, rsaPrivateKey } = rsaRes;
                state.stepData.rsaKeys = rsaRes;

                const sessionKey = state.stepData.sessionKey;
                const { result: wrappedSessionKey, durationMs: wrapMs } = await measureAsync(
                    'rsaWrap',
                    () => wrapSessionKey(sessionKey, rsaPublicKey)
                );
                durationMs = parseFloat((genMs + wrapMs).toFixed(4));

                state.stepData.wrappedSessionKey = wrappedSessionKey;

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        rsa: {
                            rsaPublicKey: rsaPublicKey.toString('hex'),
                            rsaPrivateKey: rsaPrivateKey.toString('hex'),
                            wrappedSessionKey: wrappedSessionKey.toString('hex')
                        }
                    },
                    measurements: {
                        times: { rsaGen: genMs, rsaWrap: wrapMs },
                        sizes: { wrappedSessionKey: wrappedSessionKey.length || 256 }
                    }
                });

                stepDetails = {
                    publicKey: maskSensitive(rsaPublicKey),
                    wrappedSessionKey: maskSensitive(wrappedSessionKey),
                    wrappedKeyLength: wrappedSessionKey.length || 256
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 5 — AES-256-GCM Message Encryption
            // ----------------------------------------------------
            case 5: {
                algorithm = 'AES-256-GCM';
                title = 'AES-256-GCM Message Encryption';
                description = 'Message encrypted using AES-256 session key.';
                lastOperationName = 'AES Encryption';

                const message = execution.input.message;
                const sessionKey = state.stepData.sessionKey;

                const { result: encrypted, durationMs: dMs } = measureSync(
                    'aesEncryption',
                    () => encryptMessage(message, sessionKey)
                );
                durationMs = dMs;

                const { ciphertext, iv, authTag } = encrypted;
                state.stepData.encrypted = encrypted;

                updateExecution(state.executionId, {
                    process: {
                        encryption: {
                            ciphertextHex: ciphertext.toString('hex'),
                            ivHex: iv.toString('hex'),
                            authTagHex: authTag.toString('hex')
                        }
                    },
                    cryptographicMaterial: {
                        aes: {
                            sessionKey: sessionKey.toString('hex'),
                            ciphertext: ciphertext.toString('hex'),
                            iv: iv.toString('hex'),
                            authTag: authTag.toString('hex')
                        }
                    },
                    measurements: {
                        times: { aesEncryption: durationMs },
                        sizes: {
                            ciphertext: ciphertext.length,
                            iv: iv.length,
                            authTag: authTag.length
                        }
                    }
                });

                stepDetails = {
                    ciphertextHex: maskSensitive(ciphertext),
                    ivHex: maskSensitive(iv),
                    authTagHex: maskSensitive(authTag),
                    ciphertextLength: ciphertext.length,
                    ivLength: iv.length,
                    authTagLength: authTag.length
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 6 — Packet Signing
            // ----------------------------------------------------
            case 6: {
                algorithm = 'Ed25519';
                title = 'Packet Signing';
                description = 'Creating secure packet and signing with Ed25519.';
                lastOperationName = 'Ed25519 Sign';

                const ecdhPublicKey = state.stepData.ecdh.baseAPublicKey;
                const wrappedSessionKey = state.stepData.wrappedSessionKey;
                const { ciphertext, iv, authTag } = state.stepData.encrypted;

                const signedData = createSignedData({
                    senderId: 'BASE-A',
                    ecdhPublicKey,
                    wrappedSessionKey,
                    ciphertext,
                    iv,
                    authTag
                });
                state.stepData.signedData = signedData;

                const edPrivateKey = state.stepData.ed25519.edPrivateKey;
                const { result: signature, durationMs: dMs } = await measureAsync(
                    'ed25519Sign',
                    () => signEd25519(signedData, edPrivateKey)
                );
                durationMs = dMs;

                state.stepData.signature = signature;

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        signature: { signature: signature.toString('hex') }
                    },
                    measurements: {
                        times: { ed25519Sign: durationMs },
                        sizes: { signature: signature.length || 64 }
                    }
                });

                stepDetails = {
                    signature: maskSensitive(signature),
                    signatureLength: signature.length || 64
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 7 — Signature Verification
            // ----------------------------------------------------
            case 7: {
                algorithm = 'Ed25519';
                title = 'Signature Verification';
                description = 'Receiver verifies Ed25519 signature.';
                lastOperationName = 'Ed25519 Verify';

                const signedData = state.stepData.signedData;
                const signature = state.stepData.signature;
                const edPublicKey = state.stepData.ed25519.edPublicKey;

                const { result: valid, durationMs: dMs } = await measureAsync(
                    'ed25519Verify',
                    () => verifyEd25519(signedData, signature, edPublicKey)
                );
                durationMs = dMs;

                if (!valid) {
                    throw new Error('Ed25519 signature verification failed');
                }

                updateExecution(state.executionId, {
                    verification: { signatureValid: valid },
                    measurements: {
                        times: { ed25519Verify: durationMs }
                    }
                });

                stepDetails = { valid };
                break;
            }

            // ----------------------------------------------------
            // STEP 8 — RSA Session Key Recovery
            // ----------------------------------------------------
            case 8: {
                algorithm = 'RSA-OAEP';
                title = 'RSA Session Key Recovery';
                description = 'Receiver recovers AES session key using RSA private key.';
                lastOperationName = 'RSA Unwrap';

                const wrappedSessionKey = state.stepData.wrappedSessionKey;
                const rsaPrivateKey = state.stepData.rsaKeys.rsaPrivateKey;

                const { result: recoveredSessionKey, durationMs: dMs } = await measureAsync(
                    'rsaUnwrap',
                    () => unwrapSessionKey(wrappedSessionKey, rsaPrivateKey)
                );
                durationMs = dMs;

                state.stepData.recoveredSessionKey = recoveredSessionKey;

                updateExecution(state.executionId, {
                    cryptographicMaterial: {
                        rsa: { recoveredSessionKey: recoveredSessionKey.toString('hex') }
                    },
                    measurements: {
                        times: { rsaUnwrap: durationMs }
                    }
                });

                stepDetails = {
                    recoveredSessionKey: maskSensitive(recoveredSessionKey),
                    recoveredKeyLength: recoveredSessionKey.length || 32
                };
                break;
            }

            // ----------------------------------------------------
            // STEP 9 — AES-256-GCM Decryption
            // ----------------------------------------------------
            case 9: {
                algorithm = 'AES-256-GCM';
                title = 'AES-256-GCM Decryption';
                description = 'Decrypting ciphertext and verifying auth tag.';
                lastOperationName = 'AES Decryption';

                const { ciphertext, iv, authTag } = state.stepData.encrypted;
                const recoveredSessionKey = state.stepData.recoveredSessionKey;

                const { result: decrypted, durationMs: dMs } = measureSync(
                    'aesDecryption',
                    () => decryptMessage(ciphertext, recoveredSessionKey, iv, authTag)
                );
                durationMs = dMs;

                if (!decrypted.success) {
                    throw new Error(`AES decryption failed: ${decrypted.error || 'Unknown error'}`);
                }

                const plaintextMatch = decrypted.plaintext === execution.input.message;

                const times = execution.measurements?.times || {};
                const totalElapsed = Object.values(times).reduce((acc, t) => acc + (typeof t === 'number' ? t : 0), 0) + durationMs;

                updateExecution(state.executionId, {
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                    process: {
                        decryption: {
                            plaintext: decrypted.plaintext,
                            decryptionSuccess: decrypted.success
                        }
                    },
                    verification: {
                        sharedSecretsMatch: execution.verification?.sharedSecretsMatch !== undefined ? execution.verification.sharedSecretsMatch : true,
                        signatureValid: execution.verification?.signatureValid !== undefined ? execution.verification.signatureValid : true,
                        decryptionSuccess: decrypted.success,
                        plaintextMatch
                    },
                    measurements: {
                        times: { aesDecryption: durationMs, totalElapsed: parseFloat(totalElapsed.toFixed(4)) }
                    }
                });

                stepDetails = {
                    sessionKey: maskSensitive(recoveredSessionKey),
                    plaintext: maskSensitive(decrypted.plaintext)
                };
                break;
            }

            default:
                throw new Error(`Invalid workflow step: ${requestedStep}`);
        }

        state.currentStep = requestedStep;
        state.completedSteps.push(requestedStep);

        // Save step result into execution context workflow array
        const currentSteps = execution.workflow.steps || [];
        currentSteps.push({
            step: requestedStep,
            phase,
            algorithm,
            title,
            description,
            status: 'completed',
            durationMs,
            details: stepDetails
        });

        updateExecution(state.executionId, {
            workflow: { steps: currentSteps }
        });

        return {
            workflowId,
            executionId: state.executionId,
            step: requestedStep,
            phase,
            status: 'completed',
            title,
            description,
            algorithm,
            details: stepDetails,
            telemetry: {
                lastOperation: lastOperationName || algorithm,
                durationMs,
                channel: algorithm,
                integrity: 'NOMINAL'
            }
        };
    } catch (error) {
        updateExecution(state.executionId, {
            status: 'failed',
            error: {
                step: requestedStep,
                algorithm,
                message: error.message
            }
        });

        return {
            workflowId,
            executionId: state.executionId,
            step: requestedStep,
            phase,
            status: 'failed',
            title,
            description,
            algorithm,
            error: error.message,
            telemetry: {
                lastOperation: lastOperationName || algorithm,
                durationMs,
                channel: algorithm,
                integrity: 'DEGRADED'
            }
        };
    }
};

/**
 * Legacy step wrappers for backwards compatibility
 */
export const runEncryptionStep = async (workflowId, step) => executeStep(workflowId, step);
export const runDecryptionStep = async (workflowId, step) => executeStep(workflowId, step);

/**
 * Resets/removes a workflow session.
 */
export const resetWorkflow = (workflowId) => {
    activeWorkflows.delete(workflowId);
    return true;
};
