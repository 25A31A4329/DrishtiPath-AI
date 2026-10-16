/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { History, Volume2, Trash2 } from 'lucide-react';
import { VoiceAlert, Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';
import { audioAlertManager } from '../utils/audioAlerts';

interface VoiceAnnouncementHistoryProps {
  alerts: VoiceAlert[];
  onClear: () => void;
  language: Language;
  contrastMode: HighContrastMode;
}

export const VoiceAnnouncementHistory: React.FC<VoiceAnnouncementHistoryProps> = ({
  alerts,
  onClear,
  language,
  contrastMode,
}) => {
  const theme = THEMES[contrastMode];

  const handleSpeakItem = (alert: VoiceAlert) => {
    audioAlertManager.speak(alert.text, alert.language, 1.0, true);
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${theme.cardBorder} ${theme.cardBg} shadow-md`}>
      <div className="flex items-center justify-between mb-3 border-b pb-2.5 border-slate-700/50">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          <h3 className={`text-base sm:text-lg font-black ${theme.textPrimary}`}>
            {language === 'te' ? 'ఇటీవలి శబ్ద హెచ్చరికల లాగ్' : 'Recent Spoken Alerts'}
          </h3>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-slate-300">
            {alerts.length}
          </span>
        </div>

        {alerts.length > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-bold text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 p-1"
            title="Clear announcement history"
            aria-label="Clear alert history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{language === 'te' ? 'క్లియర్' : 'Clear'}</span>
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs font-semibold">
          {language === 'te'
            ? 'ఇంతవరకు శబ్ద హెచ్చరికలు ఏవీ జారీ కాలేదు.'
            : 'No announcements recorded yet in this session.'}
        </div>
      ) : (
        <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
          {alerts.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-xl bg-black/30 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-mono text-slate-400 shrink-0">
                  {formatTime(item.timestamp)}
                </span>
                <span className={`font-bold truncate ${theme.textPrimary}`}>
                  {item.text}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSpeakItem(item)}
                className={`p-1.5 rounded-lg border border-slate-700 ${theme.btnSecondaryBg} ${theme.btnSecondaryText} hover:opacity-80 shrink-0`}
                title="Replay this alert"
                aria-label={`Replay alert: ${item.text}`}
              >
                <Volume2 className="w-3.5 h-3.5 text-amber-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
