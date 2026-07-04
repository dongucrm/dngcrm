import type { LeadPriority, LeadStatus } from '../../types/database'
import { cn } from '../../utils/cn'
import { leadPriorityLabels, leadStatusLabels } from '../../utils/labels'

const statusTone: Partial<Record<LeadStatus, string>> = {
  yeni_lead: 'bg-sky-50 text-sky-700',
  aranacak: 'bg-amber-50 text-amber-700',
  arandi: 'bg-blue-50 text-blue-700',
  ulasilamadi: 'bg-neutral-100 text-neutral-700',
  bilgi_verildi: 'bg-indigo-50 text-indigo-700',
  deneme_dersine_davet: 'bg-violet-50 text-violet-700',
  deneme_dersine_katildi: 'bg-purple-50 text-purple-700',
  kayit_dusunuyor: 'bg-cyan-50 text-cyan-700',
  odeme_bekleniyor: 'bg-orange-50 text-orange-700',
  kayit_oldu: 'bg-emerald-50 text-emerald-700',
  vazgecti: 'bg-red-50 text-red-700',
}

const priorityTone: Record<LeadPriority, string> = {
  dusuk: 'bg-neutral-100 text-neutral-700',
  orta: 'bg-amber-50 text-amber-700',
  yuksek: 'bg-red-50 text-red-700',
}

export function LeadStatusBadge({ status }: { status: LeadStatus | null }) {
  if (!status) {
    return <span className="text-sm text-neutral-400">-</span>
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-semibold',
        statusTone[status] ?? 'bg-neutral-100 text-neutral-700',
      )}
    >
      {leadStatusLabels[status] ?? status}
    </span>
  )
}

export function LeadPriorityBadge({
  priority,
}: {
  priority: LeadPriority | null
}) {
  if (!priority) {
    return <span className="text-sm text-neutral-400">-</span>
  }

  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-lg px-2.5 py-1 text-xs font-semibold',
        priorityTone[priority],
      )}
    >
      {leadPriorityLabels[priority]}
    </span>
  )
}
