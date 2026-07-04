import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  PhoneCall,
  TrendingUp,
  UserX,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../components/StatCard'
import { fetchDashboardCallMetrics } from '../features/calls/services/callLogService'
import type { CallDashboardMetrics } from '../features/calls/types'
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadMetrics() {
      setLoading(true)
      const [nextMetrics, nextTaskMetrics] = await Promise.all([
        fetchDashboardCallMetrics(authContext),
        fetchTaskDashboardMetrics(authContext),
      ])

      if (!isMounted) {
        return
      }

      setMetrics(nextMetrics)
      setTaskMetrics(nextTaskMetrics)
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
              Görev Özeti
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {taskStats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </section>

          <TodayTasksWidget />
        </>
      )}
    </div>
  )
}
