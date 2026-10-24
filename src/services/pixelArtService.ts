/**
 * Сервис пиксельной фотостудии (абстракция для будущей интеграции)
 */

export type PixelArtStyle = 'pixel_birthday' | 'minecraft_hero' | 'retro_adventure';

export interface PixelStyleOption {
  id: PixelArtStyle;
  name: string;
  paletteDescription: string;
  accentColor: string;
  badge: string;
}

export const PIXEL_STYLES: PixelStyleOption[] = [
  {
    id: 'pixel_birthday',
    name: 'Пиксельный день рождения',
    paletteDescription: 'Праздничная 32-битная палитра с конфетти, колпачками и сияющими свечами.',
    accentColor: '#ec4899',
    badge: '🎂 Праздничный стиль',
  },
  {
    id: 'minecraft_hero',
    name: 'Герой Minecraft',
    paletteDescription: 'Воксельные пропорции, текстуры блоков, инструменты исследователя и броня.',
    accentColor: '#10b981',
    badge: '⛏️ Воксельная легенда',
  },
  {
    id: 'retro_adventure',
    name: 'Ретро-приключение',
    paletteDescription: 'Классический портретный стиль 16/32-битных RPG с мягкой пиксельной обводкой.',
    accentColor: '#3b82f6',
    badge: '🗡️ Классическая RPG',
  },
];

export interface GeneratePixelArtParams {
  imageBlob: Blob | string;
  style: PixelArtStyle;
  recipientName: string;
}

export interface PixelArtResult {
  success: boolean;
  resultImageUrl?: string;
  message: string;
}

class PixelArtService {
  private isConfigured: boolean = false;

  public isServiceAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Генерация пиксельного портрета.
   * Если внешний сервис не подключён, возвращает понятное сообщение на русском:
   * "Генерация пиксель-арта пока не подключена."
   */
  public async generatePortrait(params: GeneratePixelArtParams): Promise<PixelArtResult> {
    if (!this.isConfigured) {
      return {
        success: false,
        message: 'Генерация пиксель-арта пока не подключена.',
      };
    }

    return {
      success: false,
      message: 'Сервис временно недоступен.',
    };
  }
}

export const pixelArtService = new PixelArtService();
