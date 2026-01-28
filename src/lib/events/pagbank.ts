const PAGBANK_API_URL = process.env.PAGBANK_SANDBOX === 'true'
  ? 'https://sandbox.api.pagseguro.com'
  : 'https://api.pagseguro.com'

const PAGBANK_TOKEN = process.env.PAGBANK_TOKEN

export interface PagBankCustomer {
  name: string
  email: string
  tax_id: string
  phone: {
    country: string
    area: string
    number: string
  }
}

export interface PagBankItem {
  reference_id: string
  name: string
  description?: string
  quantity: number
  unit_amount: number
  image_url?: string
}

export interface PagBankCheckoutRequest {
  reference_id: string
  customer?: PagBankCustomer
  customer_modifiable?: boolean
  items: PagBankItem[]
  additional_amount?: number
  discount_amount?: number
  shipping?: {
    type?: 'FIXED' | 'FREE' | 'CALCULATE'
    amount?: number
    address_modifiable?: boolean
  }
  payment_methods?: Array<{
    type: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BOLETO' | 'PIX'
  }>
  payment_methods_configs?: Array<{
    type: 'CREDIT_CARD' | 'DEBIT_CARD'
    config_options: Array<{
      option: 'INSTALLMENTS_LIMIT' | 'INTEREST_FREE_INSTALLMENTS'
      value: string
    }>
  }>
  soft_descriptor?: string
  redirect_url?: string
  return_url?: string
  notification_urls?: string[]
  payment_notification_urls?: string[]
  expiration_date?: string
}

export interface PagBankCheckoutResponse {
  id: string
  reference_id: string
  created_at: string
  expiration_date: string
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED'
  customer?: PagBankCustomer
  customer_modifiable: boolean
  items: PagBankItem[]
  additional_amount?: number
  discount_amount?: number
  links: Array<{
    rel: string
    href: string
    media: string
    type: string
  }>
}

export interface PagBankRefundRequest {
  amount: {
    value: number
    currency: string
  }
}

export async function createCheckout(
  request: PagBankCheckoutRequest
): Promise<PagBankCheckoutResponse> {
  if (!PAGBANK_TOKEN) {
    throw new Error('PAGBANK_TOKEN is not configured')
  }

  const response = await fetch(`${PAGBANK_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${PAGBANK_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('PagBank checkout error:', error)
    throw new Error(`Failed to create checkout: ${response.status}`)
  }

  return response.json()
}

export async function getCheckout(checkoutId: string): Promise<PagBankCheckoutResponse> {
  if (!PAGBANK_TOKEN) {
    throw new Error('PAGBANK_TOKEN is not configured')
  }

  const response = await fetch(`${PAGBANK_API_URL}/checkouts/${checkoutId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${PAGBANK_TOKEN}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('PagBank get checkout error:', error)
    throw new Error(`Failed to get checkout: ${response.status}`)
  }

  return response.json()
}

export async function createRefund(
  paymentId: string,
  amount: number,
  idempotencyKey?: string
): Promise<unknown> {
  if (!PAGBANK_TOKEN) {
    throw new Error('PAGBANK_TOKEN is not configured')
  }

  const headers: HeadersInit = {
    'Authorization': `Bearer ${PAGBANK_TOKEN}`,
    'Content-Type': 'application/json',
  }

  if (idempotencyKey) {
    headers['x-idempotency-key'] = idempotencyKey
  }

  const response = await fetch(`${PAGBANK_API_URL}/payments/${paymentId}/refunds`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      amount: {
        value: Math.round(amount * 100),
        currency: 'BRL',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('PagBank refund error:', error)
    throw new Error(`Failed to create refund: ${response.status}`)
  }

  return response.json()
}

export function formatPhoneForPagBank(phone: string): { country: string; area: string; number: string } {
  const digits = phone.replace(/\D/g, '')

  const area = digits.substring(0, 2)
  const number = digits.substring(2)

  return {
    country: '+55',
    area,
    number,
  }
}

export function convertToCents(amount: number): number {
  return Math.round(amount * 100)
}

export function getCheckoutPayLink(checkoutResponse: PagBankCheckoutResponse): string | null {
  const payLink = checkoutResponse.links.find(link => link.rel === 'PAY')
  return payLink?.href || null
}

export function calculateExpirationDate(hoursFromNow: number = 2): string {
  const date = new Date()
  date.setHours(date.getHours() + hoursFromNow)
  return date.toISOString()
}

export interface CreateEventCheckoutParams {
  orderCode: string
  buyerName: string
  buyerEmail: string
  buyerCpf: string
  buyerPhone: string
  items: Array<{
    ticketCode: string
    categoryTitle: string
    participantName: string
    price: number
  }>
  discountAmount?: number
  redirectUrl: string
  notificationUrl: string
}

export async function createEventCheckout(
  params: CreateEventCheckoutParams
): Promise<PagBankCheckoutResponse> {
  const {
    orderCode,
    buyerName,
    buyerEmail,
    buyerCpf,
    buyerPhone,
    items,
    discountAmount,
    redirectUrl,
    notificationUrl,
  } = params

  const checkoutItems: PagBankItem[] = items.map((item) => ({
    reference_id: item.ticketCode,
    name: item.categoryTitle,
    description: `Ingresso para ${item.participantName}`,
    quantity: 1,
    unit_amount: convertToCents(item.price),
  }))

  const request: PagBankCheckoutRequest = {
    reference_id: orderCode,
    customer_modifiable: false,
    customer: {
      name: buyerName,
      email: buyerEmail,
      tax_id: buyerCpf.replace(/\D/g, ''),
      phone: formatPhoneForPagBank(buyerPhone),
    },
    items: checkoutItems,
    discount_amount: discountAmount ? convertToCents(discountAmount) : undefined,
    payment_methods: [
      { type: 'CREDIT_CARD' },
      { type: 'DEBIT_CARD' },
      { type: 'PIX' },
      { type: 'BOLETO' },
    ],
    payment_methods_configs: [
      {
        type: 'CREDIT_CARD',
        config_options: [
          { option: 'INSTALLMENTS_LIMIT', value: '12' },
          { option: 'INTEREST_FREE_INSTALLMENTS', value: '3' },
        ],
      },
    ],
    soft_descriptor: 'OAB-SC Eventos',
    redirect_url: redirectUrl,
    return_url: redirectUrl,
    notification_urls: [notificationUrl],
    payment_notification_urls: [notificationUrl],
    expiration_date: calculateExpirationDate(48),
  }

  return createCheckout(request)
}
