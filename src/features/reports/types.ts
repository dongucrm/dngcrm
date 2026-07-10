import type {
  AppRole,
  CallStatus,
  DatabaseId,
  LeadPriority,
  PaymentInstallmentStatus,
  PaymentStatus,
  ProgramType,
  TaskStatus,
} from '../../types/database'

export type ReportDatePreset =
  | 'today'
  | 'yesterday'
  | 'this_week'
  | 'this_month'
  | 'last_30_days'
  | 'this_year'
  | 'custom'

export type ReportDateRange = {
  end: string
  preset: ReportDatePreset
  start: string
}

export type ReportFilters = ReportDateRange & {
  installmentStatus: PaymentInstallmentStatus | 'all'
  onlyDueToday: boolean
  onlyOverdue: boolean
  paymentStatus: PaymentStatus | 'all'
  programActive: 'active' | 'all' | 'passive'
  programId: DatabaseId | 'all'
  programType: ProgramType | 'all'
}

export type ReportAuthContext = {
  isAdmin: boolean
  isSales: boolean
  roleName?: AppRole | string | null
  userId: DatabaseId | null
}

export type ReportSummary = {
  cancelledRegistrations: number
  confirmedRegistrations: number
  dueTodayCalls: number
  dueTodayTasks: number
  overdueCalls: number
  overduePaymentAmount: number
  overdueTasks: number
  preRegistrations: number
  remainingPaymentAmount: number
  totalCollected: number
  totalLeads: number
  totalParents: number
  totalRegistrations: number
  totalStudents: number
  totalWhatsAppOpens: number
}

export type ProgramReportRow = {
  cancelledRegistrations: number
  collectedAmount: number
  confirmedRegistrations: number
  expectedRevenue: number
  fillRate: number
  leadCount: number
  preRegistrations: number
  programId: DatabaseId
  programName: string
  programType: ProgramType | string
  quota: number | null
  remainingAmount: number
}

export type SalesPerformanceReportRow = {
  assignedLeadCount: number
  calledLeadCount: number
  completedTaskCount: number
  conversionRate: number
  infoGivenCount: number
  profileId: DatabaseId
  profileName: string
  registeredLeadCount: number
  taskCount: number
  unreachableCount: number
  whatsAppOpenCount: number
}

export type LeadSourceReportRow = {
  confirmedRevenue: number
  conversionRate: number
  estimatedRevenue: number
  leadCount: number
  registeredLeadCount: number
  source: string
}

export type PaymentReportRow = {
  dueDate: string | null
  paidAmount: number
  parentName: string
  paymentId: DatabaseId
  programName: string
  remainingAmount: number
  status: PaymentStatus | null
  studentName: string
  totalAmount: number
  overdueAmount: number
}

export type InstallmentReportRow = {
  amount: number
  dueDate: string | null
  installmentId: DatabaseId
  installmentNo: number | null
  paidAmount: number
  parentName: string
  programName: string
  remainingAmount: number
  status: PaymentInstallmentStatus | null
  studentName: string
}

export type CallReportRow = {
  callDate: string | null
  callId: DatabaseId
  nextCallDate: string | null
  notes: string | null
  personName: string
  phone: string
  status: CallStatus | null
  userName: string
}

export type CallReportSummary = {
  infoGivenCount: number
  registeredCount: number
  repeatCount: number
  totalCount: number
  unreachableCount: number
}

export type TaskReportRow = {
  assignedUserName: string
  dueDate: string | null
  personName: string
  priority: LeadPriority | null
  status: TaskStatus | null
  taskId: DatabaseId
  title: string
}

export type TaskReportSummary = {
  cancelledCount: number
  completedCount: number
  overdueCount: number
  pendingCount: number
  totalCount: number
}

export type WhatsAppReportRow = {
  entityType: string
  messagePreview: string
  openedAt: string | null
  phone: string
  templateTitle: string
  userName: string
  whatsAppLogId: DatabaseId
}

export type WhatsAppReportSummary = {
  mostActiveUser: string
  todayCount: number
  topTemplate: string
  totalCount: number
}

export type ReportChartPoint = {
  label: string
  value: number
  extra?: number
}

export type ReportChartsData = {
  leadSourceConversions: ReportChartPoint[]
  monthlyCollections: ReportChartPoint[]
  monthlyRegistrations: ReportChartPoint[]
  programRegistrations: ReportChartPoint[]
  taskStatusDistribution: ReportChartPoint[]
}

export type ReportsData = {
  callReport: {
    rows: CallReportRow[]
    summary: CallReportSummary
  }
  charts: ReportChartsData
  installmentRows: InstallmentReportRow[]
  leadSourceRows: LeadSourceReportRow[]
  paymentRows: PaymentReportRow[]
  programRows: ProgramReportRow[]
  salesRows: SalesPerformanceReportRow[]
  summary: ReportSummary
  taskReport: {
    rows: TaskReportRow[]
    summary: TaskReportSummary
  }
  whatsAppReport: {
    rows: WhatsAppReportRow[]
    summary: WhatsAppReportSummary
  }
}
