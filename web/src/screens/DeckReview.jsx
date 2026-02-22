import React, { useState, useMemo } from 'react';
import { P, CATEGORY_COLORS, ROOM_PALETTE, MEMBER_PALETTE } from '../styles/palette.js';
import { ENCOUNTERS } from '../data/game-data.js';
import { MEMBERS } from '../data/game-data.js';
import GameCard from '../components/GameCard.jsx';

export default function DeckReview({ side, selected, onBack, onReady }) {
  const isDungeon = side === 'dungeon';
  const [activeTab, setActiveTab] = useState(0);

  const tabs = useMemo(() => {
    if (isDungeon) return selected.map(key => ({ key, label: ENCOUNTERS[key].name, cards: ENCOUNTERS[key].deck }));
    return selected.map(key => ({ key, label: MEMBERS[key].name, cards: MEMBERS[key].deck }));
  }, [selected, isDungeon]);

  const tab = tabs[activeTab];
  const catGroups = useMemo(() => {
    const groups = {};
    for (const card of tab.cards) {
      if (!groups[card.category]) groups[card.category] = [];
      groups[card.category].push(card);
    }
    return groups;
  }, [tab]);

  return (
    <div style={{ minHeight: '100vh', background: P.void, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: P.dim, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '16px' }}>
        Deck Review — {isDungeon ? 'Dungeon Rooms' : 'Party Members'}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tabs.map((t, i) => {
          const palette = isDungeon ? ROOM_PALETTE[t.key] : MEMBER_PALETTE[t.key];
          const active = i === activeTab;
          return (
            <button key={t.key} onClick={() => setActiveTab(i)} style={{
              padding: '8px 20px', background: active ? `${palette?.primary}30` : 'transparent',
              border: `1px solid ${active ? palette?.primary : P.border}`,
              borderRadius: isDungeon ? '8px' : '3px', cursor: 'pointer',
              color: active ? (palette?.glow || P.text) : P.muted,
              fontSize: '12px', fontWeight: active ? 600 : 400, transition: 'all 0.3s',
            }}>{t.label} <span style={{ fontSize: '10px', opacity: 0.6 }}>({t.cards.length})</span></button>
          );
        })}
      </div>

      {/* Card grid by category */}
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        {Object.entries(catGroups).map(([cat, cards]) => (
          <div key={cat} style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: CATEGORY_COLORS[cat] }} />
              <span style={{ color: CATEGORY_COLORS[cat], fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</span>
              <span style={{ color: P.dim, fontSize: '11px' }}>({cards.length})</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cards.map((card, j) => (
                <GameCard key={j} card={card} small roomKey={isDungeon ? tab.key : null} memberKey={!isDungeon ? tab.key : null} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '24px', padding: '16px', background: P.deep, borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onBack} style={{ padding: '10px 20px', background: 'transparent', border: `1px solid ${P.border}`, color: P.muted, borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>← Composition</button>
        <div style={{ flex: 1, textAlign: 'center', color: P.dim, fontSize: '11px', minWidth: '120px' }}>
          {tabs.reduce((sum, t) => sum + t.cards.length, 0)} total cards across {tabs.length} {isDungeon ? 'rooms' : 'members'}
        </div>
        <button onClick={onReady} style={{
          padding: '10px 32px', background: P.surface, border: `1px solid ${P.border}`,
          color: P.dim, borderRadius: isDungeon ? '8px' : '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
        }}>
          Ready — Awaiting Phase 2 ⏳
        </button>
      </div>
    </div>
  );
}
