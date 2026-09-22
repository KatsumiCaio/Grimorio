import { describe, it, expect, beforeEach } from 'vitest';
import { observability } from './observability';

describe('Observability & Telemetry Hub', () => {
  beforeEach(() => {
    observability.clearBreadcrumbs();
  });

  it('deve registrar e recuperar breadcrumbs corretamente', () => {
    observability.addBreadcrumb({
      category: 'navigation',
      message: 'Usuário abriu o portal do jogador',
      level: 'info',
    });

    const crumbs = observability.getBreadcrumbs();
    expect(crumbs).toHaveLength(1);
    expect(crumbs[0].category).toBe('navigation');
    expect(crumbs[0].message).toBe('Usuário abriu o portal do jogador');
    expect(crumbs[0].timestamp).toBeDefined();
  });

  it('deve limitar o número máximo de breadcrumbs armazenados', () => {
    for (let i = 0; i < 60; i++) {
      observability.addBreadcrumb({
        category: 'test',
        message: `Evento número ${i}`,
      });
    }

    const crumbs = observability.getBreadcrumbs();
    expect(crumbs.length).toBeLessThanOrEqual(50);
  });

  it('deve capturar exceções gerando um payload estruturado', () => {
    const error = new Error('Falha ao serializar ficha de monstro');
    const result = observability.captureException(error, {
      tags: { system: 'D&D 5e', component: 'Bestiary' },
    });

    expect(result).toBeDefined();
    expect(result.message).toBe('Falha ao serializar ficha de monstro');
    expect(result.context?.tags?.system).toBe('D&D 5e');
    expect(result.timestamp).toBeDefined();
  });

  it('deve rastrear spans de performance e retornar o resultado da função', async () => {
    const output = await observability.traceSpan('loadCampaign', 'db.query', async () => {
      return { id: 'camp-123', title: 'Aventura Épica' };
    });

    expect(output).toEqual({ id: 'camp-123', title: 'Aventura Épica' });
    const crumbs = observability.getBreadcrumbs();
    const spanCrumb = crumbs.find((c) => c.message.includes('Completed span: loadCampaign'));
    expect(spanCrumb).toBeDefined();
  });
});
