import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { CheckCircle, Clock, XCircle, Calendar, MapPin, User, Mail, QrCode, Download } from 'lucide-react'
import Link from 'next/link'

interface Registration {
  id: string
  orderCode: string
  buyerName: string
  buyerEmail: string
  event: {
    id: string
    title: string
    startDate: string
    location: string
    featuredImage?: { url: string }
  }
  tickets: Array<{
    ticketCode: string
    participantName: string
    categoryTitle: string
    ticketStatus: string
  }>
  totalAmount: number
  discountAmount: number
  finalAmount: number
  paymentStatus: 'pending' | 'waiting' | 'paid' | 'failed' | 'refunded'
  paidAt?: string
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function getStatusInfo(status: string) {
  const statusMap: Record<string, { icon: typeof CheckCircle; label: string; color: string; bgColor: string }> = {
    pending: {
      icon: Clock,
      label: 'Aguardando Pagamento',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-50 border-yellow-200',
    },
    waiting: {
      icon: Clock,
      label: 'Processando Pagamento',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50 border-blue-200',
    },
    paid: {
      icon: CheckCircle,
      label: 'Pagamento Confirmado',
      color: 'text-green-700',
      bgColor: 'bg-green-50 border-green-200',
    },
    failed: {
      icon: XCircle,
      label: 'Pagamento Falhou',
      color: 'text-red-700',
      bgColor: 'bg-red-50 border-red-200',
    },
    refunded: {
      icon: XCircle,
      label: 'Reembolsado',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50 border-gray-200',
    },
  }
  return statusMap[status] || statusMap.pending
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order } = await searchParams

  if (!order) {
    redirect('/eventos')
  }

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'registrations',
    where: {
      orderCode: { equals: order },
    },
    depth: 2,
    limit: 1,
  })

  if (docs.length === 0) {
    redirect('/eventos')
  }

  const registration = docs[0] as unknown as Registration
  const statusInfo = getStatusInfo(registration.paymentStatus)
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`py-12 ${
        registration.paymentStatus === 'paid'
          ? 'bg-gradient-to-br from-green-600 to-emerald-700'
          : 'bg-gradient-to-br from-blue-600 to-purple-700'
      } text-white`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <StatusIcon className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">
            {registration.paymentStatus === 'paid'
              ? 'Inscrição Confirmada!'
              : 'Inscrição Registrada'}
          </h1>
          <p className="text-lg opacity-90">
            Pedido: <span className="font-mono font-semibold">{registration.orderCode}</span>
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className={`rounded-xl border p-4 mb-6 ${statusInfo.bgColor}`}>
          <div className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${statusInfo.color}`} />
            <div>
              <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</p>
              {registration.paymentStatus === 'paid' && registration.paidAt && (
                <p className={`text-sm ${statusInfo.color}`}>
                  Confirmado em {formatDate(registration.paidAt)}
                </p>
              )}
              {registration.paymentStatus === 'waiting' && (
                <p className={`text-sm ${statusInfo.color}`}>
                  Aguarde a confirmação do pagamento. Você receberá um e-mail quando confirmado.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalhes do Evento</h2>
            <div className="flex gap-4">
              {registration.event.featuredImage?.url && (
                <img
                  src={registration.event.featuredImage.url}
                  alt={registration.event.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{registration.event.title}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(registration.event.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{registration.event.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Comprador</h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{registration.buyerName}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{registration.buyerEmail}</span>
              </div>
            </div>
          </div>

          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ingressos ({registration.tickets.length})
            </h2>
            <div className="space-y-4">
              {registration.tickets.map((ticket, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    {registration.paymentStatus === 'paid' && ticket.ticketCode ? (
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <QrCode className="w-10 h-10 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{ticket.participantName}</p>
                      <p className="text-sm text-gray-600">{ticket.categoryTitle}</p>
                      {ticket.ticketCode && registration.paymentStatus === 'paid' && (
                        <p className="text-xs font-mono text-blue-600 mt-1">
                          {ticket.ticketCode}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ticket.ticketStatus === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : ticket.ticketStatus === 'checked-in'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.ticketStatus === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {ticket.ticketStatus === 'confirmed'
                        ? 'Confirmado'
                        : ticket.ticketStatus === 'checked-in'
                        ? 'Check-in realizado'
                        : ticket.ticketStatus === 'cancelled'
                        ? 'Cancelado'
                        : 'Pendente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumo do Pagamento</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(registration.totalAmount)}</span>
              </div>
              {registration.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Desconto</span>
                  <span>-{formatPrice(registration.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(registration.finalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {registration.paymentStatus === 'paid' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Próximos Passos</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Você receberá um e-mail com os ingressos e QR Codes para check-in.</span>
              </li>
              <li className="flex items-start gap-2">
                <QrCode className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>No dia do evento, apresente o QR Code do ingresso para realizar o check-in.</span>
              </li>
              <li className="flex items-start gap-2">
                <Download className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Após o evento, você poderá baixar seu certificado de participação.</span>
              </li>
            </ul>
          </div>
        )}

        <div className="flex gap-4">
          <Link
            href="/eventos"
            className="flex-1 text-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Ver Mais Eventos
          </Link>
          <Link
            href={`/eventos/${(registration.event as { slug?: string }).slug || registration.event.id}`}
            className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Detalhes do Evento
          </Link>
        </div>
      </div>
    </div>
  )
}
