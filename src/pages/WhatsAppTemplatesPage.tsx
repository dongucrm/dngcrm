import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { WhatsAppTemplateCard } from '../features/whatsapp/components/WhatsAppTemplateCard'
import { WhatsAppTemplateFilters } from '../features/whatsapp/components/WhatsAppTemplateFilters'
import { WhatsAppTemplateForm } from '../features/whatsapp/components/WhatsAppTemplateForm'
import { WhatsAppTemplatesTable } from '../features/whatsapp/components/WhatsAppTemplatesTable'
import { emptyWhatsAppTemplateFilters } from '../features/whatsapp/constants'
import {
  fetchWhatsAppTemplates,
  saveWhatsAppTemplate,
  setWhatsAppTemplateActive,
} from '../features/whatsapp/services/whatsappTemplateService'
import type {
  WhatsAppTemplateFiltersState,
  WhatsAppTemplateFormValues,
  WhatsAppTemplateRecord,
} from '../features/whatsapp/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

export function WhatsAppTemplatesPage() {
  usePageTitle('WhatsApp Şablonları')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [filters, setFilters] = useState<WhatsAppTemplateFiltersState>({
    ...emptyWhatsAppTemplateFilters,
  })
  const [templates, setTemplates] = useState<WhatsAppTemplateRecord[]>([])
  const [editingTemplate, setEditingTemplate] =
    useState<WhatsAppTemplateRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)
    const result = await fetchWhatsAppTemplates(filters, auth)

    if (result.error) {
      setTemplates([])
      setError(result.error)
      setLoading(false)
      return
    }

    setTemplates(result.data ?? [])
    setLoading(false)
  }, [auth, filters])

  useEffect(() => {
    void loadTemplates()
  }, [loadTemplates])

  function openCreateForm() {
    setEditingTemplate(null)
    setIsFormOpen(true)
  }

  function openEditForm(template: WhatsAppTemplateRecord) {
    setEditingTemplate(template)
    setIsFormOpen(true)
  }

  async function handleSaveTemplate(
    values: WhatsAppTemplateFormValues,
    template?: WhatsAppTemplateRecord | null,
  ) {
    setSaving(true)
    const result = await saveWhatsAppTemplate(values, auth, template)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadTemplates()
    return result
  }

  async function handleToggleActive(template: WhatsAppTemplateRecord) {
    setSaving(true)
    const result = await setWhatsAppTemplateActive(
      template,
      template.is_active === false,
      auth,
    )
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadTemplates()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            WhatsApp Şablonları
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Hazır mesaj şablonlarını yönetin ve CRM genelindeki WhatsApp
            mesajlarında kullanın.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadTemplates()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            onClick={openCreateForm}
            disabled={!isAdmin}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni Şablon
          </button>
        </div>
      </div>

      <WhatsAppTemplateFilters
        filters={filters}
        isAdmin={isAdmin}
        onChange={setFilters}
        onReset={() => setFilters({ ...emptyWhatsAppTemplateFilters })}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          WhatsApp şablonları yükleniyor...
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Şablon bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya admin olarak yeni şablon ekleyin.
          </p>
        </div>
      ) : (
        <>
          <WhatsAppTemplatesTable
            canManage={isAdmin}
            templates={templates}
            onEdit={openEditForm}
            onToggleActive={handleToggleActive}
          />
          <section className="space-y-3 lg:hidden">
            {templates.map((template) => (
              <WhatsAppTemplateCard
                key={template.id}
                canManage={isAdmin}
                template={template}
                onEdit={openEditForm}
                onToggleActive={handleToggleActive}
              />
            ))}
          </section>
        </>
      )}

      <WhatsAppTemplateForm
        editingTemplate={editingTemplate}
        isOpen={isFormOpen}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveTemplate}
      />
    </div>
  )
}
