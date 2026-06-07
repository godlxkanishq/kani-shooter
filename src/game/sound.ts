/**
 * Simple 8-bit retro sound synthesizer using the Web Audio API.
 * This provides immediate, authentic retro SFX without needing external audio asset files.
 */
class RetroSynth {
  private ctx: AudioContext | null = null;
  private masterVol: number = 0.8;
  private sfxVol: number = 0.8;
  private musicVol: number = 0.7;
  private isMuted: boolean = false;
  private musicOsc: OscillatorNode | null = null;
  private musicGain: GainNode | null = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // Lazy initialize AudioContext on first user interaction to comply with browser autoplay policies
  }

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  setVolumes(master: number, music: number, sfx: number) {
    this.masterVol = master;
    this.musicVol = music;
    this.sfxVol = sfx;

    if (this.musicGain && this.isMusicPlaying) {
      this.musicGain.gain.setValueAtTime(this.musicVol * this.masterVol * 0.15, this.ctx!.currentTime);
    }
  }

  playSFX(type: 'shoot_pistol' | 'shoot_machine' | 'shoot_spread' | 'shoot_laser' | 'shoot_flame' | 'shoot_rocket' | 'shoot_plasma' | 'jump' | 'hit' | 'explosion' | 'powerup' | 'win' | 'gameover') {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    // Create standard volume controller
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(this.sfxVol * this.masterVol, now);
    masterGain.connect(ctx.destination);

    switch (type) {
      case 'shoot_pistol': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'shoot_machine': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.06);
        break;
      }
      case 'shoot_spread': {
        // Multi-frequency blast
        [500, 700, 900].forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 0.12);
        });
        break;
      }
      case 'shoot_laser': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.25);
        break;
      }
      case 'shoot_flame': {
        // Noise buffer
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.frequency.exponentialRampToValueAtTime(200, now + 0.15);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.15);
        break;
      }
      case 'shoot_rocket': {
        // Exploding rocket sound
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.4);

        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(masterGain);
        noise.connect(noiseGain);
        noiseGain.connect(masterGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 0.4);
        noise.stop(now + 0.4);
        break;
      }
      case 'shoot_plasma': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.linearRampToValueAtTime(1600, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.22);
        break;
      }
      case 'jump': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'hit': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.setValueAtTime(60, now + 0.05);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      }
      case 'explosion': {
        const bufferSize = ctx.sampleRate * 0.6;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 0.6);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.6);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        noise.start(now);
        noise.stop(now + 0.6);
        break;
      }
      case 'powerup': {
        const times = [0, 0.06, 0.12, 0.18];
        const freqs = [300, 450, 600, 900];
        times.forEach((t, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freqs[i], now + t);
          gain.gain.setValueAtTime(0.15, now + t);
          gain.gain.linearRampToValueAtTime(0.01, now + t + 0.08);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + t);
          osc.stop(now + t + 0.08);
        });
        break;
      }
      case 'win': {
        const freqs = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50]; // C5, E5, G5, C6, G5, C6
        const times = [0, 0.12, 0.24, 0.36, 0.48, 0.6];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + times[i]);
          gain.gain.setValueAtTime(0.2, now + times[i]);
          gain.gain.linearRampToValueAtTime(0.01, now + times[i] + 0.18);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + 0.18);
        });
        break;
      }
      case 'gameover': {
        const freqs = [392.00, 349.23, 311.13, 261.63]; // G4, F4, D#4, C4
        const times = [0, 0.25, 0.5, 0.75];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + times[i]);
          gain.gain.setValueAtTime(0.2, now + times[i]);
          gain.gain.linearRampToValueAtTime(0.01, now + times[i] + 0.35);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + times[i]);
          osc.stop(now + times[i] + 0.35);
        });
        break;
      }
    }
  }

  // Play background chiptune track loop
  startMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    const ctx = this.initCtx();
    const now = ctx.currentTime;

    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.musicVol * this.masterVol * 0.15, now);
    this.musicGain.connect(ctx.destination);

    this.isMusicPlaying = true;
    this.playMusicNoteLoop(0);
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicOsc) {
      try {
        this.musicOsc.stop();
      } catch (e) {}
      this.musicOsc = null;
    }
  }

  private playMusicNoteLoop(step: number) {
    if (!this.isMusicPlaying || !this.ctx || this.isMuted) return;

    const notes = [
      110, 110, 130, 110, 146, 146, 130, 110, // A2, A2, C3, A2, D3, D3, C3, A2
      165, 165, 146, 165, 196, 165, 130, 110, // E3, E3, D3, E3, G3, E3, C3, A2
    ];
    const freq = notes[step % notes.length];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    // Simple delay / reverb synth decay
    noteGain.gain.setValueAtTime(0.6, now);
    noteGain.gain.exponentialRampToValueAtTime(0.01, now + 0.24);

    osc.connect(noteGain);
    noteGain.connect(this.musicGain!);

    osc.start(now);
    osc.stop(now + 0.25);

    // Schedule next beat (120 BPM = 0.25s per 16th note)
    setTimeout(() => {
      this.playMusicNoteLoop(step + 1);
    }, 250);
  }
}

export const sound = new RetroSynth();
export default sound;
