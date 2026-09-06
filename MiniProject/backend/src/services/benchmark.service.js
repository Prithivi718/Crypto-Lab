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
import { measureAsync, measureSync } from '../utils/timingUtils.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/config.js';

export const runBenchmarkProcess = async (message, inputFilename = "input.txt") => {

    // Overall start
    const totalStart = performance.now();

    const reportData = {
        metrics: {
            inputSize: Buffer.byteLength(message, 'utf8'),
            inputFilename,
            times: {},
            sizes: {},
            status: {}
        },
        packet: {}
    };

    try {
        // ENCRYPTION PHASE

        // 1. Ed25519
        const { result: edKeys, durationMs: edTime } = await measureAsync('Generate Ed25519', () => generateEdKeys());
        reportData.metrics.times.ed25519Gen = edTime;

        // 2. ECDH
        const { result: ecdhData, durationMs: ecdhTime } = measureSync('ECDH Exchange', () => keyExchange());
        reportData.metrics.times.ecdhExchange = ecdhTime;
        reportData.metrics.status.sharedSecretsMatch = ecdhData.sharedSecretsMatch;

        // 3. HKDF (using BaseA shared secret)
        const { result: sessionKey, durationMs: hkdfTime } = await measureAsync('HKDF Derivation', () => deriveSessionKey(ecdhData.baseASharedSecret));
        reportData.metrics.times.hkdfDerivation = hkdfTime;
        reportData.metrics.sizes.sessionKey = sessionKey.byteLength;

        // 4. RSA
        const { result: rsaKeys, durationMs: rsaGenTime } = await measureAsync('RSA Gen', () => generateRSAKeys());
        reportData.metrics.times.rsaGen = rsaGenTime;

        const { result: wrappedSessionKey, durationMs: rsaWrapTime } = await measureAsync('RSA Wrap', () => wrapSessionKey(sessionKey, rsaKeys.rsaPublicKey));
        reportData.metrics.times.rsaWrap = rsaWrapTime;
        reportData.metrics.sizes.wrappedSessionKey = wrappedSessionKey.byteLength;

        // 5. AES Encryption
        const { result: encrypted, durationMs: aesEncTime } = measureSync('AES Encryption', () => encryptMessage(message, sessionKey));
        reportData.metrics.times.aesEncryption = aesEncTime;
        reportData.metrics.sizes.ciphertext = encrypted.ciphertext.byteLength;
        reportData.metrics.sizes.iv = encrypted.iv.byteLength;
        reportData.metrics.sizes.authTag = encrypted.authTag.byteLength;

        // 6. Packet Signing
        const { result: signedDataString, durationMs: createDataTime } = measureSync('Create Signed Data', () => createSignedData({
            senderId: "BASE-A",
            ecdhPublicKey: ecdhData.baseAPublicKey,
            wrappedSessionKey,
            ciphertext: encrypted.ciphertext,
            iv: encrypted.iv,
            authTag: encrypted.authTag
        }));

        const { result: signature, durationMs: signTime } = await measureAsync('Ed25519 Sign', () => signEd25519(signedDataString, edKeys.edPrivateKey));
        reportData.metrics.times.ed25519Sign = signTime;
        reportData.metrics.sizes.signature = signature.byteLength;

        // DECRYPTION PHASE

        // 7. Verify Signature
        const { result: signatureValid, durationMs: verifyTime } = await measureAsync('Verify Signature', () => verifyEd25519(signedDataString, signature, edKeys.edPublicKey));
        reportData.metrics.times.ed25519Verify = verifyTime;
        reportData.metrics.status.signatureValid = signatureValid;

        if (!signatureValid) throw new Error("Signature invalid");

        // 8. RSA Unwrap
        const { result: recoveredSessionKey, durationMs: rsaUnwrapTime } = await measureAsync('RSA Unwrap', () => unwrapSessionKey(wrappedSessionKey, rsaKeys.rsaPrivateKey));
        reportData.metrics.times.rsaUnwrap = rsaUnwrapTime;

        // 9. AES Decrypt
        const { result: decrypted, durationMs: aesDecTime } = measureSync('AES Decryption', () => decryptMessage(encrypted.ciphertext, recoveredSessionKey, encrypted.iv, encrypted.authTag));
        reportData.metrics.times.aesDecryption = aesDecTime;

        if (!decrypted.success) throw new Error("Decryption failed");

        reportData.metrics.status.decryptionSuccess = true;
        reportData.metrics.status.plaintextMatch = (decrypted.plaintext === message);

        const totalEnd = performance.now();
        reportData.metrics.times.totalElapsed = parseFloat((totalEnd - totalStart).toFixed(4));
        reportData.success = true;

        // Save report to disk
        const reportFilename = `report-${Date.now()}.json`;
        const reportPath = path.join(config.dirs.reports, reportFilename);
        await fs.writeFile(reportPath, JSON.stringify(reportData, null, 2), 'utf8');

        return {
            success: true,
            reportFile: reportFilename,
            report: reportData,
            plaintext: decrypted.plaintext
        };

    } catch (error) {
        return {
            success: false,
            error: error.message,
            metricsSoFar: reportData.metrics
        };
    }
};
