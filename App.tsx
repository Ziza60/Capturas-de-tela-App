
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ImageUploader from './components/ImageUploader';
import StyleSelector from './components/StyleSelector';
import ResultDisplay from './components/ResultDisplay';
import BatchResults from './components/BatchResults';
import TeamSettingsPanel from './components/TeamSettings';
import LogoAdjustModal from './components/LogoAdjustModal';
import { generateHeadshot, generateSuggestions } from './services/geminiService';
import { overlayLogo } from './utils/imageProcessing';
import { ASPECT_RATIO_OPTIONS, GLASSES_OPTIONS, HEADSHOT_STYLES, CLOTHING_OPTIONS, TEAM_UNIFORMS, LIGHTING_OPTIONS, EXPRESSION_OPTIONS, BEAUTY_OPTIONS } from './constants';
import type { AspectRatioOption, GlassesOption, StyleOption, UploadedFile, ClothingOption, BatchItem, UserProfile, LightingOption, ExpressionOption, BeautyOption, TeamSettings } from './types';
import GlassesOptions from './components/GlassesOptions';
import ClothingOptions from './components/ClothingOptions';
import SuggestionBox from './components/SuggestionBox';
import AspectRatioSelector from './components/AspectRatioSelector';
import CreationsGallery from './components/CreationsGallery';
import AdvancedOptions from './components/AdvancedOptions';
import { UsersIcon } from './components/icons';
import JSZip from 'jszip';
import FileSaver from 'file-saver';

const App: React.FC = () => {
  // --- SINGLE MODE STATE ---
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [rawGeneratedImage, setRawGeneratedImage] = useState<string | null>(null);
  
  // --- SHARED OPTIONS ---
  const [selectedStyle, setSelectedStyle] = useState<StyleOption | null>(null);
  const [selectedGlassesOption, setSelectedGlassesOption] = useState<GlassesOption | null>(GLASSES_OPTIONS[0]);
  const [selectedClothingOption, setSelectedClothingOption] = useState<ClothingOption | null>(CLOTHING_OPTIONS[0]);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption | null>(ASPECT_RATIO_OPTIONS[0]);
  
  // --- ADVANCED OPTIONS ---
  const [userProfile, setUserProfile] = useState<UserProfile>({ ageGroup: '', gender: '', ethnicity: '' });
  const [selectedLighting, setSelectedLighting] = useState<LightingOption>(LIGHTING_OPTIONS[0]);
  const [selectedExpression, setSelectedExpression] = useState<ExpressionOption>(EXPRESSION_OPTIONS[0]);
  const [selectedBeauty, setSelectedBeauty] = useState<BeautyOption>(BEAUTY_OPTIONS[0]);
  const [is4kMode, setIs4kMode] = useState<boolean>(false);

  // --- UI STATE ---
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSuggestionsLoading, setIsSuggestionsLoading] = useState<boolean>(false);
  const [creationsHistory, setCreationsHistory] = useState<string[]>([]);

  // --- BATCH MODE STATE ---
  const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
  const [batchQueue, setBatchQueue] = useState<BatchItem[]>([]);
  // Ref for batchQueue to avoid stale closures in useEffect
  const batchQueueRef = useRef<BatchItem[]>([]);

  const [teamSettings, setTeamSettings] = useState<TeamSettings>({
    logo: null,
    logoPosition: 'bottom-right',
    uniformId: TEAM_UNIFORMS[0].id,
    framingStyle: 'chest-up',
    filenamePrefix: '',
    logoScale: 12,
    logoOffsetX: 0,
    logoOffsetY: 0
  });

  // Modal State
  const [editingBatchItem, setEditingBatchItem] = useState<BatchItem | null>(null);

  // Sync ref with state
  useEffect(() => {
    batchQueueRef.current = batchQueue;
  }, [batchQueue]);

  useEffect(() => {
      if (isBatchMode && !selectedStyle) {
         const profStyle = HEADSHOT_STYLES.find(s => s.category === 'professional');
         if (profStyle) setSelectedStyle(profStyle);
      }
  }, [isBatchMode, selectedStyle]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (uploadedFile && selectedStyle && !isBatchMode) {
        setIsSuggestionsLoading(true);
        setSuggestions([]);
        const result = await generateSuggestions(uploadedFile, selectedStyle);
        setSuggestions(result);
        setIsSuggestionsLoading(false);
      }
    };
    fetchSuggestions();
  }, [uploadedFile, selectedStyle, isBatchMode]);

  // --- GLOBAL REAL-TIME PREVIEW (BATCH & SINGLE) ---
  useEffect(() => {
    // Debounce to prevent UI freeze
    const timer = setTimeout(async () => {
        if (!teamSettings.logo) return;

        // 1. Single Mode Update
        if (!isBatchMode && rawGeneratedImage) {
             const updated = await overlayLogo(rawGeneratedImage, teamSettings.logo.base64, teamSettings);
             setGeneratedImage(updated);
        }

        // 2. Batch Mode Global Update
        // Use Ref to get latest queue without causing infinite loop
        const currentQueue = batchQueueRef.current;
        if (isBatchMode && currentQueue.some(i => i.status === 'completed')) {
             const updatedQueue = await Promise.all(currentQueue.map(async (item) => {
                 if (item.status === 'completed' && item.rawImage) {
                     // Re-apply logo using NEW settings
                     const newResult = await overlayLogo(item.rawImage, teamSettings.logo!.base64, teamSettings);
                     return { ...item, resultImage: newResult };
                 }
                 return item;
             }));
             setBatchQueue(updatedQueue);
        }
    }, 200); // 200ms debounce

    return () => clearTimeout(timer);
  }, [teamSettings, isBatchMode, rawGeneratedImage]); 

  const handleImageUpload = (file: UploadedFile | UploadedFile[]) => {
    if (isBatchMode || Array.isArray(file)) {
        const filesToAdd = Array.isArray(file) ? file : [file];
        const newQueue: BatchItem[] = filesToAdd.map(f => ({
            id: Math.random().toString(36).substring(7),
            file: f,
            status: 'pending',
            resultImage: null,
            rawImage: null
        }));
        // APPEND to existing queue instead of replacing
        setBatchQueue(prev => [...prev, ...newQueue]);
    } else {
        setUploadedFile(file);
        setGeneratedImage(null);
        setRawGeneratedImage(null);
        setSuggestions([]);
    }
    setError(null);
  };

  const handleStyleSelect = (style: StyleOption) => {
    setSelectedStyle(style);
  };
  
  const clearImage = () => {
    setUploadedFile(null);
    setBatchQueue([]);
    setGeneratedImage(null);
    setRawGeneratedImage(null);
    setError(null);
    setSuggestions([]);
    if (!isBatchMode) setSelectedStyle(null);
  }

  const switchMode = (mode: 'individual' | 'team') => {
      const isTeam = mode === 'team';
      if (isTeam !== isBatchMode) {
          clearImage();
          setIsBatchMode(isTeam);
          setSelectedGlassesOption(GLASSES_OPTIONS[0]);
          setSelectedAspectRatio(ASPECT_RATIO_OPTIONS[0]);
      }
  }

  // --- BATCH PROCESSING ---
  const processBatchQueue = async () => {
    if (!selectedStyle) return;
    setIsLoading(true);

    let activeClothingOption = selectedClothingOption;
    if (isBatchMode && teamSettings.uniformId) {
        const uniform = TEAM_UNIFORMS.find(u => u.id === teamSettings.uniformId);
        if (uniform) activeClothingOption = uniform;
    }

    const itemsToProcessIndices = batchQueue.map((item, index) => item.status === 'pending' ? index : -1).filter(i => i !== -1);

    for (const i of itemsToProcessIndices) {
        setBatchQueue(current => current.map((item, idx) => 
            idx === i ? { ...item, status: 'processing', error: undefined } : item
        ));

        const currentItem = batchQueue[i];

        try {
            const rawAIResult = await generateHeadshot(
                currentItem.file,
                selectedStyle,
                selectedGlassesOption,
                activeClothingOption,
                selectedAspectRatio,
                userProfile,
                selectedLighting,
                selectedExpression,
                selectedBeauty,
                is4kMode,
                isBatchMode ? teamSettings.framingStyle : undefined
            );

            let finalImage = rawAIResult;

            if (teamSettings.logo) {
              try {
                 finalImage = await overlayLogo(rawAIResult, teamSettings.logo.base64, teamSettings);
              } catch (overlayErr) {
                 console.error("Overlay error", overlayErr);
              }
            }
            
            const rawName = currentItem.file.name.split('.')[0];
            const finalName = teamSettings.filenamePrefix 
                ? `${teamSettings.filenamePrefix}${rawName}.png`
                : `Headshot_${rawName}.png`;

            setBatchQueue(current => current.map((item, idx) => 
                idx === i ? { 
                    ...item, 
                    status: 'completed', 
                    resultImage: finalImage,
                    rawImage: rawAIResult, // IMPORTANT: Save raw for editing
                    finalFileName: finalName,
                    error: undefined
                } : item
            ));

            await new Promise(resolve => setTimeout(resolve, 2000));

        } catch (err) {
            console.error("Batch error", err);
            const errorMessage = err instanceof Error ? err.message : "Erro desconhecido";
            setBatchQueue(current => current.map((item, idx) => 
                idx === i ? { ...item, status: 'error', error: errorMessage } : item
            ));
        }
    }
    setIsLoading(false);
  };

  const handleRetryItem = (itemId: string) => {
      setBatchQueue(current => current.map(item => 
          item.id === itemId ? { ...item, status: 'pending', error: undefined } : item
      ));
      setTimeout(() => processBatchQueue(), 100);
  };

  const handleGenerateClick = useCallback(async () => {
    if (!selectedStyle) {
      setError("Por favor, selecione um estilo primeiro.");
      return;
    }

    if (isBatchMode) {
        if (batchQueue.length === 0) {
            setError("Por favor, carregue as fotos da equipe.");
            return;
        }
        await processBatchQueue();
        return;
    }

    if (!uploadedFile) {
      setError("Por favor, carregue uma imagem primeiro.");
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);
    setRawGeneratedImage(null);
    setError(null);

    try {
      const rawResult = await generateHeadshot(
        uploadedFile, 
        selectedStyle, 
        selectedGlassesOption, 
        selectedClothingOption,
        selectedAspectRatio,
        userProfile,
        selectedLighting,
        selectedExpression,
        selectedBeauty,
        is4kMode,
        isBatchMode ? teamSettings.framingStyle : undefined
      );

      setRawGeneratedImage(rawResult);

      let finalResult = rawResult;
      if (teamSettings.logo) {
         finalResult = await overlayLogo(rawResult, teamSettings.logo.base64, teamSettings);
      }

      setGeneratedImage(finalResult);
      setCreationsHistory(prev => [finalResult, ...prev].slice(0, 5));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFile, selectedStyle, selectedGlassesOption, selectedClothingOption, selectedAspectRatio, isBatchMode, batchQueue, userProfile, selectedLighting, selectedExpression, selectedBeauty, is4kMode, teamSettings]);
  
  const handleSurpriseMe = () => {
    if (HEADSHOT_STYLES.length > 0) {
      const randomIndex = Math.floor(Math.random() * HEADSHOT_STYLES.length);
      setSelectedStyle(HEADSHOT_STYLES[randomIndex]);
    }
  };

  const handleSelectCreation = (image: string) => {
    setGeneratedImage(image);
    setRawGeneratedImage(null); 
  };

  const handleEditBatchItem = (item: BatchItem) => {
      if (item.rawImage) {
          setEditingBatchItem(item);
      }
  };

  const handleSaveBatchEdit = (newImage: string, _settings: TeamSettings) => {
      if (editingBatchItem) {
          setBatchQueue(current => current.map(item => 
              item.id === editingBatchItem.id 
                ? { ...item, resultImage: newImage } 
                : item
          ));
          setEditingBatchItem(null);
      }
  };

  const handleDownloadZip = async () => {
      const completedItems = batchQueue.filter(i => i.status === 'completed' && i.resultImage);
      if (completedItems.length === 0) return;

      const zip = new JSZip();
      completedItems.forEach(item => {
          if (item.resultImage) {
              zip.file(item.finalFileName || `headshot_${item.id}.png`, item.resultImage, {base64: true});
          }
      });

      const content = await zip.generateAsync({type: "blob"});
      const saveAs = (FileSaver as any).saveAs || FileSaver;
      saveAs(content, "equipe_headshots.zip");
  };

  const aspectRatioClassName = selectedAspectRatio?.className || 'aspect-square';
  const hasFile = isBatchMode ? batchQueue.length > 0 : !!uploadedFile;
  const bgClass = isBatchMode ? 'bg-slate-900' : 'bg-gray-900';
  const textGradient = isBatchMode 
    ? 'bg-gradient-to-r from-indigo-400 to-white' 
    : 'bg-gradient-to-r from-cyan-400 to-blue-500';

  return (
    <div className={`min-h-screen ${bgClass} text-white p-4 sm:p-6 lg:p-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-10 flex flex-col items-center">
          
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-2">
            <span className={`bg-clip-text text-transparent ${textGradient}`}>
              {isBatchMode ? 'Corporate Headshot Studio' : 'AI Headshot Photographer'}
            </span>
          </h1>
          <p className={`mb-6 max-w-2xl mx-auto text-sm sm:text-lg ${isBatchMode ? 'text-indigo-200' : 'text-gray-400'}`}>
            {isBatchMode 
                ? 'Solução empresarial para padronização de fotos de colaboradores.' 
                : 'Transforme qualquer foto em um retrato profissional em segundos.'}
          </p>

          {/* MODE SELECTOR TABS (VISIBLE ON MOBILE) */}
          <div className="flex bg-gray-800 p-1 rounded-xl border border-gray-700 w-full max-w-md mx-auto relative z-10">
              <button
                onClick={() => switchMode('individual')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    !isBatchMode 
                    ? 'bg-gray-700 text-cyan-400 shadow-md ring-1 ring-cyan-500/30' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                  <span className="text-lg">👤</span>
                  Individual
              </button>
              <button
                onClick={() => switchMode('team')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    isBatchMode 
                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                  <span className="text-lg">👥</span>
                  Equipe (Batch)
              </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col space-y-8">
            <ImageUploader 
              onImageUpload={handleImageUpload} 
              uploadedFile={uploadedFile}
              clearImage={clearImage}
              isBatchMode={isBatchMode}
              batchCount={batchQueue.length}
            />
            
            {hasFile && (
              <>
                 {isBatchMode && (
                    <div className="animate-slide-in">
                        <TeamSettingsPanel 
                            settings={teamSettings}
                            onUpdate={setTeamSettings}
                        />
                    </div>
                 )}

                <StyleSelector
                  styles={HEADSHOT_STYLES}
                  selectedStyle={selectedStyle}
                  onStyleSelect={handleStyleSelect}
                  onSurpriseMe={handleSurpriseMe}
                  isTeamMode={isBatchMode}
                />
                
                {selectedStyle && !isBatchMode && (
                  <ClothingOptions 
                    options={CLOTHING_OPTIONS}
                    selectedOption={selectedClothingOption}
                    onOptionSelect={setSelectedClothingOption}
                  />
                )}

                {selectedStyle && (
                  <>
                    <AdvancedOptions 
                      userProfile={userProfile}
                      onProfileChange={setUserProfile}
                      selectedLighting={selectedLighting}
                      onLightingChange={setSelectedLighting}
                      selectedExpression={selectedExpression}
                      onExpressionChange={setSelectedExpression}
                      selectedBeauty={selectedBeauty}
                      onBeautyChange={setSelectedBeauty}
                      is4kMode={is4kMode}
                      onToggle4k={setIs4kMode}
                      isBatchMode={isBatchMode}
                    />
                    
                    {!isBatchMode && (
                        <GlassesOptions 
                        options={GLASSES_OPTIONS}
                        selectedOption={selectedGlassesOption}
                        onOptionSelect={setSelectedGlassesOption}
                        />
                    )}

                    <AspectRatioSelector
                      options={ASPECT_RATIO_OPTIONS}
                      selectedOption={selectedAspectRatio}
                      onOptionSelect={setSelectedAspectRatio}
                    />
                  </>
                )}
                
                {selectedStyle && !isBatchMode && (
                  <SuggestionBox
                    isLoading={isSuggestionsLoading}
                    suggestions={suggestions}
                  />
                )}

                <button
                  onClick={handleGenerateClick}
                  disabled={!selectedStyle || isLoading}
                  className={`w-full py-4 px-6 text-lg font-bold rounded-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] disabled:scale-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                    isBatchMode 
                        ? 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-700 hover:to-blue-800 focus:ring-indigo-500 shadow-indigo-900/50'
                        : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:ring-cyan-400'
                  }`}
                >
                  {isLoading 
                    ? (isBatchMode ? `Processando ${batchQueue.filter(i=>i.status==='processing').length > 0 ? 'Atual' : 'Fila'}...` : 'Gerando...') 
                    : (!selectedStyle 
                        ? 'Selecione um Estilo' 
                        : (isBatchMode ? `🚀 Processar ${batchQueue.filter(i=>i.status==='pending').length} Colaboradores` : '✨ Gerar Retrato'))}
                </button>
              </>
            )}
          </div>

          <div className="lg:sticky top-8 self-start flex flex-col gap-8">
            {isBatchMode ? (
                 <BatchResults 
                    queue={batchQueue} 
                    aspectRatio={selectedAspectRatio}
                    onEditItem={handleEditBatchItem}
                    onRetryItem={handleRetryItem}
                    onDownloadZip={handleDownloadZip}
                 />
            ) : (
                <>
                    <ResultDisplay
                        isLoading={isLoading}
                        generatedImage={generatedImage}
                        error={error}
                        aspectRatioClassName={aspectRatioClassName}
                        originalImage={uploadedFile}
                    />
                    <CreationsGallery
                        creations={creationsHistory}
                        onSelectCreation={handleSelectCreation}
                        currentImage={generatedImage}
                    />
                </>
            )}
          </div>
        </main>

        {/* LOGO EDITOR MODAL */}
        {editingBatchItem && editingBatchItem.rawImage && (
            <LogoAdjustModal
                rawImage={editingBatchItem.rawImage}
                currentSettings={teamSettings}
                onSave={handleSaveBatchEdit}
                onClose={() => setEditingBatchItem(null)}
            />
        )}

      </div>
    </div>
  );
};

export default App;
