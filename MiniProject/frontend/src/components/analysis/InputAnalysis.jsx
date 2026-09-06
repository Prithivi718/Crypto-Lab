import React from 'react';

export const InputAnalysis = ({ inputData }) => {
    if (!inputData) return null;

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                02 / MISSION INPUT
            </div>

            <div className="analysis-data-grid" style={{ marginBottom: '16px' }}>
                <div className="analysis-data-item">
                    <span className="analysis-data-key">FILE</span>
                    <span className="analysis-data-val">{inputData.filename || 'mission.txt'}</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">SIZE</span>
                    <span className="analysis-data-val">{inputData.size || 0} BYTES</span>
                </div>
            </div>

            <div className="analysis-data-key" style={{ marginBottom: '6px' }}>PLAINTEXT PAYLOAD</div>
            <div className="analysis-plaintext-box">
                {inputData.plaintext || 'No plaintext payload provided'}
            </div>
        </div>
    );
};
