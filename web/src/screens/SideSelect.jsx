import React, { useState } from 'react';
import { P } from '../styles/palette.js';

export default function SideSelect({ onSelect, onBack }) {
  const [hover, setHover] = useState(null);
  const sides = [
    { id: 'dungeon', title: 'THE DUNGEON', pitch: 'You are the dungeon. Shape what enters.\nDiscover what you become.', radius: '16px', accent: '#4a7c3f', glow: '#6aad55' },
    { id: 'visitor', title: 'THE VISITOR', pitch: 'You are the party. Explore the unknown.\nSurvive or forge a bond.', radius: '4px', accent: '#8a9bb0', glow: '#aab8cc' },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: P.void, padding: '24px', gap: '16px' }}>
      <div style={{ color: P.dim, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px' }}>Choose Your Side</div>
      <div style={{ display: 'flex', gap: '24px', maxWidth: '800px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        {sides.map(s => (
          <button key={s.id} onClick={() => onSelect(s.id)} onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)} style={{
            flex: '1 1 280px', background: hover === s.id ? `linear-gradient(135deg, ${s.accent}15, ${P.deep})` : P.deep,
            border: `1px solid ${hover === s.id ? s.accent : P.border}`,
            borderRadius: s.radius, padding: '48px 32px', cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.4s ease',
            boxShadow: hover === s.id ? `0 0 40px ${s.accent}20, inset 0 0 60px ${s.accent}05` : 'none',
          }}>
            <div style={{ color: hover === s.id ? s.glow : P.text, fontSize: '22px', fontWeight: 700, letterSpacing: '2px', marginBottom: '16px', transition: 'color 0.3s' }}>{s.title}</div>
            <div style={{ color: P.muted, fontSize: '13px', lineHeight: 1.8, whiteSpace: 'pre-line' }}>{s.pitch}</div>
          </button>
        ))}
      </div>
      <button onClick={onBack} style={{ marginTop: '24px', background: 'transparent', border: 'none', color: P.dim, cursor: 'pointer', fontSize: '12px' }}>← Back</button>
    </div>
  );
}
