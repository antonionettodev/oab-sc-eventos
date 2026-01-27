import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'

export const Certificates: CollectionConfig = {
  slug: 'certificates',
  labels: {
    singular: 'Certificado',
    plural: 'Certificados',
  },
  admin: {
    useAsTitle: 'certificateCode',
    group: 'Eventos',
    defaultColumns: ['certificateCode', 'participantName', 'event', 'status', 'issuedAt'],
  },
  fields: [
    // ===== TABS =====
    {
      type: 'tabs',
      tabs: [
        // ===== TAB: DADOS DO CERTIFICADO =====
        {
          label: 'Dados do Certificado',
          fields: [
            {
              name: 'ticket',
              type: 'relationship',
              label: 'Ingresso',
              relationTo: 'tickets',
              required: true,
              unique: true,
              admin: {
                description: 'Ingresso vinculado ao certificado',
              },
            },
            {
              name: 'event',
              type: 'relationship',
              label: 'Evento',
              relationTo: 'events',
              required: true,
              admin: {
                description: 'Evento do certificado',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'participantName',
                  type: 'text',
                  label: 'Nome do Participante',
                  required: true,
                  admin: {
                    readOnly: true,
                    description: 'Nome completo do participante',
                    width: '50%',
                  },
                },
                {
                  name: 'participantOab',
                  type: 'text',
                  label: 'OAB',
                  admin: {
                    readOnly: true,
                    description: 'Número da OAB (se informado)',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'eventTitle',
              type: 'text',
              label: 'Título do Evento',
              required: true,
              admin: {
                readOnly: true,
                description: 'Título do evento no momento da emissão',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'eventStartDate',
                  type: 'date',
                  label: 'Data de Início',
                  admin: {
                    readOnly: true,
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                    },
                    width: '50%',
                  },
                },
                {
                  name: 'eventEndDate',
                  type: 'date',
                  label: 'Data de Término',
                  admin: {
                    readOnly: true,
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                    },
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'workload',
              type: 'number',
              label: 'Carga Horária (horas)',
              admin: {
                description: 'Carga horária do evento/curso',
              },
            },
          ],
        },
        // ===== TAB: EMISSÃO =====
        {
          label: 'Emissão',
          fields: [
            {
              name: 'emissionType',
              type: 'select',
              label: 'Tipo de Emissão',
              required: true,
              options: [
                { label: 'Automática', value: 'automatic' },
                { label: 'Manual', value: 'manual' },
              ],
              admin: {
                readOnly: true,
                description: 'Como o certificado foi emitido',
              },
            },
            {
              name: 'issuedAt',
              type: 'date',
              label: 'Data de Emissão',
              required: true,
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
            {
              name: 'issuedBy',
              type: 'relationship',
              label: 'Emitido Por',
              relationTo: 'users',
              admin: {
                readOnly: true,
                condition: (data) => data.emissionType === 'manual',
                description: 'Usuário que emitiu manualmente o certificado',
              },
            },
            {
              name: 'attendancePercentage',
              type: 'number',
              label: 'Percentual de Presença (%)',
              min: 0,
              max: 100,
              admin: {
                readOnly: true,
                description: 'Percentual de presença no momento da emissão',
              },
            },
            {
              name: 'surveyCompletedAt',
              type: 'date',
              label: 'Pesquisa Respondida em',
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
          ],
        },
        // ===== TAB: ARQUIVO =====
        {
          label: 'Arquivo',
          fields: [
            {
              name: 'pdfFile',
              type: 'upload',
              label: 'Arquivo PDF',
              relationTo: 'files',
              admin: {
                readOnly: true,
                description: 'Certificado em formato PDF',
              },
            },
            {
              name: 'downloadCount',
              type: 'number',
              label: 'Downloads',
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: 'Número de vezes que o certificado foi baixado',
              },
            },
            {
              name: 'lastDownloadAt',
              type: 'date',
              label: 'Último Download',
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
            {
              name: 'emailSentAt',
              type: 'date',
              label: 'E-mail Enviado em',
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
          ],
        },
      ],
    },
    // ===== SIDEBAR FIELDS =====
    {
      name: 'certificateCode',
      type: 'text',
      label: 'Código do Certificado',
      unique: true,
      index: true,
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Código único para validação do certificado',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'issued',
      options: [
        { label: 'Emitido', value: 'issued' },
        { label: 'Revogado', value: 'revoked' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'revokedAt',
      type: 'date',
      label: 'Revogado em',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'revoked',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
    },
    {
      name: 'revokedReason',
      type: 'textarea',
      label: 'Motivo da Revogação',
      admin: {
        position: 'sidebar',
        condition: (data) => data.status === 'revoked',
      },
    },
    {
      name: 'validationUrl',
      type: 'text',
      label: 'URL de Validação',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Link para validação online do certificado',
      },
    },
    createdByField,
    editedByField,
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Generate certificateCode for new certificates
        if (operation === 'create' && !data?.certificateCode) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 8).toUpperCase()
          const certificateCode = `CERT-${timestamp}-${random}`
          return {
            ...data,
            certificateCode,
            issuedAt: data?.issuedAt || new Date().toISOString(),
          }
        }
        return data
      },
    ],
  },
}
