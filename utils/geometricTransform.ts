/**
 * GEOMETRIC TRANSFORMATION ENGINE
 * Sistema de transformação forçada usado por empresas profissionais
 * Garante que TODAS as imagens se encaixem perfeitamente no template
 */

import type { FullBodyLandmarks } from './poseDetector';
import type { CorporateTemplate } from './corporateTemplate';
import { getAbsoluteAnchorPoints } from './corporateTemplate';

/**
 * Calcula matriz de transformação 2D necessária para alinhar a imagem ao template
 */
interface TransformMatrix {
  scale: number;
  rotation: number; // em radianos
  translateX: number;
  translateY: number;
}

/**
 * Calcula a transformação necessária para alinhar os landmarks ao template
 */
export function calculateTransform(
  landmarks: FullBodyLandmarks,
  template: CorporateTemplate
): TransformMatrix {
  const anchors = getAbsoluteAnchorPoints(template);

  // PASSO 1: Calcular rotação necessária para endireitar a cabeça
  const rotation = -landmarks.headRotation * (Math.PI / 180); // Converter para radianos e inverter

  // PASSO 2: Calcular escala baseada em MÚLTIPLOS pontos (não só olhos)
  // Usar a distância entre olhos como referência primária
  const currentEyeDistance = landmarks.eyeDistance;

  // Distância ideal entre olhos no template (25% da largura)
  const targetEyeDistance = template.width * 0.25;

  // Escala baseada nos olhos
  const eyeScale = targetEyeDistance / currentEyeDistance;

  // Validação secundária: tamanho da cabeça não deve ficar muito grande/pequeno
  // Cabeça deve ocupar ~35-45% da altura do canvas
  const targetHeadHeight = template.height * 0.40;
  const headScale = targetHeadHeight / landmarks.faceHeight;

  // Usar média ponderada (mais peso aos olhos)
  const scale = eyeScale * 0.7 + headScale * 0.3;

  // PASSO 3: Calcular translação necessária
  // Após rotação e escala, mover o centro dos olhos para a posição alvo

  // Posição alvo do centro dos olhos
  const targetX = anchors.centerX;
  const targetY = anchors.eyesY;

  // Após escala, onde os olhos estarão?
  const scaledEyesX = landmarks.eyesCenter.x * scale;
  const scaledEyesY = landmarks.eyesCenter.y * scale;

  // Translação necessária
  const translateX = targetX - scaledEyesX;
  const translateY = targetY - scaledEyesY;

  return {
    scale,
    rotation,
    translateX,
    translateY
  };
}

/**
 * Aplica a transformação geométrica a uma imagem
 */
export async function applyGeometricTransform(
  imageElement: HTMLImageElement,
  transform: TransformMatrix,
  template: CorporateTemplate,
  backgroundColor: string = '#F5F5F5'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Falha ao criar contexto canvas'));
      return;
    }

    // Configurar canvas com dimensões do template
    canvas.width = template.width;
    canvas.height = template.height;

    // Preencher fundo
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Aplicar transformações na ordem correta:
    // 1. Translate para centro
    // 2. Rotate
    // 3. Scale
    // 4. Translate para posição final

    ctx.save();

    // Mover para onde queremos que o centro dos olhos fique
    const anchors = getAbsoluteAnchorPoints(template);
    ctx.translate(anchors.centerX, anchors.eyesY);

    // Aplicar rotação
    ctx.rotate(transform.rotation);

    // Aplicar escala
    ctx.scale(transform.scale, transform.scale);

    // Desenhar imagem centralizada no ponto de origem (que agora é o centro dos olhos)
    const offsetX = -imageElement.naturalWidth / 2;
    const offsetY = -imageElement.naturalHeight / 2;

    // Ajuste adicional baseado em onde os olhos estão na imagem original
    // (isso é calculado no transform)
    ctx.translate(transform.translateX / transform.scale, transform.translateY / transform.scale);

    ctx.drawImage(imageElement, offsetX, offsetY);

    ctx.restore();

    const resultBase64 = canvas.toDataURL('image/png').split(',')[1];
    resolve(resultBase64);
  });
}

/**
 * Versão melhorada que calcula transformação baseada em landmarks
 */
export async function transformToTemplate(
  imageElement: HTMLImageElement,
  landmarks: FullBodyLandmarks,
  template: CorporateTemplate,
  backgroundColor: string = '#F5F5F5'
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Falha ao criar contexto canvas'));
      return;
    }

    canvas.width = template.width;
    canvas.height = template.height;

    // Preencher fundo
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const anchors = getAbsoluteAnchorPoints(template);

    // Calcular transformações necessárias
    const targetEyeDistance = template.width * 0.25;
    const scale = targetEyeDistance / landmarks.eyeDistance;

    // Calcular rotação (inverter o ângulo detectado)
    const rotation = -landmarks.headRotation * (Math.PI / 180);

    // Posição de destino dos olhos
    const targetEyesX = anchors.centerX;
    const targetEyesY = anchors.eyesY;

    ctx.save();

    // Mover para o ponto de destino
    ctx.translate(targetEyesX, targetEyesY);

    // Rotacionar
    ctx.rotate(rotation);

    // Escalar
    ctx.scale(scale, scale);

    // Desenhar imagem com centro dos olhos na origem
    ctx.drawImage(
      imageElement,
      -landmarks.eyesCenter.x,
      -landmarks.eyesCenter.y
    );

    ctx.restore();

    const resultBase64 = canvas.toDataURL('image/png').split(',')[1];
    resolve(resultBase64);
  });
}

/**
 * Aplica suavização nas bordas para transições mais naturais
 */
export function applyVignette(
  canvas: HTMLCanvasElement,
  intensity: number = 0.3
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    canvas.height * 0.3,
    canvas.width / 2,
    canvas.height / 2,
    canvas.height * 0.7
  );

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, `rgba(0, 0, 0, ${intensity})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
