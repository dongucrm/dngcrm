type EnvConfig = {
  supabaseUrl: string
  supabasePublishableKey: string
}

const requiredEnvKeys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
] as const

type RequiredEnvKey = (typeof requiredEnvKeys)[number]

function readEnvValue(key: RequiredEnvKey) {
  const value = import.meta.env[key]

  if (!value || value.trim().length === 0) {
    throw new Error(
      `Eksik environment değişkeni: ${key}. Lütfen .env.local dosyasına ekleyin.`,
    )
  }

  return value.trim()
}

function validateSupabaseUrl(value: string) {
  try {
    const url = new URL(value)

    if (url.protocol !== 'https:' || !url.hostname.endsWith('.supabase.co')) {
      throw new Error()
    }
  } catch {
    throw new Error(
      'VITE_SUPABASE_URL geçerli bir Supabase HTTPS URL değeri olmalıdır.',
    )
  }
}

function validatePublishableKey(value: string) {
  const normalizedValue = value.toLowerCase()

  if (
    normalizedValue.includes('service_role') ||
    normalizedValue.startsWith('sb_secret_') ||
    normalizedValue.includes('postgres://') ||
    normalizedValue.includes('postgresql://')
  ) {
    throw new Error(
      'VITE_SUPABASE_PUBLISHABLE_KEY yalnızca publishable key olmalıdır; service_role, secret key veya database bilgisi kullanmayın.',
    )
  }
}

export function getEnv(): EnvConfig {
  const supabaseUrl = readEnvValue('VITE_SUPABASE_URL')
  const supabasePublishableKey = readEnvValue('VITE_SUPABASE_PUBLISHABLE_KEY')

  validateSupabaseUrl(supabaseUrl)
  validatePublishableKey(supabasePublishableKey)

  return {
    supabaseUrl,
    supabasePublishableKey,
  }
}

export function hasRequiredSupabaseEnv() {
  return requiredEnvKeys.every((key) => {
    const value = import.meta.env[key]

    return Boolean(value && value.trim().length > 0)
  })
}
