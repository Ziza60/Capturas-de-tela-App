
import React, { useRef } from 'react';
import { TEAM_UNIFORMS } from '../constants';
import type { TeamSettings, LogoPosition, FramingStyle } from '../types';
import { UploadIcon, CloseIcon } from './icons';

interface TeamSettingsProps {
  settings: TeamSettings;
  onUpdate: (settings: TeamSettings) => void;
  enableNormalization?: boolean;
  onToggleNormalization?: (enabled: boolean) => void;
}

const BACKGROUND_PRESETS = [
  { label: 'Branco', color: '#FFFFFF' },
  { label: 'Cinza', color: '#808080' },
  { label: 'Preto', color: '#000000' },
  { label: 'Navy', color: '#000080' },
  { label: 'Azul', color: '#1a73e8' },
];

const TeamSettingsPanel: React.FC<TeamSettingsProps> = ({ settings, onUpdate, enableNormalization, onToggleNormalization }) => {
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        onUpdate({
          ...settings,
          logo: { base64, mimeType: file.type, name: file.name }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    onUpdate({ ...settings, logo: null });
  };

  return (
    <div className="w-full max-w-md bg-slate-800 rounded-xl p-5 shadow-lg border border-slate-600">
      <div className="flex items-center gap-3 mb-6 border-b border-slate-600 pb-4">
        <div className="bg-indigo-600 p-2 rounded-lg">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
           </svg>
        </div>
        <div>
            <h3 className="text-lg font-bold text-white">Brand Kit da Equipe</h3>
            <p className="text-xs text-gray-400">Defina a identidade visual para todos os colaboradores.</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Normalização Facial (MediaPipe) */}
        {onToggleNormalization && (
          <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 p-4 rounded-lg border border-cyan-500/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="bg-cyan-600 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-cyan-200">Normalização Profissional</h4>
                  <p className="text-[10px] text-gray-400">Pré + pós-normalização multi-point (olhos, ombros, rotação)</p>
                </div>
              </div>
              <button
                onClick={() => onToggleNormalization(!enableNormalization)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  enableNormalization ? 'bg-cyan-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableNormalization ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {enableNormalization && (
              <div className="text-[10px] text-cyan-300 bg-cyan-950/50 p-2 rounded mt-2 leading-relaxed">
                <strong>Pipeline Completo Ativo:</strong> Pré-normalização determinística (input padronizado) + Pós-normalização profissional (dual-anchor)
                <br />
                <span className="text-cyan-400">→ Alvo: Olhos alinhados • Ombros nivelados • Cabeças com tamanho consistente • Postura uniforme</span>
              </div>
            )}
          </div>
        )}

        {/* 1. Padronização de Uniforme */}
        <div>
          <label className="block text-sm font-semibold text-indigo-200 mb-3 uppercase tracking-wider">
            1. Uniforme Padronizado
          </label>
          <div className="grid grid-cols-1 gap-2">
            {TEAM_UNIFORMS.map((uniform) => (
              <button
                key={uniform.id}
                onClick={() => onUpdate({ ...settings, uniformId: uniform.id })}
                className={`flex items-center justify-between p-3 rounded-lg transition-all border text-left group ${
                  settings.uniformId === uniform.id
                    ? 'bg-indigo-900/50 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]'
                    : 'bg-slate-700/50 border-transparent text-gray-300 hover:bg-slate-700 hover:border-slate-500'
                }`}
              >
                <span className="text-sm font-medium">{uniform.label}</span>
                {settings.uniformId === uniform.id && (
                    <span className="bg-indigo-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">ATIVO</span>
                )}
              </button>
            ))}
          </div>
        </div>
        
        {/* 2. Fundo (Background) */}
        <div>
           <label className="block text-sm font-semibold text-indigo-200 mb-3 uppercase tracking-wider">
                2. Fundo Corporativo (Background)
           </label>
           
           <div className="flex bg-slate-700/50 rounded-lg p-1 border border-slate-600 mb-3">
              <button
                onClick={() => onUpdate({ ...settings, backgroundType: 'default' })}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    settings.backgroundType === 'default'
                    ? 'bg-slate-500 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                 Padrão do Estilo
              </button>
              <button
                onClick={() => onUpdate({ ...settings, backgroundType: 'solid' })}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${
                    settings.backgroundType === 'solid'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                 Cor Sólida (Brand)
              </button>
           </div>

           {settings.backgroundType === 'solid' && (
             <div className="animate-fade-in bg-slate-700/30 p-3 rounded-lg border border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                    <input 
                        type="color" 
                        value={settings.backgroundColor}
                        onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })}
                        className="w-10 h-10 rounded cursor-pointer border-none bg-transparent"
                    />
                    <div className="flex-grow">
                         <label className="text-xs text-gray-400 block">Hex Code</label>
                         <input 
                            type="text" 
                            value={settings.backgroundColor}
                            onChange={(e) => onUpdate({ ...settings, backgroundColor: e.target.value })}
                            className="bg-slate-800 border border-slate-500 rounded px-2 py-1 text-sm text-white w-full uppercase"
                         />
                    </div>
                </div>
                
                <div className="grid grid-cols-5 gap-2">
                    {BACKGROUND_PRESETS.map((preset) => (
                        <button
                            key={preset.color}
                            onClick={() => onUpdate({ ...settings, backgroundColor: preset.color })}
                            className="w-full aspect-square rounded-md border border-gray-500 hover:border-white transition-all shadow-sm"
                            style={{ backgroundColor: preset.color }}
                            title={preset.label}
                        />
                    ))}
                </div>
             </div>
           )}
        </div>

        {/* 3. Enquadramento (Framing) */}
        <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-3 uppercase tracking-wider">
                3. Enquadramento & Crop
            </label>
            <div className="grid grid-cols-2 gap-3">
                <button 
                    onClick={() => onUpdate({ ...settings, framingStyle: 'chest-up' })}
                    className={`p-3 rounded-lg border text-center transition-all ${
                        settings.framingStyle === 'chest-up' 
                        ? 'bg-indigo-900/50 border-indigo-400 text-white' 
                        : 'bg-slate-700 border-transparent text-gray-400 hover:bg-slate-600'
                    }`}
                >
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-current rounded flex flex-col items-center justify-end overflow-hidden">
                        <div className="w-6 h-4 bg-current rounded-t-md"></div>
                    </div>
                    <span className="block text-xs font-bold">Padrão Crachá</span>
                    <span className="block text-[10px] opacity-70">Plano Médio (Uniforme Visível)</span>
                </button>

                <button 
                    onClick={() => onUpdate({ ...settings, framingStyle: 'close-up' })}
                    className={`p-3 rounded-lg border text-center transition-all ${
                        settings.framingStyle === 'close-up' 
                        ? 'bg-indigo-900/50 border-indigo-400 text-white' 
                        : 'bg-slate-700 border-transparent text-gray-400 hover:bg-slate-600'
                    }`}
                >
                    <div className="w-8 h-8 mx-auto mb-2 border-2 border-current rounded flex flex-col items-center justify-center overflow-hidden">
                         <div className="w-5 h-5 bg-current rounded-full"></div>
                    </div>
                    <span className="block text-xs font-bold">Padrão LinkedIn</span>
                    <span className="block text-[10px] opacity-70">Close-up Rosto (Sem Uniforme)</span>
                </button>
            </div>
            {settings.framingStyle === 'close-up' && settings.logoPosition.includes('chest') && (
                <p className="text-[10px] text-yellow-400 mt-2 bg-yellow-900/30 p-2 rounded">
                    ⚠️ Alerta: O "Close-up" pode cortar a área do peito. O logo no uniforme pode não aparecer. Considere mudar o logo para "Marca D'água" (Canto).
                </p>
            )}
        </div>

        {/* 4. Naming Convention */}
        <div>
            <label className="block text-sm font-semibold text-indigo-200 mb-2 uppercase tracking-wider">
                Padrão de Arquivos
            </label>
            <div className="flex items-center gap-2 bg-slate-700 rounded-lg px-3 py-2 border border-slate-600 focus-within:border-indigo-500">
                <span className="text-gray-400 text-xs">Prefixo:</span>
                <input 
                    type="text" 
                    value={settings.filenamePrefix || ''}
                    onChange={(e) => onUpdate({ ...settings, filenamePrefix: e.target.value })}
                    placeholder="Ex: Google_Funcionario_"
                    className="bg-transparent border-none outline-none text-white text-sm w-full placeholder-gray-500"
                />
                <span className="text-gray-500 text-xs">.png</span>
            </div>
        </div>

        {/* 5. Upload de Logo */}
        <div>
          <label className="block text-sm font-semibold text-indigo-200 mb-3 uppercase tracking-wider">
            5. Logo / Marca D'água (Opcional)
          </label>
          
          {!settings.logo ? (
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-slate-500 bg-slate-700/30 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-slate-700/50 transition-all group"
            >
              <div className="p-3 bg-slate-700 rounded-full mb-2 group-hover:bg-indigo-600 transition-colors">
                 <UploadIcon className="w-6 h-6 text-gray-300 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-gray-300">Carregar Logo da Empresa</span>
              <span className="text-xs text-gray-500 mt-1">PNG com fundo transparente recomendado</span>
              <input 
                ref={logoInputRef}
                type="file" 
                accept="image/png" 
                className="hidden"
                onChange={handleLogoUpload} 
              />
            </div>
          ) : (
            <div className="bg-slate-700 rounded-lg p-4 flex items-center justify-between border border-indigo-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-md flex items-center justify-center overflow-hidden border border-white/10">
                   <img src={`data:${settings.logo.mimeType};base64,${settings.logo.base64}`} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white truncate max-w-[150px]">{settings.logo.name}</p>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Logo Pronto
                  </p>
                </div>
              </div>
              <button onClick={removeLogo} className="text-gray-400 hover:text-red-400 p-2 hover:bg-slate-600 rounded-full transition-colors">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* 6. Posição e Ajuste Fino do Logo */}
        {settings.logo && (
          <div className="animate-fade-in bg-slate-700/30 p-3 rounded-lg space-y-5">
             {/* Posição Base */}
             <div>
                <label className="block text-xs font-medium text-indigo-300 mb-2 flex items-center gap-2">
                   <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                   Posição Base (Uniforme/Cantos)
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                   <button
                     onClick={() => onUpdate({ ...settings, logoPosition: 'chest-left' })} 
                     className={`px-2 py-3 text-xs rounded transition-all border flex flex-col items-center gap-1 ${
                       settings.logoPosition === 'chest-left'
                         ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-lg'
                         : 'bg-slate-600 border-transparent text-gray-400 hover:bg-slate-500'
                     }`}
                   >
                     <span>Peito Esquerdo</span>
                     <span className="text-[9px] opacity-75 font-normal">(Lado do Coração)</span>
                   </button>
                   <button
                     onClick={() => onUpdate({ ...settings, logoPosition: 'chest-right' })}
                     className={`px-2 py-3 text-xs rounded transition-all border flex flex-col items-center gap-1 ${
                       settings.logoPosition === 'chest-right'
                         ? 'bg-indigo-600 border-indigo-400 text-white font-bold shadow-lg'
                         : 'bg-slate-600 border-transparent text-gray-400 hover:bg-slate-500'
                     }`}
                   >
                     <span>Peito Direito</span>
                     <span className="text-[9px] opacity-75 font-normal">(Oposto)</span>
                   </button>
                </div>
                
                {/* Outras posições (Cantos) */}
                 <div className="grid grid-cols-4 gap-1">
                   {(['top-left', 'top-right', 'bottom-left', 'bottom-right'] as LogoPosition[]).map((pos) => (
                     <button
                       key={pos}
                       onClick={() => onUpdate({ ...settings, logoPosition: pos })}
                       className={`px-1 py-1.5 text-[10px] rounded transition-colors border capitalize ${
                         settings.logoPosition === pos
                           ? 'bg-slate-500 border-gray-400 text-white font-semibold'
                           : 'bg-slate-700 border-transparent text-gray-500 hover:bg-slate-600'
                       }`}
                     >
                       {pos.split('-').map(s => s[0]).join('').toUpperCase()}
                     </button>
                   ))}
                </div>
             </div>
             
             {/* SLIDERS DE AJUSTE FINO (A PEDIDO DO USUÁRIO) */}
             <div className="border-t border-slate-600 pt-4">
                <div className="flex items-center justify-between mb-4 bg-indigo-900/40 p-2 rounded-lg border border-indigo-500/30">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-bold text-green-300 uppercase tracking-wide">Preview em Tempo Real</span>
                    </div>
                    <button 
                        onClick={() => onUpdate({...settings, logoScale: 12, logoOffsetX: 0, logoOffsetY: 0})}
                        className="text-[10px] text-gray-400 hover:text-white underline"
                    >
                        Resetar
                    </button>
                </div>
                
                <div className="space-y-4">
                    {/* 1. Tamanho (Scale) */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Tamanho (Escala)</span>
                            <span className="text-indigo-400">{settings.logoScale}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="5" max="30" step="1" 
                            value={settings.logoScale}
                            onChange={(e) => onUpdate({...settings, logoScale: parseInt(e.target.value)})}
                            className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                    </div>

                    {/* 2. Vertical (Y) */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Posição Vertical (Y)</span>
                            <span className="text-indigo-400">{settings.logoOffsetY > 0 ? `+${settings.logoOffsetY}%` : `${settings.logoOffsetY}%`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">⬆️</span>
                            <input 
                                type="range" 
                                min="-20" max="20" step="1" 
                                value={settings.logoOffsetY}
                                onChange={(e) => onUpdate({...settings, logoOffsetY: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-[10px] text-gray-500">⬇️</span>
                        </div>
                    </div>

                    {/* 3. Horizontal (X) */}
                    <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Posição Horizontal (X)</span>
                            <span className="text-indigo-400">{settings.logoOffsetX > 0 ? `+${settings.logoOffsetX}%` : `${settings.logoOffsetX}%`}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-gray-500">⬅️</span>
                            <input 
                                type="range" 
                                min="-20" max="20" step="1" 
                                value={settings.logoOffsetX}
                                onChange={(e) => onUpdate({...settings, logoOffsetX: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-slate-600 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <span className="text-[10px] text-gray-500">➡️</span>
                        </div>
                    </div>
                </div>
             </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default TeamSettingsPanel;