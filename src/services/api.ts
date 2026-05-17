import type { Driver, DriverOnlineStatus, Trip } from '../types/akkar'
import type { User } from '../types/akkar'
import { mockDrivers } from '../data/mockDrivers'
import { mockTrips } from '../data/mockTrips'
import { mockUsers } from '../data/mockUsers'

type DashboardStats = {
  totalRiders: number
  totalDrivers: number
  pendingDrivers: number
  approvedDrivers: number
  onlineDrivers: number
  completedTrips: number
  cancelledTrips: number
  totalCashFares: number
}

export type DashboardChartPoint = { day: string; value: number }

export type DashboardActivityItem = {
  id: string
  type:
    | 'driver_submitted'
    | 'driver_approved'
    | 'rider_requested_trip'
    | 'trip_completed'
    | 'driver_online_offline'
  message: string
  created_at: string
}

let driversStore: Driver[] = [...mockDrivers]
let tripsStore: Trip[] = [...mockTrips]
let usersStore: User[] = [...mockUsers]

function parseIsoDate(dateStr: string): Date {
  return new Date(dateStr)
}

function formatDay(d: Date) {
  // keep simple, stable formatting
  return d.toISOString().slice(5, 10) // MM-DD
}

function lastNDays(n: number) {
  const now = new Date('2026-05-17T13:00:00.000Z') // stable mock “today”
  const days: Date[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setUTCDate(d.getUTCDate() - i)
    days.push(d)
  }
  return days
}

function buildDashboardStats(): DashboardStats {
  const totalRiders = usersStore.filter((u) => u.role === 'rider').length
  const totalDrivers = driversStore.length
  const pendingDrivers = driversStore.filter((d) => d.approval_status === 'pending_approval').length
  const approvedDrivers = driversStore.filter((d) => d.approval_status === 'approved').length
  const onlineDrivers = driversStore.filter((d) => d.approval_status === 'approved' && d.online_status !== 'offline').length
  const completedTrips = tripsStore.filter((t) => t.status === 'completed').length
  const cancelledTrips = tripsStore.filter((t) => t.status === 'cancelled').length
  const totalCashFares = tripsStore
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => {
      // payment_status is mocked as paid/null, but treat all completed as cash for now
      return sum + t.fare_price
    }, 0)

  return {
    totalRiders,
    totalDrivers,
    pendingDrivers,
    approvedDrivers,
    onlineDrivers,
    completedTrips,
    cancelledTrips,
    totalCashFares,
  }
}

function buildTripsOver7Days(): DashboardChartPoint[] {
  const days = lastNDays(7)
  return days.map((d) => {
    const dayStart = new Date(d)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setUTCHours(23, 59, 59, 999)

    const count = tripsStore.filter((t) => {
      const created = parseIsoDate(t.created_at)
      return created >= dayStart && created <= dayEnd && t.status === 'completed'
    }).length

    return { day: formatDay(d), value: count }
  })
}

function buildCashFaresOver7Days(): DashboardChartPoint[] {
  const days = lastNDays(7)
  return days.map((d) => {
    const dayStart = new Date(d)
    dayStart.setUTCHours(0, 0, 0, 0)
    const dayEnd = new Date(d)
    dayEnd.setUTCHours(23, 59, 59, 999)

    const sum = tripsStore
      .filter((t) => {
        const created = parseIsoDate(t.created_at)
        return created >= dayStart && created <= dayEnd && t.status === 'completed'
      })
      .reduce((acc, t) => acc + t.fare_price, 0)

    return { day: formatDay(d), value: sum }
  })
}

function buildRecentActivity(): DashboardActivityItem[] {
  // deterministic, but can be enriched later from actual mutations
  return [
    {
      id: 'act-1',
      type: 'driver_submitted',
      message: 'Rami Nassar submitted a driver application.',
      created_at: '2026-05-17T12:44:00.000Z',
    },
    {
      id: 'act-2',
      type: 'driver_approved',
      message: 'Karim Khoury was approved as a Tuk Tuk driver.',
      created_at: '2026-05-17T11:20:00.000Z',
    },
    {
      id: 'act-3',
      type: 'rider_requested_trip',
      message: 'Nour Bitar requested a trip.',
      created_at: '2026-05-17T10:08:00.000Z',
    },
    {
      id: 'act-4',
      type: 'trip_completed',
      message: 'Trip #407 completed successfully.',
      created_at: '2026-05-16T18:29:00.000Z',
    },
    {
      id: 'act-5',
      type: 'driver_online_offline',
      message: 'Samir Hanna is now busy (online).',
      created_at: '2026-05-16T17:59:00.000Z',
    },
  ]
}

function attachUserToDriver(d: Driver): Driver {
  const user = usersStore.find((u) => u.id === d.user_id)
  if (!user) return d
  return { ...d, user }
}

function attachUserToTrip(t: Trip): Trip {
  const rider = usersStore.find((u) => u.id === t.user_id)
  const driver = driversStore.find((d) => d.id === t.driver_id)
  return {
    ...t,
    rider: rider ?? t.rider,
    driver: driver ? attachUserToDriver(driver) : t.driver,
  }
}

export async function getDashboardStats(): Promise<{
  stats: DashboardStats
  tripsOverLast7Days: DashboardChartPoint[]
  cashFaresOverLast7Days: DashboardChartPoint[]
  recentActivity: DashboardActivityItem[]
}> {
  return {
    stats: buildDashboardStats(),
    tripsOverLast7Days: buildTripsOver7Days(),
    cashFaresOverLast7Days: buildCashFaresOver7Days(),
    recentActivity: buildRecentActivity(),
  }
}

export async function getDrivers(): Promise<Driver[]> {
  return driversStore.map(attachUserToDriver)
}

export async function approveDriver(driverId: number): Promise<Driver | null> {
  const idx = driversStore.findIndex((d) => d.id === driverId)
  if (idx === -1) return null
  const updated: Driver = { ...driversStore[idx], approval_status: 'approved' }
  driversStore = [...driversStore.slice(0, idx), updated, ...driversStore.slice(idx + 1)]
  return attachUserToDriver(updated)
}

export async function rejectDriver(driverId: number): Promise<Driver | null> {
  const idx = driversStore.findIndex((d) => d.id === driverId)
  if (idx === -1) return null
  const updated: Driver = { ...driversStore[idx], approval_status: 'rejected', online_status: 'offline' }
  driversStore = [...driversStore.slice(0, idx), updated, ...driversStore.slice(idx + 1)]
  return attachUserToDriver(updated)
}

export async function setDriverOnlineStatus(
  driverId: number,
  onlineStatus: DriverOnlineStatus
): Promise<Driver | null> {
  const idx = driversStore.findIndex((d) => d.id === driverId)
  if (idx === -1) return null
  const updated: Driver = { ...driversStore[idx], online_status: onlineStatus }
  driversStore = [...driversStore.slice(0, idx), updated, ...driversStore.slice(idx + 1)]
  return attachUserToDriver(updated)
}

export async function getRiders(): Promise<User[]> {
  return usersStore.filter((u) => u.role === 'rider')
}

export async function getTrips(): Promise<Trip[]> {
  return tripsStore.map(attachUserToTrip)
}

export async function markTripCancelled(tripId: number): Promise<Trip | null> {
  // MOCK / ADMIN-DEV ONLY:
  // This updates the in-memory `tripsStore` to simulate an admin action.
  // Replace with secure backend API in production.
  const idx = tripsStore.findIndex((t) => t.id === tripId)
  if (idx === -1) return null

  const existing = tripsStore[idx]
  const updated: Trip = {
    ...existing,
    status: 'cancelled',
    updated_at: new Date().toISOString(),
  }

  tripsStore = [...tripsStore.slice(0, idx), updated, ...tripsStore.slice(idx + 1)]
  return attachUserToTrip(updated)
}

function csvEscape(value: unknown): string {
  const v = value === null || value === undefined ? '' : String(value)
  const needsQuotes = /[",\n]/.test(v)
  if (!needsQuotes) return v
  return `"${v.replace(/"/g, '""')}"`
}

export function exportCsv<T extends Record<string, unknown>>(rows: T[], filename: string) {
  const headers = rows.length ? Object.keys(rows[0]) : []
  const csv = [
    headers.map(csvEscape).join(','),
    ...rows.map((r) => headers.map((h) => csvEscape(r[h])).join(',')),
  ].join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
