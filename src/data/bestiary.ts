import { BestiaryMonster } from '../types';
import { DND5E_BESTIARY } from './monsters/dnd5e';

export const RPG_BESTIARY: BestiaryMonster[] = [
  // ==========================================
  // D&D 5e (Coleção Completa de Monstros do SRD 5.1)
  // ==========================================
  ...DND5E_BESTIARY,

  // ==========================================
  // Tormenta 20 (T20)
  // ==========================================
  {
    id: 't20_lefeu_blood',
    name: 'Lefeu Flagelo (Tormenta)',
    system: 'Tormenta 20',
    category: 'Monstro da Tormenta',
    challenge: 'Ameaça 6 (Médio)',
    role: 'Monstro Aberrante',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_lefeu" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#881337"/>
            <stop offset="50%" stop-color="#4c0519"/>
            <stop offset="100%" stop-color="#1f0208"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_lefeu)"/>
        <!-- Alien jagged chitin -->
        <polygon points="100,20 120,60 170,40 140,90 180,120 130,130 140,180 100,150 60,180 70,130 20,120 60,90 30,40 80,60" fill="#9f1239" stroke="#fda4af" stroke-width="2"/>
        <circle cx="100" cy="100" r="25" fill="#e11d48"/>
        <!-- Many blind eyes -->
        <circle cx="90" cy="90" r="4" fill="#fff1f2"/>
        <circle cx="110" cy="90" r="5" fill="#fff1f2"/>
        <circle cx="100" cy="110" r="6" fill="#fff1f2"/>
        <circle cx="85" cy="105" r="3" fill="#fff1f2"/>
        <circle cx="115" cy="105" r="3" fill="#fff1f2"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '+5' },
      { id: 'a2', key: 'DES', value: '+3' },
      { id: 'a3', key: 'CON', value: '+4' },
      { id: 'a4', key: 'INT', value: '-1' },
      { id: 'a5', key: 'SAB', value: '+2' },
      { id: 'a6', key: 'CAR', value: '-3' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 140, max: 140, color: 'rose' },
      { id: 'r2', name: 'Pontos de Mana (PM)', current: 24, max: 24, color: 'purple' },
      { id: 'r3', name: 'Defesa', current: 25, max: 25, color: 'amber' },
    ],
    notes: `### Habilidades de Lefeu
- **Corrosão da Realidade:** Criaturas que comecem o turno adjacentes sofrem 2d6 de dano de ácido rubro e devem passar em Vontade CD 18 ou ficam Abaladas.
- **Matéria Vermelha:** Imune a efeitos de medo, paralisia, veneno e metamorfose.

### Ataques & Ações
- **Padrão:** Duas garras de quitina rubra (+17 para acertar, dano 2d8+9 corte, crítico 19/x3).
- **Movimento - Salto Aberrante (2 PM):** Teleporta-se até 12m surgindo do tecido rompido da realidade.
- **Completa - Chuva de Espinhos Rubros (4 PM):** Dispara espículas em cone de 6m, causando 6d6 perfuração (Reflexos CD 19 reduz à metade).`,
  },
  {
    id: 't20_troll_cave',
    name: 'Troll das Cavernas de Arton',
    system: 'Tormenta 20',
    category: 'Humanoide Gigante',
    challenge: 'Ameaça 5 (Bruto)',
    role: 'Combatente Regenerador',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="bg_tr" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#14532d"/>
            <stop offset="100%" stop-color="#022c22"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_tr)"/>
        <!-- Muscular hulking jaw -->
        <ellipse cx="100" cy="115" rx="50" ry="40" fill="#15803d" stroke="#4ade80" stroke-width="2"/>
        <polygon points="75,130 80,105 85,130" fill="#fef08a"/>
        <polygon points="115,130 120,105 125,130" fill="#fef08a"/>
        <circle cx="80" cy="85" r="7" fill="#fbbf24"/>
        <circle cx="120" cy="85" r="7" fill="#fbbf24"/>
        <!-- Wart & Stone skin -->
        <circle cx="65" cy="100" r="5" fill="#166534"/>
        <circle cx="135" cy="105" r="6" fill="#166534"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '+6' },
      { id: 'a2', key: 'DES', value: '+1' },
      { id: 'a3', key: 'CON', value: '+5' },
      { id: 'a4', key: 'INT', value: '-3' },
      { id: 'a5', key: 'SAB', value: '+0' },
      { id: 'a6', key: 'CAR', value: '-2' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 120, max: 120, color: 'emerald' },
      { id: 'r2', name: 'Pontos de Mana (PM)', current: 12, max: 12, color: 'blue' },
      { id: 'r3', name: 'Defesa', current: 21, max: 21, color: 'amber' },
      { id: 'r4', name: 'Regeneração / Rodada', current: 10, max: 10, color: 'rose' },
    ],
    notes: `### Habilidades
- **Regeneração 10:** No início do seu turno, o troll recupera 10 PVs. Dano de Fogo ou Ácido suprime essa regeneração na rodada seguinte.
- **Faro Aguçado:** Não pode ser surpreendido por criaturas a até 18m.

### Ataques
- **Mordida Ferrenha:** +15 para acertar, dano 2d6+8 perfuração.
- **Duas Garras:** +15 para acertar, dano 1d8+8 corte cada.
- **Pancada Devastadora (2 PM):** Derruba o alvo se acertar (teste de Fortitude CD 19 anula).`,
  },
  {
    id: 't20_golem_steel',
    name: 'Golem de Aço Arcano',
    system: 'Tormenta 20',
    category: 'Constructo',
    challenge: 'Ameaça 8 (Chefe)',
    role: 'Guardião Blindado',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_gol" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_gol)"/>
        <rect x="55" y="45" width="90" height="110" rx="16" fill="#64748b" stroke="#94a3b8" stroke-width="3"/>
        <rect x="75" y="80" width="50" height="12" rx="4" fill="#0284c7"/>
        <circle cx="85" cy="86" r="4" fill="#38bdf8"/>
        <circle cx="115" cy="86" r="4" fill="#38bdf8"/>
        <!-- Steam vents -->
        <circle cx="70" cy="120" r="5" fill="#334155"/>
        <circle cx="100" cy="120" r="5" fill="#334155"/>
        <circle cx="130" cy="120" r="5" fill="#334155"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '+7' },
      { id: 'a2', key: 'DES', value: '-1' },
      { id: 'a3', key: 'CON', value: '+6' },
      { id: 'a4', key: 'INT', value: '-4' },
      { id: 'a5', key: 'SAB', value: '+0' },
      { id: 'a6', key: 'CAR', value: '-4' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 190, max: 190, color: 'blue' },
      { id: 'r2', name: 'Defesa', current: 28, max: 28, color: 'amber' },
      { id: 'r3', name: 'Redução de Dano (RD)', current: 10, max: 10, color: 'purple' },
    ],
    notes: `### Imunidades de Construto
- Imune a atordoamento, sangramento, veneno, sono, cansaço e dano de acerto crítico.
- **Redução de Dano 10:** Reduz 10 de qualquer dano físico que sofra (exceto armas de adamante).

### Ataques
- **Marreta de Aço:** +19 para bater, dano 3d10+12 impacto (crítico x3).
- **Descarga de Vapor (3 PM):** Cone de 6m, 6d8 de dano de fogo/vapor (Reflexos CD 21 reduz à metade).`,
  },

  // ==========================================
  // Call of Cthulhu (7ª Edição)
  // ==========================================
  {
    id: 'coc_star_spawn',
    name: 'Cria Estelar de Cthulhu (Star-Spawn)',
    system: 'Call of Cthulhu 7e',
    category: 'Entidade Cósmica',
    challenge: 'Perigo Extremo (SAN 1d6/1d20)',
    role: 'Deus Menor / Terror Cósmico',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="bg_cth" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#021c14"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_cth)"/>
        <!-- Great octopus head -->
        <circle cx="100" cy="70" r="40" fill="#047857" stroke="#10b981" stroke-width="2"/>
        <path d="M40 70 Q20 30 10 50 Q30 80 50 90" fill="#065f46"/>
        <path d="M160 70 Q180 30 190 50 Q170 80 150 90" fill="#065f46"/>
        <!-- Writhing tentacles -->
        <path d="M80 95 Q60 130 50 170 Q70 160 85 130" fill="#059669"/>
        <path d="M95 100 Q90 140 85 180 Q105 170 100 130" fill="#10b981"/>
        <path d="M110 100 Q115 140 120 180 Q100 170 105 130" fill="#10b981"/>
        <path d="M120 95 Q140 130 150 170 Q130 160 115 130" fill="#059669"/>
        <!-- Malevolent red eye slit -->
        <ellipse cx="85" cy="65" rx="4" ry="8" fill="#f43f5e"/>
        <ellipse cx="115" cy="65" rx="4" ry="8" fill="#f43f5e"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '240' },
      { id: 'a2', key: 'CON', value: '200' },
      { id: 'a3', key: 'TAM', value: '250' },
      { id: 'a4', key: 'DES', value: '70' },
      { id: 'a5', key: 'INT', value: '100' },
      { id: 'a6', key: 'POD', value: '105' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 45, max: 45, color: 'emerald' },
      { id: 'r2', name: 'Armadura Sobrenatural', current: 10, max: 10, color: 'amber' },
      { id: 'r3', name: 'Bônus de Dano', current: 40, max: 40, color: 'red' },
    ],
    notes: `### Perda de Sanidade
- **Ver a Cria Estelar:** Custa 1d6 / 1d20 de Sanidade.

### Ataques (2 por rodada)
- **Tentáculos/Garras (80%):** Dano: Bônus de Dano (+4d6) ou esmagamento total.
- **Engolir Inteiro:** Atingindo um Sucesso Extremo, o alvo é engolido e digerido, sofrendo 3d6 PV de ácido por rodada até ser resgatado ou morrer.
- **Regeneração Abissal:** Recupera 3 PVs por rodada a menos que seja queimado com ácido forte ou fogo estelar.`,
  },
  {
    id: 'coc_deep_one',
    name: 'Profundo (Deep One)',
    system: 'Call of Cthulhu 7e',
    category: 'Humanoide Anfíbio',
    challenge: 'Perigo Médio (SAN 0/1d6)',
    role: 'Habitante das Profundezas',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_dp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#022c22"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_dp)"/>
        <!-- Fish-frog head -->
        <circle cx="100" cy="100" r="50" fill="#0d9488" stroke="#2dd4bf" stroke-width="2"/>
        <!-- Bulging unblinking eyes -->
        <circle cx="75" cy="85" r="16" fill="#fef08a" stroke="#042f2e" stroke-width="3"/>
        <circle cx="75" cy="85" r="7" fill="#042f2e"/>
        <circle cx="125" cy="85" r="16" fill="#fef08a" stroke="#042f2e" stroke-width="3"/>
        <circle cx="125" cy="85" r="7" fill="#042f2e"/>
        <!-- Gills -->
        <path d="M55 105 Q45 120 55 135" stroke="#14b8a6" stroke-width="3" fill="none"/>
        <path d="M145 105 Q155 120 145 135" stroke="#14b8a6" stroke-width="3" fill="none"/>
        <!-- Slippery wide mouth -->
        <ellipse cx="100" cy="130" rx="25" ry="8" fill="#042f2e"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '70' },
      { id: 'a2', key: 'CON', value: '60' },
      { id: 'a3', key: 'TAM', value: '80' },
      { id: 'a4', key: 'DES', value: '55' },
      { id: 'a5', key: 'INT', value: '65' },
      { id: 'a6', key: 'POD', value: '50' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 14, max: 14, color: 'emerald' },
      { id: 'r2', name: 'Armadura de Escamas', current: 1, max: 1, color: 'blue' },
      { id: 'r3', name: 'Natação', current: 50, max: 50, color: 'cyan' },
    ],
    notes: `### Perda de Sanidade
- **Ver um Profundo:** 0/1d6 de Sanidade.

### Ataques (1 por rodada)
- **Garra (50%):** Dano 1d6 + 1d4.
- **Arpão / Lança de Coral (45%):** Dano 1d8 + 1d4.
- **Imersão Subaquática:** Podem respirar tanto ar quanto água salgada indefinidamente.`,
  },
  {
    id: 'coc_hound_tindalos',
    name: 'Cão de Tíndalos (Hound of Tindalos)',
    system: 'Call of Cthulhu 7e',
    category: 'Entidade Extradimensional',
    challenge: 'Perigo Alto (SAN 1d3/1d20)',
    role: 'Caçador Implacável dos Ângulos',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_hd" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#450a0a"/>
            <stop offset="100%" stop-color="#180404"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_hd)"/>
        <!-- Angular geometry -->
        <polygon points="100,30 160,70 140,140 60,140 40,70" fill="#7f1d1d" stroke="#f87171" stroke-width="3"/>
        <polygon points="100,50 140,80 125,125 75,125 60,80" fill="#991b1b" stroke="#fca5a5" stroke-width="1.5"/>
        <!-- Tongue of ichor -->
        <path d="M100 110 L100 170 Q105 185 95 190" stroke="#0284c7" stroke-width="4" fill="none"/>
        <circle cx="85" cy="80" r="5" fill="#fef08a"/>
        <circle cx="115" cy="80" r="5" fill="#fef08a"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '80' },
      { id: 'a2', key: 'CON', value: '110' },
      { id: 'a3', key: 'TAM', value: '85' },
      { id: 'a4', key: 'DES', value: '70' },
      { id: 'a5', key: 'INT', value: '85' },
      { id: 'a6', key: 'POD', value: '90' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 19, max: 19, color: 'rose' },
      { id: 'r2', name: 'Armadura Intangível', current: 2, max: 2, color: 'purple' },
    ],
    notes: `### Perda de Sanidade
- **Ver o Cão:** 1d3 / 1d20 de Sanidade.

### Mecânica dos Ângulos
- O Cão de Tíndalos só pode se materializar em cantos ou fendas com ângulos de 120 graus ou menos (cantos de paredes, quinas de mesas). Espaços estritamente curvos impedem seu surgimento.

### Ataques
- **Língua de Ícor Azul (90%):** Dano 1d6 + dreno permanente de 1d4 de POD se a vítima não for purificada.
- **Pata Esmagadora (65%):** Dano 2d6 + bônus de dano.`,
  },

  // ==========================================
  // Pathfinder 2e (PF2e)
  // ==========================================
  {
    id: 'pf2e_hydra',
    name: 'Hidra de Cinco Cabeças',
    system: 'Pathfinder 2e',
    category: 'Besta Mítica',
    challenge: 'Criatura 6 (Perigoso)',
    role: 'Bruto de Múltiplos Ataques',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="bg_hy" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#14532d"/>
            <stop offset="100%" stop-color="#052e16"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_hy)"/>
        <!-- 5 Snake heads fan out -->
        <path d="M100 160 Q60 110 40 50" stroke="#16a34a" stroke-width="8" fill="none"/>
        <circle cx="40" cy="50" r="12" fill="#22c55e"/>
        <path d="M100 160 Q80 100 70 35" stroke="#16a34a" stroke-width="8" fill="none"/>
        <circle cx="70" cy="35" r="12" fill="#22c55e"/>
        <path d="M100 160 Q100 90 100 25" stroke="#15803d" stroke-width="8" fill="none"/>
        <circle cx="100" cy="25" r="14" fill="#22c55e"/>
        <path d="M100 160 Q120 100 130 35" stroke="#16a34a" stroke-width="8" fill="none"/>
        <circle cx="130" cy="35" r="12" fill="#22c55e"/>
        <path d="M100 160 Q140 110 160 50" stroke="#16a34a" stroke-width="8" fill="none"/>
        <circle cx="160" cy="50" r="12" fill="#22c55e"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '+5' },
      { id: 'a2', key: 'DES', value: '+3' },
      { id: 'a3', key: 'CON', value: '+4' },
      { id: 'a4', key: 'INT', value: '-4' },
      { id: 'a5', key: 'SAB', value: '+1' },
      { id: 'a6', key: 'CAR', value: '-2' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 90, max: 90, color: 'emerald' },
      { id: 'r2', name: 'Classe de Armadura (AC)', current: 23, max: 23, color: 'amber' },
      { id: 'r3', name: 'Cabeças Vivas', current: 5, max: 5, color: 'purple' },
    ],
    notes: `### Mecânica das Cabeças & Regeneração
- Cada vez que a hidra sofre um acerto crítico cortante ou dano cortante maciço, 1 cabeça é decepada.
- No início de seu turno, duas novas cabeças crescem no lugar de cada cabeça decepada se a ferida não for cauterizada com fogo ou ácido (recuperando 10 PVs por cabeça regenerada).

### Ações (Sistema de 3 Ações)
- **[1 Ação] Bote da Cabeça (Strike):** +17 para acertar (alcance 3m), dano 2d8+7 perfurante.
- **[2 Ações] Bote Sincronizado:** A hidra ataca com todas as suas cabeças ativas contra até 3 alvos adjacentes.`,
  },
  {
    id: 'pf2e_gargoyle',
    name: 'Gárgula Espreitadora',
    system: 'Pathfinder 2e',
    category: 'Monstro de Pedra',
    challenge: 'Criatura 4',
    role: 'Emboscador Furtivo',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_gar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#334155"/>
            <stop offset="100%" stop-color="#1e293b"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_gar)"/>
        <!-- Stone bat wings -->
        <polygon points="100,90 20,40 50,110 30,150 90,120" fill="#64748b"/>
        <polygon points="100,90 180,40 150,110 170,150 110,120" fill="#64748b"/>
        <circle cx="100" cy="100" r="35" fill="#94a3b8" stroke="#cbd5e1" stroke-width="2"/>
        <polygon points="90,75 80,50 100,65" fill="#64748b"/>
        <polygon points="110,75 120,50 100,65" fill="#64748b"/>
        <circle cx="90" cy="95" r="4" fill="#ef4444"/>
        <circle cx="110" cy="95" r="4" fill="#ef4444"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'FOR', value: '+4' },
      { id: 'a2', key: 'DES', value: '+2' },
      { id: 'a3', key: 'CON', value: '+3' },
      { id: 'a4', key: 'INT', value: '-2' },
      { id: 'a5', key: 'SAB', value: '+1' },
      { id: 'a6', key: 'CAR', value: '-2' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 40, max: 40, color: 'blue' },
      { id: 'r2', name: 'Classe de Armadura (AC)', current: 21, max: 21, color: 'amber' },
      { id: 'r3', name: 'Resistência Física', current: 5, max: 5, color: 'purple' },
    ],
    notes: `### Estatuto de Pedra
- Enquanto permanecer imóvel, é indistinguível de uma escultura de pedra comum (CD de Percepção 25 para notar).

### Ações
- **[1 Ação] Garra (Strike):** +13 para acertar, dano 2d6+6 cortante.
- **[1 Ação] Chifrada (Strike):** +13 para acertar, dano 2d8+6 perfurante.`,
  },

  // ==========================================
  // Ordem Paranormal RPG
  // ==========================================
  {
    id: 'op_zumbi_sangue',
    name: 'Zumbi de Sangue',
    system: 'Ordem Paranormal',
    category: 'Criatura de Sangue',
    challenge: 'VD 20',
    role: 'Agressor Bestial',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <radialGradient id="bg_zb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#881337"/>
            <stop offset="100%" stop-color="#1f0308"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_zb)"/>
        <!-- Tormented deformed blood head -->
        <circle cx="100" cy="100" r="45" fill="#be123c" stroke="#fb7185" stroke-width="2"/>
        <!-- Blood dripping jaw -->
        <path d="M70 120 Q100 150 130 120" stroke="#4c0519" stroke-width="5" fill="none"/>
        <path d="M85 130 L85 160" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
        <path d="M100 135 L100 175" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
        <path d="M115 130 L115 155" stroke="#f43f5e" stroke-width="3" stroke-linecap="round"/>
        <!-- Hollow eyes oozing -->
        <circle cx="85" cy="95" r="8" fill="#1c1917"/>
        <circle cx="115" cy="95" r="8" fill="#1c1917"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'AGI', value: '2' },
      { id: 'a2', key: 'FOR', value: '3' },
      { id: 'a3', key: 'INT', value: '0' },
      { id: 'a4', key: 'PRE', value: '1' },
      { id: 'a5', key: 'VIG', value: '3' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Vida (PV)', current: 45, max: 45, color: 'rose' },
      { id: 'r2', name: 'Defesa', current: 15, max: 15, color: 'amber' },
      { id: 'r3', name: 'RD a Balístico / Corte', current: 5, max: 5, color: 'purple' },
    ],
    notes: `### Presença Perturbadora
- **DT 15:** 1d6 de dano mental se falhar em teste de Presença ao avistar a criatura.

### Ataques
- **Mordida Voraz:** Teste 3d20 (escolhe maior) + 5 vs Defesa. Dano 1d8+3 perfuração.
- **Pancada Sangrenta:** Teste 3d20 + 5. Dano 1d6+3 impacto.
- **Fúria Sanguinária:** Se estiver com menos de 20 PV, recebe +2 dados em todos os testes de ataque.`,
  },

  // ==========================================
  // Vampiro: A Máscara (V5)
  // ==========================================
  {
    id: 'vtm_ghoul_enforcer',
    name: 'Carniçal Executor da Camarilla',
    system: 'Vampiro V5',
    category: 'Carniçal Vampírico',
    challenge: 'Ameaça Humana Potencializada',
    role: 'Guarda-Costas Diurno',
    type: 'NPC',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_gh" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_gh)"/>
        <!-- Heavy trench coat & tactical glasses -->
        <circle cx="100" cy="85" r="35" fill="#e4e4e7" stroke="#71717a" stroke-width="2"/>
        <rect x="70" y="78" width="60" height="15" rx="3" fill="#18181b"/>
        <!-- Crimson tie of the master -->
        <polygon points="100,120 95,170 100,185 105,170" fill="#dc2626"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'Físicos', value: '4' },
      { id: 'a2', key: 'Sociais', value: '2' },
      { id: 'a3', key: 'Mentais', value: '3' },
      { id: 'a4', key: 'Potência 1', value: 'Disciplinas' },
      { id: 'a5', key: 'Fortitude 1', value: 'Disciplinas' },
    ],
    resources: [
      { id: 'r1', name: 'Vitalidade (Health)', current: 7, max: 7, color: 'red' },
      { id: 'r2', name: 'Força de Vontade (Willpower)', current: 5, max: 5, color: 'blue' },
      { id: 'r3', name: 'Reserva de Sangue (Vitae)', current: 1, max: 1, color: 'purple' },
    ],
    notes: `### Vínculo de Sangue
- Completamente leal ao seu Senhor vampiro (Nível 3 de Vínculo de Sangue). Não hesitará em dar a vida em combate.

### Combate
- **Armas de Fogo (Pool 7 dados):** Pistola 9mm pesada, Dano +3.
- **Briga / Pancada (Pool 7 dados):** Dano +2 de dano contundente.
- **Armadura Leve de Kevlar:** Concede +2 dados para absorção de dano balístico.`,
  },

  // ==========================================
  // Cyberpunk RED / Sci-Fi
  // ==========================================
  {
    id: 'cyber_arasaka_drone',
    name: 'Drone Tático Arasaka "Wasp MK-IV"',
    system: 'Cyberpunk RED',
    category: 'Máquina Militar Autônoma',
    challenge: 'Perigo Elevado (Combat Drone)',
    role: 'Suporte Aéreo & Eliminação',
    type: 'Monstro',
    avatarUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_dr" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#09090b"/>
            <stop offset="100%" stop-color="#18181b"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_dr)"/>
        <!-- 4 Propeller Arms -->
        <line x1="40" y1="40" x2="100" y2="100" stroke="#71717a" stroke-width="5"/>
        <line x1="160" y1="40" x2="100" y2="100" stroke="#71717a" stroke-width="5"/>
        <line x1="40" y1="160" x2="100" y2="100" stroke="#71717a" stroke-width="5"/>
        <line x1="160" y1="160" x2="100" y2="100" stroke="#71717a" stroke-width="5"/>
        <!-- Rotors with red LED -->
        <circle cx="40" cy="40" r="14" fill="#27272a" stroke="#ef4444" stroke-width="2"/>
        <circle cx="160" cy="40" r="14" fill="#27272a" stroke="#ef4444" stroke-width="2"/>
        <circle cx="40" cy="160" r="14" fill="#27272a" stroke="#ef4444" stroke-width="2"/>
        <circle cx="160" cy="160" r="14" fill="#27272a" stroke="#ef4444" stroke-width="2"/>
        <!-- Central Pod -->
        <rect x="75" y="75" width="50" height="50" rx="10" fill="#dc2626" stroke="#fca5a5" stroke-width="2"/>
        <circle cx="100" cy="100" r="8" fill="#18181b"/>
        <circle cx="100" cy="100" r="4" fill="#38bdf8"/>
      </svg>
    `)}`,
    attributes: [
      { id: 'a1', key: 'REF', value: '8' },
      { id: 'a2', key: 'DES', value: '7' },
      { id: 'a3', key: 'COR', value: '6' },
      { id: 'a4', key: 'MOV', value: '8' },
      { id: 'a5', key: 'PER', value: '9' },
    ],
    resources: [
      { id: 'r1', name: 'Pontos de Estrutura (HP)', current: 35, max: 35, color: 'red' },
      { id: 'r2', name: 'Blindagem Corporal (SP)', current: 11, max: 11, color: 'amber' },
      { id: 'r3', name: 'Munição Restante', current: 60, max: 60, color: 'blue' },
    ],
    notes: `### Sensores & IFF
- Visão infravermelha, detector de movimento e mira laser integrada (+2 em testes de disparo à distância).

### Armamento
- **Submetralhadora Dupla Calibre .45:** Disparo único (3d6 de dano) ou Fogo Automático (até 4d6 de dano vs VD da distância).
- **Protocolo de Autodestruição:** Ao ser reduzido a 0 HP, explode após 1 rodada causando 4d6 de dano explosivo em raio de 3m.`,
  },
];
