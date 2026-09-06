import React from 'react';

export const PipelineHeader = ({ status = 'ONLINE' }) => {
    return (
        <div className="pipeline-header">
            <div className="pipeline-eyebrow">
                <span className="pipeline-status-dot" />
                <span>LIVE TRANSMISSION // [{status}]</span>
            </div>
            <h2 className="pipeline-title">
                Cryptographic <span className="pipeline-title-accent">pipeline</span>
            </h2>
        </div>
    );
};
