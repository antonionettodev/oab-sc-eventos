import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'
import { uppercaseTrimHook } from '@/hooks/uppercase-trim'
import { trimHook } from '@/hooks/trim'
import {
  validateNotInPast,
  validateEventDates,
  validateEventTimes,
  validateRegistrationDates,
} from './validators/date-validators'
import {
  validateActivityDate,
  validateActivityTimes,
  validateRoomConflict,
  validateSpeakerConflict,
} from './validators/activity-validators'
import { urlValidator } from './validators/url-validator'

export const Events: CollectionConfig = {
  slug: 'events',
  labels: {
    singular: 'Evento',
    plural: 'Eventos',
  },
  admin: {
    group: 'Eventos',
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDate', 'endDate', 'scope', 'createdAt'],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Informações Básicas',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título do Evento',
                  required: true,
                  minLength: 4,
                  maxLength: 128,
                  admin: {
                    placeholder: 'Digite o título do evento...',
                    description: 'Nome do evento',
                    width: '70%',
                  },
                  hooks: {
                    beforeChange: [uppercaseTrimHook],
                  },
                },
                slugField({
                  name: 'slug',
                  admin: {
                    width: '30%',
                  },
                }),
              ],
            },
            {
              name: 'description',
              type: 'textarea',
              label: 'Descrição do Evento',
              required: true,
              minLength: 32,
              maxLength: 2048,
              admin: {
                placeholder: 'Digite uma descrição detalhada do evento...',
                description: 'Informações sobre o evento',
              },
              hooks: {
                beforeChange: [trimHook],
              },
            },
            {
              name: 'location',
              type: 'text',
              label: 'Local do Evento',
              required: true,
              minLength: 4,
              maxLength: 256,
              admin: {
                placeholder: 'Digite o endereço ou local do evento...',
                description: 'Endereço completo do evento',
              },
              hooks: {
                beforeChange: [trimHook],
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'files',
              label: 'Imagem do Evento',
              required: true,
              admin: {
                description: 'Imagem de capa do evento',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'modality',
                  type: 'select',
                  label: 'Modalidade do Evento',
                  required: true,
                  options: [
                    { label: 'Presencial', value: 'in-person' },
                    { label: 'Virtual', value: 'virtual' },
                    { label: 'Híbrido', value: 'hybrid' },
                  ],
                  admin: {
                    description: 'Como o evento será realizado',
                    width: '50%',
                  },
                },
                {
                  name: 'scope',
                  type: 'select',
                  label: 'Escopo do Evento',
                  required: true,
                  options: [
                    { label: 'Institucional', value: 'institutional' },
                    { label: 'Público', value: 'public' },
                  ],
                  admin: {
                    description: 'Quem pode participar do evento',
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Datas e Horários',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startDate',
                  type: 'date',
                  label: 'Data de Início do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'dd/MM/yyyy',
                    },
                    description: 'Data de início',
                    width: '50%',
                  },
                  validate: validateNotInPast,
                },
                {
                  name: 'endDate',
                  type: 'date',
                  label: 'Data de Encerramento do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'dd/MM/yyyy',
                    },
                    description: 'Data de encerramento',
                    width: '50%',
                  },
                  validate: [validateNotInPast, validateEventDates],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startTime',
                  type: 'date',
                  label: 'Horário de Início do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'HH:mm',
                      pickerAppearance: 'timeOnly',
                    },
                    description: 'Horário de início',
                    width: '50%',
                  },
                },
                {
                  name: 'endTime',
                  type: 'date',
                  label: 'Horário de Encerramento do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'HH:mm',
                      pickerAppearance: 'timeOnly',
                    },
                    description: 'Horário de encerramento',
                    width: '50%',
                  },
                  validate: validateEventTimes,
                },
              ],
            },
          ],
        },
        {
          label: 'Inscrições',
          fields: [
            {
              name: 'registrationType',
              type: 'select',
              label: 'Tipo de Inscrição do Evento',
              required: true,
              options: [
                { label: 'Interna (pelo sistema)', value: 'internal' },
                { label: 'Externa (link externo)', value: 'external' },
              ],
              admin: {
                description: 'Como serão feitas as inscrições',
              },
            },
            {
              name: 'externalRegistrationUrl',
              type: 'text',
              label: 'Link de Inscrição Externa do Evento',
              defaultValue: 'https://',
              admin: {
                placeholder: 'https://exemplo.com/inscricao',
                description: 'URL para inscrição externa',
                condition: (data) => data.registrationType === 'external',
              },
              validate: urlValidator,
              hooks: {
                beforeChange: [trimHook],
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'registrationLimit',
                  type: 'number',
                  label: 'Limite de Inscrições',
                  required: true,
                  min: 1,
                  admin: {
                    placeholder: '0',
                    description: 'Número máximo de inscrições',
                    width: '50%',
                    condition: (data) => data.registrationType === 'internal',
                  },
                  validate: (value, { data }) => {
                    if (data?.registrationType !== 'internal') return true
                    if (typeof value === 'number' && value <= 0) {
                      return 'O limite deve ser maior que 0'
                    }
                    return true
                  },
                },
                {
                  name: 'refundDays',
                  type: 'number',
                  label: 'Dias para Pedir Reembolso',
                  required: true,
                  min: 0,
                  admin: {
                    placeholder: '0',
                    description: 'Quantidade de dias para solicitar reembolso',
                    width: '50%',
                    condition: (data) => data.registrationType === 'internal',
                  },
                  validate: (value, { data }) => {
                    if (data?.registrationType !== 'internal') return true
                    if (typeof value === 'number' && value < 0) {
                      return 'O valor não pode ser menor que 0'
                    }
                    return true
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'registrationStart',
                  type: 'date',
                  label: 'Início das Inscrições do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Data e hora de início das inscrições',
                    width: '50%',
                    condition: (data) => data.registrationType === 'internal',
                  },
                  validate: validateRegistrationDates,
                },
                {
                  name: 'registrationEnd',
                  type: 'date',
                  label: 'Encerramento das Inscrições do Evento',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'dd/MM/yyyy HH:mm',
                    },
                    description: 'Data e hora de encerramento das inscrições',
                    width: '50%',
                    condition: (data) => data.registrationType === 'internal',
                  },
                  validate: validateRegistrationDates,
                },
              ],
            },
            {
              name: 'checkinMinutesBefore',
              type: 'number',
              label: 'Tempo em Minutos Antes do Evento para Liberar o Check-in',
              required: true,
              defaultValue: 60,
              min: 0,
              admin: {
                placeholder: '60',
                description: 'Minutos antes do evento para permitir check-in',
                condition: (data) => data.registrationType === 'internal',
              },
              validate: (value, { data }) => {
                if (data?.registrationType !== 'internal') return true
                if (typeof value === 'number' && value < 0) {
                  return 'O valor não pode ser menor que 0'
                }
                return true
              },
            },
          ],
        },
        {
          label: 'Categorias e Descontos',
          fields: [
            {
              name: 'registrationCategories',
              type: 'array',
              label: 'Categorias de Inscrição',
              minRows: 1,
              maxRows: 5,
              required: true,
              admin: {
                description: 'Categorias de inscrição com valores diferentes',
                condition: (data) => data.registrationType === 'internal',
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título da Categoria',
                  required: true,
                  minLength: 4,
                  maxLength: 64,
                  admin: {
                    placeholder: 'Ex: Advogado OAB/SC...',
                  },
                  hooks: {
                    beforeChange: [uppercaseTrimHook],
                  },
                },
                {
                  name: 'value',
                  type: 'number',
                  label: 'Valor da Categoria (em centavos)',
                  required: true,
                  min: 0,
                  admin: {
                    placeholder: '0',
                    description: 'Valor em centavos (ex: R$ 100,00 = 10000)',
                  },
                  validate: (value) => {
                    if (typeof value === 'number' && value < 0) {
                      return 'O valor não pode ser menor que 0'
                    }
                    return true
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição',
                  maxLength: 128,
                  admin: {
                    placeholder: 'Descrição da categoria...',
                  },
                  hooks: {
                    beforeChange: [trimHook],
                  },
                },
              ],
            },
            {
              name: 'discountGroups',
              type: 'array',
              label: 'Grupos de Desconto',
              maxRows: 3,
              admin: {
                description: 'Descontos por quantidade de inscrições',
                condition: (data) => data.registrationType === 'internal',
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
                      min: 1,
                      admin: {
                        placeholder: '0',
                        width: '50%',
                      },
                      validate: (value) => {
                        if (typeof value === 'number' && value <= 0) {
                          return 'Deve ser maior que 0'
                        }
                        return true
                      },
                    },
                    {
                      name: 'maxQuantity',
                      type: 'number',
                      label: 'Quantidade Máxima',
                      min: 1,
                      admin: {
                        placeholder: 'Deixe em branco para ilimitado',
                        width: '50%',
                      },
                      validate: (value, { siblingData }) => {
                        if (!value) return true
                        const minQuantity = siblingData?.minQuantity as number | undefined
                        if (minQuantity && typeof value === 'number' && value < minQuantity) {
                          return 'Não pode ser menor que a quantidade mínima'
                        }
                        return true
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'type',
                      type: 'select',
                      label: 'Tipo',
                      required: true,
                      options: [
                        { label: 'Percentual (%)', value: 'percentage' },
                        { label: 'Fixo (R$)', value: 'fixed' },
                      ],
                      admin: {
                        width: '50%',
                      },
                    },
                    {
                      name: 'value',
                      type: 'number',
                      label: 'Valor',
                      required: true,
                      min: 1,
                      admin: {
                        placeholder: '0',
                        description: 'Valor do desconto',
                        width: '50%',
                      },
                      validate: (value, { siblingData }) => {
                        if (typeof value !== 'number' || value <= 0) {
                          return 'Deve ser maior que 0'
                        }
                        if (siblingData?.type === 'percentage' && value > 100) {
                          return 'Percentual não pode ser maior que 100'
                        }
                        return true
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Certificado',
          fields: [
            {
              name: 'hasCertificate',
              type: 'checkbox',
              label: 'Evento Possui Certificado',
              admin: {
                description: 'Se marcado, o evento emitirá certificados',
              },
            },
            {
              name: 'certificateIssuanceType',
              type: 'select',
              label: 'Tipo de Emissão',
              options: [
                { label: 'Manual', value: 'manual' },
                { label: 'Automática', value: 'automatic' },
              ],
              admin: {
                description: 'Como os certificados serão emitidos',
                condition: (data) => data.hasCertificate === true,
              },
            },
            {
              name: 'certificateTemplate',
              type: 'upload',
              relationTo: 'files',
              label: 'Modelo de Certificado',
              admin: {
                description: 'Arquivo de modelo do certificado',
                condition: (data) => data.hasCertificate === true,
              },
            },
            {
              name: 'certificateIssuanceRule',
              type: 'select',
              label: 'Regra de Emissão',
              options: [
                { label: 'Qualquer presença', value: 'any' },
                { label: 'Mínimo 25%', value: '25%' },
                { label: 'Mínimo 50%', value: '50%' },
                { label: 'Mínimo 75%', value: '75%' },
                { label: 'Presença completa', value: 'full' },
              ],
              admin: {
                description: 'Presença mínima para emissão de certificado',
                condition: (data) => data.hasCertificate === true,
              },
            },
          ],
        },
        {
          label: 'Programação',
          fields: [
            {
              name: 'activities',
              type: 'array',
              label: 'Atividades do Evento',
              minRows: 1,
              required: true,
              admin: {
                description: 'Programação do evento',
                initCollapsed: true,
              },
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Título da Atividade',
                  required: true,
                  minLength: 4,
                  maxLength: 64,
                  admin: {
                    placeholder: 'Digite o título da atividade...',
                  },
                  hooks: {
                    beforeChange: [uppercaseTrimHook],
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Descrição da Atividade',
                  maxLength: 128,
                  admin: {
                    placeholder: 'Digite uma descrição da atividade...',
                  },
                  hooks: {
                    beforeChange: [trimHook],
                  },
                },
                {
                  name: 'room',
                  type: 'relationship',
                  relationTo: 'event-rooms',
                  label: 'Sala da Atividade',
                  required: true,
                  admin: {
                    description: 'Sala onde a atividade acontecerá',
                  },
                  validate: validateRoomConflict,
                },
                {
                  name: 'activityDate',
                  type: 'date',
                  label: 'Data da Atividade',
                  required: true,
                  admin: {
                    date: {
                      displayFormat: 'dd/MM/yyyy',
                    },
                    description: 'Data da atividade',
                  },
                  validate: validateActivityDate,
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'activityStartTime',
                      type: 'date',
                      label: 'Horário de Início da Atividade',
                      required: true,
                      admin: {
                        date: {
                          displayFormat: 'HH:mm',
                          pickerAppearance: 'timeOnly',
                        },
                        description: 'Horário de início',
                        width: '50%',
                      },
                      validate: validateActivityTimes,
                    },
                    {
                      name: 'activityEndTime',
                      type: 'date',
                      label: 'Horário de Encerramento da Atividade',
                      required: true,
                      admin: {
                        date: {
                          displayFormat: 'HH:mm',
                          pickerAppearance: 'timeOnly',
                        },
                        description: 'Horário de encerramento',
                        width: '50%',
                      },
                      validate: validateActivityTimes,
                    },
                  ],
                },
                {
                  name: 'speakers',
                  type: 'relationship',
                  relationTo: 'speakers',
                  label: 'Palestrantes',
                  hasMany: true,
                  admin: {
                    description: 'Palestrantes desta atividade',
                  },
                  validate: validateSpeakerConflict,
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  timestamps: true,
}
