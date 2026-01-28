import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'

export interface CertificateData {
  nome: string
  oab?: string
  evento: string
  data: string
  cargaHoraria?: string
  codigo: string
  dataEmissao: string
}

export async function generateCertificateFromTemplate(
  templateBuffer: Buffer,
  data: CertificateData
): Promise<Buffer> {
  try {
    const zip = new PizZip(templateBuffer)

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: {
        start: '{{',
        end: '}}',
      },
    })

    doc.render({
      nome: data.nome,
      oab: data.oab || 'N/A',
      evento: data.evento,
      data: data.data,
      cargaHoraria: data.cargaHoraria || '',
      codigo: data.codigo,
      dataEmissao: data.dataEmissao,
    })

    const outputBuffer = doc.getZip().generate({
      type: 'nodebuffer',
      compression: 'DEFLATE',
    })

    return outputBuffer
  } catch (error) {
    console.error('Error generating certificate from template:', error)
    throw new Error('Failed to generate certificate from template')
  }
}

export function formatDateForCertificate(startDate: Date, endDate?: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }

  const startFormatted = startDate.toLocaleDateString('pt-BR', options)

  if (endDate && startDate.toDateString() !== endDate.toDateString()) {
    const endFormatted = endDate.toLocaleDateString('pt-BR', options)

    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      const startDay = startDate.getDate()
      return `${startDay} a ${endFormatted}`
    }

    return `${startFormatted} a ${endFormatted}`
  }

  return startFormatted
}

export function formatIssueDateForCertificate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }

  return date.toLocaleDateString('pt-BR', options)
}

export function calculateWorkload(startDate: Date, endDate: Date): string {
  const diffMs = endDate.getTime() - startDate.getTime()
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))

  if (diffHours < 1) {
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    return `${diffMinutes} minutos`
  }

  if (diffHours === 1) {
    return '1 hora'
  }

  return `${diffHours} horas`
}
