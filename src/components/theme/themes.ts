export interface ThemeConfig {
  id: string
  name: string
  fonts: {
    display: string
    body: string
    serif: string
  }
  colors: {
    midnight: string
    deepPurple: string
    royalPurple: string
    gold: string
    goldLight: string
    goldDark: string
    enchantedTeal: string
    stardust: string
    white: string
    offWhite: string
    cream: string
    lightGray: string
    midGray: string
    darkGray: string
    nearBlack: string
    catMk: string
    catEpcot: string
    catStudios: string
    catAk: string
    catResorts: string
    catCross: string
    catOther: string
  }
  particleColors: string[]
}

export const themes: Record<string, ThemeConfig> = {
  'enchanted-gazette': {
    id: 'enchanted-gazette',
    name: 'Enchanted Gazette',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0f0a2e',
      deepPurple: '#1a1145',
      royalPurple: '#2d1b69',
      gold: '#f0c040',
      goldLight: '#ffd86e',
      goldDark: '#c9960c',
      enchantedTeal: '#4ecdc4',
      stardust: '#b8a9e8',
      white: '#ffffff',
      offWhite: '#faf8f5',
      cream: '#f5f0e8',
      lightGray: '#e8e3da',
      midGray: '#9a9490',
      darkGray: '#4a4540',
      nearBlack: '#1a1715',
      catMk: '#6c5ce7',
      catEpcot: '#00b894',
      catStudios: '#e17055',
      catAk: '#fdcb6e',
      catResorts: '#a29bfe',
      catCross: '#74b9ff',
      catOther: '#ff6b9d',
    },
    particleColors: ['#f0c040', '#b8a9e8', '#4ecdc4', '#ffd86e'],
  },

  'storybook-chronicle': {
    id: 'storybook-chronicle',
    name: 'Storybook Chronicle',
    fonts: {
      display: "'Merriweather', Georgia, serif",
      body: "'Source Sans 3', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#1a1008',
      deepPurple: '#2c1a07',
      royalPurple: '#5c3d2e',
      gold: '#c9960c',
      goldLight: '#daa520',
      goldDark: '#8b6914',
      enchantedTeal: '#8b2252',
      stardust: '#d4a76a',
      white: '#ffffff',
      offWhite: '#f5f0e0',
      cream: '#ede5d0',
      lightGray: '#d4c9b0',
      midGray: '#8a7e6e',
      darkGray: '#4a4035',
      nearBlack: '#1a1510',
      catMk: '#5c6b2e',
      catEpcot: '#2e6b5c',
      catStudios: '#b8642e',
      catAk: '#8b7d3c',
      catResorts: '#6b4a2e',
      catCross: '#5c4a3e',
      catOther: '#a0522d',
    },
    particleColors: ['#c9960c', '#8b2252', '#daa520', '#d4a76a'],
  },

  'neon-after-dark': {
    id: 'neon-after-dark',
    name: 'Neon After Dark',
    fonts: {
      display: "'Space Grotesk', -apple-system, sans-serif",
      body: "'DM Sans', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#010409',
      deepPurple: '#0d1117',
      royalPurple: '#161b22',
      gold: '#58a6ff',
      goldLight: '#79c0ff',
      goldDark: '#388bfd',
      enchantedTeal: '#f778ba',
      stardust: '#8b949e',
      white: '#e6edf3',
      offWhite: '#0d1117',
      cream: '#161b22',
      lightGray: '#21262d',
      midGray: '#8b949e',
      darkGray: '#c9d1d9',
      nearBlack: '#e6edf3',
      catMk: '#58a6ff',
      catEpcot: '#3fb950',
      catStudios: '#f778ba',
      catAk: '#d29922',
      catResorts: '#a371f7',
      catCross: '#79c0ff',
      catOther: '#ff7b72',
    },
    particleColors: ['#58a6ff', '#f778ba', '#79c0ff', '#3fb950'],
  },

  'pixie-dust-sunrise': {
    id: 'pixie-dust-sunrise',
    name: 'Pixie Dust Sunrise',
    fonts: {
      display: "'Lora', Georgia, serif",
      body: "'Nunito', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#2D3436',
      deepPurple: '#3D2C2E',
      royalPurple: '#C0392B',
      gold: '#FFD93D',
      goldLight: '#FFE066',
      goldDark: '#E6B800',
      enchantedTeal: '#FF6B6B',
      stardust: '#FFC6C6',
      white: '#ffffff',
      offWhite: '#FFF8F0',
      cream: '#FFF0E5',
      lightGray: '#F0E0D0',
      midGray: '#B0A090',
      darkGray: '#5A4A40',
      nearBlack: '#2D2420',
      catMk: '#E74C3C',
      catEpcot: '#27AE60',
      catStudios: '#E67E22',
      catAk: '#F39C12',
      catResorts: '#8E44AD',
      catCross: '#3498DB',
      catOther: '#E91E63',
    },
    particleColors: ['#FFD93D', '#FF6B6B', '#FFC6C6', '#FFE066'],
  },

  'tomorrowland-times': {
    id: 'tomorrowland-times',
    name: 'Tomorrowland Times',
    fonts: {
      display: "'Orbitron', -apple-system, sans-serif",
      body: "'Exo 2', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0C1445',
      deepPurple: '#0A1628',
      royalPurple: '#1A2A5E',
      gold: '#00F5D4',
      goldLight: '#4FFFDF',
      goldDark: '#00C9AB',
      enchantedTeal: '#FF6B35',
      stardust: '#C0C0C0',
      white: '#F0F0FF',
      offWhite: '#0E1830',
      cream: '#141E3C',
      lightGray: '#1E2D52',
      midGray: '#8090B0',
      darkGray: '#C0CCE0',
      nearBlack: '#F0F0FF',
      catMk: '#00F5D4',
      catEpcot: '#4FFFDF',
      catStudios: '#FF6B35',
      catAk: '#FFD93D',
      catResorts: '#A78BFA',
      catCross: '#60A5FA',
      catOther: '#F472B6',
    },
    particleColors: ['#00F5D4', '#FF6B35', '#C0C0C0', '#4FFFDF'],
  },
}

export const themeIds = Object.keys(themes)

// Deterministic theme assignment based on slug hash
export function resolveTheme(
  articleTheme: string | undefined,
  slug: string,
  rotationStrategy: string = 'sequential'
): ThemeConfig {
  if (articleTheme && articleTheme !== 'auto' && themes[articleTheme]) {
    return themes[articleTheme]
  }

  // Auto rotation
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    const char = slug.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % themeIds.length
  return themes[themeIds[index]]
}

// Convert theme config to CSS custom properties
export function themeToCSSVars(theme: ThemeConfig): Record<string, string> {
  return {
    '--midnight': theme.colors.midnight,
    '--deep-purple': theme.colors.deepPurple,
    '--royal-purple': theme.colors.royalPurple,
    '--gold': theme.colors.gold,
    '--gold-light': theme.colors.goldLight,
    '--gold-dark': theme.colors.goldDark,
    '--enchanted-teal': theme.colors.enchantedTeal,
    '--stardust': theme.colors.stardust,
    '--white': theme.colors.white,
    '--off-white': theme.colors.offWhite,
    '--cream': theme.colors.cream,
    '--light-gray': theme.colors.lightGray,
    '--mid-gray': theme.colors.midGray,
    '--dark-gray': theme.colors.darkGray,
    '--near-black': theme.colors.nearBlack,
    '--cat-mk': theme.colors.catMk,
    '--cat-epcot': theme.colors.catEpcot,
    '--cat-studios': theme.colors.catStudios,
    '--cat-ak': theme.colors.catAk,
    '--cat-resorts': theme.colors.catResorts,
    '--cat-cross': theme.colors.catCross,
    '--cat-other': theme.colors.catOther,
    '--font-display': theme.fonts.display,
    '--font-body': theme.fonts.body,
    '--font-serif': theme.fonts.serif,
  }
}
