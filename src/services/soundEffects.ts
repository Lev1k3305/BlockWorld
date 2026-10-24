/**
 * Web Audio API Sound Generator & Synthesizer
 * Zero external asset dependencies for sound effects and ambient chiptune music.
 * Cleanly handles user interaction unlocking, master volume, and smooth envelopes.
 */

class SoundService {
  private ctx: AudioContext | null = null;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.5;
  private isMusicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private musicGainNode: GainNode | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.15, this.ctx.currentTime);
    }
  }

  public toggleMute(muted?: boolean) {
    this.isMuted = muted !== undefined ? muted : !this.isMuted;
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.15, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  public playButtonClick() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playJump() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);

    gain.gain.setValueAtTime(this.sfxVolume * 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playFootstep() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.05);

    gain.gain.setValueAtTime(this.sfxVolume * 0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playCrystalCollect() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (major arpeggio)

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteTime = now + idx * 0.08;
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.sfxVolume * 0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.25);
    });
  }

  public playStarCollect() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    const notes = [659.25, 830.61, 987.77]; // E5, G#5, B5

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteTime = now + idx * 0.06;
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(this.sfxVolume * 0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.2);
    });
  }

  public playDragonChirp() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(1100, now + 0.16);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playHeartRestored() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const now = this.ctx.currentTime;
    // Grand celebratory chime chord
    const chords = [
      [261.63, 329.63, 392.00, 523.25], // C
      [293.66, 369.99, 440.00, 587.33], // D
      [329.63, 415.30, 493.88, 659.25], // E
      [523.25, 659.25, 783.99, 1046.50] // C octave
    ];

    chords.forEach((chord, chordIdx) => {
      const chordStart = now + chordIdx * 0.25;
      chord.forEach(freq => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, chordStart);

        gain.gain.setValueAtTime(this.sfxVolume * 0.2, chordStart);
        gain.gain.exponentialRampToValueAtTime(0.001, chordStart + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(chordStart);
        osc.stop(chordStart + 0.6);
      });
    });
  }

  public playPortalTeleport() {
    this.initContext();
    if (!this.ctx || this.isMuted || this.sfxVolume <= 0) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    const now = this.ctx.currentTime;
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.8);

    gain.gain.setValueAtTime(this.sfxVolume * 0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  // --- Procedural Ambient Adventure Chiptune Music ---

  public startBackgroundMusic() {
    if (this.isMusicPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    this.isMusicPlaying = true;
    this.musicGainNode = this.ctx.createGain();
    this.musicGainNode.gain.setValueAtTime(this.isMuted ? 0 : this.musicVolume * 0.12, this.ctx.currentTime);
    this.musicGainNode.connect(this.ctx.destination);

    // Cheerful, cozy adventure progression: C, G, Am, F, C, G, F, C
    const melodyNotes = [
      523.25, 659.25, 783.99, 659.25,  // C E G E
      587.33, 739.99, 880.00, 739.99,  // D F# A F#
      440.00, 523.25, 659.25, 523.25,  // A C E C
      349.23, 440.00, 523.25, 440.00,  // F A C A
      523.25, 659.25, 783.99, 1046.50, // C E G C
      783.99, 659.25, 587.33, 523.25   // G E D C
    ];

    let noteIdx = 0;
    const playNextNote = () => {
      if (!this.isMusicPlaying || !this.ctx || !this.musicGainNode) return;

      const osc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();

      osc.type = 'triangle';
      const now = this.ctx.currentTime;
      const freq = melodyNotes[noteIdx % melodyNotes.length];
      osc.frequency.setValueAtTime(freq, now);

      noteGain.gain.setValueAtTime(0.2, now);
      noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(noteGain);
      noteGain.connect(this.musicGainNode);

      osc.start(now);
      osc.stop(now + 0.35);

      noteIdx++;
      this.musicTimer = window.setTimeout(playNextNote, 380);
    };

    playNextNote();
  }

  public stopBackgroundMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  /**
   * Generates a sweet synthesized birthday greeting melody for preview/testing
   * when an actual recording is not yet placed in public/audio/birthday-message.mp3
   */
  public playSynthesizedBirthdayMelody(onProgress?: (progress: number) => void, onEnded?: () => void) {
    this.initContext();
    if (!this.ctx) return;

    // "Happy Birthday to You" notes
    // C4 C4 D4 C4 F4 E4 | C4 C4 D4 C4 G4 F4 | C4 C4 C5 A4 F4 E4 D4 | Bb4 Bb4 A4 F4 G4 F4
    const song = [
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 1.2 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 293.66, d: 0.7 }, { f: 261.63, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.2 },
      { f: 261.63, d: 0.35 }, { f: 261.63, d: 0.35 }, { f: 523.25, d: 0.7 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 329.63, d: 0.7 }, { f: 293.66, d: 1.0 },
      { f: 466.16, d: 0.35 }, { f: 466.16, d: 0.35 }, { f: 440.00, d: 0.7 }, { f: 349.23, d: 0.7 }, { f: 392.00, d: 0.7 }, { f: 349.23, d: 1.4 }
    ];

    let totalDuration = 0;
    song.forEach(s => { totalDuration += s.d + 0.05; });

    let currentOffset = 0;
    const now = this.ctx.currentTime;

    song.forEach((item) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const noteStart = now + currentOffset;
      osc.frequency.setValueAtTime(item.f, noteStart);

      gain.gain.setValueAtTime(0.3, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + item.d);

      currentOffset += item.d + 0.05;
    });

    const startTime = Date.now();
    const interval = window.setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const p = Math.min(1, elapsed / totalDuration);
      if (onProgress) onProgress(p);
      if (elapsed >= totalDuration) {
        clearInterval(interval);
        if (onEnded) onEnded();
      }
    }, 100);

    return () => clearInterval(interval);
  }
}

export const sounds = new SoundService();
