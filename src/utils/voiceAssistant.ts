/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language, VoiceAssistantStatus, VoiceCommandAction, VoiceCommandEvent } from '../types';
import { audioAlertManager } from './audioAlerts';

type CommandCallback = (action: VoiceCommandAction, transcript: string) => void;
type StatusCallback = (status: VoiceAssistantStatus, details?: string) => void;
type CommandEventCallback = (event: VoiceCommandEvent) => void;

// Web Speech API interface declarations
interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onend: ((this: SpeechRecognitionInstance, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognitionInstance, ev: { error: string }) => void) | null;
  onresult: ((this: SpeechRecognitionInstance, ev: SpeechRecognitionEvent) => void) | null;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

class VoiceAssistantService {
  private recognition: SpeechRecognitionInstance | null = null;
  private isActive = false;
  private isPausedForTTS = false;
  private status: VoiceAssistantStatus = 'idle';
  private currentLanguage: Language = 'en';
  private commandCallback: CommandCallback | null = null;
  private statusCallback: StatusCallback | null = null;
  private eventCallback: CommandEventCallback | null = null;
  private restartTimeout: number | null = null;
  private unsubscribeTTS: (() => void) | null = null;
  private consecutiveErrors = 0;

  constructor() {
    this.initTTSListener();
  }

  private initTTSListener() {
    this.unsubscribeTTS = audioAlertManager.subscribeSpeechState((isSpeaking) => {
      if (!this.isActive) return;

      if (isSpeaking) {
        // App is speaking: Pause speech recognition to prevent mic hearing own voice
        this.isPausedForTTS = true;
        this.updateStatus('paused_speaking', 'Paused while app is speaking');
        if (this.recognition) {
          try {
            this.recognition.abort();
          } catch {
            // Ignore abort error
          }
        }
      } else {
        // App finished speaking: Resume listening after slight buffer
        if (this.isPausedForTTS && this.isActive) {
          setTimeout(() => {
            if (this.isActive && !audioAlertManager.getIsSpeaking()) {
              this.isPausedForTTS = false;
              this.startListeningSession();
            }
          }, 300);
        }
      }
    });
  }

  public isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(
      (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  public registerCallbacks(
    onCommand: CommandCallback,
    onStatus: StatusCallback,
    onEvent: CommandEventCallback
  ) {
    this.commandCallback = onCommand;
    this.statusCallback = onStatus;
    this.eventCallback = onEvent;
  }

  private updateStatus(newStatus: VoiceAssistantStatus, details?: string) {
    this.status = newStatus;
    if (this.statusCallback) {
      this.statusCallback(newStatus, details);
    }
  }

  /**
   * Prompts user for microphone permission and initiates recognition
   */
  public async start(lang: Language): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupported()) {
      this.updateStatus('unsupported', 'Browser does not support SpeechRecognition');
      return {
        success: false,
        error:
          'Speech recognition is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.',
      };
    }

    this.currentLanguage = lang;
    this.isActive = true;
    this.consecutiveErrors = 0;
    this.updateStatus('starting', 'Requesting microphone access...');

    // Request microphone permission explicitly via getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        // Release the test audio track immediately
        stream.getTracks().forEach((t) => t.stop());
      } catch (err: unknown) {
        this.isActive = false;
        this.updateStatus('error', 'Microphone access denied');
        const isDenied =
          err instanceof DOMException &&
          (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError');
        return {
          success: false,
          error: isDenied
            ? 'Microphone permission was denied. Please allow microphone access in your browser settings to use voice commands.'
            : 'No microphone was detected on this device.',
        };
      }
    }

    this.startListeningSession();
    return { success: true };
  }

  private startListeningSession() {
    if (!this.isActive || this.isPausedForTTS) return;

    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }

    try {
      const SpeechRecognitionConstructor =
        (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
          .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
          .webkitSpeechRecognition;

      if (!SpeechRecognitionConstructor) {
        this.updateStatus('unsupported');
        return;
      }

      const rec = new SpeechRecognitionConstructor();
      this.recognition = rec;
      rec.continuous = true;
      rec.interimResults = false;

      // Select recognition language
      // If language is Telugu, use te-IN for regional voice models; fallback handles romanized terms
      rec.lang = this.currentLanguage === 'te' ? 'te-IN' : 'en-US';

      rec.onstart = () => {
        this.consecutiveErrors = 0;
        this.updateStatus('listening', 'Listening for commands...');
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const currentResult = event.results[event.results.length - 1];
        if (currentResult && currentResult[0]) {
          const rawTranscript = currentResult[0].transcript.trim();
          if (rawTranscript) {
            this.handleRecognizedSpeech(rawTranscript);
          }
        }
      };

      rec.onerror = (e) => {
        // 'no-speech' is expected when ambient noise is low; do not treat as fatal error
        if (e.error === 'no-speech') {
          return;
        }

        if (e.error === 'aborted') {
          return;
        }

        console.warn('Speech recognition error:', e.error);
        this.consecutiveErrors++;

        if (e.error === 'not-allowed') {
          this.isActive = false;
          this.updateStatus('error', 'Microphone permission denied');
        } else if (this.consecutiveErrors > 5) {
          this.updateStatus('error', `Speech error: ${e.error}`);
        }
      };

      rec.onend = () => {
        this.recognition = null;
        // Auto-restart if assistant is active and not paused for TTS
        if (this.isActive && !this.isPausedForTTS) {
          const delay = this.consecutiveErrors > 2 ? 1500 : 300;
          this.restartTimeout = window.setTimeout(() => {
            if (this.isActive && !this.isPausedForTTS) {
              this.startListeningSession();
            }
          }, delay);
        }
      };

      rec.start();
    } catch (err) {
      console.warn('Error starting speech recognition:', err);
      if (this.isActive && !this.isPausedForTTS) {
        this.restartTimeout = window.setTimeout(() => {
          this.startListeningSession();
        }, 1000);
      }
    }
  }

  /**
   * Parses natural language transcript into mapped action
   */
  private handleRecognizedSpeech(transcript: string) {
    this.updateStatus('processing', `Heard: "${transcript}"`);
    const action = this.matchCommand(transcript);

    let feedback = '';
    if (action) {
      feedback = this.getActionFeedback(action, this.currentLanguage);
    } else {
      feedback =
        this.currentLanguage === 'te'
          ? `కమాండ్ అర్థం కాలేదు: "${transcript}". దయచేసి 'కెమెరా ఆన్ చేయి' లేదా 'నా ముందు ఏమి ఉంది' అని చెప్పండి.`
          : `Command not recognized: "${transcript}". Say "Open camera", "What is in front", or "Repeat".`;
    }

    const commandEvent: VoiceCommandEvent = {
      id: `cmd-${Date.now()}`,
      transcript,
      action,
      feedback,
      timestamp: Date.now(),
    };

    if (this.eventCallback) {
      this.eventCallback(commandEvent);
    }

    if (action && this.commandCallback) {
      this.commandCallback(action, transcript);
    }

    // Return to listening status after handling
    setTimeout(() => {
      if (this.isActive && !this.isPausedForTTS) {
        this.updateStatus('listening', 'Listening for commands...');
      }
    }, 600);
  }

  /**
   * Matches both Telugu and English phrases to unified Command Actions
   */
  private matchCommand(rawText: string): VoiceCommandAction | null {
    const text = rawText.toLowerCase().trim();

    // 1. OPEN CAMERA / START NAVIGATION
    // English: "open camera", "start camera", "start navigation", "camera on", "turn on camera"
    // Telugu transliterated: "camera open cheyyi", "camera open chey", "camera on cheyyi", "camera start cheyyi"
    // Telugu script: "కెమెరా ఆన్ చేయి", "కెమెరా ఓపెన్ చేయి", "కెమెరా ప్రారంభించు"
    if (
      text.includes('open camera') ||
      text.includes('start camera') ||
      text.includes('start navigation') ||
      text.includes('turn on camera') ||
      text.includes('camera on') ||
      text.includes('camera open') ||
      text.includes('camera start') ||
      text.includes('ఓపెన్') ||
      text.includes('ఆన్ చేయి') ||
      text.includes('ప్రారంభించు')
    ) {
      return 'OPEN_CAMERA';
    }

    // 2. STOP CAMERA / STOP NAVIGATION
    // English: "stop camera", "stop navigation", "turn off camera", "close camera", "camera off"
    // Telugu transliterated: "camera aapu", "camera close cheyyi", "camera off cheyyi"
    // Telugu script: "కెమెరా ఆపు", "కెమెరా క్లోజ్ చేయి", "కెమెరా నిలిపివేయి"
    if (
      text.includes('stop camera') ||
      text.includes('stop navigation') ||
      text.includes('turn off camera') ||
      text.includes('close camera') ||
      text.includes('camera off') ||
      text.includes('camera aapu') ||
      text.includes('camera close') ||
      text.includes('కెమెరా ఆపు') ||
      text.includes('నిలిపివేయి') ||
      text.includes('ఆపు')
    ) {
      return 'STOP_CAMERA';
    }

    // 3. WHAT IS IN FRONT OF ME
    // English: "what is in front of me", "what's in front of me", "what is in front", "what is ahead", "what do you see"
    // Telugu transliterated: "na mundu em undi", "na mundu emi undi", "mundu em undi", "em undi"
    // Telugu script: "నా ముందు ఏమి ఉంది", "నా ముందు ఏముంది", "ముందు ఏముంది", "ఏమి కనిపిస్తోంది"
    if (
      text.includes('what is in front') ||
      text.includes("what's in front") ||
      text.includes('what is ahead') ||
      text.includes('what do you see') ||
      text.includes('in front of me') ||
      text.includes('in front') ||
      text.includes('na mundu') ||
      text.includes('mundu em undi') ||
      text.includes('em undi') ||
      text.includes('ఏమి ఉంది') ||
      text.includes('ఏముంది') ||
      text.includes('కనిపిస్తోంది')
    ) {
      return 'WHAT_IS_IN_FRONT';
    }

    // 4. REPEAT LAST ALERT
    // English: "repeat", "repeat last", "say again", "repeat alert"
    // Telugu: "malli cheppu", "malli", "inko sari cheppu"
    // Telugu script: "మళ్ళీ చెప్పు", "మళ్ళీ", "మరోసారి చెప్పు"
    if (
      text.includes('repeat') ||
      text.includes('say again') ||
      text.includes('malli cheppu') ||
      text.includes('malli') ||
      text.includes('మళ్ళీ') ||
      text.includes('మరోసారి')
    ) {
      return 'REPEAT';
    }

    // 5. SWITCH TO TELUGU
    // English: "switch to telugu", "speak telugu", "change to telugu", "telugu"
    // Telugu: "telugu lo cheppu", "telugu lo matladu", "తెలుగు", "తెలుగులో చెప్పు"
    if (
      text.includes('switch to telugu') ||
      text.includes('speak telugu') ||
      text.includes('change to telugu') ||
      text.includes('telugu lo') ||
      text.includes('తెలుగులో') ||
      text === 'telugu' ||
      text === 'తెలుగు'
    ) {
      return 'SWITCH_TELUGU';
    }

    // 6. SWITCH TO ENGLISH
    // English: "switch to english", "speak english", "change to english", "english"
    // Telugu: "english lo cheppu", "english lo matladu", "ఇంగ్లీషులో చెప్పు", "ఇంగ్లీష్"
    if (
      text.includes('switch to english') ||
      text.includes('speak english') ||
      text.includes('change to english') ||
      text.includes('english lo') ||
      text.includes('ఇంగ్లీషులో') ||
      text === 'english' ||
      text === 'ఇంగ్లీష్'
    ) {
      return 'SWITCH_ENGLISH';
    }

    // 7. STOP ASSISTANT
    // English: "stop assistant", "turn off assistant", "stop listening", "goodbye"
    // Telugu: "assistant aapu", "assistant close cheyyi", "అసిస్టెంట్ ఆపు"
    if (
      text.includes('stop assistant') ||
      text.includes('turn off assistant') ||
      text.includes('stop listening') ||
      text.includes('assistant aapu') ||
      text.includes('అసిస్టెంట్ ఆపు')
    ) {
      return 'STOP_ASSISTANT';
    }

    return null;
  }

  private getActionFeedback(action: VoiceCommandAction, lang: Language): string {
    if (lang === 'te') {
      switch (action) {
        case 'OPEN_CAMERA':
          return 'కెమెరా ప్రారంభించబడుతోంది...';
        case 'STOP_CAMERA':
          return 'కెమెరా ఆపివేయబడింది.';
        case 'WHAT_IS_IN_FRONT':
          return 'ఎదురుగా ఉన్న వస్తువులను పరిశీలిస్తోంది...';
        case 'REPEAT':
          return 'చివరి హెచ్చరికను మళ్ళీ పలుకుతోంది...';
        case 'SWITCH_TELUGU':
          return 'తెలుగు భాష ఎంపిక చేయబడింది.';
        case 'SWITCH_ENGLISH':
          return 'Switching to English.';
        case 'STOP_ASSISTANT':
          return 'వాయిస్ అసిస్టెంట్ ఆపివేయబడింది.';
      }
    } else {
      switch (action) {
        case 'OPEN_CAMERA':
          return 'Starting camera navigation...';
        case 'STOP_CAMERA':
          return 'Camera navigation stopped.';
        case 'WHAT_IS_IN_FRONT':
          return 'Checking objects straight ahead...';
        case 'REPEAT':
          return 'Repeating last spoken alert...';
        case 'SWITCH_TELUGU':
          return 'తెలుగు భాషకు మారుతోంది...';
        case 'SWITCH_ENGLISH':
          return 'Language set to English.';
        case 'STOP_ASSISTANT':
          return 'Voice assistant stopped.';
      }
    }
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    if (this.isActive && this.recognition) {
      // Re-configure recognition language smoothly
      this.recognition.lang = lang === 'te' ? 'te-IN' : 'en-US';
    }
  }

  public stop() {
    this.isActive = false;
    this.isPausedForTTS = false;
    if (this.restartTimeout) {
      clearTimeout(this.restartTimeout);
      this.restartTimeout = null;
    }
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // Ignore
      }
      this.recognition = null;
    }
    this.updateStatus('idle', 'Voice assistant is off');
  }

  public getStatus(): VoiceAssistantStatus {
    return this.status;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }
}

export const voiceAssistantService = new VoiceAssistantService();
