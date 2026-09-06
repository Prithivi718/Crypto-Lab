import React from 'react';
import PlayIcon from '../../assets/play-button-svgrepo-com.svg';
import ResetIcon from '../../assets/lock-reset-svgrepo-com (1).svg';

export const WorkflowControls = ({
    isExecuting = false,
    isComplete = false,
    isConfirmingState = false,
    onExecuteNext = () => { },
    onViewAnalysis = () => { },
    onResetWorkflow = () => { }
}) => {
    return (
        <div className="workflow-controls-bar">
            {!isComplete ? (
                <>
                    <button
                        className="btn-execute-step"
                        onClick={onExecuteNext}
                        disabled={isExecuting}
                        type="button"
                    >
                        {isExecuting ? '◌ EXECUTING...' : <><img src={PlayIcon} alt="play" style={{ width: '14px', height: '14px', marginRight: '8px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />EXECUTE NEXT STEP →</>}
                    </button>

                    <button
                        className="btn-execute-step"
                        onClick={onResetWorkflow}
                        type="button"
                        style={{ background: 'var(--color-almost-black)', borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                    >
                        <img src={ResetIcon} alt="reset" style={{ width: '14px', height: '14px', marginRight: '8px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />NEW TRANSMISSION
                    </button>
                </>
            ) : (
                <>
                    <button
                        className="btn-execute-step"
                        disabled
                        type="button"
                        style={{ background: 'var(--color-almost-black)', borderColor: 'var(--status-success)', color: 'var(--status-success)' }}
                    >
                        ✓ WORKFLOW COMPLETE
                    </button>

                    <button
                        className="btn-view-analysis"
                        onClick={onViewAnalysis}
                        disabled={isConfirmingState}
                        type="button"
                    >
                        {isConfirmingState ? '◌ CONFIRMING...' : 'VIEW FINAL ANALYSIS →'}
                    </button>

                    <button
                        className="btn-execute-step"
                        onClick={onResetWorkflow}
                        type="button"
                        style={{ background: 'var(--color-almost-black)', borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
                    >
                        <img src={ResetIcon} alt="reset" style={{ width: '14px', height: '14px', marginRight: '8px', verticalAlign: 'middle', filter: 'brightness(0) invert(1)' }} />NEW TRANSMISSION
                    </button>
                </>
            )}
        </div>
    );
};
