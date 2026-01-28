import { baseTemplate } from './base'

interface CheckInEmailProps {
  participantName: string
  eventTitle: string
  checkInDate: string
  checkInTime: string
  roomTitle?: string
  activityTitle?: string
  vcardQrCodeDataUrl?: string
}

export const checkInEmailTemplate = ({
  participantName,
  eventTitle,
  checkInDate,
  checkInTime,
  roomTitle,
  activityTitle,
  vcardQrCodeDataUrl,
}: CheckInEmailProps) => {
  const roomHtml = roomTitle
    ? `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <strong style="color: #666;">Sala:</strong>
          <br>
          <span style="color: #333;">${roomTitle}</span>
        </td>
      </tr>
    `
    : ''

  const activityHtml = activityTitle
    ? `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <strong style="color: #666;">Atividade:</strong>
          <br>
          <span style="color: #333;">${activityTitle}</span>
        </td>
      </tr>
    `
    : ''

  const vcardHtml = vcardQrCodeDataUrl
    ? `
      <div style="background: #f8f9fa; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
        <h3 style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
          Seu Cartão de Networking
        </h3>
        <p style="color: #666; margin: 0 0 16px 0; font-size: 14px;">
          Compartilhe seu contato com outros participantes escaneando o QR Code abaixo:
        </p>
        <img
          src="${vcardQrCodeDataUrl}"
          alt="QR Code vCard"
          width="150"
          height="150"
          style="border: 1px solid #ddd; border-radius: 8px; padding: 8px; background: #fff;"
        >
        <p style="color: #888; margin: 16px 0 0 0; font-size: 12px;">
          Este QR Code contém suas informações de contato no formato vCard.
        </p>
      </div>
    `
    : ''

  const content = `
    <h1 class="title">
      Check-in Confirmado!
    </h1>

    <p class="text">
      Olá <strong>${participantName}</strong>,
    </p>

    <p class="text">
      Seu check-in no evento <strong>${eventTitle}</strong> foi registrado com sucesso!
    </p>

    <div class="info-box">
      <h3 style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
        Detalhes do Check-in
      </h3>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666;">Evento:</strong>
            <br>
            <span style="color: #333;">${eventTitle}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666;">Data:</strong>
            <br>
            <span style="color: #333;">${checkInDate}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666;">Horário:</strong>
            <br>
            <span style="color: #333;">${checkInTime}</span>
          </td>
        </tr>
        ${roomHtml}
        ${activityHtml}
      </table>
    </div>

    ${vcardHtml}

    <div style="background: #d4edda; border: 1px solid #28a745; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #155724; margin: 0; font-size: 14px;">
        <strong>Presença registrada!</strong> Sua participação foi contabilizada para fins de
        certificação (quando aplicável).
      </p>
    </div>

    <p class="text">
      Aproveite o evento!
    </p>
  `

  return baseTemplate({
    content,
    preheader: `Check-in confirmado para ${eventTitle}`,
  })
}
