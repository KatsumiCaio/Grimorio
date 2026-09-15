export interface GeneratePortraitParams {
  name: string;
  role: string;
  notes?: string;
  system?: string;
  artStyle?: string;
  customPrompt?: string;
  customApiKey?: string;
}

export interface GeneratePortraitResponse {
  imageUrl: string;
  prompt: string;
}

export const PORTRAIT_ART_STYLES = [
  {
    id: 'fantasy_digital',
    label: 'Fantasia Épica (D&D / d20)',
    description: 'Pintura digital de alta qualidade, iluminação dramática, estilo arte conceitual oficial.',
    promptModifier:
      'High quality epic fantasy digital painting, polished character concept art, dramatic lighting, detailed facial features, ArtStation trending style.',
  },
  {
    id: 'grimdark_oil',
    label: 'Grimdark & Óleo Sombrio (OSR)',
    description: 'Pintura a óleo sombria, paleta terrosa, sombras pesadas e estética realista crua.',
    promptModifier:
      'Dark fantasy gritty oil painting, grimdark aesthetic, heavy chiaroscuro shadows, moody subdued color palette, textured brushwork.',
  },
  {
    id: 'investigative_noir',
    label: 'Noir Anos 1920 (Call of Cthulhu)',
    description: 'Estética vintage, iluminação noir de mistério, aquarela sombria e atmosfera investigativa.',
    promptModifier:
      '1920s vintage pulp noir illustration, subdued watercolor wash, moody shadow casting, psychological mystery atmosphere, authentic period details.',
  },
  {
    id: 'ink_parchment',
    label: 'Tinta & Gravura em Pergaminho',
    description: 'Traço fino à mão com hachuras e nanquim, lembrando manuais de monstros clássicos.',
    promptModifier:
      'Intricate black ink line art etching with detailed crosshatching, vintage fantasy bestiary illustration on aged parchment texture.',
  },
  {
    id: 'cyberpunk_neon',
    label: 'Cyberpunk & Luz Neon',
    description: 'Luzes neon volumétricas, implantes cibernéticos e estética high-tech decadente.',
    promptModifier:
      'Cyberpunk sci-fi character portrait, neon rim lighting, cybernetic implants, gritty rainy megalopolis backdrop, sharp digital rendering.',
  },
  {
    id: 'jrpg_anime',
    label: 'Anime / JRPG Fantasia',
    description: 'Arte expressiva estilo ilustração de RPG japonês, olhos marcantes e cores dinâmicas.',
    promptModifier:
      'Modern fantasy anime illustration, detailed JRPG character design, vibrant clean cel-shading, expressive features, stylish cinematic lighting.',
  },
];

export async function generateCharacterPortrait(
  params: GeneratePortraitParams
): Promise<GeneratePortraitResponse> {
  const response = await fetch('/api/generate-portrait', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: params.customPrompt,
      name: params.name,
      role: params.role,
      notes: params.notes,
      system: params.system,
      artStyle: params.artStyle,
      customApiKey: params.customApiKey,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Falha ao gerar o retrato do personagem com o Imagen.');
  }

  return data;
}
