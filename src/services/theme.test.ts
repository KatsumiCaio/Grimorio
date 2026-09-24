import { describe, it, expect, beforeEach, vi } from 'vitest';
import { themeService } from './theme';

describe('themeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('deve iniciar por padrão no tema escuro', () => {
    expect(themeService.getThemeMode()).toBe('dark');
    expect(themeService.isDark()).toBe(true);
  });

  it('deve alternar corretamente entre dark e light', () => {
    const next = themeService.toggleTheme();
    expect(next).toBe('light');
    expect(themeService.getThemeMode()).toBe('light');
    expect(themeService.isDark()).toBe(false);
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    const backToDark = themeService.toggleTheme();
    expect(backToDark).toBe('dark');
    expect(themeService.getThemeMode()).toBe('dark');
    expect(themeService.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });

  it('deve persistir a escolha no localStorage', () => {
    themeService.setThemeMode('light');
    expect(localStorage.getItem('grimorio_theme_mode')).toBe('light');

    themeService.setThemeMode('dark');
    expect(localStorage.getItem('grimorio_theme_mode')).toBe('dark');
  });

  it('deve notificar listeners quando o tema muda', () => {
    const listener = vi.fn();
    const unsub = themeService.subscribe(listener);

    themeService.setThemeMode('light');
    expect(listener).toHaveBeenCalledWith(false, 'light');

    themeService.setThemeMode('dark');
    expect(listener).toHaveBeenCalledWith(true, 'dark');

    unsub();
    themeService.setThemeMode('light');
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
