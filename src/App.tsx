import React, { useState, useEffect } from 'react';
import { Header, ViewMode } from './components/journal/Header';
import { UserSelectionPage } from './components/journal/UserSelectionPage';
import { JournalBook } from './components/journal/JournalBook';
import { CommonSection } from './components/journal/CommonSection';
import { TimeCapsule } from './components/journal/TimeCapsule';
import { BrotherMessageModal } from './components/journal/BrotherMessageModal';
import { PinEntryModal } from './components/journal/PinEntryModal';
import { JournalOwner } from './types/journal';
import { pinService } from './services/pinService';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('select');
  const [activeOwner, setActiveOwner] = useState<JournalOwner | null>(null);

  // Modals state
  const [isBrotherMessageOpen, setIsBrotherMessageOpen] = useState(false);
  const [pinModalOwner, setPinModalOwner] = useState<JournalOwner | null>(null);
  const [hasPinMap, setHasPinMap] = useState<Record<JournalOwner, boolean>>({
    alizhan: false,
    dilnaz: false,
  });

  useEffect(() => {
    refreshPinMap();
  }, [currentView, pinModalOwner]);

  const refreshPinMap = () => {
    setHasPinMap(pinService.getHasPinMap());
  };

  const handleSelectOwner = (owner: JournalOwner) => {
    if (pinService.hasPin(owner)) {
      setPinModalOwner(owner);
    } else {
      setActiveOwner(owner);
      setCurrentView('journal');
    }
  };

  const handlePinSuccess = () => {
    if (pinModalOwner) {
      setActiveOwner(pinModalOwner);
      setPinModalOwner(null);
      setCurrentView('journal');
    }
  };

  const handleExitJournal = () => {
    setActiveOwner(null);
    setCurrentView('select');
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] text-stone-800 font-sans selection:bg-amber-200">
      {/* Top Header Navigation Bar */}
      <Header
        currentView={currentView}
        activeOwner={activeOwner}
        onNavigateSelect={handleExitJournal}
        onOpenBrotherMessage={() => setIsBrotherMessageOpen(true)}
        onOpenCommon={() => setCurrentView('common')}
        onOpenCapsule={() => setCurrentView('capsule')}
      />

      {/* Main Container Views */}
      <main className="pb-12">
        {currentView === 'select' && (
          <UserSelectionPage
            onSelectOwner={handleSelectOwner}
            onOpenBrotherMessage={() => setIsBrotherMessageOpen(true)}
            onOpenCommon={() => setCurrentView('common')}
            onOpenCapsule={() => setCurrentView('capsule')}
            hasPinMap={hasPinMap}
          />
        )}

        {currentView === 'journal' && activeOwner && (
          <JournalBook
            owner={activeOwner}
            onExitJournal={handleExitJournal}
          />
        )}

        {currentView === 'common' && <CommonSection />}

        {currentView === 'capsule' && <TimeCapsule />}
      </main>

      {/* Modals */}
      {isBrotherMessageOpen && (
        <BrotherMessageModal onClose={() => setIsBrotherMessageOpen(false)} />
      )}

      {pinModalOwner && (
        <PinEntryModal
          owner={pinModalOwner}
          onSuccess={handlePinSuccess}
          onCancel={() => setPinModalOwner(null)}
        />
      )}

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
}
