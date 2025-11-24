
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon, LoadingSpinner, CameraIcon } from './icons';
import type { UploadedFile } from '../types';

interface CameraCaptureProps {
  onClose: () => void;
  onPhotoCapture: (file: UploadedFile) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onClose, onPhotoCapture }) => {
  // Estado para controlar a tela de instrução prévia
  const [showPermissionIntro, setShowPermissionIntro] = useState(true);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); // user = frontal, environment = traseira
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async () => {
    stopStream(); // Parar stream anterior se houver
    setError(null);

    // 1. Verificação de Suporte
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Seu navegador não suporta acesso à câmera ou o site não está seguro (Requer HTTPS).");
        return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
            facingMode: facingMode,
            width: { ideal: 1920 }, // Tenta Full HD
            height: { ideal: 1080 }
        },
        audio: false,
      });
      
      setStream(mediaStream);
      // Pequeno delay para garantir que o elemento video já renderizou
      setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
      }, 100);
      
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      
      // Fallback: Se falhar ao pedir 'environment' (traseira), tenta qualquer uma
      if (facingMode === 'environment') {
          try {
             const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
             setStream(fallbackStream);
             if (videoRef.current) videoRef.current.srcObject = fallbackStream;
             return;
          } catch (e) { /* ignore */ }
      }

      // Mensagem amigável em Português
      setError("Não foi possível acessar a câmera. Verifique se você clicou em 'Permitir' (Allow) no aviso do navegador.");
    }
  }, [facingMode, stopStream]);

  // Remover startCamera do useEffect inicial para não disparar o popup do sistema imediatamente.
  // O usuário deve clicar no botão da tela de instrução primeiro.
  useEffect(() => {
      return () => {
          stopStream();
      };
  }, [stopStream]);

  // Trigger manual após a tela de instrução
  const handleGrantPermission = () => {
      setShowPermissionIntro(false);
      startCamera();
  };

  const toggleCamera = () => {
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
      // Re-inicia a câmera com o novo modo (se já tiver passado da intro)
      if (!showPermissionIntro) {
          // Precisamos esperar o state atualizar, então usamos um useEffect ou forçamos a chamada
          // Como startCamera depende de facingMode no useCallback, ele será recriado.
          // Vamos forçar um re-render efetivo chamando startCamera num timeout curto
          setTimeout(() => startCamera(), 50);
      }
  };
  
  // Re-acionar startCamera quando facingMode muda, mas APENAS se já tivermos permissão
  useEffect(() => {
      if (!showPermissionIntro && !capturedImage && !error) {
          startCamera();
      }
  }, [facingMode, showPermissionIntro]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        // CORREÇÃO DO ESPELHAMENTO:
        if (facingMode === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }
        
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        if (facingMode === 'user') {
             context.setTransform(1, 0, 0, 1, 0, 0);
        }

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCapturedImage(dataUrl);
        stopStream(); // Para a câmera para economizar bateria enquanto visualiza a foto
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setError(null);
    startCamera();
  };
  
  const handleUsePhoto = () => {
    if (capturedImage) {
        stopStream();
        const base64 = capturedImage.split(',')[1];
        onPhotoCapture({
            base64,
            mimeType: 'image/jpeg',
            name: `foto-${Date.now()}.jpg`
        })
    }
  };

  // --- TELA DE INSTRUÇÃO PRÉVIA (PORTUGUÊS) ---
  if (showPermissionIntro) {
      return (
        <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col items-center justify-center p-6 h-[100dvh] w-screen">
             <div className="w-full max-w-sm bg-gray-800 rounded-2xl p-6 shadow-2xl border border-gray-700 text-center">
                 <div className="bg-cyan-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <CameraIcon className="w-8 h-8 text-cyan-400" />
                 </div>
                 <h2 className="text-xl font-bold text-white mb-3">Permissão de Câmera</h2>
                 <p className="text-gray-300 text-sm mb-6 leading-relaxed">
                     Para tirar sua foto, o navegador solicitará acesso à câmera. 
                     <br/><br/>
                     Na próxima janela que aparecer (pode estar em inglês), por favor clique em:
                     <br/>
                     <span className="font-bold text-cyan-400">"Permitir"</span> ou <span className="font-bold text-cyan-400">"Allow"</span>.
                 </p>
                 
                 <button 
                    onClick={handleGrantPermission}
                    className="w-full py-3.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-cyan-900/20 mb-3"
                 >
                    Entendi, Ativar Câmera
                 </button>
                 
                 <button 
                    onClick={onClose}
                    className="w-full py-3 text-gray-400 font-medium hover:text-white transition-colors"
                 >
                    Cancelar
                 </button>
             </div>
        </div>
      );
  }

  // --- TELA DA CÂMERA (APÓS INSTRUÇÃO) ---
  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col h-[100dvh] w-screen overflow-hidden">
      
      {/* HEADER */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent pointer-events-none">
            <button 
                onClick={toggleCamera} 
                className="pointer-events-auto text-white bg-gray-800/60 backdrop-blur-md rounded-full p-2.5 hover:bg-gray-700/80 flex items-center gap-2 transition-colors border border-white/10"
            >
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                 </svg>
                 <span className="text-sm font-medium hidden sm:inline">Virar Câmera</span>
            </button>
            <button 
                onClick={() => { stopStream(); onClose(); }} 
                className="pointer-events-auto text-white bg-red-600/80 backdrop-blur-md rounded-full p-2.5 hover:bg-red-700 transition-colors shadow-lg"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
      </div>

      {/* ÁREA DE CONTEÚDO */}
      <div className="relative flex-grow bg-black flex flex-col justify-center overflow-hidden">
        
        {error ? (
            <div className="p-8 text-center max-w-md mx-auto">
                <div className="bg-red-900/20 p-4 rounded-full inline-block mb-4">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                     </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Acesso Negado</h3>
                <p className="text-gray-300 mb-6">{error}</p>
                <button onClick={() => { stopStream(); onClose(); }} className="px-6 py-3 bg-gray-800 text-white rounded-lg w-full font-semibold border border-gray-700">Voltar</button>
            </div>
        ) : (
          <>
             {/* VÍDEO PREVIEW */}
             <div className={`absolute inset-0 w-full h-full flex items-center justify-center ${capturedImage ? 'hidden' : 'block'}`}>
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className={`w-full h-full object-cover transition-transform duration-500 ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                />
                {!stream && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                        <div className="flex flex-col items-center">
                            <LoadingSpinner className="w-10 h-10 text-cyan-400 mb-2" />
                            <p className="text-gray-400 text-sm">Iniciando câmera...</p>
                        </div>
                    </div>
                )}
             </div>

             {/* FOTO CAPTURADA PREVIEW */}
             {capturedImage && (
                <div className="absolute inset-0 w-full h-full bg-black">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-contain" />
                </div>
             )}
          </>
        )}
      </div>

      {/* FOOTER */}
      {!error && (
        <div className="flex-shrink-0 bg-black/80 backdrop-blur-md p-6 pb-8 border-t border-gray-800 z-30 w-full">
            <div className="flex justify-center items-center w-full max-w-md mx-auto">
                
                {capturedImage ? (
                    <div className="flex gap-4 w-full">
                        <button 
                            onClick={handleRetake} 
                            className="flex-1 py-3.5 rounded-xl bg-gray-700 text-white font-bold hover:bg-gray-600 transition-colors border border-gray-600"
                        >
                            Tirar Outra
                        </button>
                        <button 
                            onClick={handleUsePhoto} 
                            className="flex-1 py-3.5 rounded-xl bg-cyan-600 text-white font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-900/20"
                        >
                            Usar Foto
                        </button>
                    </div>
                ) : (
                    <button 
                        onClick={handleCapture} 
                        disabled={!stream} 
                        className="w-20 h-20 rounded-full bg-white border-[6px] border-gray-300/50 shadow-xl disabled:opacity-50 active:scale-90 transition-all flex items-center justify-center group" 
                        aria-label="Tirar Foto"
                    >
                        <div className="w-16 h-16 rounded-full border-[2px] border-black/10 group-active:bg-gray-200 transition-colors"></div>
                    </button>
                )}
            </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;
