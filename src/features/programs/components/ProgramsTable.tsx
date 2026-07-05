import { Eye, Power, UserPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { programTypeLabels } from '../../../utils/labels'
import type { ProgramRecord } from '../types'

type ProgramsTableProps = {
  programs: ProgramRecord[]
  onEdit: (program: ProgramRecord) => void
  onToggleActive: (program: ProgramRecord) => void
}

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(Number(value ?? 0))
}

function formatFillRate(value: number) {
  return `${Math.round(value)}%`
}

export function ProgramsTable({
  onEdit,
  onToggleActive,
  programs,
}: ProgramsTableProps) {
  return (
    <div className="hidden overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm lg:block">
      <table className="min-w-full divide-y divide-neutral-200 text-sm">
        <thead className="bg-neutral-50 text-left text-xs font-semibold uppercase text-neutral-500">
          <tr>
            <th className="px-4 py-3">Program</th>
            <th className="px-4 py-3">Tip</th>
            <th className="px-4 py-3">Tarih</th>
            <th className="px-4 py-3">Kontenjan</th>
            <th className="px-4 py-3">Doluluk</th>
            <th className="px-4 py-3">Fiyat</th>
            <th className="px-4 py-3">Durum</th>
            <th className="px-4 py-3 text-right">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {programs.map((program) => (
            <tr key={program.id} className="hover:bg-neutral-50">
              <td className="px-4 py-3">
                <p className="font-semibold text-neutral-950">{program.name}</p>
                <p className="mt-1 max-w-xs truncate text-xs text-neutral-500">
                  {program.description || '-'}
                </p>
              </td>
              <td className="px-4 py-3 text-neutral-700">
                {programTypeLabels[program.type]}
              </td>
              <td className="px-4 py-3 text-neutral-600">
                {program.start_date ?? '-'} / {program.end_date ?? '-'}
              </td>
              <td className="px-4 py-3 text-neutral-700">
                {program.registeredCount} / {program.quota ?? '-'}
              </td>
              <td className="px-4 py-3">
                <div className="h-2 w-24 rounded-full bg-neutral-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500"
                    style={{ width: `${Math.min(program.fillRate, 100)}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  {formatFillRate(program.fillRate)}
                </p>
              </td>
              <td className="px-4 py-3 font-medium text-neutral-900">
                {formatCurrency(program.price)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={
                    program.is_active
                      ? 'rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'
                      : 'rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600'
                  }
                >
                  {program.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <Link
                    to={`/programs/${program.id}`}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                    aria-label="Detay"
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onEdit(program)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                    aria-label="Düzenle"
                  >
                    <UserPen className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleActive(program)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700 hover:bg-white"
                    aria-label="Aktif pasif"
                  >
                    <Power className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
