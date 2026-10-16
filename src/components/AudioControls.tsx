/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, RotateCcw, Vibrate, Sliders, Music, Zap } from 'lucide-react';
import { AppSettings, Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';
import { audioAlertManager } from '../utils/audioAlerts';

interface AudioControlsProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  language: Language;
  contrastMode: HighContrastMode;
  lastSpokenText: string;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  settings,
  onUpdateSettings,
  language,
  contrastMode,
  lastSpokenText,
}) => {
  const theme = THEMES[contrastMode];

  const handleRepeatLast = () => {
    audioAlertManager.repeatLastSpoken();
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${theme.cardBorder} ${theme.cardBg} shadow-md flex flex-col gap-4`}>
      {/* Header and Repeat Alert Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b pb-3 border-slate-700/50">
        <div>
          <h3 className={`text-base sm:text-lg font-black ${theme.textPrimary}`}>
            {language === 'te' ? 'వాయిస్ & శబ్ద నియంత్రణలు' : 'Voice & Audio Controls'}
          </h3>
          <p className={`text-xs font-semibold ${theme.textMuted}`}>
            {lastSpokenText ? (
              <span className="italic">"{lastSpokenText}"</span>
            ) : (
              language === 'te' ? 'ఇంకా శబ్ద హెచ్చరికలు రాలేదు' : 'No announcements yet'
            )}
          </p>
        </div>

        {/* Repeat Last Announcement Button */}
        <button
          type="button"
          onClick={handleRepeatLast}
          disabled={!lastSpokenText}
          className={`py-2.5 px-4 rounded-xl border-2 ${theme.cardBorder} ${
            lastSpokenText
              ? 'bg-amber-400 hover:bg-amber-300 text-black font-black active:scale-95 shadow-md'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
          } flex items-center justify-center gap-2 text-xs sm:text-sm font-black transition-all`}
          aria-label={
            language === 'te'
              ? 'చివరి శబ్ద హెచ్చరికను మళ్ళీ వినండి'
              : 'Repeat the last spoken audio alert'
          }
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>{language === 'te' ? 'చివరి హెచ్చరిక మళ్ళీ విను' : 'Repeat Last Alert'}</span>
        </button>
      </div>

      {/* Toggles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Auto Speak Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ autoSpeak: !settings.autoSpeak })}
          className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
            settings.autoSpeak
              ? 'border-emerald-500 bg-emerald-950/40 text-emerald-200'
              : `${theme.cardBorder} bg-black/20 text-slate-400`
          }`}
          aria-pressed={settings.autoSpeak}
        >
          <div className="flex items-center gap-2.5">
            <Volume2 className="w-5 h-5 text-amber-400" />
            <div>
              <span className="block text-xs font-black uppercase">
                {language === 'te' ? 'స్పీచ్ అలర్ట్స్' : 'Auto Voice Alerts'}
              </span>
              <span className="text-[11px] font-semibold opacity-80">
                {settings.autoSpeak
                  ? language === 'te' ? 'ఆన్‌లో ఉంది' : 'Enabled'
                  : language === 'te' ? 'ఆఫ్‌లో ఉంది' : 'Muted'}
              </span>
            </div>
          </div>
          <span
            className={`w-4 h-4 rounded-full border-2 ${
              settings.autoSpeak
                ? 'bg-emerald-400 border-white'
                : 'bg-slate-700 border-slate-500'
            }`}
          />
        </button>

        {/* Spatial Earcon Chimes Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ spatialAudioChimes: !settings.spatialAudioChimes })}
          className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
            settings.spatialAudioChimes
              ? 'border-cyan-500 bg-cyan-950/40 text-cyan-200'
              : `${theme.cardBorder} bg-black/20 text-slate-400`
          }`}
          aria-pressed={settings.spatialAudioChimes}
        >
          <div className="flex items-center gap-2.5">
            <Music className="w-5 h-5 text-cyan-400" />
            <div>
              <span className="block text-xs font-black uppercase">
                {language === 'te' ? 'దిశా సూచక శబ్దాలు' : 'Spatial Chimes'}
              </span>
              <span className="text-[11px] font-semibold opacity-80">
                {settings.spatialAudioChimes
                  ? language === 'te' ? 'ఎడమ/కుడి బీప్‌లు' : 'Left/Center/Right 3D'
                  : language === 'te' ? 'ఆఫ్‌లో ఉంది' : 'Disabled'}
              </span>
            </div>
          </div>
          <span
            className={`w-4 h-4 rounded-full border-2 ${
              settings.spatialAudioChimes
                ? 'bg-cyan-400 border-white'
                : 'bg-slate-700 border-slate-500'
            }`}
          />
        </button>

        {/* Haptic Vibration Toggle */}
        <button
          type="button"
          onClick={() => onUpdateSettings({ hapticFeedback: !settings.hapticFeedback })}
          className={`p-3 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
            settings.hapticFeedback
              ? 'border-amber-500 bg-amber-950/40 text-amber-200'
              : `${theme.cardBorder} bg-black/20 text-slate-400`
          }`}
          aria-pressed={settings.hapticFeedback}
        >
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-5 h-5 text-amber-400" />
            <div>
              <span className="block text-xs font-black uppercase">
                {language === 'te' ? 'వైబ్రేషన్ స్పందన' : 'Haptic Vibration'}
              </span>
              <span className="text-[11px] font-semibold opacity-80">
                {settings.hapticFeedback
                  ? language === 'te' ? 'వైబ్రేట్ అవుతుంది' : 'Vibrates on detect'
                  : language === 'te' ? 'ఆఫ్‌లో ఉంది' : 'Off'}
              </span>
            </div>
          </div>
          <span
            className={`w-4 h-4 rounded-full border-2 ${
              settings.hapticFeedback
                ? 'bg-amber-400 border-white'
                : 'bg-slate-700 border-slate-500'
            }`}
          />
        </button>
      </div>

      {/* Advanced Fine Tuning (Repeat cooldown & Confidence) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Repeat Cooldown Selector (prevents continuous repetition) */}
        <div className="p-3 rounded-xl bg-black/30 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="cooldown-select"
              className={`text-xs font-black uppercase tracking-wider ${theme.textPrimary}`}
            >
              {language === 'te' ? 'హెచ్చరిక పునరావృత విరామం' : 'Alert Repeat Cooldown'}
            </label>
            <span className="text-xs font-bold text-amber-400">
              {settings.speechCooldownSeconds}s
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[3, 6, 9, 12].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => onUpdateSettings({ speechCooldownSeconds: sec })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  settings.speechCooldownSeconds === sec
                    ? 'bg-amber-400 text-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {language === 'te'
              ? 'ఒకే వస్తువు మళ్ళీ మళ్ళీ వెంటనే పలకకుండా విరామం ఉంచుతుంది.'
              : 'Prevents the same object in the same position from repeating incessantly.'}
          </p>
        </div>

        {/* Confidence Threshold */}
        <div className="p-3 rounded-xl bg-black/30 border border-slate-700/60">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="confidence-select"
              className={`text-xs font-black uppercase tracking-wider ${theme.textPrimary}`}
            >
              {language === 'te' ? 'గుర్తింపు విశ్వసనీయత' : 'Detection Confidence'}
            </label>
            <span className="text-xs font-bold text-emerald-400">
              {Math.round(settings.minConfidence * 100)}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {[0.45, 0.55, 0.65, 0.75].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onUpdateSettings({ minConfidence: val })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-black transition-all ${
                  settings.minConfidence === val
                    ? 'bg-emerald-400 text-black shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {Math.round(val * 100)}%
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {language === 'te'
              ? 'తక్కువ నమ్మకం ఉన్న తప్పుడు గుర్తింపులను నివారిస్తుంది.'
              : 'Higher threshold filters out false positives in complex lighting.'}
          </p>
        </div>
      </div>

      {/* PART 5: Alert Verbosity Setting (Minimal [Default], Balanced, Detailed) */}
      <div className="p-3 rounded-xl bg-black/40 border border-amber-400/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <label className={`text-xs font-black uppercase tracking-wider ${theme.textPrimary}`}>
              {language === 'te' ? 'అలర్ట్ వివరాల స్థాయి (వివరణాత్మకత)' : 'Alert Verbosity (Detail Level)'}
            </label>
          </div>
          <span className="text-xs font-bold text-amber-400 capitalize">
            {settings.alertVerbosity} {settings.alertVerbosity === 'minimal' ? '(Default)' : ''}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['minimal', 'balanced', 'detailed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onUpdateSettings({ alertVerbosity: mode })}
              className={`py-2 px-2.5 rounded-lg text-xs font-black capitalize transition-all ${
                settings.alertVerbosity === mode
                  ? 'bg-amber-400 text-black shadow-md ring-2 ring-white/50'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {mode}
              {mode === 'minimal' ? ' ★' : ''}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-300 mt-2 font-medium">
          {settings.alertVerbosity === 'minimal' && (
            <span>
              {language === 'te'
                ? '★ కనిష్ట మోడ్ (డిఫాల్ట్): ఎదురుగా ఉన్న ముఖ్యమైన వస్తువును మాత్రమే అతి క్లుప్తంగా చెబుతుంది. గందరగోళం లేకుండా స్పష్టత నిస్తుంది.'
                : '★ Minimal (Default Prototype Mode): Only announces the most prominent object directly ahead in ultra-short words. Prevents speech overload.'}
            </span>
          )}
          {settings.alertVerbosity === 'balanced' && (
            <span>
              {language === 'te'
                ? 'సమతుల్య మోడ్: ఎదురుగా ఉన్న వస్తువుతో పాటు ముఖ్యమైన పక్క వస్తువును ఒకే వాక్యంలో సంగ్రహిస్తుంది.'
                : 'Balanced Mode: Combines ahead objects and notable lateral obstacles into a single concise sentence.'}
            </span>
          )}
          {settings.alertVerbosity === 'detailed' && (
            <span>
              {language === 'te'
                ? 'వివరణాత్మక మోడ్: ఎడమ, ఎదురుగా, కుడి వైపులా ఉన్న వస్తువుల పూర్తి దిశా సమాచారాన్ని అందిస్తుంది.'
                : 'Detailed Mode: Provides comprehensive orientation across left, ahead, and right sectors.'}
            </span>
          )}
        </p>
      </div>

      {/* Voice Testing and Speech Speed */}
      <div className="pt-2 border-t border-slate-700/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black uppercase ${theme.textPrimary}`}>
            {language === 'te' ? 'మాట వేగం' : 'Speech Rate'}:
          </span>
          {[0.8, 1.0, 1.2].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => onUpdateSettings({ speechRate: rate })}
              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                settings.speechRate === rate
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => audioAlertManager.testVoice('te')}
            className="px-3 py-1.5 rounded-lg border border-amber-400/60 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 text-xs font-black transition-all"
            aria-label="Test Telugu Voice"
          >
            🔊 {language === 'te' ? 'తెలుగు వాయిస్ టెస్ట్' : 'Test Telugu'}
          </button>
          <button
            type="button"
            onClick={() => audioAlertManager.testVoice('en')}
            className="px-3 py-1.5 rounded-lg border border-emerald-400/60 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20 text-xs font-black transition-all"
            aria-label="Test English Voice"
          >
            🔊 {language === 'te' ? 'ఇంగ్లీష్ వాయిస్ టెస్ట్' : 'Test English'}
          </button>
        </div>
      </div>
    </div>
  );
};
