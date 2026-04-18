import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'siteName',
      title: 'Site Name',
      type: 'string',
      initialValue: 'Mouse Trap News',
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      initialValue: 'The Moused Trusted Name in Disney News',
    }),
    defineField({
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({ name: 'tiktok', title: 'TikTok', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'twitter', title: 'X / Twitter', type: 'url' }),
      ],
    }),
    defineField({
      name: 'defaultThemeRotation',
      title: 'Theme Rotation Strategy',
      type: 'string',
      description: 'How themes are assigned to articles set to "Auto"',
      options: {
        list: [
          { title: 'Sequential (rotate in order)', value: 'sequential' },
          { title: 'Random (deterministic per article)', value: 'random' },
          { title: 'Category-based (match park to theme)', value: 'category' },
        ],
      },
      initialValue: 'sequential',
    }),
    defineField({
      name: 'featuredOnLogos',
      title: 'Featured On',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Names of media outlets that have featured the site',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
