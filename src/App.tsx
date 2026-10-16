/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { CameraView } from './components/CameraView';
import { DetectionList } from './components/DetectionList';
import { AudioControls } from './components/AudioControls';
import { SafetyDisclaimer } from './components/SafetyDisclaimer';
import { TestModeModal } from './components/TestModeModal';
import { VoiceAnnouncementHistory } from './components/VoiceAnnouncementHistory';
import { HelpModal } from './components/HelpModal';
import { VoiceAssistantBanner } from './components/VoiceAssistantBanner';
import { TeluguVoiceStatusBanner } from './components/TeluguVoiceStatusBanner';
import { StartupIntroduction } from './components/StartupIntroduction';
import { SevaChallengeSection } from './components/SevaChallengeSection';
import {
  AppSettings,
  DetectionResult,
  HighContrastMode,
  Language,
  SpeechPriority,
  VoiceAlert,
  VoiceAssistantStatus,
  VoiceCommandAction,
  VoiceCommandEvent,
  VoiceEngineInfo,
} from './types';
import { THEMES } from './utils/theme';
import { detectorService, ModelLoadingState } from './utils/detector';
import { audioAlertManager } from './utils/audioAlerts';
import {
  formatDirectionalAlert,
  getTranslatedLabel,
  summarizeDetections,
  summarizeWhatIsInFront,
} from './utils/cocoLabels';
import { voiceAssistantService } from './utils/voiceAssistant';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  minConfidence: 0.5,
  speechCooldownSeconds: 6,
  speechRate: 1.0,
  spatialAudioChimes: true,
  hapticFeedback: true,
  highContrastMode: 'dark-high',
  facingMode: 'environment',
  autoSpeak: true,
  voiceAssistantActive: false,
  alertVerbosity: 'minimal', // Minimal is default for the initial prototype
};

export default function App() {
  // Load settings from localStorage if available
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('drishtipath_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // Ignore localStorage errors
    }
    return DEFAULT_SETTINGS;
  });

  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [modelState, setModelState] = useState<ModelLoadingState>('idle');
  const [currentDetections, setCurrentDetections] = useState<DetectionResult[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recentAlerts, setRecentAlerts] = useState<VoiceAlert[]>([]);
  const [hasMultipleCameras, setHasMultipleCameras] = useState<boolean>(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [lastSpokenText, setLastSpokenText] = useState<string>('');

  // Voice Assistant and Voice Engine state
  const [voiceAssistantStatus, setVoiceAssistantStatus] = useState<VoiceAssistantStatus>('idle');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [lastVoiceCommand, setLastVoiceCommand] = useState<VoiceCommandEvent | null>(null);
  const [voiceInfo, setVoiceInfo] = useState<VoiceEngineInfo>(() =>
    audioAlertManager.getVoiceEngineInfo()
  );

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const detectionLoopTimerRef = useRef<number | null>(null);
  const isDetectingRef = useRef<boolean>(false);
  const activeFacingModeRef = useRef<'environment' | 'user'>(settings.facingMode);
  const currentDetectionsRef = useRef<DetectionResult[]>([]);
  const isNavigatingRef = useRef<boolean>(false);

  // Keep refs in sync for callbacks
  useEffect(() => {
    activeFacingModeRef.current = settings.facingMode;
  }, [settings.facingMode]);

  useEffect(() => {
    currentDetectionsRef.current = currentDetections;
  }, [currentDetections]);

  useEffect(() => {
    isNavigatingRef.current = isNavigating;
  }, [isNavigating]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('drishtipath_settings', JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  // Load and refresh voice engine info
  const refreshVoices = useCallback(() => {
    audioAlertManager.ensureVoicesLoaded().then(() => {
      setVoiceInfo(audioAlertManager.getVoiceEngineInfo());
    });
  }, []);

  useEffect(() => {
    refreshVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        refreshVoices();
      };
    }
  }, [refreshVoices]);

  // Pre-load TensorFlow.js and COCO-SSD model in background without asking for camera
  useEffect(() => {
    setModelState('loading');
    detectorService
      .loadModel()
      .then(() => {
        setModelState('ready');
      })
      .catch((err) => {
        console.error('Failed to preload detector:', err);
        setModelState('error');
      });
  }, []);

  // Enumerate cameras to check if multiple cameras (rear/front) are present
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        })
        .catch(() => {
          setHasMultipleCameras(false);
        });
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      updateSettings({ language: lang });
      voiceAssistantService.setLanguage(lang);
      const msg = lang === 'te' ? 'తెలుగు భాష ఎంపిక చేయబడింది' : 'English language selected';
      audioAlertManager.enqueue(msg, lang, 'high', 1.0);
      setLastSpokenText(msg);
    },
    [updateSettings]
  );

  const handleContrastModeChange = (mode: HighContrastMode) => {
    updateSettings({ highContrastMode: mode });
  };

  /**
   * Centralized Announcement Trigger:
   * Dispatches speech through CentralizedSpeechManager single queue.
   */
  const triggerAnnouncement = useCallback(
    (
      text: string,
      lang: Language,
      sector?: 'left' | 'ahead' | 'right',
      className?: string,
      priority: SpeechPriority = 'normal'
    ) => {
      setLastSpokenText(text);

      if (settings.autoSpeak) {
        audioAlertManager.enqueue(text, lang, priority, settings.speechRate, sector, className);
      }

      if (settings.spatialAudioChimes && sector) {
        audioAlertManager.playSpatialChime(sector);
      }

      if (settings.hapticFeedback) {
        audioAlertManager.triggerHaptic(80);
      }

      const alertItem: VoiceAlert = {
        id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text,
        language: lang,
        timestamp: Date.now(),
        sector,
        className,
      };

      setRecentAlerts((prev) => [alertItem, ...prev.slice(0, 24)]);
    },
    [settings.autoSpeak, settings.spatialAudioChimes, settings.speechRate, settings.hapticFeedback]
  );

  /**
   * PART 1 & PART 3: Single Synchronized Detection & Multi-Object Summarizer Loop
   */
  const runDetectionLoop = useCallback(() => {
    if (!isNavigatingRef.current) return;

    const performStep = async () => {
      const video = videoRef.current;
      if (
        !isNavigatingRef.current ||
        !video ||
        video.readyState < 2 ||
        video.paused ||
        video.ended ||
        isDetectingRef.current
      ) {
        if (isNavigatingRef.current) {
          detectionLoopTimerRef.current = window.setTimeout(runDetectionLoop, 300);
        }
        return;
      }

      isDetectingRef.current = true;

      try {
        const detections = await detectorService.detect(
          video,
          settings.language,
          settings.minConfidence
        );

        setCurrentDetections(detections);
        currentDetectionsRef.current = detections;

        // Check for announcements using Intelligent Multi-Object Summarizer (Part 3)
        if (detections.length > 0 && settings.autoSpeak) {
          const summary = summarizeDetections(detections, settings.alertVerbosity, settings.language);

          if (summary) {
            // Find target item's prominence
            const targetDet = detections.find((d) => d.class === summary.primaryClass) || detections[0];
            const prominence = targetDet.estimatedRelativeDistance;

            if (
              !audioAlertManager.shouldSuppress(
                summary.primaryClass,
                summary.primarySector,
                prominence,
                settings.speechCooldownSeconds
              )
            ) {
              audioAlertManager.markAnnounced(summary.primaryClass, summary.primarySector, prominence);

              triggerAnnouncement(
                summary.text,
                settings.language,
                summary.primarySector,
                summary.primaryClass,
                'normal'
              );
            }
          }
        }
      } catch (err) {
        console.warn('Frame detection step error:', err);
      } finally {
        isDetectingRef.current = false;
        if (isNavigatingRef.current) {
          detectionLoopTimerRef.current = window.setTimeout(runDetectionLoop, 350);
        }
      }
    };

    performStep();
  }, [
    settings.language,
    settings.minConfidence,
    settings.autoSpeak,
    settings.speechCooldownSeconds,
    settings.alertVerbosity,
    triggerAnnouncement,
  ]);

  // Restart detection loop when isNavigating changes
  useEffect(() => {
    if (isNavigating) {
      runDetectionLoop();
    } else {
      if (detectionLoopTimerRef.current) {
        clearTimeout(detectionLoopTimerRef.current);
        detectionLoopTimerRef.current = null;
      }
      isDetectingRef.current = false;
    }

    return () => {
      if (detectionLoopTimerRef.current) {
        clearTimeout(detectionLoopTimerRef.current);
      }
    };
  }, [isNavigating, runDetectionLoop]);

  /**
   * Start Navigation: Requests Camera and starts audio guidance
   */
  const startNavigation = async (facing: 'environment' | 'user' = settings.facingMode) => {
    setCameraError(null);

    const startMsg =
      settings.language === 'te'
        ? 'నావిగేషన్ ప్రారంభమవుతోంది. కెమెరా ఆన్ చేయబడుతోంది.'
        : 'Starting navigation. Turning on camera.';
    triggerAnnouncement(startMsg, settings.language, undefined, undefined, 'high');

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          settings.language === 'te'
            ? 'ఈ బ్రౌజర్‌లో కెమెరా సదుపాయం అందుబాటులో లేదు.'
            : 'Camera API is not supported in this browser environment.'
        );
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }

      setIsNavigating(true);
      isNavigatingRef.current = true;

      const readyMsg =
        settings.language === 'te'
          ? 'కెమెరా లైవ్. పరిసరాల శోధన ప్రారంభించబడింది.'
          : 'Camera live. Object detection active.';
      triggerAnnouncement(readyMsg, settings.language, undefined, undefined, 'high');
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      let errorMsg =
        settings.language === 'te'
          ? 'కెమెరా ప్రారంభించడం విఫలమైంది. దయచేసి కెమెరా అనుమతిని ఆమోదించండి.'
          : 'Failed to access camera. Please allow camera permissions in browser settings.';

      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg =
            settings.language === 'te'
              ? 'కెమెరా అనుమతి నిరాకరించబడింది. దయచేసి బ్రౌజర్ సెట్టింగ్స్‌లో కెమెరా అనుమతించండి.'
              : 'Camera permission was denied. Please grant camera access in your browser site permissions.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg =
            settings.language === 'te'
              ? 'పరికరంలో కెమెరా కనుగొనబడలేదు. మీరు శాంపిల్ దృశ్యాలను పరీక్షించవచ్చు.'
              : 'No camera hardware found on this device. You can test with pre-loaded sample scenes.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg =
            settings.language === 'te'
              ? 'కెమెరా వేరే యాప్‌లో ఇప్పటికే వాడుకలో ఉంది.'
              : 'Camera is currently in use by another application or tab.';
        }
      }

      setCameraError(errorMsg);
      setIsNavigating(false);
      isNavigatingRef.current = false;
      audioAlertManager.enqueue(errorMsg, settings.language, 'high', 1.0);
    }
  };

  /**
   * PART 5: Responsive Stop Navigation & Clean Cancellation
   */
  const stopNavigation = useCallback(() => {
    if (detectionLoopTimerRef.current) {
      clearTimeout(detectionLoopTimerRef.current);
      detectionLoopTimerRef.current = null;
    }
    isDetectingRef.current = false;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      mediaStreamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsNavigating(false);
    isNavigatingRef.current = false;
    setCurrentDetections([]);
    currentDetectionsRef.current = [];

    const stopMsg =
      settings.language === 'te'
        ? 'నావిగేషన్ మరియు కెమెరా ఆపివేయబడ్డాయి.'
        : 'Navigation stopped. Camera turned off.';
    setLastSpokenText(stopMsg);

    // Cancel all queued speech and speak only the brief final confirmation
    audioAlertManager.cancelAll(stopMsg, settings.language);
    audioAlertManager.resetCooldowns();
  }, [settings.language]);

  /**
   * PART 4: "What is in front of me?" / "Na mundu em undi?"
   * Summarizes actual current detections only. Never invents objects.
   */
  const handleQueryWhatIsInFront = useCallback(() => {
    if (!isNavigatingRef.current) {
      const offNotice =
        settings.language === 'te'
          ? 'కెమెరా ప్రస్తుతం ఆఫ్‌లో ఉంది. దయచేసి "Camera open cheyyi" అని చెప్పండి లేదా నావిగేషన్ ప్రారంభించండి.'
          : 'Camera is currently off. Please say "Open camera" or click Start Navigation first.';
      triggerAnnouncement(offNotice, settings.language, undefined, undefined, 'high');
      return;
    }

    const report = summarizeWhatIsInFront(currentDetectionsRef.current, settings.language);
    triggerAnnouncement(report, settings.language, 'ahead', undefined, 'high');
  }, [settings.language, triggerAnnouncement]);

  /**
   * Voice Command Handler - Maps voice commands to application actions
   */
  const handleVoiceCommand = useCallback(
    (action: VoiceCommandAction, transcript: string) => {
      switch (action) {
        case 'OPEN_CAMERA':
          if (!isNavigatingRef.current) {
            startNavigation();
          } else {
            const alreadyMsg =
              settings.language === 'te'
                ? 'కెమెరా ఇప్పటికే ఆన్‌లో ఉంది.'
                : 'Camera is already active and scanning.';
            triggerAnnouncement(alreadyMsg, settings.language, undefined, undefined, 'high');
          }
          break;

        case 'STOP_CAMERA':
          if (isNavigatingRef.current) {
            stopNavigation();
          } else {
            const alreadyMsg =
              settings.language === 'te'
                ? 'కెమెరా ఇప్పటికే ఆఫ్‌లో ఉంది.'
                : 'Camera is already stopped.';
            triggerAnnouncement(alreadyMsg, settings.language, undefined, undefined, 'high');
          }
          break;

        case 'WHAT_IS_IN_FRONT':
          handleQueryWhatIsInFront();
          break;

        case 'REPEAT':
          audioAlertManager.repeatLastSpoken();
          break;

        case 'SWITCH_TELUGU':
          handleLanguageChange('te');
          break;

        case 'SWITCH_ENGLISH':
          handleLanguageChange('en');
          break;

        case 'STOP_ASSISTANT':
          voiceAssistantService.stop();
          setIsVoiceActive(false);
          setVoiceAssistantStatus('idle');
          const stopVoiceMsg =
            settings.language === 'te'
              ? 'వాయిస్ అసిస్టెంట్ ఆపివేయబడింది.'
              : 'Voice assistant turned off.';
          setLastSpokenText(stopVoiceMsg);
          audioAlertManager.cancelAll(stopVoiceMsg, settings.language);
          break;
      }
    },
    [
      handleLanguageChange,
      handleQueryWhatIsInFront,
      settings.language,
      startNavigation,
      stopNavigation,
      triggerAnnouncement,
    ]
  );

  /**
   * Start Voice Assistant
   */
  const startVoiceAssistant = useCallback(async () => {
    setAssistantError(null);
    const result = await voiceAssistantService.start(settings.language);
    if (result.success) {
      setIsVoiceActive(true);
      setVoiceAssistantStatus('listening');
      const welcome =
        settings.language === 'te'
          ? 'వాయిస్ అసిస్టెంట్ ఆన్ చేయబడింది. కమాండ్ల కోసం వింటోంది.'
          : 'Voice assistant active. Listening for commands.';
      triggerAnnouncement(welcome, settings.language, undefined, undefined, 'high');
    } else {
      setAssistantError(result.error || 'Failed to start voice assistant');
      setIsVoiceActive(false);
      setVoiceAssistantStatus('error');
    }
  }, [settings.language, triggerAnnouncement]);

  /**
   * Stop Voice Assistant
   */
  const stopVoiceAssistant = useCallback(() => {
    voiceAssistantService.stop();
    setIsVoiceActive(false);
    setVoiceAssistantStatus('idle');
    const msg =
      settings.language === 'te'
        ? 'వాయిస్ అసిస్టెంట్ ఆపివేయబడింది.'
        : 'Voice assistant deactivated.';
    setLastSpokenText(msg);
    audioAlertManager.cancelAll(msg, settings.language);
  }, [settings.language]);

  // Register voice assistant event callbacks
  useEffect(() => {
    voiceAssistantService.registerCallbacks(
      (action, transcript) => {
        handleVoiceCommand(action, transcript);
      },
      (status, details) => {
        setVoiceAssistantStatus(status);
        if (status === 'error' && details) {
          setAssistantError(details);
        }
      },
      (event) => {
        setLastVoiceCommand(event);
      }
    );
  }, [handleVoiceCommand]);

  /**
   * Toggle between rear and front facing camera
   */
  const toggleFacingMode = async () => {
    const nextMode = settings.facingMode === 'environment' ? 'user' : 'environment';
    updateSettings({ facingMode: nextMode });

    if (isNavigating) {
      stopNavigation();
      setTimeout(() => {
        startNavigation(nextMode);
      }, 400);
    }
  };

  /**
   * Manual listen to specific detection
   */
  const handleSpeakObject = (det: DetectionResult) => {
    const phrase = formatDirectionalAlert(
      det.class,
      det.sector,
      det.estimatedRelativeDistance,
      settings.language
    );
    triggerAnnouncement(phrase, settings.language, det.sector, det.class, 'high');
  };

  /**
   * Apply detections from the Sample Test Scenario modal
   */
  const handleApplySampleDetections = (detections: DetectionResult[], sampleName: string) => {
    setCurrentDetections(detections);
    currentDetectionsRef.current = detections;
    const notice =
      settings.language === 'te'
        ? `శాంపిల్ దృశ్యం లోడ్ అయింది: ${sampleName}`
        : `Sample scene loaded: ${sampleName}`;
    setLastSpokenText(notice);
  };

  // Keyboard accessibility listeners (Spacebar to start/stop, V for voice assistant, L for language, R to repeat, T for tests)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        if (isNavigatingRef.current) {
          stopNavigation();
        } else {
          startNavigation();
        }
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        if (voiceAssistantService.getIsActive()) {
          stopVoiceAssistant();
        } else {
          startVoiceAssistant();
        }
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        handleLanguageChange(settings.language === 'en' ? 'te' : 'en');
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        audioAlertManager.repeatLastSpoken();
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setIsTestModalOpen((prev) => !prev);
      } else if (e.key === 'h' || e.key === 'H' || e.key === '?') {
        e.preventDefault();
        setIsHelpModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleLanguageChange,
    settings.language,
    startNavigation,
    startVoiceAssistant,
    stopNavigation,
    stopVoiceAssistant,
  ]);

  const currentTheme = THEMES[settings.highContrastMode];

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} ${currentTheme.textPrimary} flex flex-col font-sans transition-colors duration-200`}
    >
      {/* Accessible Header */}
      <Header
        language={settings.language}
        onLanguageChange={handleLanguageChange}
        contrastMode={settings.highContrastMode}
        onContrastModeChange={handleContrastModeChange}
        modelState={modelState}
        onOpenTestMode={() => setIsTestModalOpen(true)}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Startup Introduction & Initial Permission Guidance */}
        <StartupIntroduction
          language={settings.language}
          contrastMode={settings.highContrastMode}
          onStartVoiceAssistant={startVoiceAssistant}
          onStartNavigation={() => startNavigation()}
          isVoiceActive={isVoiceActive}
          isNavigating={isNavigating}
        />

        {/* Important Safety Banner */}
        <SafetyDisclaimer
          language={settings.language}
          contrastMode={settings.highContrastMode}
        />

        {/* Priority 2: Hands-Free Voice Assistant Controller Banner */}
        <VoiceAssistantBanner
          status={voiceAssistantStatus}
          isActive={isVoiceActive}
          onStartAssistant={startVoiceAssistant}
          onStopAssistant={stopVoiceAssistant}
          language={settings.language}
          contrastMode={settings.highContrastMode}
          lastCommand={lastVoiceCommand}
          assistantError={assistantError}
          isSupported={voiceAssistantService.isSupported()}
        />

        {/* Priority 1: Real Telugu Text-to-Speech Status & Voice Test Banner */}
        <TeluguVoiceStatusBanner
          voiceInfo={voiceInfo}
          language={settings.language}
          contrastMode={settings.highContrastMode}
          onRefreshVoices={refreshVoices}
        />

        {/* Primary Camera & Controls Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Center Column: Camera Viewport & Big Start/Stop Button */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <CameraView
              isNavigating={isNavigating}
              onStartNavigation={() => startNavigation()}
              onStopNavigation={stopNavigation}
              videoRef={videoRef}
              canvasRef={canvasRef}
              currentDetections={currentDetections}
              cameraError={cameraError}
              onRetryCamera={() => startNavigation()}
              language={settings.language}
              contrastMode={settings.highContrastMode}
              facingMode={settings.facingMode}
              onToggleFacingMode={toggleFacingMode}
              hasMultipleCameras={hasMultipleCameras}
              isModelLoading={modelState === 'loading'}
              onTestModeClick={() => setIsTestModalOpen(true)}
            />
          </div>

          {/* Right Column: Detected Objects List & Audio Controls */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <DetectionList
              detections={currentDetections}
              language={settings.language}
              contrastMode={settings.highContrastMode}
              isNavigating={isNavigating || currentDetections.length > 0}
              onSpeakObject={handleSpeakObject}
            />

            <AudioControls
              settings={settings}
              onUpdateSettings={updateSettings}
              language={settings.language}
              contrastMode={settings.highContrastMode}
              lastSpokenText={lastSpokenText}
            />
          </div>
        </div>

        {/* PART 6: SEVA First Innovation Challenge Section */}
        <SevaChallengeSection
          language={settings.language}
          contrastMode={settings.highContrastMode}
        />

        {/* Spoken Alerts Log */}
        <VoiceAnnouncementHistory
          alerts={recentAlerts}
          onClear={() => setRecentAlerts([])}
          language={settings.language}
          contrastMode={settings.highContrastMode}
        />
      </main>

      {/* Footer */}
      <footer
        className={`border-t ${currentTheme.cardBorder} ${currentTheme.cardBg} py-5 px-4 text-center text-xs font-semibold ${currentTheme.textMuted}`}
      >
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <span className="font-bold text-amber-400">DrishtiPath AI</span> — Every Path,
            Within Reach.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <span>TensorFlow.js COCO-SSD</span>
            <span>•</span>
            <span>Web Speech API (Telugu te-IN & English)</span>
            <span>•</span>
            <span>Centralized Speech Queue</span>
            <span>•</span>
            <span>SEVA Challenge Prototype</span>
          </div>
        </div>
      </footer>

      {/* Test Sample Modal */}
      <TestModeModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        language={settings.language}
        contrastMode={settings.highContrastMode}
        onApplyDetections={handleApplySampleDetections}
      />

      {/* Help & Accessibility Modal */}
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        language={settings.language}
        contrastMode={settings.highContrastMode}
      />
    </div>
  );
}
