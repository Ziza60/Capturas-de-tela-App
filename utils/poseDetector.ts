/**
 * MULTI-POINT POSE DETECTION SYSTEM
 * Detecta face, corpo e ângulos usando MediaPipe
 * Empresas profissionais usam 33+ pontos para garantir precisão
 */

import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

let faceDetector: FaceDetector | null = null;

export async function initializePoseDetector(): Promise<void> {
  if (faceDetector) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5
    });
  } catch (error) {
    console.error('Erro ao inicializar detector:', error);
    throw new Error('Falha ao inicializar MediaPipe');
  }
}

/**
 * Pontos corporais detectados - padrão profissional
 */
export interface BodyLandmarks {
  // Face
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  nose: { x: number; y: number };
  mouth: { x: number; y: number };

  // Calculados
  eyesCenter: { x: number; y: number };
  eyeDistance: number;
  headRotation: number; // ângulo em graus
  headTilt: number; // inclinação lateral

  // Dimensões
  faceWidth: number;
  faceHeight: number;
  headSize: number; // medida composta

  // Bounding box
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Qualidade da detecção
  confidence: number;
  isFrontal: boolean; // true se a pose é frontal (não 3/4)
}

/**
 * Detecta todos os pontos corporais necessários para normalização profissional
 */
export async function detectBodyLandmarks(
  imageElement: HTMLImageElement
): Promise<BodyLandmarks | null> {
  if (!faceDetector) {
    await initializePoseDetector();
  }

  const detections = faceDetector!.detect(imageElement);

  if (!detections.detections || detections.detections.length === 0) {
    console.warn('Nenhuma face detectada na imagem');
    return null;
  }

  const detection: Detection = detections.detections[0];
  const keypoints = detection.keypoints;

  if (!keypoints || keypoints.length < 6) {
    console.warn('Landmarks insuficientes detectados');
    return null;
  }

  const imgWidth = imageElement.naturalWidth;
  const imgHeight = imageElement.naturalHeight;

  // MediaPipe BlazeFace keypoints:
  // 0: Olho direito
  // 1: Olho esquerdo
  // 2: Ponta do nariz
  // 3: Centro da boca
  // 4: Olho direito (interno)
  // 5: Olho esquerdo (interno)

  const rightEye = {
    x: keypoints[0].x * imgWidth,
    y: keypoints[0].y * imgHeight
  };

  const leftEye = {
    x: keypoints[1].x * imgWidth,
    y: keypoints[1].y * imgHeight
  };

  const nose = {
    x: keypoints[2].x * imgWidth,
    y: keypoints[2].y * imgHeight
  };

  const mouth = {
    x: keypoints[3].x * imgWidth,
    y: keypoints[3].y * imgHeight
  };

  // Calcular centro dos olhos
  const eyesCenter = {
    x: (rightEye.x + leftEye.x) / 2,
    y: (rightEye.y + leftEye.y) / 2
  };

  // Calcular distância entre olhos
  const eyeDistance = Math.sqrt(
    Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
  );

  // Calcular rotação da cabeça (baseado na linha dos olhos)
  const headRotation = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

  // Calcular inclinação (frontal vs 3/4 view)
  // Se o nariz está muito deslocado do centro dos olhos, não é frontal
  const noseToCenterOffset = Math.abs(nose.x - eyesCenter.x);
  const isFrontal = noseToCenterOffset < eyeDistance * 0.15; // Tolerância de 15%

  // Calcular inclinação lateral
  const headTilt = Math.abs(headRotation);

  // Dimensões da face
  const bbox = detection.boundingBox;
  const faceWidth = bbox ? bbox.width * imgWidth : eyeDistance * 3;
  const faceHeight = bbox ? bbox.height * imgHeight : eyeDistance * 4;

  // Tamanho composto da cabeça (usado para escala)
  const headSize = (faceWidth + faceHeight) / 2;

  return {
    leftEye,
    rightEye,
    nose,
    mouth,
    eyesCenter,
    eyeDistance,
    headRotation,
    headTilt,
    faceWidth,
    faceHeight,
    headSize,
    boundingBox: {
      x: bbox?.originX || eyesCenter.x - faceWidth / 2,
      y: bbox?.originY || eyesCenter.y - faceHeight / 2,
      width: faceWidth,
      height: faceHeight
    },
    confidence: detection.categories?.[0]?.score || 0,
    isFrontal
  };
}

/**
 * Estima a posição dos ombros baseado na geometria facial
 * (Para detecção precisa, empresas usam MediaPipe Pose, mas isso adiciona 2MB ao bundle)
 */
export function estimateShoulderPosition(landmarks: BodyLandmarks): {
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };
  shouldersY: number;
  shouldersWidth: number;
} {
  // Proporção típica corpo humano: ombros estão ~2.5x a distância entre olhos abaixo deles
  const shoulderOffset = landmarks.eyeDistance * 2.5;

  // Largura dos ombros: ~3.5x a distância entre olhos
  const shoulderWidth = landmarks.eyeDistance * 3.5;

  const shouldersY = landmarks.eyesCenter.y + shoulderOffset;

  return {
    leftShoulder: {
      x: landmarks.eyesCenter.x - shoulderWidth / 2,
      y: shouldersY
    },
    rightShoulder: {
      x: landmarks.eyesCenter.x + shoulderWidth / 2,
      y: shouldersY
    },
    shouldersY,
    shouldersWidth: shoulderWidth
  };
}

/**
 * Análise completa da pose para validação
 */
export interface PoseAnalysis {
  landmarks: BodyLandmarks;
  shoulders: ReturnType<typeof estimateShoulderPosition>;
  issues: string[];
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  recommendations: string[];
}

export async function analyzePose(imageElement: HTMLImageElement): Promise<PoseAnalysis | null> {
  const landmarks = await detectBodyLandmarks(imageElement);

  if (!landmarks) {
    return null;
  }

  const shoulders = estimateShoulderPosition(landmarks);
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Análise de qualidade
  if (!landmarks.isFrontal) {
    issues.push('Pose não é frontal (corpo em ângulo 3/4)');
    recommendations.push('Solicite foto frontal com corpo voltado para câmera');
  }

  if (landmarks.headTilt > 5) {
    issues.push(`Cabeça inclinada ${landmarks.headTilt.toFixed(1)}°`);
    recommendations.push('Alinhe a cabeça horizontalmente');
  }

  if (landmarks.confidence < 0.7) {
    issues.push('Baixa confiança na detecção facial');
    recommendations.push('Use foto com melhor iluminação e resolução');
  }

  // Determinar qualidade geral
  let quality: PoseAnalysis['quality'];
  if (issues.length === 0 && landmarks.confidence > 0.9) {
    quality = 'excellent';
  } else if (issues.length <= 1 && landmarks.confidence > 0.7) {
    quality = 'good';
  } else if (issues.length <= 2) {
    quality = 'acceptable';
  } else {
    quality = 'poor';
  }

  return {
    landmarks,
    shoulders,
    issues,
    quality,
    recommendations
  };
}
