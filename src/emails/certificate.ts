import { baseTemplate } from './base'
import { getServerSideURL } from '@/lib/get-urls'

interface CertificateEmailProps {
  participantName: string
  eventTitle: string
  eventDate: string
  certificateCode: string
  downloadUrl: string
  workload?: string
}

export const certificateEmailTemplate = ({
  participantName,
  eventTitle,
  eventDate,
  certificateCode,
  downloadUrl,
  workload,
}: CertificateEmailProps) => {
  const siteUrl = getServerSideURL()
  const validationUrl = `${siteUrl}/certificados/validar/${certificateCode}`

  const workloadHtml = workload
    ? `
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
          <strong style="color: #666;">Carga Horária:</strong>
          <br>
          <span style="color: #333;">${workload}</span>
        </td>
      </tr>
    `
    : ''

  const content = `
    <h1 class="title">
      Seu Certificado Está Disponível!
    </h1>

    <p class="text">
      Olá <strong>${participantName}</strong>,
    </p>

    <p class="text">
      Parabéns por concluir sua participação no evento <strong>${eventTitle}</strong>!
      Seu certificado já está disponível para download.
    </p>

    <div class="info-box">
      <h3 style="color: #333; margin: 0 0 16px 0; font-size: 16px;">
        Dados do Certificado
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
        ${workloadHtml}
        <tr>
          <td style="padding: 8px 0;">
            <strong style="color: #666;">Código do Certificado:</strong>
            <br>
            <span style="color: #0066cc; font-family: monospace; font-size: 16px; font-weight: bold;">
              ${certificateCode}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin: 32px 0;">
      <a href="${downloadUrl}" class="btn-primary" style="display: inline-block;">
        Baixar Certificado
      </a>
    </div>

    <div style="background: #e8f4fd; border: 1px solid #0066cc; border-radius: 8px; padding: 16px; margin: 24px 0;">
      <p style="color: #004085; margin: 0 0 8px 0; font-size: 14px;">
        <strong>Validação do Certificado</strong>
      </p>
      <p style="color: #004085; margin: 0; font-size: 14px;">
        A autenticidade deste certificado pode ser verificada em:
        <br>
        <a href="${validationUrl}" style="color: #0066cc; word-break: break-all;">
          ${validationUrl}
        </a>
      </p>
    </div>

    <p class="text">
      Agradecemos sua participação e esperamos vê-lo em nossos próximos eventos!
    </p>
  `

  return baseTemplate({
    content,
    preheader: `Seu certificado do evento ${eventTitle} está disponível!`,
  })
}
