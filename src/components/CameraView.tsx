/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, SwitchCamera, Play, Square, AlertCircle, RefreshCw, Volume2, ShieldAlert } from 'lucide-react';
import { DetectionResult, Language, HighContrastMode } from '../types';
import { THEMES } from '../utils/theme';

interface CameraViewProps {
  isNavigating: boolean;
  onStartNavigation: () => void;
  onStopNavigation: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  currentDetections: DetectionResult[];
  cameraError: string | null;
  onRetryCamera: () => void;
  language: Language;
  contrastMode: HighContrastMode;
  facingMode: 'environment' | 'user';
  onToggleFacingMode: () => void;
  hasMultipleCameras: boolean;
  isModelLoading: boolean;
  onTestModeClick: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  isNavigating,
  onStartNavigation,
  onStopNavigation,
  videoRef,
  canvasRef,
  currentDetections,
  cameraError,
  onRetryCamera,
  language,
  contrastMode,
  facingMode,
  onToggleFacingMode,
  hasMultipleCameras,
  isModelLoading,
  onTestModeClick,
}) => {
  const theme = THEMES[contrastMode];
  const containerRef = useRef<HTMLDivElement>(null);

  // Redraw bounding boxes on canvas whenever currentDetections update
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!isNavigating || !video) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Match canvas internal resolution to video display resolution
    if (video.videoWidth && video.videoHeight) {
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw sector guideline markers (35% Left, 65% Right) to assist spatial reference
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);

    // Left dividing line
    ctx.beginPath();
    ctx.moveTo(w * 0.35, 0);
    ctx.lineTo(w * 0.35, h);
    ctx.stroke();

    // Right dividing line
    ctx.beginPath();
    ctx.moveTo(w * 0.65, 0);
    ctx.lineTo(w * 0.65, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // Sector indicators at top
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 90, 26);
    ctx.fillRect(w * 0.5 - 45, 10, 90, 26);
    ctx.fillRect(w - 100, 10, 90, 26);

    ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#38bdf8'; // Cyan for left
    ctx.fillText(language === 'te' ? 'ఎడమ (Left)' : 'LEFT', 18, 28);

    ctx.fillStyle = '#facc15'; // Amber for ahead
    ctx.fillText(language === 'te' ? 'ఎదురుగా' : 'AHEAD', w * 0.5 - 32, 28);

    ctx.fillStyle = '#e879f9'; // Fuchsia for right
    ctx.fillText(language === 'te' ? 'కుడి (Right)' : 'RIGHT', w - 92, 28);

    // Draw bounding boxes for detections
    currentDetections.forEach((det) => {
      const [x, y, boxW, boxH] = det.bbox;

      // Color code by sector or urgency
      let boxColor = '#facc15'; // Yellow ahead
      if (det.sector === 'left') boxColor = '#38bdf8'; // Blue left
      if (det.sector === 'right') boxColor = '#e879f9'; // Purple right

      // Thick high-contrast outline
      ctx.lineWidth = 4;
      ctx.strokeStyle = boxColor;
      ctx.strokeRect(x, y, boxW, boxH);

      // Label background banner
      const labelText = `${det.translatedName} (${det.score}%)`;
      ctx.font = 'bold 15px system-ui, -apple-system, sans-serif';
      const textWidth = ctx.measureText(labelText).width;

      const labelHeight = 26;
      const labelY = Math.max(0, y - labelHeight);

      ctx.fillStyle = boxColor;
      ctx.fillRect(x, labelY, textWidth + 16, labelHeight);

      // Label text (black for optimal contrast against bright yellow/cyan/pink)
      ctx.fillStyle = '#000000';
      ctx.fillText(labelText, x + 8, labelY + 18);

      // Sector tag badge if prominent
      if (det.estimatedRelativeDistance === 'prominent') {
        const warnText = language === 'te' ? 'సమీపంలో!' : 'CLOSE!';
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x + textWidth + 22, labelY, 70, labelHeight);
        ctx.fillStyle = '#ffffff';
        ctx.fillText(warnText, x + textWidth + 26, labelY + 18);
      }
    });
  }, [currentDetections, isNavigating, language, canvasRef, videoRef]);

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Action Button (Start / Stop Navigation) - Huge WCAG Accessible Button */}
      <div className="w-full">
        {!isNavigating ? (
          <button
            type="button"
            onClick={onStartNavigation}
            disabled={isModelLoading}
            className={`w-full py-5 px-6 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3.5 ${
              isModelLoading
                ? 'bg-slate-700 text-slate-400 cursor-not-allowed border-2 border-slate-600'
                : `${theme.btnPrimaryBg} ${theme.btnPrimaryText} border-4 border-emerald-300 ring-4 ring-emerald-500/30`
            }`}
            aria-label={
              language === 'te'
                ? 'నావిగేషన్ ప్రారంభించండి. కెమెరా ఆన్ చేయబడుతుంది మరియు వస్తువులను శోధించడం ప్రారంభిస్తుంది.'
                : 'Start Navigation. Camera will turn on and real-time voice alerts will activate.'
            }
          >
            <Play className="w-8 h-8 fill-current stroke-[2.5]" />
            <div className="text-left">
              <span className="block text-xl sm:text-2xl font-black uppercase tracking-wide">
                {language === 'te' ? 'నావిగేషన్ ప్రారంభించండి' : 'Start Navigation'}
              </span>
              <span className="block text-xs sm:text-sm font-semibold opacity-90">
                {language === 'te'
                  ? 'కెమెరా ఆన్ చేసి శబ్ద హెచ్చరికలు పొందండి'
                  : 'Activate camera and real-time voice guidance'}
              </span>
            </div>
          </button>
        ) : (
          <button
            type="button"
            onClick={onStopNavigation}
            className={`w-full py-5 px-6 rounded-2xl shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3.5 ${theme.btnDangerBg} ${theme.btnDangerText} border-4 border-rose-300 ring-4 ring-rose-500/40 animate-pulse-subtle`}
            aria-label={
              language === 'te'
                ? 'నావిగేషన్ ఆపివేయండి. కెమెరా మరియు శబ్ద హెచ్చరికలు ఆగిపోతాయి.'
                : 'Stop Navigation. Camera and alerts will turn off.'
            }
          >
            <Square className="w-8 h-8 fill-current stroke-[2.5]" />
            <div className="text-left">
              <span className="block text-xl sm:text-2xl font-black uppercase tracking-wide">
                {language === 'te' ? 'నావిగేషన్ ఆపివేయండి' : 'Stop Navigation'}
              </span>
              <span className="block text-xs sm:text-sm font-semibold opacity-90">
                {language === 'te' ? 'కెమెరాను నిలిపివేయి' : 'End camera feed and silence alerts'}
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Camera Viewport Frame */}
      <div
        ref={containerRef}
        className={`relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[520px] rounded-2xl overflow-hidden bg-black border-4 ${
          isNavigating ? 'border-emerald-500 shadow-2xl' : theme.cardBorder
        } flex items-center justify-center`}
        role="region"
        aria-label={language === 'te' ? 'కెమెరా మరియు AI శోధన స్క్రీన్' : 'Camera and object detection viewfinder'}
      >
        {/* Actual HTML Video Element */}
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isNavigating && !cameraError ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Canvas for detection bounding boxes and sector overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none ${
            isNavigating ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Live Indicator Ribbon when running */}
        {isNavigating && !cameraError && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 backdrop-blur-sm border border-emerald-500/60 text-emerald-400 text-xs font-black">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{language === 'te' ? 'లైవ్ స్కానింగ్' : 'LIVE SCANNING'}</span>
            <span className="text-white/60">|</span>
            <span className="text-white/80">
              {facingMode === 'environment'
                ? language === 'te' ? 'వెనుక కెమెరా' : 'Rear Camera'
                : language === 'te' ? 'ముందు కెమెరా' : 'Front Camera'}
            </span>
          </div>
        )}

        {/* Switch Camera Button (if multiple cameras or on mobile) */}
        {isNavigating && !cameraError && hasMultipleCameras && (
          <button
            type="button"
            onClick={onToggleFacingMode}
            className="absolute top-3 right-3 z-10 p-3 rounded-xl bg-black/80 backdrop-blur-md border-2 border-white/60 text-white hover:bg-black active:scale-95 transition-all shadow-lg flex items-center gap-2 text-xs font-bold"
            aria-label={language === 'te' ? 'కెమెరా మార్చండి' : 'Switch camera (rear / front)'}
            title="Switch between rear and front camera"
          >
            <SwitchCamera className="w-5 h-5 text-amber-400" />
            <span className="hidden sm:inline">{language === 'te' ? 'కెమెరా మార్చు' : 'Flip'}</span>
          </button>
        )}

        {/* Standby / Off State Overlay */}
        {!isNavigating && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 text-white">
            <div className="p-4 rounded-full bg-slate-800/80 border-2 border-slate-700 mb-4">
              <Camera className="w-12 h-12 text-slate-300 stroke-[1.75]" />
            </div>
            <h2 className="text-lg sm:text-xl font-black mb-2">
              {language === 'te' ? 'కెమెరా ఆఫ్‌లో ఉంది' : 'Camera is Inactive'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mb-5 leading-relaxed">
              {language === 'te'
                ? 'వస్తువుల శోధన మరియు శబ్ద హెచ్చరికల కోసం పైన ఉన్న "నావిగేషన్ ప్రారంభించండి" బటన్ నొక్కండి. మీ కెమెరా అనుమతి అప్పుడు మాత్రమే అడగబడుతుంది.'
                : 'Press "Start Navigation" above to activate your camera and begin hearing directional object alerts in Telugu or English.'}
            </p>
            <button
              type="button"
              onClick={onTestModeClick}
              className="text-xs sm:text-sm font-bold text-amber-400 underline hover:text-amber-300 transition-colors p-2"
            >
              {language === 'te'
                ? 'లేదా కెమెరా లేకుండా శాంపిల్ దృశ్యాలను పరీక్షించండి →'
                : 'Or test detection using pre-loaded sample scenes →'}
            </button>
          </div>
        )}

        {/* Camera Permission / Error State Overlay */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-rose-950/95 text-white z-20">
            <div className="p-4 rounded-full bg-rose-900 border-2 border-rose-500 mb-3">
              <AlertCircle className="w-10 h-10 text-rose-200 stroke-[2.2]" />
            </div>
            <h3 className="text-lg font-black text-rose-100 mb-1">
              {language === 'te' ? 'కెమెరా యాక్సెస్ సమస్య' : 'Camera Access Issue'}
            </h3>
            <p className="text-xs sm:text-sm text-rose-200 max-w-sm mb-4 leading-relaxed">
              {cameraError}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={onRetryCamera}
                className="px-4 py-2.5 rounded-xl bg-white text-rose-950 font-black text-sm flex items-center gap-2 hover:bg-rose-100 active:scale-95 shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{language === 'te' ? 'మళ్ళీ ప్రయత్నించండి' : 'Retry Camera'}</span>
              </button>
              <button
                type="button"
                onClick={onTestModeClick}
                className="px-4 py-2.5 rounded-xl bg-amber-400 text-black font-black text-sm hover:bg-amber-300 active:scale-95 shadow-md"
              >
                <span>{language === 'te' ? 'శాంపిల్ దృశ్యం వాడండి' : 'Use Sample Test Scene'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Screen-reader accessible live announcement region */}
      <div
        className="sr-only"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        id="accessible-alert-region"
      >
        {currentDetections.length > 0
          ? `${currentDetections[0].translatedName} ${currentDetections[0].sector}`
          : ''}
      </div>
    </div>
  );
};
