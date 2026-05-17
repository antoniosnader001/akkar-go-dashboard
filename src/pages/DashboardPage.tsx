import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import {
  DollarSign,
  ArrowUpRight,
  Users,
  ShieldCheck,
  Clock,
  Building2,
  Activity,
} from 'lucide-react'
import { getDashboardStats, type DashboardChartPoint } from '../services/api'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'

type ActivityItem = Awaited<ReturnType<typeof getDashboardStats>>['recentActivity'][number]

function formatLebanonMoney(amount: number) {
  return `${amount.toLocaleString('en-US')} L.L`
}

function StatCard({
  icon,
  label,
  value,
  helper,
  trend,
}: {
  icon: ReactNode
  label: string
  value: string
  helper: string
  trend?: { label: string; positive?: boolean }
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-forest/90">{label}</div>
            <div className="mt-2 flex items-baseline gap-3">
              <div className="text-2xl font-bold text-forest">{value}</div>
              {trend ? (
                <div className="flex items-center gap-1 text-xs font-semibold">
                  <ArrowUpRight className={['h-4 w-4', trend.positive === false ? 'rotate-180' : ''].join(' ')} />
                  <span className={trend.positive === false ? 'text-rose-700' : 'text-leaf-700'}>{trend.label}</span>
                </div>
              ) : null}
            </div>
            <div className="mt-1 text-xs text-muted">{helper}</div>
          </div>
          <div className="shrink-0 rounded-2xl bg-forest/5 p-2.5 text-forest">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function ChartCard({
  title,
  subtitle,
  points,
}: {
  title: string
  subtitle: string
  points: DashboardChartPoint[]
  valueFormatter?: (v: number) => string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-bold text-forest">{title}</div>
            <div className="mt-1 text-xs text-muted">{subtitle}</div>
          </div>
          <Badge variant="online_online">Last 7d</Badge>
        </div>
        <div className="mt-4 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={points}>
              <XAxis dataKey="day" stroke="var(--muted)" fontSize={12} />
              <YAxis stroke="var(--border)" fontSize={12} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0B3D2E"
                strokeWidth={2.4}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity({ items }: { items: ActivityItem[] }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-bold text-forest">Recent Activity</div>
            <div className="mt-1 text-xs text-muted">Operational updates and mapping events.</div>
          </div>
          <div className="rounded-2xl bg-forest/5 p-2.5 text-forest">
            <Activity className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <div key={it.id} className="flex items-start gap-3">
              <div className="mt-1 h-2.5 w-2.5 rounded-full bg-leaf" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-forest/90">{it.message}</div>
                <div className="text-xs text-muted mt-0.5">{new Date(it.created_at).toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null)

  useEffect(() => {
    let mounted = true
    getDashboardStats().then((d) => {
      if (!mounted) return
      setData(d)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [])

  const cards = useMemo(() => {
    const stats = data?.stats
    if (!stats) return []
    return [
      {
        icon: <Users className="h-5 w-5" />,
        label: 'Total Riders',
        value: String(stats.totalRiders),
        helper: 'Registered rider accounts',
        trend: { label: '+2.3%', positive: true },
      },
      {
        icon: <Building2 className="h-5 w-5" />,
        label: 'Total Drivers',
        value: String(stats.totalDrivers),
        helper: 'All submitted drivers',
        trend: { label: '+1.1%', positive: true },
      },
      {
        icon: <ShieldCheck className="h-5 w-5" />,
        label: 'Pending Drivers',
        value: String(stats.pendingDrivers),
        helper: 'Awaiting approval workflow',
        trend: { label: '-0.6%', positive: false },
      },
      {
        icon: <Clock className="h-5 w-5" />,
        label: 'Approved Drivers',
        value: String(stats.approvedDrivers),
        helper: 'Approved for operations',
        trend: { label: '+0.9%', positive: true },
      },
      {
        icon: <Activity className="h-5 w-5" />,
        label: 'Online Drivers',
        value: String(stats.onlineDrivers),
        helper: 'Currently online / busy',
        trend: { label: '+0.4%', positive: true },
      },
      {
        icon: <Users className="h-5 w-5" />,
        label: 'Completed Trips',
        value: String(stats.completedTrips),
        helper: 'Trips with completed status',
        trend: { label: '+3.2%', positive: true },
      },
      {
        icon: <Clock className="h-5 w-5" />,
        label: 'Cancelled Trips',
        value: String(stats.cancelledTrips),
        helper: 'Trips cancelled by riders/admin',
        trend: { label: '-0.2%', positive: true },
      },
      {
        icon: <DollarSign className="h-5 w-5" />,
        label: 'Total Cash Fares',
        value: formatLebanonMoney(stats.totalCashFares),
        helper: 'Total collected for completed trips',
      },
    ]
  }, [data])

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">
            Manage driver approvals, rider requests, trip operations, and exports.
          </p>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center gap-2">
          <Badge variant="online_offline">Development admin panel — secure admin login required before production.</Badge>
        </div>
      </div>

      {loading || !data ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <div className="h-3 w-1/2 rounded bg-border/70" />
                <div className="mt-3 h-8 w-1/3 rounded bg-border/70" />
                <div className="mt-2 h-3 w-2/3 rounded bg-border/70" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((c) => (
              <StatCard
                key={c.label}
                icon={c.icon}
                label={c.label}
                value={c.value}
                helper={c.helper}
                trend={c.trend}
              />
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ChartCard
              title="Trips over last 7 days"
              subtitle="Completed trips count per day"
              points={data.tripsOverLast7Days}
            />
            <ChartCard
              title="Cash fares over last 7 days"
              subtitle="Total fare price per day (mock cash)"
              points={data.cashFaresOverLast7Days}
            />
          </div>

          <div className="mt-4">
            <RecentActivity items={data.recentActivity} />
          </div>
        </>
      )}
    </div>
  )
}
