import React from 'react';

export const CryptographicMaterial = ({ material }) => {
    if (!material) return null;

    const sections = [
        { key: 'ED25519', data: material.ed25519 },
        { key: 'ECDH', data: material.ecdh },
        { key: 'HKDF', data: material.hkdf },
        { key: 'RSA', data: material.rsa },
        { key: 'AES-256-GCM', data: material.aes },
        { key: 'SIGNATURE', data: material.signature }
    ];

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                05 / CRYPTOGRAPHIC MATERIAL
            </div>

            <div className="step-subcard-list">
                {sections.map(({ key, data }) => {
                    if (!data) return null;
                    const items = Object.entries(data).map(([k, v]) => ({
                        kLabel: k.replace(/([A-Z])/g, ' $1').toUpperCase().trim(),
                        vVal: typeof v === 'object' ? JSON.stringify(v) : String(v)
                    }));

                    return (
                        <div key={key} className="step-subcard">
                            <div className="step-subcard-title" style={{ color: 'var(--text-primary)' }}>
                                {key}
                            </div>
                            <div className="analysis-data-grid" style={{ gap: '10px' }}>
                                {items.map((item, idx) => (
                                    <div key={idx} className="analysis-data-item">
                                        <span className="analysis-data-key">{item.kLabel}</span>
                                        <span className="analysis-data-val" style={{ color: 'var(--accent-bright)' }}>{item.vVal}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
