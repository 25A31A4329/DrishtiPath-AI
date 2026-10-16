/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { DetectionResult, Language } from '../types';
import { getTranslatedLabel } from './cocoLabels';

export type ModelLoadingState = 'idle' | 'loading' | 'ready' | 'error';

class ObjectDetectorService {
  private model: cocoSsd.ObjectDetection | null = null;
  private loadingPromise: Promise<cocoSsd.ObjectDetection> | null = null;
  private loadingState: ModelLoadingState = 'idle';
  private loadingError: string | null = null;

  public async loadModel(): Promise<cocoSsd.ObjectDetection> {
    if (this.model) {
      return this.model;
    }

    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingState = 'loading';
    this.loadingError = null;

    this.loadingPromise = (async () => {
      try {
        await tf.ready();
        // Load COCO-SSD with lightweight mobilenet v2 for snappy real-time mobile performance
        const loadedModel = await cocoSsd.load({
          base: 'lite_mobilenet_v2',
        });
        this.model = loadedModel;
        this.loadingState = 'ready';
        return loadedModel;
      } catch (err) {
        console.error('Error loading COCO-SSD model with lite_mobilenet_v2, trying default:', err);
        try {
          const fallbackModel = await cocoSsd.load();
          this.model = fallbackModel;
          this.loadingState = 'ready';
          return fallbackModel;
        } catch (innerErr: unknown) {
          const msg = innerErr instanceof Error ? innerErr.message : String(innerErr);
          this.loadingState = 'error';
          this.loadingError = msg;
          throw new Error(`Failed to load object detection AI model: ${msg}`);
        }
      } finally {
        this.loadingPromise = null;
      }
    })();

    return this.loadingPromise;
  }

  public getStatus(): { state: ModelLoadingState; error: string | null } {
    return {
      state: this.loadingState,
      error: this.loadingError,
    };
  }

  /**
   * Performs object detection on a video, image, or canvas element
   */
  public async detect(
    imageSource: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement,
    lang: Language,
    minConfidence = 0.5
  ): Promise<DetectionResult[]> {
    if (!this.model) {
      await this.loadModel();
    }

    if (!this.model) {
      return [];
    }

    const predictions = await this.model.detect(imageSource, 10, minConfidence);

    // Get dimensions of the source
    let sourceWidth = 640;
    let sourceHeight = 480;

    if (imageSource instanceof HTMLVideoElement) {
      sourceWidth = imageSource.videoWidth || 640;
      sourceHeight = imageSource.videoHeight || 480;
    } else if (imageSource instanceof HTMLImageElement) {
      sourceWidth = imageSource.naturalWidth || 640;
      sourceHeight = imageSource.naturalHeight || 480;
    } else if (imageSource instanceof HTMLCanvasElement) {
      sourceWidth = imageSource.width || 640;
      sourceHeight = imageSource.height || 480;
    }

    const totalArea = sourceWidth * sourceHeight;

    const results: DetectionResult[] = predictions.map((pred, index) => {
      const [x, y, width, height] = pred.bbox;
      const centerX = x + width / 2;
      const xRatio = centerX / sourceWidth;

      // Determine sector relative to the user holding phone
      let sector: 'left' | 'ahead' | 'right' = 'ahead';
      if (xRatio < 0.35) {
        sector = 'left';
      } else if (xRatio > 0.65) {
        sector = 'right';
      } else {
        sector = 'ahead';
      }

      // Relative size estimate (not exact physical distance, purely visual prominence)
      const objArea = width * height;
      const areaRatio = objArea / totalArea;
      let estimatedRelativeDistance: 'prominent' | 'moderate' | 'distant' = 'distant';
      if (areaRatio > 0.18) {
        estimatedRelativeDistance = 'prominent';
      } else if (areaRatio > 0.05) {
        estimatedRelativeDistance = 'moderate';
      }

      return {
        id: `${pred.class}-${index}-${Date.now()}`,
        class: pred.class,
        translatedName: getTranslatedLabel(pred.class, lang),
        score: Math.round(pred.score * 100),
        bbox: [Math.round(x), Math.round(y), Math.round(width), Math.round(height)],
        sector,
        estimatedRelativeDistance,
        timestamp: Date.now(),
      };
    });

    // Sort by prominence (largest/most prominent first, then highest confidence)
    results.sort((a, b) => {
      const aArea = a.bbox[2] * a.bbox[3];
      const bArea = b.bbox[2] * b.bbox[3];
      return bArea - aArea;
    });

    return results;
  }
}

export const detectorService = new ObjectDetectorService();
