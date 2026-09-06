import React from 'react';
import { StepDataBlock } from './StepDataBlock';

const INPUT_DESCRIPTIONS = {
    1: "Sender identity initialization (BASE-A)",
    2: "Endpoint A and Endpoint B public/private key pairs",
    3: "ECDH shared secret",
    4: "AES-256 session key",
    5: "Mission plaintext payload + 256-bit session key",
    6: "Assembled secure packet (senderId, ecdhPublicKey, wrappedKey, ciphertext, iv, tag)",
    7: "Received secure packet + Ed25519 digital signature",
    8: "Wrapped session key + receiver RSA-OAEP private key",
    9: "AES-256 ciphertext + IV + authentication tag + recovered session key"
};

export const WorkflowStepPanel = ({
    stepNumber = 1,
    stepData = null,
    isProcessing = false
}) => {
    const title = stepData?.title || `Step 0${stepNumber} Operation`;
    const algorithm = stepData?.algorithm || 'CRYPTOGRAPHIC ALGORITHM';
    const description = stepData?.description || 'Executing secure cryptographic operation...';
    const details = stepData?.details || {};

    const formattedStepNum = String(stepNumber).padStart(2, '0');
    const inputDesc = INPUT_DESCRIPTIONS[stepNumber] || "Cryptographic parameters";

    // Format output key-value items from response details
    const outputItems = Object.entries(details).map(([key, val]) => {
        // Format key from camelCase to uppercase words
        const formattedKey = key
            .replace(/([A-Z])/g, ' $1')
            .toUpperCase()
            .trim();
        return { key: formattedKey, value: val };
    });

    return (
        <div className={`active-step-panel${isProcessing ? ' processing' : ''}`}>
            {/* Header */}
            <div className="active-step-header">
                <div>
                    <span className="active-step-badge">{formattedStepNum} / 09</span>
                    <h3 className="active-step-title">{title}</h3>
                    <p className="active-step-desc">{description}</p>
                </div>
                <div className="active-step-algorithm-tag">{algorithm}</div>
            </div>

            {/* INPUT / PROCESS / OUTPUT Sections */}
            <div className="step-sections-wrapper">
                <StepDataBlock
                    label="INPUT"
                    text={inputDesc}
                />

                <StepDataBlock
                    label="PROCESS"
                    text={description}
                />

                <StepDataBlock
                    label="OUTPUT"
                    items={outputItems.length > 0 ? outputItems : [{ key: "STATUS", value: isProcessing ? "EXECUTING..." : "PENDING EXECUTION" }]}
                />
            </div>
        </div>
    );
};
