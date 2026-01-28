'use client'

import { useState } from 'react'
import { Plus, Minus, Trash2, Loader2 } from 'lucide-react'
import { createRegistration } from '@/app/(frontend)/eventos/actions'

interface Category {
  id: string
  title: string
  price: number
  description?: string
}

interface ScheduleItem {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  roomId: string
  roomTitle: string
}

interface DiscountGroup {
  minQuantity: number
  maxQuantity: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

interface EventData {
  id: string
  title: string
  categories: Category[]
  discountGroups?: DiscountGroup[]
  schedule?: ScheduleItem[]
}

interface Ticket {
  participantName: string
  participantEmail: string
  participantPhone: string
  participantOab: string
  categoryId: string
  selectedSchedule: string[]
  isBuyer: boolean
}

interface Props {
  event: EventData
}

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function calculateDiscount(
  totalAmount: number,
  ticketCount: number,
  discountGroups?: DiscountGroup[]
): { discountAmount: number; appliedGroup: DiscountGroup | null } {
  if (!discountGroups || discountGroups.length === 0) {
    return { discountAmount: 0, appliedGroup: null }
  }

  const applicableGroup = discountGroups.find(
    group => ticketCount >= group.minQuantity && ticketCount <= group.maxQuantity
  )

  if (!applicableGroup) {
    return { discountAmount: 0, appliedGroup: null }
  }

  let discountAmount: number

  if (applicableGroup.discountType === 'percentage') {
    discountAmount = (totalAmount * applicableGroup.discountValue) / 100
  } else {
    discountAmount = applicableGroup.discountValue
  }

  discountAmount = Math.min(discountAmount, totalAmount)

  return { discountAmount, appliedGroup: applicableGroup }
}

export function EventRegistrationForm({ event }: Props) {
  const [step, setStep] = useState<'buyer' | 'tickets' | 'summary'>('buyer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [buyerData, setBuyerData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SC',
  })

  const [tickets, setTickets] = useState<Ticket[]>([
    {
      participantName: '',
      participantEmail: '',
      participantPhone: '',
      participantOab: '',
      categoryId: event.categories[0]?.id || '',
      selectedSchedule: [],
      isBuyer: true,
    },
  ])

  const addTicket = () => {
    setTickets([
      ...tickets,
      {
        participantName: '',
        participantEmail: '',
        participantPhone: '',
        participantOab: '',
        categoryId: event.categories[0]?.id || '',
        selectedSchedule: [],
        isBuyer: false,
      },
    ])
  }

  const removeTicket = (index: number) => {
    if (tickets.length > 1) {
      const newTickets = tickets.filter((_, i) => i !== index)
      if (tickets[index].isBuyer && newTickets.length > 0) {
        newTickets[0].isBuyer = true
      }
      setTickets(newTickets)
    }
  }

  const updateTicket = (index: number, field: keyof Ticket, value: unknown) => {
    const newTickets = [...tickets]
    newTickets[index] = { ...newTickets[index], [field]: value }

    if (field === 'isBuyer' && value === true) {
      newTickets.forEach((ticket, i) => {
        if (i !== index) {
          ticket.isBuyer = false
        }
      })
    }

    setTickets(newTickets)
  }

  const totalAmount = tickets.reduce((sum, ticket) => {
    const category = event.categories.find(c => c.id === ticket.categoryId)
    return sum + (category?.price || 0)
  }, 0)

  const { discountAmount, appliedGroup } = calculateDiscount(
    totalAmount,
    tickets.length,
    event.discountGroups
  )

  const finalAmount = totalAmount - discountAmount

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createRegistration({
        eventId: event.id,
        buyer: buyerData,
        tickets: tickets.map(ticket => ({
          ...ticket,
          categoryTitle: event.categories.find(c => c.id === ticket.categoryId)?.title || '',
          categoryPrice: event.categories.find(c => c.id === ticket.categoryId)?.price || 0,
          selectedScheduleItems: event.schedule?.filter(s =>
            ticket.selectedSchedule.includes(s.id)
          ).map(s => ({
            scheduleItemId: s.id,
            roomId: s.roomId,
            roomTitle: s.roomTitle,
            activityTitle: s.title,
            date: s.date,
            startTime: s.startTime,
            endTime: s.endTime,
          })) || [],
        })),
        totalAmount,
        discountAmount,
        finalAmount,
      })

      if (result.success && result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        setError(result.error || 'Erro ao processar inscrição')
      }
    } catch {
      setError('Erro ao processar inscrição. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValidBuyer =
    buyerData.name.length >= 3 &&
    buyerData.email.includes('@') &&
    buyerData.phone.length >= 10 &&
    buyerData.cpf.length >= 11 &&
    buyerData.cep.length >= 8 &&
    buyerData.street.length >= 3 &&
    buyerData.number.length >= 1 &&
    buyerData.neighborhood.length >= 2 &&
    buyerData.city.length >= 2

  const isValidTickets = tickets.every(
    ticket =>
      ticket.participantName.length >= 3 &&
      ticket.participantEmail.includes('@') &&
      ticket.participantPhone.length >= 10 &&
      ticket.categoryId
  )

  return (
    <div className="space-y-6">
      {step === 'buyer' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Dados do Comprador</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Completo *
            </label>
            <input
              type="text"
              value={buyerData.name}
              onChange={e => setBuyerData({ ...buyerData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-mail *
            </label>
            <input
              type="email"
              value={buyerData.email}
              onChange={e => setBuyerData({ ...buyerData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefone *
              </label>
              <input
                type="tel"
                value={buyerData.phone}
                onChange={e => setBuyerData({ ...buyerData, phone: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(00) 00000-0000"
                maxLength={11}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CPF *
              </label>
              <input
                type="text"
                value={buyerData.cpf}
                onChange={e => setBuyerData({ ...buyerData, cpf: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="000.000.000-00"
                maxLength={11}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CEP *
              </label>
              <input
                type="text"
                value={buyerData.cep}
                onChange={e => setBuyerData({ ...buyerData, cep: e.target.value.replace(/\D/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="00000-000"
                maxLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número *
              </label>
              <input
                type="text"
                value={buyerData.number}
                onChange={e => setBuyerData({ ...buyerData, number: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logradouro *
            </label>
            <input
              type="text"
              value={buyerData.street}
              onChange={e => setBuyerData({ ...buyerData, street: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Rua, Avenida, etc."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complemento
              </label>
              <input
                type="text"
                value={buyerData.complement}
                onChange={e => setBuyerData({ ...buyerData, complement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Apto, Sala, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bairro *
              </label>
              <input
                type="text"
                value={buyerData.neighborhood}
                onChange={e => setBuyerData({ ...buyerData, neighborhood: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Bairro"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cidade *
              </label>
              <input
                type="text"
                value={buyerData.city}
                onChange={e => setBuyerData({ ...buyerData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Cidade"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado *
              </label>
              <select
                value={buyerData.state}
                onChange={e => setBuyerData({ ...buyerData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'].map(
                  uf => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          <button
            onClick={() => setStep('tickets')}
            disabled={!isValidBuyer}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Continuar
          </button>
        </div>
      )}

      {step === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Ingressos ({tickets.length})</h3>
            <button
              onClick={addTicket}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Adicionar Ingresso
            </button>
          </div>

          {tickets.map((ticket, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">Ingresso {index + 1}</span>
                {tickets.length > 1 && (
                  <button
                    onClick={() => removeTicket(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Participante *
                </label>
                <input
                  type="text"
                  value={ticket.participantName}
                  onChange={e => updateTicket(index, 'participantName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={ticket.participantEmail}
                  onChange={e => updateTicket(index, 'participantEmail', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={ticket.participantPhone}
                    onChange={e => updateTicket(index, 'participantPhone', e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="(00) 00000-0000"
                    maxLength={11}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OAB (opcional)
                  </label>
                  <input
                    type="text"
                    value={ticket.participantOab}
                    onChange={e => updateTicket(index, 'participantOab', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    placeholder="12345/SC"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria *
                </label>
                <select
                  value={ticket.categoryId}
                  onChange={e => updateTicket(index, 'categoryId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  {event.categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.title} - {formatPrice(category.price)}
                    </option>
                  ))}
                </select>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ticket.isBuyer}
                  onChange={e => updateTicket(index, 'isBuyer', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Este ingresso é meu</span>
              </label>
            </div>
          ))}

          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal ({tickets.length} ingressos)</span>
              <span className="text-gray-900">{formatPrice(totalAmount)}</span>
            </div>
            {discountAmount > 0 && appliedGroup && (
              <div className="flex justify-between text-sm text-green-600">
                <span>
                  Desconto (
                  {appliedGroup.discountType === 'percentage'
                    ? `${appliedGroup.discountValue}%`
                    : formatPrice(appliedGroup.discountValue)}
                  )
                </span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-blue-600">{formatPrice(finalAmount)}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('buyer')}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={() => setStep('summary')}
              disabled={!isValidTickets}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {step === 'summary' && (
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Resumo da Compra</h3>

          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div>
              <p className="text-sm text-gray-600">Comprador</p>
              <p className="font-medium text-gray-900">{buyerData.name}</p>
              <p className="text-sm text-gray-600">{buyerData.email}</p>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Ingressos</p>
              {tickets.map((ticket, index) => {
                const category = event.categories.find(c => c.id === ticket.categoryId)
                return (
                  <div key={index} className="flex justify-between text-sm py-1">
                    <span>
                      {ticket.participantName} ({category?.title})
                    </span>
                    <span>{formatPrice(category?.price || 0)}</span>
                  </div>
                )
              })}
            </div>

            <div className="pt-3 border-t border-gray-200 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Desconto</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-blue-600">{formatPrice(finalAmount)}</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep('tickets')}
              disabled={isSubmitting}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 transition-colors inline-flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processando...
                </>
              ) : (
                'Ir para Pagamento'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
