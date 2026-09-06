import React, { useState } from 'react';
import ShapeGrid from '../backgrounds/ShapeGrid';
import { MissionUpload } from './MissionUpload';

export const MissionIntake = ({
    onStartWorkflow = () => { },
    onRunProcess = () => { }
}) => {
    const [selectedFile, setSelectedFile] = useState(null);

    const handleStartWorkflow = () => {
        onStartWorkflow(selectedFile);
        const element = document.getElementById('pipeline');
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    const handleRunProcess = () => {
        onRunProcess(selectedFile);
        const element = document.getElementById('analysis');
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <section id="mission" className="mission-hero-section" aria-label="Mission Intake">
            {/* Interactive Shape Grid Canvas Background */}
            <div className="mission-shape-grid-bg">
                <ShapeGrid
                    direction="right"
                    speed={0.5}
                    squareSize={48}
                    borderColor="rgba(106, 115, 55, 0.18)"
                    hoverFillColor="rgba(43, 49, 10, 0.45)"
                    hoverTrailAmount={2}
                />
            </div>

            {/* Radial Vignette Overlay */}
            <div className="mission-hero-overlay" aria-hidden="true" />

            {/* Foreground Hero Content Container */}
            <div className="container mission-hero-content">
                <div className="hero-two-column">

                    {/* Left Column */}
                    <div className="hero-left-col">
                        <span className="hero-eyebrow-badge type-mono-xs">
                            CONTROLLED ACCESS // LEVEL 04
                        </span>

                        <h1 className="hero-main-title type-display-xl">
                            Transmit with
                            <br />
                            <span className="hero-title-accent">absolute confidence.</span>
                        </h1>

                        <p className="hero-description-paragraph type-body-lg">
                            SecureNet orchestrates a complete cryptographic pipeline for sensitive defence communications. Drop a mission briefing to begin a verified, end-to-end transmission.
                        </p>
                    </div>

                    {/* Right Column */}
                    <div className="hero-right-col">
                        {/* Secure Terminal Upload Module */}
                        <MissionUpload onFileSelected={(file) => setSelectedFile(file)} />

                        {/* CTAs Row below Upload Box */}
                        <div className="hero-cta-row">
                            <button
                                className="cta-demo-button"
                                onClick={handleStartWorkflow}
                                type="button"
                            >
                                Run secure demonstration &rarr;
                            </button>

                            <button
                                className="cta-algo-button"
                                onClick={handleRunProcess}
                                type="button"
                            >
                                Run algorithm
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
