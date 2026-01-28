'use client'

import { useState } from 'react'
import { QrCode, Search, CheckCircle, XCircle, Loader2, User, Calendar, MapPin } from 'lucide-react'

interface CheckInResult {
  success: boolean
  message: string
  data?: {
    participantName: string
    eventTitle: string
    activityTitle?: string
    checkInTime: string
  }
}

export default function CheckInPage() {
  const [ticketCode, setTicketCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [mode, setMode] = useState<'manual' | 'scanner'>('manual')

  const handleCheckIn = async (code: string) => {
    if (!code.trim()) return

    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketCode: code.trim().toUpperCase() }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setTicketCode('')
      }
    } catch {
      setResult({
        success: false,
        message: 'Erro ao processar check-in. Tente novamente.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleCheckIn(ticketCode)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold mb-2">Check-in do Evento</h1>
          <p className="text-blue-100">
            Confirme sua presença no evento informando o código do ingresso.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'manual'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-5 h-5" />
              Digitar Código
            </button>
            <button
              onClick={() => setMode('scanner')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'scanner'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <QrCode className="w-5 h-5" />
              Escanear QR Code
            </button>
          </div>

          {mode === 'manual' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="ticketCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Ingresso
                </label>
                <input
                  type="text"
                  id="ticketCode"
                  value={ticketCode}
                  onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                  placeholder="Ex: TKT-ABC123"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase"
                  disabled={isLoading}
                />
                <p className="mt-2 text-sm text-gray-500">
                  O código está no seu e-mail de confirmação ou no QR Code do ingresso.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading || !ticketCode.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Realizar Check-in
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-12">
              <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                <QrCode className="w-24 h-24 text-gray-400" />
              </div>
              <p className="text-gray-600">
                Posicione o QR Code do ingresso na câmera para realizar o check-in automático.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Funcionalidade de scanner disponível em breve.
              </p>
            </div>
          )}
        </div>

        {result && (
          <div
            className={`rounded-xl p-6 ${
              result.success
                ? 'bg-green-50 border border-green-200'
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <div className="flex items-start gap-4">
              {result.success ? (
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {result.success ? 'Check-in Realizado!' : 'Erro no Check-in'}
                </h3>
                <p className={result.success ? 'text-green-700' : 'text-red-700'}>
                  {result.message}
                </p>

                {result.success && result.data && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-green-700">
                      <User className="w-4 h-4" />
                      <span>{result.data.participantName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700">
                      <Calendar className="w-4 h-4" />
                      <span>{result.data.eventTitle}</span>
                    </div>
                    {result.data.activityTitle && (
                      <div className="flex items-center gap-2 text-green-700">
                        <MapPin className="w-4 h-4" />
                        <span>{result.data.activityTitle}</span>
                      </div>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                      Horário: {result.data.checkInTime}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Importante</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• O check-in é obrigatório para emissão do certificado.</li>
            <li>• Cada ingresso só pode ter um check-in por atividade.</li>
            <li>• Em caso de problemas, procure a organização do evento.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
