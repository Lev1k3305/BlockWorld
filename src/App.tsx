import React, { useState } from 'react';
import { StarryBackground } from './components/story/StarryBackground';
import { OpeningScene } from './components/story/OpeningScene';
import { TwoStarsScene } from './components/story/TwoStarsScene';
import { BrotherLetterScene } from './components/story/BrotherLetterScene';
import { FinaleScene } from './components/story/FinaleScene';

export type StoryScene = 'opening' | 'stars' | 'letter' | 'finale';

export default function App() {
  const [currentScene, setCurrentScene] = useState<StoryScene>('opening');

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-950 font-sans text-slate-100 selection:bg-pink-500 selection:text-white">
      {/* Enchanted Starry Night Background with Particles */}
      <StarryBackground />

      {/* Story Scenes Flow */}
      {currentScene === 'opening' && (
        <OpeningScene onNext={() => setCurrentScene('stars')} />
      )}

      {currentScene === 'stars' && (
        <TwoStarsScene onNext={() => setCurrentScene('letter')} />
      )}

      {currentScene === 'letter' && (
        <BrotherLetterScene onNext={() => setCurrentScene('finale')} />
      )}

      {currentScene === 'finale' && (
        <FinaleScene onRestart={() => setCurrentScene('opening')} />
      )}
    </main>
  );
}
