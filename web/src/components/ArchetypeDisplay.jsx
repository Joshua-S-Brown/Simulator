import React from 'react';
import { P } from '../styles/palette.js';

export default function ArchetypeDisplay({ archetype, side }) {
  if (!archetype) return null;

  const isDungeon = side === 'dungeon';

  return (
    <div style={{
      padding: '12px 16px',
      background: `${P.stone}88`,
      border: `1px solid ${P.border}`,
      borderRadius: isDungeon ? '12px' : '4px',
      marginTop: '12px',
    }}>
      <div style={{
        color: P.text,
        fontSize: '14px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '4px',
      }}>
        {archetype.name}
      </div>
      <div style={{
        color: P.muted,
        fontSize: '12px',
        lineHeight: 1.4,
        fontStyle: 'italic',
      }}>
        {archetype.desc}
      </div>
    </div>
  );
}
