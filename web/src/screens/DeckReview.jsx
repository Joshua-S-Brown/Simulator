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
    <div style={{ minHeight: '100vh', background: P.void, padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ color: P.dim, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '4px', marginBottom: '20px' }}>
        Deck Review — {isDungeon ? 'Dungeon Rooms' : 'Party Members'}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '28px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {tabs.map((t, i) => {
          const palette = isDungeon ? ROOM_PALETTE[t.key] : MEMBER_PALETTE[t.key];
          const active = i === activeTab;
          return (
            <button key={t.key} onClick={() => setActiveTab(i)} style={{
              padding: '10px 24px', background: active ? `${palette?.primary}30` : 'transparent',
              border: `1px solid ${active ? palette?.primary : P.border}`,
              borderRadius: isDungeon ? '8px' : '3px', cursor: 'pointer',
              color: active ? (palette?.glow || P.text) : P.muted,
              fontSize: '14px', fontWeight: active ? 600 : 400, transition: 'all 0.3s',
            }}>{t.label} <span style={{ fontSize: '12px', opacity: 0.7 }}>({t.cards.length})</span></button>
          );
        })}
      </div>

      {/* Card grid by category */}
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        {Object.entries(catGroups).map(([cat, cards]) => (
          <div key={cat} style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: CATEGORY_COLORS[cat] }} />
              <span style={{ color: CATEGORY_COLORS[cat], fontSize: '15px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>{cat}</span>
              <span style={{ color: P.dim, fontSize: '14px' }}>({cards.length})</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {cards.map((card, j) => (
                <GameCard key={j} card={card} roomKey={isDungeon ? tab.key : null} memberKey={!isDungeon ? tab.key : null} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div style={{ display: 'flex', gap: '14px', marginTop: '28px', padding: '18px 24px', background: P.deep, borderRadius: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={onBack} style={{ padding: '12px 24px', background: 'transparent', border: `1px solid ${P.border}`, color: P.muted, borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>← Composition</button>
        <div style={{ flex: 1, textAlign: 'center', color: P.dim, fontSize: '14px', minWidth: '140px' }}>
          {tabs.reduce((sum, t) => sum + t.cards.length, 0)} total cards across {tabs.length} {isDungeon ? 'rooms' : 'members'}
        </div>
        <button onClick={onReady} style={{
          padding: '12px 36px', background: P.surface, border: `1px solid ${P.border}`,
          color: P.muted, borderRadius: isDungeon ? '8px' : '4px', cursor: 'pointer', fontSize: '15px', fontWeight: 600,
        }}>
          Ready — Awaiting Phase 2 ⏳
        </button>
      </div>
    </div>
  );
}
