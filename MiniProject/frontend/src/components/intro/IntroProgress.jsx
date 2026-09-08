/**
 * IntroProgress.jsx
 * 
 * Tactical boot initialization display showing system readiness checks,
 * a 4-stage (25% per hit) visual progress bar, status telemetry, and Skip Intro control.
 */

import React from 'react';

export function IntroProgress({
    readyStatesComplete,
    hasStartedProgress,
    onStartProgressGesture,
    onSkipIntro,
    authReady,
    keyReady,
    encReady,
    progressStage, // 0 to 4
    channelReady,
    showEnterButton,
    onEnterClicked,
    impactActive,
    isVoiceMuted,
    onToggleVoice
}) {
    const displayPercent = progressStage * 25;

    return (
        <div className="intro-console">
            {/* Voice Toggle Control */}
            <div className="intro-header-controls">
                <button
                    type="button"
                    className={`intro-voice-toggle ${isVoiceMuted ? 'muted' : 'active'}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggleVoice();
                    }}
                    aria-label={isVoiceMuted ? 'Enable Voice Briefing' : 'Mute Voice Briefing'}
                >
                    VOICE // {isVoiceMuted ? 'OFF' : 'ON'}
                </button>
            </div>

            {/* Main Command Header (NO LOGO IN PHASE 1) */}
            <div className="intro-branding">
                <h1 className="intro-title">SECURENET</h1>
                <div className="intro-subtitle">DEFENCE COMMUNICATIONS</div>
            </div>

            {/* Active Boot & Readiness Sequence */}
            <div className="intro-status-block">
                <div className="intro-section-label">INITIALIZING SECURENET</div>

                <div className="intro-readiness-list">
                    <div className="intro-readiness-item">
                        <span className="readiness-label">AUTHENTICATION</span>
                        <span className={`readiness-status ${authReady ? 'ready' : 'pending'}`}>
                            {authReady ? 'READY' : 'INITIALIZING'}
                        </span>
                    </div>

                    <div className="intro-readiness-item">
                        <span className="readiness-label">KEY EXCHANGE</span>
                        <span className={`readiness-status ${keyReady ? 'ready' : 'pending'}`}>
                            {keyReady ? 'READY' : 'PENDING'}
                        </span>
                    </div>

                    <div className="intro-readiness-item">
                        <span className="readiness-label">ENCRYPTION</span>
                        <span className={`readiness-status ${encReady ? 'ready' : 'pending'}`}>
                            {encReady ? 'READY' : 'PENDING'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Initialize & Skip Intro Controls */}
            {readyStatesComplete && !hasStartedProgress && (
                <div className="intro-gesture-prompt">
                    <div className="prompt-status-tag">SYSTEM INITIALIZED // AWAITING COMMAND</div>

                    <div className="intro-prompt-actions">
                        <button
                            type="button"
                            className="initialize-boot-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onStartProgressGesture();
                            }}
                            autoFocus
                        >
                            INITIALIZE SECURE CHANNEL
                        </button>

                        <button
                            type="button"
                            className="skip-intro-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSkipIntro();
                            }}
                        >
                            SKIP INTRO &rarr;
                        </button>
                    </div>

                    <div className="prompt-subtext">CLICK INITIALIZE TO BEGIN TRANSMISSION FORGING SEQUENCE</div>
                </div>
            )}

            {/* Discrete 4-Stage Segmented Progress Bar */}
            {hasStartedProgress && (
                <div className={`intro-progress-container ${impactActive ? 'impact-pulse' : ''}`}>
                    <div className="intro-progress-bar stage-4" role="progressbar" aria-valuenow={displayPercent} aria-valuemin="0" aria-valuemax="100">
                        {[1, 2, 3, 4].map((stageNumber) => {
                            const isFilled = progressStage >= stageNumber;
                            const isCurrentHit = progressStage === stageNumber && impactActive;
                            return (
                                <div
                                    key={stageNumber}
                                    className={`progress-segment ${isFilled ? 'filled' : 'empty'} ${isCurrentHit ? 'impact-hit' : ''}`}
                                >
                                    <div className="segment-inner" />
                                </div>
                            );
                        })}
                    </div>

                    <div className="intro-progress-telemetry">
                        <span className="telemetry-percentage">{displayPercent}%</span>
                        <span className="telemetry-status">
                            {channelReady ? 'SECURE CHANNEL READY' : 'SECURE CHANNEL INITIALIZING'}
                        </span>
                    </div>
                </div>
            )}

            {/* System Nominal Hold & Entry Button */}
            <div className="intro-footer-action">
                {channelReady && (
                    <div className="system-nominal-tag">
                        SYSTEM STATUS &nbsp; <span className="status-highlight">NOMINAL</span>
                    </div>
                )}

                {showEnterButton && (
                    <div className="enter-button-wrapper">
                        <button
                            type="button"
                            className="enter-securenet-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEnterClicked();
                            }}
                            autoFocus
                        >
                            ENTER SECURENET
                        </button>
                        <div className="enter-subtext">PRESS TO INITIALIZE SECURE BRIEFING</div>
                    </div>
                )}
            </div>
        </div>
    );
}
