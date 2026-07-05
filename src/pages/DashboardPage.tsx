import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  PhoneCall,
  TrendingUp,
  UsersRound,
  UserX,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { fetchDashboardCallMetrics } from '../features/calls/services/callLogService'
import type { CallDashboardMetrics } from '../features/calls/types'
import { fetchParentDashboardMetrics } from '../features/parents/services/parentService'
import type { ParentDashboardMetrics } from '../features/parents/types'
import { fetchProgramDashboardMetrics } from '../features/programs/services/programService'
import type { ProgramDashboardMetrics } from '../features/programs/types'
import { TodayTasksWidget } from '../features/tasks/components/TodayTasksWidget'
import { fetchTaskDashboardMetrics } from '../features/tasks/services/taskService'
import type { TaskDashboardMetrics } from '../features/tasks/types'
import { useAuth } from '../hooks/useAuth'
import { usePageTitle } from '../hooks/usePageTitle'

const emptyMetrics: CallDashboardMetrics = {
  highProbabilityCount: 0,
  overdueCount: 0,
  todayCount: 0,
  unreachableCount: 0,
}

const emptyTaskMetrics: TaskDashboardMetrics = {
  completedCount: 0,
  highPriorityCount: 0,
  overdueCount: 0,
  pendingCount: 0,
  todayCount: 0,
}

const emptyParentMetrics: ParentDashboardMetrics = {
  activeStudents: 0,
  parentsThisMonth: 0,
  studentsThisMonth: 0,
  totalParents: 0,
  totalStudents: 0,
}

const emptyProgramMetrics: ProgramDashboardMetrics = {
  activePrograms: 0,
  cancelledRegistrations: 0,
  confirmedRegistrations: 0,
  highestFillProgram: null,
  preRegistrations: 0,
  programsNearCapacity: [],
  recentRegistrations: [],
  registrationsThisMonth: 0,
  totalPrograms: 0,
  totalRegistrations: 0,
}

function normalizeRelation<T>(value: T | T[] | null | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

export function DashboardPage() {
  usePageTitle('Dashboard')

  const { isAdmin, isSales, user } = useAuth()
  const authContext = useMemo(
    () => ({
      isAdmin,
      isSales,
      userId: user?.id ?? null,
    }),
    [isAdmin, isSales, user?.id],
  )
  const [metrics, setMetrics] = useState(emptyMetrics)
  const [taskMetrics, setTaskMetrics] = useState(emptyTaskMetrics)
  const [parentMetrics, setParentMetrics] = useState(emptyParentMetrics)
  const [programMetrics, setProgramMetrics] = useState(emptyProgramMetrics)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadMetrics() {
      setLoading(true)
      const [
        nextMetrics,
        nextTaskMetrics,
        nextParentMetrics,
        nextProgramMetrics,
      ] = await Promise.all([
        fetchDashboardCallMetrics(authContext),
        fetchTaskDashboardMetrics(authContext),
        fetchParentDashboardMetrics(),
        fetchProgramDashboardMetrics(),
      ])

      if (!isMounted) {
        return
      }

      setMetrics(nextMetrics)
      setTaskMetrics(nextTaskMetrics)
      setParentMetrics(nextParentMetrics)
      setProgramMetrics(nextProgramMetrics)
      setLoading(false)
    }

    void loadMetrics()

    return () => {
      isMounted = false
    }
  }, [authContext])

  const stats = [
    {
      detail: 'Bugün takip edilmesi gereken kişiler',
      icon: PhoneCall,
      label: 'Bugün aranacak',
      value: String(metrics.todayCount),
    },
    {
      detail: 'Planlanan tarihi geçmiş aramalar',
      icon: AlertCircle,
      label: 'Geciken aramalar',
      value: String(metrics.overdueCount),
    },
    {
      detail: 'Ulaşılamadı durumundaki leadler',
      icon: UserX,
      label: 'Ulaşılamayan lead',
      value: String(metrics.unreachableCount),
    },
    {
      detail: 'Kayıt ihtimali yüksek leadler',
      icon: TrendingUp,
      label: 'Yüksek ihtimal',
      value: String(metrics.highProbabilityCount),
    },
  ]

  const taskStats = [
    {
      detail: 'Bugün tamamlanması gereken görevler',
      icon: ClipboardList,
      label: 'Bugünkü görevler',
      value: String(taskMetrics.todayCount),
    },
    {
      detail: 'Son tarihi geçmiş açık görevler',
      icon: AlertCircle,
      label: 'Geciken görevler',
      value: String(taskMetrics.overdueCount),
    },
    {
      detail: 'Bekliyor durumundaki görevler',
      icon: PhoneCall,
      label: 'Bekleyen görevler',
      value: String(taskMetrics.pendingCount),
    },
    {
      detail: 'Tamamlandı durumundaki görevler',
      icon: CheckCircle2,
      label: 'Tamamlanan görevler',
      value: String(taskMetrics.completedCount),
    },
    {
      detail: 'Yüksek öncelikli görevler',
      icon: TrendingUp,
      label: 'Yüksek öncelik',
      value: String(taskMetrics.highPriorityCount),
    },
  ]

  const parentStats = [
    {
      detail: 'Sistemdeki toplam veli sayısı',
      icon: UsersRound,
      label: 'Toplam veli',
      value: String(parentMetrics.totalParents),
    },
    {
      detail: 'Sistemdeki toplam öğrenci sayısı',
      icon: GraduationCap,
      label: 'Toplam öğrenci',
      value: String(parentMetrics.totalStudents),
    },
    {
      detail: 'Aktif kaydı bulunan öğrenci sayısı',
      icon: CheckCircle2,
      label: 'Aktif kayıtlı öğrenci',
      value: String(parentMetrics.activeStudents),
    },
    {
      detail: 'Bu ay eklenen veli kayıtları',
      icon: UsersRound,
      label: 'Bu ay veli',
      value: String(parentMetrics.parentsThisMonth),
    },
    {
      detail: 'Bu ay eklenen öğrenci kayıtları',
      icon: GraduationCap,
      label: 'Bu ay öğrenci',
      value: String(parentMetrics.studentsThisMonth),
    },
  ]

  const programStats = [
    {
      detail: 'Sistemdeki toplam program sayısı',
      icon: BookOpen,
      label: 'Toplam program',
      value: String(programMetrics.totalPrograms),
    },
    {
      detail: 'Aktif olarak yayında olan programlar',
      icon: CheckCircle2,
      label: 'Aktif program',
      value: String(programMetrics.activePrograms),
    },
    {
      detail: 'Sistemdeki toplam kayıt sayısı',
      icon: ClipboardList,
      label: 'Toplam kayıt',
      value: String(programMetrics.totalRegistrations),
    },
    {
      detail: 'Kesin kayıt durumundaki kayıtlar',
      icon: CheckCircle2,
      label: 'Kesin kayıt',
      value: String(programMetrics.confirmedRegistrations),
    },
    {
      detail: 'Ön kayıt durumundaki kayıtlar',
      icon: ClipboardList,
      label: 'Ön kayıt',
      value: String(programMetrics.preRegistrations),
    },
    {
      detail: 'İptal edilen kayıtlar',
      icon: AlertCircle,
      label: 'İptal kayıt',
      value: String(programMetrics.cancelledRegistrations),
    },
    {
      detail: 'Bu ay oluşturulan kayıtlar',
      icon: TrendingUp,
      label: 'Bu ay kayıt',
      value: String(programMetrics.registrationsThisMonth),
    },
    {
      detail: 'Doluluk oranı en yüksek program',
      icon: BookOpen,
      label: 'En dolu program',
      value: programMetrics.highestFillProgram
        ? `${programMetrics.highestFillProgram.name} (${Math.round(
            programMetrics.highestFillProgram.fillRate,
          )}%)`
        : '-',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-700">Döngü CRM</p>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-950 sm:text-3xl">
          Dashboard
        </h1>
      </div>

      {loading ? (
        <div className="rounded-lg border border-neutral-200 bg-white p-6 text-sm font-medium text-neutral-600 shadow-sm">
          Dashboard verileri yükleniyor...
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-neutral-950">
              Veli ve Öğrenci Özeti
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {parentStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-neutral-950">
              Görev Özeti
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {taskStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-base font-semibold text-neutral-950">
              Program ve Kayıt Özeti
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {programStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-950">
                Son 5 Kayıt
              </h2>
              <div className="mt-4 divide-y divide-neutral-200">
                {programMetrics.recentRegistrations.length > 0 ? (
                  programMetrics.recentRegistrations.map((registration) => {
                    const parent = normalizeRelation(registration.parent)
                    const student = normalizeRelation(registration.student)

                    return (
                      <article
                        key={registration.id}
                        className="py-3 first:pt-0 last:pb-0"
                      >
                        <p className="text-sm font-semibold text-neutral-950">
                          {student?.full_name ?? 'Öğrenci yok'}
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          {parent?.full_name ?? 'Veli yok'} ·{' '}
                          {registration.registration_date ?? '-'}
                        </p>
                      </article>
                    )
                  })
                ) : (
                  <p className="text-sm text-neutral-500">
                    Henüz kayıt bulunmuyor.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-neutral-950">
                Kontenjanı Dolmaya Yakın Programlar
              </h2>
              <div className="mt-4 divide-y divide-neutral-200">
                {programMetrics.programsNearCapacity.length > 0 ? (
                  programMetrics.programsNearCapacity.map((program) => (
                    <article
                      key={program.id}
                      className="py-3 first:pt-0 last:pb-0"
                    >
                      <p className="text-sm font-semibold text-neutral-950">
                        {program.name}
                      </p>
                      <p className="mt-1 text-xs text-neutral-500">
                        {program.registeredCount}/{program.quota ?? '-'} kayıt ·{' '}
                        {Math.round(program.fillRate)}%
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-neutral-500">
                    Dolmaya yakın program bulunmuyor.
                  </p>
                )}
              </div>
            </div>
          </section>

          <TodayTasksWidget />
        </>
      )}
    </div>
  )
}
