import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Check,
  AlertCircle,
  Link as LinkIcon,
  Image as ImageIcon,
  Download,
  Trash2,
} from 'lucide-react';
import { CharacterSheet } from '../types';
import { RPG_PORTRAIT_PRESETS } from '../data/rpgPortraits';

type PortraitTab = 'upload' | 'gallery' | 'url';

interface GeneratePortraitModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: CharacterSheet;
  campaignSystem?: string;
  onApplyPortrait: (imageUrl: string) => void;
}

export const GeneratePortraitModal: React.FC<GeneratePortraitModalProps> = ({
  isOpen,
  onClose,
  character,
  onApplyPortrait,
}) => {
  const [activeTab, setActiveTab] = useState<PortraitTab>('upload');
  const [error, setError] = useState<string | null>(null);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gallery state
  const [galleryFilter, setGalleryFilter] = useState<string>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

  // URL state
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [testedUrlImage, setTestedUrlImage] = useState<string | null>(null);
  const [urlTestError, setUrlTestError] = useState(false);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setActiveTab('upload');
      setError(null);
      setAppliedSuccess(false);
      setUploadedImage(null);
      setSelectedPresetId(null);
      setCustomUrlInput('');
      setTestedUrlImage(null);
      setUrlTestError(false);
    }
  }, [isOpen, character.id]);

  if (!isOpen) return null;

  // Helper to resize and optimize uploaded image via canvas
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecione um arquivo de imagem válido (JPG, PNG, WebP ou GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Resize to max 512x512 while maintaining aspect ratio and quality
        const maxDim = 512;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setUploadedImage(dataUrl);
          setError(null);
        }
      };
      img.onerror = () => {
        setError('Não foi possível ler os dados desta imagem.');
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyCurrent = (targetImage: string) => {
    if (!targetImage) return;
    onApplyPortrait(targetImage);
    setAppliedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleRemovePortrait = () => {
    onApplyPortrait('');
    onClose();
  };

  const handleDownloadImage = (url: string) => {
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `retrato-${character.name.toLowerCase().replace(/\s+/g, '-') || 'personagem'}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filtered gallery presets
  const filteredPresets = RPG_PORTRAIT_PRESETS.filter((p) => {
    if (galleryFilter === 'all') return true;
    return p.category === galleryFilter;
  });

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="character-portrait-dialog"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800/90 flex items-center justify-between shrink-0 bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Retrato do Personagem</span>
                <span className="text-xs text-zinc-400 font-normal truncate max-w-[200px] sm:max-w-xs">
                  — {character.name || 'Sem nome'} ({character.role || 'Sem classe'})
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Faça upload de uma imagem do seu computador, escolha na galeria RPG ou insira um link direto.
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-portrait-modal-btn"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 pt-3 pb-2 border-b border-zinc-800/60 bg-zinc-900/20 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-xl text-xs">
            <button
              type="button"
              id="tab-portrait-upload-btn"
              onClick={() => {
                setActiveTab('upload');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'upload'
                  ? 'bg-cyan-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload de Arquivo</span>
            </button>

            <button
              type="button"
              id="tab-portrait-gallery-btn"
              onClick={() => {
                setActiveTab('gallery');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-cyan-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Galeria de Avatares ({RPG_PORTRAIT_PRESETS.length})</span>
            </button>

            <button
              type="button"
              id="tab-portrait-url-btn"
              onClick={() => {
                setActiveTab('url');
                setError(null);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'url'
                  ? 'bg-cyan-500 text-zinc-950 shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Link / URL da Imagem</span>
            </button>
          </div>

          {character.avatarUrl && (
            <button
              type="button"
              id="remove-portrait-btn"
              onClick={handleRemovePortrait}
              className="text-rose-400 hover:text-rose-300 text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
              title="Remover retrato existente da ficha"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Retrato Atual</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* TAB 1: UPLOAD DE IMAGEM */}
          {activeTab === 'upload' && (
            <div className="space-y-5 max-w-xl mx-auto py-2">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-cyan-500 bg-cyan-500/10'
                    : 'border-zinc-800 hover:border-cyan-500/60 bg-zinc-900/30 hover:bg-zinc-900/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp, image/gif, image/svg+xml"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3 shadow-md">
                  <Upload className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold text-zinc-100 mb-1">
                  Arraste uma imagem ou clique para selecionar
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mb-3 leading-relaxed">
                  Envie qualquer foto, arte ou token do seu computador. A imagem será otimizada
                  automaticamente para ficha.
                </p>
                <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-800">
                  Suporta PNG, JPG, WEBP, GIF (Otimizado para 512x512)
                </span>
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Uploaded Preview */}
              {uploadedImage && (
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-cyan-500/40 shrink-0 shadow-md">
                    <img
                      src={uploadedImage}
                      alt="Prévia do upload"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    <h4 className="text-xs font-bold text-zinc-100 flex items-center justify-center sm:justify-start gap-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      Imagem carregada com sucesso!
                    </h4>
                    <p className="text-[11px] text-zinc-400">
                      Pronta para salvar na ficha de {character.name || 'personagem'}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCurrent(uploadedImage)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/30 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Retrato na Ficha</span>
                  </button>
                </div>
              )}

              {/* Existing portrait display if user hasn't uploaded yet */}
              {!uploadedImage && character.avatarUrl && (
                <div className="p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl overflow-hidden border border-zinc-800 shrink-0">
                    <img
                      src={character.avatarUrl}
                      alt={`Retrato atual de ${character.name}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-zinc-200">Retrato Atual Salvo</div>
                    <div className="text-[11px] text-zinc-500">
                      Você pode arrastar uma nova foto acima para substituir este retrato.
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadImage(character.avatarUrl!)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs transition-colors cursor-pointer"
                    title="Baixar imagem atual"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GALERIA DE AVATARES RPG */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {/* Filter Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      galleryFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Todos ({RPG_PORTRAIT_PRESETS.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('fantasy')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      galleryFilter === 'fantasy'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Fantasia Clássica
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('grimdark')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      galleryFilter === 'grimdark'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Sombrio / Monstros
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('noir')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      galleryFilter === 'noir'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Noir / Cthulhu
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryFilter('cyberpunk')}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      galleryFilter === 'cyberpunk'
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Cyberpunk / Sci-Fi
                  </button>
                </div>

                <div className="text-[11px] text-zinc-400">
                  Clique em um avatar para selecionar e aplicar à ficha.
                </div>
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {filteredPresets.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPresetId(preset.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center text-center gap-2 transition-all cursor-pointer group ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500 shadow-md shadow-cyan-950/30'
                          : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80'
                      }`}
                    >
                      <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-zinc-800 group-hover:border-cyan-500/50 transition-colors shrink-0">
                        <img
                          src={preset.avatarSvg}
                          alt={preset.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-full">
                        <div className="text-xs font-semibold text-zinc-200 truncate">
                          {preset.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 truncate">{preset.role}</div>
                      </div>
                      {isSelected && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyCurrent(preset.avatarSvg);
                          }}
                          className="w-full py-1 bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold rounded-lg text-[10px] flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-xs"
                        >
                          <Check className="w-3 h-3" />
                          <span>Aplicar</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: LINK / URL DA WEB */}
          {activeTab === 'url' && (
            <div className="max-w-xl mx-auto space-y-5 py-4">
              <div className="space-y-2">
                <label
                  htmlFor="portrait-url-input"
                  className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                  URL Direta da Imagem
                </label>
                <div className="flex gap-2">
                  <input
                    id="portrait-url-input"
                    type="url"
                    value={customUrlInput}
                    onChange={(e) => {
                      setCustomUrlInput(e.target.value);
                      setUrlTestError(false);
                    }}
                    placeholder="https://exemplo.com/imagem-do-personagem.jpg"
                    className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-cyan-500/60"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customUrlInput.trim()) {
                        setTestedUrlImage(customUrlInput.trim());
                        setUrlTestError(false);
                      }
                    }}
                    disabled={!customUrlInput.trim()}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Testar
                  </button>
                </div>
                <p className="text-[11px] text-zinc-500">
                  Cole o link direto da imagem (Pinterest, ArtStation, Imgur, Discord, etc.).
                </p>
              </div>

              {/* URL Preview */}
              {testedUrlImage && (
                <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                  <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-cyan-500/40 shrink-0 shadow-md bg-zinc-950">
                    <img
                      src={testedUrlImage}
                      alt="Prévia da URL"
                      referrerPolicy="no-referrer"
                      onError={() => setUrlTestError(true)}
                      onLoad={() => setUrlTestError(false)}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1 text-center sm:text-left">
                    {urlTestError ? (
                      <div className="text-rose-400 text-xs font-semibold flex items-center gap-1.5 justify-center sm:justify-start">
                        <AlertCircle className="w-4 h-4" />
                        Não foi possível carregar a imagem deste endereço.
                      </div>
                    ) : (
                      <>
                        <h4 className="text-xs font-bold text-zinc-100 flex items-center justify-center sm:justify-start gap-1.5">
                          <Check className="w-4 h-4 text-emerald-400" />
                          Link validado com sucesso!
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Pronta para salvar na ficha de {character.name || 'personagem'}.
                        </p>
                      </>
                    )}
                  </div>

                  {!urlTestError && (
                    <button
                      type="button"
                      onClick={() => handleApplyCurrent(testedUrlImage)}
                      className="w-full sm:w-auto px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-950/30 transition-all"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Retrato na Ficha</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-zinc-800/90 bg-zinc-900/60 flex items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-500 hidden sm:block">
            {activeTab === 'upload'
              ? 'Arraste uma foto ou clique para escolher um arquivo do seu computador.'
              : activeTab === 'gallery'
              ? 'Selecione qualquer avatar de RPG pronto e aplique com 1 clique.'
              : 'Cole o endereço direto de qualquer imagem na web.'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            >
              Fechar
            </button>

            {activeTab === 'upload' && uploadedImage && (
              <button
                type="button"
                onClick={() => handleApplyCurrent(uploadedImage)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{appliedSuccess ? 'Aplicado!' : 'Aplicar Imagem Carregada'}</span>
              </button>
            )}

            {activeTab === 'gallery' && selectedPresetId && (
              <button
                type="button"
                onClick={() => {
                  const p = RPG_PORTRAIT_PRESETS.find((x) => x.id === selectedPresetId);
                  if (p) handleApplyCurrent(p.avatarSvg);
                }}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{appliedSuccess ? 'Aplicado!' : 'Aplicar Avatar Selecionado'}</span>
              </button>
            )}

            {activeTab === 'url' && testedUrlImage && !urlTestError && (
              <button
                type="button"
                onClick={() => handleApplyCurrent(testedUrlImage)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-lg text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-950/30 transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{appliedSuccess ? 'Aplicado!' : 'Aplicar Imagem da URL'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
