import React from 'react';
import ResetIcon from '../../assets/lock-reset-svgrepo-com (1).svg';

export const AnalysisHeader = ({ isVerified = null, isLoading = false, onResetWorkflow = () => { } }) => {
    return (
        <div className="analysis-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
                <div className="analysis-eyebrow">
                    SECURE DEFENCE COMMUNICATION NETWORK // ANALYSIS
                </div>
                <h2 className="analysis-title">
                    FINAL TRANSMISSION ANALYSIS
                </h2>
                {isLoading ? (
                    <div className="analysis-status-badge pending" style={{ background: 'rgba(210, 153, 34, 0.15)', borderColor: 'var(--status-warning)', color: 'var(--status-warning)' }}>
                        ◌ ANALYZING TRANSMISSION...
                    </div>
                ) : isVerified === null ? (
                    <div className="analysis-status-badge pending" style={{ background: 'rgba(100, 100, 100, 0.10)', borderColor: 'var(--border-strong)', color: 'var(--text-muted)' }}>
                        — AWAITING DATA
                    </div>
                ) : (
                    <div className={`analysis-status-badge ${isVerified ? 'verified' : 'failed'}`}>
                        {isVerified ? '✓ EXECUTION VERIFIED' : '⚠ EXECUTION FAILED'}
                    </div>
                )}
            </div>

            <button
                className="btn-execute-step"
                onClick={onResetWorkflow}
                type="button"
                style={{
                    background: 'var(--color-almost-black)',
                    borderColor: 'var(--border-strong)',
                    color: 'var(--text-primary)',
                    padding: '8px 16px',
                    fontSize: 'var(--text-mono-xs)'
                }}
            >
                <img src={ResetIcon} alt="reset" style={{ width: '14px', height: '14px', marginRight: '8px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />NEW TRANSMISSION
            </button>
        </div>
    );
};
