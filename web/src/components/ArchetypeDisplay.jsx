import React from 'react';
import { P } from '../styles/palette.js';

export default function ArchetypeDisplay({ archetype, side }) {
  if (!archetype) return null;

  const isDungeon = side === 'dungeon';

  return (
    <div style={{
      padding: '16px 20px',
      background: `${P.stone}88`,
      border: `1px solid ${P.border}`,
      borderRadius: isDungeon ? '12px' : '4px',
    }}>
      <div style={{
        color: P.text,
        fontSize: '17px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '6px',
      }}>
        {archetype.name}
      </div>
      <div style={{
        color: P.muted,
        fontSize: '14px',
        lineHeight: 1.5,
        fontStyle: 'italic',
      }}>
        {archetype.desc}
      </div>
    </div>
  );
}
