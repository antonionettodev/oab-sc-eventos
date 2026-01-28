import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { valid: false, message: 'Código de validação é obrigatório.' },
        { status: 400 }
      )
    }

    const payload = await getPayload({ config })

    const { docs } = await payload.find({
      collection: 'certificates',
      where: {
        validationCode: { equals: code.toUpperCase() },
      },
      limit: 1,
    })

    if (docs.length === 0) {
      return NextResponse.json({ valid: false, message: 'Certificado não encontrado.' })
    }

    return NextResponse.json({
      valid: true,
      message: 'Certificado válido.',
      code: code.toUpperCase(),
    })
  } catch (error) {
    console.error('Certificate validation error:', error)
    return NextResponse.json(
      { valid: false, message: 'Erro ao validar certificado.' },
      { status: 500 }
    )
  }
}
