import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

let faceDetector: FaceDetector | null = null;

/**
 * Inicializa o detector de faces MediaPipe.
 * Deve ser chamado uma vez antes de usar a normalização.
 */
export async function initializeFaceDetector(): Promise<void> {
  if (faceDetector) return;

  try {
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
    );

    faceDetector = await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
        delegate: 'GPU'
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5
    });
  } catch (error) {
    console.error('Erro ao inicializar detector facial:', error);
    throw new Error('Falha ao inicializar MediaPipe');
  }
}

interface FaceMetrics {
  eyeDistance: number;
  faceCenter: { x: number; y: number };
  eyesCenterY: number;
  faceWidth: number;
  faceHeight: number;
}

/**
 * Detecta métricas faciais de uma imagem.
 */
async function detectFaceMetrics(imageElement: HTMLImageElement): Promise<FaceMetrics | null> {
  if (!faceDetector) {
    await initializeFaceDetector();
  }

  const detections = faceDetector!.detect(imageElement);

  if (!detections.detections || detections.detections.length === 0) {
    console.warn('Nenhuma face detectada');
    return null;
  }

  const detection: Detection = detections.detections[0];
  const keypoints = detection.keypoints;

  if (!keypoints || keypoints.length < 2) {
    console.warn('Landmarks insuficientes detectados');
    return null;
  }

  // MediaPipe BlazeFace keypoints:
  // 0: Olho direito, 1: Olho esquerdo, 2-5: outros pontos faciais
  const rightEye = keypoints[0];
  const leftEye = keypoints[1];

  const eyeDistance = Math.sqrt(
    Math.pow((rightEye.x - leftEye.x) * imageElement.width, 2) +
    Math.pow((rightEye.y - leftEye.y) * imageElement.height, 2)
  );

  const faceCenterX = ((rightEye.x + leftEye.x) / 2) * imageElement.width;
  const faceCenterY = ((rightEye.y + leftEye.y) / 2) * imageElement.height;

  const bbox = detection.boundingBox;
  const faceWidth = bbox ? bbox.width * imageElement.width : eyeDistance * 3;
  const faceHeight = bbox ? bbox.height * imageElement.height : eyeDistance * 4;

  return {
    eyeDistance,
    faceCenter: { x: faceCenterX, y: faceCenterY },
    eyesCenterY: faceCenterY,
    faceWidth,
    faceHeight
  };
}

interface NormalizationConfig {
  targetEyeDistance: number;
  targetEyeYPercent: number;
  targetWidth: number;
  targetHeight: number;
  backgroundColor?: string;
}

/**
 * Normaliza uma imagem para ter geometria facial padronizada.
 * @param imageBase64 - Imagem em base64 (sem data URL prefix)
 * @param config - Configuração de normalização
 * @returns Base64 da imagem normalizada
 */
export async function normalizeHeadshot(
  imageBase64: string,
  config: NormalizationConfig
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const cleanBase64 = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    img.onload = async () => {
      try {
        const metrics = await detectFaceMetrics(img);

        if (!metrics) {
          console.warn('Normalização ignorada: face não detectada');
          resolve(imageBase64);
          return;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Falha ao criar contexto canvas'));
          return;
        }

        canvas.width = config.targetWidth;
        canvas.height = config.targetHeight;

        // Preencher fundo
        ctx.fillStyle = config.backgroundColor || '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calcular escala baseada na distância entre os olhos
        const scale = config.targetEyeDistance / metrics.eyeDistance;

        // Calcular posição alvo dos olhos
        const targetEyeY = canvas.height * config.targetEyeYPercent;
        const targetCenterX = canvas.width / 2;

        // Calcular offset de tradução
        const translateX = targetCenterX - metrics.faceCenter.x * scale;
        const translateY = targetEyeY - metrics.eyesCenterY * scale;

        // Aplicar transformações
        ctx.save();
        ctx.translate(translateX, translateY);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        ctx.restore();

        const resultBase64 = canvas.toDataURL('image/png').split(',')[1];
        resolve(resultBase64);
      } catch (error) {
        console.error('Erro na normalização:', error);
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = cleanBase64;
  });
}

/**
 * Calcula configuração automática de normalização baseada em múltiplas imagens.
 * Usa a mediana das métricas para evitar outliers.
 */
export async function calculateOptimalNormalization(
  images: string[],
  targetWidth: number,
  targetHeight: number
): Promise<NormalizationConfig> {
  const allMetrics: FaceMetrics[] = [];

  for (const imageBase64 of images) {
    const img = new Image();
    const cleanBase64 = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/png;base64,${imageBase64}`;

    await new Promise<void>((resolve, reject) => {
      img.onload = async () => {
        try {
          const metrics = await detectFaceMetrics(img);
          if (metrics) allMetrics.push(metrics);
          resolve();
        } catch (err) {
          console.warn('Erro ao processar imagem:', err);
          resolve();
        }
      };
      img.onerror = () => resolve();
      img.src = cleanBase64;
    });
  }

  if (allMetrics.length === 0) {
    // Fallback: usar valores padrão
    return {
      targetEyeDistance: targetWidth * 0.25,
      targetEyeYPercent: 0.35,
      targetWidth,
      targetHeight
    };
  }

  // Calcular mediana da distância entre olhos
  const eyeDistances = allMetrics.map(m => m.eyeDistance).sort((a, b) => a - b);
  const medianEyeDistance = eyeDistances[Math.floor(eyeDistances.length / 2)];

  // Usar 25% da largura da imagem como alvo
  const targetEyeDistance = targetWidth * 0.25;

  return {
    targetEyeDistance,
    targetEyeYPercent: 0.35, // Olhos a 35% do topo
    targetWidth,
    targetHeight
  };
}

/**
 * Normaliza um lote de imagens para ter geometria consistente.
 */
export async function normalizeBatch(
  images: string[],
  targetWidth: number = 1024,
  targetHeight: number = 1024,
  backgroundColor?: string
): Promise<string[]> {
  if (images.length === 0) return [];

  // Inicializar detector
  await initializeFaceDetector();

  // Calcular configuração ótima
  const config = await calculateOptimalNormalization(images, targetWidth, targetHeight);
  if (backgroundColor) {
    config.backgroundColor = backgroundColor;
  }

  // Normalizar todas as imagens
  const normalized: string[] = [];
  for (const image of images) {
    try {
      const result = await normalizeHeadshot(image, config);
      normalized.push(result);
    } catch (error) {
      console.error('Erro ao normalizar imagem:', error);
      normalized.push(image);
    }
  }

  return normalized;
}
