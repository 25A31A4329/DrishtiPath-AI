/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mic, MicOff, Radio, Volume2, Sparkles, AlertCircle, Play, Square, MessageSquare } from 'lucide-react';
import { Language, HighContrastMode, VoiceAssistantStatus, VoiceCommandEvent } from '../types';
import { THEMES } from '../utils/theme';

interface VoiceAssistantBannerProps {
  status: VoiceAssistantStatus;
  isActive: boolean;
  onStartAssistant: () => void;
  onStopAssistant: () => void;
  language: Language;
  contrastMode: HighContrastMode;
  lastCommand: VoiceCommandEvent | null;
  assistantError: string | null;
  isSupported: boolean;
}

export const VoiceAssistantBanner: React.FC<VoiceAssistantBannerProps> = ({
  status,
  isActive,
  onStartAssistant,
  onStopAssistant,
  language,
  contrastMode,
  lastCommand,
  assistantError,
  isSupported,
}) => {
  const theme = THEMES[contrastMode];

  const getStatusBadge = () => {
    switch (status) {
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            {language === 'te' ? 'కమాండ్ల కోసం వింటోంది...' : 'Listening for Voice Commands...'}
          </span>
        );
      case 'paused_speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            {language === 'te' ? 'అలర్ట్ చెబుతున్నప్పుడు పాజ్ చేయబడింది' : 'Paused while speaking alert'}
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            {language === 'te' ? 'విశ్లేషిస్తోంది...' : 'Processing command...'}
          </span>
        );
      case 'starting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            {language === 'te' ? 'మైక్రోఫోన్ ఆన్ అవుతోంది...' : 'Initializing microphone...'}
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-300 border border-rose-500/40">
            <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
            {language === 'te' ? 'వాయిస్ ఎర్రర్' : 'Voice Error'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
            <MicOff className="w-3.5 h-3.5" />
            {language === 'te' ? 'అసిస్టెంట్ ఆఫ్‌లో ఉంది' : 'Assistant Inactive'}
          </span>
        );
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border-2 ${
        isActive ? 'border-amber-400 shadow-xl bg-slate-900/90' : `${theme.cardBorder} ${theme.cardBg}`
      } shadow-md transition-all`}
      role="region"
      aria-label="Hands-free voice assistant controls"
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-3 border-b pb-3 border-slate-700/50">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              isActive ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-300'
            } transition-colors`}
            aria-hidden="true"
          >
            <Mic className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`text-base sm:text-lg font-black ${theme.textPrimary}`}>
                {language === 'te' ? 'వాయిస్ కమాండ్ అసిస్టెంట్' : 'Hands-Free Voice Assistant'}
              </h2>
              {getStatusBadge()}
            </div>
            <p className={`text-xs ${theme.textSecondary} font-semibold mt-0.5`}>
              {language === 'te'
                ? 'తెలుగు లేదా ఆంగ్లంలో మాట్లాడి కెమెరాను నియంత్రించండి'
                : 'Control navigation hands-free in Telugu or English'}
            </p>
          </div>
        </div>

        {/* Start / Stop Voice Assistant Controls */}
        <div className="flex items-center gap-2">
          {!isActive ? (
            <button
              type="button"
              onClick={onStartAssistant}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-black font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              aria-label={
                language === 'te'
                  ? 'వాయిస్ అసిస్టెంట్ ప్రారంభించండి. మైక్రోఫోన్ అనుమతి అవసరం.'
                  : 'Start Voice Assistant. Microphone permission required.'
              }
            >
              <Mic className="w-5 h-5 fill-current" />
              <span>{language === 'te' ? 'వాయిస్ అసిస్టెంట్ ప్రారంభించండి' : 'Start Voice Assistant'}</span>
              <kbd className="hidden md:inline px-1.5 py-0.5 text-[10px] bg-black/20 rounded font-mono font-bold">
                Key V
              </kbd>
            </button>
          ) : (
            <button
              type="button"
              onClick={onStopAssistant}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 border-2 border-rose-300"
              aria-label={
                language === 'te'
                  ? 'వాయిస్ అసిస్టెంట్ ఆపివేయండి'
                  : 'Stop Voice Assistant'
              }
            >
              <MicOff className="w-5 h-5" />
              <span>{language === 'te' ? 'అసిస్టెంట్ ఆపు' : 'Stop Assistant'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state */}
      {assistantError && (
        <div className="mb-3 p-3 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{assistantError}</span>
        </div>
      )}

      {/* Unsupported browser warning */}
      {!isSupported && (
        <div className="mb-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500 text-amber-200 text-xs">
          ⚠️ {language === 'te'
            ? 'ఈ బ్రౌజర్‌లో స్పీచ్ రికగ్నిషన్ సపోర్ట్ లేదు. దయచేసి Google Chrome లేదా Microsoft Edge బ్రౌజర్‌ను ఉపయోగించండి.'
            : 'Speech recognition is not supported in this browser environment. Please use Google Chrome or Microsoft Edge for hands-free voice commands.'}
        </div>
      )}

      {/* Active Command Feedback Banner */}
      {isActive && lastCommand && (
        <div className="mb-3 p-3 rounded-xl bg-black/60 border border-amber-400/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <MessageSquare className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-medium text-slate-300 truncate">
              {language === 'te' ? 'విన్నది: ' : 'Heard: '}
              <strong className="text-white font-bold">"{lastCommand.transcript}"</strong>
            </span>
          </div>
          <span
            className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${
              lastCommand.action
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {lastCommand.feedback}
          </span>
        </div>
      )}

      {/* Quick Voice Command Guide Chips */}
      <div>
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">
          {language === 'te' ? 'సహాయక వాయిస్ కమాండ్‌లు (మాట్లాడండి):' : 'Supported Voice Commands (Speak naturally):'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
          {/* Open Camera */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-emerald-400">
              {language === 'te' ? '🔊 "Camera open cheyyi"' : '🔊 "Open camera"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'కెమెరా మరియు ఆబ్జెక్ట్ డిటెక్షన్ ఆన్ అవుతుంది' : 'Starts camera & object detection'}
            </span>
          </div>

          {/* Stop Camera */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-rose-400">
              {language === 'te' ? '🔊 "Camera aapu"' : '🔊 "Stop camera"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'కెమెరా మరియు అలర్ట్‌లను ఆపుతుంది' : 'Stops camera and silences alerts'}
            </span>
          </div>

          {/* What is in front */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-amber-400">
              {language === 'te' ? '🔊 "Na mundu em undi?"' : '🔊 "What is in front of me?"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'ఎదురుగా ఉన్న నిజమైన వస్తువులను చెబుతుంది' : 'Speaks currently detected objects'}
            </span>
          </div>

          {/* Repeat */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-cyan-400">
              {language === 'te' ? '🔊 "Malli cheppu"' : '🔊 "Repeat"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'చివరి అలర్ట్‌ను తిరిగి పలుకుతుంది' : 'Replays the last spoken alert'}
            </span>
          </div>

          {/* Switch language */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-purple-400">
              {language === 'te' ? '🔊 "English lo cheppu"' : '🔊 "Switch to Telugu"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'ఆంగ్లంలోకి మారుస్తుంది' : 'Changes language to Telugu (తెలుగు)'}
            </span>
          </div>

          {/* Stop Assistant */}
          <div className="p-2 rounded-lg bg-black/40 border border-slate-800 flex flex-col">
            <span className="font-bold text-slate-300">
              {language === 'te' ? '🔊 "Assistant aapu"' : '🔊 "Stop assistant"'}
            </span>
            <span className="text-[11px] text-slate-400">
              {language === 'te' ? 'వాయిస్ లిజనింగ్‌ను ఆపివేస్తుంది' : 'Turns off voice assistant listening'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
