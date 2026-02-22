import React from 'react';
import { P } from '../styles/palette.js';

export default function ResourceBar({ label, value, max, color }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '4px',
      }}>
        <span style={{ color: P.muted, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '12px', fontWeight: 600 }}>
          {label}
        </span>
        <span style={{ color: P.text, fontFamily: 'monospace', fontWeight: 700, fontSize: '14px' }}>
          {value}
        </span>
      </div>
      <div style={{
        height: '8px',
        background: P.stone,
        borderRadius: '4px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: color,
          borderRadius: '4px',
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}
