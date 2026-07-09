import { Eye, MessageCircle, UserPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registrationStatusLabels } from '../../../utils/labels'
import { useWhatsAppMessage } from '../../whatsapp/providers/WhatsAppMessageContext'
import {
  getRegistrationParent,
  getRegistrationProgram,
  getRegistrationStudent,
} from '../services/registrationService'
import type { RegistrationRecord } from '../types'

type RegistrationCardsProps = {
  registrations: RegistrationRecord[]
  onEdit: (registration: RegistrationRecord) => void
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
}

export function RegistrationCards({
  onEdit,
  registrations,
}: RegistrationCardsProps) {
  const { openWhatsAppMessage } = useWhatsAppMessage()

  return (
    <div className="grid gap-3 lg:hidden">
      {registrations.map((registration) => {
        const parent = getRegistrationParent(registration)
        const student = getRegistrationStudent(registration)
        const program = getRegistrationProgram(registration)

        return (
          <article
            key={registration.id}
            className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-neutral-950">
                  {parent?.full_name ?? '-'}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  {student?.full_name ?? '-'} · {program?.name ?? '-'}
                </p>
              </div>
              <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                {registration.status
                  ? registrationStatusLabels[registration.status]
                  : '-'}
              </span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Tarih</p>
                <p className="mt-1 font-semibold text-neutral-950">
                  {registration.registration_date ?? '-'}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Net</p>
                <p className="mt-1 font-semibold text-neutral-950">
                  {formatCurrency(registration.final_price)}
                </p>
              </div>
              <div className="rounded-lg bg-neutral-50 p-3">
                <p className="text-xs text-neutral-500">Kalan</p>
                <p className="mt-1 font-semibold text-neutral-950">
                  {formatCurrency(registration.remaining_amount)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/registrations/${registration.id}`}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700"
              >
                <Eye className="h-4 w-4" aria-hidden="true" />
                Detay
              </Link>
              <button
                type="button"
                onClick={() => onEdit(registration)}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700"
              >
                <UserPen className="h-4 w-4" aria-hidden="true" />
                Düzenle
              </button>
              <button
                type="button"
                onClick={() =>
                  parent &&
                  openWhatsAppMessage({
                    defaultCategory: 'kayit',
                    entityId: registration.id,
                    entityType: 'registration',
                    name: parent.full_name,
                    phone: parent.phone,
                    variables: {
                      kalan_odeme: formatCurrency(
                        registration.remaining_amount,
                      ),
                      kayit_durumu: registration.status
                        ? registrationStatusLabels[registration.status]
                        : '',
                      kayit_tarihi: registration.registration_date,
                      net_fiyat: formatCurrency(registration.final_price),
                      ogrenci_adi: student?.full_name,
                      program_adi: program?.name,
                      veli_adi: parent.full_name,
                    },
                  })
                }
                disabled={!parent?.phone}
                className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}
