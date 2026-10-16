/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HighContrastMode } from '../types';

export interface ThemeColors {
  bg: string;
  cardBg: string;
  cardBorder: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentText: string;
  highlight: string;
  btnPrimaryBg: string;
  btnPrimaryText: string;
  btnDangerBg: string;
  btnDangerText: string;
  btnSecondaryBg: string;
  btnSecondaryText: string;
  badgeBg: string;
  sectorLeft: string;
  sectorAhead: string;
  sectorRight: string;
}

export const THEMES: Record<HighContrastMode, ThemeColors> = {
  'dark-high': {
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900',
    cardBorder: 'border-slate-700',
    textPrimary: 'text-white',
    textSecondary: 'text-slate-200',
    textMuted: 'text-slate-400',
    accent: 'bg-amber-400',
    accentText: 'text-slate-950',
    highlight: 'text-amber-400',
    btnPrimaryBg: 'bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600',
    btnPrimaryText: 'text-slate-950 font-black',
    btnDangerBg: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700',
    btnDangerText: 'text-white font-black',
    btnSecondaryBg: 'bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border-2 border-slate-600',
    btnSecondaryText: 'text-white',
    badgeBg: 'bg-slate-800 border border-slate-600',
    sectorLeft: 'text-cyan-400 bg-cyan-950/60 border-cyan-500',
    sectorAhead: 'text-amber-400 bg-amber-950/60 border-amber-500',
    sectorRight: 'text-fuchsia-400 bg-fuchsia-950/60 border-fuchsia-500',
  },
  'yellow-black': {
    bg: 'bg-black',
    cardBg: 'bg-black',
    cardBorder: 'border-yellow-400',
    textPrimary: 'text-yellow-300',
    textSecondary: 'text-yellow-200',
    textMuted: 'text-yellow-100',
    accent: 'bg-yellow-400',
    accentText: 'text-black',
    highlight: 'text-yellow-400',
    btnPrimaryBg: 'bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500',
    btnPrimaryText: 'text-black font-black',
    btnDangerBg: 'bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 ring-4 ring-yellow-400',
    btnDangerText: 'text-black font-black',
    btnSecondaryBg: 'bg-black hover:bg-zinc-900 border-2 border-yellow-400',
    btnSecondaryText: 'text-yellow-300',
    badgeBg: 'bg-black border-2 border-yellow-400',
    sectorLeft: 'text-yellow-300 bg-black border-yellow-400',
    sectorAhead: 'text-yellow-300 bg-black border-yellow-400',
    sectorRight: 'text-yellow-300 bg-black border-yellow-400',
  },
  'light-high': {
    bg: 'bg-zinc-100',
    cardBg: 'bg-white',
    cardBorder: 'border-zinc-900',
    textPrimary: 'text-black',
    textSecondary: 'text-zinc-900',
    textMuted: 'text-zinc-700',
    accent: 'bg-blue-700',
    accentText: 'text-white',
    highlight: 'text-blue-900',
    btnPrimaryBg: 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900',
    btnPrimaryText: 'text-white font-black',
    btnDangerBg: 'bg-rose-700 hover:bg-rose-800 active:bg-rose-900',
    btnDangerText: 'text-white font-black',
    btnSecondaryBg: 'bg-white hover:bg-zinc-200 active:bg-zinc-300 border-2 border-black',
    btnSecondaryText: 'text-black font-bold',
    badgeBg: 'bg-white border-2 border-black',
    sectorLeft: 'text-cyan-900 bg-cyan-50 border-cyan-700',
    sectorAhead: 'text-amber-900 bg-amber-50 border-amber-700',
    sectorRight: 'text-purple-900 bg-purple-50 border-purple-700',
  },
};
