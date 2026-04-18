import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

const categories = [
  { _id: 'cat-magic-kingdom', _type: 'category', title: 'Magic Kingdom', slug: { _type: 'slug', current: 'magic-kingdom' }, icon: '🏰', color: '#6c5ce7', description: 'All the fake news from the most magical place on earth.' },
  { _id: 'cat-epcot', _type: 'category', title: 'EPCOT', slug: { _type: 'slug', current: 'epcot' }, icon: '🌐', color: '#00b894', description: 'Spaceship Earth and beyond — none of it real.' },
  { _id: 'cat-hollywood-studios', _type: 'category', title: 'Hollywood Studios', slug: { _type: 'slug', current: 'hollywood-studios' }, icon: '🎬', color: '#e17055', description: 'Tower of Terror headlines that are truly terrifying (and fake).' },
  { _id: 'cat-animal-kingdom', _type: 'category', title: 'Animal Kingdom', slug: { _type: 'slug', current: 'animal-kingdom' }, icon: '🦁', color: '#fdcb6e', description: 'Wild stories from the wild side of Disney.' },
  { _id: 'cat-resorts', _type: 'category', title: 'Resorts', slug: { _type: 'slug', current: 'resorts' }, icon: '🏨', color: '#a29bfe', description: 'Resort news that\'s too good to be true (because it isn\'t).' },
  { _id: 'cat-cross-property', _type: 'category', title: 'Cross Property', slug: { _type: 'slug', current: 'cross-property' }, icon: '🚌', color: '#74b9ff', description: 'Stories that span the entire Disney World property.' },
  { _id: 'cat-other', _type: 'category', title: 'Other', slug: { _type: 'slug', current: 'other' }, icon: '💫', color: '#ff6b9d', description: 'Everything else we made up.' },
]

const author = {
  _id: 'author-mousetrap',
  _type: 'author',
  name: 'Mouse Trap News',
  slug: { _type: 'slug', current: 'mouse-trap-news' },
  bio: 'The world\'s best satire and parody site for Disney Parks news. Created by Michael Morrow, who has visited Disney World over 30 times and has 500,000+ followers across social media. As seen on The Tonight Show and Saturday Night Live.',
  social: {
    tiktok: 'https://www.tiktok.com/@mousetrapnews',
    instagram: 'https://www.instagram.com/mousetrapnews/',
    facebook: 'https://www.facebook.com/mousetrapnews/',
    twitter: 'https://x.com/mousetrapnews',
  },
}

const siteSettings = {
  _id: 'siteSettings',
  _type: 'siteSettings',
  siteName: 'Mouse Trap News',
  tagline: 'The Moused Trusted Name in Disney News',
  description: 'The world\'s best satire and parody site for Disney Parks news. Everything on this site is made up.',
  socialLinks: {
    tiktok: 'https://www.tiktok.com/@mousetrapnews',
    instagram: 'https://www.instagram.com/mousetrapnews/',
    facebook: 'https://www.facebook.com/mousetrapnews/',
    twitter: 'https://x.com/mousetrapnews',
  },
  defaultThemeRotation: 'sequential',
  featuredOnLogos: ['USA Today', 'Associated Press', 'Reuters', 'Snopes', 'PolitiFact', 'The Tonight Show', 'SNL', 'PBS', 'Parents Magazine', 'Barstool Sports', 'ABC 10 News'],
}

const sampleArticle = {
  _id: 'article-arrested-at-disney',
  _type: 'article',
  title: 'This is What Happens if You Get Arrested at Disney',
  slug: { _type: 'slug', current: 'this-is-what-happens-if-you-get-arrested-at-disney' },
  author: { _type: 'reference', _ref: 'author-mousetrap' },
  category: { _type: 'reference', _ref: 'cat-cross-property' },
  theme: 'auto',
  featured: true,
  status: 'approved',
  approvedAt: '2026-04-11T12:00:00Z',
  approvedBy: 'Michael Morrow',
  publishedAt: '2026-04-11T12:00:00Z',
  excerpt: 'You might think the Happiest Place on Earth has no room for handcuffs — but you\'d be hilariously wrong. Here\'s the totally real, completely made-up scoop.',
  tags: ['Disney World', 'Security', 'Arrests', 'Satire'],
  body: [
    { _type: 'block', _key: 'b1', style: 'normal', children: [{ _type: 'span', _key: 's1', text: 'You might think that getting arrested at the Happiest Place on Earth is impossible — after all, how can you commit a crime when you\'re surrounded by churros, princesses, and a 189-foot tall geodesic sphere? But it turns out that Disney World has its own fully operational law enforcement system, and it is ', marks: [] }, { _type: 'span', _key: 's2', text: 'not', marks: ['em'] }, { _type: 'span', _key: 's3', text: ' messing around.', marks: [] }] },
    { _type: 'block', _key: 'b2', style: 'normal', children: [{ _type: 'span', _key: 's4', text: 'According to our completely fabricated sources, Disney World processes an average of 47 arrests per week, ranging from "unauthorized Magic Band modifications" to "aggressive turkey leg consumption." The park\'s security force — internally known as the "Mouseketeer Patrol" — operates from a hidden facility beneath the Haunted Mansion known as "The Dungeon."', marks: [] }] },
    { _type: 'block', _key: 'b3', style: 'h2', children: [{ _type: 'span', _key: 's5', text: 'The Arrest Process', marks: [] }] },
    { _type: 'block', _key: 'b4', style: 'normal', children: [{ _type: 'span', _key: 's6', text: 'When a guest is detained at Disney World, they are first escorted through a series of secret tunnels — the same utilidor system used by cast members to move around the park without being seen. Detainees report being walked past rows of unused Audio-Animatronics, which they describe as "deeply unsettling."', marks: [] }] },
    { _type: 'block', _key: 'b5', style: 'normal', children: [{ _type: 'span', _key: 's7', text: 'Once at the holding facility, guests are given a choice: either cooperate with Disney Security and receive a "Lifetime FastPass to Consequences," or be handed over to the Orange County Sheriff\'s Office. Most people choose the sheriff, because at least jail has predictable meal times.', marks: [] }] },
    { _type: 'block', _key: 'b6', style: 'h2', children: [{ _type: 'span', _key: 's8', text: 'What Happens in "The Dungeon"', marks: [] }] },
    { _type: 'block', _key: 'b7', style: 'normal', children: [{ _type: 'span', _key: 's9', text: 'The holding area, which Disney officially denies exists, reportedly features fluorescent lighting that plays "It\'s a Small World" on a 12-second loop, a vending machine that only dispenses lukewarm Dasani water at $14.99 per bottle, a single chair shaped like Goofy\'s head, and a poster on the wall that reads "Remember: Every choice has pixie dust consequences."', marks: [] }] },
    { _type: 'block', _key: 'b8', style: 'blockquote', children: [{ _type: 'span', _key: 's10', text: '"The last thing you see before they close the door is a Cast Member smiling and saying \'Have a magical day!\' It haunts me." — Anonymous Former Detainee, probably', marks: [] }] },
    { _type: 'block', _key: 'b9', style: 'h2', children: [{ _type: 'span', _key: 's11', text: 'The Aftermath', marks: [] }] },
    { _type: 'block', _key: 'b10', style: 'normal', children: [{ _type: 'span', _key: 's12', text: 'Those who are formally banned from Disney property receive what\'s known as a "Trespass Warning," which is very real and not at all made up by us. The document reportedly features Mickey Mouse\'s silhouette as a watermark and is printed on paper that smells faintly of popcorn.', marks: [] }] },
    { _type: 'block', _key: 'b11', style: 'normal', children: [{ _type: 'span', _key: 's13', text: 'So the next time you\'re at Disney World and you consider doing something you probably shouldn\'t — just remember: Mickey is watching. And he has handcuffs.', marks: [] }] },
  ],
}

async function seed() {
  console.log('Seeding categories...')
  for (const cat of categories) {
    await client.createOrReplace(cat)
    console.log(`  ✓ ${cat.title}`)
  }

  console.log('Seeding author...')
  await client.createOrReplace(author)
  console.log(`  ✓ ${author.name}`)

  console.log('Seeding site settings...')
  await client.createOrReplace(siteSettings)
  console.log('  ✓ Site Settings')

  console.log('Seeding sample article...')
  await client.createOrReplace(sampleArticle)
  console.log(`  ✓ ${sampleArticle.title}`)

  console.log('\nDone! Sanity project seeded successfully.')
}

seed().catch(console.error)
