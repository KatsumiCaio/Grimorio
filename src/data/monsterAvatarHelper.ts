// Helper to generate elegant vector tokens for RPG Bestiary monsters
export function getMonsterAvatar(
  iconType:
    | 'dragon'
    | 'skull'
    | 'eye'
    | 'tentacle'
    | 'beast'
    | 'goblin'
    | 'spider'
    | 'demon'
    | 'slime'
    | 'elemental_fire'
    | 'elemental_water'
    | 'giant'
    | 'golem'
    | 'vampire'
    | 'mummy'
    | 'hydra'
    | 'mimic',
  primaryColor: string,
  secondaryColor: string,
  darkBg: string
): string {
  let iconSvg = '';

  switch (iconType) {
    case 'dragon':
      iconSvg = `
        <path d="M50 85 Q30 35 10 30 Q40 50 65 75 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="1.5"/>
        <path d="M150 85 Q170 35 190 30 Q160 50 135 75 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="1.5"/>
        <path d="M60 80 L100 160 L140 80 Q100 60 60 80 Z" fill="${secondaryColor}"/>
        <polygon points="75,95 90,100 80,105" fill="#fef08a"/>
        <polygon points="125,95 110,100 120,105" fill="#fef08a"/>
        <circle cx="93" cy="140" r="3" fill="#1c0404"/>
        <circle cx="107" cy="140" r="3" fill="#1c0404"/>
      `;
      break;
    case 'eye':
      iconSvg = `
        <circle cx="100" cy="105" r="50" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <circle cx="100" cy="95" r="22" fill="#fef08a"/>
        <ellipse cx="100" cy="95" rx="5" ry="16" fill="#1e1b4b"/>
        <path d="M70 135 Q100 155 130 135 Z" fill="#0f051d" stroke="${secondaryColor}" stroke-width="2"/>
        <path d="M65 65 Q45 35 50 20" stroke="${primaryColor}" stroke-width="4" fill="none"/>
        <circle cx="50" cy="20" r="6" fill="${secondaryColor}"/>
        <path d="M100 55 Q100 25 100 15" stroke="${primaryColor}" stroke-width="4" fill="none"/>
        <circle cx="100" cy="15" r="6" fill="${secondaryColor}"/>
        <path d="M135 65 Q155 35 150 20" stroke="${primaryColor}" stroke-width="4" fill="none"/>
        <circle cx="150" cy="20" r="6" fill="${secondaryColor}"/>
      `;
      break;
    case 'tentacle':
      iconSvg = `
        <path d="M70 40 Q100 20 130 40 Q145 75 130 110 Q100 130 70 110 Z" fill="${primaryColor}"/>
        <ellipse cx="85" cy="65" rx="6" ry="12" fill="#c7d2fe"/>
        <ellipse cx="115" cy="65" rx="6" ry="12" fill="#c7d2fe"/>
        <path d="M85 95 Q75 130 65 160 Q60 170 70 175" stroke="${secondaryColor}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M95 98 Q92 135 90 170 Q88 180 98 182" stroke="${secondaryColor}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M105 98 Q108 135 110 170 Q112 180 102 182" stroke="${secondaryColor}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M115 95 Q125 130 135 160 Q140 170 130 175" stroke="${secondaryColor}" stroke-width="5" fill="none" stroke-linecap="round"/>
      `;
      break;
    case 'goblin':
      iconSvg = `
        <polygon points="40,80 10,60 50,110" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2"/>
        <polygon points="160,80 190,60 150,110" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2"/>
        <circle cx="100" cy="110" r="45" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <circle cx="85" cy="100" r="8" fill="#dc2626"/>
        <circle cx="85" cy="100" r="3" fill="#fef08a"/>
        <circle cx="115" cy="100" r="8" fill="#dc2626"/>
        <circle cx="115" cy="100" r="3" fill="#fef08a"/>
        <path d="M80 135 L90 130 L100 138 L110 130 L120 135" stroke="#052e16" stroke-width="4" fill="none" stroke-linecap="round"/>
      `;
      break;
    case 'beast':
      iconSvg = `
        <circle cx="100" cy="100" r="50" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <circle cx="75" cy="85" r="16" fill="#f59e0b" stroke="#451a03" stroke-width="3"/>
        <circle cx="75" cy="85" r="7" fill="#18181b"/>
        <circle cx="125" cy="85" r="16" fill="#f59e0b" stroke="#451a03" stroke-width="3"/>
        <circle cx="125" cy="85" r="7" fill="#18181b"/>
        <polygon points="100,95 90,130 110,130" fill="${secondaryColor}" stroke="#451a03" stroke-width="2"/>
        <polygon points="60,50 75,65 50,70" fill="${secondaryColor}"/>
        <polygon points="140,50 125,65 150,70" fill="${secondaryColor}"/>
      `;
      break;
    case 'skull':
      iconSvg = `
        <path d="M60 70 Q100 20 140 70 Q145 105 130 125 L125 155 L75 155 L70 125 Q55 105 60 70 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <ellipse cx="80" cy="90" rx="12" ry="16" fill="#09090b"/>
        <ellipse cx="120" cy="90" rx="12" ry="16" fill="#09090b"/>
        <polygon points="100,105 92,125 108,125" fill="#09090b"/>
        <line x1="88" y1="140" x2="88" y2="155" stroke="#09090b" stroke-width="3"/>
        <line x1="100" y1="140" x2="100" y2="155" stroke="#09090b" stroke-width="3"/>
        <line x1="112" y1="140" x2="112" y2="155" stroke="#09090b" stroke-width="3"/>
      `;
      break;
    case 'spider':
      iconSvg = `
        <ellipse cx="100" cy="115" rx="35" ry="42" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <circle cx="100" cy="72" r="22" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2"/>
        <circle cx="92" cy="70" r="3" fill="#ef4444"/>
        <circle cx="108" cy="70" r="3" fill="#ef4444"/>
        <circle cx="86" cy="78" r="2" fill="#ef4444"/>
        <circle cx="114" cy="78" r="2" fill="#ef4444"/>
        <!-- Legs -->
        <path d="M75 75 Q40 50 25 80" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <path d="M70 95 Q30 90 20 120" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <path d="M70 115 Q30 130 25 160" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <path d="M125 75 Q160 50 175 80" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <path d="M130 95 Q170 90 180 120" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <path d="M130 115 Q170 130 175 160" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
      `;
      break;
    case 'demon':
      iconSvg = `
        <!-- Horns -->
        <path d="M60 70 Q30 20 15 25 Q35 50 55 80" fill="${secondaryColor}" stroke="#991b1b" stroke-width="2"/>
        <path d="M140 70 Q170 20 185 25 Q165 50 145 80" fill="${secondaryColor}" stroke="#991b1b" stroke-width="2"/>
        <!-- Fiendish face -->
        <path d="M60 75 L100 160 L140 75 Q100 50 60 75 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <polygon points="75,90 90,95 80,105" fill="#fef08a"/>
        <polygon points="125,90 110,95 120,105" fill="#fef08a"/>
        <path d="M85 130 Q100 150 115 130" stroke="#450a0a" stroke-width="4" fill="none"/>
      `;
      break;
    case 'slime':
      iconSvg = `
        <!-- Translucent gelatinous block / blob -->
        <path d="M50 70 Q100 45 150 70 Q165 110 150 150 Q100 170 50 150 Q35 110 50 70 Z" fill="${primaryColor}" fill-opacity="0.85" stroke="${secondaryColor}" stroke-width="3"/>
        <!-- Floating skull/bones trapped inside -->
        <circle cx="85" cy="100" r="10" fill="#fef9c3" fill-opacity="0.8"/>
        <circle cx="82" cy="98" r="2.5" fill="#18181b"/>
        <circle cx="88" cy="98" r="2.5" fill="#18181b"/>
        <path d="M110 115 L130 130" stroke="#fef9c3" stroke-width="3" stroke-linecap="round"/>
        <circle cx="105" cy="80" r="4" fill="#ffffff" fill-opacity="0.6"/>
        <circle cx="135" cy="105" r="5" fill="#ffffff" fill-opacity="0.6"/>
      `;
      break;
    case 'elemental_fire':
      iconSvg = `
        <path d="M100 20 Q120 60 145 80 Q165 105 145 145 Q125 175 100 180 Q75 175 55 145 Q35 105 55 80 Q80 60 100 20 Z" fill="${secondaryColor}"/>
        <path d="M100 50 Q115 80 130 100 Q140 120 125 150 Q110 170 100 170 Q90 170 75 150 Q60 120 70 100 Q85 80 100 50 Z" fill="${primaryColor}"/>
        <ellipse cx="88" cy="115" rx="5" ry="9" fill="#fef08a"/>
        <ellipse cx="112" cy="115" rx="5" ry="9" fill="#fef08a"/>
      `;
      break;
    case 'elemental_water':
      iconSvg = `
        <path d="M100 25 C60 70 45 105 45 135 A55 55 0 0 0 155 135 C155 105 140 70 100 25 Z" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <path d="M80 110 Q100 130 120 110" stroke="${secondaryColor}" stroke-width="4" fill="none"/>
        <circle cx="85" cy="95" r="6" fill="#e0f2fe"/>
        <circle cx="115" cy="95" r="6" fill="#e0f2fe"/>
      `;
      break;
    case 'giant':
      iconSvg = `
        <rect x="50" y="55" width="100" height="110" rx="20" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <circle cx="80" cy="90" r="8" fill="#fef08a"/>
        <circle cx="120" cy="90" r="8" fill="#fef08a"/>
        <path d="M75 130 Q100 150 125 130" stroke="#09090b" stroke-width="5" fill="none" stroke-linecap="round"/>
        <polygon points="90,130 95,118 100,130" fill="#ffffff"/>
        <polygon points="105,130 110,118 115,130" fill="#ffffff"/>
      `;
      break;
    case 'golem':
      iconSvg = `
        <rect x="50" y="45" width="100" height="110" rx="16" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="4"/>
        <rect x="70" y="75" width="60" height="16" rx="4" fill="#09090b"/>
        <circle cx="82" cy="83" r="5" fill="${secondaryColor}"/>
        <circle cx="118" cy="83" r="5" fill="${secondaryColor}"/>
        <!-- Rivets and iron plating -->
        <circle cx="60" cy="55" r="3" fill="${secondaryColor}"/>
        <circle cx="140" cy="55" r="3" fill="${secondaryColor}"/>
        <circle cx="60" cy="145" r="3" fill="${secondaryColor}"/>
        <circle cx="140" cy="145" r="3" fill="${secondaryColor}"/>
        <line x1="100" y1="95" x2="100" y2="155" stroke="${secondaryColor}" stroke-width="3"/>
      `;
      break;
    case 'vampire':
      iconSvg = `
        <!-- High Dracula-style collar -->
        <path d="M40 160 L50 60 L80 110 Z" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
        <path d="M160 160 L150 60 L120 110 Z" fill="#7f1d1d" stroke="#ef4444" stroke-width="1.5"/>
        <ellipse cx="100" cy="95" rx="36" ry="44" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="2"/>
        <circle cx="85" cy="88" r="6" fill="#dc2626"/>
        <circle cx="115" cy="88" r="6" fill="#dc2626"/>
        <path d="M85 120 Q100 128 115 120" stroke="#450a0a" stroke-width="3" fill="none"/>
        <polygon points="88,120 91,128 94,120" fill="#ffffff"/>
        <polygon points="106,120 109,128 112,120" fill="#ffffff"/>
      `;
      break;
    case 'mummy':
      iconSvg = `
        <ellipse cx="100" cy="100" rx="42" ry="52" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <!-- Wrappings -->
        <path d="M60 80 Q100 90 140 80" stroke="${secondaryColor}" stroke-width="3" fill="none"/>
        <path d="M58 100 Q100 110 142 100" stroke="${secondaryColor}" stroke-width="3" fill="none"/>
        <path d="M62 120 Q100 130 138 120" stroke="${secondaryColor}" stroke-width="3" fill="none"/>
        <rect x="75" y="86" width="50" height="12" fill="#09090b"/>
        <circle cx="86" cy="92" r="3" fill="#facc15"/>
        <circle cx="114" cy="92" r="3" fill="#facc15"/>
      `;
      break;
    case 'hydra':
      iconSvg = `
        <!-- Multi dragon serpentine necks -->
        <path d="M70 140 Q40 90 55 50" stroke="${primaryColor}" stroke-width="8" fill="none"/>
        <circle cx="55" cy="48" r="14" fill="${secondaryColor}"/>
        <path d="M100 150 Q100 80 100 40" stroke="${primaryColor}" stroke-width="8" fill="none"/>
        <circle cx="100" cy="38" r="14" fill="${secondaryColor}"/>
        <path d="M130 140 Q160 90 145 50" stroke="${primaryColor}" stroke-width="8" fill="none"/>
        <circle cx="145" cy="48" r="14" fill="${secondaryColor}"/>
        <circle cx="52" cy="46" r="3" fill="#fef08a"/>
        <circle cx="98" cy="36" r="3" fill="#fef08a"/>
        <circle cx="143" cy="46" r="3" fill="#fef08a"/>
      `;
      break;
    case 'mimic':
      iconSvg = `
        <!-- Ornate wooden chest that sprouted giant fangs and a tongue -->
        <rect x="45" y="65" width="110" height="75" rx="8" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>
        <line x1="45" y1="95" x2="155" y2="95" stroke="#18181b" stroke-width="5"/>
        <polygon points="65,95 72,112 80,95" fill="#fef9c3"/>
        <polygon points="90,95 97,114 105,95" fill="#fef9c3"/>
        <polygon points="120,95 127,112 135,95" fill="#fef9c3"/>
        <!-- Slime tongue -->
        <path d="M100 100 Q125 130 110 160 Q95 170 85 150 Q95 130 95 100" fill="#f43f5e"/>
      `;
      break;
    default:
      iconSvg = `<circle cx="100" cy="100" r="45" fill="${primaryColor}" stroke="${secondaryColor}" stroke-width="3"/>`;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <defs>
        <radialGradient id="bg_${iconType}" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="${primaryColor}" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="${darkBg}"/>
        </radialGradient>
      </defs>
      <rect width="200" height="200" rx="24" fill="url(#bg_${iconType})"/>
      <rect x="6" y="6" width="188" height="188" rx="20" fill="none" stroke="${secondaryColor}" stroke-width="1.5" stroke-opacity="0.3"/>
      <circle cx="100" cy="100" r="82" fill="none" stroke="${secondaryColor}" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.25"/>
      ${iconSvg}
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
