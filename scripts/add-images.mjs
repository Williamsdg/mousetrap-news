import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

// Unsplash images mapped to each article (Disney park themed)
const articleImages = [
  {
    id: 'article-mk-fireworks',
    url: 'https://images.unsplash.com/photo-1575089900377-5c58ec9bfe62?w=1600&auto=format&fit=crop&q=80',
    filename: 'magic-kingdom-fireworks.jpg',
  },
  {
    id: 'article-epcot-country',
    url: 'https://images.unsplash.com/photo-1581720216478-62ab53c94904?w=1600&auto=format&fit=crop&q=80',
    filename: 'epcot-spaceship-earth.jpg',
  },
  {
    id: 'article-hs-stunt',
    url: 'https://images.unsplash.com/photo-1565867226341-34084fb1a40d?w=1600&auto=format&fit=crop&q=80',
    filename: 'hollywood-studios-tower.jpg',
  },
  {
    id: 'article-ak-safari',
    url: 'https://images.unsplash.com/photo-1627981440910-552a0b1d7450?w=1600&auto=format&fit=crop&q=80',
    filename: 'animal-kingdom-safari.jpg',
  },
  {
    id: 'article-movies-sequel',
    url: 'https://images.unsplash.com/photo-1536086845584-c8264be041b3?w=1600&auto=format&fit=crop&q=80',
    filename: 'disney-movies.jpg',
  },
  {
    id: 'article-sports-mascot',
    url: 'https://images.unsplash.com/photo-1562937024-ad2970e28754?w=1600&auto=format&fit=crop&q=80',
    filename: 'disney-sports.jpg',
  },
  {
    id: 'article-resorts-upgrade',
    url: 'https://images.unsplash.com/photo-1727157258321-07027e2c9e84?w=1600&auto=format&fit=crop&q=80',
    filename: 'disney-resort.jpg',
  },
  {
    id: 'article-cast-uniform',
    url: 'https://images.unsplash.com/photo-1568993467791-26d4df3808b0?w=1600&auto=format&fit=crop&q=80',
    filename: 'disney-cast-members.jpg',
  },
  {
    id: 'article-food-turkey',
    url: 'https://images.unsplash.com/photo-1569033887792-f94b979da7ca?w=1600&auto=format&fit=crop&q=80',
    filename: 'disney-food.jpg',
  },
]

async function addImages() {
  console.log('Adding images to articles...\n')

  for (const item of articleImages) {
    try {
      console.log(`  Downloading ${item.filename}...`)
      const response = await fetch(item.url)
      if (!response.ok) {
        console.log(`    ✗ Failed to download: ${response.status}`)
        continue
      }
      const buffer = Buffer.from(await response.arrayBuffer())

      console.log(`  Uploading to Sanity...`)
      const asset = await client.assets.upload('image', buffer, {
        filename: item.filename,
        contentType: 'image/jpeg',
      })

      console.log(`  Patching article ${item.id}...`)
      await client.patch(item.id).set({
        mainImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      }).commit()

      console.log(`  ✓ ${item.filename} → ${item.id}\n`)
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}\n`)
    }
  }

  console.log('Done!')
}

addImages().catch(console.error)
