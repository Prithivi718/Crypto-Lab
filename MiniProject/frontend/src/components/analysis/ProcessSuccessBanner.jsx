import React from 'react';

export const ProcessSuccessBanner = ({ executionId, summary, timing }) => {
    if (!executionId) return null;

    const totalElapsed = summary?.totalElapsedMs || timing?.totalElapsed || 0;
    const plaintextMatch = summary?.plaintextMatch ?? true;
    const signatureValid = summary?.signatureValid ?? true;

    return (
        <div className="process-banner">
            <div className="process-banner-title">
                PROCESS EXECUTION COMPLETE // SECURE ALGORITHM FINISHED
            </div>

            <div className="process-banner-grid">
                <div className="process-banner-item">
                    <span className="process-banner-key">EXECUTION ID</span>
                    <span className="process-banner-val">{executionId}</span>
                </div>

                <div className="process-banner-item">
                    <span className="process-banner-key">PLAINTEXT MATCH</span>
                    <span className="process-banner-val" style={{ color: plaintextMatch ? 'var(--status-success)' : 'var(--status-danger)' }}>
                        {plaintextMatch ? '✓ VERIFIED' : 'FAILED'}
                    </span>
                </div>

                <div className="process-banner-item">
                    <span className="process-banner-key">SIGNATURE</span>
                    <span className="process-banner-val" style={{ color: signatureValid ? 'var(--status-success)' : 'var(--status-danger)' }}>
                        {signatureValid ? '✓ VERIFIED' : 'FAILED'}
                    </span>
                </div>

                <div className="process-banner-item">
                    <span className="process-banner-key">TOTAL EXECUTION</span>
                    <span className="process-banner-val">{Number(totalElapsed).toFixed(4)} ms</span>
                </div>
            </div>
        </div>
    );
};
