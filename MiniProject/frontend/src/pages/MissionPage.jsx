import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import LandingPage from './LandingPage';
import { MissionIntake } from '../components/mission/MissionIntake';
import { SecurityIndicators } from '../components/mission/SecurityIndicators';
import { CryptographicConcepts } from '../components/concepts/CryptographicConcepts';
import PipelinePage from './PipelinePage';
import AnalysisPage from './AnalysisPage';
import { startWorkflow, runProcess, uploadFile } from '../services/api';
import { SecureNetIntro } from '../components/intro/SecureNetIntro';

export default function MissionPage() {
    // Intro overlay state — check sessionStorage
    const [showIntro, setShowIntro] = useState(() => {
        try {
            return !sessionStorage.getItem('securenet-intro-seen');
        } catch (err) {
            return false;
        }
    });
    const [isLogoHidden, setIsLogoHidden] = useState(false);
    // Incremented on intro completion to force a fresh LandingPage/GridDistortion mount
    const [landingKey, setLandingKey] = useState(0);

    // Workflow-specific state — controls the Pipeline only
    const [workflowId, setWorkflowId] = useState(null);
    const [workflowExecutionId, setWorkflowExecutionId] = useState(null);
    const [workflowComplete, setWorkflowComplete] = useState(false);

    // Analysis-ready state — only set when an execution is confirmed complete
    const [analysisExecutionId, setAnalysisExecutionId] = useState(null);

    // Process mode result — set immediately when RUN ALGORITHM completes
    const [processRunData, setProcessRunData] = useState(null);

    const handleStartWorkflow = async (file) => {
        let filename = 'mission.txt';
        let fileSize = 0;
        let message = 'Thanks a lot GPT';

        if (file) {
            try {
                const uploadRes = await uploadFile(file);
                if (uploadRes?.extractedText) message = uploadRes.extractedText;
                if (uploadRes?.filename) filename = uploadRes.filename;
                if (uploadRes?.fileSize) fileSize = uploadRes.fileSize;
            } catch (err) {
                console.error('File upload failed, falling back to default message:', err);
            }
        }

        try {
            const res = await startWorkflow(message, filename, fileSize);
            if (res?.workflowId) {
                console.log('[Workflow] started — workflowId =', res.workflowId, 'executionId =', res.executionId);
                setWorkflowId(res.workflowId);
                setWorkflowExecutionId(res.executionId ?? null);
                // Reset analysis state — Analysis must NOT fetch until Step 9 completes
                setWorkflowComplete(false);
                setAnalysisExecutionId(null);
                setProcessRunData(null);
            }
        } catch (err) {
            console.error('Failed to start workflow:', err);
        }
    };

    const handleRunProcess = async (file) => {
        let filename = 'mission.txt';
        let fileSize = 0;
        let message = 'Thanks a lot GPT';

        if (file) {
            try {
                const uploadRes = await uploadFile(file);
                if (uploadRes?.extractedText) message = uploadRes.extractedText;
                if (uploadRes?.filename) filename = uploadRes.filename;
                if (uploadRes?.fileSize) fileSize = uploadRes.fileSize;
            } catch (err) {
                console.error('File upload failed, falling back to default message:', err);
            }
        }

        try {
            const res = await runProcess(message, filename, fileSize);
            if (res?.executionId) {
                console.log('[Process] completed — executionId =', res.executionId);
                // Process is already complete when the response arrives — Analysis may fetch immediately
                setProcessRunData(res);
                setAnalysisExecutionId(res.executionId);
            }
        } catch (err) {
            console.error('Failed to run process:', err);
        }
    };

    // Called by PipelinePage when Step 9 API response confirms status === "completed"
    const handleWorkflowComplete = (confirmedExecutionId) => {
        console.log('[Workflow] Step 9 confirmed completed — analysisExecutionId =', confirmedExecutionId);
        setWorkflowComplete(true);
        setAnalysisExecutionId(confirmedExecutionId);
    };

    const handleViewAnalysis = () => {
        // Guard: must not navigate before workflow is actually done
        if (!workflowComplete && !processRunData) return;
        if (!analysisExecutionId) return;

        const element = document.getElementById('analysis');
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleResetWorkflow = () => {
        // Reset all transient execution state
        setWorkflowId(null);
        setWorkflowExecutionId(null);
        setWorkflowComplete(false);
        setAnalysisExecutionId(null);
        setProcessRunData(null);

        const element = document.getElementById('mission');
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="mission-page">
            {/* Cinematic SecureNet Boot & Intro Experience Overlay */}
            {showIntro && (
                <SecureNetIntro
                    onStartTransition={() => setIsLogoHidden(true)}
                    onIntroComplete={() => {
                        setIsLogoHidden(false);
                        setShowIntro(false);
                        setLandingKey(k => k + 1); // Remount LandingPage so GridDistortion starts fresh
                    }}
                />
            )}

            {/* Fixed Navbar with Scrollspy & Smooth Scroll */}
            <Navbar isLogoHidden={isLogoHidden} />

            {/* Section 0: Landing Hero with WebGL Grid Distortion background */}
            <LandingPage key={landingKey} />

            {/* Section 1: Mission Intake Hero with ShapeGrid & Upload Panel */}
            <MissionIntake
                onStartWorkflow={handleStartWorkflow}
                onRunProcess={handleRunProcess}
            />

            {/* Section 2: Security Indicators Bar */}
            <SecurityIndicators />

            {/* Section 3: Cryptographic Concepts Text Accordion Gallery */}
            <CryptographicConcepts />

            {/* Section 4: Cryptographic Pipeline (Live Workflow Stepper) */}
            <PipelinePage
                workflowId={workflowId}
                workflowExecutionId={workflowExecutionId}
                onWorkflowComplete={handleWorkflowComplete}
                onViewAnalysis={handleViewAnalysis}
                onResetWorkflow={handleResetWorkflow}
            />

            {/* Section 5: Final Transmission Analysis (Report & Export) */}
            <AnalysisPage
                analysisExecutionId={analysisExecutionId}
                processRunData={processRunData}
                onResetWorkflow={handleResetWorkflow}
            />
        </div>
    );
}
