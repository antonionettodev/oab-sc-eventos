import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'
import { validateScheduleHook } from './hooks/validate-schedule'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Evento',
    plural: 'Eventos',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Eventos',
    defaultColumns: ['title', 'eventType', 'modality', 'startDate', 'status'],
    description: 'Cadastro e configuração de eventos, cursos e palestras',
  },
  access: {
    read: () => true,
  },
  fields: [
    // ===============================
    // DADOS BÁSICOS
    // ===============================
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações Básicas',
          fields: [
            {
              name: 'title',
              type: 'text',
              label: 'Título do Evento',
              required: true,
              admin: {
                placeholder: 'Nome do evento',
                description: 'Título que será exibido na listagem e página do evento',
              },
              maxLength: 200,
            },
            {
              name: 'slug',
              type: 'text',
              label: 'Slug',
              required: true,
              unique: true,
              index: true,
              admin: {
                placeholder: 'nome-do-evento',
                description: 'URL amigável do evento (gerado automaticamente)',
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
                        .replace(/^-|-$/g, '')
                    }
                    return value
                  },
                ],
              },
            },
            {
              name: 'description',
              type: 'richText',
              label: 'Descrição',
              required: true,
              admin: {
                description: 'Descrição completa do evento',
              },
            },
            {
              name: 'featuredImage',
              type: 'upload',
              relationTo: 'files',
              label: 'Imagem de Destaque',
              required: false,
              admin: {
                description: 'Imagem principal do evento (recomendado: 1200x630)',
              },
              filterOptions: {
                mimeType: { contains: 'image' },
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'eventType',
                  type: 'select',
                  label: 'Tipo do Evento',
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'Classificação do tipo de evento',
                  },
                  options: [
                    { label: 'Evento', value: 'event' },
                    { label: 'Curso', value: 'course' },
                  ],
                  defaultValue: 'event',
                },
                {
                  name: 'modality',
                  type: 'select',
                  label: 'Modalidade',
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'Formato de realização do evento',
                  },
                  options: [
                    { label: 'Presencial', value: 'in-person' },
                    { label: 'Híbrido', value: 'hybrid' },
                    { label: 'Virtual', value: 'virtual' },
                  ],
                  defaultValue: 'in-person',
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
                  admin: {
                    width: '50%',
                    description: 'Define o público-alvo do evento',
                  },
                  options: [
                    { label: 'Interno (apenas membros)', value: 'internal' },
                    { label: 'Externo (público geral)', value: 'external' },
                  ],
                  defaultValue: 'external',
                },
                {
                  name: 'registrationType',
                  type: 'select',
                  label: 'Tipo de Inscrição',
                  required: true,
                  admin: {
                    width: '50%',
                    description: 'Define como as inscrições serão realizadas',
                  },
                  options: [
                    { label: 'Interna (pelo sistema)', value: 'internal' },
                    { label: 'Externa (link externo)', value: 'external' },
                  ],
                  defaultValue: 'internal',
                },
              ],
            },
            {
              name: 'externalRegistrationUrl',
              type: 'text',
              label: 'Link de Inscrição Externa',
              required: false,
              admin: {
                placeholder: 'https://...',
                description: 'URL para inscrição em plataforma externa',
                condition: (data) => data?.registrationType === 'external',
              },
            },
            {
              name: 'location',
              type: 'text',
              label: 'Local do Evento',
              required: true,
              admin: {
                placeholder: 'Ex: Sede da OAB/SC, Florianópolis',
                description: 'Endereço ou local onde o evento será realizado',
              },
              maxLength: 300,
            },
          ],
        },
        {
          label: 'Datas e Inscrições',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  label: 'Data/Hora de Início',
                  required: true,
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Quando o evento começa',
                  },
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: 'Data/Hora de Término',
                  required: true,
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Quando o evento termina',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'registrationStartDate',
                  type: 'date',
                  label: 'Início das Inscrições',
                  required: false,
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Quando as inscrições abrem',
                  },
                },
                {
                  name: 'registrationEndDate',
                  type: 'date',
                  label: 'Fim das Inscrições',
                  required: false,
                  admin: {
                    width: '50%',
                    date: {
                      pickerAppearance: 'dayAndTime',
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Quando as inscrições encerram',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'maxRegistrations',
                  type: 'number',
                  label: 'Limite de Inscrições',
                  required: true,
                  min: 1,
                  max: 100000,
                  admin: {
                    width: '50%',
                    placeholder: '100',
                    description: 'Número máximo de inscrições permitidas',
                    step: 1,
                  },
                },
                {
                  name: 'refundDays',
                  type: 'number',
                  label: 'Dias para Reembolso',
                  required: true,
                  min: 0,
                  max: 365,
                  defaultValue: 7,
                  admin: {
                    width: '50%',
                    placeholder: '7',
                    description: 'Prazo em dias antes do evento para solicitar reembolso',
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Categorias de Inscrição',
          description: 'Defina os tipos de ingressos disponíveis para este evento',
          fields: [
            {
              name: 'categories',
              type: 'array',
              label: 'Categorias',
              required: true,
              minRows: 1,
              admin: {
                description: 'Adicione pelo menos uma categoria de inscrição',
                initCollapsed: false,
              },
              labels: {
                singular: 'Categoria',
                plural: 'Categorias',
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
                      admin: {
                        width: '60%',
                        placeholder: 'Ex: Advogado, Estagiário, Público Externo',
                      },
                      maxLength: 100,
                    },
                    {
                      name: 'price',
                      type: 'number',
                      label: 'Valor (R$)',
                      required: true,
                      min: 0,
                      admin: {
                        width: '40%',
                        placeholder: '300.00',
                        description: 'Valor em reais',
                        step: 0.01,
                      },
                    },
                  ],
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição',
                  required: false,
                  admin: {
                    placeholder: 'Descrição da categoria...',
                  },
                  maxLength: 300,
                },
                {
                  name: 'maxQuantity',
                  type: 'number',
                  label: 'Quantidade Máxima',
                  required: false,
                  min: 1,
                  admin: {
                    placeholder: 'Ilimitado se vazio',
                    description: 'Limite de ingressos desta categoria',
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Descontos em Grupo',
          description: 'Configure descontos para compras de múltiplos ingressos',
          fields: [
            {
              name: 'discountGroups',
              type: 'array',
              label: 'Grupos de Desconto',
              required: false,
              admin: {
                description: 'Descontos aplicados sobre o valor total da compra',
                initCollapsed: true,
              },
              labels: {
                singular: 'Grupo de Desconto',
                plural: 'Grupos de Desconto',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minQuantity',
                      type: 'number',
                      label: 'Quantidade Mínima',
                      required: true,
                      min: 2,
                      admin: {
                        width: '25%',
                        placeholder: '3',
                        description: 'Mínimo de ingressos',
                        step: 1,
                      },
                    },
                    {
                      name: 'maxQuantity',
                      type: 'number',
                      label: 'Quantidade Máxima',
                      required: true,
                      min: 2,
                      admin: {
                        width: '25%',
                        placeholder: '10',
                        description: 'Máximo de ingressos',
                        step: 1,
                      },
                    },
                    {
                      name: 'discountType',
                      type: 'select',
                      label: 'Tipo de Desconto',
                      required: true,
                      admin: {
                        width: '25%',
                      },
                      options: [
                        { label: 'Porcentagem', value: 'percentage' },
                        { label: 'Valor Fixo', value: 'fixed' },
                      ],
                      defaultValue: 'percentage',
                    },
                    {
                      name: 'discountValue',
                      type: 'number',
                      label: 'Valor do Desconto',
                      required: true,
                      min: 0,
                      admin: {
                        width: '25%',
                        placeholder: '15',
                        description: '% ou R$',
                        step: 0.01,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Programação',
          description: 'Defina a programação completa do evento com salas e horários',
          fields: [
            {
              name: 'schedule',
              type: 'array',
              label: 'Atividades',
              required: false,
              admin: {
                description: 'Adicione as atividades que compõem o evento',
                initCollapsed: false,
              },
              labels: {
                singular: 'Atividade',
                plural: 'Atividades',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'room',
                      type: 'relationship',
                      relationTo: 'rooms',
                      label: 'Sala',
                      required: true,
                      admin: {
                        width: '50%',
                      },
                      filterOptions: {
                        isActive: { equals: true },
                      },
                    },
                    {
                      name: 'date',
                      type: 'date',
                      label: 'Data',
                      required: true,
                      admin: {
                        width: '50%',
                        date: {
                          pickerAppearance: 'dayOnly',
                          displayFormat: 'dd/MM/yyyy',
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título da Atividade',
                  required: true,
                  admin: {
                    placeholder: 'Ex: Palestra de Abertura',
                  },
                  maxLength: 200,
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição',
                  required: false,
                  maxLength: 500,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'startTime',
                      type: 'text',
                      label: 'Hora de Início',
                      required: true,
                      admin: {
                        width: '50%',
                        placeholder: '09:00',
                        description: 'Formato: HH:MM',
                      },
                      validate: (value) => {
                        if (!value) return true
                        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
                        if (!timeRegex.test(value)) {
                          return 'Formato de hora inválido. Use HH:MM'
                        }
                        return true
                      },
                    },
                    {
                      name: 'endTime',
                      type: 'text',
                      label: 'Hora de Término',
                      required: true,
                      admin: {
                        width: '50%',
                        placeholder: '10:30',
                        description: 'Formato: HH:MM',
                      },
                      validate: (value) => {
                        if (!value) return true
                        const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
                        if (!timeRegex.test(value)) {
                          return 'Formato de hora inválido. Use HH:MM'
                        }
                        return true
                      },
                    },
                  ],
                },
                {
                  name: 'speakers',
                  type: 'relationship',
                  relationTo: 'speakers',
                  label: 'Palestrantes',
                  hasMany: true,
                  required: false,
                  admin: {
                    description: 'Selecione os palestrantes desta atividade',
                  },
                  filterOptions: {
                    isActive: { equals: true },
                  },
                },
                {
                  name: 'maxCapacity',
                  type: 'number',
                  label: 'Capacidade Máxima (override)',
                  required: false,
                  min: 1,
                  admin: {
                    description: 'Deixe vazio para usar a capacidade da sala',
                    step: 1,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Certificado',
          description: 'Configurações de emissão de certificados',
          fields: [
            {
              name: 'hasCertificate',
              type: 'checkbox',
              label: 'Possui Certificado',
              defaultValue: false,
              admin: {
                description: 'Marque se este evento emitirá certificados',
              },
            },
            {
              name: 'certificateConfig',
              type: 'group',
              label: 'Configurações do Certificado',
              admin: {
                condition: (data) => data?.hasCertificate === true,
              },
              fields: [
                {
                  name: 'issueType',
                  type: 'select',
                  label: 'Tipo de Emissão',
                  required: true,
                  options: [
                    { label: 'Automática', value: 'automatic' },
                    { label: 'Manual', value: 'manual' },
                  ],
                  defaultValue: 'automatic',
                  admin: {
                    description: 'Automática: após evento. Manual: por funcionário.',
                  },
                },
                {
                  name: 'requireSurvey',
                  type: 'checkbox',
                  label: 'Exigir Pesquisa de Satisfação',
                  defaultValue: true,
                  admin: {
                    description: 'Certificado só é emitido após responder pesquisa',
                  },
                },
                {
                  name: 'attendanceRule',
                  type: 'select',
                  label: 'Regra de Presença',
                  required: true,
                  options: [
                    { label: 'Qualquer check-in', value: 'any' },
                    { label: 'Mínimo de 50% dos dias', value: '50percent' },
                    { label: 'Mínimo de 70% dos dias', value: '70percent' },
                    { label: 'Todos os dias', value: 'all' },
                  ],
                  defaultValue: 'any',
                  admin: {
                    description: 'Define a presença mínima para emissão',
                  },
                },
                {
                  name: 'templateFile',
                  type: 'upload',
                  relationTo: 'files',
                  label: 'Modelo do Certificado',
                  required: true,
                  admin: {
                    description: 'Arquivo .docx com variáveis: {{nome}}, {{oab}}, {{evento}}, {{data}}, {{cargaHoraria}}',
                  },
                  filterOptions: {
                    mimeType: {
                      contains: 'application/vnd.openxmlformats-officedocument.wordprocessingml',
                    },
                  },
                },
                {
                  name: 'workload',
                  type: 'text',
                  label: 'Carga Horária',
                  required: false,
                  admin: {
                    placeholder: 'Ex: 8 horas',
                    description: 'Carga horária para constar no certificado',
                  },
                  maxLength: 50,
                },
              ],
            },
          ],
        },
        {
          label: 'Check-in',
          description: 'Configurações de controle de presença',
          fields: [
            {
              name: 'checkInConfig',
              type: 'group',
              label: 'Configurações de Check-in',
              fields: [
                {
                  name: 'checkInType',
                  type: 'select',
                  label: 'Tipo de Check-in',
                  required: true,
                  options: [
                    { label: 'Por Evento (QR Code geral)', value: 'event' },
                    { label: 'Por Dia', value: 'day' },
                    { label: 'Por Sala', value: 'room' },
                  ],
                  defaultValue: 'event',
                  admin: {
                    description: 'Define como o check-in será registrado',
                  },
                },
                {
                  name: 'qrCodeGenerated',
                  type: 'checkbox',
                  label: 'QR Code Gerado',
                  defaultValue: false,
                  admin: {
                    readOnly: true,
                    description: 'Indica se o QR Code foi gerado',
                    position: 'sidebar',
                  },
                },
                {
                  name: 'eventQrCode',
                  type: 'text',
                  label: 'Código do QR Code',
                  required: false,
                  admin: {
                    readOnly: true,
                    description: 'Código único para check-in do evento',
                    position: 'sidebar',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    // ===============================
    // CAMPOS DE CONTROLE (SIDEBAR)
    // ===============================
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
        description: 'Status atual do evento',
      },
    },
    {
      name: 'currentRegistrations',
      type: 'number',
      label: 'Inscrições Atuais',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Número de inscrições confirmadas',
      },
    },
    createdByField,
    editedByField,
  ],
  hooks: {
    beforeChange: [
      validateScheduleHook,
      async ({ data, operation }) => {
        // Gerar código QR Code na criação
        if (operation === 'create' && !data.checkInConfig?.eventQrCode) {
          const { v4: uuidv4 } = await import('uuid')
          data.checkInConfig = {
            ...data.checkInConfig,
            eventQrCode: uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase(),
          }
        }
        return data
      },
    ],
  },
}
