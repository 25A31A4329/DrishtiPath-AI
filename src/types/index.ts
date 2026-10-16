/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'en' | 'te';

export type HighContrastMode = 'dark-high' | 'yellow-black' | 'light-high';

export type ObjectCategory = 'person' | 'vehicle' | 'animal' | 'furniture' | 'item' | 'safety';

export interface DetectionResult {
  id: string;
  class: string;
  translatedName: string;
  score: number;
  bbox: [number, number, number, number]; // [x, y, width, height]
  sector: 'left' | 'ahead' | 'right';
  estimatedRelativeDistance: 'prominent' | 'moderate' | 'distant'; // based on bbox size in frame
  timestamp: number;
}

export interface VoiceAlert {
  id: string;
  text: string;
  language: Language;
  timestamp: number;
  sector?: 'left' | 'ahead' | 'right';
  className?: string;
}

export type AlertVerbosity = 'minimal' | 'balanced' | 'detailed';

export type SpeechPriority = 'high' | 'normal' | 'low';

export interface QueuedSpeech {
  id: string;
  text: string;
  lang: Language;
  priority: SpeechPriority;
  rate?: number;
  timestamp: number;
  sector?: 'left' | 'ahead' | 'right';
  className?: string;
  resolve?: (value: { success: boolean; voiceUsed: string | null; error?: string }) => void;
}

export interface AppSettings {
  language: Language;
  minConfidence: number; // e.g. 0.50 (50%)
  speechCooldownSeconds: number; // e.g. 6 seconds
  speechRate: number; // 0.8 to 1.3
  spatialAudioChimes: boolean;
  hapticFeedback: boolean;
  highContrastMode: HighContrastMode;
  facingMode: 'environment' | 'user';
  autoSpeak: boolean;
  voiceAssistantActive: boolean;
  alertVerbosity: AlertVerbosity;
}

export type VoiceCommandAction =
  | 'OPEN_CAMERA'
  | 'STOP_CAMERA'
  | 'WHAT_IS_IN_FRONT'
  | 'REPEAT'
  | 'SWITCH_TELUGU'
  | 'SWITCH_ENGLISH'
  | 'STOP_ASSISTANT';

export type VoiceAssistantStatus =
  | 'idle'
  | 'starting'
  | 'listening'
  | 'paused_speaking'
  | 'processing'
  | 'error'
  | 'unsupported';

export interface VoiceCommandEvent {
  id: string;
  transcript: string;
  action: VoiceCommandAction | null;
  feedback: string;
  timestamp: number;
}

export interface VoiceEngineInfo {
  loaded: boolean;
  hasTeluguVoice: boolean;
  teluguVoiceName: string | null;
  hasEnglishVoice: boolean;
  englishVoiceName: string | null;
}

