import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Calendar, MapPin, Users, Clock, User, ExternalLink } from 'lucide-react'
import { EventRegistrationForm } from '@/components/events/registration-form'

interface ScheduleItem {
  id: string
  room: {
    id: string
    title: string
    capacity: number
  }
  title: string
  description?: string
  date: string
  startTime: string
  endTime: string
  speakers?: Array<{
    id: string
    name: string
    professionalTitle: string
    photo?: { url: string }
  }>
  maxCapacity?: number
}

interface Category {
  id?: string
  title: string
  price: number
  description?: string
  maxQuantity?: number
}

interface DiscountGroup {
  minQuantity: number
  maxQuantity: number
  discountType: 'percentage' | 'fixed'
  discountValue: number
}

interface Event {
  id: string
  title: string
  slug: string
  description: unknown
  featuredImage?: {
    url?: string
    alt?: string
  }
  eventType: 'event' | 'course'
  modality: 'in-person' | 'hybrid' | 'virtual'
  scope: 'internal' | 'external'
  registrationType: 'internal' | 'external'
  externalRegistrationUrl?: string
  location: string
  startDate: string
  endDate: string
  registrationStartDate?: string
  registrationEndDate?: string
  maxRegistrations: number
  currentRegistrations: number
  refundDays: number
  categories: Category[]
  discountGroups?: DiscountGroup[]
  schedule?: ScheduleItem[]
  hasCertificate: boolean
  certificateConfig?: {
    workload?: string
  }
  status: string
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
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

function getModalityLabel(modality: string): string {
  const labels: Record<string, string> = {
    'in-person': 'Presencial',
    'hybrid': 'Híbrido',
    'virtual': 'Virtual',
  }
  return labels[modality] || modality
}

function getEventTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'event': 'Evento',
    'course': 'Curso',
  }
  return labels[type] || type
}

function groupScheduleByDate(schedule: ScheduleItem[]): Record<string, ScheduleItem[]> {
  const grouped: Record<string, ScheduleItem[]> = {}

  schedule.forEach(item => {
    const date = new Date(item.date).toISOString().split('T')[0]
    if (!grouped[date]) {
      grouped[date] = []
    }
    grouped[date].push(item)
  })

  Object.keys(grouped).forEach(date => {
    grouped[date].sort((a, b) => {
      const timeA = a.startTime.split(':').map(Number)
      const timeB = b.startTime.split(':').map(Number)
      return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1])
    })
  })

  return grouped
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'events',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    depth: 2,
    limit: 1,
  })

  if (docs.length === 0) {
    notFound()
  }

  const event = docs[0] as unknown as Event

  const now = new Date()
  const eventStartDate = new Date(event.startDate)
  const registrationEndDate = event.registrationEndDate
    ? new Date(event.registrationEndDate)
    : eventStartDate
  const availableSpots = event.maxRegistrations - (event.currentRegistrations || 0)
  const isRegistrationOpen =
    event.registrationType === 'internal' &&
    availableSpots > 0 &&
    now < registrationEndDate &&
    (!event.registrationStartDate || now >= new Date(event.registrationStartDate))

  const groupedSchedule = event.schedule ? groupScheduleByDate(event.schedule) : {}

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="relative">
        {event.featuredImage?.url ? (
          <div className="h-80 md:h-96 relative">
            <img
              src={event.featuredImage.url}
              alt={event.featuredImage.alt || event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          </div>
        ) : (
          <div className="h-80 md:h-96 bg-gradient-to-br from-blue-600 to-purple-700" />
        )}

        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex gap-2 mb-4">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {getEventTypeLabel(event.eventType)}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium">
                {getModalityLabel(event.modality)}
              </span>
              {event.hasCertificate && (
                <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-sm font-medium">
                  Com Certificado
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.title}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Sobre o Evento</h2>
              <div className="prose prose-blue max-w-none">
                <p className="text-gray-600 whitespace-pre-wrap">
                  {typeof event.description === 'object' && event.description !== null
                    ? JSON.stringify(event.description)
                    : String(event.description || '')}
                </p>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Informações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Data e Horário</p>
                    <p className="text-sm text-gray-600">{formatDateTime(event.startDate)}</p>
                    {event.startDate !== event.endDate && (
                      <p className="text-sm text-gray-600">até {formatDateTime(event.endDate)}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Local</p>
                    <p className="text-sm text-gray-600">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">Vagas</p>
                    <p className="text-sm text-gray-600">
                      {availableSpots > 0
                        ? `${availableSpots} de ${event.maxRegistrations} disponíveis`
                        : 'Esgotado'}
                    </p>
                  </div>
                </div>

                {event.certificateConfig?.workload && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-900">Carga Horária</p>
                      <p className="text-sm text-gray-600">{event.certificateConfig.workload}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {Object.keys(groupedSchedule).length > 0 && (
              <section className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Programação</h2>
                <div className="space-y-6">
                  {Object.entries(groupedSchedule).map(([date, items]) => (
                    <div key={date}>
                      <h3 className="font-medium text-gray-900 mb-3 pb-2 border-b">
                        {formatDate(date)}
                      </h3>
                      <div className="space-y-4">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                          >
                            <div className="text-sm text-blue-600 font-medium whitespace-nowrap">
                              {item.startTime} - {item.endTime}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{item.title}</h4>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 mt-2">
                                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                  <MapPin className="w-3 h-3" />
                                  {item.room.title}
                                </span>
                                {item.speakers && item.speakers.length > 0 && (
                                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                    <User className="w-3 h-3" />
                                    {item.speakers.map(s => s.name).join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Inscrição</h2>

                {event.registrationType === 'external' ? (
                  <div className="space-y-4">
                    <p className="text-gray-600 text-sm">
                      As inscrições para este evento são realizadas em plataforma externa.
                    </p>
                    {event.externalRegistrationUrl && (
                      <a
                        href={event.externalRegistrationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Inscrever-se
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ) : isRegistrationOpen ? (
                  <EventRegistrationForm
                    event={{
                      id: event.id,
                      title: event.title,
                      categories: event.categories.map((cat, index) => ({
                        id: cat.id || `cat-${index}`,
                        title: cat.title,
                        price: cat.price,
                        description: cat.description,
                      })),
                      discountGroups: event.discountGroups,
                      schedule: event.schedule?.map(item => ({
                        id: item.id,
                        title: item.title,
                        date: item.date,
                        startTime: item.startTime,
                        endTime: item.endTime,
                        roomId: item.room.id,
                        roomTitle: item.room.title,
                      })),
                    }}
                  />
                ) : (
                  <div className="space-y-4">
                    {availableSpots <= 0 ? (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">Vagas Esgotadas</p>
                        <p className="text-red-600 text-sm mt-1">
                          Infelizmente todas as vagas para este evento foram preenchidas.
                        </p>
                      </div>
                    ) : now >= registrationEndDate ? (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-yellow-800 font-medium">Inscrições Encerradas</p>
                        <p className="text-yellow-600 text-sm mt-1">
                          O período de inscrições para este evento já encerrou.
                        </p>
                      </div>
                    ) : event.registrationStartDate && now < new Date(event.registrationStartDate) ? (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-blue-800 font-medium">Inscrições em Breve</p>
                        <p className="text-blue-600 text-sm mt-1">
                          As inscrições abrem em {formatDateTime(event.registrationStartDate)}.
                        </p>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="font-medium text-gray-900 mb-3">Categorias de Inscrição</h3>
                  <div className="space-y-2">
                    {event.categories.map((category, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-700">{category.title}</span>
                        <span className="font-semibold text-blue-600">
                          {formatPrice(category.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {event.discountGroups && event.discountGroups.length > 0 && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Descontos em Grupo</h4>
                    <ul className="space-y-1 text-sm text-green-700">
                      {event.discountGroups.map((group, index) => (
                        <li key={index}>
                          {group.minQuantity}-{group.maxQuantity} ingressos:{' '}
                          {group.discountType === 'percentage'
                            ? `${group.discountValue}% de desconto`
                            : `R$ ${group.discountValue} de desconto`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
