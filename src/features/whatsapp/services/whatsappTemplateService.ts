import { supabase } from '../../../lib/supabase'
import type {
  WhatsAppAuthContext,
  WhatsAppTemplateFiltersState,
  WhatsAppTemplateFormValues,
  WhatsAppTemplateRecord,
} from '../types'

type ServiceResult<T> = {
  data?: T
  error?: string
}

function matchesSearch(template: WhatsAppTemplateRecord, search: string) {
  if (!search) {
    return true
  }

  const normalizedSearch = search.toLocaleLowerCase('tr')

  return [template.title, template.message, template.category].some((value) =>
    value?.toLocaleLowerCase('tr').includes(normalizedSearch),
  )
}

export async function fetchWhatsAppTemplates(
  filters: WhatsAppTemplateFiltersState,
  auth: WhatsAppAuthContext,
): Promise<ServiceResult<WhatsAppTemplateRecord[]>> {
  let query = supabase
    .from('whatsapp_templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (!auth.isAdmin || filters.status === 'active') {
    query = query.eq('is_active', true)
  }

  if (auth.isAdmin && filters.status === 'passive') {
    query = query.eq('is_active', false)
  }

  if (filters.category !== 'all') {
    query = query.eq('category', filters.category)
  }

  const { data, error } = await query

  if (error) {
    return { error: 'WhatsApp şablonları alınamadı.' }
  }

  return {
    data: ((data ?? []) as WhatsAppTemplateRecord[]).filter((template) =>
      matchesSearch(template, filters.search.trim()),
    ),
  }
}

export async function fetchActiveWhatsAppTemplates(): Promise<
  ServiceResult<WhatsAppTemplateRecord[]>
> {
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('title', { ascending: true })

  if (error) {
    return { error: 'Aktif WhatsApp şablonları alınamadı.' }
  }

  return { data: (data ?? []) as WhatsAppTemplateRecord[] }
}

export async function saveWhatsAppTemplate(
  values: WhatsAppTemplateFormValues,
  auth: WhatsAppAuthContext,
  editingTemplate?: WhatsAppTemplateRecord | null,
): Promise<ServiceResult<WhatsAppTemplateRecord>> {
  if (!auth.isAdmin) {
    return { error: 'Şablon yönetimi yalnızca admin tarafından yapılabilir.' }
  }

  if (!values.title.trim()) {
    return { error: 'Başlık zorunludur.' }
  }

  if (!values.category) {
    return { error: 'Kategori zorunludur.' }
  }

  if (!values.message.trim()) {
    return { error: 'Mesaj içeriği zorunludur.' }
  }

  const payload = {
    category: values.category,
    is_active: values.is_active,
    message: values.message.trim(),
    title: values.title.trim(),
  }

  const result = editingTemplate
    ? await supabase
        .from('whatsapp_templates')
        .update(payload)
        .eq('id', editingTemplate.id)
        .select('*')
        .maybeSingle()
    : await supabase
        .from('whatsapp_templates')
        .insert(payload)
        .select('*')
        .maybeSingle()

  if (result.error || !result.data) {
    return {
      error: editingTemplate
        ? 'WhatsApp şablonu güncellenemedi.'
        : 'WhatsApp şablonu oluşturulamadı.',
    }
  }

  return { data: result.data as WhatsAppTemplateRecord }
}

export async function setWhatsAppTemplateActive(
  template: WhatsAppTemplateRecord,
  isActive: boolean,
  auth: WhatsAppAuthContext,
): Promise<ServiceResult<WhatsAppTemplateRecord>> {
  if (!auth.isAdmin) {
    return { error: 'Şablon durumu yalnızca admin tarafından değiştirilebilir.' }
  }

  const { data, error } = await supabase
    .from('whatsapp_templates')
    .update({ is_active: isActive })
    .eq('id', template.id)
    .select('*')
    .maybeSingle()

  if (error || !data) {
    return { error: 'Şablon durumu güncellenemedi.' }
  }

  return { data: data as WhatsAppTemplateRecord }
}
