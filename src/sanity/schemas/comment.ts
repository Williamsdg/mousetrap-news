import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'comment',
  title: 'Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'article',
      title: 'Article',
      type: 'reference',
      to: [{ type: 'article' }],
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: 'parent',
      title: 'In Reply To',
      type: 'reference',
      to: [{ type: 'comment' }],
      description: 'If set, this is a reply to another comment.',
      readOnly: true,
    }),
    defineField({
      name: 'anonymous',
      title: 'Posted Anonymously',
      type: 'boolean',
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: 'firstName',
      title: 'First Name',
      type: 'string',
      readOnly: true,
      hidden: ({ parent }) => Boolean(parent?.anonymous),
    }),
    defineField({
      name: 'lastName',
      title: 'Last Name',
      type: 'string',
      readOnly: true,
      hidden: ({ parent }) => Boolean(parent?.anonymous),
    }),
    defineField({
      name: 'body',
      title: 'Comment',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(1).max(2000),
      readOnly: true,
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '👀 Pending Review', value: 'pending' },
          { title: '✅ Approved', value: 'approved' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'approvedAt',
      title: 'Approved At',
      type: 'datetime',
      readOnly: true,
      hidden: ({ document }) => !document?.approvedAt,
    }),
    defineField({
      name: 'submitterIp',
      title: 'Submitter IP',
      type: 'string',
      description: 'Captured for spam triage. Never displayed publicly.',
      readOnly: true,
      hidden: true,
    }),
  ],
  preview: {
    select: {
      first: 'firstName',
      last: 'lastName',
      anon: 'anonymous',
      body: 'body',
      status: 'status',
    },
    prepare({ first, last, anon, body, status }) {
      const author = anon ? 'Anonymous' : [first, last].filter(Boolean).join(' ') || '(no name)'
      const icon = status === 'pending' ? '👀' : '✅'
      const snippet = (body || '').slice(0, 80)
      return { title: `${icon} ${author}`, subtitle: snippet }
    },
  },
  orderings: [
    {
      title: 'Newest First',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
})
