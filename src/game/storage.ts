import { GameSettings, HeroType, QuestState } from './types';

const STORAGE_KEYS = {
  QUEST: 'blockworld_quest_state_v2',
  QUEST_LEGACY: 'blockworld_quest_state_v1',
  SETTINGS: 'blockworld_settings_v1',
  HERO: 'blockworld_selected_hero_v1',
};

export const defaultQuestState: QuestState = {
  crystalsCollected: {},
  starsCollected: {},
  heartRestored: false,
  portalDiscovered: false,
  birthdayRoomVisited: false,
  sisterGiftOpened: false,
  brotherGiftOpened: false,
  voiceMessageListened: false,
};

export const defaultSettings: GameSettings = {
  sfxVolume: 0.8,
  musicVolume: 0.5,
  particlesEnabled: true,
  graphicsQuality: 'high',
  cameraSensitivity: 1.0,
};

export function loadQuestState(): QuestState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.QUEST) || localStorage.getItem(STORAGE_KEYS.QUEST_LEGACY);
    if (raw) {
      return { ...defaultQuestState, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load quest state from localStorage', e);
  }
  return { ...defaultQuestState };
}

export function saveQuestState(state: QuestState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.QUEST, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save quest state to localStorage', e);
  }
}

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) {
      return { ...defaultSettings, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load settings', e);
  }
  return { ...defaultSettings };
}

export function saveSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadSelectedHero(): HeroType {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.HERO);
    if (val === 'sister' || val === 'brother') return val;
  } catch (e) {
    console.error('Failed to load hero choice', e);
  }
  return 'brother'; // Default to brother or sister
}

export function saveSelectedHero(hero: HeroType): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HERO, hero);
  } catch (e) {
    console.error('Failed to save hero choice', e);
  }
}

export function resetGameProgress(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.QUEST);
    localStorage.removeItem(STORAGE_KEYS.QUEST_LEGACY);
  } catch (e) {
    console.error('Failed to reset quest state', e);
  }
}
