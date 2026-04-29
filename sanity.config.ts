import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import type { StructureBuilder } from 'sanity/structure'
import { schemaTypes } from './src/sanity/schemas'

const structure = (S: StructureBuilder) =>
  S.list()
    .title('Mouse Trap News')
    .items([
      // Editorial Workflow Views
      S.listItem()
        .title('📝 Drafts')
        .child(
          S.documentList()
            .title('Draft Articles')
            .filter('_type == "article" && status == "draft"')
        ),
      S.listItem()
        .title('👀 Pending Review')
        .child(
          S.documentList()
            .title('Articles Awaiting Approval')
            .filter('_type == "article" && status == "in-review"')
        ),
      S.listItem()
        .title('✅ Published')
        .child(
          S.documentList()
            .title('Live on Site')
            .filter('_type == "article" && status == "approved"')
        ),
      S.listItem()
        .title('❌ Rejected')
        .child(
          S.documentList()
            .title('Needs Revision')
            .filter('_type == "article" && status == "rejected"')
        ),

      S.divider(),

      // All Content Types
      S.listItem()
        .title('📰 All Articles')
        .child(
          S.documentList()
            .title('All Articles')
            .filter('_type == "article"')
        ),
      S.documentTypeListItem('category').title('🏷️ Categories'),
      S.documentTypeListItem('author').title('👤 Authors'),

      S.divider(),

      // Settings
      S.listItem()
        .title('⚙️ Site Settings')
        .child(
          S.document()
            .schemaType('siteSettings')
            .documentId('siteSettings')
        ),
    ])

export default defineConfig({
  name: 'mousetrap-news',
  title: 'Mouse Trap News',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '81uq8kg1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
})
