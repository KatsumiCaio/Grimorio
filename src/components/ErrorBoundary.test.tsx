import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ErrorBoundary } from './ErrorBoundary';

const FaultyComponent: React.FC = () => {
  throw new Error('Erro de renderização forçado para teste');
};

const HealthyComponent: React.FC = () => {
  return <div>Componente Saudável Carregado</div>;
};

describe('ErrorBoundary Component', () => {
  it('deve renderizar os filhos normalmente quando não há erros', () => {
    render(
      <ErrorBoundary>
        <HealthyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText('Componente Saudável Carregado')).toBeInTheDocument();
  });

  it('deve interceptar o erro e exibir o fallback amigável quando um filho falha', () => {
    // Suppress console.error in test output for intentional throw
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <FaultyComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Ops! Algo inesperado aconteceu/i)).toBeInTheDocument();
    expect(screen.getByText(/Erro de renderização forçado para teste/i)).toBeInTheDocument();
    expect(screen.getByText(/Recarregar Grimório/i)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
