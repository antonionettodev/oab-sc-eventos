import type { CollectionConfig } from 'payload'

import { nameField } from '@/fields/name'
import { cpfField } from '@/fields/cpf'
import { phoneField } from '@/fields/phone'
import { oabNumberField } from '@/fields/oab-number'
import { addressFields } from '@/fields/address'
import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  labels: {
    singular: 'Inscrição',
    plural: 'Inscrições',
  },
  admin: {
    useAsTitle: 'orderCode',
    group: 'Eventos',
    defaultColumns: ['orderCode', 'event', 'buyerName', 'paymentStatus', 'createdAt'],
    description: 'Inscrições e pedidos de ingressos para eventos',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user) return true
      return false
    },
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Dados do Pedido',
          fields: [
            {
              name: 'orderCode',
              type: 'text',
              label: 'Código do Pedido',
              required: true,
              unique: true,
              index: true,
              admin: {
                readOnly: true,
                description: 'Código único de identificação do pedido',
              },
            },
            {
              name: 'event',
              type: 'relationship',
              relationTo: 'events',
              label: 'Evento',
              required: true,
              admin: {
                description: 'Evento relacionado a esta inscrição',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'totalAmount',
                  type: 'number',
                  label: 'Valor Total (R$)',
                  required: true,
                  min: 0,
                  admin: {
                    width: '33%',
                    readOnly: true,
                    description: 'Valor total do pedido',
                    step: 0.01,
                  },
                },
                {
                  name: 'discountAmount',
                  type: 'number',
                  label: 'Desconto (R$)',
                  required: false,
                  min: 0,
                  defaultValue: 0,
                  admin: {
                    width: '33%',
                    readOnly: true,
                    description: 'Valor do desconto aplicado',
                    step: 0.01,
                  },
                },
                {
                  name: 'finalAmount',
                  type: 'number',
                  label: 'Valor Final (R$)',
                  required: true,
                  min: 0,
                  admin: {
                    width: '33%',
                    readOnly: true,
                    description: 'Valor a pagar',
                    step: 0.01,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Dados do Comprador',
          fields: [
            nameField({
              name: 'buyerName',
              label: 'Nome do Comprador',
              width: '100%',
            }),
            {
              type: 'row',
              fields: [
                {
                  name: 'buyerEmail',
                  type: 'email',
                  label: 'E-mail',
                  required: true,
                  admin: {
                    width: '50%',
                    placeholder: 'email@exemplo.com',
                  },
                },
                phoneField({
                  name: 'buyerPhone',
                  label: 'Telefone',
                  width: '50%',
                }),
              ],
            },
            cpfField({
              name: 'buyerCpf',
              label: 'CPF',
              width: '50%',
            }),
            addressFields({
              name: 'buyerAddress',
              required: true,
            }),
          ],
        },
        {
          label: 'Ingressos',
          description: 'Ingressos individuais deste pedido',
          fields: [
            {
              name: 'tickets',
              type: 'array',
              label: 'Ingressos',
              required: true,
              minRows: 1,
              admin: {
                description: 'Cada ingresso representa um participante',
                initCollapsed: false,
              },
              labels: {
                singular: 'Ingresso',
                plural: 'Ingressos',
              },
              fields: [
                {
                  name: 'ticketCode',
                  type: 'text',
                  label: 'Código do Ingresso',
                  required: true,
                  admin: {
                    readOnly: true,
                    description: 'Código único do ingresso',
                  },
                },
                nameField({
                  name: 'participantName',
                  label: 'Nome do Participante',
                  width: '100%',
                }),
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'participantEmail',
                      type: 'email',
                      label: 'E-mail',
                      required: true,
                      admin: {
                        width: '50%',
                      },
                    },
                    phoneField({
                      name: 'participantPhone',
                      label: 'Telefone',
                      width: '50%',
                    }),
                  ],
                },
                oabNumberField({
                  name: 'participantOab',
                  label: 'OAB',
                  width: '50%',
                }),
                {
                  name: 'categoryId',
                  type: 'text',
                  label: 'ID da Categoria',
                  required: true,
                  admin: {
                    description: 'Identificador da categoria de inscrição',
                  },
                },
                {
                  name: 'categoryTitle',
                  type: 'text',
                  label: 'Categoria',
                  required: true,
                  admin: {
                    readOnly: true,
                    description: 'Nome da categoria selecionada',
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
                    step: 0.01,
                  },
                },
                {
                  name: 'selectedSchedule',
                  type: 'array',
                  label: 'Programação Selecionada',
                  required: false,
                  admin: {
                    description: 'Atividades/salas selecionadas para este ingresso',
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'scheduleItemId',
                      type: 'text',
                      label: 'ID da Atividade',
                      required: true,
                    },
                    {
                      name: 'roomId',
                      type: 'text',
                      label: 'ID da Sala',
                      required: true,
                    },
                    {
                      name: 'roomTitle',
                      type: 'text',
                      label: 'Sala',
                      required: true,
                    },
                    {
                      name: 'activityTitle',
                      type: 'text',
                      label: 'Atividade',
                      required: true,
                    },
                    {
                      name: 'date',
                      type: 'date',
                      label: 'Data',
                      required: true,
                    },
                    {
                      name: 'startTime',
                      type: 'text',
                      label: 'Início',
                      required: true,
                    },
                    {
                      name: 'endTime',
                      type: 'text',
                      label: 'Término',
                      required: true,
                    },
                  ],
                },
                {
                  name: 'ticketStatus',
                  type: 'select',
                  label: 'Status do Ingresso',
                  required: true,
                  defaultValue: 'pending',
                  options: [
                    { label: 'Pendente', value: 'pending' },
                    { label: 'Confirmado', value: 'confirmed' },
                    { label: 'Check-in Realizado', value: 'checked-in' },
                    { label: 'Cancelado', value: 'cancelled' },
                    { label: 'Reembolsado', value: 'refunded' },
                  ],
                  admin: {
                    description: 'Status atual deste ingresso',
                  },
                },
                {
                  name: 'qrCodeUrl',
                  type: 'text',
                  label: 'URL do QR Code',
                  required: false,
                  admin: {
                    readOnly: true,
                    description: 'URL da imagem do QR Code do ingresso',
                  },
                },
                {
                  name: 'ticketSentAt',
                  type: 'date',
                  label: 'Ingresso Enviado em',
                  required: false,
                  admin: {
                    readOnly: true,
                    date: {
                      pickerAppearance: 'dayAndTime',
                    },
                  },
                },
                {
                  name: 'isBuyer',
                  type: 'checkbox',
                  label: 'É o Comprador',
                  defaultValue: false,
                  admin: {
                    description: 'Marque se este ingresso é do próprio comprador',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Pagamento',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentStatus',
                  type: 'select',
                  label: 'Status do Pagamento',
                  required: true,
                  defaultValue: 'pending',
                  options: [
                    { label: 'Pendente', value: 'pending' },
                    { label: 'Aguardando Pagamento', value: 'waiting' },
                    { label: 'Pago', value: 'paid' },
                    { label: 'Falhou', value: 'failed' },
                    { label: 'Cancelado', value: 'cancelled' },
                    { label: 'Reembolsado', value: 'refunded' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'paymentMethod',
                  type: 'select',
                  label: 'Método de Pagamento',
                  required: false,
                  options: [
                    { label: 'Cartão de Crédito', value: 'credit_card' },
                    { label: 'Cartão de Débito', value: 'debit_card' },
                    { label: 'Boleto', value: 'boleto' },
                    { label: 'PIX', value: 'pix' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'checkoutId',
              type: 'text',
              label: 'ID do Checkout (PagBank)',
              required: false,
              admin: {
                readOnly: true,
                description: 'Identificador do checkout no PagBank',
              },
            },
            {
              name: 'checkoutUrl',
              type: 'text',
              label: 'URL do Checkout',
              required: false,
              admin: {
                readOnly: true,
                description: 'Link para a página de pagamento',
              },
            },
            {
              name: 'paymentId',
              type: 'text',
              label: 'ID do Pagamento',
              required: false,
              admin: {
                readOnly: true,
                description: 'Identificador do pagamento confirmado',
              },
            },
            {
              name: 'paidAt',
              type: 'date',
              label: 'Data do Pagamento',
              required: false,
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
          ],
        },
        {
          label: 'Reembolso',
          fields: [
            {
              name: 'refundRequested',
              type: 'checkbox',
              label: 'Reembolso Solicitado',
              defaultValue: false,
              admin: {
                description: 'Indica se foi solicitado reembolso',
              },
            },
            {
              name: 'refundRequestedAt',
              type: 'date',
              label: 'Data da Solicitação',
              required: false,
              admin: {
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                condition: (data) => data?.refundRequested === true,
              },
            },
            {
              name: 'refundReason',
              type: 'textarea',
              label: 'Motivo do Reembolso',
              required: false,
              admin: {
                condition: (data) => data?.refundRequested === true,
              },
            },
            {
              name: 'refundStatus',
              type: 'select',
              label: 'Status do Reembolso',
              required: false,
              options: [
                { label: 'Em Análise', value: 'pending' },
                { label: 'Aprovado', value: 'approved' },
                { label: 'Processando', value: 'processing' },
                { label: 'Concluído', value: 'completed' },
                { label: 'Negado', value: 'denied' },
              ],
              admin: {
                condition: (data) => data?.refundRequested === true,
              },
            },
            {
              name: 'refundedAt',
              type: 'date',
              label: 'Data do Reembolso',
              required: false,
              admin: {
                readOnly: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                },
                condition: (data) => data?.refundStatus === 'completed',
              },
            },
            {
              name: 'refundDeniedReason',
              type: 'textarea',
              label: 'Motivo da Negativa',
              required: false,
              admin: {
                condition: (data) => data?.refundStatus === 'denied',
              },
            },
          ],
        },
      ],
    },
    createdByField,
    editedByField,
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation }) => {
        if (operation === 'create') {
          // Gerar código do pedido
          const { v4: uuidv4 } = await import('uuid')
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = uuidv4().replace(/-/g, '').substring(0, 6).toUpperCase()
          data.orderCode = `PED-${timestamp}-${random}`

          // Gerar códigos para cada ingresso
          if (data.tickets && Array.isArray(data.tickets)) {
            data.tickets = data.tickets.map((ticket: Record<string, unknown>, index: number) => {
              if (!ticket.ticketCode) {
                const ticketRandom = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase()
                return {
                  ...ticket,
                  ticketCode: `TKT-${timestamp}-${String(index + 1).padStart(2, '0')}-${ticketRandom}`,
                }
              }
              return ticket
            })
          }
        }
        return data
      },
    ],
  },
}
