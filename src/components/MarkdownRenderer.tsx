import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`prose-dark space-y-3 leading-relaxed text-zinc-300 text-sm ${className}`}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-zinc-100 border-b border-zinc-800 pb-2 pt-2 first:pt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-amber-400/90 pt-3 pb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-zinc-200 pt-2 pb-1">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed text-zinc-300">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-zinc-300">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-zinc-300">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-amber-500/60 bg-zinc-900/60 pl-3 py-1.5 my-2 rounded-r italic text-zinc-300">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-zinc-900 text-amber-300 px-1.5 py-0.5 rounded text-xs font-mono border border-zinc-800">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 my-2 overflow-x-auto text-xs font-mono text-zinc-200">
              {children}
            </pre>
          ),
          hr: () => <hr className="border-zinc-800 my-4" />,
          table: ({ children }) => (
            <div className="overflow-x-auto my-3 border border-zinc-800 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-zinc-900 text-zinc-200 border-b border-zinc-800">{children}</thead>,
          tbody: ({ children }) => <tbody className="divide-y divide-zinc-800/60">{children}</tbody>,
          tr: ({ children }) => <tr className="hover:bg-zinc-900/40 transition-colors">{children}</tr>,
          th: ({ children }) => <th className="p-2.5 font-semibold text-amber-400/90">{children}</th>,
          td: ({ children }) => <td className="p-2.5 text-zinc-300">{children}</td>,
          strong: ({ children }) => <strong className="font-semibold text-zinc-100">{children}</strong>,
          em: ({ children }) => <em className="italic text-amber-200/90">{children}</em>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
