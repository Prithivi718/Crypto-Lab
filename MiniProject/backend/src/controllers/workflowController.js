// workflowController.js

import {
    initializeWorkflow,
    getWorkflowState,
    runEncryptionStep,
    runDecryptionStep,
    resetWorkflow
} from '../services/workflow.service.js';

export const startWorkflow = (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required to start workflow." });
        }

        const result = initializeWorkflow(message);
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const getState = (req, res) => {
    try {
        const { id } = req.params;
        const state = getWorkflowState(id);

        // Strip out any sensitive private keys before sending to frontend
        const safeState = {
            workflowId: state.workflowId,
            currentStep: state.currentStep,
            status: state.status,
            completedSteps: state.completedSteps,
            // Example of a safe summary to send without exposing secrets:
            summary: {
                hasEd25519: !!state.ed25519.edPublicKey,
                hasSharedSecret: !!state.ecdh.baseASharedSecret,
                hasSessionKey: !!state.hkdf.sessionKey,
                hasWrappedKey: !!state.rsa.wrappedSessionKey,
                hasCiphertext: !!state.aes.ciphertext,
                hasPacketSignature: !!state.packet.signature,
                hasSignatureVerified: !!state.decryption.signatureValid,
                hasRecoveredKey: !!state.decryption.recoveredSessionKey,
                hasPlaintext: !!state.decryption.plaintext
            }
        };

        return res.status(200).json(safeState);
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
};

export const executeStep = async (req, res) => {
    try {
        const { workflowId, step } = req.body;

        if (!workflowId || !step) {
            return res.status(400).json({ error: "workflowId and step are required." });
        }

        const stepNumber = parseInt(step, 10);
        let result;

        if (stepNumber >= 1 && stepNumber <= 6) {
            result = await runEncryptionStep(workflowId, stepNumber);
        } else if (stepNumber >= 7 && stepNumber <= 9) {
            result = await runDecryptionStep(workflowId, stepNumber);
        } else {
            return res.status(400).json({ error: "Invalid step number." });
        }

        if (result.status === "failed") {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

export const reset = (req, res) => {
    try {
        const { id } = req.params;
        const resetSuccess = resetWorkflow(id);

        if (resetSuccess) {
            return res.status(200).json({ message: "Workflow reset successfully" });
        }
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
