/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Eye, Languages, Palette, Sparkles, Volume2, HelpCircle } from 'lucide-react';
import { Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';
import { ModelLoadingState } from '../utils/detector';

interface HeaderProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  contrastMode: HighContrastMode;
  onContrastModeChange: (mode: HighContrastMode) => void;
  modelState: ModelLoadingState;
  onOpenTestMode: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  language,
  onLanguageChange,
  contrastMode,
  onContrastModeChange,
  modelState,
  onOpenTestMode,
  onOpenHelp,
}) => {
  const theme = THEMES[contrastMode];

  const getStatusBadge = () => {
    switch (modelState) {
      case 'ready':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            role="status"
            aria-label={language === 'te' ? 'AI మోడల్ సిద్ధంగా ఉంది' : 'AI model ready'}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {language === 'te' ? 'AI సిద్ధంగా ఉంది' : 'AI Model Ready'}
          </span>
        );
      case 'loading':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40"
            role="status"
            aria-label={language === 'te' ? 'AI మోడల్ లోడ్ అవుతోంది' : 'Loading AI model'}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-spin" />
            {language === 'te' ? 'AI లోడ్ అవుతోంది...' : 'Loading AI...'}
          </span>
        );
      case 'error':
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40"
            role="status"
            aria-label={language === 'te' ? 'AI లోడింగ్ విఫలమైంది' : 'AI load error'}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            {language === 'te' ? 'AI ఎర్రర్' : 'AI Error'}
          </span>
        );
      default:
        return (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-slate-700/50 text-slate-300 border border-slate-600"
            role="status"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            {language === 'te' ? 'సిద్ధత వేచి ఉంది' : 'Standby'}
          </span>
        );
    }
  };

  return (
    <header className={`w-full border-b ${theme.cardBorder} ${theme.cardBg} px-4 py-3 sm:px-6 shadow-md transition-colors`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className={`p-2.5 rounded-xl ${theme.accent} shadow-sm`} aria-hidden="true">
              <Eye className={`w-7 h-7 ${theme.accentText} stroke-[2.5]`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className={`text-xl sm:text-2xl font-black tracking-tight ${theme.textPrimary}`}>
                  DrishtiPath AI
                </h1>
                {getStatusBadge()}
              </div>
              <p className={`text-xs sm:text-sm font-semibold ${theme.textSecondary}`}>
                {language === 'te' ? 'ప్రతి దారి, చేరువలోనే' : 'Every Path, Within Reach'}
              </p>
            </div>
          </div>

          {/* Quick Help button on mobile */}
          <div className="flex md:hidden gap-1.5">
            <button
              onClick={onOpenHelp}
              className={`p-2.5 rounded-lg border ${theme.cardBorder} ${theme.textPrimary} hover:opacity-80 active:scale-95`}
              aria-label={language === 'te' ? 'సహాయం మరియు సమాచారం' : 'Help and safety info'}
              title="Help and Guide"
            >
              <HelpCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls: Language, Contrast, Test feeds, Help */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Language Switcher */}
          <div
            className={`flex items-center rounded-lg border-2 ${theme.cardBorder} p-1 bg-black/20`}
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1.5 rounded-md text-sm font-black transition-all ${
                language === 'en'
                  ? `${theme.accent} ${theme.accentText} shadow-sm`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
              aria-pressed={language === 'en'}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('te')}
              className={`px-3 py-1.5 rounded-md text-sm font-black transition-all ${
                language === 'te'
                  ? `${theme.accent} ${theme.accentText} shadow-sm`
                  : `${theme.textSecondary} hover:${theme.textPrimary}`
              }`}
              aria-pressed={language === 'te'}
            >
              తెలుగు (Telugu)
            </button>
          </div>

          {/* Contrast Mode Selector */}
          <div
            className={`flex items-center rounded-lg border-2 ${theme.cardBorder} p-1 bg-black/20`}
            role="group"
            aria-label="High contrast theme mode"
          >
            <button
              type="button"
              onClick={() => onContrastModeChange('dark-high')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
                contrastMode === 'dark-high'
                  ? 'bg-slate-700 text-white ring-2 ring-white/50'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Dark High Contrast"
              aria-label="Dark High Contrast Mode"
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => onContrastModeChange('yellow-black')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
                contrastMode === 'yellow-black'
                  ? 'bg-yellow-400 text-black ring-2 ring-yellow-200'
                  : 'text-yellow-400 hover:text-yellow-300'
              }`}
              title="Yellow on Black (Low Vision Specialist)"
              aria-label="Yellow on Black Contrast Mode"
            >
              Yellow/Blk
            </button>
            <button
              type="button"
              onClick={() => onContrastModeChange('light-high')}
              className={`px-2.5 py-1.5 rounded text-xs font-bold transition-all ${
                contrastMode === 'light-high'
                  ? 'bg-white text-black ring-2 ring-black'
                  : 'text-zinc-400 hover:text-zinc-900'
              }`}
              title="Light High Contrast"
              aria-label="Light High Contrast Mode"
            >
              Light
            </button>
          </div>

          {/* Test Sample Mode Button */}
          <button
            type="button"
            onClick={onOpenTestMode}
            className={`px-3 py-1.5 rounded-lg border-2 ${theme.cardBorder} ${theme.cardBg} ${theme.textPrimary} text-xs font-bold flex items-center gap-1.5 hover:opacity-90 active:scale-95`}
            title="Test with sample scenarios (living room, walkway, desk)"
            aria-label="Test detection with sample scenarios"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{language === 'te' ? 'డెమో దృశ్యాలు' : 'Sample Tests'}</span>
          </button>

          {/* Help Button (Desktop) */}
          <button
            type="button"
            onClick={onOpenHelp}
            className={`hidden md:flex p-2 rounded-lg border-2 ${theme.cardBorder} ${theme.textPrimary} hover:opacity-80 active:scale-95`}
            aria-label={language === 'te' ? 'సహాయం మరియు సమాచారం' : 'Help and safety info'}
            title="Help and Safety Guide"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
