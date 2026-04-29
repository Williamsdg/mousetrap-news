import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Article',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: { hotspot: true },
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'category' }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'theme',
      title: 'Visual Theme',
      type: 'string',
      description: 'Auto-assigns by category. Override manually if needed.',
      options: {
        list: [
          { title: 'Auto (by Category)', value: 'auto' },
          { title: 'Magic Kingdom', value: 'magic-kingdom' },
          { title: 'EPCOT', value: 'epcot' },
          { title: 'Hollywood Studios', value: 'hollywood-studios' },
          { title: 'Animal Kingdom', value: 'animal-kingdom' },
          { title: 'Resorts', value: 'resorts' },
          { title: 'Cross Property', value: 'cross-property' },
          { title: 'Other', value: 'other' },
        ],
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'featured',
      title: 'Featured Story',
      type: 'boolean',
      description: 'Show this article in the hero section',
      initialValue: false,
    }),

    // ===== EDITORIAL WORKFLOW =====
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      description: 'Only "Approved" articles appear on the live site.',
      options: {
        list: [
          { title: '📝 Draft', value: 'draft' },
          { title: '👀 In Review', value: 'in-review' },
          { title: '✅ Approved', value: 'approved' },
          { title: '❌ Rejected', value: 'rejected' },
        ],
        layout: 'radio',
      },
      initialValue: 'draft',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'reviewNotes',
      title: 'Review Notes',
      type: 'text',
      rows: 3,
      description: 'Publisher feedback — visible to writers when article is rejected or needs changes.',
      hidden: ({ document }) => document?.status !== 'rejected',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted for Review',
      type: 'datetime',
      readOnly: true,
      hidden: ({ document }) => !document?.submittedAt,
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      readOnly: true,
      hidden: ({ document }) => !document?.approvedAt,
    }),
    defineField({
      name: 'approvedBy',
      title: 'Approved By',
      type: 'string',
      readOnly: true,
      hidden: ({ document }) => !document?.approvedBy,
    }),

    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      description: 'Short summary for card previews and meta descriptions',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'H2', value: 'h2' },
            { title: 'H3', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Underline', value: 'underline' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [{ name: 'href', type: 'url', title: 'URL' }],
              },
              {
                name: 'footnote',
                type: 'object',
                title: 'Footnote',
                fields: [{ name: 'text', type: 'text', title: 'Footnote text', rows: 2 }],
              },
            ],
          },
        },
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            { name: 'caption', type: 'string', title: 'Caption' },
            { name: 'alt', type: 'string', title: 'Alt text' },
            {
              name: 'alignment',
              type: 'string',
              title: 'Alignment',
              options: { list: [
                { title: 'Full width', value: 'full' },
                { title: 'Center', value: 'center' },
                { title: 'Left', value: 'left' },
                { title: 'Right', value: 'right' },
              ] },
              initialValue: 'full',
            },
            {
              name: 'size',
              type: 'string',
              title: 'Size',
              options: { list: [
                { title: 'Small (320px)', value: 'small' },
                { title: 'Medium (560px)', value: 'medium' },
                { title: 'Large (full)', value: 'large' },
              ] },
              initialValue: 'large',
            },
          ],
        },
        { type: 'socialEmbed' },
        { type: 'youtubeEmbed' },
        { type: 'tableBlock' },
      ],
    }),
    defineField({
      name: 'seo',
      title: 'SEO',
      type: 'object',
      fields: [
        defineField({ name: 'metaTitle', title: 'Meta Title', type: 'string', description: 'Override the default title tag (~65 chars)' }),
        defineField({ name: 'metaDescription', title: 'Meta Description', type: 'text', rows: 2, description: '~155 chars for search results' }),
        defineField({ name: 'ogImage', title: 'OG Image', type: 'image', description: 'Override the default social sharing image' }),
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
  ],
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'workflow', title: 'Workflow' },
    { name: 'seo', title: 'SEO' },
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'mainImage',
      category: 'category.title',
      status: 'status',
    },
    prepare({ title, author, media, category, status }) {
      const statusIcons: Record<string, string> = {
        draft: '📝',
        'in-review': '👀',
        approved: '✅',
        rejected: '❌',
      }
      const icon = statusIcons[status || 'draft'] || '📝'
      return {
        title: `${icon} ${title}`,
        subtitle: `${category || ''} | ${author || ''}`,
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Published Date, New',
      name: 'publishedAtDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
})
