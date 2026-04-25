import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'tableBlock',
  title: 'Table',
  type: 'object',
  fields: [
    defineField({
      name: 'rows',
      title: 'Rows',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'row',
          fields: [
            {
              name: 'cells',
              type: 'array',
              of: [{ type: 'string' }],
            },
          ],
          preview: {
            select: { cells: 'cells' },
            prepare({ cells }) {
              return { title: (cells || []).join(' | ') || 'Empty row' }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'hasHeader',
      title: 'First row is header',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  preview: {
    select: { rows: 'rows' },
    prepare({ rows }) {
      const count = (rows || []).length
      return { title: `📊 Table (${count} row${count === 1 ? '' : 's'})` }
    },
  },
})
