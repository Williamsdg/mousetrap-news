import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'youtubeEmbed',
  title: 'YouTube Embed',
  type: 'object',
  fields: [
    defineField({
      name: 'url',
      title: 'YouTube URL',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
  ],
  preview: {
    select: { url: 'url' },
    prepare({ url }) {
      return { title: '▶ YouTube embed', subtitle: url }
    },
  },
})
