import React from 'react';
import { P } from '../styles/palette.js';

export default function ResourceBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div style={{ marginBottom: '6px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '11px',
        marginBottom: '3px',
      }}>
        <span style={{ color: P.muted, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '10px' }}>
          {label}
        </span>
        <span style={{ color: P.text, fontFamily: 'monospace', fontWeight: 600 }}>
          {value}
        </span>
      </div>
      <div style={{
        height: '6px',
        background: P.stone,
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '3px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
