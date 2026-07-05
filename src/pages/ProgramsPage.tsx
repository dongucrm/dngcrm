import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { ProgramCards } from '../features/programs/components/ProgramCards'
import { ProgramFilters } from '../features/programs/components/ProgramFilters'
import { ProgramForm } from '../features/programs/components/ProgramForm'
import { ProgramsTable } from '../features/programs/components/ProgramsTable'
import { emptyProgramFilters } from '../features/programs/constants'
import {
  fetchPrograms,
  saveProgram,
  toggleProgramActive,
} from '../features/programs/services/programService'
import type {
  ProgramFiltersState,
  ProgramFormValues,
  ProgramRecord,
} from '../features/programs/types'
import { usePageTitle } from '../hooks/usePageTitle'

export function ProgramsPage() {
  usePageTitle('Programlar')

  const [filters, setFilters] = useState<ProgramFiltersState>({
    ...emptyProgramFilters,
  })
  const [programs, setPrograms] = useState<ProgramRecord[]>([])
  const [selectedProgram, setSelectedProgram] = useState<ProgramRecord | null>(
    null,
  )
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadPrograms = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchPrograms(filters)

    if (result.error) {
      setPrograms([])
      setError(result.error)
      setLoading(false)
      return
    }

    setPrograms(result.data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    void loadPrograms()
  }, [loadPrograms])

  function openCreateModal() {
    setSelectedProgram(null)
    setIsFormOpen(true)
  }

  function openEditModal(program: ProgramRecord) {
    setSelectedProgram(program)
    setIsFormOpen(true)
  }

  async function handleSaveProgram(
    values: ProgramFormValues,
    editingProgram?: ProgramRecord | null,
  ) {
    setSaving(true)
    const result = await saveProgram(values, editingProgram)
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadPrograms()
    return result
  }

  async function handleToggleActive(program: ProgramRecord) {
    setSaving(true)
    const result = await toggleProgramActive(program)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadPrograms()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Programlar
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Kurs, kamp ve atölyeleri yönetin; kontenjan ve kayıt doluluğunu takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadPrograms()}
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
            Yeni Program
          </button>
        </div>
      </div>

      <ProgramFilters
        filters={filters}
        onChange={setFilters}
        onReset={() => setFilters({ ...emptyProgramFilters })}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Program listesi yükleniyor...
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Program bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni program oluşturun.
          </p>
        </div>
      ) : (
        <>
          <ProgramsTable
            programs={programs}
            onEdit={openEditModal}
            onToggleActive={(program) => void handleToggleActive(program)}
          />
          <ProgramCards
            programs={programs}
            onEdit={openEditModal}
            onToggleActive={(program) => void handleToggleActive(program)}
          />
        </>
      )}

      <ProgramForm
        editingProgram={selectedProgram}
        isOpen={isFormOpen}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveProgram}
      />
    </div>
  )
}
