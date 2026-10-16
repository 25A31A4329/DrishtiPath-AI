/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Volume2, CheckCircle2, AlertCircle, HelpCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Language, HighContrastMode, VoiceEngineInfo } from '../types';
import { THEMES } from '../utils/theme';
import { audioAlertManager } from '../utils/audioAlerts';

interface TeluguVoiceStatusBannerProps {
  voiceInfo: VoiceEngineInfo;
  language: Language;
  contrastMode: HighContrastMode;
  onRefreshVoices: () => void;
}

export const TeluguVoiceStatusBanner: React.FC<TeluguVoiceStatusBannerProps> = ({
  voiceInfo,
  language,
  contrastMode,
  onRefreshVoices,
}) => {
  const theme = THEMES[contrastMode];
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showInstallGuide, setShowInstallGuide] = useState(false);

  const handleTestTelugu = async () => {
    setIsTesting(true);
    setTestResult(language === 'te' ? 'తెలుగు వాయిస్ పరీక్షిస్తోంది...' : 'Testing Telugu voice output...');
    const res = await audioAlertManager.testVoice('te');
    setIsTesting(false);
    setTestResult(res.message);
  };

  const handleTestEnglish = async () => {
    setIsTesting(true);
    setTestResult('Testing English voice output...');
    const res = await audioAlertManager.testVoice('en');
    setIsTesting(false);
    setTestResult(res.message);
  };

  return (
    <div
      className={`p-4 rounded-2xl border-2 ${
        voiceInfo.hasTeluguVoice ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-amber-500/60 bg-amber-950/20'
      } shadow-md`}
      role="region"
      aria-label="Speech synthesis status"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              voiceInfo.hasTeluguVoice
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            } shrink-0 mt-0.5`}
          >
            {voiceInfo.hasTeluguVoice ? (
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-sm sm:text-base font-black ${theme.textPrimary}`}>
                {language === 'te' ? 'తెలుగు టెక్స్ట్-టు-స్పీచ్ స్థితి' : 'Telugu Text-to-Speech Status'}
              </h3>
              {voiceInfo.hasTeluguVoice ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/30 text-emerald-300 border border-emerald-500/50">
                  {language === 'te' ? 'తెలుగు వాయిస్ సిద్ధంగా ఉంది' : 'te-IN Voice Ready'}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  {language === 'te' ? 'తెలుగు వాయిస్ కనుగొనబడలేదు' : 'No Native te-IN Voice'}
                </span>
              )}
            </div>
            <p className={`text-xs ${theme.textSecondary} mt-0.5 font-medium`}>
              {voiceInfo.hasTeluguVoice ? (
                <span>
                  {language === 'te' ? 'యాక్టివ్ వాయిస్: ' : 'Installed Voice: '}
                  <strong className="text-emerald-400">{voiceInfo.teluguVoiceName}</strong>
                </span>
              ) : (
                <span>
                  {language === 'te'
                    ? 'మీ పరికరంలో అధికారిక తెలుగు వాయిస్ ప్యాక్ లేదు. ఆంగ్ల ఉచ్చారణతో తెలుగును పలకడం నివారించబడింది.'
                    : 'Device lacks an installed native Telugu (te-IN) voice pack. Telugu script is not mangled with English pronunciation.'}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Action Buttons: Test Voice and Install Guide */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          <button
            type="button"
            onClick={handleTestTelugu}
            disabled={isTesting}
            className={`py-2 px-3.5 rounded-xl border-2 ${theme.cardBorder} bg-black/40 hover:bg-black/60 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95`}
            aria-label={language === 'te' ? 'తెలుగు వాయిస్ పరీక్షించండి' : 'Test Telugu voice output'}
          >
            <Volume2 className="w-4 h-4 text-amber-400" />
            <span>{language === 'te' ? 'తెలుగు వాయిస్ టెస్ట్' : 'Test Telugu Voice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowInstallGuide((prev) => !prev)}
            className={`py-2 px-3 rounded-xl border-2 ${theme.cardBorder} bg-black/40 hover:bg-black/60 ${theme.textSecondary} font-bold text-xs flex items-center gap-1`}
            aria-expanded={showInstallGuide}
            aria-label="Telugu voice installation guide"
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>{language === 'te' ? 'ఇన్‌స్టాలేషన్ గైడ్' : 'Install Guide'}</span>
            {showInstallGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Test Result Message */}
      {testResult && (
        <div className="mt-2.5 p-2 rounded-lg bg-black/60 border border-slate-700 text-xs font-mono text-amber-300 flex items-center justify-between">
          <span>{testResult}</span>
          <button
            type="button"
            onClick={() => setTestResult(null)}
            className="text-slate-400 hover:text-white text-[11px] underline ml-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Expandable Device-Specific Telugu Voice Installation Instructions */}
      {showInstallGuide && (
        <div className="mt-3.5 pt-3.5 border-t border-slate-700/60 flex flex-col gap-3 text-xs leading-relaxed">
          <h4 className="font-black text-amber-400 text-sm">
            {language === 'te'
              ? 'మీ పరికరంలో ఉచిత తెలుగు వాయిస్‌ను ఎలా ఇన్‌స్టాల్ చేసుకోవాలి:'
              : 'How to install a real Telugu (te-IN) Speech Voice on your device:'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            {/* Android / Chrome */}
            <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
              <span className="font-black text-emerald-400 block mb-1">📱 Android (Google Pixel / Samsung / Xiaomi)</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open <strong>Settings</strong> → <strong>System</strong> (or General Management).</li>
                <li>Tap <strong>Language & Input</strong> → <strong>Text-to-speech output</strong>.</li>
                <li>Tap the gear ⚙️ icon next to <em>Speech Recognition and Synthesis from Google</em>.</li>
                <li>Tap <strong>Install voice data</strong> → select <strong>Telugu (India)</strong> and tap download.</li>
              </ol>
            </div>

            {/* Windows 10 & 11 */}
            <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
              <span className="font-black text-cyan-400 block mb-1">💻 Windows 10 / 11 (Microsoft Edge & Chrome)</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open Windows <strong>Settings</strong> (<kbd>Win + I</kbd>).</li>
                <li>Go to <strong>Time & Language</strong> → <strong>Speech</strong>.</li>
                <li>Under <em>Manage voices</em>, click <strong>Add voices</strong>.</li>
                <li>Search <strong>Telugu</strong>, check the box, and click <strong>Add</strong>.</li>
              </ol>
            </div>

            {/* iPhone / iPad */}
            <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
              <span className="font-black text-purple-400 block mb-1">🍎 iPhone / iPad (iOS)</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open <strong>Settings</strong> → <strong>Accessibility</strong>.</li>
                <li>Tap <strong>Spoken Content</strong> → <strong>Voices</strong>.</li>
                <li>Tap <strong>Telugu</strong> and tap the cloud icon to download the high-quality voice.</li>
              </ol>
            </div>

            {/* Mac OS */}
            <div className="p-3 rounded-xl bg-black/50 border border-slate-800">
              <span className="font-black text-amber-400 block mb-1">🖥️ Mac (macOS)</span>
              <ol className="list-decimal pl-4 space-y-1">
                <li>Open <strong>System Settings</strong> → <strong>Accessibility</strong>.</li>
                <li>Select <strong>Spoken Content</strong> → <strong>System Voice</strong>.</li>
                <li>Click <strong>Manage Voices...</strong> → Search <strong>Telugu</strong> and download.</li>
              </ol>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              {language === 'te'
                ? 'వాయిస్ ఇన్‌స్టాల్ చేసిన తర్వాత, క్రింది బటన్ నొక్కి రీఫ్రెష్ చేయండి:'
                : 'After downloading the voice, click refresh to detect it:'}
            </span>
            <button
              type="button"
              onClick={onRefreshVoices}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold hover:bg-emerald-500/30"
            >
              🔄 {language === 'te' ? 'వాయిస్‌లను రీఫ్రెష్ చేయి' : 'Refresh Voices'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
