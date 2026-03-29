
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs-backend-webgl';
import { ViolationType } from './types';

export interface ProctoringEvent {
  type: ViolationType;
  description: string;
}

export class ProctoringService {
  private detector: faceDetection.FaceDetector | null = null;
  private monitoringInterval: any = null;
  private onViolation: (event: ProctoringEvent) => void;

  constructor(onViolation: (event: ProctoringEvent) => void) {
    this.onViolation = onViolation;
  }

  async initialize() {
    const model = faceDetection.SupportedModels.MediaPipeFaceDetector;
    const detectorConfig: faceDetection.MediaPipeFaceDetectorTfjsModelConfig = {
      runtime: 'tfjs',
      maxFaces: 5, // To detect multiple people
    };
    this.detector = await faceDetection.createDetector(model, detectorConfig);
  }

  startMonitoring(videoElement: HTMLVideoElement) {
    // 1. Browser/Tab Monitoring
    window.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('blur', this.handleWindowBlur);

    // 2. Camera Monitoring
    this.monitoringInterval = setInterval(async () => {
      if (this.detector && videoElement.readyState === 4) {
        try {
          const faces = await this.detector.estimateFaces(videoElement);
          
          if (faces.length === 0) {
            this.onViolation({
              type: 'NOT_VISIBLE',
              description: 'Student is not visible in the camera frame.'
            });
          } else if (faces.length > 1) {
            this.onViolation({
              type: 'MULTIPLE_PEOPLE',
              description: `Detected ${faces.length} people in the frame.`
            });
          } else {
            // Check if looking away (simple heuristic based on face orientation if available, 
            // or just checking if the face is centered/large enough)
            // For MediaPipeFaceDetector, we get keypoints.
            const face = faces[0];
            const box = face.box;
            
            // Simple check: is the face too close to the edges?
            const videoWidth = videoElement.videoWidth;
            const videoHeight = videoElement.videoHeight;
            
            const centerX = box.xMin + box.width / 2;
            const centerY = box.yMin + box.height / 2;
            
            const relativeX = centerX / videoWidth;
            const relativeY = centerY / videoHeight;
            
            if (relativeX < 0.2 || relativeX > 0.8 || relativeY < 0.2 || relativeY > 0.8) {
              this.onViolation({
                type: 'LOOK_AWAY',
                description: 'Student appears to be looking away from the screen.'
              });
            }
          }
        } catch (error) {
          console.error('Face detection error:', error);
        }
      }
    }, 2000); // Check every 2 seconds
  }

  stopMonitoring() {
    window.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('blur', this.handleWindowBlur);
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      this.onViolation({
        type: 'TAB_SWITCH',
        description: 'Student switched tabs or minimized the browser.'
      });
    }
  };

  private handleWindowBlur = () => {
    this.onViolation({
      type: 'WINDOW_BLUR',
      description: 'Student moved away from the exam screen.'
    });
  };
}
