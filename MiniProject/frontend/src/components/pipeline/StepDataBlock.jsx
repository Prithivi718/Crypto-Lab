import React from 'react';

export const StepDataBlock = ({ label, items = [], text = '' }) => {
    return (
        <div className="step-section-block">
            <div className="step-section-label">
                <span>{label}</span>
            </div>
            {text && <div className="step-section-content">{text}</div>}
            {items.length > 0 && (
                <div className="step-kv-grid">
                    {items.map((item, idx) => (
                        <div key={idx} className="step-kv-item">
                            <span className="step-kv-key">{item.key}</span>
                            <span className="step-kv-val">{String(item.value)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
