/**
 * MEDIAPIPE POSE LANDMARKER - FULL BODY DETECTION
 * Detecta 33 pontos corporais incluindo ombros, olhos, nariz, quadris
 * Sistema usado por empresas profissionais de headshots corporativos
 */

import { PoseLandmarker, FilesetResolver, PoseLandmarkerResult } from '@mediapipe/tasks-vision';

let poseLandmarker: PoseLandmarker | null = null;

/**
 * Inicializa o MediaPipe Pose Landmarker
 */
export async function initializePoseDetector(): Promise<void> {
  if (poseLandmarker) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.tflite',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    console.log('✅ MediaPipe Pose Landmarker inicializado (33 pontos corporais)');
  } catch (error) {
    console.error('❌ Erro ao inicializar Pose Landmarker:', error);
    throw new Error('Falha ao inicializar MediaPipe Pose');
  }
}

/**
 * MediaPipe Pose Landmarks (33 pontos)
 * Principais para headshots:
 * 0: Nariz
 * 1: Olho interno esquerdo
 * 2: Olho esquerdo
 * 3: Olho externo esquerdo
 * 4: Olho interno direito
 * 5: Olho direito
 * 6: Olho externo direito
 * 7: Orelha esquerda
 * 8: Orelha direita
 * 9: Boca esquerda
 * 10: Boca direita
 * 11: Ombro esquerdo ⭐
 * 12: Ombro direito ⭐
 */

export interface FullBodyLandmarks {
  // Face
  nose: { x: number; y: number };
  leftEye: { x: number; y: number };
  rightEye: { x: number; y: number };
  leftMouth: { x: number; y: number };
  rightMouth: { x: number; y: number };

  // Shoulders (REAL, não estimados)
  leftShoulder: { x: number; y: number };
  rightShoulder: { x: number; y: number };

  // Calculados
  eyesCenter: { x: number; y: number };
  shouldersCenter: { x: number; y: number };
  eyeDistance: number;
  shoulderWidth: number;

  // Ângulos
  headRotation: number; // rotação da linha dos olhos (graus)
  shoulderRotation: number; // rotação da linha dos ombros (graus)
  headTilt: number; // inclinação da cabeça

  // Métricas
  eyeToShoulderDistance: number; // distância vertical olhos → ombros
  faceWidth: number;
  headSize: number;

  // Qualidade
  confidence: number;
  isFrontal: boolean; // true se ombros estão nivelados (não em ângulo 3/4)
  isWellAligned: boolean; // true se cabeça e ombros estão alinhados

  // Dados brutos
  allLandmarks: Array<{ x: number; y: number; z: number }>;
}

/**
 * Detecta todos os 33 pontos corporais usando MediaPipe Pose
 */
export async function detectBodyLandmarks(
  imageElement: HTMLImageElement
): Promise<FullBodyLandmarks | null> {
  if (!poseLandmarker) {
    await initializePoseDetector();
  }

  try {
    const result: PoseLandmarkerResult = poseLandmarker!.detect(imageElement);

    if (!result.landmarks || result.landmarks.length === 0) {
      console.warn('❌ Nenhuma pose detectada na imagem');
      return null;
    }

    const landmarks = result.landmarks[0]; // Primeira (e única) pessoa detectada
    const imgWidth = imageElement.naturalWidth;
    const imgHeight = imageElement.naturalHeight;

    // Converter landmarks normalizados [0-1] para pixels
    const getPoint = (idx: number) => ({
      x: landmarks[idx].x * imgWidth,
      y: landmarks[idx].y * imgHeight,
      z: landmarks[idx].z
    });

    // Extrair pontos chave
    const nose = getPoint(0);
    const leftEyeInner = getPoint(1);
    const leftEye = getPoint(2);
    const rightEyeInner = getPoint(4);
    const rightEye = getPoint(5);
    const leftMouth = getPoint(9);
    const rightMouth = getPoint(10);
    const leftShoulder = getPoint(11); // ⭐ OMBRO REAL
    const rightShoulder = getPoint(12); // ⭐ OMBRO REAL

    // Calcular centro dos olhos
    const eyesCenter = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2
    };

    // Calcular centro dos ombros
    const shouldersCenter = {
      x: (leftShoulder.x + rightShoulder.x) / 2,
      y: (leftShoulder.y + rightShoulder.y) / 2
    };

    // Distância entre olhos
    const eyeDistance = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );

    // Largura dos ombros
    const shoulderWidth = Math.sqrt(
      Math.pow(rightShoulder.x - leftShoulder.x, 2) + Math.pow(rightShoulder.y - leftShoulder.y, 2)
    );

    // Rotação da linha dos olhos (em graus)
    const headRotation =
      Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x) * (180 / Math.PI);

    // Rotação da linha dos ombros (em graus)
    const shoulderRotation =
      Math.atan2(rightShoulder.y - leftShoulder.y, rightShoulder.x - leftShoulder.x) * (180 / Math.PI);

    // Inclinação da cabeça
    const headTilt = Math.abs(headRotation);

    // Distância vertical olhos → ombros
    const eyeToShoulderDistance = shouldersCenter.y - eyesCenter.y;

    // Largura da face (baseado nos olhos)
    const faceWidth = eyeDistance * 2.5;

    // Tamanho da cabeça (estimado)
    const headSize = eyeToShoulderDistance * 0.6;

    // Verificar se a pose é frontal (ombros nivelados)
    const isFrontal = Math.abs(shoulderRotation) < 10; // Tolerância de 10 graus

    // Verificar alinhamento cabeça-ombros
    const rotationDiff = Math.abs(headRotation - shoulderRotation);
    const isWellAligned = rotationDiff < 5; // Diferença menor que 5 graus

    // Confiança geral (se disponível)
    const confidence = result.worldLandmarks?.[0]?.[0]?.visibility || 0.9;

    return {
      nose,
      leftEye,
      rightEye,
      leftMouth,
      rightMouth,
      leftShoulder,
      rightShoulder,
      eyesCenter,
      shouldersCenter,
      eyeDistance,
      shoulderWidth,
      headRotation,
      shoulderRotation,
      headTilt,
      eyeToShoulderDistance,
      faceWidth,
      headSize,
      confidence,
      isFrontal,
      isWellAligned,
      allLandmarks: landmarks.map(l => ({ x: l.x * imgWidth, y: l.y * imgHeight, z: l.z }))
    };
  } catch (error) {
    console.error('❌ Erro na detecção de pose:', error);
    return null;
  }
}

/**
 * Análise completa da pose para validação
 */
export interface PoseAnalysis {
  landmarks: FullBodyLandmarks;
  issues: string[];
  quality: 'excellent' | 'good' | 'acceptable' | 'poor';
  recommendations: string[];
}

export async function analyzePose(imageElement: HTMLImageElement): Promise<PoseAnalysis | null> {
  const landmarks = await detectBodyLandmarks(imageElement);

  if (!landmarks) {
    return null;
  }

  const issues: string[] = [];
  const recommendations: string[] = [];

  // Validação 1: Pose frontal
  if (!landmarks.isFrontal) {
    issues.push(`Corpo em ângulo (ombros rotacionados ${landmarks.shoulderRotation.toFixed(1)}°)`);
    recommendations.push('Solicite foto frontal com ombros paralelos à câmera');
  }

  // Validação 2: Alinhamento cabeça-ombros
  if (!landmarks.isWellAligned) {
    const diff = Math.abs(landmarks.headRotation - landmarks.shoulderRotation);
    issues.push(`Desalinhamento entre cabeça e corpo (${diff.toFixed(1)}° de diferença)`);
    recommendations.push('Alinhe a cabeça com os ombros');
  }

  // Validação 3: Inclinação da cabeça
  if (landmarks.headTilt > 5) {
    issues.push(`Cabeça inclinada ${landmarks.headTilt.toFixed(1)}°`);
    recommendations.push('Endireite a cabeça horizontalmente');
  }

  // Validação 4: Inclinação dos ombros
  if (Math.abs(landmarks.shoulderRotation) > 5) {
    issues.push(`Ombros desnivelados (${Math.abs(landmarks.shoulderRotation).toFixed(1)}°)`);
    recommendations.push('Nivele os ombros horizontalmente');
  }

  // Validação 5: Confiança da detecção
  if (landmarks.confidence < 0.7) {
    issues.push('Baixa confiança na detecção');
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
    issues,
    quality,
    recommendations
  };
}

/**
 * Valida se os ombros foram detectados corretamente
 */
export function validateShoulderDetection(landmarks: FullBodyLandmarks): boolean {
  // Verificar se os ombros estão em posições plausíveis
  const shouldersBelowEyes = landmarks.shouldersCenter.y > landmarks.eyesCenter.y;
  const reasonableDistance = landmarks.eyeToShoulderDistance > landmarks.eyeDistance * 1.5;
  const reasonableWidth = landmarks.shoulderWidth > landmarks.eyeDistance * 1.5;

  return shouldersBelowEyes && reasonableDistance && reasonableWidth;
}
