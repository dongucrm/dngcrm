import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  MessageCircle,
  PhoneCall,
  UsersRound,
} from 'lucide-react'
import { StatCard } from '../../../components/StatCard'
import type { ReportSummary } from '../types'

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

export function ReportSummaryCards({ summary }: { summary: ReportSummary }) {
  const cards = [
    {
      detail: 'Secilen araliktaki toplam lead',
      icon: UsersRound,
      label: 'Toplam lead',
      value: String(summary.totalLeads),
    },
    {
      detail: 'Secilen araliktaki veli sayisi',
      icon: UsersRound,
      label: 'Toplam veli',
      value: String(summary.totalParents),
    },
    {
      detail: 'Secilen araliktaki ogrenci sayisi',
      icon: UsersRound,
      label: 'Toplam ogrenci',
      value: String(summary.totalStudents),
    },
    {
      detail: 'Secilen araliktaki kayit sayisi',
      icon: ClipboardList,
      label: 'Toplam kayit',
      value: String(summary.totalRegistrations),
    },
    {
      detail: 'Kesin kayit durumundaki kayitlar',
      icon: CheckCircle2,
      label: 'Kesin kayit',
      value: String(summary.confirmedRegistrations),
    },
    {
      detail: 'On kayit durumundaki kayitlar',
      icon: ClipboardList,
      label: 'On kayit',
      value: String(summary.preRegistrations),
    },
    {
      detail: 'Iptal durumundaki kayitlar',
      icon: AlertCircle,
      label: 'Iptal kayit',
      value: String(summary.cancelledRegistrations),
    },
    {
      detail: 'Secilen aralikta tahsil edilen tutar',
      icon: CreditCard,
      label: 'Toplam tahsilat',
      value: formatCurrency(summary.totalCollected),
    },
    {
      detail: 'Secilen aralikta kalan odeme tutari',
      icon: CreditCard,
      label: 'Kalan odeme',
      value: formatCurrency(summary.remainingPaymentAmount),
    },
    {
      detail: 'Vadesi gecmis odeme tutari',
      icon: AlertCircle,
      label: 'Geciken odeme',
      value: formatCurrency(summary.overduePaymentAmount),
    },
    {
      detail: 'Bugun son tarihli gorevler',
      icon: ClipboardList,
      label: 'Bugunku gorevler',
      value: String(summary.dueTodayTasks),
    },
    {
      detail: 'Son tarihi gecmis acik gorevler',
      icon: AlertCircle,
      label: 'Geciken gorevler',
      value: String(summary.overdueTasks),
    },
    {
      detail: 'Bugun takip edilen aramalar',
      icon: PhoneCall,
      label: 'Bugunku aramalar',
      value: String(summary.dueTodayCalls),
    },
    {
      detail: 'Sonraki arama tarihi gecmis kayitlar',
      icon: AlertCircle,
      label: 'Geciken aramalar',
      value: String(summary.overdueCalls),
    },
    {
      detail: 'WhatsApp ekraninin acilma sayisi',
      icon: MessageCircle,
      label: 'WhatsApp acma',
      value: String(summary.totalWhatsAppOpens),
    },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </section>
  )
}
