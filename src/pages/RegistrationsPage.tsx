import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { RegistrationCards } from '../features/registrations/components/RegistrationCards'
import { RegistrationFilters } from '../features/registrations/components/RegistrationFilters'
import { RegistrationForm } from '../features/registrations/components/RegistrationForm'
import { RegistrationsTable } from '../features/registrations/components/RegistrationsTable'
import { emptyRegistrationFilters } from '../features/registrations/constants'
import {
  fetchRegistrationReferences,
  fetchRegistrations,
  saveRegistration,
} from '../features/registrations/services/registrationService'
import type {
  RegistrationFiltersState,
  RegistrationFormValues,
  RegistrationRecord,
  RegistrationReferences,
  RegistrationSaveOptions,
} from '../features/registrations/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyReferences: RegistrationReferences = {
  parents: [],
  programs: [],
  students: [],
  whatsappTemplates: [],
}

export function RegistrationsPage() {
  usePageTitle('Kayıtlar')

  const { isAdmin, isSales, user } = useAuth()
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [filters, setFilters] = useState<RegistrationFiltersState>({
    ...emptyRegistrationFilters,
  })
  const [references, setReferences] =
    useState<RegistrationReferences>(emptyReferences)
  const [registrations, setRegistrations] = useState<RegistrationRecord[]>([])
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [referencesLoading, setReferencesLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadRegistrations = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchRegistrations(filters)

    if (result.error) {
      setRegistrations([])
      setError(result.error)
      setLoading(false)
      return
    }

    setRegistrations(result.data ?? [])
    setLoading(false)
  }, [filters])

  useEffect(() => {
    async function loadReferences() {
      setReferencesLoading(true)
      const result = await fetchRegistrationReferences()

      if (result.data) {
        setReferences(result.data)
      }

      if (result.error) {
        setError(result.error)
      }

      setReferencesLoading(false)
    }

    void loadReferences()
  }, [])

  useEffect(() => {
    void loadRegistrations()
  }, [loadRegistrations])

  function openCreateModal() {
    setSelectedRegistration(null)
    setIsFormOpen(true)
  }

  function openEditModal(registration: RegistrationRecord) {
    setSelectedRegistration(registration)
    setIsFormOpen(true)
  }

  async function handleSaveRegistration(
    values: RegistrationFormValues,
    editingRegistration?: RegistrationRecord | null,
    options?: RegistrationSaveOptions,
  ) {
    setSaving(true)
    const result = await saveRegistration(
      values,
      auth,
      editingRegistration,
      options,
    )
    setSaving(false)

    if (result.error) {
      return result
    }

    await loadRegistrations()
    return result
  }

  const isBusy = loading || referencesLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            Kayıtlar
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Veli, öğrenci ve program kayıtlarını takip edin.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => void loadRegistrations()}
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
            Yeni Kayıt
          </button>
        </div>
      </div>

      <RegistrationFilters
        filters={filters}
        references={references}
        onChange={setFilters}
        onReset={() => setFilters({ ...emptyRegistrationFilters })}
      />

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {isBusy ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Kayıt listesi yükleniyor...
        </div>
      ) : registrations.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-neutral-950">
            Kayıt bulunamadı
          </h2>
          <p className="mt-2 text-sm text-neutral-500">
            Filtreleri değiştirin veya yeni kayıt oluşturun.
          </p>
        </div>
      ) : (
        <>
          <RegistrationsTable
            registrations={registrations}
            onEdit={openEditModal}
          />
          <RegistrationCards
            registrations={registrations}
            onEdit={openEditModal}
          />
        </>
      )}

      <RegistrationForm
        editingRegistration={selectedRegistration}
        isAdmin={isAdmin}
        isOpen={isFormOpen}
        references={references}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveRegistration}
      />
    </div>
  )
}
