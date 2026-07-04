import { Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { LeadFiltersBar } from '../features/leads/LeadFiltersBar'
import { LeadFormModal } from '../features/leads/LeadFormModal'
import { LeadMobileCards } from '../features/leads/LeadMobileCards'
import { LeadQuickActionModal } from '../features/leads/LeadQuickActionModal'
import { LeadTable } from '../features/leads/LeadTable'
import { emptyLeadFilters } from '../features/leads/constants'
import type {
  CallLogFormValues,
  LeadFilters,
  LeadQuickAction,
  LeadRecord,
  LeadTaskFormValues,
} from '../features/leads/types'
import { useLeads } from '../features/leads/useLeads'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

export function LeadsPage() {
  usePageTitle('Lead / Potansiyel Müşteri')

  const { isAdmin, isSales } = useAuth()
  const [filters, setFilters] = useState<LeadFilters>({ ...emptyLeadFilters })
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<LeadRecord | null>(null)
  const [quickAction, setQuickAction] = useState<LeadQuickAction | null>(null)

  const {
    assignees,
    createCallLog,
    createTask,
    error,
    leads,
    loading,
    markLeadAsPassive,
    programs,
    referencesLoading,
    reload,
    saveLead,
    saving,
    sourceOptions,
  } = useLeads(filters)

  function openCreateModal() {
    setSelectedLead(null)
    setIsFormOpen(true)
  }

  function openEditModal(lead: LeadRecord) {
    setSelectedLead(lead)
    setIsFormOpen(true)
  }

  async function handleCreateCallLog(values: CallLogFormValues) {
    if (!quickAction || quickAction.type !== 'call') {
      return {
        success: false,
        error: 'Arama kaydı için lead seçilemedi.',
      }
    }

    return createCallLog(quickAction.lead, values)
  }

  async function handleCreateTask(values: LeadTaskFormValues) {
    if (!quickAction || quickAction.type !== 'task') {
      return {
        success: false,
        error: 'Görev için lead seçilemedi.',
      }
    }

    return createTask(quickAction.lead, values)
  }

  const isBusy = loading || referencesLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Lead / Potansiyel Müşteri
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {isAdmin
              ? 'Tüm leadleri görüntüleyebilir ve atama yapabilirsiniz.'
              : isSales
                ? 'Size atanmış leadleri görüntülüyorsunuz.'
                : 'Lead yönetimi'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Yeni Lead Ekle
          </button>
        </div>
      </div>

      <LeadFiltersBar
        filters={filters}
        programs={programs}
        sourceOptions={sourceOptions}
        onChange={setFilters}
        onReset={() => setFilters({ ...emptyLeadFilters })}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {isBusy ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Lead listesi yükleniyor...
        </div>
      ) : leads.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Lead bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni lead ekleyin.
          </p>
        </div>
      ) : (
        <>
          <LeadTable
            leads={leads}
            onEdit={openEditModal}
            onQuickAction={setQuickAction}
          />
          <LeadMobileCards
            leads={leads}
            onEdit={openEditModal}
            onQuickAction={setQuickAction}
          />
        </>
      )}

      <LeadFormModal
        assignees={assignees}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        lead={selectedLead}
        programs={programs}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onPassive={markLeadAsPassive}
        onSubmit={saveLead}
      />

      <LeadQuickActionModal
        action={quickAction}
        saving={saving}
        onClose={() => setQuickAction(null)}
        onCreateCallLog={handleCreateCallLog}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}
