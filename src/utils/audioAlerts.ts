/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language, QueuedSpeech, SpeechPriority, VoiceEngineInfo } from '../types';

type SpeechStateListener = (speaking: boolean) => void;

interface AnnouncedState {
  sector: 'left' | 'ahead' | 'right';
  prominence: 'prominent' | 'moderate' | 'distant';
  timestamp: number;
}

class CentralizedSpeechManager {
  private audioCtx: AudioContext | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private voicesLoaded = false;
  private isSpeaking = false;
  private speechListeners: Set<SpeechStateListener> = new Set();
  private voiceLoadPromise: Promise<SpeechSynthesisVoice[]> | null = null;

  // Single centralized queue for all speech output
  private speechQueue: QueuedSpeech[] = [];
  private isProcessingQueue = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private acousticCooldownTimeout: number | null = null;

  // History tracking for cooldown and change detection
  private lastAnnouncedObjects: Map<string, AnnouncedState> = new Map();
  private lastSpokenText = '';
  private lastSpokenLanguage: Language = 'en';

  constructor() {
    this.ensureVoicesLoaded().catch(() => {});
  }

  /**
   * Ensures browser SpeechSynthesis voices are loaded
   */
  public ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
    if (this.voicesLoaded && this.voices.length > 0) {
      return Promise.resolve(this.voices);
    }

    if (this.voiceLoadPromise) {
      return this.voiceLoadPromise;
    }

    this.voiceLoadPromise = new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        this.voicesLoaded = true;
        resolve([]);
        return;
      }

      const synth = window.speechSynthesis;
      const initialVoices = synth.getVoices();
      if (initialVoices && initialVoices.length > 0) {
        this.voices = initialVoices;
        this.voicesLoaded = true;
        resolve(initialVoices);
        return;
      }

      let timeoutId: number;

      const handler = () => {
        const loaded = synth.getVoices();
        if (loaded && loaded.length > 0) {
          this.voices = loaded;
          this.voicesLoaded = true;
          clearTimeout(timeoutId);
          synth.onvoiceschanged = null;
          resolve(loaded);
        }
      };

      synth.onvoiceschanged = handler;

      // Fallback polling for browsers that don't reliably fire onvoiceschanged
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const polled = synth.getVoices();
        if (polled && polled.length > 0) {
          clearInterval(interval);
          clearTimeout(timeoutId);
          this.voices = polled;
          this.voicesLoaded = true;
          resolve(polled);
        } else if (attempts > 25) {
          clearInterval(interval);
        }
      }, 100);

      timeoutId = window.setTimeout(() => {
        clearInterval(interval);
        this.voices = synth.getVoices();
        this.voicesLoaded = true;
        resolve(this.voices);
      }, 2500);
    });

    return this.voiceLoadPromise;
  }

  public subscribeSpeechState(listener: SpeechStateListener): () => void {
    this.speechListeners.add(listener);
    return () => this.speechListeners.delete(listener);
  }

  private notifySpeechState(speaking: boolean) {
    this.isSpeaking = speaking;
    this.speechListeners.forEach((listener) => {
      try {
        listener(speaking);
      } catch (e) {
        console.warn('Speech listener callback error:', e);
      }
    });
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  /**
   * Finds a genuine Telugu TTS voice
   */
  public getTeluguVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const all = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();

    const exactMatch = all.find((v) => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      return lang === 'te-in' || lang === 'te';
    });
    if (exactMatch) return exactMatch;

    const startsWithTe = all.find((v) => {
      const lang = v.lang.toLowerCase().replace('_', '-');
      return lang.startsWith('te') && !lang.startsWith('en');
    });
    if (startsWithTe) return startsWithTe;

    const nameMatch = all.find((v) => {
      const name = v.name.toLowerCase();
      const lang = v.lang.toLowerCase();
      return name.includes('telugu') && !lang.startsWith('en');
    });
    return nameMatch || null;
  }

  /**
   * Finds an appropriate English voice
   */
  public getEnglishVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const all = this.voices.length > 0 ? this.voices : window.speechSynthesis.getVoices();

    return (
      all.find((v) => v.lang.toLowerCase().replace('_', '-').includes('en-in')) ||
      all.find((v) => v.lang.toLowerCase().replace('_', '-').includes('en-us')) ||
      all.find((v) => v.lang.toLowerCase().startsWith('en')) ||
      null
    );
  }

  public getVoiceEngineInfo(): VoiceEngineInfo {
    const teVoice = this.getTeluguVoice();
    const enVoice = this.getEnglishVoice();

    return {
      loaded: this.voicesLoaded,
      hasTeluguVoice: !!teVoice,
      teluguVoiceName: teVoice ? teVoice.name : null,
      hasEnglishVoice: !!enVoice,
      englishVoiceName: enVoice ? enVoice.name : null,
    };
  }

  /**
   * 3D spatial acoustic earcon (left / center / right)
   */
  public playSpatialChime(sector: 'left' | 'ahead' | 'right') {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      let panner: StereoPannerNode | null = null;
      if ('createStereoPanner' in ctx) {
        panner = ctx.createStereoPanner();
        if (sector === 'left') panner.pan.value = -0.85;
        else if (sector === 'right') panner.pan.value = 0.85;
        else panner.pan.value = 0.0;
      }

      if (sector === 'ahead') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1050, now);
        osc.frequency.exponentialRampToValueAtTime(1350, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        if (panner) osc.connect(gain).connect(panner).connect(ctx.destination);
        else osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        if (panner) osc.connect(gain).connect(panner).connect(ctx.destination);
        else osc.connect(gain).connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.16);
      }
    } catch {
      // Ignore audio context errors
    }
  }

  public triggerHaptic(durationMs = 80) {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(durationMs);
      } catch {
        // Ignore
      }
    }
  }

  /**
   * PART 3: Intelligent Duplicate Suppression
   * Checks if an announcement should be throttled based on cooldown AND state change.
   * If the object changed sector (e.g. from right to ahead) or became prominent, it can alert sooner.
   */
  public shouldSuppress(
    className: string,
    sector: 'left' | 'ahead' | 'right',
    prominence: 'prominent' | 'moderate' | 'distant',
    cooldownSeconds: number
  ): boolean {
    const prev = this.lastAnnouncedObjects.get(className);
    if (!prev) return false;

    const elapsed = (Date.now() - prev.timestamp) / 1000;

    // Meaningful state change: moved to direct path ahead, or became prominent
    const movedToAhead = prev.sector !== 'ahead' && sector === 'ahead';
    const becameProminent = prev.prominence !== 'prominent' && prominence === 'prominent';

    if (movedToAhead || becameProminent) {
      // Reduced cooldown threshold for significant movement / closer approach
      return elapsed < Math.min(2.5, cooldownSeconds * 0.5);
    }

    return elapsed < cooldownSeconds;
  }

  public markAnnounced(
    className: string,
    sector: 'left' | 'ahead' | 'right',
    prominence: 'prominent' | 'moderate' | 'distant'
  ) {
    this.lastAnnouncedObjects.set(className, {
      sector,
      prominence,
      timestamp: Date.now(),
    });
  }

  public resetCooldowns() {
    this.lastAnnouncedObjects.clear();
  }

  /**
   * PART 1: Centralized Single-Queue Speech Dispatcher
   * Ensures only one speech utterance plays at a time.
   * Handles priority preemption, queue deduplication, and safe error handling.
   */
  public enqueue(
    text: string,
    lang: Language,
    priority: SpeechPriority = 'normal',
    rate = 1.0,
    sector?: 'left' | 'ahead' | 'right',
    className?: string
  ): Promise<{ success: boolean; voiceUsed: string | null; error?: string }> {
    return new Promise((resolve) => {
      const cleanText = text.trim();
      if (!cleanText) {
        resolve({ success: false, voiceUsed: null, error: 'Empty text' });
        return;
      }

      // HIGH PRIORITY (e.g., User Voice Command response, "What is in front of me?", Stop signal):
      if (priority === 'high') {
        // Clear pending low/normal priority queue
        this.speechQueue = [];

        // If currently speaking a lower priority item, cancel it immediately
        if (this.isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          this.currentUtterance = null;
          this.isProcessingQueue = false;
        }

        const highItem: QueuedSpeech = {
          id: `speech-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          text: cleanText,
          lang,
          priority: 'high',
          rate,
          timestamp: Date.now(),
          sector,
          className,
          resolve,
        };

        this.speechQueue.unshift(highItem);
        this.processQueue();
        return;
      }

      // NORMAL / LOW PRIORITY:
      // Prevent backlog accumulation: if queue already contains a pending item, replace it
      // so the user never gets an outdated queue of announcements while walking
      this.speechQueue = [
        {
          id: `speech-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          text: cleanText,
          lang,
          priority,
          rate,
          timestamp: Date.now(),
          sector,
          className,
          resolve,
        },
      ];

      this.processQueue();
    });
  }

  /**
   * Compatibility wrapper for speak() that routes directly into the centralized queue
   */
  public speak(
    text: string,
    lang: Language,
    rate = 1.0,
    preempt = true
  ): Promise<{ success: boolean; voiceUsed: string | null; error?: string }> {
    return this.enqueue(text, lang, preempt ? 'high' : 'normal', rate);
  }

  /**
   * Processes the single speech queue sequentially
   */
  private async processQueue() {
    if (this.isProcessingQueue || this.speechQueue.length === 0) {
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      while (this.speechQueue.length > 0) {
        const item = this.speechQueue.shift();
        item?.resolve?.({ success: false, voiceUsed: null, error: 'Speech synthesis not supported' });
      }
      return;
    }

    await this.ensureVoicesLoaded();

    const item = this.speechQueue.shift();
    if (!item) return;

    this.isProcessingQueue = true;
    const synth = window.speechSynthesis;

    if (this.acousticCooldownTimeout) {
      clearTimeout(this.acousticCooldownTimeout);
      this.acousticCooldownTimeout = null;
    }

    this.lastSpokenText = item.text;
    this.lastSpokenLanguage = item.lang;

    const utterance = new SpeechSynthesisUtterance(item.text);
    this.currentUtterance = utterance;
    utterance.rate = Math.max(0.7, Math.min(1.4, item.rate || 1.0));
    utterance.pitch = 1.0;

    let selectedVoice: SpeechSynthesisVoice | null = null;

    if (item.lang === 'te') {
      const teVoice = this.getTeluguVoice();
      if (teVoice) {
        selectedVoice = teVoice;
        utterance.voice = teVoice;
        utterance.lang = teVoice.lang || 'te-IN';
      } else {
        // Crucial requirement: Do not silently use English pronunciation for Telugu text
        utterance.lang = 'te-IN';
      }
    } else {
      const enVoice = this.getEnglishVoice();
      if (enVoice) {
        selectedVoice = enVoice;
        utterance.voice = enVoice;
        utterance.lang = enVoice.lang || 'en-US';
      } else {
        utterance.lang = 'en-US';
      }
    }

    const finishStep = (success: boolean, error?: string) => {
      this.currentUtterance = null;
      this.isProcessingQueue = false;

      item.resolve?.({
        success,
        voiceUsed: selectedVoice?.name || null,
        error,
      });

      // If queue has more items, process next immediately
      if (this.speechQueue.length > 0) {
        this.processQueue();
      } else {
        // Give 350ms acoustic cooldown after the last word finishes before unpausing microphone
        this.acousticCooldownTimeout = window.setTimeout(() => {
          this.notifySpeechState(false);
          this.acousticCooldownTimeout = null;
        }, 350);
      }
    };

    utterance.onstart = () => {
      // Pause speech recognition while speaking
      this.notifySpeechState(true);
    };

    utterance.onend = () => {
      finishStep(true);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e.error);
      finishStep(false, e.error);
    };

    try {
      synth.speak(utterance);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      finishStep(false, msg);
    }
  }

  /**
   * PART 5: Immediate Stop Controls
   * Immediately clears queue, cancels ongoing speech, and optionally announces a brief final message.
   */
  public cancelAll(finalMessage?: string, lang: Language = 'en') {
    this.speechQueue = [];
    if (this.acousticCooldownTimeout) {
      clearTimeout(this.acousticCooldownTimeout);
      this.acousticCooldownTimeout = null;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.isProcessingQueue = false;
    }

    this.notifySpeechState(false);

    if (finalMessage) {
      this.enqueue(finalMessage, lang, 'high', 1.0);
    }
  }

  public testVoice(lang: Language): Promise<{
    success: boolean;
    voiceName: string | null;
    message: string;
  }> {
    if (lang === 'te') {
      const teVoice = this.getTeluguVoice();
      if (!teVoice) {
        return Promise.resolve({
          success: false,
          voiceName: null,
          message:
            'No real Telugu (te-IN) voice is currently installed on this device/browser. Please check the installation guide below.',
        });
      }

      const samplePhrase = 'నమస్కారం! దృష్టిపథ్ ఏఐ సెంట్రలైజ్డ్ వాయిస్ అలర్ట్ సిస్టమ్ విజయవంతంగా పనిచేస్తోంది.';
      return this.enqueue(samplePhrase, 'te', 'high', 1.0).then((res) => ({
        success: res.success,
        voiceName: teVoice.name,
        message: res.success
          ? `Telugu voice (${teVoice.name}) tested successfully!`
          : `Speech error: ${res.error}`,
      }));
    } else {
      const enVoice = this.getEnglishVoice();
      const samplePhrase = 'Hello! DrishtiPath AI centralized voice alert system is active and clear.';
      return this.enqueue(samplePhrase, 'en', 'high', 1.0).then((res) => ({
        success: res.success,
        voiceName: enVoice?.name || 'Default English',
        message: 'English voice tested successfully!',
      }));
    }
  }

  public repeatLastSpoken(): Promise<{ success: boolean; voiceUsed: string | null }> {
    if (this.lastSpokenText) {
      return this.enqueue(this.lastSpokenText, this.lastSpokenLanguage, 'high', 1.0);
    }
    return Promise.resolve({ success: false, voiceUsed: null });
  }

  public getLastSpokenText(): string {
    return this.lastSpokenText;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const audioAlertManager = new CentralizedSpeechManager();
