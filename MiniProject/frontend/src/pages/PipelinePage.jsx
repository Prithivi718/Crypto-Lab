import React, { useState, useEffect } from 'react';
import '../components/pipeline/Pipeline.css';
import { PipelineHeader } from '../components/pipeline/PipelineHeader';
import { PipelineStepper } from '../components/pipeline/PipelineStepper';
import { WorkflowStepPanel } from '../components/pipeline/WorkflowStepPanel';
import { PipelineTelemetry } from '../components/pipeline/PipelineTelemetry';
import { WorkflowControls } from '../components/pipeline/WorkflowControls';
import { executeWorkflowStep, startWorkflow, resetWorkflow } from '../services/api';

export default function PipelinePage({
    workflowId = null,
    workflowExecutionId = null,
    onWorkflowComplete = () => { },
    onViewAnalysis = () => { },
    onResetWorkflow = () => { }
}) {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedStepIndex, setSelectedStepIndex] = useState(1);
    const [completedSteps, setCompletedSteps] = useState([]);
    const [stepHistory, setStepHistory] = useState({});
    const [isExecuting, setIsExecuting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeWfId, setActiveWfId] = useState(workflowId);

    // Sync external workflowId prop into local state and reset pipeline when a new workflow starts
    useEffect(() => {
        if (workflowId) {
            console.log('[Pipeline] new workflowId received —', workflowId);
            setActiveWfId(workflowId);
            setCurrentStep(1);
            setSelectedStepIndex(1);
            setCompletedSteps([]);
            setStepHistory({});
            setIsComplete(false);
            setErrorMsg('');
        }
    }, [workflowId]);

    const handleReset = async () => {
        const targetWfId = activeWfId || workflowId;
        if (targetWfId) {
            try {
                await resetWorkflow(targetWfId);
            } catch (err) {
                console.warn('Workflow reset API call warning:', err.message);
            }
        }
        setCurrentStep(1);
        setSelectedStepIndex(1);
        setCompletedSteps([]);
        setStepHistory({});
        setIsComplete(false);
        setErrorMsg('');
        setActiveWfId(null);
        onResetWorkflow();
    };

    const handleExecuteNextStep = async () => {
        let targetWfId = activeWfId || workflowId;

        setIsExecuting(true);
        setErrorMsg('');

        // If no active workflowId exists yet, initialize one automatically
        if (!targetWfId) {
            try {
                const initRes = await startWorkflow('Thanks a lot GPT', 'mission.txt', 0);
                if (initRes?.workflowId) {
                    targetWfId = initRes.workflowId;
                    setActiveWfId(targetWfId);
                    console.log('[Workflow] auto-initialized — workflowId =', targetWfId);
                } else {
                    setErrorMsg('Failed to initialize workflow session.');
                    setIsExecuting(false);
                    return;
                }
            } catch (err) {
                setErrorMsg(err.message || 'Failed to initialize workflow session.');
                setIsExecuting(false);
                return;
            }
        }

        if (currentStep > 9 || isComplete) {
            setIsExecuting(false);
            return;
        }

        try {
            const stepRes = await executeWorkflowStep(targetWfId, currentStep);
            console.log(`[Workflow] step ${currentStep} API response:`, stepRes);

            // Store step result in step history map
            setStepHistory(prev => ({
                ...prev,
                [currentStep]: stepRes
            }));

            // Add to completed steps
            setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
            setSelectedStepIndex(currentStep);

            if (currentStep === 9) {
                // Source of truth: Step 9 must explicitly confirm completed status
                if (stepRes?.status === 'completed') {
                    const confirmedExecId = stepRes?.executionId;
                    console.log('[Workflow] Step 9 confirmed completed — executionId =', confirmedExecId);
                    setIsComplete(true);
                    // Notify MissionPage that the workflow is done with the confirmed exec ID
                    onWorkflowComplete(confirmedExecId);
                } else {
                    setErrorMsg(`Step 9 reported unexpected status: ${stepRes?.status || 'unknown'}`);
                }
            } else {
                setCurrentStep(prev => prev + 1);
            }
        } catch (err) {
            setErrorMsg(err.message || `Step ${currentStep} execution failed`);
        } finally {
            setIsExecuting(false);
        }
    };

    const handleSelectStep = (stepNum) => {
        if (stepNum <= currentStep || completedSteps.includes(stepNum)) {
            setSelectedStepIndex(stepNum);
        }
    };

    // VIEW FINAL ANALYSIS — MissionPage already holds the confirmed analysisExecutionId
    const handleViewAnalysisConfirmed = () => {
        onViewAnalysis();
    };

    const activeStepData = stepHistory[selectedStepIndex] || null;

    return (
        <section id="pipeline" className="pipeline-section" aria-label="Cryptographic Pipeline">
            <div className="pipeline-container">
                <PipelineHeader status={isComplete ? 'COMPLETE' : isExecuting ? 'PROCESSING' : 'ONLINE'} />

                {/* 01-09 Stepper */}
                <PipelineStepper
                    currentStep={currentStep}
                    completedSteps={completedSteps}
                    activeStepIndex={selectedStepIndex}
                    onSelectStep={handleSelectStep}
                />

                {/* Main Content Grid: Central Box + Telemetry */}
                <div className="pipeline-main-grid">
                    <div>
                        <WorkflowStepPanel
                            stepNumber={selectedStepIndex}
                            stepData={activeStepData}
                            isProcessing={isExecuting}
                        />

                        {errorMsg && (
                            <div style={{
                                marginTop: '16px',
                                padding: '12px 16px',
                                background: 'rgba(154, 83, 75, 0.15)',
                                border: '1px solid var(--status-danger)',
                                borderRadius: 'var(--radius-sm)',
                                color: 'var(--status-danger)',
                                fontFamily: 'var(--font-mono)',
                                fontSize: 'var(--text-mono-sm)'
                            }}>
                                ⚠ STEP EXECUTION FAILED: {errorMsg}
                            </div>
                        )}

                        <WorkflowControls
                            isExecuting={isExecuting}
                            isComplete={isComplete}
                            isConfirmingState={false}
                            onExecuteNext={handleExecuteNextStep}
                            onViewAnalysis={handleViewAnalysisConfirmed}
                            onResetWorkflow={handleReset}
                        />
                    </div>

                    <PipelineTelemetry
                        telemetry={activeStepData?.telemetry}
                        isProcessing={isExecuting}
                        stepNumber={selectedStepIndex}
                    />
                </div>
            </div>
        </section>
    );
}
