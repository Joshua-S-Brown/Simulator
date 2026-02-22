import React from 'react';
import { P } from '../styles/palette.js';

export default function TitleScreen({ onPlay }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `radial-gradient(ellipse at 50% 40%, #1a2e1820, ${P.void}), ${P.void}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(circle at 30% 60%, #4a7c3f08, transparent 50%), radial-gradient(circle at 70% 30%, #7b4daa08, transparent 50%)` }} />
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '600px', padding: '0 24px' }}>
        <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '6px', color: P.dim, marginBottom: '16px' }}>Second Self Studios</div>
        <h1 style={{
          fontSize: 'clamp(36px, 8vw, 64px)', fontWeight: 800, color: P.text, margin: '0 0 8px', lineHeight: 1.1, letterSpacing: '-1px',
          textShadow: '0 0 40px #4a7c3f20',
        }}>
          SHATTERED<br />DUNGEON
        </h1>
        <p style={{ color: P.muted, fontSize: '15px', fontStyle: 'italic', margin: '0 0 48px', lineHeight: 1.6 }}>
          You discover who you are through how you treat<br />what wanders inside you.
        </p>
        <button
          onClick={onPlay}
          style={{
            background: 'transparent', border: `1px solid ${P.muted}40`, color: P.text,
            padding: '14px 48px', fontSize: '14px', fontWeight: 600, letterSpacing: '3px',
            textTransform: 'uppercase', cursor: 'pointer', borderRadius: '2px',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#6aad55'; e.target.style.color = '#6aad55'; e.target.style.boxShadow = '0 0 30px #4a7c3f20'; }}
          onMouseLeave={e => { e.target.style.borderColor = `${P.muted}40`; e.target.style.color = P.text; e.target.style.boxShadow = 'none'; }}
        >Play</button>
        <div style={{ marginTop: '48px', color: P.dim, fontSize: '10px', letterSpacing: '1px' }}>
          ENGINE v2.9 · DATA v2.7b · PHASE 1
        </div>
      </div>
    </div>
  );
}
