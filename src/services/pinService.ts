import { JournalOwner } from '../types/journal';

const PIN_STORAGE_KEY_PREFIX = 'dvaharaktera_pin_';

async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`dvaharaktera_salt_${pin}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const pinService = {
  hasPin(owner: JournalOwner): boolean {
    return Boolean(localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${owner}`));
  },

  async verifyPin(owner: JournalOwner, pinInput: string): Promise<boolean> {
    const storedHash = localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}${owner}`);
    if (!storedHash) return true; // No PIN set
    const inputHash = await hashPin(pinInput);
    return storedHash === inputHash;
  },

  async setPin(owner: JournalOwner, pin: string): Promise<void> {
    if (!pin || pin.trim().length === 0) {
      localStorage.removeItem(`${PIN_STORAGE_KEY_PREFIX}${owner}`);
      return;
    }
    const hash = await hashPin(pin);
    localStorage.setItem(`${PIN_STORAGE_KEY_PREFIX}${owner}`, hash);
  },

  removePin(owner: JournalOwner): void {
    localStorage.removeItem(`${PIN_STORAGE_KEY_PREFIX}${owner}`);
  },

  getHasPinMap(): Record<JournalOwner, boolean> {
    return {
      alizhan: Boolean(localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}alizhan`)),
      dilnaz: Boolean(localStorage.getItem(`${PIN_STORAGE_KEY_PREFIX}dilnaz`)),
    };
  },
};
