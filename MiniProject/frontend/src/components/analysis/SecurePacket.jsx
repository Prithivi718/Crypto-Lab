import React from 'react';

export const SecurePacket = ({ packet }) => {
    if (!packet) return null;

    const fields = [
        { key: 'SENDER ID', val: packet.senderId || 'BASE-A' },
        { key: 'ECDH PUBLIC KEY', val: packet.ecdhPublicKey },
        { key: 'WRAPPED SESSION KEY', val: typeof packet.wrappedSessionKey === 'object' ? JSON.stringify(packet.wrappedSessionKey) : packet.wrappedSessionKey },
        { key: 'CIPHERTEXT', val: packet.ciphertext },
        { key: 'IV / NONCE', val: packet.iv },
        { key: 'AUTH TAG', val: packet.authTag },
        { key: 'SIGNATURE', val: typeof packet.signature === 'object' ? JSON.stringify(packet.signature) : packet.signature }
    ];

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                06 / SECURE PACKET
            </div>

            <div className="analysis-data-grid">
                {fields.map((f, idx) => (
                    <div key={idx} className="analysis-data-item">
                        <span className="analysis-data-key">{f.key}</span>
                        <span className="analysis-data-val" style={{ color: 'var(--accent-bright)' }}>{String(f.val || 'N/A')}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
