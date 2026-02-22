import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { ENCOUNTERS, MEMBERS } from '../data/game-data.js';
import { GameEngine, autoCompose } from '@engine/game-adapter.js';
import { createDungeonAI } from '@ai/dungeon-ai.js';
import { createVisitorAI } from '@ai/visitor-ai.js';
import { buildScenario } from '@lib/scenario-builder.js';
import { buildDungeonProfile, buildVisitorProfile } from '@lib/profile-builder.js';

// ═══════════════════════════════════════════════════════════════
// PALETTE — High contrast
// ═══════════════════════════════════════════════════════════════
const P = {
  void: '#080c14', deep: '#0e1420', stone: '#182030', surface: '#1e2a3e',
  text: '#e8ecf2', sub: '#c0c8d8', muted: '#90a0b8', dim: '#6880a0',
  border: '#283848', accent: '#3dccb4', accentGlow: '#55eedd',
};
const CAT = {
  Strike: '#ee5544', Empower: '#eecc33', Disrupt: '#ee8833', Counter: '#55aaee',
  React: '#9977cc', Trap: '#cc5588', Offer: '#44ccaa', Reshape: '#55bb77',
  Energy: '#eebb44', Test: '#99aabb',
};
const RES = {
  structure: '#5599cc', veil: '#9966cc', presence: '#cc9933', rapport: '#44ccaa',
  vitality: '#ee5555', resolve: '#eebb33', nerve: '#9966cc', trust: '#44ccaa',
};
const DUNGEON_PROFILES = ['aggressive', 'tactical', 'nurturing', 'deceptive'];

// ═══════════════════════════════════════════════════════════════
// SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════════

function Bar({ label, value, max, color, delta, dk }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const c = RES[color] || '#888';
  return (
    <div style={{ marginBottom: 4, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
        <span style={{ fontSize: 11, color: P.muted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
        <span style={{ fontSize: 12, color: P.text, fontWeight: 700, fontFamily: 'monospace' }}>{value}/{max}</span>
      </div>
      <div style={{ height: 10, background: '#060a10', borderRadius: 3, overflow: 'hidden', border: `1px solid ${c}22` }}>
        <div style={{ height: '100%', width: `${pct}%`, background: c, borderRadius: 2, transition: 'width 0.6s ease-out' }} />
      </div>
      {delta != null && delta !== 0 && <FDelta key={dk} d={delta} />}
    </div>
  );
}

function FDelta({ d }) {
  const [vis, setVis] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVis(false), 1200); return () => clearTimeout(t); }, []);
  if (!vis) return null;
  const c = d < 0 ? '#ff5555' : '#55ff99';
  return <span style={{ position: 'absolute', right: 0, top: -4, fontSize: 16, fontWeight: 800, color: c, fontFamily: 'monospace', pointerEvents: 'none', animation: 'fUp 1.2s ease-out forwards', textShadow: `0 0 8px ${c}` }}>{d > 0 ? '+' : ''}{d}</span>;
}

function Energy({ avail, base, delta, dk }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 14px', background: '#1a1608', border: '1px solid #eebb4433', borderRadius: 20, position: 'relative' }}>
      <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#eebb44', boxShadow: '0 0 8px #eebb44' }} />
      <span style={{ fontSize: 15, color: '#eebb44', fontWeight: 800, fontFamily: 'monospace' }}>{avail}</span>
      <span style={{ fontSize: 10, color: P.dim }}>/{base} EN</span>
      {delta != null && delta !== 0 && <FDelta key={dk} d={delta} />}
    </div>
  );
}

const COND = {
  entangled: { i: '⌁', l: 'Entangled', c: '#66cc66' }, fortify: { i: '⛨', l: 'Fortify', c: '#6699dd' },
  guarded: { i: '⊕', l: 'Guarded', c: '#6699dd' }, empower: { i: '⚡', l: 'Empowered', c: '#eedd44' },
  disrupt: { i: '✦', l: 'Disrupted', c: '#ee7744' }, trap: { i: '⊘', l: 'Trap', c: '#cc5588' },
  erode: { i: '◉', l: 'Erode', c: '#ee4444' }, attune: { i: '✧', l: 'Attune', c: '#88ee88' },
  binding: { i: '⊗', l: 'Binding', c: '#aa8844' }, betrayed: { i: '⚑', l: 'Betrayed', c: '#ee3333' },
};
function Conditions({ conds }) {
  if (!conds?.length) return null;
  const g = {};
  for (const c of conds) { g[c.type] = (g[c.type] || 0) + 1; }
  return (
    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
      {Object.entries(g).map(([t, n]) => {
        const s = COND[t] || { i: '•', l: t, c: P.muted };
        return <span key={t} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: `${s.c}18`, color: s.c, border: `1px solid ${s.c}30` }}>{s.i} {s.l}{n > 1 ? ` ×${n}` : ''}</span>;
      })}
    </div>
  );
}

function Members({ members, deltas, dk }) {
  if (!members) return null;
  return (
    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 3 }}>
      {Object.entries(members).map(([k, m]) => {
        const pct = m.maxVitality > 0 ? (m.vitality / m.maxVitality) * 100 : 0;
        const ko = m.status === 'knocked_out';
        const dd = deltas?.[`member.${k}`];
        return (
          <div key={k} style={{ flex: '1 1 80px', padding: '3px 6px', background: ko ? '#120808' : '#0e1018', border: `1px solid ${ko ? '#442222' : '#1e2233'}`, borderRadius: 3, opacity: ko ? 0.35 : 1, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 1 }}>
              <span style={{ fontSize: 9, color: ko ? '#994444' : P.sub }}>{m.name}</span>
              <span style={{ fontSize: 9, color: P.muted, fontFamily: 'monospace' }}>{ko ? 'KO' : `${m.vitality}/${m.maxVitality}`}</span>
            </div>
            <div style={{ height: 4, background: '#060810', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: ko ? '#442222' : pct > 50 ? '#66cc66' : pct > 25 ? '#ccbb44' : '#ee4444', transition: 'width 0.5s', borderRadius: 2 }} />
            </div>
            {dd && dd.delta !== 0 && <FDelta key={dk} d={dd.delta} />}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HAND CARD — Clickable card in player hand (NO energy gating)
// ═══════════════════════════════════════════════════════════════

function HandCard({ card, queueIdx, onSelect, disabled }) {
  const [hov, setHov] = useState(false);
  const [ttPos, setTTPos] = useState({ x: 0, y: 0 });
  const ref = useRef(null);
  const cc = CAT[card.category] || P.muted;
  const sel = queueIdx != null;
  const isReact = card.category === 'React';

  const enter = () => {
    setHov(true);
    if (ref.current) {
      const r = ref.current.getBoundingClientRect();
      setTTPos({ x: Math.max(8, Math.min(r.left + r.width / 2 - 155, window.innerWidth - 320)), y: Math.max(8, r.top - 6) });
    }
  };

  return (
    <>
      <div ref={ref} onMouseEnter={enter} onMouseLeave={() => setHov(false)}
        onClick={() => { if (!disabled && !isReact) onSelect(card); }}
        style={{
          width: 150, minHeight: 160, padding: '8px 10px', flexShrink: 0,
          background: sel ? `${cc}22` : hov ? P.surface : P.deep,
          border: `2px solid ${sel ? cc : hov ? `${cc}55` : '#1a2535'}`,
          borderRadius: 6, cursor: disabled ? 'default' : isReact ? 'default' : 'pointer',
          opacity: disabled ? 0.25 : isReact ? 0.65 : 1,
          transform: sel ? 'translateY(-12px)' : hov && !disabled ? 'translateY(-4px)' : 'none',
          boxShadow: sel ? `0 8px 24px ${cc}30` : 'none', transition: 'all 0.15s',
          position: 'relative',
        }}>
        {sel && <div style={{ position: 'absolute', top: -11, right: -7, width: 26, height: 26, borderRadius: '50%', background: cc, color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900 }}>{queueIdx + 1}</div>}
        {isReact && <div style={{ position: 'absolute', top: 3, right: 3, fontSize: 8, padding: '1px 5px', background: `${cc}30`, color: cc, borderRadius: 8 }}>HELD</div>}
        <div style={{ height: 3, background: cc, borderRadius: 2, marginBottom: 5 }} />
        <div style={{ fontSize: 13, fontWeight: 700, color: P.text, lineHeight: 1.2, marginBottom: 3 }}>{card.name}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: 10, color: cc, textTransform: 'uppercase', fontWeight: 600 }}>{card.category}</span>
          {card.cost > 0 && <span style={{ fontSize: 12, color: '#eebb44', fontWeight: 800 }}>⚡{card.cost}</span>}
        </div>
        {card.power != null && <div style={{ fontSize: 11, color: P.sub }}>Power {card.power} → {card.target}</div>}
        {card.keywords?.length > 0 && <div style={{ fontSize: 9, color: `${cc}bb`, marginTop: 2 }}>{card.keywords.join(' · ')}</div>}
        {/* Description on card face */}
        <div style={{ fontSize: 10, color: P.muted, lineHeight: 1.3, marginTop: 4, maxHeight: 52, overflow: 'hidden' }}>
          {card.description}
        </div>
      </div>

      {/* Tooltip */}
      {hov && <div style={{
        position: 'fixed', left: ttPos.x, bottom: window.innerHeight - ttPos.y,
        width: 310, padding: 14, zIndex: 300, pointerEvents: 'none',
        background: '#0a1018', border: `1px solid ${cc}66`, borderRadius: 8,
        boxShadow: `0 -6px 30px rgba(0,0,0,0.9), 0 0 20px ${cc}15`,
      }}>
        <div style={{ height: 3, background: cc, borderRadius: 2, marginBottom: 8 }} />
        <div style={{ fontSize: 17, fontWeight: 800, color: P.text, marginBottom: 4 }}>{card.name}</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: cc, textTransform: 'uppercase', fontWeight: 700 }}>{card.category}</span>
          {card.type && <span style={{ fontSize: 11, color: P.sub }}>{card.type}</span>}
          {card.cost > 0 && <span style={{ fontSize: 13, color: '#eebb44', fontWeight: 800 }}>⚡{card.cost}</span>}
        </div>
        {card.power != null && <div style={{ fontSize: 13, color: P.sub, marginBottom: 4 }}>Power {card.power} → {card.target}</div>}
        {card.keywords?.length > 0 && <div style={{ fontSize: 12, color: `${cc}dd`, marginBottom: 6 }}>{card.keywords.join(' · ')}</div>}
        <div style={{ fontSize: 13, color: P.sub, lineHeight: 1.5 }}>{card.description || 'No description.'}</div>
        {card.member && <div style={{ fontSize: 10, color: P.dim, marginTop: 8, fontStyle: 'italic' }}>From: {card.member}</div>}
      </div>}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// STAGING AREA — Shows queued cards + resolving cards
// ═══════════════════════════════════════════════════════════════

function Stage({ selectedQueue, currentEvent, round, resolvedCards }) {
  // During player turn: show selected cards big
  if (selectedQueue.length > 0) {
    return (
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', padding: 16 }}>
        {selectedQueue.map((q, i) => {
          const cc = CAT[q.card.category] || P.muted;
          return (
            <div key={i} style={{ width: 180, padding: 12, background: `${cc}12`, border: `1px solid ${cc}44`, borderRadius: 8, boxShadow: `0 4px 16px ${cc}15` }}>
              <div style={{ height: 3, background: cc, borderRadius: 2, marginBottom: 6 }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: P.text, marginBottom: 3 }}>{q.card.name}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: cc, textTransform: 'uppercase', fontWeight: 600 }}>{q.card.category}</span>
                {q.card.cost > 0 && <span style={{ fontSize: 11, color: '#eebb44', fontWeight: 700 }}>⚡{q.card.cost}</span>}
              </div>
              <div style={{ fontSize: 11, color: P.sub, lineHeight: 1.4 }}>{q.card.description}</div>
              <div style={{ fontSize: 10, color: P.dim, marginTop: 4 }}>Play order: #{i + 1}</div>
            </div>
          );
        })}
      </div>
    );
  }

  // During resolution: show the card being played
  if (currentEvent?.type === 'card_played') {
    const { card, side, action } = currentEvent.data;
    const cc = CAT[card?.category] || P.muted;
    const sLabel = side === 'dungeon' ? '⬡ DUNGEON' : '⬢ VISITOR';
    const aLabel = action === 'energy' ? 'Powers Up' : action === 'activate' ? 'Activates' : action === 'restrain' ? 'Restrains' : 'Plays';
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 12, color: side === 'dungeon' ? '#88bbee' : '#eeaa44', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>
          {sLabel} — {aLabel}
        </div>
        <div style={{ width: 260, padding: 16, background: `${cc}10`, border: `2px solid ${cc}44`, borderRadius: 10, boxShadow: `0 0 30px ${cc}12` }}>
          <div style={{ height: 3, background: cc, borderRadius: 2, marginBottom: 8 }} />
          <div style={{ fontSize: 18, fontWeight: 800, color: P.text, marginBottom: 4 }}>{card?.name}</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: cc, textTransform: 'uppercase', fontWeight: 700 }}>{card?.category}</span>
            {card?.power != null && <span style={{ fontSize: 12, color: P.sub }}>Power {card.power}</span>}
            {card?.target && <span style={{ fontSize: 12, color: P.muted }}>→ {card.target}</span>}
          </div>
          {card?.keywords?.length > 0 && <div style={{ fontSize: 11, color: `${cc}cc`, marginBottom: 4 }}>{card.keywords.join(' · ')}</div>}
          <div style={{ fontSize: 12, color: P.sub, lineHeight: 1.5, marginBottom: 8 }}>{card?.description}</div>
          <LogLines lines={currentEvent.logLines} />
        </div>
        <ChangeBadges changes={currentEvent.resourceChanges} />
      </div>
    );
  }

  if (currentEvent?.type === 'auto_effects') {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, color: '#eeaa44', textTransform: 'uppercase', letterSpacing: '3px', fontWeight: 700 }}>⚙ Environment</div>
        <LogLines lines={currentEvent.logLines} />
        <ChangeBadges changes={currentEvent.resourceChanges} />
      </div>
    );
  }

  if (currentEvent?.type === 'encounter_start') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: P.text, marginBottom: 8 }}>{currentEvent.data.name}</div>
        <div style={{ fontSize: 13, color: P.sub, marginBottom: 6 }}>{currentEvent.data.description}</div>
        <div style={{ fontSize: 12, color: P.dim }}>Initiative: {currentEvent.data.initiative}</div>
      </div>
    );
  }

  if (currentEvent?.type === 'turn_start') {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: currentEvent.data.isHuman ? P.accent : '#eeaa44' }}>
          {currentEvent.data.isHuman ? '▸ Your turn — select cards below' : '▸ Opponent is deciding...'}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 15, color: P.dim }}>{round > 0 ? `Round ${round}` : '...'}</div>
    </div>
  );
}

function LogLines({ lines }) {
  if (!lines?.length) return null;
  return (
    <div style={{ width: '100%', maxWidth: 400 }}>
      {lines.slice(-8).map((l, i) => (
        <div key={i} style={{
          fontSize: 12, fontFamily: 'monospace', lineHeight: 1.7,
          color: l.includes('>>>') || l.includes('💀') ? '#ff6655' : l.includes('⚡') ? '#eebb44' : l.includes('🤝') ? P.accent : P.sub,
        }}>{l.trim()}</div>
      ))}
    </div>
  );
}

function ChangeBadges({ changes }) {
  if (!changes || Object.keys(changes).length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
      {Object.entries(changes).map(([key, ch]) => {
        if (key.startsWith('member.')) return null;
        const res = key.split('.')[1]; const c = ch.delta < 0 ? '#ff5555' : '#55ff99';
        return <span key={key} style={{ fontSize: 14, fontWeight: 800, color: c, fontFamily: 'monospace', padding: '2px 10px', background: `${c}10`, borderRadius: 4 }}>{res} {ch.delta > 0 ? '+' : ''}{ch.delta}</span>;
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// COMBAT LOG
// ═══════════════════════════════════════════════════════════════

function CombatLog({ entries }) {
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [entries.length]);
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '8px 12px', fontFamily: 'monospace' }}>
      {entries.map((l, i) => {
        const isR = l.includes('────') && l.includes('Round');
        const isE = l.includes('═══');
        return (
          <div key={i} style={{
            fontSize: 12, lineHeight: 1.8, fontWeight: isR || isE ? 800 : 400,
            color: isE ? P.text : isR ? '#66bbee' : l.includes('>>>') || l.includes('💀') ? '#ff6655'
              : l.includes('⚙') ? '#eeaa44' : l.includes('⚡') ? '#eebb44' : l.includes('⚔') ? '#ee5544'
              : l.includes('💪') ? '#eecc33' : l.includes('🤝') ? P.accent : l.includes('🛡') ? '#ee8833' : P.sub,
            borderTop: isR ? `1px solid ${P.border}` : 'none',
            paddingTop: isR ? 8 : 0, marginTop: isR ? 6 : 0,
          }}>{l}</div>
        );
      })}
      <div ref={end} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// OUTCOME OVERLAY
// ═══════════════════════════════════════════════════════════════

function Outcome({ outcome, playerSide, onExit, onNext, canNext }) {
  if (!outcome) return null;
  const won = outcome.winner === playerSide || outcome.winner === 'both';
  const bond = outcome.winner === 'both';
  const bg = bond ? '#44ccaa' : won ? '#44cc66' : '#cc4444';
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div style={{ padding: '44px 64px', background: P.deep, border: `2px solid ${bg}`, borderRadius: 14, textAlign: 'center', maxWidth: 480, boxShadow: `0 0 80px ${bg}20` }}>
        <div style={{ fontSize: 44, marginBottom: 14 }}>{bond ? '🤝' : won ? '⚔️' : '💀'}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: bg, marginBottom: 8 }}>{bond ? 'Bond Achieved' : won ? 'Victory' : 'Defeat'}</div>
        <div style={{ fontSize: 15, color: P.sub, marginBottom: 4 }}>{outcome.condition}</div>
        <div style={{ fontSize: 13, color: P.muted, marginBottom: 32 }}>{outcome.desc}</div>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          {canNext && <button onClick={onNext} style={{ padding: '12px 36px', background: bg, border: 'none', color: '#000', borderRadius: 6, cursor: 'pointer', fontSize: 16, fontWeight: 800 }}>Next Room →</button>}
          <button onClick={onExit} style={{ padding: '12px 28px', background: 'transparent', border: `1px solid ${P.border}`, color: P.muted, borderRadius: 6, cursor: 'pointer', fontSize: 14 }}>Return to Menu</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MEMBER TARGET SELECTOR (for dungeon player)
// ═══════════════════════════════════════════════════════════════

function MemberTargetSelect({ members, selected, onSelect }) {
  if (!members) return null;
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '6px 16px', background: `${P.surface}60` }}>
      <span style={{ fontSize: 11, color: P.muted }}>Target:</span>
      {Object.entries(members).map(([k, m]) => {
        const ko = m.status === 'knocked_out';
        const active = selected === k;
        return (
          <button key={k} onClick={() => !ko && onSelect(k)} style={{
            padding: '3px 10px', fontSize: 11, borderRadius: 4, cursor: ko ? 'default' : 'pointer',
            background: active ? '#ee555533' : 'transparent', border: `1px solid ${active ? '#ee5555' : ko ? '#333' : P.border}`,
            color: ko ? '#555' : active ? '#ff8888' : P.sub, fontWeight: active ? 700 : 400,
            opacity: ko ? 0.3 : 1,
          }}>
            {m.name} ({m.vitality}/{m.maxVitality})
          </button>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

export default function EncounterPlay({ playerSide, playerSelections, onExit }) {
  const isDungeon = playerSide === 'dungeon';
  const engineRef = useRef(null);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);

  const [phase, setPhase] = useState('loading');
  const [round, setRound] = useState(0);
  const [snap, setSnap] = useState(null);
  const [evt, setEvt] = useState(null);
  const [deltas, setDeltas] = useState({});
  const [dk, setDk] = useState(0);
  const [outcome, setOutcome] = useState(null);
  const [encIdx, setEncIdx] = useState(0);
  const [encName, setEncName] = useState('');
  const [hand, setHand] = useState([]);
  const [queue, setQueue] = useState([]);
  const [myTurn, setMyTurn] = useState(false);
  const [anim, setAnim] = useState(false);
  const [log, setLog] = useState([]);
  const [scenRef, setScenRef] = useState(null);
  const [memberTarget, setMemberTarget] = useState(null);

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── INIT ──
  useEffect(() => {
    runningRef.current = false; // Reset so new gameLoop can start (StrictMode re-invocation)
    try {
      const allE = Object.keys(ENCOUNTERS), allM = Object.keys(MEMBERS);
      let encs, mems;
      if (isDungeon) { encs = playerSelections; mems = autoCompose('visitor', allE, allM).members; }
      else { mems = playerSelections; encs = autoCompose('dungeon', allE, allM).encounters; }

      const scenario = buildScenario({ encounters: encs, members: mems });
      setScenRef(scenario);

      const dp = DUNGEON_PROFILES[Math.floor(Math.random() * DUNGEON_PROFILES.length)];
      const dAI = createDungeonAI(buildDungeonProfile(encs, dp));
      const vAI = createVisitorAI(buildVisitorProfile(mems));

      const engine = new GameEngine(scenario, playerSide, {});
      engineRef.current = engine;
      engine.startEncounter(0, dAI, vAI);
      setEncName(scenario.encounters[0].encounter.name);
      setPhase('running');
      gameLoop(engine);
    } catch (err) {
      console.error('Init error:', err);
      setPhase('error');
      setLog(p => [...p, `ERROR: ${err.message}`]);
    }
  }, []); // eslint-disable-line

  // ── GAME LOOP ──
  const gameLoop = useCallback(async (engine) => {
    if (!engine) engine = engineRef.current;
    if (!engine || runningRef.current) return;
    runningRef.current = true;
    setAnim(true);

    try {
      while (engine.getPhase() !== 'encounter_over') {
        if (!mountedRef.current || engineRef.current !== engine) break;
        const event = engine.nextStep();
        if (!event) break;

        setEvt(event);
        if (event.stateSnapshot) setSnap(event.stateSnapshot);
        if (event.resourceChanges && Object.keys(event.resourceChanges).length > 0) {
          setDeltas(event.resourceChanges); setDk(k => k + 1);
        }
        if (event.data?.round) setRound(event.data.round);
        if (event.logLines?.length) setLog(p => [...p, ...event.logLines]);

        // End
        if (event.type === 'encounter_end' || event.data?.outcome || event.data?.winCondition) {
          setOutcome(event.data?.outcome || event.data?.winCondition || engine.getOutcome());
          setPhase('encounter_over');
          break;
        }

        // Player turn
        if (event.awaitingInput) {
          if (engineRef.current !== engine) return; // Stale loop — abandon
          const h = event.data?.hand || [];
          setHand([...h]);
          setQueue([]);
          setMyTurn(true);
          setAnim(false);
          runningRef.current = false;
          return; // PAUSE — player acts
        }

        // Pacing delays
        const d = event.type === 'card_played' ? (event.data?.side !== playerSide ? 2400 : 1800)
          : event.type === 'auto_effects' ? 1200 : event.type === 'round_start' || event.type === 'round_end' ? 800 : 400;
        await new Promise(r => setTimeout(r, d));
        if (!mountedRef.current || engineRef.current !== engine) break;
        setDeltas({});
      }

      if (engineRef.current === engine) {
        const fo = engine.getOutcome();
        if (fo && !outcome) { setOutcome(fo); setPhase('encounter_over'); }
      }
    } finally {
      if (engineRef.current === engine) {
        setAnim(false);
        runningRef.current = false;
      }
    }
  }, [playerSide, outcome]);

  // ── CARD SELECT (no energy gating — always selectable) ──
  const selectCard = useCallback((card) => {
    setQueue(prev => {
      const idx = prev.findIndex(q => q.card === card);
      if (idx >= 0) return prev.filter((_, i) => i !== idx);
      const action = card.category === 'Energy' ? 'energy' : 'play';
      return [...prev, { card, action }];
    });
  }, []);

  // ── CONFIRM (validate energy here) ──
  const confirm = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !myTurn) return;

    // Quick energy check — warn but allow (engine will skip unaffordable)
    engine.submitCardSelections(queue);
    setQueue([]);
    setMyTurn(false);
    setDeltas({});
    gameLoop(engine);
  }, [myTurn, queue, gameLoop]);

  // ── END TURN ──
  const endTurn = useCallback(() => {
    const engine = engineRef.current;
    if (!engine || !myTurn) return;
    engine.submitCardSelections([]);
    setQueue([]);
    setMyTurn(false);
    setDeltas({});
    gameLoop(engine);
  }, [myTurn, gameLoop]);

  // ── NEXT ROOM ──
  const nextRoom = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (!engine.advanceToNextEncounter()) return;
    setOutcome(null);
    setEncIdx(engine.getEncounterIndex());
    setEncName(engine.scenario.encounters[engine.getEncounterIndex()].encounter.name);
    setRound(0);
    setPhase('running');
    setLog(p => [...p, '', '══════════════════════════════════════', '']);
    gameLoop(engine);
  }, [gameLoop]);

  // ── DERIVED ──
  const oppSide = isDungeon ? 'visitor' : 'dungeon';
  const oppRes = isDungeon ? snap?.visitor : snap?.dungeon;
  const myRes = isDungeon ? snap?.dungeon : snap?.visitor;
  const dSt = scenRef?.dungeonTemplate;
  const vSt = scenRef?.visitorTemplate;

  const oppMax = useMemo(() => {
    if (!dSt || !vSt) return {};
    if (isDungeon) {
      const tv = vSt.type === 'party' ? Object.values(vSt.members || {}).reduce((s, m) => s + m.vitality, 0) : (vSt.vitality || 20);
      return { vitality: tv, resolve: vSt.resolve || 14, nerve: vSt.nerve || 16 };
    }
    return { structure: dSt.structure || 16, veil: dSt.veil || 14, presence: dSt.presence || 12 };
  }, [isDungeon, dSt, vSt]);

  const myMax = useMemo(() => {
    if (!dSt || !vSt) return {};
    if (isDungeon) return { structure: dSt.structure || 16, veil: dSt.veil || 14, presence: dSt.presence || 12 };
    const tv = vSt.type === 'party' ? Object.values(vSt.members || {}).reduce((s, m) => s + m.vitality, 0) : (vSt.vitality || 20);
    return { vitality: tv, resolve: vSt.resolve || 14, nerve: vSt.nerve || 16 };
  }, [isDungeon, dSt, vSt]);

  const oppKeys = isDungeon ? [['vitality', 'Vitality'], ['resolve', 'Resolve'], ['nerve', 'Nerve']] : [['structure', 'Structure'], ['veil', 'Veil'], ['presence', 'Presence']];
  const myKeys = isDungeon ? [['structure', 'Structure'], ['veil', 'Veil'], ['presence', 'Presence']] : [['vitality', 'Vitality'], ['resolve', 'Resolve'], ['nerve', 'Nerve']];
  const oppProm = isDungeon ? 'trust' : 'rapport';
  const myProm = isDungeon ? 'rapport' : 'trust';
  const canContinue = encIdx < (scenRef?.encounters?.length || 3) - 1 && outcome && outcome.condition !== 'Bond';

  // ── LOADING / ERROR ──
  if (phase === 'loading') return <div style={{ height: '100vh', background: P.void, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.muted, fontSize: 16 }}>Building encounter...</div>;
  if (phase === 'error') return (
    <div style={{ height: '100vh', background: P.void, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ color: '#ee4444', fontSize: 16 }}>Failed to initialize</div>
      <button onClick={onExit} style={{ padding: '8px 24px', background: P.surface, border: `1px solid ${P.border}`, color: P.sub, borderRadius: 4, cursor: 'pointer' }}>Back</button>
    </div>
  );

  // Compute committed energy for display
  let committed = 0;
  for (const q of queue) {
    if (q.action === 'play') committed += (q.card.cost || 0);
    if (q.action === 'energy') committed -= 1;
  }
  const myEnergy = snap ? (isDungeon ? snap.dEnergy : snap.vEnergy) : { available: 0, base: 0 };
  const energyAfter = myEnergy.available - committed;

  return (
    <div style={{ height: '100vh', overflow: 'hidden', background: P.void, color: P.text, display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <style>{`@keyframes fUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-24px)}}@keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:#283848;border-radius:3px}`}</style>

      {/* HEADER */}
      <div style={{ padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: P.deep, borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: P.muted, textTransform: 'uppercase', letterSpacing: '2px' }}>Room {encIdx + 1}/{scenRef?.encounters?.length || 3}</span>
          <span style={{ fontSize: 15, color: P.text, fontWeight: 700 }}>{encName}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 14, color: P.sub, fontFamily: 'monospace' }}>Round {round}</span>
          {myTurn && <span style={{ fontSize: 12, color: P.accent, animation: 'pulse 1.5s infinite', fontWeight: 700 }}>● YOUR TURN</span>}
          {anim && !myTurn && <span style={{ fontSize: 12, color: '#eeaa44', animation: 'pulse 1s infinite' }}>● RESOLVING</span>}
        </div>
      </div>

      {/* BODY */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>

        {/* LEFT: Game */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>

          {/* OPPONENT */}
          <div style={{ padding: '10px 20px', background: P.deep, borderBottom: `1px solid ${P.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, maxWidth: 380 }}>
                <div style={{ fontSize: 11, color: P.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>
                  {isDungeon ? '⬢ Visitor' : '⬡ Dungeon'} (AI)
                </div>
                {oppRes && oppKeys.map(([k, l]) => <Bar key={k} label={l} color={k} value={oppRes[k] || 0} max={oppMax[k] || 20} delta={deltas[`${oppSide}.${k}`]?.delta} dk={`${dk}-${oppSide}-${k}`} />)}
                {oppRes && <Bar label={oppProm === 'trust' ? 'Trust' : 'Rapport'} color={oppProm} value={oppRes[oppProm] || 0} max={12} delta={deltas[`${oppSide}.${oppProm}`]?.delta} dk={`${dk}-${oppSide}-${oppProm}`} />}
                {isDungeon && snap?.members && <Members members={snap.members} deltas={deltas} dk={dk} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {snap && <Energy avail={isDungeon ? snap.vEnergy.available : snap.dEnergy.available} base={isDungeon ? snap.vEnergy.base : snap.dEnergy.base} delta={deltas[`${oppSide}.energy`]?.delta} dk={`${dk}-${oppSide}-en`} />}
                {oppRes && <Conditions conds={oppRes.conditions} />}
              </div>
            </div>
          </div>

          {/* STAGE */}
          <div style={{ flex: 1, overflow: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, #141a2880 0%, ${P.void} 70%)`, minHeight: 0 }}>
            <Stage selectedQueue={myTurn ? queue : []} currentEvent={evt} round={round} />
          </div>

          {/* PLAYER */}
          <div style={{ padding: '10px 20px', background: P.deep, borderTop: `1px solid ${P.border}`, flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ flex: 1, maxWidth: 380 }}>
                <div style={{ fontSize: 11, color: P.dim, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 3 }}>
                  {isDungeon ? '⬡ Dungeon' : '⬢ Visitor'} (You)
                </div>
                {myRes && myKeys.map(([k, l]) => <Bar key={k} label={l} color={k} value={myRes[k] || 0} max={myMax[k] || 20} delta={deltas[`${playerSide}.${k}`]?.delta} dk={`${dk}-${playerSide}-${k}`} />)}
                {myRes && <Bar label={myProm === 'trust' ? 'Trust' : 'Rapport'} color={myProm} value={myRes[myProm] || 0} max={12} delta={deltas[`${playerSide}.${myProm}`]?.delta} dk={`${dk}-${playerSide}-${myProm}`} />}
                {!isDungeon && snap?.members && <Members members={snap.members} deltas={deltas} dk={dk} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                {snap && <Energy avail={isDungeon ? snap.dEnergy.available : snap.vEnergy.available} base={isDungeon ? snap.dEnergy.base : snap.vEnergy.base} delta={deltas[`${playerSide}.energy`]?.delta} dk={`${dk}-${playerSide}-en`} />}
                {myRes && <Conditions conds={myRes.conditions} />}
              </div>
            </div>
          </div>

          {/* HAND AREA */}
          <div style={{ borderTop: `1px solid ${P.border}`, background: '#060a10', flexShrink: 0 }}>
            {/* Member targeting (dungeon player vs party) */}
            {myTurn && isDungeon && snap?.members && (
              <MemberTargetSelect members={snap.members} selected={memberTarget} onSelect={setMemberTarget} />
            )}

            {/* Energy preview when cards queued */}
            {myTurn && queue.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 16px', background: `${P.surface}50` }}>
                <span style={{ fontSize: 11, color: P.muted }}>Energy: {myEnergy.available}</span>
                <span style={{ fontSize: 11, color: committed > 0 ? '#ee8844' : '#55ff99' }}>→ {energyAfter} after plays</span>
                {energyAfter < 0 && <span style={{ fontSize: 11, color: '#ff4444', fontWeight: 700 }}>⚠ Not enough energy!</span>}
              </div>
            )}

            {/* Cards */}
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 16px 8px', minHeight: 168 }}>
              {hand.map((card, i) => {
                const qIdx = queue.findIndex(q => q.card === card);
                return (
                  <HandCard key={`${card.name}-${i}`}
                    card={card} queueIdx={qIdx >= 0 ? qIdx : null}
                    onSelect={selectCard} disabled={!myTurn || anim} />
                );
              })}
              {hand.length === 0 && <div style={{ display: 'flex', alignItems: 'center', color: P.muted, fontSize: 14, padding: 24 }}>{anim ? 'Resolving...' : 'Waiting for your turn...'}</div>}
            </div>

            {/* Buttons */}
            {myTurn && (
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', padding: '6px 16px 14px' }}>
                <button onClick={confirm} disabled={queue.length === 0} style={{
                  padding: '12px 36px', fontSize: 15, fontWeight: 800, borderRadius: 6,
                  background: queue.length > 0 ? (energyAfter < 0 ? '#cc6633' : P.accent) : P.surface,
                  border: `2px solid ${queue.length > 0 ? (energyAfter < 0 ? '#ee8844' : P.accentGlow) : P.border}`,
                  color: queue.length > 0 ? '#000' : P.dim, cursor: queue.length > 0 ? 'pointer' : 'default',
                  transition: 'all 0.15s',
                }}>
                  {energyAfter < 0 ? `Play Anyway (${queue.length})` : `Play ${queue.length} Card${queue.length !== 1 ? 's' : ''}`} →
                </button>
                <button onClick={endTurn} style={{
                  padding: '12px 24px', fontSize: 13, background: 'transparent',
                  border: `1px solid ${P.border}`, color: P.sub, borderRadius: 6, cursor: 'pointer',
                }}>
                  End Turn
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Log */}
        <div style={{ width: 300, borderLeft: `1px solid ${P.border}`, background: '#080c14', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: `1px solid ${P.border}`, fontSize: 12, color: P.sub, textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, flexShrink: 0 }}>Combat Log</div>
          <CombatLog entries={log} />
        </div>
      </div>

      <Outcome outcome={outcome} playerSide={playerSide} onExit={onExit} canNext={canContinue} onNext={nextRoom} />
    </div>
  );
}
