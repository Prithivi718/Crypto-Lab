import { useEffect, useRef } from 'react';
import TeamShowcase from './TeamShowcase';
import './TeamOverlay.css';

export default function TeamOverlay({ isOpen, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (panelRef.current && !panelRef.current.contains(e.target)) {
      onClose();
    }
  };

  return (
    <div className="team-overlay" role="dialog" aria-modal="true" aria-label="Team members" onMouseDown={handleBackdropClick}>
      <div className="team-overlay-panel" ref={panelRef}>
        <button type="button" className="team-overlay-close" onClick={onClose} aria-label="Close team overlay">
          &times;
        </button>
        <TeamShowcase />
      </div>
    </div>
  );
}