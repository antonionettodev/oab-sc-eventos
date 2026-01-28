import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: {
    singular: 'Certificado',
    plural: 'Certificados',
  },
  admin: {
    useAsTitle: 'certificateCode',
    group: 'Eventos',
    defaultColumns: ['certificateCode', 'event', 'participantName', 'status', 'issuedAt'],
    description: 'Certificados emitidos para participantes de eventos',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'certificateCode',
      type: 'text',
      label: 'Código do Certificado',
      required: true,
      unique: true,
      index: true,
      admin: {
        readOnly: true,
        description: 'Código único para validação do certificado',
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      label: 'Evento',
      required: true,
      admin: {
        description: 'Evento relacionado ao certificado',
      },
    },
    {
      name: 'registration',
      type: 'relationship',
      relationTo: 'registrations',
      label: 'Inscrição',
      required: true,
      admin: {
        description: 'Inscrição/pedido relacionado',
      },
    },
    {
      name: 'ticketCode',
      type: 'text',
      label: 'Código do Ingresso',
      required: true,
      index: true,
      admin: {
        description: 'Código do ingresso do participante',
      },
    },
    {
      name: 'participantName',
      type: 'text',
      label: 'Nome do Participante',
      required: true,
      admin: {
        description: 'Nome que constará no certificado',
      },
    },
    {
      name: 'participantEmail',
      type: 'email',
      label: 'E-mail do Participante',
      required: true,
    },
    {
      name: 'participantOab',
      type: 'text',
      label: 'OAB do Participante',
      required: false,
      admin: {
        description: 'Número da OAB (se aplicável)',
      },
    },
    {
      name: 'eventTitle',
      type: 'text',
      label: 'Título do Evento',
      required: true,
      admin: {
        readOnly: true,
        description: 'Título que constará no certificado',
      },
    },
    {
      name: 'eventDate',
      type: 'text',
      label: 'Data do Evento',
      required: true,
      admin: {
        readOnly: true,
        description: 'Data formatada do evento',
      },
    },
    {
      name: 'workload',
      type: 'text',
      label: 'Carga Horária',
      required: false,
      admin: {
        description: 'Carga horária do evento',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Emitido', value: 'issued' },
        { label: 'Enviado', value: 'sent' },
        { label: 'Baixado', value: 'downloaded' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
      admin: {
        description: 'Status atual do certificado',
      },
    },
    {
      name: 'issueType',
      type: 'select',
      label: 'Tipo de Emissão',
      required: true,
      options: [
        { label: 'Automática', value: 'automatic' },
        { label: 'Manual', value: 'manual' },
      ],
      admin: {
        description: 'Como o certificado foi emitido',
      },
    },
    {
      name: 'pdfFile',
      type: 'upload',
      relationTo: 'files',
      label: 'Arquivo PDF',
      required: false,
      admin: {
        description: 'Arquivo PDF do certificado gerado',
      },
    },
    {
      name: 'issuedAt',
      type: 'date',
      label: 'Emitido em',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Data/hora da emissão',
      },
    },
    {
      name: 'sentAt',
      type: 'date',
      label: 'Enviado em',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Data/hora do envio por e-mail',
      },
    },
    {
      name: 'downloadedAt',
      type: 'date',
      label: 'Baixado em',
      required: false,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
        description: 'Data/hora do primeiro download',
      },
    },
    {
      name: 'downloadCount',
      type: 'number',
      label: 'Quantidade de Downloads',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Número de vezes que foi baixado',
      },
    },
    {
      name: 'validationUrl',
      type: 'text',
      label: 'URL de Validação',
      required: false,
      admin: {
        readOnly: true,
        description: 'Link para validar a autenticidade',
      },
    },
    {
      name: 'qrCodeUrl',
      type: 'text',
      label: 'URL do QR Code',
      required: false,
      admin: {
        readOnly: true,
        description: 'QR Code para validação',
      },
    },
    {
      name: 'issuedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Emitido Por',
      required: false,
      admin: {
        description: 'Usuário que emitiu manualmente (se aplicável)',
        condition: (data) => data?.issueType === 'manual',
      },
    },
    createdByField,
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          // Gerar código do certificado
          const { v4: uuidv4 } = await import('uuid')
          const year = new Date().getFullYear()
          const random = uuidv4().replace(/-/g, '').substring(0, 10).toUpperCase()
          data.certificateCode = `CERT-${year}-${random}`
        }
        return data
      },
    ],
  },
}
