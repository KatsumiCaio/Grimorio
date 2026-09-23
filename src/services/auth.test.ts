import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./firebase', () => ({
  saveUserToFirestore: vi.fn().mockResolvedValue(true),
  deleteUserFromFirestore: vi.fn().mockResolvedValue(true),
  fetchUsersFromFirestore: vi.fn().mockResolvedValue([]),
  findUserInFirestore: vi.fn().mockResolvedValue(null),
  subscribeToUsers: vi.fn().mockReturnValue(() => {}),
  checkCloudDbStatus: vi.fn().mockResolvedValue({ status: 'online' }),
}));

import { authService, hashPassword, hashPasswordCrypto, verifyPasswordAsync } from './auth';

describe('Auth Service & Device Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Password Hashing & Cryptography', () => {
    it('deve gerar hash SHA-256 com prefixo s256_', async () => {
      const hash = await hashPasswordCrypto('mypassword123');
      expect(hash).toMatch(/^s256_[a-f0-9]{64}$/);
    });

    it('deve gerar hashes idênticos para a mesma senha no hash SHA-256', async () => {
      const hash1 = await hashPasswordCrypto('dragonSlayer2025');
      const hash2 = await hashPasswordCrypto('dragonSlayer2025');
      expect(hash1).toBe(hash2);
    });

    it('deve verificar corretamente senhas com hash SHA-256 (s256_)', async () => {
      const hash = await hashPasswordCrypto('segredoDeMestre');
      const isValid = await verifyPasswordAsync('segredoDeMestre', hash);
      const isInvalid = await verifyPasswordAsync('senhaErrada', hash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('deve verificar com retrocompatibilidade senhas legadas (h_)', async () => {
      const legacyHash = hashPassword('senhaAntiga');
      expect(legacyHash.startsWith('h_')).toBe(true);

      const isValid = await verifyPasswordAsync('senhaAntiga', legacyHash);
      const isInvalid = await verifyPasswordAsync('outraCoisa', legacyHash);

      expect(isValid).toBe(true);
      expect(isInvalid).toBe(false);
    });

    it('deve aceitar contas sem senha caso a senha fornecida e o hash estejam vazios', async () => {
      const isValid = await verifyPasswordAsync('', '');
      expect(isValid).toBe(true);
    });
  });

  describe('Device Isolation & Multi-Device Login', () => {
    it('não deve logar automaticamente em dispositivos novos ao inicializar sync', () => {
      // Simula uma nuvem com usuários já cadastrados salvos localmente
      const mockCloudUser = {
        id: 'user-other-device',
        displayName: 'Mestre Remoto',
        username: 'mestre_remoto',
        role: 'Mestre da Masmorra' as const,
        avatarId: 'd20',
        color: 'purple' as const,
        passwordHash: 's256_mockhash123',
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };

      authService.saveAccounts([mockCloudUser]);
      // Não há sessão ativa salva no localStorage deste novo aparelho
      expect(authService.getCurrentUser()).toBeNull();

      // Executa o listener de inicialização
      authService.initCloudSync();

      // O usuário corrente DEVE continuar null para forçar tela de login
      expect(authService.getCurrentUser()).toBeNull();
    });

    it('deve deslogar e limpar a sessão local ao chamar logout()', async () => {
      const res = await authService.register({
        displayName: 'Aventureiro Teste',
        username: 'aventureiro_teste',
        role: 'Jogador',
        password: 'senhaSegura123',
        avatarId: 'd20',
        color: 'amber',
      });

      expect(res.success).toBe(true);
      expect(authService.getCurrentUser()?.username).toBe('aventureiro_teste');

      authService.logout();

      expect(authService.getCurrentUser()).toBeNull();
      expect(localStorage.getItem('grimorio_device_session_v4')).toBeNull();
      expect(localStorage.getItem('grimorio_current_user_id_v3')).toBeNull();
    });

    it('deve recusar registro com senha menor que 4 caracteres', async () => {
      const res = await authService.register({
        displayName: 'Curto',
        username: 'curto_user',
        role: 'Jogador',
        password: '123',
        avatarId: 'd20',
        color: 'emerald',
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain('4 caracteres');
    });

    it('deve realizar loginAsync com sucesso e migrar hash legado para SHA-256', async () => {
      // Cria conta com hash legado
      const legacyHash = hashPassword('minhaSenhaLegada');
      const legacyUser = {
        id: 'user-legacy-1',
        displayName: 'Mestre Legado',
        username: 'mestre_legado',
        role: 'Mestre da Masmorra' as const,
        avatarId: 'd20',
        color: 'rose' as const,
        passwordHash: legacyHash,
        createdAt: Date.now(),
        lastLoginAt: Date.now(),
      };
      authService.saveAccounts([legacyUser]);

      const loginRes = await authService.loginAsync('mestre_legado', 'minhaSenhaLegada');
      expect(loginRes.success).toBe(true);
      expect(loginRes.user?.id).toBe('user-legacy-1');

      // Verifica se o hash foi atualizado para s256_
      const updatedAccounts = authService.getAccounts();
      const userInStorage = updatedAccounts.find((a) => a.id === 'user-legacy-1');
      expect(userInStorage?.passwordHash).toMatch(/^s256_/);
    });

    it('deve rejeitar loginAsync com senha incorreta', async () => {
      await authService.register({
        displayName: 'Guardião',
        username: 'guardiao_seguro',
        role: 'Guardião de Segredos',
        password: 'senhaCorreta99',
        avatarId: 'd20',
        color: 'purple',
      });

      const loginRes = await authService.loginAsync('guardiao_seguro', 'senhaErrada11');
      expect(loginRes.success).toBe(false);
      expect(loginRes.error).toContain('incorreta');
    });
  });
});
