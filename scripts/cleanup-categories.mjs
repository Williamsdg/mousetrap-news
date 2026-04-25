#!/usr/bin/env node
/**
 * One-time cleanup: remove unused categories and their demo articles.
 * Keeps only: Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom, Cross Property, Resorts, Other
 * Removes: Cast Members, Food & Dining, Movies & Entertainment, Sports
 */
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: '81uq8kg1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_TOKEN,
})

const CATEGORIES_TO_DELETE = [
  'cat-cast-members',
  'cat-food',
  'cat-movies',
  'cat-sports',
]

async function run() {
  console.log('=== Category cleanup ===\n')

  // 1. Find articles in categories being deleted
  const articles = await client.fetch(
    `*[_type=="article" && category._ref in $cats]{_id, title}`,
    { cats: CATEGORIES_TO_DELETE }
  )
  console.log(`Articles to delete: ${articles.length}`)
  for (const a of articles) {
    console.log(`  - ${a.title}`)
  }

  // 2. Delete the articles
  if (articles.length > 0) {
    console.log('\nDeleting articles...')
    for (const a of articles) {
      await client.delete(a._id)
      console.log(`  ✓ Deleted ${a._id}`)
    }
  }

  // 3. Delete the category documents
  console.log('\nDeleting category documents...')
  for (const catId of CATEGORIES_TO_DELETE) {
    try {
      await client.delete(catId)
      console.log(`  ✓ Deleted ${catId}`)
    } catch (e) {
      console.log(`  ✗ ${catId}: ${e.message}`)
    }
  }

  // 4. Verify final category list
  console.log('\n=== Remaining categories ===')
  const remaining = await client.fetch(
    `*[_type=="category"] | order(title asc){_id, title, slug}`
  )
  for (const c of remaining) {
    console.log(`  ${c.slug.current}  →  ${c.title}`)
  }

  console.log('\nDone.')
}

run().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
