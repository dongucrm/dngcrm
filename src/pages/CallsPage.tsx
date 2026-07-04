import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CallFilters } from '../features/calls/components/CallFilters'
import { CallLogCard } from '../features/calls/components/CallLogCard'
import { CallLogForm } from '../features/calls/components/CallLogForm'
import { CallLogsTable } from '../features/calls/components/CallLogsTable'
import { emptyCallFilters } from '../features/calls/constants'
import {
  createTaskForLead,
  fetchCallReferences,
  fetchCallTargets,
  saveCallLog,
} from '../features/calls/services/callLogService'
import type {
  CallFiltersState,
  CallLogFormValues,
  CallLogRecord,
  CallReferences,
  CallTargetRecord,
  CallTaskFormValues,
} from '../features/calls/types'
import { LeadQuickActionModal } from '../features/leads/LeadQuickActionModal'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyReferences: CallReferences = {
  leads: [],
  parents: [],
  profiles: [],
  programs: [],
  sources: [],
}

export function CallsPage() {
  usePageTitle('Arama Listesi')

  const { isAdmin, isSales, user } = useAuth()
  const authContext = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )

  const [filters, setFilters] = useState<CallFiltersState>({
    ...emptyCallFilters,
  })
  const [references, setReferences] = useState<CallReferences>(emptyReferences)
  const [targets, setTargets] = useState<CallTargetRecord[]>([])
  const [selectedTarget, setSelectedTarget] = useState<CallTargetRecord | null>(
    null,
  )
  const [editingLog, setEditingLog] = useState<CallLogRecord | null>(null)
  const [taskTarget, setTaskTarget] = useState<CallTargetRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReferences = useCallback(async () => {
    const result = await fetchCallReferences(authContext)

    if (result.error) {
      setError(result.error)
      return
    }

    setReferences(result.data ?? emptyReferences)
  }, [authContext])

  const loadTargets = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchCallTargets(filters, authContext)

    if (result.error) {
      setError(result.error)
      setTargets([])
      setLoading(false)
      return
    }

    setTargets(result.data ?? [])
    setLoading(false)
  }, [authContext, filters])

  useEffect(() => {
    void loadReferences()
  }, [loadReferences])

  useEffect(() => {
    void loadTargets()
  }, [loadTargets])

  function openCreateForm(target: CallTargetRecord | null = null) {
    setSelectedTarget(target)
    setEditingLog(null)
    setIsFormOpen(true)
  }

  function openEditForm(log: CallLogRecord) {
    setSelectedTarget(null)
    setEditingLog(log)
    setIsFormOpen(true)
  }

  async function handleSaveCallLog(
    values: CallLogFormValues,
    log?: CallLogRecord | null,
  ) {
    setSaving(true)
    const result = await saveCallLog(values, authContext, log)
    setSaving(false)

    if (result.error) {
      return result
    }

    await Promise.all([loadReferences(), loadTargets()])

    return result
  }

  async function handleCreateTask(values: CallTaskFormValues) {
    if (!taskTarget) {
      return {
        success: false,
        error: 'Görev için lead seçilemedi.',
      }
    }

    setSaving(true)
    const result = await createTaskForLead(taskTarget, values, authContext)
    setSaving(false)

    if (result.error) {
      return {
        success: false,
        error: result.error,
      }
    }

    return { success: true }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Arama Listesi
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {isAdmin
              ? 'Tüm arama kayıtlarını ve lead takiplerini görüntülüyorsunuz.'
              : 'Size atanmış leadlerin arama takiplerini görüntülüyorsunuz.'}
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadTargets()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Yenile
          </button>
          <button
            type="button"
            onClick={() => openCreateForm()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Arama Kaydı Ekle
          </button>
        </div>
      </div>

      <CallFilters
        filters={filters}
        isAdmin={isAdmin}
        profiles={references.profiles}
        programs={references.programs}
        sources={references.sources}
        onChange={setFilters}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Arama listesi yükleniyor...
        </div>
      ) : targets.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Aranacak kayıt bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni arama kaydı ekleyin.
          </p>
        </div>
      ) : (
        <>
          <CallLogsTable
            authUserId={user?.id ?? null}
            isAdmin={isAdmin}
            targets={targets}
            onAddCall={openCreateForm}
            onCreateTask={setTaskTarget}
            onEditLog={openEditForm}
          />
          <section className="space-y-3 lg:hidden">
            {targets.map((target) => (
              <CallLogCard
                key={target.id}
                target={target}
                onAddCall={openCreateForm}
              />
            ))}
          </section>
        </>
      )}

      <CallLogForm
        authUserId={user?.id ?? null}
        editingLog={editingLog}
        initialLead={selectedTarget}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveCallLog}
      />

      <LeadQuickActionModal
        action={taskTarget ? { lead: taskTarget, type: 'task' } : null}
        saving={saving}
        onClose={() => setTaskTarget(null)}
        onCreateCallLog={async () => ({
          success: false,
          error: 'Bu ekranda arama kaydı formunu kullanın.',
        })}
        onCreateTask={handleCreateTask}
      />
    </div>
  )
}
