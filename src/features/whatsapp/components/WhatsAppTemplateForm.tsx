import { X } from 'lucide-react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import {
  templateVariablesByCategory,
  whatsappTemplateCategories,
  whatsappTemplateCategoryLabels,
} from '../constants'
import type {
  WhatsAppTemplateCategory,
  WhatsAppTemplateFormValues,
  WhatsAppTemplateRecord,
} from '../types'
import { WhatsAppPreview } from './WhatsAppPreview'

type WhatsAppTemplateFormProps = {
  editingTemplate: WhatsAppTemplateRecord | null
  isOpen: boolean
  saving: boolean
  onClose: () => void
  onSubmit: (
    values: WhatsAppTemplateFormValues,
    editingTemplate?: WhatsAppTemplateRecord | null,
  ) => Promise<{ data?: WhatsAppTemplateRecord; error?: string }>
}

const defaultValues: WhatsAppTemplateFormValues = {
  category: 'genel',
  is_active: true,
  message: '',
  title: '',
}

export function WhatsAppTemplateForm({
  editingTemplate,
  isOpen,
  onClose,
  onSubmit,
  saving,
}: WhatsAppTemplateFormProps) {
  const [values, setValues] =
    useState<WhatsAppTemplateFormValues>(defaultValues)
  const [formError, setFormError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const variables = templateVariablesByCategory[values.category]

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setValues(
      editingTemplate
        ? {
            category:
              (editingTemplate.category as WhatsAppTemplateCategory) ?? 'genel',
            is_active: editingTemplate.is_active !== false,
            message: editingTemplate.message,
            title: editingTemplate.title,
          }
        : defaultValues,
    )
    setFormError(null)
  }, [editingTemplate, isOpen])

  if (!isOpen) {
    return null
  }

  function updateValue<K extends keyof WhatsAppTemplateFormValues>(
    key: K,
    value: WhatsAppTemplateFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [key]: value,
    }))
    setFormError(null)
  }

  function insertVariable(variable: string) {
    const token = `{{${variable}}}`
    const textarea = textareaRef.current

    if (!textarea) {
      updateValue('message', `${values.message}${token}`)
      return
    }

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const nextMessage = `${values.message.slice(0, start)}${token}${values.message.slice(end)}`
    updateValue('message', nextMessage)

    window.setTimeout(() => {
      textarea.focus()
      const nextCursor = start + token.length
      textarea.setSelectionRange(nextCursor, nextCursor)
    }, 0)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!values.title.trim()) {
      setFormError('Başlık zorunludur.')
      return
    }

    if (!values.message.trim()) {
      setFormError('Mesaj içeriği zorunludur.')
      return
    }

    const result = await onSubmit(values, editingTemplate)

    if (result.error) {
      setFormError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-5xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              WhatsApp Şablonu
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">
              {editingTemplate ? 'Şablon düzenle' : 'Yeni şablon'}
            </h2>
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

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-neutral-700">
                  Başlık
                </span>
                <input
                  required
                  value={values.title}
                  onChange={(event) => updateValue('title', event.target.value)}
                  className="mt-2 h-10 w-full rounded-lg border border-neutral-200 px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-neutral-700">
                    Kategori
                  </span>
                  <select
                    required
                    value={values.category}
                    onChange={(event) =>
                      updateValue(
                        'category',
                        event.target.value as WhatsAppTemplateCategory,
                      )
                    }
                    className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  >
                    {whatsappTemplateCategories.map((category) => (
                      <option key={category} value={category}>
                        {whatsappTemplateCategoryLabels[category]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex items-end gap-3 rounded-lg border border-neutral-200 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={values.is_active}
                    onChange={(event) =>
                      updateValue('is_active', event.target.checked)
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-neutral-700">
                    Aktif şablon
                  </span>
                </label>
              </div>

              <label className="block">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-700">
                    Mesaj içeriği
                  </span>
                  <span className="text-xs font-medium text-neutral-500">
                    {values.message.length} karakter
                  </span>
                </div>
                <textarea
                  required
                  ref={textareaRef}
                  rows={9}
                  value={values.message}
                  onChange={(event) => updateValue('message', event.target.value)}
                  className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm leading-6 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />
              </label>

              {formError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {formError}
                </div>
              ) : null}
            </div>

            <aside className="space-y-4">
              <WhatsAppPreview message={values.message} />
              <div className="rounded-lg border border-neutral-200 p-4">
                <p className="text-sm font-semibold text-neutral-900">
                  Kullanılabilir değişkenler
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {variables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      onClick={() => insertVariable(variable)}
                      className="rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
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
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
