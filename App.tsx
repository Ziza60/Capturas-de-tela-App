import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { UrlInputForm } from './components/UrlInputForm';
import { ScreenshotGrid } from './components/ScreenshotGrid';
import { fetchScreenshot } from './services/screenshotService';
import { uploadToCloudinary } from './services/cloudinaryService';
import { Screenshot, ScreenshotStatus, CloudinaryConfig, UploadStatus, LocalFile } from './types';
import { LocalFileUpload } from './components/LocalFileUpload';

// A configuração do Cloudinary agora está integrada diretamente no aplicativo.
const cloudinaryConfig: CloudinaryConfig = {
  cloudName: 'dq4jjpq6k',
  uploadPreset: 'gcn9k18o',
};

const App: React.FC = () => {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [localFiles, setLocalFiles] = useState<LocalFile[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Limpar URLs de objeto quando o componente for desmontado para evitar vazamentos de memória
  useEffect(() => {
    return () => {
      localFiles.forEach(localFile => URL.revokeObjectURL(localFile.previewUrl));
    };
  }, [localFiles]);

  const handleGenerateScreenshots = useCallback(async (urlsText: string) => {
    const urls = urlsText
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0)
      .filter((url, index, self) => self.indexOf(url) === index);

    if (urls.length === 0) return;

    setIsProcessing(true);
    
    const initialScreenshots: Screenshot[] = urls.map(url => ({
      id: crypto.randomUUID(),
      url,
      status: ScreenshotStatus.PENDING,
      uploadStatus: UploadStatus.IDLE,
    }));
    setScreenshots(initialScreenshots);

    const screenshotPromises = initialScreenshots.map(async (screenshot) => {
      try {
        const imageData = await fetchScreenshot(screenshot.url);
        return { ...screenshot, status: ScreenshotStatus.SUCCESS, imageData };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido';
        return { ...screenshot, status: ScreenshotStatus.ERROR, error: errorMessage };
      }
    });

    for (const promise of screenshotPromises) {
        const result = await promise;
        setScreenshots(prev => prev.map(s => s.id === result.id ? result : s));
    }

    setIsProcessing(false);
  }, []);

  const handleUploadScreenshot = useCallback(async (screenshotId: string) => {
    const screenshot = screenshots.find(s => s.id === screenshotId);
    if (!screenshot || !screenshot.imageData) return;

    setScreenshots(prev => prev.map(s => s.id === screenshotId ? { ...s, uploadStatus: UploadStatus.UPLOADING } : s));

    try {
      const cloudinaryUrl = await uploadToCloudinary(screenshot.imageData, cloudinaryConfig);
      setScreenshots(prev => prev.map(s => s.id === screenshotId ? { ...s, uploadStatus: UploadStatus.SUCCESS, cloudinaryUrl } : s));
    } catch (error) {
      const uploadError = error instanceof Error ? error.message : 'Erro desconhecido no upload.';
      setScreenshots(prev => prev.map(s => s.id === screenshotId ? { ...s, uploadStatus: UploadStatus.ERROR, uploadError } : s));
    }
  }, [screenshots]);
  
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    // Limpar URLs de objeto anteriores para liberar memória
    localFiles.forEach(localFile => URL.revokeObjectURL(localFile.previewUrl));

    const newLocalFiles: LocalFile[] = Array.from(files).map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        uploadStatus: UploadStatus.IDLE,
    }));
    setLocalFiles(newLocalFiles);
  };
  
  const handleUploadLocalFiles = async () => {
    if (localFiles.length === 0) return;
    
    for (const localFile of localFiles) {
        if (localFile.uploadStatus === UploadStatus.IDLE) {
            setLocalFiles(prev => prev.map(f => f.id === localFile.id ? { ...f, uploadStatus: UploadStatus.UPLOADING } : f));
            try {
                const cloudinaryUrl = await uploadToCloudinary(localFile.file, cloudinaryConfig);
                setLocalFiles(prev => prev.map(f => f.id === localFile.id ? { ...f, uploadStatus: UploadStatus.SUCCESS, cloudinaryUrl } : f));
            } catch (error) {
                const uploadError = error instanceof Error ? error.message : 'Erro desconhecido no upload.';
                setLocalFiles(prev => prev.map(f => f.id === localFile.id ? { ...f, uploadStatus: UploadStatus.ERROR, uploadError } : f));
            }
        }
    }
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-slate-400 mb-8 text-lg">
            Insira URLs para capturar telas ou envie arquivos locais. Salve tudo no Cloudinary para otimização e entrega rápida.
          </p>
          
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 shadow-lg mb-8">
            <h2 className="text-xl font-bold text-slate-300 mb-4 border-b border-slate-700 pb-2">Gerador de Capturas de Tela</h2>
            <UrlInputForm onSubmit={handleGenerateScreenshots} isProcessing={isProcessing} />
          </div>

          <LocalFileUpload 
            files={localFiles}
            onFileSelect={handleFileSelect}
            onUpload={handleUploadLocalFiles}
            isCloudinaryConfigured={true}
          />
          
          <ScreenshotGrid screenshots={screenshots} onUpload={handleUploadScreenshot} isCloudinaryConfigured={true} />
        </div>
      </main>
    </div>
  );
};

export default App;