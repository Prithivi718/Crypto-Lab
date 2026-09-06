import React, { useState } from 'react';

const STEP_DEFINITIONS = [
    { num: '01', label: 'Ed25519', title: 'Ed25519 Authentication', phase: 'Encryption' },
    { num: '02', label: 'ECDH', title: 'ECDH Key Exchange', phase: 'Encryption' },
    { num: '03', label: 'HKDF', title: 'HKDF Key Derivation', phase: 'Encryption' },
    { num: '04', label: 'RSA Wrap', title: 'RSA-OAEP Key Protection', phase: 'Encryption' },
    { num: '05', label: 'AES Encrypt', title: 'AES-256-GCM Message Encryption', phase: 'Encryption' },
    { num: '06', label: 'Sign Packet', title: 'Packet Signing', phase: 'Encryption' },
    { num: '07', label: 'Verify', title: 'Signature Verification', phase: 'Decryption' },
    { num: '08', label: 'RSA Unwrap', title: 'RSA Session Key Recovery', phase: 'Decryption' },
    { num: '09', label: 'AES Decrypt', title: 'AES-256-GCM Decryption', phase: 'Decryption' },
];

export const PipelineStepper = ({
    currentStep = 1,
    completedSteps = [],
    activeStepIndex = 1,
    onSelectStep = () => { }
}) => {
    const [hoveredIndex, setHoveredIndex] = useState(null);

    const getStepState = (stepNum) => {
        if (stepNum === activeStepIndex) return 'active';
        if (completedSteps.includes(stepNum)) return 'completed';
        return 'pending';
    };

    const pulseWidth = Math.min(100, Math.max(0, ((currentStep - 1) / 8) * 100));

    return (
        <div className="pipeline-stepper-panel">
            {/* Connector Line Background */}
            <div className="pipeline-connector-line">
                <div
                    className="pipeline-connector-pulse"
                    style={{ width: `${pulseWidth}%` }}
                />
            </div>

            {/* Stepper Nodes */}
            <div className="pipeline-stepper-track">
                {STEP_DEFINITIONS.map((def, idx) => {
                    const stepNum = idx + 1;
                    const state = getStepState(stepNum);
                    const isHovered = hoveredIndex === stepNum;

                    return (
                        <div key={def.num} className="pipeline-stepper-node-wrapper">
                            <button
                                className={`pipeline-step-node ${state}`}
                                onClick={() => onSelectStep(stepNum)}
                                onMouseEnter={() => setHoveredIndex(stepNum)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                type="button"
                                aria-label={`Step ${def.num} ${def.title}`}
                            >
                                <span className="pipeline-node-num">{def.num}</span>
                                <span className="pipeline-node-label">{def.label}</span>
                            </button>

                            {/* Hover Details Secondary Card */}
                            {isHovered && (
                                <div className="pipeline-step-hover-card">
                                    <div className="pipeline-step-hover-title">
                                        {def.num} / {def.label}
                                    </div>
                                    <div style={{ color: '#c9d1d9', fontSize: '11px', marginBottom: '6px' }}>
                                        {def.title}
                                    </div>
                                    <div className="pipeline-step-hover-row">
                                        <span style={{ color: '#8b949e' }}>PHASE:</span>
                                        <span style={{ color: '#7ee787' }}>{def.phase.toUpperCase()}</span>
                                    </div>
                                    <div className="pipeline-step-hover-row">
                                        <span style={{ color: '#8b949e' }}>STATUS:</span>
                                        <span style={{ color: state === 'completed' ? '#7ee787' : state === 'active' ? '#58a6ff' : '#8b949e' }}>
                                            {state.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
