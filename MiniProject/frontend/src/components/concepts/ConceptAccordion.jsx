import { useState } from 'react';
import { CONCEPTS_DATA } from './conceptData';

export const ConceptAccordion = ({ items = CONCEPTS_DATA, defaultIndex = 0 }) => {
    const [activeIndex, setActiveIndex] = useState(defaultIndex);

    const handleKeyDown = (index, e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveIndex((index + 1) % items.length);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveIndex((index - 1 + items.length) % items.length);
        }
    };

    return (
        <div
            className="concepts-accordion-wrapper"
            role="list"
            aria-label="Cryptographic concepts accordion gallery"
        >
            <div className="concept-accordion-container">
                {items.map((item, index) => {
                    const isActive = index === activeIndex;

                    return (
                        <div
                            key={item.id}
                            className={`concept-card${isActive ? ' active' : ''}`}
                            onClick={() => setActiveIndex(index)}
                            onMouseEnter={() => setActiveIndex(index)}
                            onFocus={() => setActiveIndex(index)}
                            onKeyDown={e => handleKeyDown(index, e)}
                            role="listitem"
                            tabIndex={0}
                            aria-expanded={isActive}
                            aria-label={`${item.algorithm} - ${item.role}`}
                        >
                            {/* Active Left Accent Line */}
                            <div className="concept-card-accent-line" aria-hidden="true" />

                            {/* Top Header Information */}
                            <div className="concept-card-top">
                                <span className="concept-number">{item.id}</span>
                                <h3 className="concept-algorithm">{item.algorithm}</h3>
                                <span className="concept-role">{item.role}</span>
                            </div>

                            {/* Body Description */}
                            <div className="concept-card-body">
                                {isActive ? (
                                    <p className="concept-full-desc">{item.description}</p>
                                ) : (
                                    <p className="concept-short-desc">{item.shortDescription}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
