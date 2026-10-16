/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Target, Lightbulb, Users, Cpu, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';

interface SevaChallengeSectionProps {
  language: Language;
  contrastMode: HighContrastMode;
}

export const SevaChallengeSection: React.FC<SevaChallengeSectionProps> = ({
  language,
  contrastMode,
}) => {
  const theme = THEMES[contrastMode];

  return (
    <section
      className={`p-5 sm:p-7 rounded-2xl border-2 border-amber-400/80 ${theme.cardBg} shadow-xl relative overflow-hidden`}
      aria-labelledby="seva-challenge-heading"
    >
      {/* Decorative Badge Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b pb-4 border-slate-700/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-400 text-black shadow-md shrink-0">
            <Award className="w-7 h-7 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 id="seva-challenge-heading" className={`text-xl sm:text-2xl font-black ${theme.textPrimary}`}>
                SEVA First Innovation Challenge
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                Project Overview
              </span>
            </div>
            <p className={`text-xs sm:text-sm font-bold ${theme.textSecondary} mt-0.5`}>
              {language === 'te'
                ? 'సేవా ఫస్ట్ ఇన్నోవేషన్ ఛాలెంజ్ ప్రాజెక్ట్ వివరాలు'
                : 'Assistive Technology Initiative for Accessible India'}
            </p>
          </div>
        </div>

        {/* Note on affiliation */}
        <div className="px-3 py-1 rounded-lg bg-black/40 border border-slate-700 text-[11px] font-semibold text-slate-400">
          Independent Innovation Prototype
        </div>
      </div>

      {/* Structured Challenge Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase text-amber-400 tracking-wider">Project Name</span>
          <span className={`text-base font-black ${theme.textPrimary} mt-1`}>DrishtiPath AI</span>
          <span className="text-[11px] text-slate-400 mt-0.5 italic">"Every Path, Within Reach"</span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase text-cyan-400 tracking-wider">Track</span>
          <span className={`text-sm font-black ${theme.textPrimary} mt-1`}>Product/Technology Solution</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Software & Assistive Web Tech</span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase text-emerald-400 tracking-wider">Theme</span>
          <span className={`text-sm font-black ${theme.textPrimary} mt-1`}>Swasth & Samavesh Bharat</span>
          <span className="text-[11px] text-slate-400 mt-0.5">Health & Inclusive Society</span>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-black uppercase text-purple-400 tracking-wider">Sub-Themes</span>
          <div className="mt-1">
            <span className="text-xs font-bold text-white block">Primary: Assistive Innovation</span>
            <span className="text-[11px] text-slate-300 block">Secondary: Inclusive Solutions</span>
          </div>
        </div>
      </div>

      {/* Main Core Narrative: Problem, Solution, Innovation, Expected Impact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs sm:text-sm">
        {/* Problem Statement */}
        <div className="p-4 rounded-xl bg-black/30 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-rose-400 font-black">
            <Target className="w-4 h-4 shrink-0" />
            <h3 className="uppercase tracking-wider text-xs">Problem Statement</h3>
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">
            Visually impaired people may find it difficult to independently identify surrounding objects and understand their immediate environment in daily living, navigation, and indoor spaces.
          </p>
        </div>

        {/* Proposed Solution */}
        <div className="p-4 rounded-xl bg-black/30 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-emerald-400 font-black">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <h3 className="uppercase tracking-wider text-xs">Proposed Solution</h3>
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">
            <strong>DrishtiPath AI</strong> is an AI-powered assistive awareness prototype that uses camera-based object detection and voice guidance in English and Telugu to describe supported objects in the user's surroundings.
          </p>
        </div>

        {/* Innovation */}
        <div className="p-4 rounded-xl bg-black/30 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-amber-400 font-black">
            <Lightbulb className="w-4 h-4 shrink-0" />
            <h3 className="uppercase tracking-wider text-xs">Key Innovation</h3>
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">
            Combining on-device real-time object detection, multilingual voice interaction (English and Telugu), accessible high-contrast controls, and a centralized voice-alert system designed to eliminate overlapping speech and repeated continuous announcements.
          </p>
        </div>

        {/* Expected Impact */}
        <div className="p-4 rounded-xl bg-black/30 border border-slate-800 flex flex-col gap-1.5">
          <div className="flex items-center gap-2 text-cyan-400 font-black">
            <Users className="w-4 h-4 shrink-0" />
            <h3 className="uppercase tracking-wider text-xs">Expected Impact</h3>
          </div>
          <p className="text-slate-200 leading-relaxed font-medium">
            Support environmental awareness, accessibility, and greater confidence and independence for visually impaired users through responsive, respectful, and non-overwhelming voice assistance.
          </p>
        </div>
      </div>

      {/* Technology Stack & Transparent Implementation */}
      <div className="p-4 rounded-xl bg-black/50 border border-slate-800 mb-5">
        <div className="flex items-center gap-2 text-blue-400 font-black text-xs uppercase tracking-wider mb-2">
          <Cpu className="w-4 h-4" />
          <span>Implemented Technology Stack</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-3">
          The prototype relies strictly on actual, production-ready web APIs and local on-device machine learning with zero server video uploads:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] font-bold text-center">
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-amber-300">React & TypeScript</div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-cyan-300">TensorFlow.js (WebGL)</div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-emerald-300">COCO-SSD MobileNet</div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-purple-300">Web Speech API (TTS)</div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-blue-300">Web Speech (ASR)</div>
          <div className="p-2 rounded bg-slate-900 border border-slate-700 text-rose-300">Web Audio API 3D</div>
        </div>
      </div>

      {/* Limitations & Ethical Disclaimer */}
      <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/50 flex items-start gap-3 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-slate-200">
          <strong className="text-amber-300 block mb-0.5">Prototype Limitations & Safety Disclaimer:</strong>
          DrishtiPath AI is an assistive environmental awareness prototype. It does not measure physical distance, guarantee collision avoidance, or detect drop-offs, potholes, or stairs. It must never replace a white cane, guide dog, or certified mobility training.
          <span className="block mt-1 text-[11px] text-slate-400 italic">
            Notice: This project is submitted for the SEVA First Innovation Challenge concept and does not claim official SEVA endorsement, selection, partnership, or approval.
          </span>
        </div>
      </div>
    </section>
  );
};
