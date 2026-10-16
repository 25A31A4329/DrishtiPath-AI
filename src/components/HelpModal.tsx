/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, HelpCircle, Keyboard, Smartphone, Volume2, ShieldCheck } from 'lucide-react';
import { Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  contrastMode: HighContrastMode;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  language,
  contrastMode,
}) => {
  const theme = THEMES[contrastMode];
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={language === 'te' ? 'సహాయం మరియు మార్గదర్శకాలు' : 'Help & Accessibility Guide'}
    >
      <div className={`w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border-2 ${theme.cardBorder} ${theme.cardBg} p-5 sm:p-6 shadow-2xl relative`}>
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg border ${theme.cardBorder} ${theme.textPrimary} hover:opacity-80 active:scale-95`}
          aria-label="Close help guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <HelpCircle className="w-6 h-6 text-amber-400" />
          <h2 className={`text-xl font-black ${theme.textPrimary}`}>
            {language === 'te' ? 'ఉపయోగించే విధానం & సహాయం' : 'User Guide & Accessibility'}
          </h2>
        </div>

        <div className="flex flex-col gap-4 text-xs sm:text-sm">
          {/* Quick Start */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-700">
            <h3 className={`font-black mb-2 flex items-center gap-2 ${theme.textPrimary}`}>
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{language === 'te' ? 'మొబైల్‌లో ఎలా ఉపయోగించాలి' : 'Mobile Phone Usage'}</span>
            </h3>
            <ol className="list-decimal pl-5 space-y-1.5 text-slate-300">
              <li>
                {language === 'te'
                  ? 'మీ ఫోన్‌ను ఛాతీ లేదా నడుము ఎత్తులో నిటారుగా పట్టుకోండి (కెమెరా ముందు వైపుకు ఉండేలా).'
                  : 'Hold phone upright at chest or waist height, with the rear camera facing forward.'}
              </li>
              <li>
                {language === 'te'
                  ? 'పెద్ద పచ్చటి "నావిగేషన్ ప్రారంభించండి" బటన్ నొక్కండి మరియు కెమెరా అనుమతిని ఆమోదించండి.'
                  : 'Press the large green "Start Navigation" button and grant camera permission.'}
              </li>
              <li>
                {language === 'te'
                  ? 'తెలుగు లేదా ఇంగ్లీషులో ఆటోమేటిక్ దిశా హెచ్చరికలు మరియు బీప్ శబ్దాలు వినబడతాయి.'
                  : 'Listen to directional alerts ("Person on your left", "Chair straight ahead") and 3D spatial audio beeps.'}
              </li>
            </ol>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-700">
            <h3 className={`font-black mb-2 flex items-center gap-2 ${theme.textPrimary}`}>
              <Keyboard className="w-4 h-4 text-amber-400" />
              <span>{language === 'te' ? 'కీబోర్డ్ షార్ట్‌కట్‌లు' : 'Accessible Keyboard Shortcuts'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Key 'V'</span>
                <span className="text-slate-300">{language === 'te' ? 'వాయిస్ అసిస్టెంట్' : 'Voice Assistant'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Spacebar</span>
                <span className="text-slate-300">{language === 'te' ? 'నావిగేషన్ ఆన్ / ఆఫ్' : 'Start/Stop Nav'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Key 'L'</span>
                <span className="text-slate-300">{language === 'te' ? 'భాష మార్చు' : 'Switch Language'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Key 'R'</span>
                <span className="text-slate-300">{language === 'te' ? 'చివరి అలర్ట్ రిపీట్' : 'Repeat Last Alert'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Key 'T'</span>
                <span className="text-slate-300">{language === 'te' ? 'డెమో శాంపిల్స్' : 'Open Test Mode'}</span>
              </div>
              <div className="p-2 rounded bg-slate-800/80 border border-slate-700 flex justify-between">
                <span className="text-amber-400">Key 'H'</span>
                <span className="text-slate-300">{language === 'te' ? 'సహాయం గైడ్' : 'Help Guide'}</span>
              </div>
            </div>
          </div>

          {/* Privacy & Local Execution */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-slate-700">
            <h3 className={`font-black mb-1.5 flex items-center gap-2 ${theme.textPrimary}`}>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{language === 'te' ? 'పూర్తి గోప్యత & లోకల్ ప్రాసెసింగ్' : '100% On-Device & Private'}</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              {language === 'te'
                ? 'మీ కెమెరా వీడియో ఎటువంటి సర్వర్‌కూ పంపబడదు. TensorFlow.js ద్వారా బ్రౌజర్‌లోనే స్వయంగా విశ్లేషించబడుతుంది. మీ సమాచారం పూర్తిగా ప్రైవేట్.'
                : 'All video processing runs locally in your browser using TensorFlow.js. No camera streams, photos, or audio are ever uploaded to any cloud server.'}
            </p>
          </div>
        </div>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-3 rounded-xl ${theme.btnPrimaryBg} ${theme.btnPrimaryText} font-black text-sm`}
          >
            {language === 'te' ? 'అర్థమైంది (మూసివేయి)' : 'Got it (Close)'}
          </button>
        </div>
      </div>
    </div>
  );
};
