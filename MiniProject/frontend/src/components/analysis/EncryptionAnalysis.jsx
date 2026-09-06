import React from 'react';

export const EncryptionAnalysis = ({ encryptionSteps = [] }) => {
    if (!encryptionSteps || encryptionSteps.length === 0) return null;

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                03 / ENCRYPTION ANALYSIS
            </div>

            <div className="step-subcard-list">
                {encryptionSteps.map((stepObj) => {
                    const stepNum = String(stepObj.step || '').padStart(2, '0');
                    const outputEntries = Object.entries(stepObj.output || {}).map(([k, v]) => ({
                        key: k.replace(/([A-Z])/g, ' $1').toUpperCase().trim(),
                        val: typeof v === 'object' ? JSON.stringify(v) : String(v)
                    }));

                    return (
                        <div key={stepObj.step} className="step-subcard">
                            <div className="step-subcard-title">
                                <span>{stepObj.title || `${stepNum} / ${stepObj.algorithm}`}</span>
                                <span style={{ color: 'var(--status-success)', fontSize: '11px' }}>
                                    ✓ {(stepObj.status || 'PASSED').toUpperCase()}
                                </span>
                            </div>

                            <div className="analysis-data-grid" style={{ gap: '12px' }}>
                                {stepObj.input?.description && (
                                    <div className="analysis-data-item">
                                        <span className="analysis-data-key">INPUT</span>
                                        <span className="analysis-data-val">{stepObj.input.description}</span>
                                    </div>
                                )}

                                {stepObj.process?.description && (
                                    <div className="analysis-data-item">
                                        <span className="analysis-data-key">PROCESS</span>
                                        <span className="analysis-data-val">{stepObj.process.description}</span>
                                    </div>
                                )}
                            </div>

                            {outputEntries.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <span className="analysis-data-key" style={{ display: 'block', marginBottom: '6px' }}>OUTPUT</span>
                                    <div className="analysis-data-grid" style={{ gap: '10px' }}>
                                        {outputEntries.map((out, idx) => (
                                            <div key={idx} className="analysis-data-item">
                                                <span className="analysis-data-key">{out.key}</span>
                                                <span className="analysis-data-val" style={{ color: 'var(--accent-bright)' }}>{out.val}</span>
                                            </div>
                                        ))}
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
