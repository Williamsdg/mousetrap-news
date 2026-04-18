import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'socialEmbed',
  title: 'Social Media Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'TikTok', value: 'tiktok' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'X / Twitter', value: 'twitter' },
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'url',
      title: 'Post URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Optional caption to display below the embed',
    }),
  ],
  preview: {
    select: { platform: 'platform', url: 'url' },
    prepare({ platform, url }) {
      const icons: Record<string, string> = {
        tiktok: '🎵',
        instagram: '📸',
        facebook: '👤',
        twitter: '🐦',
      }
      return {
        title: `${icons[platform] || '📱'} ${platform || 'Social'} embed`,
        subtitle: url,
      }
    },
  },
})
