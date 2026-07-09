import {
  ExternalLink,
  GraduationCap,
  ListChecks,
  MessageCircle,
  Pencil,
  PlusCircle,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatNullableDateTime } from '../../../utils/date'
import { formatPhoneForDisplay } from '../../../utils/phone'
import { useWhatsAppMessage } from '../../whatsapp/providers/WhatsAppMessageContext'
import type { ParentRecord } from '../types'

type ParentsTableProps = {
  parents: ParentRecord[]
  onAddStudent: (parent: ParentRecord) => void
  onCreateTask: (parent: ParentRecord) => void
  onEdit: (parent: ParentRecord) => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function ParentsTable({
  onAddStudent,
  onCreateTask,
  onEdit,
  parents,
}: ParentsTableProps) {
  const { openWhatsAppMessage } = useWhatsAppMessage()

  return (
    <section className="hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead className="bg-neutral-50">
            <tr>
              {[
                'Veli adı',
                'Telefon',
                'Öğrenci',
                'Aktif kayıt',
                'Toplam ödeme',
                'Kalan ödeme',
                'Son görüşme',
                'İşlemler',
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-neutral-500 last:text-right"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {parents.map((parent) => {
              const firstStudent = parent.students?.[0]

              return (
                <tr key={parent.id} className="hover:bg-neutral-50">
                  <td className="px-4 py-4 align-top">
                    <p className="font-semibold text-neutral-950">
                      {parent.full_name}
                    </p>
                    <p className="mt-1 text-xs text-neutral-500">
                      {parent.email || '-'}
                    </p>
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatPhoneForDisplay(parent.phone)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {parent.student_count}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {parent.active_registration_count}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatCurrency(parent.total_payment_amount)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatCurrency(parent.remaining_payment_amount)}
                  </td>
                  <td className="px-4 py-4 align-top text-sm text-neutral-700">
                    {formatNullableDateTime(parent.last_contact_date)}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/parents/${parent.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ExternalLink
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Detay
                      </Link>
                      <button
                        type="button"
                        onClick={() => onEdit(parent)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          openWhatsAppMessage({
                            defaultCategory: 'veli',
                            entityId: parent.id,
                            entityType: 'parent',
                            name: parent.full_name,
                            phone: parent.phone,
                            variables: {
                              ogrenci_adi: firstStudent?.full_name,
                              ogrenci_yasi: firstStudent?.age,
                              veli_adi: parent.full_name,
                              veli_telefonu: parent.phone,
                            },
                          })
                        }
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-emerald-200 bg-white px-2.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 aria-disabled:pointer-events-none aria-disabled:opacity-50"
                      >
                        <MessageCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        WhatsApp
                      </button>
                      <button
                        type="button"
                        onClick={() => onAddStudent(parent)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <GraduationCap
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Öğrenci
                      </button>
                      <button
                        type="button"
                        onClick={() => onCreateTask(parent)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <ListChecks
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Görev
                      </button>
                      <Link
                        to={`/parents/${parent.id}`}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                      >
                        <PlusCircle
                          className="h-3.5 w-3.5"
                          aria-hidden="true"
                        />
                        Kayıt
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
