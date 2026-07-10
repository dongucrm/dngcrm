import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { CallReport } from '../features/reports/components/CallReport'
import { InstallmentReport } from '../features/reports/components/InstallmentReport'
import { LeadSourceReport } from '../features/reports/components/LeadSourceReport'
import { PaymentReport } from '../features/reports/components/PaymentReport'
import { ProgramReport } from '../features/reports/components/ProgramReport'
import { ReportDateFilter } from '../features/reports/components/ReportDateFilter'
import { ReportSummaryCards } from '../features/reports/components/ReportSummaryCards'
import { SalesPerformanceReport } from '../features/reports/components/SalesPerformanceReport'
import { TaskReport } from '../features/reports/components/TaskReport'
import { WhatsAppReport } from '../features/reports/components/WhatsAppReport'
import { getDefaultReportFilters } from '../features/reports/constants'
import { fetchReportsData } from '../features/reports/services/reportService'
import type {
  CallReportRow,
  InstallmentReportRow,
  LeadSourceReportRow,
  PaymentReportRow,
  ProgramReportRow,
  ReportsData,
  SalesPerformanceReportRow,
  TaskReportRow,
  WhatsAppReportRow,
} from '../features/reports/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'
import { exportCsv } from '../utils/exportCsv'
import { exportExcel } from '../utils/exportExcel'
import { formatDate, formatNullableDateTime, getDateRangeForPreset } from '../utils/date'

const ReportCharts = lazy(() => import('../features/reports/components/ReportCharts'))

type ExportRow = Record<string, string | number | null | undefined>

function formatCurrency(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    currency: 'TRY',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function getFilename(slug: string, start: string, end: string) {
  return `dongu-crm-${slug}-${start}-${end}`
}

function programExportRows(rows: ProgramReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Beklenen gelir': formatCurrency(row.expectedRevenue),
    'Doluluk orani': `${row.fillRate}%`,
    'Iptal kayit': row.cancelledRegistrations,
    'Kalan odeme': formatCurrency(row.remainingAmount),
    'Kesin kayit': row.confirmedRegistrations,
    Kontenjan: row.quota ?? '',
    'Lead sayisi': row.leadCount,
    'On kayit': row.preRegistrations,
    'Program adi': row.programName,
    'Program turu': row.programType,
    'Tahsil edilen': formatCurrency(row.collectedAmount),
  }))
}

function salesExportRows(rows: SalesPerformanceReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Aranan lead': row.calledLeadCount,
    'Atanan lead': row.assignedLeadCount,
    'Bilgi verilen': row.infoGivenCount,
    'Donusum orani': `${row.conversionRate}%`,
    'Kayit olan': row.registeredLeadCount,
    'Olusturulan gorev': row.taskCount,
    Personel: row.profileName,
    'Tamamlanan gorev': row.completedTaskCount,
    'Ulasilamayan': row.unreachableCount,
    WhatsApp: row.whatsAppOpenCount,
  }))
}

function leadSourceExportRows(rows: LeadSourceReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Donusum orani': `${row.conversionRate}%`,
    'Kayit olan': row.registeredLeadCount,
    Kaynak: row.source,
    'Kesinlesen gelir': formatCurrency(row.confirmedRevenue),
    'Lead sayisi': row.leadCount,
    'Tahmini gelir': formatCurrency(row.estimatedRevenue),
  }))
}

function paymentExportRows(rows: PaymentReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'En yakin vade': formatDate(row.dueDate),
    'Geciken tutar': formatCurrency(row.overdueAmount),
    'Kalan tutar': formatCurrency(row.remainingAmount),
    'Odenen tutar': formatCurrency(row.paidAmount),
    'Odeme durumu': row.status ?? '',
    'Ogrenci adi': row.studentName,
    'Program adi': row.programName,
    'Toplam tutar': formatCurrency(row.totalAmount),
    'Veli adi': row.parentName,
  }))
}

function installmentExportRows(rows: InstallmentReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    Durum: row.status ?? '',
    'Kalan tutar': formatCurrency(row.remainingAmount),
    Odenen: formatCurrency(row.paidAmount),
    'Ogrenci adi': row.studentName,
    'Program adi': row.programName,
    'Taksit no': row.installmentNo ?? '',
    'Taksit tutari': formatCurrency(row.amount),
    'Vade tarihi': formatDate(row.dueDate),
    'Veli adi': row.parentName,
  }))
}

function callExportRows(rows: CallReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Arama durumu': row.status ?? '',
    'Arayan personel': row.userName,
    'Lead / veli adi': row.personName,
    Not: row.notes ?? '',
    'Sonraki arama tarihi': formatNullableDateTime(row.nextCallDate),
    Tarih: formatNullableDateTime(row.callDate),
    Telefon: row.phone,
  }))
}

function taskExportRows(rows: TaskReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Atanan personel': row.assignedUserName,
    Durum: row.status ?? '',
    'Gorev basligi': row.title,
    'Ilgili kisi': row.personName,
    Oncelik: row.priority ?? '',
    'Son tarih': formatNullableDateTime(row.dueDate),
  }))
}

function whatsAppExportRows(rows: WhatsAppReportRow[]): ExportRow[] {
  return rows.map((row) => ({
    'Entity type': row.entityType,
    Kullanici: row.userName,
    'Mesaj kisa onizleme': row.messagePreview,
    'Sablon adi': row.templateTitle,
    Tarih: formatNullableDateTime(row.openedAt),
    Telefon: row.phone,
  }))
}

export function ReportsPage() {
  usePageTitle('Raporlar')

  const { isAdmin, isSales, roleName, user } = useAuth()
  const [filters, setFilters] = useState(getDefaultReportFilters)
  const [data, setData] = useState<ReportsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const auth = useMemo(
    () => ({
      isAdmin,
      isSales,
      roleName,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, roleName, user?.id],
  )
  const canExport = isAdmin

  useEffect(() => {
    if (filters.preset === 'custom') {
      return
    }

    const range = getDateRangeForPreset(filters.preset, filters.start, filters.end)

    setFilters((currentFilters) =>
      currentFilters.start === range.start && currentFilters.end === range.end
        ? currentFilters
        : {
            ...currentFilters,
            ...range,
          },
    )
  }, [filters.end, filters.preset, filters.start])

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError(null)

    const result = await fetchReportsData(filters, auth)

    if (result.error) {
      setData(null)
      setError(result.error)
      setLoading(false)
      return
    }

    setData(result.data ?? null)
    setLoading(false)
  }, [auth, filters])

  useEffect(() => {
    void loadReports()
  }, [loadReports])

  function runExport(slug: string, rows: ExportRow[], type: 'csv' | 'excel') {
    if (!canExport) {
      return
    }

    const filename = getFilename(slug, filters.start, filters.end)

    if (type === 'csv') {
      exportCsv(filename, rows)
      return
    }

    void exportExcel(filename, rows)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Raporlar
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-neutral-500">
          Satış, kayıt, ödeme, arama, görev ve WhatsApp performansını tek
          ekrandan analiz edin.
        </p>
      </div>

      <ReportDateFilter
        filters={filters}
        loading={loading}
        programOptions={data?.programRows ?? []}
        onChange={setFilters}
        onRefresh={() => void loadReports()}
      />

      {!canExport ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
          Satış personeli raporları görüntüleyebilir; dışa aktarma sadece admin
          yetkisindedir.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Rapor verileri yükleniyor...
        </div>
      ) : data ? (
        <>
          <ReportSummaryCards summary={data.summary} />
          <Suspense
            fallback={
              <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
                Grafikler yukleniyor...
              </div>
            }
          >
            <ReportCharts charts={data.charts} />
          </Suspense>
          <ProgramReport
            canExport={canExport}
            rows={data.programRows}
            onExportCsv={() => runExport('program-raporu', programExportRows(data.programRows), 'csv')}
            onExportExcel={() =>
              runExport('program-raporu', programExportRows(data.programRows), 'excel')
            }
          />
          <SalesPerformanceReport
            canExport={canExport}
            rows={data.salesRows}
            onExportCsv={() =>
              runExport('satis-performansi', salesExportRows(data.salesRows), 'csv')
            }
            onExportExcel={() =>
              runExport('satis-performansi', salesExportRows(data.salesRows), 'excel')
            }
          />
          <LeadSourceReport
            canExport={canExport}
            rows={data.leadSourceRows}
            onExportCsv={() =>
              runExport('lead-kaynak-raporu', leadSourceExportRows(data.leadSourceRows), 'csv')
            }
            onExportExcel={() =>
              runExport(
                'lead-kaynak-raporu',
                leadSourceExportRows(data.leadSourceRows),
                'excel',
              )
            }
          />
          <PaymentReport
            canExport={canExport}
            rows={data.paymentRows}
            onExportCsv={() => runExport('odeme-raporu', paymentExportRows(data.paymentRows), 'csv')}
            onExportExcel={() =>
              runExport('odeme-raporu', paymentExportRows(data.paymentRows), 'excel')
            }
          />
          <InstallmentReport
            canExport={canExport}
            rows={data.installmentRows}
            onExportCsv={() =>
              runExport('taksit-raporu', installmentExportRows(data.installmentRows), 'csv')
            }
            onExportExcel={() =>
              runExport('taksit-raporu', installmentExportRows(data.installmentRows), 'excel')
            }
          />
          <CallReport
            canExport={canExport}
            rows={data.callReport.rows}
            summary={data.callReport.summary}
            onExportCsv={() => runExport('arama-raporu', callExportRows(data.callReport.rows), 'csv')}
            onExportExcel={() =>
              runExport('arama-raporu', callExportRows(data.callReport.rows), 'excel')
            }
          />
          <TaskReport
            canExport={canExport}
            rows={data.taskReport.rows}
            summary={data.taskReport.summary}
            onExportCsv={() => runExport('gorev-raporu', taskExportRows(data.taskReport.rows), 'csv')}
            onExportExcel={() =>
              runExport('gorev-raporu', taskExportRows(data.taskReport.rows), 'excel')
            }
          />
          <WhatsAppReport
            canExport={canExport}
            rows={data.whatsAppReport.rows}
            summary={data.whatsAppReport.summary}
            onExportCsv={() =>
              runExport('whatsapp-raporu', whatsAppExportRows(data.whatsAppReport.rows), 'csv')
            }
            onExportExcel={() =>
              runExport(
                'whatsapp-raporu',
                whatsAppExportRows(data.whatsAppReport.rows),
                'excel',
              )
            }
          />
        </>
      ) : null}
    </div>
  )
}
