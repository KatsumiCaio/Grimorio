import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RefreshCw,
  Check,
  AlertCircle,
  Wand2,
  Palette,
  Image as ImageIcon,
  Sliders,
  ChevronDown,
  ChevronUp,
  Download,
} from 'lucide-react';
import { CharacterSheet, AppSettings } from '../types';
import {
  PORTRAIT_ART_STYLES,
  generateCharacterPortrait,
} from '../services/portraitService';

interface GeneratePortraitModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  campaignSystem?: string;
  settings?: AppSettings;
  onApplyPortrait: (imageUrl: string) => void;
}

export const GeneratePortraitModal: React.FC<GeneratePortraitModalProps> = ({
  isOpen,
  onClose,
  character,
  campaignSystem,
  settings,
  onApplyPortrait,
}) => {
  // Determine intelligent default style based on campaign system
  const getDefaultStyleId = () => {
    const sys = (campaignSystem || '').toLowerCase();
    if (sys.includes('cthulhu') || sys.includes('investiga') || sys.includes('noir')) {
      return 'investigative_noir';
    }
    if (sys.includes('osr') || sys.includes('shadowdark') || sys.includes('vampir')) {
      return 'grimdark_oil';
    }
    if (sys.includes('cyber') || sys.includes('sci-fi') || sys.includes('scifi')) {
      return 'cyberpunk_neon';
    }
    return 'fantasy_digital';
  };

  const [selectedStyleId, setSelectedStyleId] = useState<string>(getDefaultStyleId());
  const [extraPrompt, setExtraPrompt] = useState<string>('');
  const [showAdvancedPrompt, setShowAdvancedPrompt] = useState(false);
  const [customFullPrompt, setCustomFullPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Sync state when opening modal
  useEffect(() => {
    if (isOpen) {
      setSelectedStyleId(getDefaultStyleId());
      setExtraPrompt('');
      setShowAdvancedPrompt(false);
      setCustomFullPrompt('');
      setError(null);
      setAppliedSuccess(false);
      // Keep previously generated image if any, or reset to character's current avatar
      setGeneratedImage(null);
    }
  }, [isOpen, character.id, campaignSystem]);

  if (!isOpen) return null;

  const currentStyle =
    PORTRAIT_ART_STYLES.find((s) => s.id === selectedStyleId) || PORTRAIT_ART_STYLES[0];

  // Helper to build default description text preview
  const previewDescription = [
    character.name ? `Personagem: ${character.name}` : '',
    character.role ? `Classe/Papel: ${character.role}` : '',
    character.notes ? `Detalhes: ${character.notes.slice(0, 180)}...` : '',
  ]
    .filter(Boolean)
    .join(' • ');

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setAppliedSuccess(false);

    try {
      let promptToSend: string | undefined = undefined;

      if (showAdvancedPrompt && customFullPrompt.trim()) {
        promptToSend = customFullPrompt.trim();
      } else if (extraPrompt.trim()) {
        // Append extra details to the automatic prompt
        const combinedNotes = [character.notes, `Detalhes visuais adicionais: ${extraPrompt.trim()}`]
          .filter(Boolean)
          .join('. ');

        promptToSend = undefined; // backend will build from notes & style, with extraPrompt injected
      }

      const result = await generateCharacterPortrait({
        name: character.name,
        role: character.role,
        notes: extraPrompt.trim()
          ? `${character.notes || ''}. Detalhes específicos de aparência: ${extraPrompt.trim()}`
          : character.notes,
        system: campaignSystem,
        artStyle: currentStyle.promptModifier,
        customPrompt: showAdvancedPrompt && customFullPrompt.trim() ? customFullPrompt.trim() : undefined,
        customApiKey: settings?.customApiKey,
      });

      setGeneratedImage(result.imageUrl);
      if (result.prompt && !customFullPrompt) {
        setCustomFullPrompt(result.prompt);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao gerar o retrato com o modelo Imagen.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedImage) return;
    onApplyPortrait(generatedImage);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `retrato-${character.name.toLowerCase().replace(/\s+/g, '-') || 'personagem'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        id="generate-portrait-dialog"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl shadow-amber-950/20 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between bg-zinc-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                Gerar Retrato com Imagen
                <span className="text-xs font-normal text-amber-400">({character.name})</span>
              </h2>
              <p className="text-xs text-zinc-400">
                Pintura visual gerada por IA com base na descrição, classe e anotações da ficha.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Settings and Controls (7 cols) */}
          <div className="md:col-span-7 space-y-4">
            {/* Context Summary from Character Sheet */}
            <div className="p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Wand2 className="w-3.5 h-3.5" /> Contexto Extraído da Ficha
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {campaignSystem || 'Sistema Geral'}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {previewDescription || 'Nenhuma descrição detalhada informada ainda na ficha.'}
              </p>
              {character.notes && (
                <div className="text-[11px] text-zinc-400 border-t border-zinc-800/60 pt-1.5 line-clamp-2">
                  <span className="text-zinc-500 font-medium">Anotações: </span>
                  {character.notes}
                </div>
              )}
            </div>

            {/* Art Style Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  Estilo Artístico do Retrato
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Modelo: Imagen 3</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PORTRAIT_ART_STYLES.map((style) => {
                  const isSelected = style.id === selectedStyleId;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setSelectedStyleId(style.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500/70 ring-1 ring-amber-500/30'
                          : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                      }`}
                    >
                      <div className="text-xs font-semibold text-zinc-100 flex items-center justify-between w-full">
                        <span>{style.label}</span>
                        {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                        {style.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Customization Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="portrait-extra-prompt"
                className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Detalhes Visuais Específicos (Opcional)
              </label>
              <textarea
                id="portrait-extra-prompt"
                rows={2}
                value={extraPrompt}
                onChange={(e) => setExtraPrompt(e.target.value)}
                placeholder="Ex: cicatriz vertical no olho esquerdo, cabelos prateados desgrenhados, armadura ornamentada com manto vermelho escuro..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 leading-relaxed resize-none"
              />
            </div>

            {/* Advanced Prompt Collapsible */}
            <div className="border border-zinc-800/80 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowAdvancedPrompt(!showAdvancedPrompt)}
                className="w-full p-2.5 bg-zinc-900/40 hover:bg-zinc-900/70 flex items-center justify-between text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-zinc-500" />
                  Prompt Avançado / Customizado
                </span>
                {showAdvancedPrompt ? (
                  <ChevronUp className="w-3.5 h-3.5 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                )}
              </button>

              {showAdvancedPrompt && (
                <div className="p-3 bg-zinc-950 border-t border-zinc-800/80 space-y-2">
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    Se preenchido, este texto substituirá integralmente o prompt gerado
                    automaticamente.
                  </p>
                  <textarea
                    rows={3}
                    value={customFullPrompt}
                    onChange={(e) => setCustomFullPrompt(e.target.value)}
                    placeholder="Digite seu prompt em inglês ou português para o Imagen..."
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-lg p-2.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-xs text-rose-300 animate-in fade-in duration-150">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-semibold text-rose-200">Não foi possível gerar a imagem</p>
                  <p className="leading-relaxed text-[11px] text-rose-300/90">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Preview & Portrait Results (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 relative min-h-[300px]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
                  </div>
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-20 blur-sm animate-pulse" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-zinc-200">
                    Invocando o modelo Imagen...
                  </p>
                  <p className="text-[11px] text-zinc-500 max-w-xs leading-relaxed">
                    Renderizando retrato em alta resolução com iluminação dramática e estilo{' '}
                    <span className="text-amber-400">{currentStyle.label}</span>.
                  </p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="relative group w-56 h-56 sm:w-64 sm:h-64 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-xl shadow-amber-950/30">
                  <img
                    src={generatedImage}
                    alt={`Retrato de ${character.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <button
                      onClick={handleDownload}
                      className="p-1.5 rounded-lg bg-zinc-950/80 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 border border-zinc-800 backdrop-blur-xs transition-colors cursor-pointer"
                      title="Baixar imagem"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-2.5 text-center">
                    <span className="text-[10px] font-mono font-medium text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      Gerado pelo Imagen 3
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full max-w-xs">
                  <button
                    onClick={handleApply}
                    disabled={appliedSuccess}
                    className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{appliedSuccess ? 'Aplicado!' : 'Salvar na Ficha'}</span>
                  </button>

                  <button
                    onClick={handleGenerate}
                    className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Gerar outra variação"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : character.avatarUrl ? (
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
                  <img
                    src={character.avatarUrl}
                    alt={`Retrato atual de ${character.name}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-mono text-zinc-300 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
                      Retrato Atual
                    </span>
                  </div>
                </div>
                <p className="text-center text-xs text-zinc-400 max-w-xs">
                  Este personagem já possui um retrato salvo. Clique no botão abaixo para gerar uma
                  nova versão com o Imagen.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 space-y-3 text-zinc-500">
                <div className="w-20 h-20 rounded-2xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-600">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-zinc-300">Sem retrato gerado ainda</p>
                  <p className="text-[11px] text-zinc-500 max-w-xs">
                    Escolha o estilo à esquerda e clique em &quot;Gerar Retrato&quot; para criar uma
                    pintura única para este personagem.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-500 hidden sm:block">
            Retrato 1:1 otimizado para fichas e tokens de RPG de mesa.
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3.5 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Fechar
            </button>
            <button
              id="confirm-generate-portrait-btn"
              type="button"
              onClick={handleGenerate}
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-950/30 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando Imagem...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{generatedImage ? 'Gerar Novamente' : 'Gerar Retrato com Imagen'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
