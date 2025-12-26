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

    const resultBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
    resolve(resultBase64);
  });
}

/**
 * PATCH 3: Transformação com âncora dupla (olhos + ombros)
 * Usa dois pontos para definir rotação, escala e translação com mais precisão
 */
export async function transformToTemplateWithDualAnchor(
  imageElement: HTMLImageElement,
  landmarks: FullBodyLandmarks,
  template: CorporateTemplate,
  fixedScale: number,
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

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const anchors = getAbsoluteAnchorPoints(template);

    // ESTRATÉGIA DUAL-ANCHOR:
    // 1. Calcular vetor source: olhos → ombros
    // 2. Calcular vetor target: posição alvo dos olhos → posição alvo dos ombros
    // 3. Calcular rotação necessária para alinhar os vetores
    // 4. Aplicar escala baseada na distância entre os pontos

    const srcEyesX = landmarks.eyesCenter.x;
    const srcEyesY = landmarks.eyesCenter.y;
    const srcShouldersX = landmarks.shouldersCenter.x;
    const srcShouldersY = landmarks.shouldersCenter.y;

    // Vetor source (olhos → ombros)
    const srcVectorX = srcShouldersX - srcEyesX;
    const srcVectorY = srcShouldersY - srcEyesY;
    const srcDistance = Math.sqrt(srcVectorX * srcVectorX + srcVectorY * srcVectorY);

    // Vetor target (posição alvo)
    const targetEyesX = anchors.centerX;
    const targetEyesY = anchors.eyesY;
    const targetShouldersX = anchors.centerX; // Ombros devem estar centrados
    const targetShouldersY = anchors.shouldersY;

    const targetVectorX = targetShouldersX - targetEyesX;
    const targetVectorY = targetShouldersY - targetEyesY;
    const targetDistance = Math.sqrt(targetVectorX * targetVectorX + targetVectorY * targetVectorY);

    // Calcular ângulo de rotação necessário
    const srcAngle = Math.atan2(srcVectorY, srcVectorX);
    const targetAngle = Math.atan2(targetVectorY, targetVectorX);
    const rotation = targetAngle - srcAngle;

    // Usar escala fixa (já calculada pelo batch)
    const scale = fixedScale;

    console.log('🎯 Dual-anchor transform:', {
      srcAngle: (srcAngle * 180 / Math.PI).toFixed(1) + '°',
      targetAngle: (targetAngle * 180 / Math.PI).toFixed(1) + '°',
      rotation: (rotation * 180 / Math.PI).toFixed(1) + '°',
      scale: scale.toFixed(4)
    });

    ctx.save();

    // Aplicar transformações
    // 1. Mover para posição alvo dos olhos
    ctx.translate(targetEyesX, targetEyesY);

    // 2. Rotacionar
    ctx.rotate(rotation);

    // 3. Escalar
    ctx.scale(scale, scale);

    // 4. Desenhar imagem com olhos na origem
    ctx.translate(-srcEyesX, -srcEyesY);
    ctx.drawImage(imageElement, 0, 0);

    ctx.restore();

    const resultBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
    resolve(resultBase64);
  });
}

/**
 * Versão com ESCALA FIXA para garantir padronização absoluta
 */
export async function transformToTemplateWithFixedScale(
  imageElement: HTMLImageElement,
  landmarks: FullBodyLandmarks,
  template: CorporateTemplate,
  fixedScale: number,
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

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();

    const anchors = getAbsoluteAnchorPoints(template);

    // Usar ESCALA FIXA (não calcular individualmente)
    const scale = fixedScale;

    // Calcular transformação para alinhar olhos
    const srcEyesX = landmarks.eyesCenter.x;
    const srcEyesY = landmarks.eyesCenter.y;

    // ORDEM CORRETA DAS TRANSFORMAÇÕES (para evitar deslocamento na rotação):
    // 1. Transladar para levar os olhos para a origem
    ctx.translate(anchors.centerX, anchors.eyesY);

    // 2. Rotação (agora em torno da posição final dos olhos)
    if (Math.abs(landmarks.headRotation) > 0.5) {
      ctx.rotate(-landmarks.headRotation * Math.PI / 180);
    }

    // 3. Escalar
    ctx.scale(scale, scale);

    // 4. Transladar de volta (agora no sistema escalado e rotacionado)
    ctx.translate(-srcEyesX, -srcEyesY);

    // 5. Desenhar a imagem
    ctx.drawImage(imageElement, 0, 0);
    ctx.restore();

    const resultBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
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

    const resultBase64 = canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
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
