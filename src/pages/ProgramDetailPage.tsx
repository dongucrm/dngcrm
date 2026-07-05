import { ArrowLeft, Power, UserPen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { NotesSection } from '../features/notes/components/NotesSection'
import { ProgramForm } from '../features/programs/components/ProgramForm'
import {
  fetchProgramDetail,
  saveProgram,
  toggleProgramActive,
} from '../features/programs/services/programService'
import type {
  ProgramFormValues,
  ProgramRecord,
} from '../features/programs/types'
import { usePageTitle } from '../hooks/usePageTitle'
import { programTypeLabels, registrationStatusLabels } from '../utils/labels'

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function MetricCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-semibold text-neutral-950">{value}</p>
    </div>
  )
}

export function ProgramDetailPage() {
  const { programId } = useParams()
  const [program, setProgram] = useState<ProgramRecord | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  usePageTitle(program ? `${program.name} Program Detayı` : 'Program Detayı')

  const loadProgram = useCallback(async () => {
    if (!programId) {
      return
    }

    setLoading(true)
    setError(null)

    const result = await fetchProgramDetail(programId)

    if (result.error) {
      setProgram(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setProgram(result.data ?? null)
    setLoading(false)
  }, [programId])

  useEffect(() => {
    void loadProgram()
  }, [loadProgram])

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

    await loadProgram()
    return result
  }

  async function handleToggleActive() {
    if (!program) {
      return
    }

    setSaving(true)
    const result = await toggleProgramActive(program)
    setSaving(false)

    if (result.error) {
      setError(result.error)
      return
    }

    await loadProgram()
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
        Program detayı yükleniyor...
      </div>
    )
  }

  if (error || !program) {
    return (
      <div className="space-y-4">
        <Link
          to="/programs"
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Program listesine dön
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {error ?? 'Program detayı bulunamadı.'}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/programs"
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Program listesine dön
          </Link>
          <p className="mt-5 text-sm font-medium text-emerald-700">
            Program Detayı
          </p>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
            {program.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            {programTypeLabels[program.type]} ·{' '}
            {program.is_active ? 'Aktif' : 'Pasif'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
          >
            <UserPen className="h-4 w-4" aria-hidden="true" />
            Düzenle
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleToggleActive()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
          >
            <Power className="h-4 w-4" aria-hidden="true" />
            {program.is_active ? 'Pasife Al' : 'Aktife Al'}
          </button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Kontenjan" value={program.quota ?? '-'} />
        <MetricCard label="Aktif kayıt" value={program.registeredCount} />
        <MetricCard
          label="Kalan kontenjan"
          value={program.remainingQuota ?? '-'}
        />
        <MetricCard label="Doluluk" value={`${Math.round(program.fillRate)}%`} />
        <MetricCard label="Ön kayıt" value={program.preRegistrationCount} />
        <MetricCard label="Kesin kayıt" value={program.confirmedCount} />
        <MetricCard label="İptal" value={program.cancelledCount} />
        <MetricCard label="Beklenen gelir" value={formatCurrency(program.expectedIncome)} />
        <MetricCard label="Tahsil edilen" value={formatCurrency(program.paidAmount)} />
        <MetricCard label="Kalan ödeme" value={formatCurrency(program.remainingAmount)} />
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">
          Program Bilgileri
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">
              Tarih
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              {program.start_date ?? '-'} / {program.end_date ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">
              Fiyat
            </p>
            <p className="mt-1 text-sm text-neutral-800">
              {formatCurrency(program.price)}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs font-semibold uppercase text-neutral-500">
              Açıklama
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-800">
              {program.description || '-'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            Kayıtlı Öğrenciler
          </h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {program.registrations && program.registrations.length > 0 ? (
              program.registrations.map((registration) => {
                const parent = normalizeRelation(registration.parent)
                const student = normalizeRelation(registration.student)

                return (
                  <Link
                    key={registration.id}
                    to={`/registrations/${registration.id}`}
                    className="block py-3 first:pt-0 last:pb-0 hover:bg-neutral-50"
                  >
                    <p className="text-sm font-semibold text-neutral-950">
                      {student?.full_name ?? 'Öğrenci yok'}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {parent?.full_name ?? 'Veli yok'} ·{' '}
                      {registration.status
                        ? registrationStatusLabels[registration.status]
                        : '-'}
                    </p>
                  </Link>
                )
              })
            ) : (
              <p className="text-sm text-neutral-500">Kayıt bulunmuyor.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-neutral-950">
            İlgilenen Leadler
          </h2>
          <div className="mt-4 divide-y divide-neutral-200">
            {program.leads && program.leads.length > 0 ? (
              program.leads.map((lead) => (
                <Link
                  key={lead.id}
                  to={`/leads/${lead.id}`}
                  className="block py-3 first:pt-0 last:pb-0 hover:bg-neutral-50"
                >
                  <p className="text-sm font-semibold text-neutral-950">
                    {lead.full_name}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {lead.phone} · {lead.child_name || 'Çocuk adı yok'}
                  </p>
                </Link>
              ))
            ) : (
              <p className="text-sm text-neutral-500">
                Bu programa bağlı lead bulunmuyor.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-neutral-950">Görevler</h2>
        <p className="mt-3 text-sm text-neutral-500">
          Program ilişkili görevler için görev modülünde veli veya lead bağlantısı kullanılabilir.
        </p>
      </section>

      <NotesSection entityId={program.id} entityType="program" />

      <ProgramForm
        editingProgram={program}
        isOpen={isFormOpen}
        saving={saving}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleSaveProgram}
      />
    </div>
  )
}
