import type { CollectionConfig } from 'payload'

import { createdByField } from '@/fields/created-by'
import { editedByField } from '@/fields/edited-by'
import { updateTicketsOnPaymentHook } from './hooks/update-tickets-on-payment'
import { validateRefundHook } from './hooks/validate-refund'

export const Registrations: CollectionConfig = {
  slug: 'registrations',
  labels: {
    singular: 'Inscrição',
    plural: 'Inscrições',
  },
  admin: {
    useAsTitle: 'referenceId',
    group: 'Eventos',
    defaultColumns: ['referenceId', 'event', 'buyerName', 'status', 'totalAmount', 'createdAt'],
  },
  fields: [
    // ===== TABS =====
    {
      type: 'tabs',
      tabs: [
        // ===== TAB: DADOS DO COMPRADOR =====
        {
          label: 'Dados do Comprador',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'buyerName',
                  type: 'text',
                  label: 'Nome Completo',
                  required: true,
                  maxLength: 128,
                  admin: {
                    placeholder: 'Nome completo do comprador',
                    width: '50%',
                  },
                },
                {
                  name: 'buyerEmail',
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
                  name: 'buyerPhone',
                  type: 'text',
                  label: 'Telefone',
                  required: true,
                  maxLength: 20,
                  admin: {
                    placeholder: '(00) 00000-0000',
                    width: '33%',
                  },
                },
                {
                  name: 'buyerCpf',
                  type: 'text',
                  label: 'CPF',
                  required: true,
                  maxLength: 14,
                  admin: {
                    placeholder: '000.000.000-00',
                    width: '33%',
                  },
                },
                {
                  name: 'buyerCep',
                  type: 'text',
                  label: 'CEP',
                  required: true,
                  maxLength: 10,
                  admin: {
                    placeholder: '00000-000',
                    width: '33%',
                  },
                },
              ],
            },
            {
              name: 'buyerOab',
              type: 'text',
              label: 'Número da OAB',
              maxLength: 20,
              admin: {
                placeholder: 'OAB/SC 00000 (opcional)',
                description: 'Número da OAB do comprador (opcional)',
              },
            },
          ],
        },
        // ===== TAB: DADOS DO PEDIDO =====
        {
          label: 'Dados do Pedido',
          fields: [
            {
              name: 'event',
              type: 'relationship',
              label: 'Evento',
              relationTo: 'events',
              required: true,
              admin: {
                description: 'Evento relacionado a esta inscrição',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ticketsAmount',
                  type: 'number',
                  label: 'Valor dos Ingressos (R$)',
                  required: true,
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Soma dos valores dos ingressos',
                    width: '33%',
                  },
                },
                {
                  name: 'discountAmount',
                  type: 'number',
                  label: 'Desconto Aplicado (R$)',
                  defaultValue: 0,
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Valor do desconto em grupo',
                    width: '33%',
                  },
                },
                {
                  name: 'totalAmount',
                  type: 'number',
                  label: 'Valor Total (R$)',
                  required: true,
                  min: 0,
                  admin: {
                    readOnly: true,
                    description: 'Valor final a ser pago',
                    width: '33%',
                  },
                },
              ],
            },
            {
              name: 'ticketCount',
              type: 'number',
              label: 'Quantidade de Ingressos',
              required: true,
              min: 1,
              admin: {
                readOnly: true,
                description: 'Número total de ingressos nesta inscrição',
              },
            },
            {
              name: 'discountGroupApplied',
              type: 'text',
              label: 'Grupo de Desconto Aplicado',
              admin: {
                readOnly: true,
                description: 'Descrição do desconto em grupo aplicado (se houver)',
              },
            },
          ],
        },
        // ===== TAB: PAGAMENTO =====
        {
          label: 'Pagamento',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentMethod',
                  type: 'select',
                  label: 'Método de Pagamento',
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
                {
                  name: 'paymentStatus',
                  type: 'select',
                  label: 'Status do Pagamento',
                  defaultValue: 'pending',
                  options: [
                    { label: 'Pendente', value: 'pending' },
                    { label: 'Processando', value: 'processing' },
                    { label: 'Pago', value: 'paid' },
                    { label: 'Falhou', value: 'failed' },
                    { label: 'Cancelado', value: 'cancelled' },
                    { label: 'Reembolsado', value: 'refunded' },
                  ],
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              name: 'paymentId',
              type: 'text',
              label: 'ID do Pagamento (PagBank)',
              admin: {
                readOnly: true,
                description: 'Identificador do pagamento no PagBank',
              },
            },
            {
              name: 'checkoutId',
              type: 'text',
              label: 'ID do Checkout (PagBank)',
              admin: {
                readOnly: true,
                description: 'Identificador do checkout no PagBank',
              },
            },
            {
              name: 'checkoutUrl',
              type: 'text',
              label: 'URL do Checkout',
              admin: {
                readOnly: true,
                description: 'URL para finalizar o pagamento',
              },
            },
            {
              name: 'paidAt',
              type: 'date',
              label: 'Data do Pagamento',
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
        // ===== TAB: REEMBOLSO =====
        {
          label: 'Reembolso',
          fields: [
            {
              name: 'refundRequested',
              type: 'checkbox',
              label: 'Reembolso Solicitado',
              defaultValue: false,
            },
            {
              name: 'refundRequestedAt',
              type: 'date',
              label: 'Data da Solicitação',
              admin: {
                condition: (data) => data.refundRequested === true,
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
            {
              name: 'refundReason',
              type: 'textarea',
              label: 'Motivo do Reembolso',
              admin: {
                condition: (data) => data.refundRequested === true,
              },
            },
            {
              name: 'refundStatus',
              type: 'select',
              label: 'Status do Reembolso',
              options: [
                { label: 'Solicitado', value: 'requested' },
                { label: 'Aprovado', value: 'approved' },
                { label: 'Processando', value: 'processing' },
                { label: 'Concluído', value: 'completed' },
                { label: 'Negado', value: 'denied' },
              ],
              admin: {
                condition: (data) => data.refundRequested === true,
              },
            },
            {
              name: 'refundDeniedReason',
              type: 'textarea',
              label: 'Motivo da Negativa',
              admin: {
                condition: (data) => data.refundStatus === 'denied',
              },
            },
            {
              name: 'refundedAt',
              type: 'date',
              label: 'Data do Reembolso',
              admin: {
                condition: (data) => data.refundStatus === 'completed',
                date: {
                  pickerAppearance: 'dayAndTime',
                  displayFormat: 'dd/MM/yyyy HH:mm',
                },
              },
            },
            {
              name: 'refundId',
              type: 'text',
              label: 'ID do Reembolso (PagBank)',
              admin: {
                condition: (data) => data.refundRequested === true,
                readOnly: true,
                description: 'Identificador do reembolso no PagBank',
              },
            },
          ],
        },
      ],
    },
    // ===== SIDEBAR FIELDS =====
    {
      name: 'referenceId',
      type: 'text',
      label: 'Código da Inscrição',
      unique: true,
      index: true,
      required: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Código único de identificação da inscrição',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status da Inscrição',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pendente', value: 'pending' },
        { label: 'Confirmada', value: 'confirmed' },
        { label: 'Cancelada', value: 'cancelled' },
        { label: 'Reembolsada', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'buyerIsParticipant',
      type: 'checkbox',
      label: 'Comprador é Participante',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'O comprador também é um dos participantes',
      },
    },
    {
      name: 'notes',
      type: 'textarea',
      label: 'Observações',
      admin: {
        position: 'sidebar',
        description: 'Notas internas sobre esta inscrição',
      },
    },
    createdByField,
    editedByField,
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Generate referenceId for new registrations
        if (operation === 'create' && !data?.referenceId) {
          const timestamp = Date.now().toString(36).toUpperCase()
          const random = Math.random().toString(36).substring(2, 6).toUpperCase()
          return {
            ...data,
            referenceId: `INS-${timestamp}-${random}`,
          }
        }
        return data
      },
    ],
    beforeChange: [validateRefundHook],
    afterChange: [updateTicketsOnPaymentHook],
  },
}
