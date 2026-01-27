import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { pt } from '@payloadcms/translations/languages/pt'
import { s3Storage } from '@payloadcms/storage-s3'
import { nodemailerAdapter } from '@payloadcms/email-nodemailer'

import { Users } from './collections/users'
import { Files } from './collections/files'
import { Rooms } from './collections/rooms'
import { Speakers } from './collections/speakers'
import { Events } from './collections/events'
import { Registrations } from './collections/registrations'
import { Tickets } from './collections/tickets'
import { CheckIns } from './collections/check-ins'
import { Certificates } from './collections/certificates'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    avatar: 'gravatar',
    dateFormat: 'dd/MM/yyyy, HH:mm',
    timezones: {
      defaultTimezone: 'America/Sao_Paulo',
    },
  },
  i18n: {
    fallbackLanguage: 'pt',
    supportedLanguages: { pt },
    translations: {
      pt: {
        general: {
          payloadSettings: 'Configurações do Dashboard',
        },
      },
    },
  },
  collections: [
    Users,
    Files,
    Rooms,
    Speakers,
    Events,
    Registrations,
    Tickets,
    CheckIns,
    Certificates,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  email: nodemailerAdapter({
    defaultFromAddress: process.env.SMTP_USER!,
    defaultFromName: process.env.SMTP_FROM_NAME!,
    transportOptions: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: Number(process.env.SMTP_PORT) === 465,
      requireTLS: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    },
  }),
  sharp,
  upload: {
    limits: {
      fileSize: Number(process.env.PAYLOAD_MAX_UPLOAD_SIZE) * 1024 * 1024,
    },
    abortOnLimit: true,
    safeFileNames: true,
    preserveExtension: true,
    uploadTimeout: Number(process.env.PAYLOAD_UPLOAD_TIMEOUT) * 1000,
    responseOnLimit: 'Tamanho Máximo de Arquivo Excedido.',
  },
  folders: {
    browseByFolder: true,
    slug: 'fileFolders',
  },
  plugins: [
    s3Storage({
      collections: {
        files: true,
      },
      bucket: process.env.MINIO_BUCKET!,
      config: {
        endpoint: process.env.MINIO_ENDPOINT,
        credentials: {
          accessKeyId: process.env.MINIO_ACCESS_KEY!,
          secretAccessKey: process.env.MINIO_SECRET_KEY!,
        },
        region: process.env.MINIO_REGION,
        forcePathStyle: true,
      },
    }),
  ],
})
