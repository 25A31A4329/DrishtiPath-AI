/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';

interface SafetyDisclaimerProps {
  language: Language;
  contrastMode: HighContrastMode;
}

export const SafetyDisclaimer: React.FC<SafetyDisclaimerProps> = ({
  language,
  contrastMode,
}) => {
  const theme = THEMES[contrastMode];

  return (
    <div
      className={`p-4 sm:p-5 rounded-2xl border-2 border-amber-500/60 bg-amber-950/20 shadow-md`}
      role="note"
      aria-label="Important safety notice"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0 mt-0.5">
          <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex-1">
          <h3 className={`text-base font-black ${theme.textPrimary} flex items-center gap-2 mb-1`}>
            <span>{language === 'te' ? 'ముఖ్యమైన భద్రతా మార్గదర్శకం' : 'Important Safety & Limitations Notice'}</span>
          </h3>
          <p className={`text-xs sm:text-sm ${theme.textSecondary} leading-relaxed font-medium mb-3`}>
            {language === 'te'
              ? 'దృష్టిపథ్ AI (DrishtiPath AI) దృష్టి లోపం ఉన్నవారికి పరిసరాలలోని వస్తువుల గురించి అదనపు అవగాహన కల్పించే సహాయక సాధనం మాత్రమే. ఇది వైట్ కేన్ (White Cane), గైడ్ డాగ్ లేదా మానవ సహాయానికి ప్రత్యామ్నాయం కాదు.'
              : 'DrishtiPath AI is designed strictly as supplementary sensory assistance. It increases environmental awareness by recognizing common objects, but does NOT replace standard mobility tools like a white cane, guide dog, or personal navigation training.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-amber-500/30 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'te'
                  ? 'ఖచ్చితమైన భౌతిక దూరాన్ని కొలవదు లేదా ఢీకొనడాన్ని నిరోధించదు.'
                  : 'Does not measure physical distance or guarantee collision prevention.'}
              </span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-black/40 border border-amber-500/30 text-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {language === 'te'
                  ? 'గుంతలు, మెట్లు, తక్కువ వేలాడే అడ్డంకులు వంటి ప్రమాదాలను గుర్తించకపోవచ్చు.'
                  : 'Cannot detect drop-offs, stairs, potholes, or hanging head hazards.'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
