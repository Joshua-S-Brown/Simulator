// ═══════════════════════════════════════════════════════════════
// GAME DATA — Thin adapter for shared registry
//
// Builds the ENCOUNTERS and MEMBERS lookup maps that screens expect
// from the shared registry (../lib/registry.js).
//
// This is the ONLY file in web/ that imports from the shared data.
// Screens import from here instead of touching the registry directly.
// ═══════════════════════════════════════════════════════════════

import { getEncounter, listEncounters, getMember, listMembers } from '@lib/registry.js';

// Build lookup maps with 'key' field added (screens use it for identity)
export const ENCOUNTERS = Object.fromEntries(
  listEncounters().map(key => [key, { key, ...getEncounter(key) }])
);

export const MEMBERS = Object.fromEntries(
  listMembers().map(key => [key, { key, ...getMember(key) }])
);
