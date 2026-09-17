import React from 'react';
import ReactMarkdown from 'react-markdown';
import { CharacterSheet } from '../types';
import { EmbeddedCharacterCard } from './EmbeddedCharacterCard';
import { storageService } from '../services/storage';
import { RPG_BESTIARY } from '../data/bestiary';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  characters?: CharacterSheet[];
  onUpdateCharacter?: (updated: CharacterSheet) => void;
  onEditCharacter?: (character: CharacterSheet) => void;
  onRollDice?: (diceExpression: string, label: string) => void;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  characters = [],
  onUpdateCharacter,
  onEditCharacter,
  onRollDice,
}) => {
  // Regex to detect embedded character/monster cards like {{ficha:char-123}} or {{sheet:char-123}}
  const embedRegex = /\{\{(?:ficha|sheet):([a-zA-Z0-9_\-]+)\}\}/g;

  // If no content or no embed tags present, render standard markdown directly
  if (!content || !content.match(embedRegex)) {
    return (
      <div className={`prose-dark space-y-3 leading-relaxed text-zinc-300 text-sm ${className}`}>
        <ReactMarkdown components={markdownComponents}>{content || ''}</ReactMarkdown>
      </div>
    );
  }

  // Parse segments of text and embed tags
  const segments: Array<{ type: 'markdown' | 'embed'; value: string; charId?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = embedRegex.exec(content)) !== null) {
    const matchStart = match.index;
    const matchEnd = embedRegex.lastIndex;

    // Text prior to match
    if (matchStart > lastIndex) {
      segments.push({
        type: 'markdown',
        value: content.slice(lastIndex, matchStart),
      });
    }

    // Embed tag
    segments.push({
      type: 'embed',
      value: match[0],
      charId: match[1],
    });

    lastIndex = matchEnd;
  }

  // Trailing text
  if (lastIndex < content.length) {
    segments.push({
      type: 'markdown',
      value: content.slice(lastIndex),
    });
  }

  // Fallback characters pool from storage to avoid async state desync
  const storedCharacters = storageService.getCharacters();

  return (
    <div className={`prose-dark space-y-3 leading-relaxed text-zinc-300 text-sm ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'embed' && seg.charId) {
          const targetId = seg.charId.toLowerCase().trim();
          
          // 1. Try finding in characters prop
          let matchedChar = characters.find(
            (c) => c.id.toLowerCase() === targetId || c.name.toLowerCase() === targetId
          );

          // 2. Try finding in stored characters
          if (!matchedChar) {
            matchedChar = storedCharacters.find(
              (c) => c.id.toLowerCase() === targetId || c.name.toLowerCase() === targetId
            );
          }

          // 3. If still not found, check if it matches a monster from the Bestiary by ID or name
          if (!matchedChar) {
            const bestiaryMonster = RPG_BESTIARY.find(
              (m) =>
                m.id.toLowerCase() === targetId ||
                m.name.toLowerCase() === targetId ||
                targetId.includes(m.name.toLowerCase()) ||
                m.name.toLowerCase().includes(targetId)
            );

            if (bestiaryMonster) {
              matchedChar = {
                id: seg.charId,
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
          }

          if (matchedChar) {
            return (
              <EmbeddedCharacterCard
                key={`embed-${matchedChar.id}-${idx}`}
                character={matchedChar}
                onUpdateCharacter={onUpdateCharacter}
                onEditCharacter={onEditCharacter}
                onRollDice={onRollDice}
              />
            );
          }

          return (
            <div
              key={`embed-notfound-${idx}`}
              className="my-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-2 not-prose"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold">⚠️ Ficha com ID ou nome "{seg.charId}"</span>
                <span className="text-zinc-400 text-[11px]">ainda não foi cadastrada no Grimório desta campanha.</span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {seg.value}
              </span>
            </div>
          );
        }

        if (!seg.value.trim()) return null;

        return (
          <ReactMarkdown key={`md-${idx}`} components={markdownComponents}>
            {seg.value}
          </ReactMarkdown>
        );
      })}
    </div>
  );
};

const markdownComponents = {
  h1: ({ children }: any) => (
    <h1 className="text-xl font-bold text-zinc-100 border-b border-zinc-800 pb-2 pt-2 first:pt-0">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold text-amber-400/90 pt-3 pb-1 flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-medium text-zinc-200 pt-2 pb-1">
      {children}
    </h3>
  ),
  p: ({ children }: any) => <p className="mb-2 leading-relaxed text-zinc-300">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300">{children}</ol>,
  li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-amber-500/60 bg-zinc-900/60 pl-3 py-1.5 my-2 rounded-r italic text-zinc-300">
      {children}
    </blockquote>
  ),
  code: ({ children }: any) => (
    <code className="bg-zinc-900 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-800">
      {children}
    </code>
  ),
  pre: ({ children }: any) => (
    <pre className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-zinc-200">
      {children}
    </pre>
  ),
  hr: () => <hr className="border-zinc-800 my-4" />,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 border border-zinc-800 rounded-lg">
      <table className="w-full text-left text-xs border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead className="bg-zinc-900 text-zinc-200 border-b border-zinc-800">{children}</thead>,
  tbody: ({ children }: any) => <tbody className="divide-y divide-zinc-800/60">{children}</tbody>,
  tr: ({ children }: any) => <tr className="hover:bg-zinc-900/40 transition-colors">{children}</tr>,
  th: ({ children }: any) => <th className="p-2.5 font-semibold text-amber-400/90">{children}</th>,
  td: ({ children }: any) => <td className="p-2.5 text-zinc-300">{children}</td>,
  strong: ({ children }: any) => <strong className="font-semibold text-zinc-100">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-amber-200/90">{children}</em>,
};
