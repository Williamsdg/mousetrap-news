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

  // ============ PARK THEMES ============

  'magic-kingdom': {
    id: 'magic-kingdom',
    name: 'Magic Kingdom',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0a1628',
      deepPurple: '#0f1f3d',
      royalPurple: '#1a3a6b',
      gold: '#f0c040',
      goldLight: '#ffd86e',
      goldDark: '#c9960c',
      enchantedTeal: '#5b9bd5',
      stardust: '#a8c4e0',
      white: '#ffffff',
      offWhite: '#f5f8fc',
      cream: '#e8f0f8',
      lightGray: '#d0dce8',
      midGray: '#8a9ab0',
      darkGray: '#3a4a5e',
      nearBlack: '#0f1a2e',
      catMk: '#1a3a6b', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#f0c040', '#5b9bd5', '#a8c4e0', '#ffd86e'],
  },

  'epcot': {
    id: 'epcot',
    name: 'EPCOT',
    fonts: {
      display: "'Space Grotesk', -apple-system, sans-serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0a0e1a',
      deepPurple: '#0f1525',
      royalPurple: '#1e2a45',
      gold: '#00d4aa',
      goldLight: '#40e8c4',
      goldDark: '#00b894',
      enchantedTeal: '#c0c0c0',
      stardust: '#8899aa',
      white: '#f0f4f8',
      offWhite: '#0d1320',
      cream: '#141c2e',
      lightGray: '#1e2a3e',
      midGray: '#6a7a8e',
      darkGray: '#b0bec5',
      nearBlack: '#e0e8f0',
      catMk: '#5b9bd5', catEpcot: '#00d4aa', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#00d4aa', '#c0c0c0', '#40e8c4', '#5b9bd5'],
  },

  'hollywood-studios': {
    id: 'hollywood-studios',
    name: 'Hollywood Studios',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#1a0a0a',
      deepPurple: '#2a0f0f',
      royalPurple: '#8b1a1a',
      gold: '#f0c040',
      goldLight: '#ffd86e',
      goldDark: '#c9960c',
      enchantedTeal: '#e63946',
      stardust: '#d4a0a0',
      white: '#ffffff',
      offWhite: '#faf5f5',
      cream: '#f5ebe8',
      lightGray: '#e0d0cc',
      midGray: '#9a8580',
      darkGray: '#4a3535',
      nearBlack: '#1a0f0f',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#e63946', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#f0c040', '#e63946', '#d4a0a0', '#ffd86e'],
  },

  'animal-kingdom': {
    id: 'animal-kingdom',
    name: 'Animal Kingdom',
    fonts: {
      display: "'Merriweather', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#1a1c0a',
      deepPurple: '#2a2e12',
      royalPurple: '#4a6b2a',
      gold: '#e8a820',
      goldLight: '#f0c050',
      goldDark: '#b8860b',
      enchantedTeal: '#6b8e23',
      stardust: '#b8c890',
      white: '#ffffff',
      offWhite: '#f8f6f0',
      cream: '#f0ece0',
      lightGray: '#d8d0c0',
      midGray: '#8a8a6e',
      darkGray: '#4a4a35',
      nearBlack: '#1a1a10',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#6b8e23',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#e8a820', '#6b8e23', '#b8c890', '#f0c050'],
  },

  // ============ TOPIC THEMES ============

  'movies': {
    id: 'movies',
    name: 'Movies & Entertainment',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#12061e',
      deepPurple: '#1e0a30',
      royalPurple: '#4a1a7a',
      gold: '#f0c040',
      goldLight: '#ffd86e',
      goldDark: '#c9960c',
      enchantedTeal: '#9b59b6',
      stardust: '#c8a2e0',
      white: '#ffffff',
      offWhite: '#f8f5fc',
      cream: '#f0e8f8',
      lightGray: '#dcd0e8',
      midGray: '#9080a0',
      darkGray: '#4a3860',
      nearBlack: '#1a0e28',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#9b59b6', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#f0c040', '#9b59b6', '#c8a2e0', '#ffd86e'],
  },

  'sports': {
    id: 'sports',
    name: 'Sports',
    fonts: {
      display: "'Inter', -apple-system, sans-serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0a1428',
      deepPurple: '#0f1e38',
      royalPurple: '#1a3560',
      gold: '#ff8c00',
      goldLight: '#ffa840',
      goldDark: '#cc7000',
      enchantedTeal: '#2e86de',
      stardust: '#a0c0e0',
      white: '#ffffff',
      offWhite: '#f5f7fa',
      cream: '#e8edf5',
      lightGray: '#d0d8e4',
      midGray: '#7a8a9e',
      darkGray: '#2a3a50',
      nearBlack: '#0f1a2e',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#2e86de', catOther: '#ff8c00',
    },
    particleColors: ['#ff8c00', '#2e86de', '#ffa840', '#a0c0e0'],
  },

  'resorts': {
    id: 'resorts',
    name: 'Resorts & Hotels',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#1a1418',
      deepPurple: '#2a1e25',
      royalPurple: '#6b4a5a',
      gold: '#d4a574',
      goldLight: '#e8c098',
      goldDark: '#b08050',
      enchantedTeal: '#c9a0a0',
      stardust: '#e0ccc0',
      white: '#ffffff',
      offWhite: '#faf8f6',
      cream: '#f5f0ec',
      lightGray: '#e8ddd5',
      midGray: '#a09088',
      darkGray: '#5a4a42',
      nearBlack: '#1a1510',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#d4a574', catCross: '#74b9ff', catOther: '#ff6b9d',
    },
    particleColors: ['#d4a574', '#c9a0a0', '#e8c098', '#e0ccc0'],
  },

  'cast-members': {
    id: 'cast-members',
    name: 'Cast Members',
    fonts: {
      display: "'Inter', -apple-system, sans-serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#0a1832',
      deepPurple: '#0f2040',
      royalPurple: '#1565c0',
      gold: '#f0c040',
      goldLight: '#ffd86e',
      goldDark: '#c9960c',
      enchantedTeal: '#42a5f5',
      stardust: '#90caf9',
      white: '#ffffff',
      offWhite: '#f5f9ff',
      cream: '#e3f2fd',
      lightGray: '#c8ddf0',
      midGray: '#7a9ab8',
      darkGray: '#2a4060',
      nearBlack: '#0a1832',
      catMk: '#1565c0', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#42a5f5', catOther: '#ff6b9d',
    },
    particleColors: ['#f0c040', '#42a5f5', '#90caf9', '#ffd86e'],
  },

  'food': {
    id: 'food',
    name: 'Food & Dining',
    fonts: {
      display: "'Playfair Display', Georgia, serif",
      body: "'Inter', -apple-system, sans-serif",
      serif: "'Crimson Text', Georgia, serif",
    },
    colors: {
      midnight: '#1e0a0a',
      deepPurple: '#2e1212',
      royalPurple: '#722f37',
      gold: '#e8b830',
      goldLight: '#f0d060',
      goldDark: '#c09020',
      enchantedTeal: '#c0392b',
      stardust: '#e0b0a0',
      white: '#ffffff',
      offWhite: '#fdf8f0',
      cream: '#f8f0e0',
      lightGray: '#e8d8c8',
      midGray: '#a09080',
      darkGray: '#504030',
      nearBlack: '#1e1410',
      catMk: '#6c5ce7', catEpcot: '#00b894', catStudios: '#e17055', catAk: '#fdcb6e',
      catResorts: '#a29bfe', catCross: '#74b9ff', catOther: '#c0392b',
    },
    particleColors: ['#e8b830', '#c0392b', '#e0b0a0', '#f0d060'],
  },
}

export const themeIds = Object.keys(themes)

// Map category slugs to theme IDs
const categoryThemeMap: Record<string, string> = {
  'magic-kingdom': 'magic-kingdom',
  'epcot': 'epcot',
  'hollywood-studios': 'hollywood-studios',
  'animal-kingdom': 'animal-kingdom',
  'resorts': 'resorts',
  'movies': 'movies',
  'sports': 'sports',
  'cast-members': 'cast-members',
  'food': 'food',
  'cross-property': 'magic-kingdom', // Default fallback for cross-property
  'other': 'magic-kingdom',          // Default fallback for other
}

// Resolve theme: explicit pick > category auto-assign > hash fallback
export function resolveTheme(
  articleTheme: string | undefined,
  slug: string,
  categorySlug?: string,
): ThemeConfig {
  // 1. Explicit theme pick (not auto)
  if (articleTheme && articleTheme !== 'auto' && themes[articleTheme]) {
    return themes[articleTheme]
  }

  // 2. Auto-assign by category
  if (categorySlug && categoryThemeMap[categorySlug]) {
    const themeId = categoryThemeMap[categorySlug]
    if (themes[themeId]) return themes[themeId]
  }

  // 3. Fallback: hash-based rotation
  let hash = 0
  for (let i = 0; i < slug.length; i++) {
    const char = slug.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
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
