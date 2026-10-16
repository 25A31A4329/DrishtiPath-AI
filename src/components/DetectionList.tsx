/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, ArrowLeft, ArrowUp, ArrowRight, CheckCircle2, Shield, AlertTriangle } from 'lucide-react';
import { DetectionResult, Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';
import { formatDirectionalAlert } from '../utils/cocoLabels';
import { audioAlertManager } from '../utils/audioAlerts';

interface DetectionListProps {
  detections: DetectionResult[];
  language: Language;
  contrastMode: HighContrastMode;
  isNavigating: boolean;
  onSpeakObject: (det: DetectionResult) => void;
}

export const DetectionList: React.FC<DetectionListProps> = ({
  detections,
  language,
  contrastMode,
  isNavigating,
  onSpeakObject,
}) => {
  const theme = THEMES[contrastMode];

  const getSectorIcon = (sector: 'left' | 'ahead' | 'right') => {
    switch (sector) {
      case 'left':
        return <ArrowLeft className="w-5 h-5 text-cyan-400 stroke-[2.5]" />;
      case 'right':
        return <ArrowRight className="w-5 h-5 text-fuchsia-400 stroke-[2.5]" />;
      default:
        return <ArrowUp className="w-5 h-5 text-amber-400 stroke-[2.5]" />;
    }
  };

  const getSectorLabel = (sector: 'left' | 'ahead' | 'right') => {
    if (language === 'te') {
      switch (sector) {
        case 'left':
          return 'ఎడమ వైపు (Left)';
        case 'right':
          return 'కుడి వైపు (Right)';
        default:
          return 'ఎదురుగా (Straight Ahead)';
      }
    } else {
      switch (sector) {
        case 'left':
          return 'On Left';
        case 'right':
          return 'On Right';
        default:
          return 'Straight Ahead';
      }
    }
  };

  const getProminenceBadge = (distance: 'prominent' | 'moderate' | 'distant') => {
    if (distance === 'prominent') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40">
          <AlertTriangle className="w-3.5 h-3.5" />
          {language === 'te' ? 'అతి దగ్గర / పెద్దది' : 'Prominent / Near'}
        </span>
      );
    }
    if (distance === 'moderate') {
      return (
        <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {language === 'te' ? 'మధ్యస్థం' : 'Mid-frame'}
        </span>
      );
    }
    return (
      <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700/40 text-slate-400 border border-slate-700">
        {language === 'te' ? 'దూరంగా' : 'Distant'}
      </span>
    );
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border-2 ${theme.cardBorder} ${theme.cardBg} shadow-md`}>
      <div className="flex items-center justify-between mb-3 border-b pb-2.5 border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className={`text-base sm:text-lg font-black ${theme.textPrimary}`}>
            {language === 'te' ? 'కనిపించిన వస్తువులు' : 'Detected Objects'}
          </h3>
          <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-400 text-black">
            {detections.length}
          </span>
        </div>
        <p className={`text-xs font-semibold ${theme.textMuted}`}>
          {isNavigating
            ? language === 'te' ? 'నిజ సమయ సమాచారం' : 'Real-time feed'
            : language === 'te' ? 'నిరీక్షణలో ఉంది' : 'Navigation stopped'}
        </p>
      </div>

      {/* When navigation is not running */}
      {!isNavigating && (
        <div className="py-8 text-center text-slate-400 text-sm">
          <p className="font-semibold">
            {language === 'te'
              ? 'వస్తువుల గుర్తింపును ప్రారంభించడానికి "నావిగేషన్ ప్రారంభించండి" నొక్కండి.'
              : 'Press "Start Navigation" above to begin detecting nearby objects.'}
          </p>
        </div>
      )}

      {/* When navigating but no objects in frame meeting confidence threshold */}
      {isNavigating && detections.length === 0 && (
        <div className="py-8 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-amber-400 animate-spin" />
          <p className="font-bold text-slate-300">
            {language === 'te'
              ? 'పరిసరాలను శోధిస్తోంది... మార్గంలో వస్తువులు ఏవీ కనిపించలేదు.'
              : 'Scanning surroundings... Path currently clear or confidence below threshold.'}
          </p>
          <p className="text-xs text-slate-400">
            {language === 'te'
              ? 'కెమెరాను నెమ్మదిగా కదిలించండి.'
              : 'Keep camera steady or point toward obstacles.'}
          </p>
        </div>
      )}

      {/* Detected objects list */}
      {isNavigating && detections.length > 0 && (
        <div className="flex flex-col gap-2.5 max-h-[320px] overflow-y-auto pr-1" role="list">
          {detections.map((det) => (
            <div
              key={det.id}
              role="listitem"
              className={`p-3 rounded-xl border-2 ${theme.cardBorder} bg-black/30 flex items-center justify-between gap-3 transition-colors hover:border-amber-400`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2.5 rounded-lg bg-black/60 border border-slate-700 flex items-center justify-center shadow-inner"
                  title={getSectorLabel(det.sector)}
                  aria-hidden="true"
                >
                  {getSectorIcon(det.sector)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-base sm:text-lg font-black ${theme.textPrimary}`}>
                      {det.translatedName}
                    </span>
                    <span className="text-xs font-bold text-emerald-400">
                      {det.score}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span className={`text-xs font-bold ${theme.textSecondary}`}>
                      {getSectorLabel(det.sector)}
                    </span>
                    {getProminenceBadge(det.estimatedRelativeDistance)}
                  </div>
                </div>
              </div>

              {/* Speak object alert manually button */}
              <button
                type="button"
                onClick={() => onSpeakObject(det)}
                className={`p-2.5 sm:px-3 sm:py-2 rounded-xl border-2 ${theme.cardBorder} ${theme.btnSecondaryBg} ${theme.btnSecondaryText} text-xs font-black flex items-center gap-1.5 hover:opacity-90 active:scale-95`}
                aria-label={
                  language === 'te'
                    ? `${det.translatedName} గురించి వినండి`
                    : `Listen to alert for ${det.translatedName}`
                }
                title="Speak this alert now"
              >
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">
                  {language === 'te' ? 'వినండి' : 'Listen'}
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
