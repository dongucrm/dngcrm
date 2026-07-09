import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import { WhatsAppMessageModal } from '../components/WhatsAppMessageModal'
import { fetchActiveWhatsAppTemplates } from '../services/whatsappTemplateService'
import type { WhatsAppMessageTarget, WhatsAppTemplateRecord } from '../types'
import { WhatsAppMessageContext } from './WhatsAppMessageContext'

export function WhatsAppMessageProvider({ children }: { children: ReactNode }) {
  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [target, setTarget] = useState<WhatsAppMessageTarget | null>(null)
  const [templates, setTemplates] = useState<WhatsAppTemplateRecord[]>([])
  const [loading, setLoading] = useState(false)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    const result = await fetchActiveWhatsAppTemplates()
    setLoading(false)

    if (result.data) {
      setTemplates(result.data)
    }
  }, [])

  const openWhatsAppMessage = useCallback(
    (nextTarget: WhatsAppMessageTarget) => {
      setTarget(nextTarget)
      void loadTemplates()
    },
    [loadTemplates],
  )

  const value = useMemo(
    () => ({
      openWhatsAppMessage,
    }),
    [openWhatsAppMessage],
  )

  return (
    <WhatsAppMessageContext.Provider value={value}>
      {children}
      <WhatsAppMessageModal
        auth={auth}
        isOpen={Boolean(target)}
        loading={loading}
        target={target}
        templates={templates}
        onClose={() => setTarget(null)}
      />
    </WhatsAppMessageContext.Provider>
  )
}
