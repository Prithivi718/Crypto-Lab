import React from 'react';

export const FinalResult = ({ isVerified = null, verification = null }) => {
    // null = still loading/unknown; don't flash FAILED or VERIFIED prematurely
    const isLoading = isVerified === null;

    const checklist = [
        { label: 'PLAINTEXT MATCH', pass: verification?.plaintextMatch },
        { label: 'DIGITAL SIGNATURE', pass: verification?.signatureValid },
        { label: 'SESSION KEY RECOVERY', pass: verification?.decryptionSuccess },
        { label: 'AES AUTHENTICATION', pass: verification?.sharedSecretsMatch }
    ];

    const borderColor = isLoading
        ? 'var(--border-strong)'
        : isVerified
            ? 'var(--status-success)'
            : 'var(--status-danger)';

    const headingColor = isLoading
        ? 'var(--text-secondary)'
        : isVerified
            ? 'var(--status-success)'
            : 'var(--status-danger)';

    const headingText = isLoading
        ? 'AWAITING VERIFICATION...'
        : isVerified
            ? 'TRANSMISSION VERIFIED'
            : 'TRANSMISSION FAILED';

    return (
        <div className="analysis-block" style={{ borderLeft: `4px solid ${borderColor}` }}>
            <div className="analysis-block-header">
                09 / FINAL RESULT
            </div>

            <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-heading-xl)',
                color: headingColor,
                fontWeight: 'bold',
                marginBottom: '16px'
            }}>
                {headingText}
            </div>

            <div className="analysis-data-grid">
                {checklist.map((item, idx) => (
                    <div key={idx} className="analysis-data-item">
                        <span className="analysis-data-key">{item.label}</span>
                        <span className="analysis-data-val" style={{
                            color: item.pass === undefined || item.pass === null
                                ? 'var(--text-muted)'
                                : item.pass
                                    ? 'var(--status-success)'
                                    : 'var(--status-danger)',
                            fontWeight: 'bold'
                        }}>
                            {item.pass === undefined || item.pass === null
                                ? '— PENDING'
                                : item.pass
                                    ? '✓ VERIFIED'
                                    : '✗ FAILED'}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
