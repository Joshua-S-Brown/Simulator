import React, { useState, useMemo } from 'react';
import { P, CATEGORY_COLORS, ROOM_PALETTE, MEMBER_PALETTE } from '../styles/palette.js';
import { ENCOUNTERS } from '../data/game-data.js';
import { MEMBERS } from '../data/game-data.js';
import { buildDungeonTemplate, buildPartyTemplate } from '@lib/template-builder.js';
import { buildDungeonProfile, buildVisitorProfile } from '../engine/profile-builder.js';
import ResourceBar from '../components/ResourceBar.jsx';
import ArchetypeDisplay from '../components/ArchetypeDisplay.jsx';

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function Composition({ side, onConfirm, onBack }) {
  const isDungeon = side === 'dungeon';
  const allKeys = isDungeon ? Object.keys(ENCOUNTERS) : Object.keys(MEMBERS);
  const maxSelect = isDungeon ? 3 : 4;
  const [selected, setSelected] = useState([]);

  const toggle = (key) => {
    setSelected(prev => {
      if (prev.includes(key)) return prev.filter(k => k !== key);
      if (prev.length >= maxSelect) return prev;
      return [...prev, key];
    });
  };

  const template = useMemo(() => {
    if (isDungeon && selected.length === 3) return buildDungeonTemplate(selected);
    if (!isDungeon && selected.length === 4) return buildPartyTemplate(selected);
    return null;
  }, [selected, isDungeon]);

  const profile = useMemo(() => {
    if (isDungeon && selected.length === 3) return buildDungeonProfile(selected);
    if (!isDungeon && selected.length === 4) return buildVisitorProfile(selected);
    return null;
  }, [selected, isDungeon]);

  const ready = selected.length === maxSelect;

  return (
    <div style={{ minHeight: '100vh', background: P.void, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: P.dim, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '8px' }}>
        {isDungeon ? 'Build Your Dungeon' : 'Assemble Your Party'}
      </div>
      <div style={{ color: P.muted, fontSize: '13px', marginBottom: '24px' }}>
        Select {maxSelect} {isDungeon ? 'encounter rooms' : 'party members'} · {selected.length}/{maxSelect} chosen
      </div>

      <div style={{ display: 'flex', gap: '24px', maxWidth: '1100px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Selection grid */}
        <div style={{ flex: '1 1 600px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {allKeys.map(key => {
            const isSelected = selected.includes(key);
            const item = isDungeon ? ENCOUNTERS[key] : MEMBERS[key];
            const palette = isDungeon ? ROOM_PALETTE[key] : MEMBER_PALETTE[key];
            const accent = palette?.primary || '#888';
            return (
              <button key={key} onClick={() => toggle(key)} style={{
                background: isSelected ? `linear-gradient(135deg, ${accent}20, ${P.deep})` : P.deep,
                border: `1px solid ${isSelected ? accent : P.border}`,
                borderRadius: isDungeon ? '12px' : '4px',
                padding: '16px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.3s',
                boxShadow: isSelected ? `0 0 20px ${accent}20` : 'none',
                opacity: !isSelected && selected.length >= maxSelect ? 0.4 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ color: isSelected ? palette?.glow || accent : P.text, fontWeight: 700, fontSize: '14px' }}>{item.name}</span>
                  {isDungeon && <span style={{ color: accent, fontSize: '10px', fontWeight: 600, padding: '2px 6px', background: `${accent}20`, borderRadius: '3px' }}>{palette?.winCon}</span>}
                  {!isDungeon && <span style={{ color: P.muted, fontSize: '10px', textTransform: 'uppercase' }}>{item.role}</span>}
                </div>
                {isDungeon && <div style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {item.tags.map(t => <span key={t} style={{ fontSize: '9px', color: P.dim, background: `${P.surface}80`, padding: '1px 5px', borderRadius: '2px' }}>{t}</span>)}
                </div>}
                {!isDungeon && <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', fontSize: '11px' }}>
                  <span style={{ color: '#c44' }}>♥{item.vitality}</span>
                  <span style={{ color: '#69a' }}>◆{item.resolveContribution}</span>
                  <span style={{ color: '#a7a' }}>◇{item.nerveContribution}</span>
                </div>}
                <div style={{ color: P.dim, fontSize: '11px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {isDungeon ? item.description : `${item.party} · ${item.deck.length} cards`}
                </div>
                {isDungeon && <div style={{ display: 'flex', gap: '6px', marginTop: '8px', fontSize: '10px' }}>
                  <span style={{ color: '#6a9' }}>STR +{item.contributions.structure}</span>
                  <span style={{ color: '#89c' }}>VEI +{item.contributions.veil}</span>
                  <span style={{ color: '#a7a' }}>PRE +{item.contributions.presence}</span>
                </div>}
              </button>
            );
          })}
        </div>

        {/* Preview panel */}
        <div style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {template && isDungeon && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: P.dim, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Dungeon Stats</div>
              <ResourceBar label="Structure" value={template.structure} max={20} color="#6a9" />
              <div style={{ height: 6 }} />
              <ResourceBar label="Veil" value={template.veil} max={16} color="#89c" />
              <div style={{ height: 6 }} />
              <ResourceBar label="Presence" value={template.presence} max={16} color="#a7a" />
            </div>
          )}
          {template && !isDungeon && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: '4px', padding: '16px' }}>
              <div style={{ color: P.dim, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Party Stats</div>
              <ResourceBar label="Resolve" value={template.resolve} max={28} color="#69a" />
              <div style={{ height: 6 }} />
              <ResourceBar label="Nerve" value={template.nerve} max={28} color="#a7a" />
              <div style={{ height: 8 }} />
              <div style={{ fontSize: '11px', color: P.muted }}>
                {Object.values(template.members).map(m => (
                  <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                    <span>{m.name}</span>
                    <span style={{ color: '#c44' }}>♥{m.vitality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile && <ArchetypeDisplay archetype={profile.archetype} side={side} />}

          {profile && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: isDungeon ? '12px' : '4px', padding: '16px' }}>
              <div style={{ color: P.dim, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '12px' }}>Weight Profile</div>
              {Object.entries(profile.weights).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ color: CATEGORY_COLORS[cat] || P.muted, fontSize: '10px', width: '50px', textTransform: 'uppercase' }}>{cat}</span>
                  <div style={{ flex: 1, height: '4px', background: P.surface, borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${clamp((val / 4) * 100, 0, 100)}%`, height: '100%', background: CATEGORY_COLORS[cat] || P.muted, borderRadius: '2px' }} />
                  </div>
                  <span style={{ color: P.dim, fontSize: '10px', width: '24px', textAlign: 'right', fontFamily: 'monospace' }}>{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onBack} style={{ flex: 1, padding: '10px', background: 'transparent', border: `1px solid ${P.border}`, color: P.muted, borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>← Back</button>
            <button onClick={() => ready && onConfirm(selected)} disabled={!ready} style={{
              flex: 2, padding: '10px', background: ready ? (isDungeon ? '#4a7c3f' : '#8a9bb0') : P.surface,
              border: 'none', color: ready ? '#fff' : P.dim, borderRadius: isDungeon ? '8px' : '4px',
              cursor: ready ? 'pointer' : 'default', fontSize: '13px', fontWeight: 600,
              transition: 'all 0.3s', opacity: ready ? 1 : 0.5,
            }}>Review Deck →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
