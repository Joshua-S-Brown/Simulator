import React from 'react';
import { P, CATEGORY_COLORS, ROOM_PALETTE, MEMBER_PALETTE } from '../styles/palette.js';

export default function GameCard({ card, roomKey, memberKey, small }) {
  const catColor = CATEGORY_COLORS[card.category] || P.muted;
  const accentColor = roomKey ? ROOM_PALETTE[roomKey]?.primary
    : memberKey ? MEMBER_PALETTE[memberKey]?.primary
    : catColor;

  const s = {
    card: {
      background: P.deep,
      border: `1px solid ${catColor}`,
      borderRadius: roomKey ? '10px' : '4px',
      padding: small ? '8px' : '12px',
      minWidth: small ? '140px' : '180px',
      maxWidth: small ? '160px' : '220px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      position: 'relative',
    },
    name: {
      color: P.text,
      fontSize: small ? '11px' : '13px',
      fontWeight: 600,
      marginBottom: '4px',
    },
    category: {
      color: catColor,
      fontSize: '10px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    type: {
      color: P.dim,
      fontSize: '10px',
      marginLeft: '6px',
    },
    desc: {
      color: P.muted,
      fontSize: small ? '10px' : '11px',
      lineHeight: 1.4,
      marginTop: '6px',
    },
    cost: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      background: accentColor,
      color: P.void,
      fontSize: '10px',
      fontWeight: 700,
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stats: {
      display: 'flex',
      gap: '8px',
      marginTop: '6px',
      fontSize: '10px',
      fontFamily: 'monospace',
    },
  };

  const [hovered, setHovered] = React.useState(false);

  return (
    <div
      style={{
        ...s.card,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 4px 12px ${catColor}33` : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {card.cost !== undefined && (
        <div style={s.cost}>{card.cost}</div>
      )}
      <div style={s.name}>{card.name}</div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span style={s.category}>{card.category}</span>
        <span style={s.type}>{card.type}</span>
      </div>
      {(card.power || card.target) && !small && (
        <div style={s.stats}>
          {card.power && <span style={{ color: catColor }}>⚔ {card.power}</span>}
          {card.target && <span style={{ color: P.muted }}>→ {card.target}</span>}
        </div>
      )}
      {!small && <div style={s.desc}>{card.description}</div>}
    </div>
  );
}
