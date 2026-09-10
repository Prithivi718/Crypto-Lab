import { useState, useEffect } from 'react';
import logo from '../../assets/logo.png';
import TeamOverlay from '../team/TeamOverlay';
import './Navbar.css';

const NAV_ITEMS = [
    { id: 'home', label: 'HOME' },
    { id: 'mission', label: 'MISSION' },
    { id: 'indicators', label: 'SECURITY' },
    { id: 'concepts', label: 'CONCEPTS' },
    { id: 'pipeline', label: 'PIPELINE' },
    { id: 'analysis', label: 'ANALYSIS' }
];

export const Navbar = ({ isLogoHidden }) => {
    const [activeSection, setActiveSection] = useState('home');
    const [isTeamOpen, setIsTeamOpen] = useState(false);

    useEffect(() => {
        const sectionIds = ['home', 'mission', 'indicators', 'concepts', 'pipeline', 'analysis'];
        const sections = sectionIds
            .map(id => document.getElementById(id))
            .filter(Boolean);

        if (!sections.length) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -60% 0px',
            threshold: 0
        };

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));

        return () => {
            sections.forEach(section => observer.unobserve(section));
            observer.disconnect();
        };
    }, []);

    const handleNavClick = (e, id) => {
        e.preventDefault();
        setActiveSection(id);

        const element = document.getElementById(id);
        if (element) {
            const yOffset = -80; // height of fixed navbar
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <>
            <nav className="site-navbar" role="navigation" aria-label="Main navigation">
                <div className="navbar-inner">
                    {/* Brand */}
                    <a
                        href="#team"
                        className="navbar-brand"
                        onClick={e => { e.preventDefault(); setIsTeamOpen(true); }}
                        aria-label="Open team showcase"
                        aria-haspopup="dialog"
                    >
                        {/* <a
                    href="#mission"
                    className="navbar-brand"
                    onClick={e => handleNavClick(e, 'mission')}
                    aria-label="SECURENET Home"
                > */}
                        <img
                            id="navbar-brand-logo"
                            src={logo}
                            alt="SecureNet logo"
                            className={`brand-logo${isLogoHidden ? ' logo-hidden' : ''}`}
                            style={isLogoHidden ? { opacity: 0 } : undefined}
                        />
                        <div className="brand-text">
                            <span className="brand-name">SECURENET</span>
                            <span className="brand-sub">DEFENCE COMMUNICATIONS</span>
                        </div>
                    </a>

                    {/* Links */}
                    <ul className="navbar-links" role="list">
                        {NAV_ITEMS.map(item => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    className={`nav-link${activeSection === item.id ? ' active' : ''}`}
                                    onClick={e => handleNavClick(e, item.id)}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
            <TeamOverlay isOpen={isTeamOpen} onClose={() => setIsTeamOpen(false)} />
        </>
    );
};
