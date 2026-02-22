import React, { useState } from 'react';
import TitleScreen from './screens/TitleScreen.jsx';
import SideSelect from './screens/SideSelect.jsx';
import Composition from './screens/Composition.jsx';
import DeckReview from './screens/DeckReview.jsx';
import EncounterPlay from './screens/EncounterPlay.jsx';

/**
 * App — Phase 2 Screen Router
 *
 * Flow:
 *   title → side-select → composition → deck-review → encounter-play
 *
 * When player clicks "Ready" in DeckReview:
 *   1. Auto-compose opponent (random encounters/members for AI side)
 *   2. Pass both compositions to EncounterPlay
 *   3. EncounterPlay builds scenario, creates AIs, runs game
 */
export default function App() {
  const [screen, setScreen] = useState('title');
  const [side, setSide] = useState(null);
  const [selected, setSelected] = useState([]);
  const [gameConfig, setGameConfig] = useState(null);

  const goTitle = () => {
    setScreen('title');
    setSide(null);
    setSelected([]);
    setGameConfig(null);
  };
  const goSideSelect = () => setScreen('side-select');
  const goComposition = (s) => { setSide(s); setScreen('composition'); setSelected([]); };
  const goDeckReview = (sel) => { setSelected(sel); setScreen('deck-review'); };

  const startGame = () => {
    // Player has composed their side. Pass selections to EncounterPlay.
    // It will handle opponent auto-composition and scenario building.
    setGameConfig({ side, selected });
    setScreen('encounter-play');
  };

  switch (screen) {
    case 'title':
      return <TitleScreen onPlay={goSideSelect} />;
    case 'side-select':
      return <SideSelect onSelect={goComposition} onBack={goTitle} />;
    case 'composition':
      return <Composition side={side} onConfirm={goDeckReview} onBack={() => setScreen('side-select')} />;
    case 'deck-review':
      return (
        <DeckReview
          side={side}
          selected={selected}
          onBack={() => setScreen('composition')}
          onReady={startGame}
        />
      );
    case 'encounter-play':
      return (
        <EncounterPlay
          playerSide={gameConfig.side}
          playerSelections={gameConfig.selected}
          onExit={goTitle}
        />
      );
    default:
      return <TitleScreen onPlay={goSideSelect} />;
  }
}
