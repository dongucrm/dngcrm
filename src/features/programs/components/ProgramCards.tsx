import { Eye, Power, UserPen } from 'lucide-react'
import { Link } from 'react-router-dom'
import { programTypeLabels } from '../../../utils/labels'
import type { ProgramRecord } from '../types'

type ProgramCardsProps = {
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

export function ProgramCards({
  onEdit,
  onToggleActive,
  programs,
}: ProgramCardsProps) {
  return (
    <div className="grid gap-3 lg:hidden">
      {programs.map((program) => (
        <article
          key={program.id}
          className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-neutral-950">{program.name}</p>
              <p className="mt-1 text-sm text-neutral-500">
                {programTypeLabels[program.type]} · {formatCurrency(program.price)}
              </p>
            </div>
            <span
              className={
                program.is_active
                  ? 'rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'
                  : 'rounded-lg bg-neutral-100 px-2 py-1 text-xs font-semibold text-neutral-600'
              }
            >
              {program.is_active ? 'Aktif' : 'Pasif'}
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Kontenjan</p>
              <p className="mt-1 font-semibold text-neutral-950">
                {program.registeredCount}/{program.quota ?? '-'}
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Doluluk</p>
              <p className="mt-1 font-semibold text-neutral-950">
                {Math.round(program.fillRate)}%
              </p>
            </div>
            <div className="rounded-lg bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Tarih</p>
              <p className="mt-1 font-semibold text-neutral-950">
                {program.start_date ?? '-'}
              </p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              to={`/programs/${program.id}`}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Detay
            </Link>
            <button
              type="button"
              onClick={() => onEdit(program)}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-200 text-sm font-semibold text-neutral-700"
            >
              <UserPen className="h-4 w-4" aria-hidden="true" />
              Düzenle
            </button>
            <button
              type="button"
              onClick={() => onToggleActive(program)}
              className="inline-flex h-9 w-10 items-center justify-center rounded-lg border border-neutral-200 text-neutral-700"
              aria-label="Aktif pasif"
            >
              <Power className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}
