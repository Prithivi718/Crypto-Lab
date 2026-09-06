import React from 'react';

export const VerificationSummary = ({ verification }) => {
    if (!verification) return null;

    const items = [
        { key: 'SHARED SECRET MATCH', pass: verification.sharedSecretsMatch },
        { key: 'SIGNATURE VALID', pass: verification.signatureValid },
        { key: 'DECRYPTION SUCCESS', pass: verification.decryptionSuccess },
        { key: 'PLAINTEXT MATCH', pass: verification.plaintextMatch }
    ];

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                07 / VERIFICATION
            </div>

            <div className="analysis-data-grid">
                {items.map((item, idx) => (
                    <div key={idx} className="analysis-data-item">
                        <span className="analysis-data-key">{item.key}</span>
                        <span className="analysis-data-val" style={{ color: item.pass ? 'var(--status-success)' : 'var(--status-danger)', fontWeight: 'bold' }}>
                            {item.pass ? '✓ PASS' : '✗ FAIL'}
                        </span>
                    </div>
                ))}
            </div>

            {verification.finalStatus && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px dashed var(--border-subtle)' }}>
                    <span className="analysis-data-key">FINAL STATUS</span>
                    <div style={{ color: 'var(--status-success)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', fontSize: 'var(--text-mono-base)', marginTop: '4px' }}>
                        {verification.finalStatus}
                    </div>
                </div>
            )}
        </div>
    );
};
