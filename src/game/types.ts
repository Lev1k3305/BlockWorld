export type HeroType = 'sister' | 'brother';

export type GameScreen = 
  | 'welcome'
  | 'menu' 
  | 'character_select' 
  | 'playing' 
  | 'birthday_room' 
  | 'final_screen' 
  | 'studio';

export interface QuestState {
  crystalsCollected: Record<string, boolean>; // 'crystal_parkour', 'crystal_cave', 'crystal_waterfall'
  starsCollected: Record<string, boolean>; // 'star_1' to 'star_5'
  heartRestored: boolean;
  portalDiscovered: boolean;
  birthdayRoomVisited: boolean;
  sisterGiftOpened: boolean;
  brotherGiftOpened: boolean;
  voiceMessageListened: boolean;
}

export interface GameSettings {
  sfxVolume: number;
  musicVolume: number;
  particlesEnabled: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  cameraSensitivity: number;
}

export interface InteractiveTarget {
  id: string;
  name: string;
  type: 'crystal' | 'star' | 'heart' | 'portal' | 'gift_sister' | 'gift_brother' | 'cake' | 'dragon';
  prompt: string;
  position: [number, number, number];
  distance: number;
}
