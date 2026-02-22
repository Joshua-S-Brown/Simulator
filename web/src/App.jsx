import React, { useState } from 'react';
import TitleScreen from './screens/TitleScreen.jsx';
import SideSelect from './screens/SideSelect.jsx';
import Composition from './screens/Composition.jsx';
import DeckReview from './screens/DeckReview.jsx';

export default function App() {
  const [screen, setScreen] = useState('title');
  const [side, setSide] = useState(null);
  const [selected, setSelected] = useState([]);

  const goTitle = () => { setScreen('title'); setSide(null); setSelected([]); };
  const goSideSelect = () => setScreen('side-select');
  const goComposition = (s) => { setSide(s); setScreen('composition'); setSelected([]); };
  const goDeckReview = (sel) => { setSelected(sel); setScreen('deck-review'); };

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
          onReady={() => alert('Phase 2 will connect gameplay here. For now, composition & deck review is complete!')}
        />
      );
    default:
      return <TitleScreen onPlay={goSideSelect} />;
  }
}
