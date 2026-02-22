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
    <div style={{ minHeight: '100vh', background: P.void, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: P.dim, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '10px' }}>
        {isDungeon ? 'Build Your Dungeon' : 'Assemble Your Party'}
      </div>
      <div style={{ color: P.muted, fontSize: '16px', marginBottom: '28px' }}>
        Select {maxSelect} {isDungeon ? 'encounter rooms' : 'party members'} · {selected.length}/{maxSelect} chosen
      </div>

      <div style={{ display: 'flex', gap: '28px', maxWidth: '1200px', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Selection grid */}
        <div style={{ flex: '1 1 650px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
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
                padding: '18px', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.3s',
                boxShadow: isSelected ? `0 0 20px ${accent}20` : 'none',
                opacity: !isSelected && selected.length >= maxSelect ? 0.4 : 1,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ color: isSelected ? palette?.glow || accent : P.text, fontWeight: 700, fontSize: '17px' }}>{item.name}</span>
                  {isDungeon && <span style={{ color: accent, fontSize: '12px', fontWeight: 600, padding: '3px 8px', background: `${accent}20`, borderRadius: '3px' }}>{palette?.winCon}</span>}
                  {!isDungeon && <span style={{ color: P.muted, fontSize: '13px', textTransform: 'uppercase' }}>{item.role}</span>}
                </div>
                {isDungeon && <div style={{ display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {item.tags.map(t => <span key={t} style={{ fontSize: '11px', color: P.dim, background: `${P.surface}80`, padding: '2px 7px', borderRadius: '3px' }}>{t}</span>)}
                </div>}
                {!isDungeon && <div style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '14px' }}>
                  <span style={{ color: CATEGORY_COLORS.Strike }}>♥{item.vitality}</span>
                  <span style={{ color: CATEGORY_COLORS.Test }}>◆{item.resolveContribution}</span>
                  <span style={{ color: CATEGORY_COLORS.React }}>◇{item.nerveContribution}</span>
                </div>}
                <div style={{ color: P.muted, fontSize: '13px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {isDungeon ? item.description : `${item.party} · ${item.deck.length} cards`}
                </div>
                {isDungeon && <div style={{ display: 'flex', gap: '8px', marginTop: '10px', fontSize: '13px' }}>
                  <span style={{ color: CATEGORY_COLORS.Counter }}>STR +{item.contributions.structure}</span>
                  <span style={{ color: CATEGORY_COLORS.Disrupt }}>VEI +{item.contributions.veil}</span>
                  <span style={{ color: CATEGORY_COLORS.React }}>PRE +{item.contributions.presence}</span>
                </div>}
              </button>
            );
          })}
        </div>

        {/* Preview panel */}
        <div style={{ flex: '0 0 320px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {template && isDungeon && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: '12px', padding: '20px' }}>
              <div style={{ color: P.dim, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Dungeon Stats</div>
              <ResourceBar label="Structure" value={template.structure} max={20} color={CATEGORY_COLORS.Counter} />
              <div style={{ height: 8 }} />
              <ResourceBar label="Veil" value={template.veil} max={16} color={CATEGORY_COLORS.Disrupt} />
              <div style={{ height: 8 }} />
              <ResourceBar label="Presence" value={template.presence} max={16} color={CATEGORY_COLORS.React} />
            </div>
          )}
          {template && !isDungeon && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: '4px', padding: '20px' }}>
              <div style={{ color: P.dim, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Party Stats</div>
              <ResourceBar label="Resolve" value={template.resolve} max={28} color={CATEGORY_COLORS.Test} />
              <div style={{ height: 8 }} />
              <ResourceBar label="Nerve" value={template.nerve} max={28} color={CATEGORY_COLORS.React} />
              <div style={{ height: 10 }} />
              <div style={{ fontSize: '14px', color: P.muted }}>
                {Object.values(template.members).map(m => (
                  <div key={m.name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0' }}>
                    <span>{m.name}</span>
                    <span style={{ color: CATEGORY_COLORS.Strike }}>♥{m.vitality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {profile && <ArchetypeDisplay archetype={profile.archetype} side={side} />}

          {profile && (
            <div style={{ background: P.deep, border: `1px solid ${P.border}`, borderRadius: isDungeon ? '12px' : '4px', padding: '20px' }}>
              <div style={{ color: P.dim, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '14px' }}>Weight Profile</div>
              {Object.entries(profile.weights).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ color: CATEGORY_COLORS[cat] || P.muted, fontSize: '12px', width: '60px', textTransform: 'uppercase', fontWeight: 600 }}>{cat}</span>
                  <div style={{ flex: 1, height: '6px', background: P.surface, borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${clamp((val / 4) * 100, 0, 100)}%`, height: '100%', background: CATEGORY_COLORS[cat] || P.muted, borderRadius: '3px' }} />
                  </div>
                  <span style={{ color: P.dim, fontSize: '12px', width: '28px', textAlign: 'right', fontFamily: 'monospace' }}>{val.toFixed(1)}</span>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onBack} style={{ flex: 1, padding: '12px', background: 'transparent', border: `1px solid ${P.border}`, color: P.muted, borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>← Back</button>
            <button onClick={() => ready && onConfirm(selected)} disabled={!ready} style={{
              flex: 2, padding: '12px', background: ready ? (isDungeon ? '#4a7c3f' : '#8a9bb0') : P.surface,
              border: 'none', color: ready ? '#fff' : P.dim, borderRadius: isDungeon ? '8px' : '4px',
              cursor: ready ? 'pointer' : 'default', fontSize: '15px', fontWeight: 600,
              transition: 'all 0.3s', opacity: ready ? 1 : 0.5,
            }}>Review Deck →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
