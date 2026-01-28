import { baseTemplate } from './base'

interface TicketEmailProps {
  participantName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  ticketCode: string
  categoryTitle: string
  qrCodeDataUrl: string
  scheduleItems?: Array<{
    title: string
    room: string
    date: string
    time: string
  }>
}

export const ticketEmailTemplate = ({
  participantName,
  eventTitle,
  eventDate,
  eventLocation,
  ticketCode,
  categoryTitle,
  qrCodeDataUrl,
  scheduleItems = [],
}: TicketEmailProps) => {
  const scheduleHtml = scheduleItems.length > 0
    ? `
      <div class="info-box" style="margin-top: 24px;">
        <h3 style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
          Sua Programação
        </h3>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          ${scheduleItems.map(item => `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                <strong style="color: #333;">${item.title}</strong><br>
                <span style="color: #666; font-size: 14px;">
                  ${item.room} | ${item.date} às ${item.time}
                </span>
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    `
    : ''

  const content = `
    <h1 class="title">
      Seu Ingresso Está Confirmado!
    </h1>

    <p class="text">
      Olá <strong>${participantName}</strong>,
    </p>

    <p class="text">
      Sua inscrição para o evento <strong>${eventTitle}</strong> foi confirmada com sucesso!
    </p>

    <div class="info-box">
      <h3 style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
        Detalhes do Evento
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
            <span style="color: #333;">${eventDate}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666;">Local:</strong>
            <br>
            <span style="color: #333;">${eventLocation}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
            <strong style="color: #666;">Categoria:</strong>
            <br>
            <span style="color: #333;">${categoryTitle}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #666;">Código do Ingresso:</strong>
            <br>
            <span style="color: #0066cc; font-family: monospace; font-size: 16px; font-weight: bold;">
              ${ticketCode}
            </span>
          </td>
        </tr>
      </table>
    </div>

    ${scheduleHtml}

    <div style="text-align: center; margin: 32px 0;">
      <p style="color: #666; margin-bottom: 16px;">
        Apresente o QR Code abaixo no momento do check-in:
      </p>
      <img
        src="${qrCodeDataUrl}"
        alt="QR Code do Ingresso"
        width="200"
        height="200"
        style="border: 1px solid #ddd; border-radius: 8px; padding: 8px; background: #fff;"
      >
    </div>

    <div style="background: #fff3cd; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        <strong>Importante:</strong> Guarde este e-mail e apresente o QR Code ou o código do ingresso
        no momento do check-in. Recomendamos chegar com pelo menos 15 minutos de antecedência.
      </p>
    </div>

    <p class="text">
      Caso tenha alguma dúvida, entre em contato conosco.
    </p>

    <p class="text">
      Aguardamos você!
    </p>
  `

  return baseTemplate({
    content,
    preheader: `Seu ingresso para ${eventTitle} está confirmado!`,
  })
}
