import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'
import { validateScheduleConflictsHook } from './hooks/validate-schedule-conflicts'

export const Events: CollectionConfig = {
  slug: 'events',
  hooks: {
    beforeChange: [validateScheduleConflictsHook],
  },
  labels: {
    singular: 'Evento',
    plural: 'Eventos',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Eventos',
    defaultColumns: ['title', 'eventType', 'startDate', 'status', 'createdAt'],
  },
  fields: [
    // ===== TABS =====
    {
      type: 'tabs',
      tabs: [
        // ===== TAB: INFORMAÇÕES BÁSICAS =====
        {
          label: 'Informações Básicas',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Título do Evento',
              required: true,
              maxLength: 256,
              admin: {
                placeholder: 'Ex: Congresso de Direito Civil 2025',
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Descrição',
              required: true,
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [...rootFeatures, FixedToolbarFeature(), InlineToolbarFeature()]
                },
              }),
              admin: {
                description: 'Descrição completa do evento',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              label: 'Imagem de Destaque',
              relationTo: 'files',
              filterOptions: {
                mimeType: { contains: 'image' },
              },
              admin: {
                description: 'Imagem principal do evento para exibição no site',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  label: 'Data e Hora de Início',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    width: '50%',
                  },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: 'Data e Hora de Término',
                  required: true,
                  admin: {
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'location',
              type: 'textarea',
              label: 'Local do Evento',
              required: true,
              admin: {
                placeholder: 'Endereço completo ou informações do local',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'maxRegistrations',
                  type: 'number',
                  label: 'Limite Total de Inscrições',
                  min: 1,
                  admin: {
                    placeholder: 'Deixe vazio para sem limite',
                    description: 'Número máximo de inscrições permitidas no evento',
                    width: '50%',
                  },
                },
                {
                  name: 'refundDays',
                  type: 'number',
                  label: 'Dias para Solicitar Reembolso',
                  min: 0,
                  defaultValue: 7,
                  admin: {
                    description: 'Número de dias antes do evento para solicitar reembolso',
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        // ===== TAB: CLASSIFICAÇÕES =====
        {
          label: 'Classificações',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'eventType',
                  type: 'select',
                  label: 'Tipo do Evento',
                  required: true,
                  defaultValue: 'event',
                  options: [
                    { label: 'Evento', value: 'event' },
                    { label: 'Curso', value: 'course' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'modality',
                  type: 'select',
                  label: 'Modalidade',
                  required: true,
                  defaultValue: 'in-person',
                  options: [
                    { label: 'Presencial', value: 'in-person' },
                    { label: 'Híbrido', value: 'hybrid' },
                    { label: 'Virtual', value: 'virtual' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'scope',
                  type: 'select',
                  label: 'Escopo',
                  required: true,
                  defaultValue: 'external',
                  options: [
                    { label: 'Interno', value: 'internal' },
                    { label: 'Externo', value: 'external' },
                  ],
                  admin: {
                    width: '50%',
                    description: 'Interno: apenas membros | Externo: aberto ao público',
                  },
                },
                {
                  name: 'registrationType',
                  type: 'select',
                  label: 'Tipo de Inscrição',
                  required: true,
                  defaultValue: 'internal',
                  options: [
                    { label: 'Interna (pelo sistema)', value: 'internal' },
                    { label: 'Externa (link externo)', value: 'external' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'externalRegistrationUrl',
              type: 'text',
              label: 'Link de Inscrição Externa',
              admin: {
                condition: (data) => data.registrationType === 'external',
                placeholder: 'https://exemplo.com/inscricao',
                description: 'URL para inscrição em sistema externo',
              },
            },
          ],
        },
        // ===== TAB: CATEGORIAS DE INSCRIÇÃO =====
        {
          label: 'Categorias de Inscrição',
          fields: [
            {
              name: 'categories',
              type: 'array',
              label: 'Categorias de Inscrição',
              labels: {
                singular: 'Categoria',
                plural: 'Categorias',
              },
              admin: {
                description:
                  'Defina as categorias de inscrição (ingressos) disponíveis para este evento',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'title',
                      type: 'text',
                      label: 'Título da Categoria',
                      required: true,
                      maxLength: 128,
                      admin: {
                        placeholder: 'Ex: Advogado, Estagiário, Público Externo',
                        width: '60%',
                      },
                    },
                    {
                      name: 'price',
                      type: 'number',
                      label: 'Valor (R$)',
                      required: true,
                      min: 0,
                      admin: {
                        placeholder: '0.00',
                        description: 'Valor em reais (0 para gratuito)',
                        width: '40%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição',
                  admin: {
                    placeholder: 'Descrição opcional da categoria',
                  },
                },
                {
                  name: 'maxQuantity',
                  type: 'number',
                  label: 'Quantidade Máxima',
                  min: 1,
                  admin: {
                    placeholder: 'Deixe vazio para sem limite',
                    description: 'Limite de ingressos disponíveis nesta categoria',
                  },
                },
              ],
            },
          ],
        },
        // ===== TAB: GRUPOS DE DESCONTO =====
        {
          label: 'Grupos de Desconto',
          fields: [
            {
              name: 'discountGroups',
              type: 'array',
              label: 'Grupos de Desconto',
              labels: {
                singular: 'Grupo de Desconto',
                plural: 'Grupos de Desconto',
              },
              admin: {
                description:
                  'Configure descontos para compras em grupo baseados na quantidade de ingressos',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minTickets',
                      type: 'number',
                      label: 'Mínimo de Ingressos',
                      required: true,
                      min: 1,
                      admin: {
                        placeholder: 'Ex: 3',
                        width: '25%',
                      },
                    },
                    {
                      name: 'maxTickets',
                      type: 'number',
                      label: 'Máximo de Ingressos',
                      required: true,
                      min: 1,
                      admin: {
                        placeholder: 'Ex: 10',
                        width: '25%',
                      },
                    },
                    {
                      name: 'discountType',
                      type: 'select',
                      label: 'Tipo de Desconto',
                      required: true,
                      defaultValue: 'percentage',
                      options: [
                        { label: 'Porcentagem (%)', value: 'percentage' },
                        { label: 'Valor Fixo (R$)', value: 'fixed' },
                      ],
                      admin: {
                        width: '25%',
                      },
                    },
                    {
                      name: 'discountValue',
                      type: 'number',
                      label: 'Valor do Desconto',
                      required: true,
                      min: 0,
                      admin: {
                        placeholder: 'Ex: 15 para 15% ou 100 para R$100',
                        width: '25%',
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'text',
                  label: 'Descrição do Desconto',
                  admin: {
                    placeholder: 'Ex: Desconto para grupos de 3 a 10 pessoas',
                  },
                },
              ],
            },
          ],
        },
        // ===== TAB: PROGRAMAÇÃO =====
        {
          label: 'Programação',
          fields: [
            {
              name: 'schedule',
              type: 'array',
              label: 'Programação',
              labels: {
                singular: 'Atividade',
                plural: 'Atividades',
              },
              admin: {
                description: 'Defina a programação do evento com as atividades em cada sala',
                initCollapsed: false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'room',
                      type: 'relationship',
                      label: 'Sala',
                      relationTo: 'rooms',
                      required: true,
                      admin: {
                        width: '40%',
                      },
                    },
                    {
                      name: 'date',
                      type: 'date',
                      label: 'Data',
                      required: true,
                      admin: {
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd/MM/yyyy',
                        },
                        width: '20%',
                      },
                    },
                    {
                      name: 'startTime',
                      type: 'date',
                      label: 'Hora Início',
                      required: true,
                      admin: {
                        date: {
                          pickerAppearance: 'timeOnly',
                          displayFormat: 'HH:mm',
                        },
                        width: '20%',
                      },
                    },
                    {
                      name: 'endTime',
                      type: 'date',
                      label: 'Hora Fim',
                      required: true,
                      admin: {
                        date: {
                          pickerAppearance: 'timeOnly',
                          displayFormat: 'HH:mm',
                        },
                        width: '20%',
                      },
                    },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título da Atividade',
                  required: true,
                  maxLength: 256,
                  admin: {
                    placeholder: 'Ex: Palestra de Abertura',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição',
                  admin: {
                    placeholder: 'Descrição da atividade',
                  },
                },
                {
                  name: 'speakers',
                  type: 'relationship',
                  label: 'Palestrantes',
                  relationTo: 'speakers',
                  hasMany: true,
                  admin: {
                    description: 'Palestrantes desta atividade (opcional)',
                  },
                },
                {
                  name: 'capacity',
                  type: 'number',
                  label: 'Capacidade Específica',
                  min: 1,
                  admin: {
                    placeholder: 'Deixe vazio para usar a capacidade da sala',
                    description: 'Limite específico para esta atividade (sobrescreve a sala)',
                  },
                },
              ],
            },
          ],
        },
        // ===== TAB: CERTIFICADOS =====
        {
          label: 'Certificados',
          fields: [
            {
              name: 'hasCertificate',
              type: 'checkbox',
              label: 'Evento possui certificado',
              defaultValue: false,
              admin: {
                description: 'Marque se este evento emitirá certificados aos participantes',
              },
            },
            {
              name: 'certificateConfig',
              type: 'group',
              label: 'Configuração de Certificado',
              admin: {
                condition: (data) => data.hasCertificate === true,
              },
              fields: [
                {
                  name: 'emissionType',
                  type: 'select',
                  label: 'Tipo de Emissão',
                  required: true,
                  defaultValue: 'automatic',
                  options: [
                    { label: 'Automática', value: 'automatic' },
                    { label: 'Manual', value: 'manual' },
                  ],
                  admin: {
                    description:
                      'Automática: emitido quando todas as regras forem atendidas | Manual: funcionário emite manualmente',
                  },
                },
                {
                  name: 'minimumAttendancePercentage',
                  type: 'number',
                  label: 'Percentual Mínimo de Presença (%)',
                  min: 0,
                  max: 100,
                  defaultValue: 70,
                  admin: {
                    description: 'Percentual mínimo de presença para emissão do certificado',
                  },
                },
                {
                  name: 'requiresSurvey',
                  type: 'checkbox',
                  label: 'Requer pesquisa de satisfação',
                  defaultValue: true,
                  admin: {
                    description: 'O participante deve responder a pesquisa para receber o certificado',
                  },
                },
                {
                  name: 'certificateTemplate',
                  type: 'upload',
                  label: 'Modelo de Certificado (.docx)',
                  relationTo: 'files',
                  filterOptions: {
                    mimeType: {
                      contains: 'document',
                    },
                  },
                  admin: {
                    description:
                      'Upload do modelo de certificado em formato .docx com variáveis: {{nome}}, {{oab}}, {{evento}}, {{data}}',
                  },
                },
                {
                  name: 'certificateRules',
                  type: 'textarea',
                  label: 'Regras para Emissão',
                  admin: {
                    placeholder: 'Descreva as regras adicionais para emissão do certificado',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // ===== SIDEBAR FIELDS =====
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Rascunho', value: 'draft' },
        { label: 'Publicado', value: 'published' },
        { label: 'Encerrado', value: 'closed' },
        { label: 'Cancelado', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL amigável do evento (gerada automaticamente)',
      },
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.title) {
              return data.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
    {
      name: 'registrationDeadline',
      type: 'date',
      label: 'Prazo de Inscrição',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
        description: 'Data limite para inscrições (deixe vazio para usar data de início)',
      },
    },
    createdByField,
    editedByField,
  ],
}
