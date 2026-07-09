import { renderWhatsAppTemplate } from '../utils/templateRenderer'
import type { WhatsAppTemplateVariables } from '../types'

type WhatsAppPreviewProps = {
  message: string
  variables?: WhatsAppTemplateVariables
}

export function WhatsAppPreview({ message, variables }: WhatsAppPreviewProps) {
  const preview = renderWhatsAppTemplate(message, variables)

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <p className="text-xs font-semibold uppercase text-neutral-500">
        Canlı ön izleme
      </p>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-neutral-800">
        {preview || 'Mesaj içeriği yazıldığında ön izleme burada görünür.'}
      </p>
    </div>
  )
}
