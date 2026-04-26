import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'subscriber',
  title: 'Newsletter Subscriber',
  type: 'document',
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (rule) =>
        rule.required().email().error('A valid email is required'),
    }),
    defineField({
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      description: 'Where the user signed up (e.g. footer, homepage). Set automatically.',
      readOnly: true,
    }),
  ],
  preview: {
    select: { email: 'email', subscribedAt: 'subscribedAt' },
    prepare({ email, subscribedAt }) {
      const date = subscribedAt ? new Date(subscribedAt).toLocaleDateString('en-US') : ''
      return { title: email || '(no email)', subtitle: date }
    },
  },
  orderings: [
    {
      title: 'Most Recent First',
      name: 'subscribedAtDesc',
      by: [{ field: 'subscribedAt', direction: 'desc' }],
    },
  ],
})
