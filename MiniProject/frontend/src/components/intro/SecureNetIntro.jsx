/**
 * SecureNetIntro.jsx
 * 
 * Master controller for the cinematic 2-Phase SecureNet intro experience.
 * Implements strict state machine:
 * Phase 1: SYSTEM INITIALIZATION -> INITIALIZE BUTTON (plays hammer audio ONCE) -> 4-Stage (25% hits) Loader -> SECURE CHANNEL READY
 * Phase 2: ENTER SECURENET -> CENTER LOGO REVEAL -> TTS BRIEFING -> LOGO TRANSITION TO NAVBAR -> ENTERED
 * 
 * On ENTERED: intro overlay disappears, revealing the real LandingPage whose
 * GridDistortion component naturally provides the grid-to-image resolve effect.
 * 
 * Also supports immediate [ SKIP INTRO ] control to bypass cinematic sequence directly to Home.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSecureNetTTS } from '../../hooks/useSecureNetTTS';
import { useIntroAudio } from '../../hooks/useIntroAudio';
import { IntroProgress } from './IntroProgress';
import { IntroSpeech } from './IntroSpeech';
import { IntroLogoTransition } from './IntroLogoTransition';
import './SecureNetIntro.css';

const SENTENCES = [
    "Welcome to SecureNet.",
    "Defence communication systems initialized.",
    "Your secure transmission channel is ready."
];

export function SecureNetIntro({ onIntroComplete, onStartTransition }) {
    // State Machine:
    // INIT_READY_STATES -> AWAITING_PROGRESS_GESTURE -> PROGRESS -> CHANNEL_READY -> WAITING_FOR_ENTRY -> SPEAKING -> SPEECH_COMPLETE -> LOGO_TRANSITION -> ENTERED
    const [phase, setPhase] = useState('INIT_READY_STATES');
    const [authReady, setAuthReady] = useState(false);
    const [keyReady, setKeyReady] = useState(false);
    const [encReady, setEncReady] = useState(false);
    const [readyStatesComplete, setReadyStatesComplete] = useState(false);

    const [progressStage, setProgressStage] = useState(0); // 0 to 4
    const [impactActive, setImpactActive] = useState(false);

    const [activeSentenceIndex, setActiveSentenceIndex] = useState(0);
    const [isLogoVisible, setIsLogoVisible] = useState(false);

    const [logoStartRect, setLogoStartRect] = useState(null);
    const [navbarLogoTargetRect, setNavbarLogoTargetRect] = useState(null);

    const logoRef = useRef(null);
    const hasStartedProgressRef = useRef(false);
    const hasEnteredRef = useRef(false);

    // Modular Hooks
    const { unlockAudio, playHammerOnce, stopAudio } = useIntroAudio();
    const {
        speakSentence,
        isMuted,
        toggleVoice,
        isSupported: isTTSSupported
    } = useSecureNetTTS({
        voiceName: 'Andrew', // Customized voice: Andrew (en-US)
        lang: 'en-US',
        rate: 1.1,           // Custom rate: 1.1
        pitch: 0.5           // Custom pitch: 0.5
    });

    // Lock scroll during intro & ensure audio stops when unmounting
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            stopAudio();
        };
    }, [stopAudio]);

    // 1. Phase 1: Sequential Readiness Checks (0.0s, 0.3s, 0.8s, 1.3s)
    useEffect(() => {
        if (phase !== 'INIT_READY_STATES') return;

        const timers = [];

        timers.push(setTimeout(() => setAuthReady(true), 300));
        timers.push(setTimeout(() => setKeyReady(true), 800));
        timers.push(setTimeout(() => setEncReady(true), 1300));

        timers.push(setTimeout(() => {
            setReadyStatesComplete(true);
            setPhase('AWAITING_PROGRESS_GESTURE');
        }, 1350));

        return () => {
            timers.forEach(t => clearTimeout(t));
        };
    }, [phase]);

    // Handle Start Initialize Button Click -> Play Hammer Sound ONCE & Start 4-Stage Visual Sequence
    const handleStartProgressGesture = useCallback(() => {
        if (hasStartedProgressRef.current) return;
        hasStartedProgressRef.current = true;

        // Play hammer sound asset EXACTLY ONCE (NO OVERLAP)
        playHammerOnce();

        setPhase('PROGRESS');
    }, [playHammerOnce]);

    // Handle Skip Intro -> Immediately stop audio, set sessionStorage, and reveal Home
    const handleSkipIntro = useCallback(() => {
        stopAudio();
        try {
            sessionStorage.setItem('securenet-intro-seen', 'true');
        } catch (err) {
            console.warn('[SecureNet Intro] Failed to save sessionStorage key on skip:', err);
        }

        setPhase('ENTERED');
        document.body.style.overflow = '';
        onIntroComplete?.();
    }, [stopAudio, onIntroComplete]);

    // 2. Phase 1: 4-Stage (25% per hit) Visual Progress Sequence
    useEffect(() => {
        if (phase !== 'PROGRESS') return;

        const timers = [];

        const triggerHit = (stage) => {
            setProgressStage(stage);
            setImpactActive(true);
            setTimeout(() => setImpactActive(false), 300);
        };

        // Stage 1 (25% at 1.0s)
        timers.push(setTimeout(() => triggerHit(1), 1000));
        // Stage 2 (50% at 2.0s)
        timers.push(setTimeout(() => triggerHit(2), 2000));
        // Stage 3 (75% at 3.0s)
        timers.push(setTimeout(() => triggerHit(3), 3000));
        // Stage 4 (100% at 4.0s)
        timers.push(setTimeout(() => triggerHit(4), 4000));

        // Transition to SECURE CHANNEL READY at 5.0s
        timers.push(setTimeout(() => {
            setPhase('CHANNEL_READY');
        }, 5000));

        return () => {
            timers.forEach(t => clearTimeout(t));
        };
    }, [phase]);

    // Hold CHANNEL_READY for 1.5s, then reveal ENTER SECURENET button
    useEffect(() => {
        if (phase !== 'CHANNEL_READY') return;

        const timer = setTimeout(() => {
            setPhase('WAITING_FOR_ENTRY');
        }, 1500);

        return () => clearTimeout(timer);
    }, [phase]);

    // Handle ENTER SECURENET Click -> Phase 2 Speech Briefing
    const handleEnterClick = useCallback(() => {
        if (hasEnteredRef.current) return;
        hasEnteredRef.current = true;

        unlockAudio();

        setPhase('SPEAKING');
        setIsLogoVisible(true);
        setActiveSentenceIndex(0);

        // Sequence the 3 sentences
        const runSpeechSequence = async () => {
            for (let i = 0; i < SENTENCES.length; i++) {
                setActiveSentenceIndex(i);

                if (isMuted || !isTTSSupported) {
                    await new Promise(r => setTimeout(r, 2200));
                } else {
                    await speakSentence(SENTENCES[i]);
                    await new Promise(r => setTimeout(r, 400));
                }
            }

            setPhase('SPEECH_COMPLETE');
        };

        runSpeechSequence();
    }, [isMuted, isTTSSupported, speakSentence, unlockAudio]);

    // Phase 2: Trigger Logo FLIP Transition after speech completes
    useEffect(() => {
        if (phase !== 'SPEECH_COMPLETE') return;

        const timer = setTimeout(() => {
            let startRect = null;
            if (logoRef.current) {
                startRect = logoRef.current.getBoundingClientRect();
            }

            const navLogoEl = document.getElementById('navbar-brand-logo') || document.querySelector('.brand-logo');
            let targetRect = null;
            if (navLogoEl) {
                targetRect = navLogoEl.getBoundingClientRect();
            }

            setLogoStartRect(startRect);
            setNavbarLogoTargetRect(targetRect);

            onStartTransition?.();

            setPhase('LOGO_TRANSITION');
        }, 400);

        return () => clearTimeout(timer);
    }, [phase, onStartTransition]);

    // Logo Transition Completion -> Save sessionStorage & reveal real Home (GridDistortion handles the visual transition)
    const handleTransitionComplete = useCallback(() => {
        try {
            sessionStorage.setItem('securenet-intro-seen', 'true');
        } catch (err) {
            console.warn('[SecureNet Intro] Failed to save sessionStorage key:', err);
        }

        setPhase('ENTERED');
        onIntroComplete?.();
    }, [onIntroComplete]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (phase === 'AWAITING_PROGRESS_GESTURE') {
                    handleStartProgressGesture();
                } else if (phase === 'WAITING_FOR_ENTRY') {
                    handleEnterClick();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, handleStartProgressGesture, handleEnterClick]);

    if (phase === 'ENTERED') return null;

    return (
        <div className={`securenet-intro-overlay ${phase.toLowerCase()}`}>
            {/* Screen vibration pulse during visual hammer impacts */}
            <div className={`intro-viewport ${impactActive ? 'vibrate-hit' : ''}`}>
                {/* Phase 1: Readiness sequence & 4-stage (25% hits) visual progress bar */}
                {(phase === 'INIT_READY_STATES' || phase === 'AWAITING_PROGRESS_GESTURE' || phase === 'PROGRESS' || phase === 'CHANNEL_READY' || phase === 'WAITING_FOR_ENTRY') && (
                    <IntroProgress
                        readyStatesComplete={readyStatesComplete}
                        hasStartedProgress={phase === 'PROGRESS' || phase === 'CHANNEL_READY' || phase === 'WAITING_FOR_ENTRY'}
                        onStartProgressGesture={handleStartProgressGesture}
                        onSkipIntro={handleSkipIntro}
                        authReady={authReady}
                        keyReady={keyReady}
                        encReady={encReady}
                        progressStage={progressStage}
                        channelReady={phase === 'CHANNEL_READY' || phase === 'WAITING_FOR_ENTRY'}
                        showEnterButton={phase === 'WAITING_FOR_ENTRY'}
                        onEnterClicked={handleEnterClick}
                        impactActive={impactActive}
                        isVoiceMuted={isMuted}
                        onToggleVoice={toggleVoice}
                    />
                )}

                {/* Phase 2: Center logo reveal & sentence briefing */}
                {(phase === 'SPEAKING' || phase === 'SPEECH_COMPLETE') && (
                    <IntroSpeech
                        activeSentenceIndex={activeSentenceIndex}
                        isLogoVisible={isLogoVisible}
                        logoRef={logoRef}
                    />
                )}

                {/* Phase 2: FLIP Logo Transition to Navbar */}
                {phase === 'LOGO_TRANSITION' && logoStartRect && navbarLogoTargetRect && (
                    <IntroLogoTransition
                        startRect={logoStartRect}
                        targetRect={navbarLogoTargetRect}
                        onComplete={handleTransitionComplete}
                    />
                )}


            </div>
        </div>
    );
}
