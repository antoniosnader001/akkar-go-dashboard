import { useEffect, useMemo, useState } from 'react'
import { Download, Filter, RefreshCcw } from 'lucide-react'
import type { Driver, Trip, User, DriverApprovalStatus, DriverOnlineStatus } from '../types/akkar'
import { exportCsv, getDrivers, getRiders, getTrips } from '../services/api'
import { Button } from '../components/ui/Button'

const tripStatuses = [
  'requested',
  'accepted',
  'driver_on_way',
  'arrived',
  'in_progress',
  'completed',
  'cancelled',
] as const

const driverApprovalStatuses: DriverApprovalStatus[] = [
  'pending_approval',
  'approved',
  'rejected',
]

const driverOnlineStatuses: DriverOnlineStatus[] = ['offline', 'online', 'busy']


function withinDateRange(createdAtIso: string, from?: string, to?: string) {
  const t = new Date(createdAtIso).getTime()
  if (Number.isNaN(t)) return false
  if (from) {
    const fromT = new Date(from + 'T00:00:00.000Z').getTime()
    if (t < fromT) return false
  }
  if (to) {
    const toT = new Date(to + 'T23:59:59.999Z').getTime()
    if (t > toT) return false
  }
  return true
}

function buildFilename(prefix: string) {
  return `${prefix}-${new Date().toISOString().slice(0, 10)}`
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [riders, setRiders] = useState<User[]>([])
  const [trips, setTrips] = useState<Trip[]>([])

  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')

  const [tripStatus, setTripStatus] = useState<(typeof tripStatuses)[number] | 'all'>('all')

  const [driverApproval, setDriverApproval] = useState<DriverApprovalStatus | 'all'>('all')
  const [onlineStatus, setOnlineStatus] = useState<DriverOnlineStatus | 'all'>('all')

  async function refresh() {
    setLoading(true)
    const [d, r, t] = await Promise.all([getDrivers(), getRiders(), getTrips()])
    setDrivers(d)
    setRiders(r)
    setTrips(t)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const okApproval = driverApproval === 'all' ? true : d.approval_status === driverApproval
      const okOnline = onlineStatus === 'all' ? true : d.online_status === onlineStatus
      return okApproval && okOnline
    })
  }, [drivers, driverApproval, onlineStatus])

  const filteredRiders = useMemo(() => {
    // riders export doesn't have filters beyond date range (created_at)
    return riders.filter((u) => withinDateRange(u.created_at, dateFrom || undefined, dateTo || undefined))
  }, [riders, dateFrom, dateTo])

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      const okDate = withinDateRange(t.created_at, dateFrom || undefined, dateTo || undefined)
      const okStatus = tripStatus === 'all' ? true : t.status === tripStatus
      return okDate && okStatus
    })
  }, [trips, dateFrom, dateTo, tripStatus])

  const earningsRows = useMemo(() => {
    // “earnings” = completed trips within date range
    return trips
      .filter((t) => t.status === 'completed')
      .filter((t) => withinDateRange(t.created_at, dateFrom || undefined, dateTo || undefined))
      .map((t) => ({
        trip_id: t.id,
        completed_at: t.completed_at ?? '',
        created_at: t.created_at,
        rider_user_id: t.user_id,
        driver_id: t.driver_id,
        fare_price: t.fare_price,
        payment_status: t.payment_status ?? '',
      }))
  }, [trips, dateFrom, dateTo])

  function exportDriversCsv() {
    const rows = filteredDrivers.map((d) => ({
      driver_id: d.id,
      clerk_id: d.user?.clerk_id ?? '',
      linked_user_id: d.user_id,
      name: [d.first_name, d.last_name].filter(Boolean).join(' ') || '',
      phone: d.phone ?? '',
      vehicle_type: d.vehicle_type ?? '',
      vehicle_label: d.vehicle_label ?? '',
      vehicle_color: d.vehicle_color ?? '',
      plate_number: d.plate_number ?? '',
      service_area: d.service_area ?? '',
      approval_status: d.approval_status,
      online_status: d.online_status,
      created_at: d.created_at,
      updated_at: d.updated_at ?? '',
    }))
    exportCsv(rows, `${buildFilename('akkar-go-drivers')}.csv`)
  }

  function exportRidersCsv() {
    const rows = filteredRiders.map((u) => ({
      user_id: u.id,
      clerk_id: u.clerk_id,
      name: u.name ?? '',
      phone: u.phone ?? '',
      email: u.email ?? '',
      role: u.role,
      trips_count_mock: trips.filter((t) => t.user_id === u.id).length,
      created_at: u.created_at,
      updated_at: u.updated_at,
    }))
    exportCsv(rows, `${buildFilename('akkar-go-riders')}.csv`)
  }

  function exportTripsCsv() {
    const rows = filteredTrips.map((t) => ({
      trip_id: t.id,
      rider_user_id: t.user_id,
      driver_id: t.driver_id,
      pickup: t.origin_address,
      destination: t.destination_address,
      status: t.status,
      fare_price: t.fare_price,
      payment_method: t.payment_status ?? '',
      created_at: t.created_at,
      completed_at: t.completed_at ?? '',
      updated_at: t.updated_at ?? '',
    }))
    exportCsv(rows, `${buildFilename('akkar-go-trips')}.csv`)
  }

  function exportEarningsCsv() {
    exportCsv(earningsRows, `${buildFilename('akkar-go-earnings')}.csv`)
  }

  function exportPendingDriversCsv() {
    const pending = drivers.filter((d) => d.approval_status === 'pending_approval')
    const rows = pending.map((d) => ({
      driver_id: d.id,
      linked_user_id: d.user_id,
      clerk_id: d.user?.clerk_id ?? '',
      name: [d.first_name, d.last_name].filter(Boolean).join(' ') || '',
      phone: d.phone ?? '',
      vehicle_label: d.vehicle_label ?? '',
      plate_number: d.plate_number ?? '',
      service_area: d.service_area ?? '',
      approval_status: d.approval_status,
      online_status: d.online_status,
      created_at: d.created_at,
    }))
    exportCsv(rows, `${buildFilename('akkar-go-pending-drivers')}.csv`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Reports / Export</h1>
          <p className="mt-1 text-sm text-muted">Export drivers, riders, trips, and earnings from mock state.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="rounded-2xl border border-border bg-background p-4 lg:col-span-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <div className="text-sm font-semibold text-forest">Report filters</div>
          </div>

          <div className="mt-3 grid gap-3">
            <div>
              <div className="text-xs font-semibold text-muted">Date From</div>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div>
              <div className="text-xs font-semibold text-muted">Date To</div>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">Trip status</div>
              <select
                value={tripStatus}
                onChange={(e) => setTripStatus(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                {tripStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">Driver approval status</div>
              <select
                value={driverApproval}
                onChange={(e) => setDriverApproval(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                {driverApprovalStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs font-semibold text-muted">Online status</div>
              <select
                value={onlineStatus}
                onChange={(e) => setOnlineStatus(e.target.value as any)}
                className="mt-1 w-full rounded-xl border border-border bg-white px-3 py-2 text-sm"
              >
                <option value="all">All</option>
                {driverOnlineStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted">
            Note: In mock mode, filtering is applied in the browser only.
          </div>
        </div>

        <div className="lg:col-span-8 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Button
              className="justify-between"
              variant="secondary"
              onClick={() => exportDriversCsv()}
            >
              <span>Export Drivers CSV</span>
              <Download className="h-4 w-4" />
            </Button>

            <Button
              className="justify-between"
              variant="secondary"
              onClick={() => exportRidersCsv()}
            >
              <span>Export Riders CSV</span>
              <Download className="h-4 w-4" />
            </Button>

            <Button
              className="justify-between"
              variant="secondary"
              onClick={() => exportTripsCsv()}
            >
              <span>Export Trips CSV</span>
              <Download className="h-4 w-4" />
            </Button>

            <Button
              className="justify-between"
              variant="secondary"
              onClick={() => exportEarningsCsv()}
            >
              <span>Export Earnings CSV</span>
              <Download className="h-4 w-4" />
            </Button>

            <Button
              className="justify-between"
              variant="secondary"
              onClick={() => exportPendingDriversCsv()}
            >
              <span>Export Pending Drivers CSV</span>
              <Download className="h-4 w-4" />
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-background p-4">
            <div className="text-sm font-semibold text-forest">Export status</div>
            <div className="mt-1 text-sm text-muted">
              {loading ? 'Loading mock state…' : 'Ready. Exports are generated from current mock tables.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
