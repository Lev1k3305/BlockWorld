import React, { useState } from 'react';
import { Header } from './components/journal/Header';
import { HomePage } from './components/journal/HomePage';
import { JournalBook } from './components/journal/JournalBook';
import { CommonSection } from './components/journal/CommonSection';
import { TimeCapsule } from './components/journal/TimeCapsule';
import { JournalOwner } from './types/journal';

type ViewMode = 'home' | 'journal' | 'common' | 'capsule';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('home');
  const [activeOwner, setActiveOwner] = useState<JournalOwner>('alizhan');

  const handleOpenOwnerBook = (owner: JournalOwner) => {
    setActiveOwner(owner);
    setCurrentView('journal');
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] text-stone-800 font-sans selection:bg-amber-200">
      {/* Top Header Navigation Bar */}
      <Header
        currentView={currentView}
        activeOwner={activeOwner}
        onNavigateHome={() => setCurrentView('home')}
        onOpenOwnerBook={handleOpenOwnerBook}
        onOpenCommon={() => setCurrentView('common')}
        onOpenCapsule={() => setCurrentView('capsule')}
      />

      {/* Main Container Views */}
      <main className="pb-12">
        {currentView === 'home' && (
          <HomePage
            onOpenOwnerBook={handleOpenOwnerBook}
            onOpenCommon={() => setCurrentView('common')}
            onOpenCapsule={() => setCurrentView('capsule')}
          />
        )}

        {currentView === 'journal' && (
          <JournalBook
            owner={activeOwner}
            onSwitchOwner={(nextOwner) => setActiveOwner(nextOwner)}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {currentView === 'common' && <CommonSection />}

        {currentView === 'capsule' && <TimeCapsule />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#ebdcd0] py-6 text-center text-xs text-[#8c7365] bg-[#fbf8f3]">
        <p className="font-serif-book text-sm text-[#5c473a]">
          Два характера • Персональный журнал Алижан и Дильназ
        </p>
        <p className="font-handwriting text-base text-[#a38c7e] mt-0.5">
          Семейная капсула времени • Хранится прямо в твоём браузере
        </p>
      </footer>
    </div>
  );
};
