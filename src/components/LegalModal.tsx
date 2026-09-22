import React, { useState } from 'react';
import { X, ShieldCheck, FileText, Lock, Eye, Server, RefreshCw } from 'lucide-react';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'terms' | 'privacy';
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'terms',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 id="legal-modal-title" className="text-sm sm:text-base font-bold text-zinc-100">
                Transparência Legal & Privacidade
              </h2>
              <p className="text-[11px] text-zinc-400">
                Diretrizes de uso, proteção de dados e privacidade no Grimório RPG
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 px-4 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'terms'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Termos de Uso</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Política de Privacidade & LGPD</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-zinc-300 leading-relaxed font-sans">
          {activeTab === 'terms' ? (
            <div className="space-y-4">
              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <span>1. Natureza do Serviço</span>
                </h3>
                <p>
                  O <strong>Grimório</strong> é uma aplicação de gerenciamento de campanhas de RPG de mesa (TTRPG), criação de fichas e assistência narrativa com inteligência artificial, destinada a Mestres e Jogadores.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  2. Papéis e Controle de Visibilidade
                </h3>
                <p>
                  O sistema diferencia estritamente os papéis de <strong>Mestre da Masmorra (DM)</strong> e <strong>Jogador</strong>. As anotações pessoais do Mestre, capítulos secretos e conversas com o Copiloto são confidenciais e jamais são expostas a jogadores sem expressa revelação pelo Mestre através da funcionalidade de Mesa Compartilhada.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  3. Uso Responsável de Inteligência Artificial
                </h3>
                <p>
                  O Copiloto utiliza modelos generativos (família Gemini) para sugestão de tramas, encontros e diálogos. O usuário é responsável pelo conteúdo gerado e deve respeitar direitos autorais e normas de convivência saudável nas mesas.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100">
                  4. Disponibilidade e Limites Operacionais
                </h3>
                <p>
                  A plataforma opera com armazenamento híbrido (Local Storage no navegador e Cloud Firestore). Requisições à API possuem salvaguardas de rate limiting para garantir estabilidade e evitar abusos.
                </p>
              </section>
            </div>
          ) : (
            <div className="space-y-4">
              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>1. Coleta e Tratamento de Dados (LGPD & GDPR)</span>
                </h3>
                <p>
                  Coletamos estritamente os dados essenciais para o funcionamento do jogo: identificador de usuário, apelido público, anotações de campanha e fichas de personagens. Não coletamos dados sensíveis, localização por GPS ou rastreadores de publicidade de terceiros.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Armazenamento e Criptografia</span>
                </h3>
                <p>
                  Os dados são salvos localmente no navegador (localStorage) para funcionamento offline resiliente e sincronizados via Firebase Firestore com regras de segurança granulares. Senhas são tratadas com hashing unidirecional.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>3. Transmissão de Prompts para IA</span>
                </h3>
                <p>
                  Ao enviar mensagens ao Copiloto IA, o contexto textual da campanha selecionada é enviado com segurança para a API Google Gemini via proxy server-side. Chaves de API nunca são expostas ao navegador do cliente.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>4. Direito de Exclusão e Portabilidade</span>
                </h3>
                <p>
                  O usuário tem direito pleno de exportar seus dados a qualquer momento em formato JSON ou apagar permanentemente todas as suas campanhas e fichas nas Configurações da aplicação.
                </p>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-zinc-800 bg-zinc-950/70 flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Versão 2.4.0 — Revisado & Vigente
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
