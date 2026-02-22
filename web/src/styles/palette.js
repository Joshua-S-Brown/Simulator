// ═══════════════════════════════════════════════════════════════
// PALETTE — Shattered Dungeon Design Language
// ═══════════════════════════════════════════════════════════════

export const P = {
  void: '#0a0e14',
  deep: '#111923',
  stone: '#1a2332',
  moss: '#1e2a2e',
  surface: '#2a3a4d',
  text: '#e0e6f0',
  muted: '#a0b0c0',
  dim: '#7a8a9a',
  border: '#334455',
};

export const CATEGORY_COLORS = {
  Strike: '#e05555',
  Empower: '#dda244',
  Disrupt: '#7aaad4',
  Counter: '#5cbb8a',
  React: '#bb88bb',
  Trap: '#c49966',
  Offer: '#55cc88',
  Test: '#6699cc',
  Reshape: '#77bb77',
  Energy: '#bbaa66',
};

export const ROOM_PALETTE = {
  'root-hollow':           { primary: '#5a9c4f', secondary: '#3a7a34', glow: '#7ac465', bg: '#1a2e18', label: 'Root Hollow',             winCon: 'Kill/Panic' },
  'whispering-gallery':    { primary: '#d4aa4d', secondary: '#a88838', glow: '#ecc85e', bg: '#2a2418', label: 'Whispering Gallery',       winCon: 'Break/Panic' },
  'veil-breach':           { primary: '#9966cc', secondary: '#7744aa', glow: '#bb88ee', bg: '#1e1828', label: 'Veil Breach',              winCon: 'Panic/Break' },
  'living-root-sanctuary': { primary: '#4dbba8', secondary: '#339980', glow: '#66ddc8', bg: '#162824', label: 'Living Root Sanctuary',    winCon: 'Bond' },
  'honeyed-hollow':        { primary: '#e09050', secondary: '#bb7038', glow: '#f0aa66', bg: '#28201a', label: 'Honeyed Hollow',           winCon: 'Deception' },
  'broodmothers-web':      { primary: '#aa7850', secondary: '#886038', glow: '#cc9a68', bg: '#221a14', label: "Broodmother's Web",        winCon: 'Kill/Panic' },
  'constructs-forge':      { primary: '#e07040', secondary: '#bb5530', glow: '#f08855', bg: '#281810', label: "Construct's Forge",         winCon: 'Kill/Break' },
  'hollow-sirens-grotto':  { primary: '#8877cc', secondary: '#6655aa', glow: '#aa99ee', bg: '#1a1828', label: "Hollow Siren's Grotto",    winCon: 'Break/Panic' },
};

export const MEMBER_PALETTE = {
  knight:     { primary: '#a0b4cc', glow: '#bbd0e8', bg: '#1a2028', party: 'Standard' },
  battlemage: { primary: '#8090d0', glow: '#a0b0f0', bg: '#181c28', party: 'Standard' },
  cleric:     { primary: '#ddc455', glow: '#f0dd77', bg: '#282418', party: 'Standard' },
  rogue:      { primary: '#9977aa', glow: '#bb99cc', bg: '#201828', party: 'Standard' },
  warden:     { primary: '#66aa7a', glow: '#88cc99', bg: '#182820', party: 'Arcane' },
  sorcerer:   { primary: '#cc6688', glow: '#ee88aa', bg: '#281820', party: 'Arcane' },
  druid:      { primary: '#55bb8a', glow: '#77ddaa', bg: '#182824', party: 'Arcane' },
  ranger:     { primary: '#aa9955', glow: '#ccbb77', bg: '#242018', party: 'Arcane' },
};
