import { ExternalLink, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { getWhatsAppUrl } from '../../../utils/phone'
import { whatsappTemplateCategoryLabels } from '../constants'
import type {
  WhatsAppAuthContext,
  WhatsAppMessageTarget,
  WhatsAppTemplateRecord,
} from '../types'
import { renderWhatsAppTemplate } from '../utils/templateRenderer'
import { createWhatsAppMessageLog } from '../services/whatsappMessageLogService'

type WhatsAppMessageModalProps = {
  auth: WhatsAppAuthContext
  isOpen: boolean
  loading: boolean
  target: WhatsAppMessageTarget | null
  templates: WhatsAppTemplateRecord[]
  onClose: () => void
}

export function WhatsAppMessageModal({
  auth,
  isOpen,
  loading,
  onClose,
  target,
  templates,
}: WhatsAppMessageModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const filteredTemplates = useMemo(() => {
    if (!target?.defaultCategory) {
      return templates
    }

    const categoryTemplates = templates.filter(
      (template) => template.category === target.defaultCategory,
    )

    return categoryTemplates.length > 0 ? categoryTemplates : templates
  }, [target?.defaultCategory, templates])

  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  )

  useEffect(() => {
    if (!isOpen || !target) {
      return
    }

    const initialTemplate =
      filteredTemplates.find(
        (template) => template.category === target.defaultCategory,
      ) ??
      filteredTemplates[0] ??
      null

    setSelectedTemplateId(initialTemplate?.id ?? '')
    setMessage(
      initialTemplate
        ? renderWhatsAppTemplate(initialTemplate.message, target.variables)
        : '',
    )
    setError(null)
  }, [filteredTemplates, isOpen, target])

  useEffect(() => {
    if (!isOpen || !target || !selectedTemplate) {
      return
    }

    setMessage(renderWhatsAppTemplate(selectedTemplate.message, target.variables))
    setError(null)
  }, [isOpen, selectedTemplate, target])

  if (!isOpen || !target) {
    return null
  }

  const currentTarget = target
  const whatsappUrl = getWhatsAppUrl(currentTarget.phone, message)
  const categoryLabel = currentTarget.defaultCategory
    ? whatsappTemplateCategoryLabels[
        currentTarget.defaultCategory as keyof typeof whatsappTemplateCategoryLabels
      ]
    : 'Genel'

  function handleOpenWhatsApp() {
    if (!currentTarget.phone) {
      setError('Telefon numarası bulunamadı.')
      return
    }

    if (!message.trim()) {
      setError('WhatsApp mesajı boş olamaz.')
      return
    }

    if (!whatsappUrl) {
      setError('Telefon numarası WhatsApp formatına çevrilemedi.')
      return
    }

    void createWhatsAppMessageLog({
      auth,
      message: message.trim(),
      target: currentTarget,
      templateId: selectedTemplateId || null,
    })

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-2xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              WhatsApp Mesajı
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {target.name}
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              {categoryLabel} · {target.phone || 'Telefon yok'}
            </p>
          </div>
          <button
            type="button"
            aria-label="Kapat"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          <label className="block">
            <span className="text-sm font-medium text-neutral-700">
              Şablon seçimi
            </span>
            <select
              value={selectedTemplateId}
              disabled={loading || filteredTemplates.length === 0}
              onChange={(event) => setSelectedTemplateId(event.target.value)}
              className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50"
            >
              <option value="">
                {loading ? 'Şablonlar yükleniyor...' : 'Şablonsuz mesaj'}
              </option>
              {filteredTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-neutral-700">
                Mesaj ön izleme ve düzenleme
              </span>
              <span className="text-xs font-medium text-neutral-500">
                {message.length} karakter
              </span>
            </div>
            <textarea
              rows={8}
              value={message}
              onChange={(event) => {
                setMessage(event.target.value)
                setError(null)
              }}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Bu işlem mesajı otomatik göndermez; yalnızca WhatsApp ekranını açar
            ve açma denemesini loglar.
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-neutral-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            WhatsApp’ta Aç
          </button>
        </div>
      </section>
    </div>
  )
}
