import type { CollectionConfig } from 'payload'

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
    description: 'Palestrantes e instrutores que participam dos eventos',
  },
  access: {
    read: () => true,
  },
  fields: [
    nameField({
      width: '100%',
      label: 'Nome Completo',
      placeholder: 'Nome completo do palestrante',
    }),
    {
      name: 'professionalTitle',
      type: 'text',
      label: 'Título Profissional',
      required: true,
      admin: {
        placeholder: 'Ex: Advogado, Juiz, Diretor, Professor',
        description: 'Cargo ou título profissional',
      },
      maxLength: 150,
    },
    {
      name: 'description',
      type: 'richText',
      label: 'Biografia',
      required: false,
      admin: {
        description: 'Mini currículo ou biografia do palestrante',
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'files',
      label: 'Foto',
      required: false,
      admin: {
        description: 'Foto do palestrante (formato quadrado recomendado)',
      },
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'E-mail',
      required: false,
      admin: {
        placeholder: 'email@exemplo.com',
        description: 'E-mail de contato do palestrante',
      },
    },
    {
      name: 'linkedIn',
      type: 'text',
      label: 'LinkedIn',
      required: false,
      admin: {
        placeholder: 'https://linkedin.com/in/...',
        description: 'URL do perfil no LinkedIn',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Palestrante Ativo',
      defaultValue: true,
      admin: {
        description: 'Desmarque para desativar o palestrante',
        position: 'sidebar',
      },
    },
    createdByField,
    editedByField,
  ],
}
