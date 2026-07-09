import { createContext, useContext } from 'react'
import type { WhatsAppMessageTarget } from '../types'

export type WhatsAppMessageContextValue = {
  openWhatsAppMessage: (target: WhatsAppMessageTarget) => void
}

export const WhatsAppMessageContext =
  createContext<WhatsAppMessageContextValue | null>(null)

export function useWhatsAppMessage() {
  const context = useContext(WhatsAppMessageContext)

  if (!context) {
    throw new Error('useWhatsAppMessage must be used inside WhatsAppMessageProvider')
  }

  return context
}
