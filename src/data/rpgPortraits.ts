export interface RPGPortraitPreset {
  id: string;
  name: string;
  category: 'fantasy' | 'grimdark' | 'noir' | 'cyberpunk';
  role: string;
  avatarSvg: string; // Data URI or inline SVG
}

// High-quality SVG avatars encoded as clean SVGs with rich gradients and iconography
export const RPG_PORTRAIT_PRESETS: RPGPortraitPreset[] = [
  {
    id: 'warrior_knight',
    name: 'Cavaleiro de Aço',
    category: 'fantasy',
    role: 'Guerreiro / Paladino',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1e293b"/>
            <stop offset="100%" stop-color="#0f172a"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fbbf24"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
          <linearGradient id="steel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#94a3b8"/>
            <stop offset="100%" stop-color="#334155"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#g1)"/>
        <circle cx="100" cy="100" r="80" fill="#1e293b" stroke="url(#gold)" stroke-width="3" stroke-dasharray="4 2"/>
        <!-- Shield & Helmet -->
        <path d="M100 40 L140 60 L140 110 Q140 150 100 165 Q60 150 60 110 L60 60 Z" fill="url(#steel)" stroke="#cbd5e1" stroke-width="2"/>
        <!-- Gold cross on crest -->
        <path d="M100 55 L100 135 M75 85 L125 85" stroke="url(#gold)" stroke-width="6" stroke-linecap="round"/>
        <!-- Visor slit -->
        <rect x="80" y="82" width="40" height="6" rx="2" fill="#090d16"/>
        <circle cx="100" cy="100" r="10" fill="url(#gold)"/>
      </svg>
    `)}`,
  },
  {
    id: 'arcane_mage',
    name: 'Arquimaga Arcana',
    category: 'fantasy',
    role: 'Mago / Feiticeiro',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_mage" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#2e1065"/>
            <stop offset="100%" stop-color="#0f051d"/>
          </linearGradient>
          <linearGradient id="mystic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c084fc"/>
            <stop offset="100%" stop-color="#7c3aed"/>
          </linearGradient>
          <radialGradient id="orb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fdf4ff"/>
            <stop offset="50%" stop-color="#a855f7"/>
            <stop offset="100%" stop-color="#581c87"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_mage)"/>
        <!-- Mystic Rune Circle -->
        <circle cx="100" cy="100" r="75" fill="none" stroke="url(#mystic)" stroke-width="2" opacity="0.6"/>
        <circle cx="100" cy="100" r="60" fill="none" stroke="#e9d5ff" stroke-width="1" stroke-dasharray="6 4" opacity="0.8"/>
        <!-- Wizard Hat / Cowl -->
        <path d="M100 35 L145 140 L55 140 Z" fill="#3b0764" stroke="url(#mystic)" stroke-width="2"/>
        <ellipse cx="100" cy="140" rx="60" ry="14" fill="#581c87" stroke="url(#mystic)" stroke-width="2"/>
        <!-- Glowing Arcane Orb -->
        <circle cx="100" cy="105" r="22" fill="url(#orb)"/>
        <!-- Sparks -->
        <polygon points="100,75 103,83 111,85 103,87 100,95 97,87 89,85 97,83" fill="#f0abfc"/>
        <polygon points="135,110 137,115 142,116 137,118 135,123 133,118 128,116 133,115" fill="#f0abfc"/>
      </svg>
    `)}`,
  },
  {
    id: 'shadow_rogue',
    name: 'Ladino das Sombras',
    category: 'fantasy',
    role: 'Ladino / Assassino',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_rogue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#18181b"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#881337"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_rogue)"/>
        <!-- Shadow Hood -->
        <path d="M100 35 C65 35 50 85 50 145 L150 145 C150 85 135 35 100 35 Z" fill="#27272a" stroke="#3f3f46" stroke-width="2"/>
        <path d="M100 50 C80 50 68 85 68 135 L132 135 C132 85 120 50 100 50 Z" fill="#09090b"/>
        <!-- Glowing Eyes -->
        <ellipse cx="86" cy="100" rx="7" ry="3" fill="#fb7185" transform="rotate(-10 86 100)"/>
        <ellipse cx="114" cy="100" rx="7" ry="3" fill="#fb7185" transform="rotate(10 114 100)"/>
        <!-- Dagger Silhouettes -->
        <path d="M40 160 L65 115 L70 120 L48 165 Z" fill="url(#blade)"/>
        <path d="M160 160 L135 115 L130 120 L152 165 Z" fill="url(#blade)"/>
      </svg>
    `)}`,
  },
  {
    id: 'holy_cleric',
    name: 'Clérigo da Luz',
    category: 'fantasy',
    role: 'Clérigo / Curandeiro',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_cleric" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#022c22"/>
            <stop offset="100%" stop-color="#064e3b"/>
          </linearGradient>
          <linearGradient id="radiance" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="100%" stop-color="#eab308"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_cleric)"/>
        <!-- Sun Rays Halo -->
        <g stroke="url(#radiance)" stroke-width="3" stroke-linecap="round" opacity="0.8">
          <line x1="100" y1="20" x2="100" y2="40"/>
          <line x1="100" y1="160" x2="100" y2="180"/>
          <line x1="20" y1="100" x2="40" y2="100"/>
          <line x1="160" y1="100" x2="180" y2="100"/>
          <line x1="43" y1="43" x2="58" y2="58"/>
          <line x1="142" y1="142" x2="157" y2="157"/>
          <line x1="157" y1="43" x2="142" y2="58"/>
          <line x1="58" y1="142" x2="43" y2="157"/>
        </g>
        <circle cx="100" cy="100" r="50" fill="#047857" stroke="url(#radiance)" stroke-width="3"/>
        <!-- Holy Cross / Symbol -->
        <path d="M100 70 L100 130 M80 88 L120 88" stroke="url(#radiance)" stroke-width="8" stroke-linecap="round"/>
        <circle cx="100" cy="88" r="7" fill="#fef9c3"/>
      </svg>
    `)}`,
  },
  {
    id: 'forest_ranger',
    name: 'Patrulheiro Selvagem',
    category: 'fantasy',
    role: 'Ranger / Druida',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_ranger" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#14532d"/>
            <stop offset="100%" stop-color="#052e16"/>
          </linearGradient>
          <linearGradient id="wood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#d97706"/>
            <stop offset="100%" stop-color="#78350f"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_ranger)"/>
        <!-- Leaves circle -->
        <circle cx="100" cy="100" r="75" fill="none" stroke="#22c55e" stroke-width="2" stroke-dasharray="8 6" opacity="0.5"/>
        <!-- Bow & Arrow -->
        <path d="M70 40 Q130 100 70 160" fill="none" stroke="url(#wood)" stroke-width="6" stroke-linecap="round"/>
        <line x1="70" y1="40" x2="70" y2="160" stroke="#86efac" stroke-width="1.5"/>
        <!-- Arrow -->
        <line x1="50" y1="100" x2="140" y2="100" stroke="#e2e8f0" stroke-width="3" stroke-linecap="round"/>
        <polygon points="145,100 135,94 135,106" fill="#22c55e"/>
        <!-- Fletching -->
        <path d="M50 95 L40 90 M50 105 L40 110 M55 95 L45 90 M55 105 L45 110" stroke="#86efac" stroke-width="2"/>
      </svg>
    `)}`,
  },
  {
    id: 'raging_barbarian',
    name: 'Bárbaro Furioso',
    category: 'fantasy',
    role: 'Bárbaro / Berserker',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_barb" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#7f1d1d"/>
            <stop offset="100%" stop-color="#450a0a"/>
          </linearGradient>
          <linearGradient id="iron" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#e2e8f0"/>
            <stop offset="100%" stop-color="#64748b"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_barb)"/>
        <!-- Battleaxe -->
        <g transform="translate(100 100) rotate(45) translate(-100 -100)">
          <!-- Axe shaft -->
          <line x1="100" y1="25" x2="100" y2="175" stroke="#78350f" stroke-width="8" stroke-linecap="round"/>
          <!-- Double Axe Blades -->
          <path d="M100 50 C140 30 150 90 100 80 Z" fill="url(#iron)" stroke="#f87171" stroke-width="2"/>
          <path d="M100 50 C60 30 50 90 100 80 Z" fill="url(#iron)" stroke="#f87171" stroke-width="2"/>
          <!-- Spikes -->
          <polygon points="100,20 95,35 105,35" fill="#e2e8f0"/>
        </g>
        <!-- War paint marks -->
        <line x1="50" y1="130" x2="80" y2="150" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
        <line x1="150" y1="130" x2="120" y2="150" stroke="#ef4444" stroke-width="4" stroke-linecap="round"/>
      </svg>
    `)}`,
  },
  {
    id: 'charming_bard',
    name: 'Bardo Encantador',
    category: 'fantasy',
    role: 'Bardo / Ilusionista',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_bard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#831843"/>
            <stop offset="100%" stop-color="#500724"/>
          </linearGradient>
          <linearGradient id="lute" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_bard)"/>
        <!-- Lute Body -->
        <ellipse cx="100" cy="120" rx="42" ry="46" fill="url(#lute)" stroke="#fde68a" stroke-width="2"/>
        <ellipse cx="100" cy="115" rx="14" ry="14" fill="#451a03"/>
        <!-- Lute Neck -->
        <rect x="94" y="45" width="12" height="60" fill="#78350f" rx="3"/>
        <path d="M88 40 L112 40 L108 25 L92 25 Z" fill="#92400e"/>
        <!-- Strings -->
        <line x1="97" y1="28" x2="97" y2="150" stroke="#fef08a" stroke-width="1"/>
        <line x1="100" y1="28" x2="100" y2="150" stroke="#fef08a" stroke-width="1"/>
        <line x1="103" y1="28" x2="103" y2="150" stroke="#fef08a" stroke-width="1"/>
        <!-- Musical notes -->
        <path d="M40 70 Q45 55 55 60 L55 85 A5 5 0 1 1 50 80 L50 65" fill="#f472b6"/>
        <path d="M150 70 Q155 55 165 60 L165 85 A5 5 0 1 1 160 80 L160 65" fill="#f472b6"/>
      </svg>
    `)}`,
  },
  {
    id: 'grim_necromancer',
    name: 'Necromante Espectral',
    category: 'grimdark',
    role: 'Bruxo / Necromante',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_necro" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#064e3b"/>
            <stop offset="100%" stop-color="#02140d"/>
          </linearGradient>
          <radialGradient id="souls" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#6ee7b7"/>
            <stop offset="100%" stop-color="#047857"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_necro)"/>
        <!-- Green Ghost Flame -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="#10b981" stroke-width="2" opacity="0.4"/>
        <!-- Skull -->
        <path d="M70 85 C70 55 130 55 130 85 C130 100 120 108 120 120 L80 120 C80 108 70 100 70 85 Z" fill="#d1d5db" stroke="#9ca3af" stroke-width="2"/>
        <!-- Jaw -->
        <path d="M85 120 L85 135 L115 135 L115 120 Z" fill="#9ca3af"/>
        <!-- Teeth lines -->
        <line x1="92" y1="120" x2="92" y2="135" stroke="#1f2937" stroke-width="1.5"/>
        <line x1="100" y1="120" x2="100" y2="135" stroke="#1f2937" stroke-width="1.5"/>
        <line x1="108" y1="120" x2="108" y2="135" stroke="#1f2937" stroke-width="1.5"/>
        <!-- Eye Sockets with green soul flame -->
        <ellipse cx="85" cy="90" rx="8" ry="10" fill="#047857"/>
        <circle cx="85" cy="90" r="4" fill="#a7f3d0"/>
        <ellipse cx="115" cy="90" rx="8" ry="10" fill="#047857"/>
        <circle cx="115" cy="90" r="4" fill="#a7f3d0"/>
        <!-- Nose hole -->
        <polygon points="100,102 96,110 104,110" fill="#1f2937"/>
      </svg>
    `)}`,
  },
  {
    id: 'cthulhu_detective',
    name: 'Investigador Ocultista',
    category: 'noir',
    role: 'Detetive / Ocultista (CoC)',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_noir" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#27272a"/>
            <stop offset="100%" stop-color="#09090b"/>
          </linearGradient>
          <linearGradient id="sepia" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f5d0a9"/>
            <stop offset="100%" stop-color="#8c5e32"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_noir)"/>
        <!-- Vintage Fedora Hat -->
        <path d="M40 90 Q100 80 160 90 Q100 95 40 90 Z" fill="#52525b" stroke="#71717a" stroke-width="1.5"/>
        <path d="M65 88 C65 50 135 50 135 88 Z" fill="#3f3f46" stroke="#71717a" stroke-width="1.5"/>
        <rect x="68" y="76" width="64" height="8" fill="#18181b"/>
        <!-- Trench Coat Lapels -->
        <polygon points="70,125 50,170 100,170" fill="#3f3f46"/>
        <polygon points="130,125 150,170 100,170" fill="#3f3f46"/>
        <!-- Magnifying Glass / Occult Lens -->
        <circle cx="100" cy="120" r="16" fill="none" stroke="#eab308" stroke-width="3"/>
        <line x1="112" y1="132" x2="128" y2="148" stroke="#eab308" stroke-width="4" stroke-linecap="round"/>
        <!-- Tentacle silhouette in background -->
        <path d="M150 40 Q170 80 155 120" fill="none" stroke="#059669" stroke-width="2" stroke-dasharray="3 3"/>
      </svg>
    `)}`,
  },
  {
    id: 'cyberpunk_netrunner',
    name: 'Netrunner Cibernético',
    category: 'cyberpunk',
    role: 'Hacker / Mercenário Sci-Fi',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_cyber" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a"/>
            <stop offset="100%" stop-color="#020617"/>
          </linearGradient>
          <linearGradient id="neon_cyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#22d3ee"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
          <linearGradient id="neon_pink" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/>
            <stop offset="100%" stop-color="#ec4899"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_cyber)"/>
        <!-- Grid lines -->
        <line x1="0" y1="100" x2="200" y2="100" stroke="#1e293b" stroke-width="1"/>
        <line x1="100" y1="0" x2="100" y2="200" stroke="#1e293b" stroke-width="1"/>
        <!-- Head Silhouette -->
        <path d="M70 70 C70 45 130 45 130 70 L125 125 C125 140 100 150 100 150 C100 150 75 140 75 125 Z" fill="#1e293b" stroke="#334155" stroke-width="2"/>
        <!-- Cyber Visor / HUD -->
        <polygon points="65,78 135,78 128,98 72,98" fill="url(#neon_cyan)"/>
        <line x1="70" y1="88" x2="130" y2="88" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="8 3"/>
        <!-- Data Jack / Temples -->
        <rect x="58" y="80" width="8" height="15" fill="#f43f5e" rx="2"/>
        <rect x="134" y="80" width="8" height="15" fill="#f43f5e" rx="2"/>
        <circle cx="100" cy="120" r="4" fill="url(#neon_pink)"/>
        <!-- Neon collar -->
        <path d="M70 150 L100 165 L130 150 L145 180 L55 180 Z" fill="#0f172a" stroke="url(#neon_pink)" stroke-width="1.5"/>
      </svg>
    `)}`,
  },
  {
    id: 'martial_monk',
    name: 'Mestre Marcial',
    category: 'fantasy',
    role: 'Monge / Combatente Desarmado',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_monk" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#78350f"/>
            <stop offset="100%" stop-color="#291102"/>
          </linearGradient>
          <radialGradient id="ki_flow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="70%" stop-color="#f59e0b"/>
            <stop offset="100%" stop-color="#b45309"/>
          </radialGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_monk)"/>
        <!-- Yin-Yang / Ki Circle -->
        <circle cx="100" cy="100" r="70" fill="none" stroke="#fbbf24" stroke-width="3" stroke-dasharray="12 4"/>
        <circle cx="100" cy="100" r="40" fill="url(#ki_flow)"/>
        <!-- Fist / Hand Silhouette -->
        <path d="M90 70 L110 70 L115 110 C115 125 85 125 85 110 Z" fill="#451a03"/>
        <circle cx="100" cy="100" r="12" fill="#fef08a"/>
        <!-- Prayer beads -->
        <circle cx="70" cy="140" r="6" fill="#f59e0b"/>
        <circle cx="85" cy="148" r="6" fill="#f59e0b"/>
        <circle cx="100" cy="150" r="7" fill="#fbbf24"/>
        <circle cx="115" cy="148" r="6" fill="#f59e0b"/>
        <circle cx="130" cy="140" r="6" fill="#f59e0b"/>
      </svg>
    `)}`,
  },
  {
    id: 'ancient_dragon_npc',
    name: 'Dragão Ancião / Guardião',
    category: 'grimdark',
    role: 'Criatura / Monstro Lendário',
    avatarSvg: `data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
        <defs>
          <linearGradient id="bg_dragon" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#450a0a"/>
            <stop offset="100%" stop-color="#1c0404"/>
          </linearGradient>
          <linearGradient id="fire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#fef08a"/>
            <stop offset="50%" stop-color="#f97316"/>
            <stop offset="100%" stop-color="#dc2626"/>
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill="url(#bg_dragon)"/>
        <!-- Dragon Horns -->
        <path d="M70 70 Q40 30 20 40 Q45 65 65 85 Z" fill="#991b1b" stroke="#f87171" stroke-width="1.5"/>
        <path d="M130 70 Q160 30 180 40 Q155 65 135 85 Z" fill="#991b1b" stroke="#f87171" stroke-width="1.5"/>
        <!-- Dragon Snout -->
        <polygon points="100,55 135,115 100,165 65,115" fill="#7f1d1d" stroke="#fca5a5" stroke-width="2"/>
        <!-- Slit Reptilian Eyes -->
        <polygon points="80,100 86,95 86,105" fill="url(#fire)"/>
        <line x1="83" y1="94" x2="83" y2="106" stroke="#000000" stroke-width="2"/>
        <polygon points="120,100 114,95 114,105" fill="url(#fire)"/>
        <line x1="117" y1="94" x2="117" y2="106" stroke="#000000" stroke-width="2"/>
        <!-- Smoke / Ember nostrils -->
        <circle cx="94" cy="145" r="3" fill="#f97316"/>
        <circle cx="106" cy="145" r="3" fill="#f97316"/>
      </svg>
    `)}`,
  },
];
