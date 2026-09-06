export const SecurityIndicators = () => {
    const indicators = [
        {
            id: '01',
            title: 'IDENTITY VERIFIED',
            description: 'Ed25519 signatures',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    <path d="m9 12 2 2 4-4" />
                </svg>
            )
        },
        {
            id: '02',
            title: 'KEY DERIVATION COMPLETE',
            description: 'HKDF session-key derivation',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21 2-2 2m-1-1 2 2" />
                    <path d="M11 15.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11Zm0 0V22h4v-3h2v-3" />
                </svg>
            )
        },
        {
            id: '03',
            title: 'AUTHENTICATED ENCRYPTION',
            description: 'AES-256-GCM payloads',
            icon: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
            )
        }
    ];

    return (
        <section id="indicators" className="security-indicators-section" aria-label="Security Indicators">
            <div className="container">
                <div className="indicators-grid">
                    {indicators.map(item => (
                        <div key={item.id} className="indicator-card">
                            <div className="indicator-icon">
                                {item.icon}
                            </div>
                            <div className="indicator-details">
                                <span className="indicator-title">{item.title}</span>
                                <span className="indicator-subtitle">{item.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};
