import { Navbar } from '../components/layout/Navbar';
import LandingPage from './LandingPage';
import { MissionIntake } from '../components/mission/MissionIntake';
import { SecurityIndicators } from '../components/mission/SecurityIndicators';
import { CryptographicConcepts } from '../components/concepts/CryptographicConcepts';

export default function MissionPage() {
    return (
        <div className="mission-page">
            {/* Fixed Navbar with Scrollspy & Smooth Scroll */}
            <Navbar />

            {/* Section 0: Landing Hero with WebGL Grid Distortion background */}
            <LandingPage />

            {/* Section 1: Mission Intake Hero with ShapeGrid & Upload Panel */}
            <MissionIntake />

            {/* Section 2: Security Indicators Bar */}
            <SecurityIndicators />

            {/* Section 3: Cryptographic Concepts Text Accordion Gallery */}
            <CryptographicConcepts />
        </div>
    );
}
