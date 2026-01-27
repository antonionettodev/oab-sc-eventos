import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { nameField } from '@/fields/name'
import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  labels: {
    singular: 'Palestrante',
    plural: 'Palestrantes',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Eventos',
    defaultColumns: ['name', 'professionalTitle', 'createdAt'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        nameField({
          label: 'Nome Completo',
          placeholder: 'Nome completo do palestrante',
          width: '50%',
        }),
        {
          name: 'professionalTitle',
          type: 'text',
          label: 'Título Profissional',
          required: true,
          maxLength: 128,
          admin: {
            placeholder: 'Ex: Advogado, Juiz, Diretor, Professor, etc.',
            width: '50%',
          },
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Descrição',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
        },
      }),
      admin: {
        description: 'Breve biografia ou descrição do palestrante',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      label: 'Foto',
      relationTo: 'files',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        description: 'Foto do palestrante para exibição no site',
      },
    },
    createdByField,
    editedByField,
  ],
}
