import React from 'react';

export const ExecutionSummary = ({ summary }) => {
    if (!summary) return null;

    return (
        <div className="analysis-block">
            <div className="analysis-block-header">
                01 / EXECUTION SUMMARY
            </div>

            <div className="analysis-data-grid">
                <div className="analysis-data-item">
                    <span className="analysis-data-key">EXECUTION ID</span>
                    <span className="analysis-data-val">{summary.executionId}</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">FILENAME</span>
                    <span className="analysis-data-val">{summary.filename || 'mission.txt'}</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">INPUT SIZE</span>
                    <span className="analysis-data-val">{summary.inputSize} BYTES</span>
                </div>

                <div className="analysis-data-item">
                    <span className="analysis-data-key">STATUS</span>
                    <span className="analysis-data-val" style={{ color: 'var(--status-success)', fontWeight: 'bold' }}>
                        {(summary.status || 'COMPLETED').toUpperCase()}
                    </span>
                </div>

                {summary.createdAt && (
                    <div className="analysis-data-item">
                        <span className="analysis-data-key">CREATED</span>
                        <span className="analysis-data-val">{new Date(summary.createdAt).toLocaleString()}</span>
                    </div>
                )}

                {summary.completedAt && (
                    <div className="analysis-data-item">
                        <span className="analysis-data-key">COMPLETED</span>
                        <span className="analysis-data-val">{new Date(summary.completedAt).toLocaleString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
