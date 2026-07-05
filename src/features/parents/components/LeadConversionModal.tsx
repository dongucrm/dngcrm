import { X } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import type { LeadStatus, Program } from '../../../types/database'
import type { LeadRecord } from '../../leads/types'

type LeadConversionValues = {
  createRegistration: boolean
  programId: string
  leadStatus: Extract<LeadStatus, 'kayit_oldu' | 'odeme_bekleniyor'>
}

type LeadConversionModalProps = {
  isOpen: boolean
  lead: LeadRecord
  programs: Pick<Program, 'id' | 'name' | 'type' | 'is_active'>[]
  saving: boolean
  onClose: () => void
  onSubmit: (values: LeadConversionValues) => Promise<{ error?: string }>
}

export function LeadConversionModal({
  isOpen,
  lead,
  onClose,
  onSubmit,
  programs,
  saving,
}: LeadConversionModalProps) {
  const [createRegistration, setCreateRegistration] = useState(true)
  const [programId, setProgramId] = useState('')
  const [leadStatus, setLeadStatus] =
    useState<LeadConversionValues['leadStatus']>('odeme_bekleniyor')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setCreateRegistration(Boolean(lead.interested_program_id))
      setProgramId(lead.interested_program_id ?? '')
      setLeadStatus('odeme_bekleniyor')
      setFormError(null)
    }
  }, [isOpen, lead.interested_program_id])

  if (!isOpen) {
    return null
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    if (createRegistration && !programId) {
      setFormError('Kayıt oluşturmak için program seçmelisiniz.')
      return
    }

    const result = await onSubmit({
      createRegistration,
      leadStatus,
      programId,
    })

    if (result.error) {
      setFormError(result.error)
      return
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-neutral-950/40 px-4 py-6">
      <section className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white shadow-lg">
        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-5 py-4">
          <div>
            <p className="text-sm font-medium text-emerald-700">
              Lead Dönüşümü
            </p>
            <h2 className="text-lg font-semibold text-neutral-950">
              Veli ve Öğrenciye Dönüştür
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
          <div className="space-y-4 px-5 py-5">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3">
              <p className="text-sm font-semibold text-neutral-950">
                {lead.full_name}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                {lead.phone} · {lead.child_name || 'Çocuk adı yok'}
              </p>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={createRegistration}
                onChange={(event) => setCreateRegistration(event.target.checked)}
                className="h-4 w-4 rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-neutral-700">
                Program kaydı da oluştur
              </span>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Program
              </span>
              <select
                value={programId}
                disabled={!createRegistration}
                onChange={(event) => setProgramId(event.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-neutral-50 disabled:text-neutral-500"
              >
                <option value="">Program seçin</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-neutral-700">
                Lead durumu
              </span>
              <select
                value={leadStatus}
                onChange={(event) =>
                  setLeadStatus(
                    event.target
                      .value as LeadConversionValues['leadStatus'],
                  )
                }
                className="mt-2 h-10 w-full rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                <option value="odeme_bekleniyor">Ödeme Bekleniyor</option>
                <option value="kayit_oldu">Kayıt Oldu</option>
              </select>
            </label>

            {formError ? (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {formError}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 border-t border-neutral-200 px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
            >
              {saving ? 'Dönüştürülüyor...' : 'Dönüştür'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
