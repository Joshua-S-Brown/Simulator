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
      padding: small ? '10px 12px' : '14px 16px',
      minWidth: small ? '180px' : '230px',
      maxWidth: small ? '210px' : '280px',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
      position: 'relative',
    },
    name: {
      color: P.text,
      fontSize: small ? '14px' : '16px',
      fontWeight: 600,
      marginBottom: '5px',
      paddingRight: card.cost !== undefined ? '28px' : '0',
    },
    category: {
      color: catColor,
      fontSize: '12px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    type: {
      color: P.dim,
      fontSize: '12px',
      marginLeft: '6px',
    },
    desc: {
      color: P.muted,
      fontSize: small ? '12px' : '13px',
      lineHeight: 1.5,
      marginTop: '8px',
    },
    cost: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      background: accentColor,
      color: P.void,
      fontSize: '12px',
      fontWeight: 700,
      width: '24px',
      height: '24px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stats: {
      display: 'flex',
      gap: '10px',
      marginTop: '8px',
      fontSize: '13px',
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
