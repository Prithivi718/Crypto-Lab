import { ConceptAccordion } from './ConceptAccordion';

export const CryptographicConcepts = () => {
    return (
        <section id="concepts" className="concepts-section" aria-label="Cryptographic Concepts">
            <div className="container">

                {/* Section Header */}
                <div className="concepts-header-block">
                    <span className="concepts-section-tag">03 &mdash; CRYPTOGRAPHIC CONCEPTS</span>
                    <h2 className="concepts-main-title">The Cryptographic Stack</h2>
                    <p className="concepts-description">
                        Five cryptographic mechanisms work together to establish identity, derive session keys, protect payloads, and verify transmitted data.
                    </p>
                </div>

                {/* Text-Only Horizontal Accordion Gallery */}
                <ConceptAccordion />

            </div>
        </section>
    );
};
