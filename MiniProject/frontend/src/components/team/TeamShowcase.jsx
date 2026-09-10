import { useState } from 'react';
import { TwitterIcon, LinkedInIcon, InstagramIcon, BehanceIcon } from './SocialIcons';
import { teamMembers as defaultMembers } from './teamData';
import './TeamShowcase.css';

export default function TeamShowcase({ members = defaultMembers }) {
  const [hoveredId, setHoveredId] = useState(null);

  const col1 = members.filter((_, i) => i % 3 === 0);
  const col2 = members.filter((_, i) => i % 3 === 1);
  const col3 = members.filter((_, i) => i % 3 === 2);

  return (
    <div className="team-showcase">
      <div className="team-photo-grid">
        <div className="team-photo-col team-photo-col-1">
          {col1.map(m => (
            <PhotoCard key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} sizeClass="team-photo-sm" />
          ))}
        </div>
        <div className="team-photo-col team-photo-col-2">
          {col2.map(m => (
            <PhotoCard key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} sizeClass="team-photo-lg" />
          ))}
        </div>
        <div className="team-photo-col team-photo-col-3">
          {col3.map(m => (
            <PhotoCard key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} sizeClass="team-photo-md" />
          ))}
        </div>
      </div>

      <div className="team-member-list">
        {members.map(m => (
          <MemberRow key={m.id} member={m} hoveredId={hoveredId} onHover={setHoveredId} />
        ))}
      </div>
    </div>
  );
}

function PhotoCard({ member, sizeClass, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;

  return (
    <div
      className={`team-photo-card ${sizeClass}${isDimmed ? ' team-dimmed' : ''}`}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <img
        src={member.image}
        alt={member.name}
        className={`team-photo-img${isActive ? ' team-photo-active' : ''}`}
      />
    </div>
  );
}

function MemberRow({ member, hoveredId, onHover }) {
  const isActive = hoveredId === member.id;
  const isDimmed = hoveredId !== null && !isActive;
  const hasSocial = member.social && Object.values(member.social).some(Boolean);

  return (
    <div
      className={`team-member-row${isDimmed ? ' team-dimmed' : ''}`}
      onMouseEnter={() => onHover(member.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="team-member-heading">
        <span className={`team-member-dot${isActive ? ' team-dot-active' : ''}`} />
        <span className={`team-member-name${isActive ? ' team-name-active' : ''}`}>{member.name}</span>

        {hasSocial && (
          <div className={`team-member-social${isActive ? ' team-social-visible' : ''}`}>
            {member.social.twitter && (
              <a href={member.social.twitter} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="team-social-link" title="X / Twitter">
                <TwitterIcon />
              </a>
            )}
            {member.social.linkedin && (
              <a href={member.social.linkedin} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="team-social-link" title="LinkedIn">
                <LinkedInIcon />
              </a>
            )}
            {member.social.instagram && (
              <a href={member.social.instagram} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="team-social-link" title="Instagram">
                <InstagramIcon />
              </a>
            )}
            {member.social.behance && (
              <a href={member.social.behance} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} className="team-social-link" title="Behance">
                <BehanceIcon />
              </a>
            )}
          </div>
        )}
      </div>

      <p className="team-member-role">{member.role}</p>
    </div>
  );
}