/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sparkles, Shield, Mic, Camera, X, Volume2 } from 'lucide-react';
import { Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';

interface StartupIntroductionProps {
  language: Language;
  contrastMode: HighContrastMode;
  onStartVoiceAssistant: () => void;
  onStartNavigation: () => void;
  isVoiceActive: boolean;
  isNavigating: boolean;
}

export const StartupIntroduction: React.FC<StartupIntroductionProps> = ({
  language,
  contrastMode,
  onStartVoiceAssistant,
  onStartNavigation,
  isVoiceActive,
  isNavigating,
}) => {
  const [dismissed, setDismissed] = useState(false);
  const theme = THEMES[contrastMode];

  // If dismissed or both features are already active, hide banner
  if (dismissed || (isVoiceActive && isNavigating)) {
    return null;
  }

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/70 bg-emerald-950/25 shadow-lg relative`}
      role="region"
      aria-label="Welcome and initial permission instructions"
    >
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-3.5 right-3.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-black/30"
        aria-label="Dismiss introduction"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="flex items-start gap-3.5 pr-8">
        <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 mt-0.5">
          <Sparkles className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex-1">
          <h2 className={`text-base sm:text-lg font-black ${theme.textPrimary} mb-1`}>
            {language === 'te'
              ? 'దృష్టిపథ్ ఏఐ కి స్వాగతం — ప్రతి దారి, చేరువలోనే'
              : 'Welcome to DrishtiPath AI — Every Path, Within Reach'}
          </h2>
          <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed font-medium mb-3`}>
            {language === 'te'
              ? 'ఈ అప్లికేషన్ దృష్టి లోపం ఉన్నవారికి కెమెరా ఆధారంగా పరిసరాలలోని వస్తువులను గుర్తించి తెలుగు మరియు ఆంగ్లంలో దిశా హెచ్చరికలను అందిస్తుంది. బ్రౌజర్ భద్రతా నిబంధనల ప్రకారం మైక్రోఫోన్ మరియు కెమెరా అనుమతులను మీరు స్పష్టంగా ఆమోదించిన తర్వాత మాత్రమే ప్రారంభమవుతాయి.'
              : 'DrishtiPath AI provides live object awareness with Telugu & English voice alerts. For your security and privacy, your browser requires you to explicitly grant microphone and camera permissions when you activate each feature.'}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {!isVoiceActive && (
              <button
                type="button"
                onClick={onStartVoiceAssistant}
                className="py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-95 transition-transform"
                aria-label="Enable hands-free voice assistant with microphone permission"
              >
                <Mic className="w-4 h-4 fill-current" />
                <span>{language === 'te' ? 'వాయిస్ అసిస్టెంట్ ఆన్ చేయి' : 'Start Voice Assistant'}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-black/20 rounded font-mono font-bold">
                  Key V
                </kbd>
              </button>
            )}

            {!isNavigating && (
              <button
                type="button"
                onClick={onStartNavigation}
                className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-md active:scale-95 transition-transform"
                aria-label="Start camera navigation and grant camera permission"
              >
                <Camera className="w-4 h-4 stroke-[2.5]" />
                <span>{language === 'te' ? 'కెమెరా నావిగేషన్ ప్రారంభించు' : 'Start Navigation'}</span>
                <kbd className="px-1.5 py-0.5 text-[10px] bg-black/20 rounded font-mono font-bold">
                  Spacebar
                </kbd>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
