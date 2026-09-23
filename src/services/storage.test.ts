import { describe, it, expect, beforeEach } from 'vitest';
import { generateCampaignInviteCode, ensureCampaignChapters, storageService } from './storage';
import { Campaign } from '../types';

describe('Storage & Campaign Utilities', () => {
  describe('generateCampaignInviteCode', () => {
    it('deve gerar um código de convite de exatamente 6 caracteres', () => {
      const code = generateCampaignInviteCode();
      expect(code).toBeDefined();
      expect(code).toHaveLength(6);
    });

    it('deve gerar códigos em caixa alta compostos por caracteres alfanuméricos', () => {
      const code = generateCampaignInviteCode();
      expect(code).toMatch(/^[A-Z0-9]{6}$/);
    });

    it('deve gerar códigos com entropia distinta em chamadas sucessivas', () => {
      const codes = new Set(Array.from({ length: 20 }, () => generateCampaignInviteCode()));
      expect(codes.size).toBeGreaterThan(15);
    });
  });

  describe('ensureCampaignChapters', () => {
    it('deve inicializar capítulos padrão caso a campanha não possua nenhum', () => {
      const emptyCampaign: Campaign = {
        id: 'camp-test-1',
        title: 'Mina Perdida',
        system: 'D&D 5e',
        notes: 'Anotações iniciais da aventura',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = ensureCampaignChapters(emptyCampaign);
      expect(result.chapters).toBeDefined();
      expect(result.chapters!.length).toBeGreaterThan(0);
      expect(result.activeChapterId).toBeDefined();
      expect(result.chapters![0].title).toBe('Capítulo 1: Introdução & Anotações');
    });

    it('deve preservar capítulos existentes sem sobrescrevê-los', () => {
      const campaignWithChapters: Campaign = {
        id: 'camp-test-2',
        title: 'Tormenta de Gelo',
        system: 'Tormenta 20',
        notes: 'Notas secretas',
        chapters: [
          {
            id: 'chap-custom-1',
            title: 'Prólogo: A Nevasca',
            summary: 'Os heróis chegam à vila congelada',
            content: 'O vento uivava...',
            order: 0,
            createdAt: 1000,
            updatedAt: 1000,
          },
        ],
        activeChapterId: 'chap-custom-1',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const result = ensureCampaignChapters(campaignWithChapters);
      expect(result.chapters).toHaveLength(1);
      expect(result.chapters![0].id).toBe('chap-custom-1');
      expect(result.chapters![0].title).toBe('Prólogo: A Nevasca');
    });
  });

  describe('storageService local persistence', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('deve salvar e carregar as configurações do usuário', () => {
      const mockSettings = {
        model: 'gemini-3.8-flash',
        customApiKey: 'custom-test-key-12345',
        fontSize: 'base' as const,
        editorMode: 'split' as const,
      };

      storageService.saveSettings(mockSettings);
      const loaded = storageService.getSettings();

      expect(loaded.model).toBe('gemini-3.8-flash');
      expect(loaded.customApiKey).toBe('custom-test-key-12345');
      expect(loaded.fontSize).toBe('base');
      expect(loaded.editorMode).toBe('split');
    });

    it('deve isolar campanhas por ID de usuário', () => {
      const user1Campaigns: Campaign[] = [
        { id: 'c1', title: 'Campanha de Alice', system: 'D&D 5e', notes: 'Lore 1', createdAt: 1, updatedAt: 1 },
      ];
      const user2Campaigns: Campaign[] = [
        { id: 'c2', title: 'Campanha de Bob', system: 'Call of Cthulhu', notes: 'Lore 2', createdAt: 2, updatedAt: 2 },
      ];

      storageService.saveUserCampaigns('user_alice', user1Campaigns);
      storageService.saveUserCampaigns('user_bob', user2Campaigns);

      const loadedAlice = storageService.getUserCampaigns('user_alice');
      const loadedBob = storageService.getUserCampaigns('user_bob');

      expect(loadedAlice).toHaveLength(1);
      expect(loadedAlice[0].title).toBe('Campanha de Alice');

      expect(loadedBob).toHaveLength(1);
      expect(loadedBob[0].title).toBe('Campanha de Bob');
    });
  });
});
