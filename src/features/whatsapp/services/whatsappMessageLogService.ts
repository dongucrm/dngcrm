import { supabase } from '../../../lib/supabase'
import { isToday } from '../../../utils/date'
import type {
  WhatsAppAuthContext,
  WhatsAppDashboardMetrics,
  WhatsAppMessageLog,
  WhatsAppMessageTarget,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

export async function createWhatsAppMessageLog({
  auth,
  message,
  target,
  templateId,
}: {
  auth: WhatsAppAuthContext
  message: string
  target: WhatsAppMessageTarget
  templateId?: string | null
}): Promise<ServiceResult<WhatsAppMessageLog>> {
  if (!auth.userId) {
    return { error: 'Oturum kullanıcısı bulunamadı.' }
  }

  const { data, error } = await supabase
    .from('whatsapp_message_logs')
    .insert({
      entity_id: target.entityId,
      entity_type: target.entityType,
      message,
      phone: target.phone ?? null,
      template_id: templateId ?? null,
      user_id: auth.userId,
    })
    .select('*')
    .maybeSingle()

  if (error || !data) {
    return { error: 'WhatsApp açma logu kaydedilemedi.' }
  }

  return { data: data as WhatsAppMessageLog }
}

export async function fetchWhatsAppDashboardMetrics(): Promise<WhatsAppDashboardMetrics> {
  const [logsResult, templatesResult] = await Promise.all([
    supabase
      .from('whatsapp_message_logs')
      .select(
        `
          id,
          template_id,
          opened_at,
          template:whatsapp_templates (
            id,
            title
          )
        `,
      )
      .order('opened_at', { ascending: false }),
    supabase
      .from('whatsapp_templates')
      .select('id,is_active', { count: 'exact' })
      .eq('is_active', false),
  ])

  if (logsResult.error) {
    return {
      passiveTemplateCount: templatesResult.count ?? 0,
      todayOpenCount: 0,
      topTemplateTitle: '-',
      totalOpenCount: 0,
    }
  }

  const logs = logsResult.data ?? []
  const templateUsage = new Map<string, { count: number; title: string }>()

  logs.forEach((log) => {
    const template = Array.isArray(log.template)
      ? log.template[0]
      : log.template
    const title = template?.title ?? 'Şablonsuz'
    const key = log.template_id ?? title
    const current = templateUsage.get(key) ?? { count: 0, title }
    templateUsage.set(key, {
      count: current.count + 1,
      title,
    })
  })

  const topTemplate =
    Array.from(templateUsage.values()).sort((first, second) => {
      return second.count - first.count
    })[0]?.title ?? '-'

  return {
    passiveTemplateCount: templatesResult.count ?? 0,
    todayOpenCount: logs.filter((log) => isToday(log.opened_at)).length,
    topTemplateTitle: topTemplate,
    totalOpenCount: logs.length,
  }
}
