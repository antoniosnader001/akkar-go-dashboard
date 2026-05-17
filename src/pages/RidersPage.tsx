import { useEffect, useMemo, useState } from 'react'
import { Eye, MapPin, RefreshCcw } from 'lucide-react'
import type { Trip, User } from '../types/akkar'
import { getRiders, getTrips } from '../services/api'
import { Button } from '../components/ui/Button'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { Card, CardContent } from '../components/ui/Card'

export default function RidersPage() {
  const [riders, setRiders] = useState<User[]>([])
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedRider, setSelectedRider] = useState<User | null>(null)

  const [tripsOpen, setTripsOpen] = useState(false)
  const [selectedTripsRiderId, setSelectedTripsRiderId] = useState<number | null>(null)

  async function refresh() {
    setLoading(true)
    const [rs, ts] = await Promise.all([getRiders(), getTrips()])
    setRiders(rs)
    setTrips(ts)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const tripsCountByRider = useMemo(() => {
    const map = new Map<number, number>()
    for (const t of trips) map.set(t.user_id, (map.get(t.user_id) ?? 0) + 1)
    return map
  }, [trips])

  const recentTripsByRider = useMemo(() => {
    const map = new Map<number, Trip[]>()
    const sorted = [...trips].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))
    for (const t of sorted) {
      const list = map.get(t.user_id) ?? []
      if (list.length < 6) list.push(t)
      map.set(t.user_id, list)
    }
    return map
  }, [trips])

  const columns = useMemo<Column<User>[]>(
    () => [
      {
        key: 'id',
        header: 'User ID',
        cell: (u) => <span className="font-semibold text-forest">{u.id}</span>,
      },
      {
        key: 'name',
        header: 'Name',
        cell: (u) => (
          <div className="min-w-0">
            <div className="font-semibold text-forest">
              {[u.name].filter(Boolean).join(' ') || '—'}
            </div>
            <div className="text-xs text-muted truncate">{u.phone ?? '—'}</div>
          </div>
        ),
      },
      {
        key: 'phone',
        header: 'Phone',
        cell: (u) => <span className="text-muted">{u.phone ?? '—'}</span>,
      },
      {
        key: 'email',
        header: 'Email',
        cell: (u) => <span className="text-muted">{u.email ?? '—'}</span>,
      },
      {
        key: 'clerk_id',
        header: 'Clerk ID',
        cell: (u) => <span className="text-muted">{u.clerk_id ?? '—'}</span>,
      },
      {
        key: 'role',
        header: 'Role',
        cell: (u) => (
          <span className="inline-flex items-center rounded-full bg-border/60 px-2.5 py-0.5 text-xs font-semibold text-forest">
            {u.role}
          </span>
        ),
      },
      {
        key: 'trips_count',
        header: 'Trips Count',
        cell: (u) => (
          <span className="font-semibold text-forest">
            {tripsCountByRider.get(u.id) ?? 0}
          </span>
        ),
      },
      {
        key: 'created_at',
        header: 'Created At',
        cell: (u) => (
          <span className="text-xs text-muted">{new Date(u.created_at).toLocaleDateString()}</span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'w-[320px]',
        cell: (u) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="px-2.5 py-2"
              onClick={() => {
                setSelectedRider(u)
                setDetailsOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>

            <Button
              variant="secondary"
              className="px-2.5 py-2"
              onClick={() => {
                setSelectedTripsRiderId(u.id)
                setTripsOpen(true)
              }}
            >
              <MapPin className="h-4 w-4" />
              View Trips
            </Button>
          </div>
        ),
      },
    ],
    [trips, tripsCountByRider]
  )

  const selectedRiderRecentTrips = useMemo(() => {
    if (!selectedRider) return []
    return recentTripsByRider.get(selectedRider.id) ?? []
  }, [recentTripsByRider, selectedRider])

  const selectedTripsList = useMemo(() => {
    if (selectedTripsRiderId == null) return []
    return recentTripsByRider.get(selectedTripsRiderId) ?? []
  }, [recentTripsByRider, selectedTripsRiderId])

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Riders</h1>
          <p className="mt-1 text-sm text-muted">View riders and their recent trip history (mock).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-4">
        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="h-3 w-1/3 rounded bg-border/70" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-border/70" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-border/70" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <DataTable rows={riders} columns={columns} />
        )}
      </div>

      <Modal
        open={detailsOpen}
        title={selectedRider ? `Rider Details • #${selectedRider.id}` : 'Rider Details'}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedRider(null)
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDetailsOpen(false)
                setSelectedRider(null)
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedRider ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">DB user ID</div>
              <div className="text-sm font-bold text-forest">{selectedRider.id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Clerk ID</div>
              <div className="text-sm font-bold text-forest">{selectedRider.clerk_id}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Name</div>
              <div className="text-sm text-forest">{selectedRider.name ?? '—'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Email</div>
              <div className="text-sm text-forest">{selectedRider.email ?? '—'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Phone</div>
              <div className="text-sm text-forest">{selectedRider.phone ?? '—'}</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Role</div>
              <div className="text-sm text-forest">{selectedRider.role}</div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <div className="text-xs font-semibold text-muted">Recent trips</div>
              <div className="rounded-xl border border-border bg-background p-3">
                {selectedRiderRecentTrips.length === 0 ? (
                  <div className="text-sm text-muted">No trips found.</div>
                ) : (
                  <ul className="space-y-2">
                    {selectedRiderRecentTrips.map((t) => (
                      <li key={t.id} className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-forest">Trip #{t.id}</div>
                          <div className="text-xs text-muted truncate">
                            {t.origin_address} → {t.destination_address}
                          </div>
                          <div className="text-xs text-muted">
                            Status: <span className="text-forest">{t.status}</span>
                          </div>
                        </div>
                        <div className="shrink-0 text-xs text-muted">
                          {new Date(t.created_at).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="text-xs font-semibold text-muted">Created / Updated</div>
              <div className="text-sm text-forest">
                {new Date(selectedRider.created_at).toLocaleString()} • Updated:{' '}
                {new Date(selectedRider.updated_at).toLocaleString()}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={tripsOpen}
        title={
          selectedTripsRiderId != null ? `Rider Trips • #${selectedTripsRiderId}` : 'Rider Trips'
        }
        onClose={() => {
          setTripsOpen(false)
          setSelectedTripsRiderId(null)
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setTripsOpen(false)
                setSelectedTripsRiderId(null)
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedTripsRiderId != null ? (
          <div className="space-y-3">
            <div className="text-sm text-muted">
              Showing recent trips (mock). Export available in Reports.
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              {selectedTripsList.length === 0 ? (
                <div className="text-sm text-muted">No trips found.</div>
              ) : (
                <ul className="space-y-2">
                  {selectedTripsList.map((t) => (
                    <li key={t.id} className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-forest">Trip #{t.id}</div>
                        <div className="text-xs text-muted truncate">
                          {t.origin_address} → {t.destination_address}
                        </div>
                        <div className="text-xs text-muted">
                          Fare: <span className="text-forest">{t.fare_price} USD</span> • Status:{' '}
                          <span className="text-forest">{t.status}</span>
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-muted">
                        {new Date(t.completed_at ?? t.created_at).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
