import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CharacterSheet } from '../types';
import { EmbeddedCharacterCard } from './EmbeddedCharacterCard';
import { storageService } from '../services/storage';
import { RPG_BESTIARY } from '../data/bestiary';
import { BookOpen, Sparkles, PlusCircle } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  characters?: CharacterSheet[];
  onUpdateCharacter?: (updated: CharacterSheet) => void;
  onEditCharacter?: (character: CharacterSheet) => void;
  onRollDice?: (diceExpression: string, label: string) => void;
  onCreateCharacterWithName?: (nameOrId: string) => void;
  fontFamily?: 'serif' | 'sans';
  fontSize?: 'sm' | 'base' | 'lg';
  isReadingMode?: boolean;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  characters = [],
  onUpdateCharacter,
  onEditCharacter,
  onRollDice,
  onCreateCharacterWithName,
  fontFamily = 'sans',
  fontSize = 'base',
  isReadingMode = false,
}) => {
  // Regex to detect embedded character/monster cards:
  // Supports:
  // {{ficha:char-123}}, {{ficha:"Valerius"}}, {{monstro:goblin}}, {{sheet:lyra}}, {{personagem:ignis}}
  // [[ficha:char-123]], [[monstro:Dragão Vermelho]], etc.
  const embedRegex = /(?:\{\{|\{\s*|\[\[)\s*(?:ficha|sheet|monstro|monster|personagem|character)\s*[:=]\s*([^}\]\n\r]+?)\s*(?:\}\}|\s*\}|\]\])/gi;

  // Font styling based on reader settings
  const fontClass = fontFamily === 'serif' ? 'font-serif tracking-normal' : 'font-sans';
  const sizeClass =
    fontSize === 'sm'
      ? 'text-xs sm:text-sm leading-relaxed'
      : fontSize === 'lg'
      ? 'text-base sm:text-lg leading-loose'
      : 'text-sm sm:text-base leading-relaxed';

  // Fallback characters pool from storage to avoid async state desync
  const storedCharacters = storageService.getCharacters();
  const allKnownCharacters = [...characters, ...storedCharacters];

  // Helper to find a character by raw tag value
  const findCharacter = (rawQuery: string): CharacterSheet | null => {
    let cleanQuery = rawQuery.replace(/^['"]|['"]$/g, '').trim().toLowerCase();
    if (!cleanQuery) return null;

    // Strip any residual brackets or braces if present in dirty text
    cleanQuery = cleanQuery.replace(/^[{\[\('"<]+|[}\]\)'">]+$/g, '').trim().toLowerCase();

    // 1. Exact match by id or name in characters/stored
    let match = allKnownCharacters.find(
      (c) => c.id.toLowerCase() === cleanQuery || c.name.toLowerCase() === cleanQuery
    );
    if (match) return match;

    // 2. Partial name match in characters/stored
    match = allKnownCharacters.find(
      (c) =>
        c.name.toLowerCase().includes(cleanQuery) ||
        cleanQuery.includes(c.name.toLowerCase())
    );
    if (match) return match;

    // 3. Bestiary exact match by id or name
    let bestiaryMonster = RPG_BESTIARY.find(
      (m) =>
        m.id.toLowerCase() === cleanQuery ||
        m.name.toLowerCase() === cleanQuery
    );

    // 4. Bestiary search without system prefix (e.g. "goblin" matching "dnd5e_goblin", "lefeu" matching "t20_lefeu_blood")
    if (!bestiaryMonster) {
      bestiaryMonster = RPG_BESTIARY.find((m) => {
        const idWithoutPrefix = m.id.replace(/^[a-z0-9]+_/, '').toLowerCase();
        return idWithoutPrefix === cleanQuery;
      });
    }

    // 5. Bestiary partial name match
    if (!bestiaryMonster) {
      bestiaryMonster = RPG_BESTIARY.find(
        (m) =>
          m.name.toLowerCase().includes(cleanQuery) ||
          cleanQuery.includes(m.name.toLowerCase())
      );
    }

    if (bestiaryMonster) {
      return {
        id: `bestiary-${bestiaryMonster.id}`,
        campaignId: '',
        name: bestiaryMonster.name,
        role: bestiaryMonster.role,
        type: bestiaryMonster.type || 'Monstro',
        challengeRating: bestiaryMonster.challenge,
        avatarUrl: bestiaryMonster.avatarUrl,
        attributes: [...bestiaryMonster.attributes],
        resources: [...bestiaryMonster.resources],
        notes: bestiaryMonster.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
    }

    return null;
  };

  // If no content or no embed tags present, render standard markdown directly
  const matches = content ? Array.from(content.matchAll(embedRegex)) : [];

  if (!content || matches.length === 0) {
    return (
      <div className={`prose-dark space-y-4 text-zinc-200 ${fontClass} ${sizeClass} ${className}`}>
        <ReactMarkdown components={createMarkdownComponents(isReadingMode)}>
          {content || ''}
        </ReactMarkdown>
      </div>
    );
  }

  // Parse segments of text and embed tags
  const segments: Array<{ type: 'markdown' | 'embed'; value: string; charQuery?: string }> = [];
  let lastIndex = 0;

  matches.forEach((m) => {
    const matchIndex = m.index ?? 0;
    const matchLength = m[0].length;

    // Preceding markdown text
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'markdown',
        value: content.slice(lastIndex, matchIndex),
      });
    }

    // Embed tag
    segments.push({
      type: 'embed',
      value: m[0],
      charQuery: m[1]?.trim(),
    });

    lastIndex = matchIndex + matchLength;
  });

  // Trailing text
  if (lastIndex < content.length) {
    segments.push({
      type: 'markdown',
      value: content.slice(lastIndex),
    });
  }

  const customComponents = createMarkdownComponents(isReadingMode);

  return (
    <div className={`prose-dark space-y-5 text-zinc-200 ${fontClass} ${sizeClass} ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'embed' && seg.charQuery) {
          const matchedChar = findCharacter(seg.charQuery);

          if (matchedChar) {
            return (
              <div
                key={`embed-card-${matchedChar.id}-${idx}`}
                className="my-4 not-prose transition-all"
              >
                <EmbeddedCharacterCard
                  character={matchedChar}
                  onUpdateCharacter={onUpdateCharacter}
                  onEditCharacter={onEditCharacter}
                  onRollDice={onRollDice}
                />
              </div>
            );
          }

          // In Reading Mode, if a ficha ID/name is referenced but not found,
          // render an elegant, stylized fantasy card placeholder rather than exposing ugly raw syntax.
          const cleanName = seg.charQuery.replace(/['"]/g, '').trim();

          return (
            <div
              key={`embed-placeholder-${idx}`}
              className="my-4 not-prose p-4 rounded-2xl bg-gradient-to-r from-amber-950/25 via-zinc-900/80 to-zinc-900/50 border border-amber-500/30 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-200 text-sm">{cleanName}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                      Ficha Vinculada
                    </span>
                  </div>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    Esta ficha foi referenciada no texto e aguarda criação no Grimório desta campanha.
                  </p>
                </div>
              </div>

              {onCreateCharacterWithName && (
                <button
                  type="button"
                  onClick={() => onCreateCharacterWithName(cleanName)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Cadastrar Ficha</span>
                </button>
              )}
            </div>
          );
        }

        if (!seg.value.trim()) return null;

        return (
          <ReactMarkdown key={`md-seg-${idx}`} components={customComponents}>
            {seg.value}
          </ReactMarkdown>
        );
      })}
    </div>
  );
};

// Factory for custom markdown components with refined typography and RPG narrative styling
function createMarkdownComponents(isReadingMode: boolean) {
  return {
    h1: ({ children }: any) => (
      <div className="pt-4 pb-2 border-b border-amber-500/25 mb-3 first:pt-0">
        <h1 className="text-xl sm:text-2xl font-black text-amber-100 font-serif tracking-wide flex items-center gap-2">
          <span className="text-amber-500 text-lg select-none">⚜</span>
          <span>{children}</span>
        </h1>
      </div>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg sm:text-xl font-bold text-amber-300/95 pt-4 pb-1.5 flex items-center gap-2 font-serif border-b border-zinc-800/80">
        <span className="w-2 h-2 rounded-sm bg-amber-500/80 rotate-45 inline-block shrink-0" />
        <span>{children}</span>
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base sm:text-lg font-semibold text-zinc-100 pt-3 pb-1 font-serif tracking-wide text-amber-200/90">
        {children}
      </h3>
    ),
    p: ({ children }: any) => (
      <p className="mb-3 leading-relaxed text-zinc-200 selection:bg-amber-500/20 selection:text-amber-200">
        {children}
      </p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-none pl-1 mb-3 space-y-1.5 text-zinc-200">
        {React.Children.map(children, (child) => {
          if (!child) return null;
          return (
            <li className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-amber-400 select-none text-xs mt-1 shrink-0">◆</span>
              <div className="flex-1">{child.props?.children || child}</div>
            </li>
          );
        })}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-3 space-y-1.5 text-zinc-200 leading-relaxed marker:text-amber-400 marker:font-bold">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }: any) => (
      <div className="my-4 p-4 rounded-xl bg-gradient-to-r from-amber-950/30 via-zinc-900/70 to-zinc-900/40 border-l-4 border-amber-500 shadow-sm relative overflow-hidden group">
        <div className="absolute top-2 right-2 text-amber-500/20 pointer-events-none select-none text-2xl font-serif">
          ❝
        </div>
        <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400/90 mb-1.5 flex items-center gap-1.5 select-none">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Texto Narrativo • Ler aos Jogadores</span>
        </div>
        <blockquote className="italic font-serif text-amber-100/90 text-sm sm:text-base leading-relaxed pl-1">
          {children}
        </blockquote>
      </div>
    ),
    code: ({ children }: any) => (
      <code className="bg-zinc-900 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-800 selection:bg-amber-500/30">
        {children}
      </code>
    ),
    pre: ({ children }: any) => (
      <pre className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 my-3 overflow-x-auto text-xs font-mono text-zinc-200 shadow-inner">
        {children}
      </pre>
    ),
    hr: () => (
      <div className="flex items-center justify-center gap-3 my-6 text-amber-500/40 select-none">
        <span className="h-px bg-zinc-800 flex-1" />
        <span className="text-xs">⚜ ◈ ⚜</span>
        <span className="h-px bg-zinc-800 flex-1" />
      </div>
    ),
    table: ({ children }: any) => (
      <div className="overflow-x-auto my-4 border border-zinc-800 rounded-xl shadow-sm">
        <table className="w-full text-left text-xs sm:text-sm border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }: any) => (
      <thead className="bg-gradient-to-r from-zinc-900 via-amber-950/20 to-zinc-900 text-amber-300 font-bold border-b border-amber-500/20">
        {children}
      </thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className="divide-y divide-zinc-800/60 bg-zinc-950/40">{children}</tbody>
    ),
    tr: ({ children }: any) => (
      <tr className="hover:bg-amber-500/5 transition-colors">{children}</tr>
    ),
    th: ({ children }: any) => <th className="p-3 font-semibold text-amber-300">{children}</th>,
    td: ({ children }: any) => <td className="p-3 text-zinc-200">{children}</td>,
    strong: ({ children }: any) => (
      <strong className="font-bold text-amber-100">{children}</strong>
    ),
    em: ({ children }: any) => <em className="italic text-amber-200/90">{children}</em>,
  };
}
