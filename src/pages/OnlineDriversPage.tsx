import { useEffect, useMemo, useState } from 'react'
import { RefreshCcw } from 'lucide-react'
import type { Driver } from '../types/akkar'
import { getDrivers } from '../services/api'
import { Button } from '../components/ui/Button'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Card, CardContent } from '../components/ui/Card'

function isStaleLocation(lastUpdatedAt?: string | null) {
  if (!lastUpdatedAt) return false
  const t = new Date(lastUpdatedAt).getTime()
  if (Number.isNaN(t)) return false
  return Date.now() - t > 2 * 60 * 1000
}

export default function OnlineDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    setLoading(true)
    const all = await getDrivers()
    setDrivers(all)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  const onlineDrivers = useMemo(() => {
    return drivers.filter(
      (d) => d.approval_status === 'approved' && d.online_status !== 'offline'
    )
  }, [drivers])

  const columns = useMemo<Column<Driver>[]>(
    () => [
      {
        key: 'name',
        header: 'Driver',
        cell: (d) => (
          <div className="min-w-0">
            <div className="font-semibold text-forest">
              {[d.first_name, d.last_name].filter(Boolean).join(' ') || '—'}
            </div>
            <div className="text-xs text-muted truncate">{d.phone ?? '—'}</div>
          </div>
        ),
      },
      {
        key: 'vehicle',
        header: 'Vehicle',
        cell: (d) => (
          <div className="min-w-0">
            <div className="font-semibold text-forest/90">{d.vehicle_label ?? '—'}</div>
            <div className="text-xs text-muted">{d.plate_number ?? '—'}</div>
          </div>
        ),
      },
      {
        key: 'online_status',
        header: 'Online Status',
        cell: (d) => (
          <span className="inline-flex items-center rounded-full bg-border/60 px-2.5 py-0.5 text-xs font-semibold text-forest">
            {d.online_status}
          </span>
        ),
      },
      {
        key: 'status_updated_at',
        header: 'Last status update',
        cell: (d) => (
          <span className="text-xs text-muted">
            {d.updated_at ? new Date(d.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
          </span>
        ),
      },
      {
        key: 'last_location_updated_at',
        header: 'Last location update',
        cell: (d) => {
          const stale = isStaleLocation(d.last_location_updated_at)
          return (
            <div className="min-w-0">
              <div className="text-xs text-muted">
                {d.last_location_updated_at
                  ? new Date(d.last_location_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : '—'}
              </div>
              {d.last_location_updated_at ? (
                <div className="mt-1 text-[11px]">
                  <span
                    className={[
                      'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                      stale ? 'bg-indigo-50 text-indigo-800' : 'bg-emerald-50 text-emerald-800',
                    ].join(' ')}
                  >
                    {stale ? 'stale (>2m)' : 'fresh'}
                  </span>
                </div>
              ) : null}
            </div>
          )
        },
      },
    ],
    []
  )

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Online Drivers</h1>
          <p className="mt-1 text-sm text-muted">
            Live operations snapshot (mock). Location staleness flagged after 2 minutes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
              Loading online drivers…
            </div>
          ) : (
            <DataTable rows={onlineDrivers} columns={columns} />
          )}
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-5">
              <div className="text-sm font-semibold text-forest">Live driver map coming soon</div>
              <div className="mt-2 text-sm text-muted">
                When lat/lng are available, we’ll render a real map view and highlight stale locations.
              </div>
              <div className="mt-4 h-[260px] rounded-xl border border-border/70 bg-background flex items-center justify-center">
                <div className="text-xs text-muted text-center max-w-[240px] leading-5">
                  Map placeholder
                  <br />
                  (approved + online)
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
