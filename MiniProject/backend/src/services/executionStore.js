/**
 * executionStore.js
 * In-memory storage layer for SecureNet Execution Contexts.
 * Provides central tracking for single cryptographic executions across Workflow and Process services.
 */

const executions = new Map();

/**
 * Creates and initializes a new execution context.
 * @param {Object} inputData - { message, filename, size }
 * @returns {Object} Newly created execution context
 */
export function createExecution(inputData = {}) {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const executionContext = {
        executionId,
        input: {
            message: inputData.message || '',
            filename: inputData.filename || 'mission.txt',
            size: inputData.size || (inputData.message ? Buffer.byteLength(inputData.message) : 0)
        },
        workflow: {
            steps: []
        },
        process: {
            encryption: {},
            decryption: {}
        },
        cryptographicMaterial: {
            ed25519: {},
            ecdh: {},
            hkdf: {},
            rsa: {},
            aes: {},
            signature: {}
        },
        measurements: {
            times: {
                ed25519Gen: 0,
                ecdhExchange: 0,
                hkdfDerivation: 0,
                rsaGen: 0,
                rsaWrap: 0,
                aesEncryption: 0,
                ed25519Sign: 0,
                ed25519Verify: 0,
                rsaUnwrap: 0,
                aesDecryption: 0,
                totalElapsed: 0
            },
            sizes: {
                inputSize: inputData.size || (inputData.message ? Buffer.byteLength(inputData.message) : 0),
                sessionKey: 32,
                wrappedSessionKey: 256,
                ciphertext: 0,
                iv: 12,
                authTag: 16,
                signature: 64
            }
        },
        verification: {
            sharedSecretsMatch: false,
            signatureValid: false,
            decryptionSuccess: false,
            plaintextMatch: false
        },
        benchmark: null,
        report: null,
        status: 'running',
        error: null,
        createdAt: new Date().toISOString(),
        completedAt: null
    };

    executions.set(executionId, executionContext);
    return executionContext;
}

/**
 * Retrieves an existing execution context by ID.
 * @param {string} executionId 
 * @returns {Object|null} Execution Context or null
 */
export function getExecution(executionId) {
    return executions.get(executionId) || null;
}

/**
 * Updates an execution context with partial data.
 * @param {string} executionId 
 * @param {Object} patch 
 * @returns {Object|null} Updated Execution Context
 */
export function updateExecution(executionId, patch = {}) {
    const execution = executions.get(executionId);
    if (!execution) return null;

    // Deep merge key properties if supplied
    if (patch.input) Object.assign(execution.input, patch.input);
    if (patch.workflow) {
        if (patch.workflow.steps) execution.workflow.steps = patch.workflow.steps;
        Object.assign(execution.workflow, patch.workflow);
    }
    if (patch.process) Object.assign(execution.process, patch.process);
    if (patch.cryptographicMaterial) {
        for (const key of Object.keys(patch.cryptographicMaterial)) {
            execution.cryptographicMaterial[key] = {
                ...execution.cryptographicMaterial[key],
                ...patch.cryptographicMaterial[key]
            };
        }
    }
    if (patch.measurements) {
        if (patch.measurements.times) Object.assign(execution.measurements.times, patch.measurements.times);
        if (patch.measurements.sizes) Object.assign(execution.measurements.sizes, patch.measurements.sizes);
    }
    if (patch.verification) Object.assign(execution.verification, patch.verification);
    if (patch.status) execution.status = patch.status;
    if (patch.error) execution.error = patch.error;
    if (patch.completedAt) execution.completedAt = patch.completedAt;
    if (patch.benchmark) execution.benchmark = patch.benchmark;
    if (patch.report) execution.report = patch.report;

    executions.set(executionId, execution);
    return execution;
}

/**
 * Deletes an execution context.
 * @param {string} executionId 
 * @returns {boolean} True if deleted
 */
export function deleteExecution(executionId) {
    return executions.delete(executionId);
}

/**
 * Clears all executions (for testing).
 */
export function clearAllExecutions() {
    executions.clear();
}
