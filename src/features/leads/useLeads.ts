import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import type {
  LeadPriority,
  LeadStatus,
  Program,
  TaskStatus,
} from '../../types/database'
import { leadSourceOptions, leadStatusOptions } from './constants'
import type {
  CallLogFormValues,
  LeadAssignee,
  LeadFilters,
  LeadFormValues,
  LeadRecord,
  LeadTaskFormValues,
} from './types'
import { fromDateTimeLocalValue, getTodayRange } from './utils'

function cleanText(value: string | null | undefined) {
  const trimmedValue = value?.trim()

  return trimmedValue && trimmedValue.length > 0 ? trimmedValue : null
}

function normalizeNumber(value: number | undefined) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return value
}

function buildLeadPayload(values: LeadFormValues) {
  return {
    full_name: values.full_name.trim(),
    phone: values.phone.trim(),
    email: cleanText(values.email),
    child_name: cleanText(values.child_name),
    child_age: normalizeNumber(values.child_age),
    source: cleanText(values.source),
    interested_program_id: values.interested_program_id || null,
    status: values.status,
    priority: values.priority,
    probability: values.probability,
    assigned_user_id: values.assigned_user_id || null,
    next_call_date: values.next_call_date || null,
    last_contact_date: values.last_contact_date || null,
    notes: cleanText(values.notes),
  }
}

function getLeadStatusFromCallStatus(callStatus: string): LeadStatus | null {
  if (leadStatusOptions.includes(callStatus as LeadStatus)) {
    return callStatus as LeadStatus
  }

  if (callStatus === 'tekrar_aranacak') {
    return 'aranacak'
  }

  return null
}

export function useLeads(filters: LeadFilters) {
  const { isAdmin, isSales, profile, user } = useAuth()
  const [leads, setLeads] = useState<LeadRecord[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [assignees, setAssignees] = useState<LeadAssignee[]>([])
  const [loading, setLoading] = useState(true)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canManageAssignments = isAdmin

  const loadReferences = useCallback(async () => {
    setReferencesLoading(true)

    const { data: programData, error: programError } = await supabase
      .from('programs')
      .select(
        'id,name,type,description,price,start_date,end_date,quota,is_active,created_at',
      )
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (programError) {
      setError('Program listesi alınamadı.')
      setReferencesLoading(false)
      return
    }

    setPrograms((programData ?? []) as Program[])

    if (isAdmin) {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id,full_name,phone,role_id,is_active,created_at')
        .eq('is_active', true)
        .order('full_name', { ascending: true })

      if (profileError) {
        setError('Personel listesi alınamadı.')
        setReferencesLoading(false)
        return
      }

      setAssignees((profileData ?? []) as LeadAssignee[])
    } else if (profile) {
      setAssignees([profile])
    }

    setReferencesLoading(false)
  }, [isAdmin, profile])

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)

    let query = supabase
      .from('leads')
      .select(
        `
          *,
          interested_program:programs (
            id,
            name,
            type,
            is_active
          ),
          assigned_user:profiles (
            id,
            full_name,
            phone,
            is_active
          )
        `,
      )
      .order('created_at', { ascending: false })

    const searchValue = filters.search.trim()

    if (searchValue) {
      const escapedSearch = searchValue.replaceAll(',', ' ')
      query = query.or(
        [
          `full_name.ilike.%${escapedSearch}%`,
          `phone.ilike.%${escapedSearch}%`,
          `email.ilike.%${escapedSearch}%`,
          `child_name.ilike.%${escapedSearch}%`,
          `notes.ilike.%${escapedSearch}%`,
        ].join(','),
      )
    }

    if (filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }

    if (filters.programId !== 'all') {
      query = query.eq('interested_program_id', filters.programId)
    }

    if (filters.source !== 'all') {
      query = query.eq('source', filters.source)
    }

    if (filters.priority !== 'all') {
      query = query.eq('priority', filters.priority)
    }

    if (filters.probability !== 'all') {
      query = query.eq('probability', filters.probability)
    }

    if (filters.callFilter === 'today') {
      const todayRange = getTodayRange()
      query = query
        .gte('next_call_date', todayRange.start)
        .lt('next_call_date', todayRange.end)
    }

    if (filters.callFilter === 'overdue') {
      query = query.lt('next_call_date', new Date().toISOString())
    }

    if (isSales && user?.id) {
      query = query.eq('assigned_user_id', user.id)
    }

    const { data, error: leadError } = await query

    if (leadError) {
      setError('Lead listesi alınamadı. Lütfen tekrar deneyin.')
      setLeads([])
      setLoading(false)
      return
    }

    setLeads((data ?? []) as LeadRecord[])
    setLoading(false)
  }, [filters, isSales, user?.id])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  useEffect(() => {
    void loadLeads()
  }, [loadLeads])

  const sourceOptions = useMemo(() => {
    const sources = new Set(leadSourceOptions)

    leads.forEach((lead) => {
      if (lead.source) {
        sources.add(lead.source)
      }
    })

    return Array.from(sources).sort((a, b) => a.localeCompare(b, 'tr'))
  }, [leads])

  const saveLead = useCallback(
    async (values: LeadFormValues, lead?: LeadRecord) => {
      setSaving(true)
      setError(null)

      if (!values.full_name.trim() || !values.phone.trim()) {
        setSaving(false)
        return {
          success: false,
          error: 'Veli adı soyadı ve telefon zorunludur.',
        }
      }

      const payload = buildLeadPayload(values)

      if (!isAdmin && user?.id) {
        payload.assigned_user_id = user.id
      }

      if (lead && !isAdmin) {
        const { error: updateError } = await supabase
          .from('leads')
          .update({
            status: values.status,
            notes: cleanText(values.notes),
            next_call_date: values.next_call_date || null,
          })
          .eq('id', lead.id)

        setSaving(false)

        if (updateError) {
          return {
            success: false,
            error: 'Lead güncellenemedi. Yetki veya bağlantı ayarlarını kontrol edin.',
          }
        }

        await loadLeads()

        return { success: true }
      }

      const { error: saveError } = lead
        ? await supabase.from('leads').update(payload).eq('id', lead.id)
        : await supabase.from('leads').insert(payload)

      setSaving(false)

      if (saveError) {
        return {
          success: false,
          error: lead
            ? 'Lead güncellenemedi. Lütfen tekrar deneyin.'
            : 'Lead eklenemedi. Lütfen tekrar deneyin.',
        }
      }

      await loadLeads()

      return { success: true }
    },
    [isAdmin, loadLeads, user?.id],
  )

  const markLeadAsPassive = useCallback(
    async (lead: LeadRecord) => {
      setSaving(true)
      setError(null)

      const { error: updateError } = await supabase
        .from('leads')
        .update({ status: 'vazgecti' satisfies LeadStatus })
        .eq('id', lead.id)

      setSaving(false)

      if (updateError) {
        return {
          success: false,
          error: 'Lead durumu güncellenemedi.',
        }
      }

      await loadLeads()

      return { success: true }
    },
    [loadLeads],
  )

  const createCallLog = useCallback(
    async (lead: LeadRecord, values: CallLogFormValues) => {
      setSaving(true)
      setError(null)

      const nextCallDate = fromDateTimeLocalValue(values.next_call_date)

      const { error: callLogError } = await supabase.from('call_logs').insert({
        lead_id: lead.id,
        user_id: user?.id ?? null,
        call_status: values.call_status,
        next_call_date: nextCallDate ?? null,
        notes: cleanText(values.notes),
      })

      if (callLogError) {
        setSaving(false)
        return {
          success: false,
          error: 'Arama kaydı eklenemedi. RLS yetkilerini kontrol edin.',
        }
      }

      const leadStatus = getLeadStatusFromCallStatus(values.call_status)
      const leadUpdate: {
        status?: LeadStatus
        next_call_date?: string | null
        last_contact_date?: string
      } = {}

      if (leadStatus) {
        leadUpdate.status = leadStatus
      }

      if (nextCallDate) {
        leadUpdate.next_call_date = nextCallDate
      }

      if (isAdmin) {
        leadUpdate.last_contact_date = new Date().toISOString()
      }

      if (Object.keys(leadUpdate).length > 0) {
        await supabase.from('leads').update(leadUpdate).eq('id', lead.id)
      }

      setSaving(false)
      await loadLeads()

      return { success: true }
    },
    [isAdmin, loadLeads, user?.id],
  )

  const createTask = useCallback(
    async (lead: LeadRecord, values: LeadTaskFormValues) => {
      setSaving(true)
      setError(null)

      const dueDate = fromDateTimeLocalValue(values.due_date)
      const assignedUserId = lead.assigned_user_id ?? user?.id ?? null

      const { error: taskError } = await supabase.from('tasks').insert({
        title: values.title.trim(),
        description: cleanText(values.description),
        related_lead_id: lead.id,
        assigned_user_id: assignedUserId,
        due_date: dueDate ?? null,
        status: values.status as TaskStatus,
        priority: values.priority as LeadPriority,
      })

      setSaving(false)

      if (taskError) {
        return {
          success: false,
          error: 'Görev oluşturulamadı. RLS yetkilerini kontrol edin.',
        }
      }

      return { success: true }
    },
    [user?.id],
  )

  return {
    assignees,
    canManageAssignments,
    createCallLog,
    createTask,
    error,
    leads,
    loading,
    markLeadAsPassive,
    programs,
    referencesLoading,
    reload: loadLeads,
    saveLead,
    saving,
    sourceOptions,
  }
}
