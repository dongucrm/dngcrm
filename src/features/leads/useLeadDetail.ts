import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import type { LeadRecord } from './types'

export function useLeadDetail(leadId: string | undefined) {
  const { isSales, user } = useAuth()
  const [lead, setLead] = useState<LeadRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLead = useCallback(async () => {
    if (!leadId) {
      setLead(null)
      setError('Lead bulunamadı.')
      setLoading(false)
      return
    }

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
      .eq('id', leadId)

    if (isSales && user?.id) {
      query = query.eq('assigned_user_id', user.id)
    }

    const { data, error: leadError } = await query.maybeSingle()

    if (leadError || !data) {
      setLead(null)
      setError('Lead detayı alınamadı veya bu kayda erişim yetkiniz yok.')
      setLoading(false)
      return
    }

    setLead(data as LeadRecord)
    setLoading(false)
  }, [isSales, leadId, user?.id])

  useEffect(() => {
    void loadLead()
  }, [loadLead])

  return {
    error,
    lead,
    loading,
    reload: loadLead,
  }
}
