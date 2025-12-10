
import React, { useState } from 'react';
import { AGE_OPTIONS, GENDER_OPTIONS, ETHNICITY_OPTIONS, LIGHTING_OPTIONS, EXPRESSION_OPTIONS, BEAUTY_OPTIONS, POSE_OPTIONS } from '../constants';
import type { UserProfile, LightingOption, ExpressionOption, BeautyOption, PoseOption, CameraSettings, ClothingOption } from '../types';
import VirtualTryOn from './VirtualTryOn';

interface StudioControlsProps {
  userProfile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  
  cameraSettings: CameraSettings;
  onCameraChange: (settings: CameraSettings) => void;

  selectedLighting: LightingOption;
  onLightingChange: (lighting: LightingOption) => void;
  selectedExpression: ExpressionOption;
  onExpressionChange: (exp: ExpressionOption) => void;
  selectedBeauty: BeautyOption;
  onBeautyChange: (beauty: BeautyOption) => void;
  selectedPose: PoseOption;
  onPoseChange: (pose: PoseOption) => void;
  
  // Clothing props needed for the Try-On feature
  selectedClothing?: ClothingOption | null;
  onClothingChange?: (clothing: ClothingOption) => void;

  is4kMode: boolean;
  onToggle4k: (enabled: boolean) => void;
  isBatchMode?: boolean;
}

const StudioControls: React.FC<StudioControlsProps> = ({ 
  userProfile, 
  onProfileChange,
  cameraSettings,
  onCameraChange,
  selectedLighting,
  onLightingChange,
  selectedExpression,
  onExpressionChange,
  selectedBeauty,
  onBeautyChange,
  selectedPose,
  onPoseChange,
  selectedClothing,
  onClothingChange,
  is4kMode,
  onToggle4k,
  isBatchMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'camera' | 'pose' | 'tryon' | 'identity'>('studio');

  const handleProfileChange = (field: keyof UserProfile, value: any) => {
    onProfileChange({
      ...userProfile,
      [field]: value
    });
  };

  const handleCameraChange = (field: keyof CameraSettings, value: any) => {
      onCameraChange({
          ...cameraSettings,
          [field]: value
      });
  };

  return (
    <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl">
       {/* PRO HEADER */}
       <div className="bg-gray-800 p-3 border-b border-gray-700 flex items-center justify-between">
           <h3 className="text-sm font-bold text-gray-200 flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
               Estúdio de Direção (AI Director)
           </h3>
           <span className="text-[10px] bg-gradient-to-r from-cyan-600 to-blue-600 px-2 py-0.5 rounded text-white font-bold">PRO</span>
       </div>

       {/* TABS NAVIGATION */}
       <div className="flex bg-gray-900/50 p-1 gap-1 border-b border-gray-700 overflow-x-auto no-scrollbar">
           <button 
             onClick={() => setActiveTab('studio')}
             className={`flex-1 py-2 text-xs font-semibold rounded whitespace-nowrap px-2 transition-all ${activeTab === 'studio' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
           >
             💡 Luz
           </button>
           <button 
             onClick={() => setActiveTab('camera')}
             className={`flex-1 py-2 text-xs font-semibold rounded whitespace-nowrap px-2 transition-all ${activeTab === 'camera' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
           >
             📷 Câmera
           </button>
           <button 
             onClick={() => setActiveTab('pose')}
             className={`flex-1 py-2 text-xs font-semibold rounded whitespace-nowrap px-2 transition-all ${activeTab === 'pose' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
           >
             🕺 Pose
           </button>
           {!isBatchMode && (
               <button 
                 onClick={() => setActiveTab('tryon')}
                 className={`flex-1 py-2 text-xs font-semibold rounded whitespace-nowrap px-2 transition-all ${activeTab === 'tryon' ? 'bg-indigo-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 👔 Provador
               </button>
           )}
           <button 
             onClick={() => setActiveTab('identity')}
             className={`flex-1 py-2 text-xs font-semibold rounded whitespace-nowrap px-2 transition-all ${activeTab === 'identity' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
           >
             👤 ID
           </button>
       </div>

       <div className="p-4 min-h-[250px] animate-fade-in bg-gradient-to-b from-gray-900 to-gray-800">
           
           {/* TAB 1: STUDIO (LIGHTING & VIBE) */}
           {activeTab === 'studio' && (
               <div className="space-y-5 animate-slide-in">
                   {/* Lighting */}
                   <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Iluminação de Cena</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {LIGHTING_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => onLightingChange(opt)}
                                    className={`p-2 text-xs rounded border text-left transition-all ${
                                        selectedLighting.id === opt.id 
                                        ? 'bg-cyan-900/40 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* Beauty Level */}
                   <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Acabamento de Pele (Retouch)</h4>
                        <div className="flex gap-1 bg-gray-800 p-1 rounded-lg">
                            {BEAUTY_OPTIONS.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => onBeautyChange(opt)}
                                    className={`flex-1 py-1.5 text-[10px] rounded transition-all ${
                                        selectedBeauty.id === opt.id 
                                        ? 'bg-pink-600 text-white font-bold' 
                                        : 'text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    {opt.label.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                   </div>

                   {/* 4K Toggle */}
                   <div className="flex items-center justify-between bg-gray-800 p-2 rounded-lg border border-gray-700">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">Renderização 4K Ultra</span>
                            <span className="text-[10px] text-gray-500">Detalhes extremos de textura</span>
                        </div>
                        <button 
                            onClick={() => onToggle4k(!is4kMode)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${is4kMode ? 'bg-amber-500' : 'bg-gray-600'}`}
                        >
                            <span className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${is4kMode ? 'left-6' : 'left-1'}`}></span>
                        </button>
                   </div>
               </div>
           )}

           {/* TAB 2: CAMERA (OPTICS) */}
           {activeTab === 'camera' && (
               <div className="space-y-5 animate-slide-in">
                    {/* Depth of Field */}
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                       <div className="flex justify-between items-end mb-2">
                           <h4 className="text-xs font-bold text-white">Desfoque de Fundo (Abertura)</h4>
                           <span className="text-xs text-yellow-400 font-mono">
                               {cameraSettings.depthOfField < 30 ? 'f/1.4' : cameraSettings.depthOfField > 70 ? 'f/11' : 'f/5.6'}
                           </span>
                       </div>
                       <input 
                         type="range" min="0" max="100" step="10"
                         value={cameraSettings.depthOfField}
                         onChange={(e) => handleCameraChange('depthOfField', parseInt(e.target.value))}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500 mb-2"
                       />
                       <div className="flex justify-between text-[10px] text-gray-500">
                           <span>Super Blur</span>
                           <span>Natural</span>
                           <span>Nítido</span>
                       </div>
                    </div>

                    {/* Camera Angle */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Ângulo da Câmera</h4>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleCameraChange('angle', 'low-angle')}
                                className={`flex-1 p-2 rounded border text-center transition-all flex flex-col items-center gap-1 ${
                                    cameraSettings.angle === 'low-angle'
                                    ? 'bg-blue-900/40 border-blue-500 text-blue-200'
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-lg">⬆️</span>
                                <span className="text-[10px] font-bold">Contra-Plongée</span>
                                <span className="text-[9px] opacity-70">(Poder/Hero)</span>
                            </button>

                            <button
                                onClick={() => handleCameraChange('angle', 'eye-level')}
                                className={`flex-1 p-2 rounded border text-center transition-all flex flex-col items-center gap-1 ${
                                    cameraSettings.angle === 'eye-level'
                                    ? 'bg-blue-900/40 border-blue-500 text-blue-200'
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-lg">⏺️</span>
                                <span className="text-[10px] font-bold">Nível Olhos</span>
                                <span className="text-[9px] opacity-70">(Neutro)</span>
                            </button>

                            <button
                                onClick={() => handleCameraChange('angle', 'high-angle')}
                                className={`flex-1 p-2 rounded border text-center transition-all flex flex-col items-center gap-1 ${
                                    cameraSettings.angle === 'high-angle'
                                    ? 'bg-blue-900/40 border-blue-500 text-blue-200'
                                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                }`}
                            >
                                <span className="text-lg">⬇️</span>
                                <span className="text-[10px] font-bold">Plongée</span>
                                <span className="text-[9px] opacity-70">(Selfie/Amigável)</span>
                            </button>
                        </div>
                    </div>
               </div>
           )}

           {/* TAB 3: POSE & EXPRESSION (CONTROL) */}
           {activeTab === 'pose' && (
               <div className="space-y-5 animate-slide-in">
                    {/* Pose Grid */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Linguagem Corporal</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {POSE_OPTIONS.map((pose) => (
                                <button
                                    key={pose.id}
                                    onClick={() => onPoseChange(pose)}
                                    className={`p-2 flex items-center gap-2 rounded border transition-all ${
                                        selectedPose.id === pose.id 
                                        ? 'bg-indigo-900/40 border-indigo-500 text-white shadow-lg' 
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:bg-gray-700'
                                    }`}
                                >
                                    <span className="text-lg">{pose.icon || '🧍'}</span>
                                    <span className="text-xs font-medium">{pose.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Expression */}
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Expressão Facial</h4>
                        <div className="grid grid-cols-2 gap-2">
                             {EXPRESSION_OPTIONS.map((exp) => (
                                 <button
                                    key={exp.id}
                                    onClick={() => onExpressionChange(exp)}
                                    className={`p-2 text-xs rounded border text-center transition-all ${
                                        selectedExpression.id === exp.id
                                        ? 'bg-purple-900/40 border-purple-500 text-purple-200'
                                        : 'bg-gray-800 border-gray-700 text-gray-400'
                                    }`}
                                 >
                                     {exp.label}
                                 </button>
                             ))}
                        </div>
                    </div>
               </div>
           )}

           {/* TAB 4: VIRTUAL TRY-ON (PROVADOR) */}
           {activeTab === 'tryon' && onClothingChange && (
               <VirtualTryOn 
                  selectedClothing={selectedClothing || null}
                  onClothingSelect={onClothingChange}
               />
           )}

           {/* TAB 5: IDENTITY (FIDELITY) */}
           {activeTab === 'identity' && (
               <div className="space-y-5 animate-slide-in">
                   
                   {/* LIKENESS SLIDER - THE KILLER FEATURE */}
                   <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                       <div className="flex justify-between items-end mb-2">
                           <h4 className="text-xs font-bold text-white">Força da Identidade</h4>
                           <span className="text-xs text-cyan-400 font-mono">{userProfile.likenessThreshold}%</span>
                       </div>
                       <input 
                         type="range" min="0" max="100" step="10"
                         value={userProfile.likenessThreshold}
                         onChange={(e) => handleProfileChange('likenessThreshold', parseInt(e.target.value))}
                         className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 mb-2"
                       />
                       <div className="flex justify-between text-[10px] text-gray-500">
                           <span>Criativo (AI)</span>
                           <span>Equilibrado</span>
                           <span>Estrito (Raw)</span>
                       </div>
                       <p className="text-[10px] text-gray-400 mt-2 italic bg-black/20 p-2 rounded">
                           {userProfile.likenessThreshold > 80 
                             ? "⚠️ Modo Estrito: Pode manter imperfeições da foto original para máximo realismo." 
                             : userProfile.likenessThreshold < 30 
                               ? "✨ Modo Criativo: A IA irá idealizar e embelezar bastante o rosto."
                               : "✅ Modo Equilibrado: O melhor balanço entre você e a perfeição."}
                       </p>
                   </div>

                   {!isBatchMode && (
                       <div className="space-y-2 opacity-80 hover:opacity-100 transition-opacity">
                            <h4 className="text-xs font-bold text-gray-500 uppercase">Calibração Manual</h4>
                            <div className="grid grid-cols-2 gap-2">
                                <select 
                                    value={userProfile.gender}
                                    onChange={(e) => handleProfileChange('gender', e.target.value)}
                                    className="bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700"
                                >
                                    {GENDER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <select 
                                    value={userProfile.ageGroup}
                                    onChange={(e) => handleProfileChange('ageGroup', e.target.value)}
                                    className="bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700"
                                >
                                    {AGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                                <select 
                                    value={userProfile.ethnicity}
                                    onChange={(e) => handleProfileChange('ethnicity', e.target.value)}
                                    className="bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 col-span-2"
                                >
                                    {ETHNICITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                       </div>
                   )}
               </div>
           )}
       </div>
    </div>
  );
};

export default StudioControls;
