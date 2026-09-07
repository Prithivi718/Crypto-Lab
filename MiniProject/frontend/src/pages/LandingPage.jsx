import './LandingPage.css';
import { Navbar } from '../components/layout/Navbar';
import GridDistortion from '../components/backgrounds/GridDistortion';
import { Container } from '../components/layout/Container';
import { Button } from '../components/common/Button';
import landingImage from '../assets/landing-page.png';

export default function LandingPage() {
    const scrollToMission = (e) => {
        if (e) e.preventDefault();
        const element = document.getElementById('mission');
        if (element) {
            const yOffset = -80;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <section id="home" className="hero-section" aria-label="Hero landing section">

            {/* Layer 1: WebGL grid distortion background */}
            <div className="hero-bg">
                <GridDistortion
                    imageSrc={landingImage}
                    grid={20}
                    mouse={0.20}
                    strength={0.1}
                    relaxation={0.95}
                />
            </div>

            {/* Layer 2: Dark olive overlay */}
            <div className="hero-overlay" aria-hidden="true" />

            {/* Layer 3: Vignette */}
            <div className="hero-vignette" aria-hidden="true" />

            {/* Layer 4: Foreground content */}
            <div className="hero-content-layer">
                <Container>
                    <div className="hero-content">

                        {/* Eyebrow */}
                        <span className="hero-eyebrow type-mono-sm text-muted">
                            SECURE TODAY // SAFER TOMORROW
                        </span>

                        {/* Divider rule */}
                        <div className="hero-divider" aria-hidden="true" />

                        {/* Headline */}
                        <h1 className="hero-headline type-display-xl">
                            Secure communication.
                            <br />
                            Without compromise.
                        </h1>

                        {/* Description */}
                        <p className="hero-description type-body-lg">
                            SecureNet demonstrates a verified end-to-end communication pipeline combining modern key exchange, session encryption, and message authentication.
                        </p>

                        {/* CTAs */}
                        <div className="hero-actions">
                            <Button variant="primary" className="hero-cta-primary" onClick={scrollToMission}>
                                ENTER SECURE NETWORK &rarr;
                            </Button>
                            <Button variant="ghost" className="hero-cta-secondary" onClick={scrollToMission}>
                                EXPLORE PIPELINE
                            </Button>
                        </div>

                        {/* Technical microcopy */}
                        <div className="hero-tech-stack" aria-label="Encryption protocols">
                            <span className="type-mono-xs text-muted">AES-256-GCM</span>
                            <span className="hero-tech-separator" aria-hidden="true">/</span>
                            <span className="type-mono-xs text-muted">ED25519</span>
                            <span className="hero-tech-separator" aria-hidden="true">/</span>
                            <span className="type-mono-xs text-muted">ECDH</span>
                            <span className="hero-tech-separator" aria-hidden="true">/</span>
                            <span className="type-mono-xs text-muted">HKDF</span>
                        </div>

                    </div>
                </Container>
            </div>

        </section>
    );
}
