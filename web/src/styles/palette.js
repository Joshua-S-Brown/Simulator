// ═══════════════════════════════════════════════════════════════
// PALETTE — Shattered Dungeon Design Language
// ═══════════════════════════════════════════════════════════════

export const P = {
  void: '#0a0e14',
  deep: '#111923',
  stone: '#1a2332',
  moss: '#1e2a2e',
  surface: '#243040',
  text: '#d4dae4',
  muted: '#8899aa',
  dim: '#556677',
  border: '#2a3a4a',
};

export const CATEGORY_COLORS = {
  Strike: '#c44',
  Empower: '#c93',
  Disrupt: '#89c',
  Counter: '#6a9',
  React: '#a7a',
  Trap: '#a86',
  Offer: '#5b8',
  Test: '#69a',
  Reshape: '#7a7',
  Energy: '#aa8',
};

export const ROOM_PALETTE = {
  'root-hollow':           { primary: '#4a7c3f', secondary: '#2d5a24', glow: '#6aad55', bg: '#1a2e18', label: 'Root Hollow',             winCon: 'Kill/Panic' },
  'whispering-gallery':    { primary: '#b8943d', secondary: '#8a6d28', glow: '#d4b04e', bg: '#2a2418', label: 'Whispering Gallery',       winCon: 'Break/Panic' },
  'veil-breach':           { primary: '#7b4daa', secondary: '#5a3380', glow: '#a66dd4', bg: '#1e1828', label: 'Veil Breach',              winCon: 'Panic/Break' },
  'living-root-sanctuary': { primary: '#3d998a', secondary: '#2a7368', glow: '#55c4b0', bg: '#162824', label: 'Living Root Sanctuary',    winCon: 'Bond' },
  'honeyed-hollow':        { primary: '#cc7a3d', secondary: '#995a28', glow: '#e8994e', bg: '#28201a', label: 'Honeyed Hollow',           winCon: 'Deception' },
  'broodmothers-web':      { primary: '#8b5e3c', secondary: '#6b4228', glow: '#b87a50', bg: '#221a14', label: "Broodmother's Web",        winCon: 'Kill/Panic' },
  'constructs-forge':      { primary: '#c45a2a', secondary: '#9a4020', glow: '#e07040', bg: '#281810', label: "Construct's Forge",         winCon: 'Kill/Break' },
  'hollow-sirens-grotto':  { primary: '#6a5aaa', secondary: '#4a3a88', glow: '#8a7acc', bg: '#1a1828', label: "Hollow Siren's Grotto",    winCon: 'Break/Panic' },
};

export const MEMBER_PALETTE = {
  knight:     { primary: '#8a9bb0', glow: '#aab8cc', bg: '#1a2028', party: 'Standard' },
  battlemage: { primary: '#6a7ab8', glow: '#8a9ad8', bg: '#181c28', party: 'Standard' },
  cleric:     { primary: '#c4a84a', glow: '#e4c86a', bg: '#282418', party: 'Standard' },
  rogue:      { primary: '#7a5a8a', glow: '#9a7aaa', bg: '#201828', party: 'Standard' },
  warden:     { primary: '#5a8a6a', glow: '#7aaa8a', bg: '#182820', party: 'Arcane' },
  sorcerer:   { primary: '#aa4a6a', glow: '#cc6a8a', bg: '#281820', party: 'Arcane' },
  druid:      { primary: '#4a9a7a', glow: '#6aba9a', bg: '#182824', party: 'Arcane' },
  ranger:     { primary: '#8a7a4a', glow: '#aa9a6a', bg: '#242018', party: 'Arcane' },
};
