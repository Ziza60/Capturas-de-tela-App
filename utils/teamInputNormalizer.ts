/**
 * TEAM INPUT NORMALIZER
 * Normaliza fotos ANTES de enviar para a IA
 * Garante enquadramento determinístico e consistente para modo equipe
 */

import { detectBodyLandmarks, initializePoseDetector, validateShoulderDetection, type FullBodyLandmarks } from './poseDetector';
import type { UploadedFile } from '../types';

/**
 * Resultado da validação de normalização
 */
export interface NormalizationValidationResult {
  hasFramingErrors: boolean;
  reasons: string[];
}

/**
 * Valida se a normalização produziu erros de enquadramento
 * que precisam ser corrigidos pela IA
 */
export function validateNormalizationForBatch(
  landmarks: FullBodyLandmarks | null,
  imageWidth: number,
  imageHeight: number
): NormalizationValidationResult {
  const reasons: string[] = [];

  if (!landmarks) {
    // Sem landmarks, não podemos validar - assumir que está OK
    return { hasFramingErrors: false, reasons: [] };
  }

  // 1. Verificar se cabeça ocupa mais de 45% da altura
  const headHeight = Math.abs(landmarks.noseTip.y - landmarks.eyesCenter.y) * 2.5; // Estimativa da altura da cabeça
  const headHeightRatio = headHeight / imageHeight;

  if (headHeightRatio > 0.45) {
    reasons.push('Head occupying more than 45% of image height');
  }

  // 2. Verificar se ombros estão cortados ou ausentes
  const shouldersValid = validateShoulderDetection(landmarks);
  if (!shouldersValid) {
    reasons.push('Missing or cropped shoulders');
  }

  // 3. Verificar torso cortado agressivamente
  // Se os ombros estão muito próximos da borda inferior
  const shoulderY = (landmarks.leftShoulder.y + landmarks.rightShoulder.y) / 2;
  const bottomMargin = imageHeight - shoulderY;
  const bottomMarginRatio = bottomMargin / imageHeight;

  if (bottomMarginRatio < 0.1) { // Menos de 10% de margem inferior
    reasons.push('Unnatural torso cutoff');
  }

  // 4. Verificar perspectiva extrema de selfie
  // Se a cabeça está muito rotacionada ou inclinada
  if (Math.abs(landmarks.headRotation) > 15) {
    reasons.push('Extreme selfie perspective');
  }

  return {
    hasFramingErrors: reasons.length > 0,
    reasons
  };
}

/**
 * Configuração do canvas de input normalizado
 */
const NORMALIZED_INPUT_CONFIG = {
  width: 1024,
  height: 1024,
  eyesY: 0.32, // Olhos a 32% da altura (um pouco mais alto para dar espaço aos ombros)
  backgroundColor: '#F5F5F5'
};

/**
 * Normaliza a foto de entrada ANTES de enviar para a IA
 * Garante enquadramento determinístico para geração consistente
 */
export async function preNormalizeTeamInput(
  file: UploadedFile
): Promise<UploadedFile> {
  console.log('🔧 Pré-normalizando input para equipe:', file.name);

  return new Promise((resolve) => {
    const img = new Image();
    const cleanBase64 = file.base64.startsWith('data:')
      ? file.base64
      : `data:image/${file.mimeType.split('/')[1]};base64,${file.base64}`;

    img.onload = async () => {
      try {
        // Inicializar detector se necessário
        await initializePoseDetector();

        // Detectar landmarks
        const landmarks = await detectBodyLandmarks(img);

        if (!landmarks) {
          console.warn('⚠️ Detecção falhou - usando crop central seguro');
          const fallbackResult = await applySafeCenterCrop(img, file);
          resolve(fallbackResult);
          return;
        }

        // Validar ombros
        const shouldersValid = validateShoulderDetection(landmarks);
        console.log('📊 Detecção de ombros:', shouldersValid ? '✅ Válida' : '⚠️ Inválida');

        // Aplicar normalização determinística
        const normalizedBase64 = await applyDeterministicFraming(img, landmarks);

        // Retornar novo UploadedFile normalizado
        resolve({
          ...file,
          base64: normalizedBase64,
          mimeType: 'image/jpeg'
        });

      } catch (error) {
        console.error('❌ Erro na pré-normalização:', error);
        // Fallback: retornar original
        resolve(file);
      }
    };

    img.onerror = () => {
      console.error('❌ Erro ao carregar imagem');
      resolve(file);
    };

    img.src = cleanBase64;
  });
}

/**
 * Aplica enquadramento determinístico baseado em landmarks
 */
async function applyDeterministicFraming(
  img: HTMLImageElement,
  landmarks: FullBodyLandmarks
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Falha ao criar canvas');
  }

  // Configurar canvas padronizado
  canvas.width = NORMALIZED_INPUT_CONFIG.width;
  canvas.height = NORMALIZED_INPUT_CONFIG.height;

  // Fundo neutro
  ctx.fillStyle = NORMALIZED_INPUT_CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calcular posições de destino
  const targetEyesY = canvas.height * NORMALIZED_INPUT_CONFIG.eyesY;
  const targetCenterX = canvas.width / 2;

  // Calcular escala baseada na distância entre olhos
  // Queremos que os olhos ocupem ~25% da largura do canvas
  const targetEyeDistance = canvas.width * 0.25;
  const scale = targetEyeDistance / landmarks.eyeDistance;

  // Calcular rotação (inverter para endireitar)
  const rotation = -landmarks.headRotation * (Math.PI / 180);

  // Aplicar transformações
  ctx.save();

  // 1. Mover para posição alvo dos olhos
  ctx.translate(targetCenterX, targetEyesY);

  // 2. Rotacionar (endireitar cabeça)
  if (Math.abs(landmarks.headRotation) > 0.5) {
    ctx.rotate(rotation);
  }

  // 3. Escalar
  ctx.scale(scale, scale);

  // 4. Desenhar imagem com olhos na origem
  ctx.drawImage(
    img,
    -landmarks.eyesCenter.x,
    -landmarks.eyesCenter.y
  );

  ctx.restore();

  // Retornar base64 (apenas a string, sem prefixo)
  return canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
}

/**
 * Fallback: crop central seguro quando detecção falhar
 */
async function applySafeCenterCrop(
  img: HTMLImageElement,
  originalFile: UploadedFile
): Promise<UploadedFile> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return originalFile;
  }

  canvas.width = NORMALIZED_INPUT_CONFIG.width;
  canvas.height = NORMALIZED_INPUT_CONFIG.height;

  ctx.fillStyle = NORMALIZED_INPUT_CONFIG.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calcular crop centralizado
  const sourceAspect = img.naturalWidth / img.naturalHeight;
  const targetAspect = canvas.width / canvas.height;

  let sourceWidth = img.naturalWidth;
  let sourceHeight = img.naturalHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceAspect > targetAspect) {
    // Imagem mais larga - crop horizontal
    sourceWidth = img.naturalHeight * targetAspect;
    sourceX = (img.naturalWidth - sourceWidth) / 2;
  } else {
    // Imagem mais alta - crop vertical (favorecendo topo para capturar face)
    sourceHeight = img.naturalWidth / targetAspect;
    sourceY = 0; // Começar do topo
  }

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    0, 0, canvas.width, canvas.height
  );

  const normalizedBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];

  return {
    ...originalFile,
    base64: normalizedBase64,
    mimeType: 'image/jpeg'
  };
}
