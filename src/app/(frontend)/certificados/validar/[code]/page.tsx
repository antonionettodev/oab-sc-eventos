import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { CheckCircle, Award, Calendar, User, Building, Clock, Download } from 'lucide-react'

interface Certificate {
  id: string
  validationCode: string
  participantName: string
  event: {
    id: string
    title: string
    startDate: string
    endDate: string
    location: string
    certificateConfig?: {
      workload?: string
    }
  }
  registration: {
    id: string
    buyerEmail: string
  }
  issuedAt: string
  certificateFile?: {
    url: string
  }
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function CertificateValidationPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'certificates',
    where: {
      validationCode: { equals: code.toUpperCase() },
    },
    depth: 2,
    limit: 1,
  })

  if (docs.length === 0) {
    notFound()
  }

  const certificate = docs[0] as unknown as Certificate

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Certificado Válido</h1>
          </div>
          <p className="text-green-100">
            Este certificado foi emitido pela OAB Santa Catarina e é autêntico.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Certificado de Participação</h2>
            <p className="text-blue-100">{certificate.event.title}</p>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center border-b border-gray-100 pb-6">
              <p className="text-gray-600 mb-2">Certificamos que</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {certificate.participantName}
              </h3>
              <p className="text-gray-600 mt-2">
                participou do evento abaixo relacionado, promovido pela OAB Santa Catarina.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Data do Evento</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(certificate.event.startDate)}
                    {certificate.event.startDate !== certificate.event.endDate && (
                      <> a {formatDate(certificate.event.endDate)}</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <Building className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Local</p>
                  <p className="font-medium text-gray-900">{certificate.event.location}</p>
                </div>
              </div>

              {certificate.event.certificateConfig?.workload && (
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Carga Horária</p>
                    <p className="font-medium text-gray-900">
                      {certificate.event.certificateConfig.workload}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                <User className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Emitido em</p>
                  <p className="font-medium text-gray-900">
                    {formatDateTime(certificate.issuedAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <p className="font-semibold text-green-800">Código de Validação</p>
                </div>
                <p className="font-mono text-lg text-green-700">{certificate.validationCode}</p>
                <p className="text-sm text-green-600 mt-2">
                  Este código pode ser usado para verificar a autenticidade deste certificado.
                </p>
              </div>
            </div>

            {certificate.certificateFile?.url && (
              <div className="text-center pt-4">
                <a
                  href={certificate.certificateFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Baixar Certificado em PDF
                </a>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Para verificar outros certificados, acesse:{' '}
            <span className="font-medium">oab-sc.org.br/certificados/validar</span>
          </p>
        </div>
      </div>
    </div>
  )
}
