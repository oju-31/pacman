export class SoundManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private musicVolume: number = 0.3;
  private effectsVolume: number = 0.5;
  private muted: boolean = false;

  constructor() {
    this.initializeSounds();
  }

  private initializeSounds(): void {
    // Create audio elements for different sounds
    const soundFiles = {
      pellet: this.createBeepSound(800, 0.1), // High beep for pellet
      gameStart: this.createBeepSound(440, 0.3), // Game start sound
      gameOver: this.createBeepSound(200, 0.5), // Game over sound
      pause: this.createBeepSound(600, 0.2), // Pause sound
      win: this.createMelody([523, 659, 784, 1047], 0.15), // Victory melody
      ghost: this.createBeepSound(150, 0.3), // Ghost collision sound
      extraLife: this.createMelody([523, 659, 784], 0.2), // Extra life sound
    };

    // Store all sounds
    Object.entries(soundFiles).forEach(([name, audio]) => {
      this.sounds.set(name, audio);
    });

    // Create background music
    this.sounds.set('background', this.createBackgroundMusic());
  }

  private createBeepSound(frequency: number, duration: number): HTMLAudioElement {
    // Create audio context for generating sounds
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    // Create audio buffer
    const sampleRate = audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate beep sound
    for (let i = 0; i < numSamples; i++) {
      channelData[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      // Apply fade out
      channelData[i] *= Math.max(0, 1 - (i / numSamples));
    }

    // Convert buffer to audio element
    const audio = new Audio();
    const blob = this.bufferToWave(buffer);
    audio.src = URL.createObjectURL(blob);
    audio.volume = this.effectsVolume;
    
    return audio;
  }

  private createMelody(frequencies: number[], noteDuration: number): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const totalDuration = frequencies.length * noteDuration;
    const numSamples = sampleRate * totalDuration;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    frequencies.forEach((freq, index) => {
      const startSample = index * noteDuration * sampleRate;
      const endSample = (index + 1) * noteDuration * sampleRate;
      
      for (let i = startSample; i < endSample && i < numSamples; i++) {
        const relativeI = i - startSample;
        const noteSamples = noteDuration * sampleRate;
        channelData[i] = Math.sin(2 * Math.PI * freq * relativeI / sampleRate) * 0.2;
        // Apply fade out for each note
        channelData[i] *= Math.max(0, 1 - (relativeI / noteSamples));
      }
    });

    const audio = new Audio();
    const blob = this.bufferToWave(buffer);
    audio.src = URL.createObjectURL(blob);
    audio.volume = this.effectsVolume;
    
    return audio;
  }

  private createBackgroundMusic(): HTMLAudioElement {
    // Create a simple repeating melody for background music
    const melody = [262, 294, 330, 349, 392, 440, 494, 523]; // C major scale
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const sampleRate = audioContext.sampleRate;
    const noteDuration = 0.4;
    const totalDuration = melody.length * noteDuration;
    const numSamples = sampleRate * totalDuration;
    const buffer = audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    melody.forEach((freq, index) => {
      const startSample = index * noteDuration * sampleRate;
      const endSample = (index + 1) * noteDuration * sampleRate;
      
      for (let i = startSample; i < endSample && i < numSamples; i++) {
        const relativeI = i - startSample;
        channelData[i] = Math.sin(2 * Math.PI * freq * relativeI / sampleRate) * 0.1;
      }
    });

    const audio = new Audio();
    const blob = this.bufferToWave(buffer);
    audio.src = URL.createObjectURL(blob);
    audio.volume = this.musicVolume;
    audio.loop = true;
    
    return audio;
  }

  private bufferToWave(buffer: AudioBuffer): Blob {
    const length = buffer.length;
    const arrayBuffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(arrayBuffer);
    const channelData = buffer.getChannelData(0);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);

    // Convert float samples to 16-bit PCM
    let offset = 44;
    for (let i = 0; i < length; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(offset, sample * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' });
  }

  public playSound(soundName: string): void {
    if (this.muted) return;
    
    const sound = this.sounds.get(soundName);
    if (sound) {
      sound.currentTime = 0; // Reset to beginning
      sound.play().catch(e => console.log('Sound play failed:', e));
    }
  }

  public playBackgroundMusic(): void {
    if (this.muted) return;
    
    const music = this.sounds.get('background');
    if (music) {
      music.play().catch(e => console.log('Background music play failed:', e));
    }
  }

  public stopBackgroundMusic(): void {
    const music = this.sounds.get('background');
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    
    if (this.muted) {
      this.stopBackgroundMusic();
    }
    
    return this.muted;
  }

  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    const music = this.sounds.get('background');
    if (music) {
      music.volume = this.musicVolume;
    }
  }

  public setEffectsVolume(volume: number): void {
    this.effectsVolume = Math.max(0, Math.min(1, volume));
    this.sounds.forEach((sound, name) => {
      if (name !== 'background') {
        sound.volume = this.effectsVolume;
      }
    });
  }

  public isMuted(): boolean {
    return this.muted;
  }
}
