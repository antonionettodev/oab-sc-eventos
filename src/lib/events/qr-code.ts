import QRCode from 'qrcode'

interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
}

export async function generateQRCodeDataURL(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  try {
    const dataUrl = await QRCode.toDataURL(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    })
    return dataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    throw new Error('Failed to generate QR code')
  }
}

export async function generateQRCodeBuffer(
  data: string,
  options: QRCodeOptions = {}
): Promise<Buffer> {
  const defaultOptions: QRCodeOptions = {
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  }

  const mergedOptions = { ...defaultOptions, ...options }

  try {
    const buffer = await QRCode.toBuffer(data, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
    })
    return buffer
  } catch (error) {
    console.error('Error generating QR code buffer:', error)
    throw new Error('Failed to generate QR code buffer')
  }
}

export function generateTicketQRData(ticketCode: string, eventId: string): string {
  return JSON.stringify({
    type: 'ticket',
    code: ticketCode,
    event: eventId,
    timestamp: Date.now(),
  })
}

export function generateEventCheckInQRData(eventCode: string, eventId: string): string {
  return JSON.stringify({
    type: 'event_checkin',
    code: eventCode,
    event: eventId,
  })
}

export function generateCertificateValidationQRData(
  certificateCode: string,
  baseUrl: string
): string {
  return `${baseUrl}/certificados/validar/${certificateCode}`
}

export function generateVCardQRData(
  name: string,
  email: string,
  phone?: string,
  organization?: string
): string {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `EMAIL:${email}`,
  ]

  if (phone) {
    vcard.push(`TEL:${phone}`)
  }

  if (organization) {
    vcard.push(`ORG:${organization}`)
  }

  vcard.push('END:VCARD')

  return vcard.join('\n')
}
