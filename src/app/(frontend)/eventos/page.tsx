import { getPayload } from 'payload'
import config from '@payload-config'
import Link from 'next/link'
import { Calendar, MapPin, Users, Tag } from 'lucide-react'

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
  startDate: string
  endDate: string
  location: string
  maxRegistrations: number
  currentRegistrations: number
  categories: Array<{
    title: string
    price: number
  }>
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

function formatPrice(price: number): string {
  if (price === 0) return 'Gratuito'
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
}

function getLowestPrice(categories: Array<{ price: number }>): number {
  if (!categories || categories.length === 0) return 0
  return Math.min(...categories.map(c => c.price))
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

function EventCard({ event }: { event: Event }) {
  const lowestPrice = getLowestPrice(event.categories)
  const availableSpots = event.maxRegistrations - (event.currentRegistrations || 0)
  const isSoldOut = availableSpots <= 0

  return (
    <Link
      href={`/eventos/${event.slug}`}
      className="group block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="aspect-video relative bg-gray-100">
        {event.featuredImage?.url ? (
          <img
            src={event.featuredImage.url}
            alt={event.featuredImage.alt || event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-white text-4xl font-bold opacity-50">
              {event.title.charAt(0)}
            </span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {getEventTypeLabel(event.eventType)}
          </span>
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700">
            {getModalityLabel(event.modality)}
          </span>
        </div>
        {isSoldOut && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-medium">
              Esgotado
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">
          {event.title}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>{formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-gray-400" />
            <span>
              {isSoldOut
                ? 'Vagas esgotadas'
                : `${availableSpots} vagas disponíveis`}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Tag className="w-4 h-4" />
            <span>A partir de</span>
          </div>
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(lowestPrice)}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default async function EventsPage() {
  const payload = await getPayload({ config })

  const { docs: events } = await payload.find({
    collection: 'events',
    where: {
      status: { equals: 'published' },
    },
    sort: '-startDate',
    limit: 50,
    depth: 1,
  })

  const upcomingEvents = (events as unknown as Event[]).filter(
    event => new Date(event.startDate) >= new Date()
  )

  const pastEvents = (events as unknown as Event[]).filter(
    event => new Date(event.startDate) < new Date()
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold mb-4">Eventos</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Participe dos eventos, cursos e palestras promovidos pela OAB Santa Catarina.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {upcomingEvents.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Próximos Eventos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Eventos Anteriores
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
              {pastEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Nenhum evento disponível
            </h3>
            <p className="text-gray-600">
              No momento não há eventos publicados. Volte em breve!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
