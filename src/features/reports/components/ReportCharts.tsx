import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ReportChartPoint, ReportChartsData } from '../types'

const chartColors = ['#059669', '#2563eb', '#f59e0b', '#dc2626', '#7c3aed']

function ChartCard({
  data,
  title,
  type = 'bar',
}: {
  data: ReportChartPoint[]
  title: string
  type?: 'bar' | 'pie'
}) {
  const hasData = data.some((item) => item.value > 0)

  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-base font-semibold text-neutral-950">{title}</h2>
      <div className="mt-4 h-64">
        {!hasData ? (
          <div className="flex h-full items-center justify-center rounded-lg bg-neutral-50 text-sm font-medium text-neutral-500">
            Gosterilecek veri yok.
          </div>
        ) : type === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={48}
                nameKey="label"
                outerRadius={82}
              >
                {data.map((item, index) => (
                  <Cell
                    key={item.label}
                    fill={chartColors[index % chartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" fontSize={12} tickLine={false} />
              <YAxis fontSize={12} tickLine={false} width={44} />
              <Tooltip />
              <Bar dataKey="value" fill="#059669" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  )
}

export default function ReportCharts({ charts }: { charts: ReportChartsData }) {
  return (
    <section className="grid gap-4 xl:grid-cols-2">
      <ChartCard
        data={charts.monthlyRegistrations}
        title="Aylara Gore Kayit Sayisi"
      />
      <ChartCard
        data={charts.programRegistrations}
        title="Programlara Gore Kayit Dagilimi"
      />
      <ChartCard
        data={charts.leadSourceConversions}
        title="Lead Kaynaklarina Gore Donusum"
      />
      <ChartCard
        data={charts.monthlyCollections}
        title="Aylara Gore Tahsilat"
      />
      <ChartCard
        data={charts.taskStatusDistribution}
        title="Gorev Durum Dagilimi"
        type="pie"
      />
    </section>
  )
}
