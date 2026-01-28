import type { CollectionConfig } from 'payload'
import { uppercaseTrimHook } from '@/hooks/uppercase-trim'
import { trimHook } from '@/hooks/trim'

export const Speakers: CollectionConfig = {
  slug: 'speakers',
  labels: {
    singular: 'Palestrante',
    plural: 'Palestrantes',
  },
  admin: {
    group: 'Eventos',
    useAsTitle: 'name',
    defaultColumns: ['name', 'professionalTitle', 'createdAt'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nome do Palestrante',
      required: true,
      minLength: 2,
      maxLength: 128,
      admin: {
        placeholder: 'Digite o nome completo do palestrante...',
        description: 'Nome completo do palestrante',
      },
      hooks: {
        beforeChange: [uppercaseTrimHook],
      },
    },
    {
      name: 'professionalTitle',
      type: 'text',
      label: 'Título Profissional do Palestrante',
      required: true,
      minLength: 4,
      maxLength: 64,
      admin: {
        placeholder: 'Ex: Advogado Especialista em Direito Civil...',
        description: 'Título ou especialidade profissional',
      },
      hooks: {
        beforeChange: [uppercaseTrimHook],
      },
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrição do Palestrante',
      maxLength: 256,
      admin: {
        placeholder: 'Digite uma breve descrição sobre o palestrante...',
        description: 'Informações adicionais sobre o palestrante',
      },
      hooks: {
        beforeChange: [trimHook],
      },
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'files',
      label: 'Foto do Palestrante',
      admin: {
        description: 'Foto de perfil do palestrante',
      },
    },
  ],
  timestamps: true,
}
