/**
 * benchmark.service.js
 * Analysis layer for SecureNet execution contexts.
 * Performs timing, throughput, size, and efficiency analysis over ALREADY COLLECTED
 * execution measurements. Does NOT execute cryptographic primitives or rerun crypto.
 */

/**
 * Analyzes a completed or running Execution Context.
 * @param {Object} executionContext - The Execution Context to analyze
 * @returns {Object} Analytical summary of the execution's performance and sizes
 */
export const analyzeExecution = (executionContext) => {
    if (!executionContext) {
        throw new Error('Execution Context is required for benchmark analysis');
    }

    const { executionId, input, measurements, verification, status } = executionContext;
    const times = measurements?.times || {};
    const sizes = measurements?.sizes || {};

    // Extract individual operation durations
    const opTimes = {
        ed25519Gen: times.ed25519Gen || 0,
        ecdhExchange: times.ecdhExchange || 0,
        hkdfDerivation: times.hkdfDerivation || 0,
        rsaGen: times.rsaGen || 0,
        rsaWrap: times.rsaWrap || 0,
        aesEncryption: times.aesEncryption || 0,
        ed25519Sign: times.ed25519Sign || 0,
        ed25519Verify: times.ed25519Verify || 0,
        rsaUnwrap: times.rsaUnwrap || 0,
        aesDecryption: times.aesDecryption || 0
    };

    // Group encryption vs decryption phase timing
    const encryptionPhaseTime = parseFloat(
        (
            opTimes.ed25519Gen +
            opTimes.ecdhExchange +
            opTimes.hkdfDerivation +
            opTimes.rsaGen +
            opTimes.rsaWrap +
            opTimes.aesEncryption +
            opTimes.ed25519Sign
        ).toFixed(4)
    );

    const decryptionPhaseTime = parseFloat(
        (
            opTimes.ed25519Verify +
            opTimes.rsaUnwrap +
            opTimes.aesDecryption
        ).toFixed(4)
    );

    const totalElapsed = times.totalElapsed || parseFloat((encryptionPhaseTime + decryptionPhaseTime).toFixed(4));

    // Determine fastest and slowest cryptographic operations
    const validOps = Object.entries(opTimes).filter(([, time]) => typeof time === 'number' && time > 0);
    let fastestOperation = { name: 'N/A', durationMs: 0 };
    let slowestOperation = { name: 'N/A', durationMs: 0 };

    if (validOps.length > 0) {
        validOps.sort((a, b) => a[1] - b[1]);
        fastestOperation = { name: validOps[0][0], durationMs: validOps[0][1] };
        slowestOperation = { name: validOps[validOps.length - 1][0], durationMs: validOps[validOps.length - 1][1] };
    }

    // Calculate throughput (KB/sec) if totalElapsed > 0 and inputSize > 0
    const inputSizeBytes = input?.size || sizes.inputSize || 0;
    let throughputKBps = 0;
    if (totalElapsed > 0 && inputSizeBytes > 0) {
        const inputKB = inputSizeBytes / 1024;
        const totalSeconds = totalElapsed / 1000;
        throughputKBps = parseFloat((inputKB / totalSeconds).toFixed(2));
    }

    return {
        executionId,
        status,
        timing: {
            operations: opTimes,
            encryptionPhaseMs: encryptionPhaseTime,
            decryptionPhaseMs: decryptionPhaseTime,
            totalElapsedMs: totalElapsed
        },
        sizes: {
            inputSizeBytes,
            sessionKeyBytes: sizes.sessionKey || 32,
            wrappedSessionKeyBytes: sizes.wrappedSessionKey || 256,
            ciphertextBytes: sizes.ciphertext || 0,
            ivBytes: sizes.iv || 12,
            authTagBytes: sizes.authTag || 16,
            signatureBytes: sizes.signature || 64
        },
        verification: {
            sharedSecretsMatch: verification?.sharedSecretsMatch || false,
            signatureValid: verification?.signatureValid || false,
            decryptionSuccess: verification?.decryptionSuccess || false,
            plaintextMatch: verification?.plaintextMatch || false
        },
        analysis: {
            fastestOperation: `${fastestOperation.name} (${fastestOperation.durationMs} ms)`,
            slowestOperation: `${slowestOperation.name} (${slowestOperation.durationMs} ms)`,
            encryptionVsDecryptionRatio: decryptionPhaseTime > 0
                ? parseFloat((encryptionPhaseTime / decryptionPhaseTime).toFixed(2))
                : 1,
            throughputKBps
        }
    };
};

/**
 * Legacy support for runBenchmarkProcess wrapper to preserve interface without running crypto directly.
 */
export const runBenchmarkProcess = async (message, inputFilename = 'input.txt') => {
    throw new Error(
        'runBenchmarkProcess is deprecated. Please execute process_run() from process.service.js instead.'
    );
};
