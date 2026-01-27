import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'
import { checkCertificateEligibilityHook } from './hooks/check-certificate-eligibility'

export const Tickets: CollectionConfig = {
  slug: 'tickets',
  labels: {
    singular: 'Ingresso',
    plural: 'Ingressos',
  },
  admin: {
    useAsTitle: 'ticketCode',
    group: 'Eventos',
    defaultColumns: ['ticketCode', 'participantName', 'event', 'status', 'createdAt'],
  },
  fields: [
    // ===== TABS =====
    {
      type: 'tabs',
      tabs: [
        // ===== TAB: DADOS DO PARTICIPANTE =====
        {
          label: 'Dados do Participante',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'participantName',
                  type: 'text',
                  label: 'Nome Completo',
                  required: true,
                  maxLength: 128,
                  admin: {
                    placeholder: 'Nome completo do participante',
                    width: '50%',
                  },
                },
                {
                  name: 'participantEmail',
                  type: 'email',
                  label: 'E-mail',
                  required: true,
                  admin: {
                    placeholder: 'email@exemplo.com',
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'participantPhone',
                  type: 'text',
                  label: 'Telefone',
                  required: true,
                  maxLength: 20,
                  admin: {
                    placeholder: '(00) 00000-0000',
                    width: '50%',
                  },
                },
                {
                  name: 'participantOab',
                  type: 'text',
                  label: 'Número da OAB',
                  maxLength: 20,
                  admin: {
                    placeholder: 'OAB/SC 00000 (opcional)',
                    description: 'Número da OAB do participante (opcional)',
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        // ===== TAB: INGRESSO =====
        {
          label: 'Ingresso',
          fields: [
            {
              name: 'registration',
              type: 'relationship',
              label: 'Inscrição',
              relationTo: 'registrations',
              required: true,
              admin: {
                description: 'Inscrição (pedido) vinculada a este ingresso',
              },
            },
            {
              name: 'event',
              type: 'relationship',
              label: 'Evento',
              relationTo: 'events',
              required: true,
              admin: {
                description: 'Evento do ingresso',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'categoryTitle',
                  type: 'text',
                  label: 'Categoria',
                  required: true,
                  admin: {
                    readOnly: true,
                    description: 'Categoria do ingresso',
                    width: '50%',
                  },
                },
                {
                  name: 'categoryPrice',
                  type: 'number',
                  label: 'Valor (R$)',
                  required: true,
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Valor pago pela categoria',
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'categoryId',
              type: 'text',
              label: 'ID da Categoria',
              admin: {
                readOnly: true,
                description: 'Identificador da categoria no evento',
              },
            },
          ],
        },
        // ===== TAB: PROGRAMAÇÃO SELECIONADA =====
        {
          label: 'Programação Selecionada',
          fields: [
            {
              name: 'selectedSchedule',
              type: 'array',
              label: 'Atividades Selecionadas',
              labels: {
                singular: 'Atividade',
                plural: 'Atividades',
              },
              admin: {
                description: 'Atividades da programação selecionadas para este ingresso',
              },
              fields: [
                {
                  name: 'scheduleId',
                  type: 'text',
                  label: 'ID da Atividade',
                  required: true,
                  admin: {
                    readOnly: true,
                    description: 'Identificador da atividade na programação',
                  },
                },
                {
                  name: 'room',
                  type: 'relationship',
                  label: 'Sala',
                  relationTo: 'rooms',
                  required: true,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'activityTitle',
                  type: 'text',
                  label: 'Título da Atividade',
                  required: true,
                  admin: {
                    readOnly: true,
                  },
                },
                {
                  name: 'date',
                  type: 'date',
                  label: 'Data',
                  required: true,
                  admin: {
                    readOnly: true,
                    date: {
                      pickerAppearance: 'dayOnly',
                      displayFormat: 'dd/MM/yyyy',
                    },
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'startTime',
                      type: 'text',
                      label: 'Hora Início',
                      required: true,
                      admin: {
                        readOnly: true,
                        width: '50%',
                      },
                    },
                    {
                      name: 'endTime',
                      type: 'text',
                      label: 'Hora Fim',
                      required: true,
                      admin: {
                        readOnly: true,
                        width: '50%',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ===== TAB: PRESENÇA E CERTIFICADO =====
        {
          label: 'Presença e Certificado',
          fields: [
            {
              name: 'hasCheckedIn',
              type: 'checkbox',
              label: 'Realizou Check-in',
              defaultValue: false,
              admin: {
                readOnly: true,
                description: 'Indica se o participante fez check-in no evento',
              },
            },
            {
              name: 'checkInCount',
              type: 'number',
              label: 'Número de Check-ins',
              defaultValue: 0,
              admin: {
                readOnly: true,
                description: 'Total de check-ins realizados',
              },
            },
            {
              name: 'attendancePercentage',
              type: 'number',
              label: 'Percentual de Presença (%)',
              defaultValue: 0,
              min: 0,
              max: 100,
              admin: {
                readOnly: true,
                description: 'Percentual de presença calculado',
              },
            },
            {
              name: 'surveyCompleted',
              type: 'checkbox',
              label: 'Pesquisa Respondida',
              defaultValue: false,
              admin: {
                readOnly: true,
                description: 'Indica se o participante respondeu a pesquisa de satisfação',
              },
            },
            {
              name: 'surveyCompletedAt',
              type: 'date',
              label: 'Data da Pesquisa',
              admin: {
                readOnly: true,
                condition: (data) => data.surveyCompleted === true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
            {
              name: 'certificateEligible',
              type: 'checkbox',
              label: 'Elegível para Certificado',
              defaultValue: false,
              admin: {
                readOnly: true,
                description: 'Indica se o participante atende aos requisitos para certificado',
              },
            },
            {
              name: 'certificateIssued',
              type: 'checkbox',
              label: 'Certificado Emitido',
              defaultValue: false,
              admin: {
                readOnly: true,
                description: 'Indica se o certificado foi emitido',
              },
            },
          ],
        },
      ],
    },
    // ===== SIDEBAR FIELDS =====
    {
      name: 'ticketCode',
      type: 'text',
      label: 'Código do Ingresso',
      unique: true,
      index: true,
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Código único do ingresso',
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
        { label: 'Ativo', value: 'active' },
        { label: 'Utilizado', value: 'used' },
        { label: 'Cancelado', value: 'cancelled' },
        { label: 'Reembolsado', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'qrCode',
      type: 'text',
      label: 'Dados do QR Code',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Dados codificados no QR Code do ingresso',
      },
    },
    createdByField,
    editedByField,
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Generate ticketCode and qrCode for new tickets
        if (operation === 'create' && !data?.ticketCode) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 8).toUpperCase()
          const ticketCode = `TKT-${timestamp}-${random}`
          return {
            ...data,
            ticketCode,
            qrCode: JSON.stringify({
              type: 'ticket',
              code: ticketCode,
              version: 1,
            }),
          }
        }
        return data
      },
    ],
    afterChange: [checkCertificateEligibilityHook],
  },
}
