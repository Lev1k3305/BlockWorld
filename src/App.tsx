import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  GameScreen, 
  GameSettings, 
  HeroType, 
  InteractiveTarget, 
  QuestState 
} from './game/types';
import { 
  defaultQuestState, 
  loadQuestState, 
  loadSelectedHero, 
  loadSettings, 
  resetGameProgress, 
  saveQuestState, 
  saveSelectedHero, 
  saveSettings 
} from './game/storage';
import { GameEngine } from './game/GameEngine';
import { sounds } from './services/soundEffects';

// UI Components
import { WelcomeScreen } from './components/ui/WelcomeScreen';
import { MainMenu } from './components/ui/MainMenu';
import { GameHUD } from './components/game/GameHUD';
import { TouchControls } from './components/game/TouchControls';
import { InventoryModal } from './components/game/InventoryModal';
import { SettingsModal } from './components/game/SettingsModal';
import { BirthdayGiftModal } from './components/birthday/BirthdayGiftModal';
import { VoiceMessagePlayer } from './components/birthday/VoiceMessagePlayer';
import { FinalCelebrationScreen } from './components/birthday/FinalCelebrationScreen';
import { PixelBirthdayStudio } from './components/studio/PixelBirthdayStudio';

export default function App() {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App & Game State
  const [screen, setScreen] = useState<GameScreen>('welcome');
  const [heroType, setHeroType] = useState<HeroType>(() => loadSelectedHero());
  const [questState, setQuestState] = useState<QuestState>(() => loadQuestState());
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  
  // HUD Overlays & Modals
  const [activeTarget, setActiveTarget] = useState<InteractiveTarget | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [showInventory, setShowInventory] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [inspectingGift, setInspectingGift] = useState<'sister' | 'brother' | null>(null);
  const [showVoicePlayer, setShowVoicePlayer] = useState<boolean>(false);

  const notificationTimeoutRef = useRef<number | null>(null);

  const showNotification = useCallback((msg: string) => {
    setNotification(msg);
    if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
    notificationTimeoutRef.current = window.setTimeout(() => {
      setNotification(null);
    }, 3800);
  }, []);

  // Sync settings with audio synthesizer
  useEffect(() => {
    sounds.setSfxVolume(settings.sfxVolume);
    sounds.setMusicVolume(settings.musicVolume);
  }, [settings]);

  // Sync screen mode with 3D engine camera (cinematic menu orbit vs gameplay)
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setScreenMode(screen);
    }
  }, [screen]);

  // Initialize Three.js Game Engine once on mount
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const engine = new GameEngine(
      canvasMountRef.current,
      heroType,
      questState,
      {
        onInteractionChange: (target) => {
          setActiveTarget(target);
        },
        onNotification: (msg) => {
          showNotification(msg);
        },
        onQuestUpdated: (updated) => {
          setQuestState(updated);
          saveQuestState(updated);
        },
        onHeartRestored: () => {
          showNotification("🌟 Сердце острова пробуждено! Открылся праздничный портал!");
        },
        onPortalEnter: () => {
          sounds.playPortalTeleport();
          setScreen('birthday_room');
          engineRef.current?.switchWorld('birthday_room');
          setShowVoicePlayer(true);
        },
        onGiftOpen: (type) => {
          setInspectingGift(type);
        },
      }
    );

    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  // Handle hero change
  const handleHeroSelect = (newHero: HeroType) => {
    setHeroType(newHero);
    saveSelectedHero(newHero);
    if (engineRef.current) {
      engineRef.current.setHeroType(newHero);
    }
  };

  // Movement & Touch controls callbacks
  const handleMovementChange = useCallback((forward: number, right: number, jump: boolean) => {
    if (engineRef.current) {
      engineRef.current.setMovementInput(forward, right, jump);
    }
  }, []);

  const handleInteract = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.triggerAction();
    }
  }, []);

  const handleRotateCamera = useCallback((delta: number) => {
    if (engineRef.current) {
      engineRef.current.rotateCamera(delta * settings.cameraSensitivity);
    }
  }, [settings.cameraSensitivity]);

  // Main Menu Actions
  const handleStartNewGame = (chosenHero: HeroType) => {
    handleHeroSelect(chosenHero);
    setScreen('playing');
    engineRef.current?.switchWorld('island');
  };

  const handleContinueGame = () => {
    setScreen('playing');
    engineRef.current?.switchWorld('island');
  };

  // Screenshot capture
  const handleTakeScreenshot = () => {
    if (!engineRef.current) return;
    try {
      const dataUrl = engineRef.current.takeScreenshot();
      const link = document.createElement('a');
      link.download = `blockworld-birthday-${heroType === 'sister' ? 'dilnaz' : 'alizhan'}.png`;
      link.href = dataUrl;
      link.click();
      showNotification("📸 Памятный снимок сохранён на ваше устройство!");
    } catch (e) {
      console.error("Failed to save screenshot", e);
    }
  };

  const handleReturnToIsland = () => {
    setScreen('playing');
    engineRef.current?.switchWorld('island');
  };

  const handleReturnToMainMenu = () => {
    setShowSettings(false);
    setShowInventory(false);
    setScreen('menu');
  };

  const handleResetProgress = () => {
    resetGameProgress();
    setQuestState({ ...defaultQuestState });
    if (engineRef.current) {
      engineRef.current.switchWorld('island');
    }
    setShowSettings(false);
    showNotification("Прогресс сброшен! Начните новое приключение.");
  };

  const hasSavedProgress = Object.values(questState.crystalsCollected).some(Boolean) || questState.heartRestored;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-fun">
      {/* 3D WebGL Canvas Container */}
      <div 
        ref={canvasMountRef} 
        className="absolute inset-0 w-full h-full z-0 touch-none pointer-events-auto"
      />

      {/* Welcome Screen - Portal to Their World */}
      {screen === 'welcome' && (
        <WelcomeScreen
          onOpenPortal={() => {
            setScreen('menu');
          }}
        />
      )}

      {/* Main Menu Screen */}
      {screen === 'menu' && (
        <MainMenu
          selectedHero={heroType}
          hasSavedProgress={hasSavedProgress}
          onStartNewGame={handleStartNewGame}
          onContinueGame={handleContinueGame}
          onOpenSettings={() => setShowSettings(true)}
          onOpenStudio={() => setScreen('studio')}
        />
      )}

      {/* Active Game HUD (Playing or Birthday Room) */}
      {(screen === 'playing' || screen === 'birthday_room') && (
        <>
          <GameHUD
            questState={questState}
            heroType={heroType}
            notification={notification}
            onOpenSettings={() => setShowSettings(true)}
            onOpenInventory={() => setShowInventory(true)}
            isBirthdayRoom={screen === 'birthday_room'}
          />

          {/* Touch Joystick & Actions */}
          <TouchControls
            onMovementChange={handleMovementChange}
            onInteract={handleInteract}
            onRotateCamera={handleRotateCamera}
            activeTarget={activeTarget}
          />
        </>
      )}

      {/* Birthday Room Dedicated Voice Message Terminal */}
      {screen === 'birthday_room' && showVoicePlayer && (
        <div className="absolute bottom-28 md:bottom-24 left-1/2 -translate-x-1/2 z-30 w-full px-4 max-w-lg pointer-events-auto animate-fade-in">
          <VoiceMessagePlayer
            onPlaybackStateChange={(playing) => {
              if (engineRef.current) {
                engineRef.current.setCameraZoom(playing ? 'cinematic_voice' : 'normal');
              }
            }}
            onEnded={() => {
              setTimeout(() => {
                setScreen('final_screen');
                setShowVoicePlayer(false);
              }, 1800);
            }}
          />
        </div>
      )}

      {/* Final Celebration Screen */}
      {screen === 'final_screen' && (
        <FinalCelebrationScreen
          onReturnToIsland={handleReturnToIsland}
          onTakeScreenshot={handleTakeScreenshot}
        />
      )}

      {/* Pixel Birthday Studio Screen */}
      {screen === 'studio' && (
        <PixelBirthdayStudio onBack={() => setScreen('menu')} />
      )}

      {/* Modals */}
      {showInventory && (
        <InventoryModal
          questState={questState}
          heroType={heroType}
          onClose={() => setShowInventory(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={(newSettings) => {
            setSettings(newSettings);
            saveSettings(newSettings);
          }}
          onResetProgress={handleResetProgress}
          onReturnToMainMenu={handleReturnToMainMenu}
          onClose={() => setShowSettings(false)}
        />
      )}

      {inspectingGift && (
        <BirthdayGiftModal
          giftType={inspectingGift}
          onClose={() => setInspectingGift(null)}
        />
      )}
    </div>
  );
}
