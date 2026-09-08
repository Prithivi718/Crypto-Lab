/**
 * IntroSpeech.jsx
 * 
 * Renders the centered SecureNet logo and sentence-by-sentence tactical briefing
 * during the TTS speech phase.
 */

import React from 'react';
import logo from '../../assets/logo.png';

const SENTENCES = [
    "Welcome to SecureNet.",
    "Defence communication systems initialized.",
    "Your secure transmission channel is ready."
];

export function IntroSpeech({ activeSentenceIndex, isLogoVisible, logoRef }) {
    return (
        <div className="intro-speech-container">
            {/* Center Logo Reveal */}
            <div className={`center-logo-wrapper ${isLogoVisible ? 'visible' : ''}`}>
                <img
                    ref={logoRef}
                    src={logo}
                    alt="SecureNet Tactical Logo"
                    className="intro-center-logo"
                />
            </div>

            {/* Sentence-by-Sentence Briefing */}
            <div className="briefing-box">
                <div className="briefing-header">DEFENCE BRIEFING TELEMETRY</div>

                <div className="briefing-sentences">
                    {SENTENCES.map((text, idx) => {
                        const isActive = idx === activeSentenceIndex;
                        const isPast = idx < activeSentenceIndex;
                        const isFuture = idx > activeSentenceIndex;

                        return (
                            <div
                                key={idx}
                                className={`briefing-sentence ${isActive ? 'active' : ''} ${isPast ? 'past' : ''} ${isFuture ? 'future' : ''}`}
                            >
                                <span className="sentence-prompt">{isActive ? '>' : ' '}</span>
                                <span className="sentence-text">{text}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
