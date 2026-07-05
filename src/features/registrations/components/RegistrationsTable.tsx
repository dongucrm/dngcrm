import { Eye, MessageCircle, UserPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { registrationStatusLabels } from '../../../utils/labels'
import { getWhatsAppUrl } from '../../../utils/phone'
import {
  getRegistrationParent,
  getRegistrationProgram,
  getRegistrationStudent,
} from '../services/registrationService'
import type { RegistrationRecord } from '../types'

type RegistrationsTableProps = {
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

export function RegistrationsTable({
  onEdit,
  registrations,
}: RegistrationsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Veli</th>
            <th className="px-4 py-3">Öğrenci</th>
            <th className="px-4 py-3">Program</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3">Tarih</th>
            <th className="px-4 py-3">Net fiyat</th>
            <th className="px-4 py-3">Kalan ödeme</th>
            <th className="px-4 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {registrations.map((registration) => {
            const parent = getRegistrationParent(registration)
            const student = getRegistrationStudent(registration)
            const program = getRegistrationProgram(registration)
            const whatsappUrl = getWhatsAppUrl(parent?.phone ?? '')

            return (
              <tr key={registration.id} className="hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-neutral-950">
                    {parent?.full_name ?? '-'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {parent?.phone ?? '-'}
                  </p>
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {student?.full_name ?? '-'}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {program?.name ?? '-'}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-700">
                    {registration.status
                      ? registrationStatusLabels[registration.status]
                      : '-'}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {registration.registration_date ?? '-'}
                </td>
                <td className="px-4 py-3 font-medium text-neutral-900">
                  {formatCurrency(registration.final_price)}
                </td>
                <td className="px-4 py-3 text-neutral-700">
                  {formatCurrency(registration.remaining_amount)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link
                      to={`/registrations/${registration.id}`}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                      aria-label="Detay"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => onEdit(registration)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                      aria-label="Düzenle"
                    >
                      <UserPen className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <a
                      href={whatsappUrl ?? undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!whatsappUrl}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-200 text-emerald-700 hover:bg-white aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      aria-label="WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    </a>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
