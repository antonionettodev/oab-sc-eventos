'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Award, Search, Loader2 } from 'lucide-react'

export default function CertificateSearchPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      setError('Digite o código de validação.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/certificates/validate?code=${encodeURIComponent(code.trim().toUpperCase())}`)
      const data = await response.json()

      if (data.valid) {
        router.push(`/certificados/validar/${code.trim().toUpperCase()}`)
      } else {
        setError('Certificado não encontrado. Verifique o código digitado.')
      }
    } catch {
      setError('Erro ao verificar certificado. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Validar Certificado</h1>
            <p className="text-blue-100 max-w-xl mx-auto">
              Digite o código de validação presente no certificado para verificar sua autenticidade.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Validação
              </label>
              <input
                type="text"
                id="code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase())
                  setError('')
                }}
                placeholder="Ex: CERT-ABC123XYZ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-mono uppercase"
                disabled={isLoading}
              />
              <p className="mt-2 text-sm text-gray-500">
                O código está localizado no rodapé do certificado.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !code.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Verificar Certificado
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Como encontrar o código?</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>1. Abra o arquivo PDF do seu certificado.</li>
            <li>2. Localize o código de validação no rodapé ou no QR Code.</li>
            <li>3. Digite o código no campo acima para validar.</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <h4 className="font-medium text-gray-900 mb-2">Precisa de ajuda?</h4>
          <p className="text-sm text-gray-600">
            Se você participou de um evento e ainda não recebeu seu certificado, entre em contato com a organização do evento.
          </p>
        </div>
      </div>
    </div>
  )
}
