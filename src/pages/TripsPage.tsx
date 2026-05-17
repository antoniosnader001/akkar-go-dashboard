import { useEffect, useMemo, useState } from 'react'
import { Eye, RefreshCcw, Download, XCircle } from 'lucide-react'
import type { Trip } from '../types/akkar'
import { exportCsv, getTrips, markTripCancelled } from '../services/api'
import { Button } from '../components/ui/Button'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)

  async function refresh() {
    setLoading(true)
    const t = await getTrips()
    setTrips(t)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function handleCancel(tripId: number) {
    await markTripCancelled(tripId)
    await refresh()
  }

  function canCancel(t: Trip) {
    return t.status !== 'completed' && t.status !== 'cancelled'
  }

  async function exportSingleTripRow(t: Trip) {
    const filename = `akkar-go-trip-${t.id}-${new Date().toISOString().slice(0, 10)}.csv`

    // CSV expects array of records. Keep headers simple and explicit.
    const row = {
      trip_id: t.id,
      rider_user_id: t.user_id,
      driver_id: t.driver_id,
      pickup: t.origin_address,
      destination: t.destination_address,
      status: t.status,
      fare: t.fare_price,
      payment_method: t.payment_status ?? '—',
      created_at: t.created_at,
      completed_at: t.completed_at ?? '—',
      origin_latitude: t.origin_latitude ?? '',
      origin_longitude: t.origin_longitude ?? '',
      destination_latitude: t.destination_latitude ?? '',
      destination_longitude: t.destination_longitude ?? '',
    }

    exportCsv([row], filename)
  }

  const columns = useMemo<Column<Trip>[]>(
    () => [
      {
        key: 'id',
        header: 'Trip ID',
        cell: (t) => <span className="font-semibold text-forest">{t.id}</span>,
      },
      {
        key: 'rider',
        header: 'Rider',
        cell: (t) => (
          <div className="min-w-0">
            <div className="font-semibold text-forest">{t.rider?.name ?? '—'}</div>
            <div className="text-xs text-muted truncate">
              #{t.user_id} {t.rider?.phone ? `• ${t.rider.phone}` : ''}
            </div>
          </div>
        ),
      },
      {
        key: 'driver',
        header: 'Driver',
        cell: (t) => (
          <div className="min-w-0">
            <div className="font-semibold text-forest">{[t.driver?.first_name, t.driver?.last_name].filter(Boolean).join(' ') || '—'}</div>
            <div className="text-xs text-muted truncate">
              #{t.driver_id} {t.driver?.phone ? `• ${t.driver.phone}` : ''}
            </div>
          </div>
        ),
      },
      {
        key: 'origin_address',
        header: 'Pickup',
        cell: (t) => <span className="text-muted truncate">{t.origin_address}</span>,
      },
      {
        key: 'destination_address',
        header: 'Destination',
        cell: (t) => <span className="text-muted truncate">{t.destination_address}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        cell: (t) => <span className="inline-flex rounded-full bg-border/60 px-2.5 py-0.5 text-xs font-semibold text-forest">{t.status}</span>,
      },
      {
        key: 'fare_price',
        header: 'Fare',
        cell: (t) => (
          <span className="font-semibold text-forest">
            {t.fare_price} <span className="text-xs text-muted">USD</span>
          </span>
        ),
      },
      {
        key: 'payment_status',
        header: 'Payment Method',
        cell: (t) => <span className="text-muted">{t.payment_status ?? '—'}</span>,
      },
      {
        key: 'created_at',
        header: 'Created At',
        cell: (t) => <span className="text-xs text-muted">{new Date(t.created_at).toLocaleDateString()}</span>,
      },
      {
        key: 'completed_at',
        header: 'Completed At',
        cell: (t) => (
          <span className="text-xs text-muted">
            {t.completed_at ? new Date(t.completed_at).toLocaleDateString() : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'w-[420px]',
        cell: (t) => (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              className="px-2.5 py-2"
              onClick={() => {
                setSelectedTrip(t)
                setDetailsOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
              View Details
            </Button>

            {canCancel(t) ? (
              <Button
                variant="danger"
                className="px-2.5 py-2"
                onClick={() => void handleCancel(t.id)}
              >
                <XCircle className="h-4 w-4" />
                Mark Cancelled
              </Button>
            ) : null}

            <Button
              variant="secondary"
              className="px-2.5 py-2"
              onClick={() => void exportSingleTripRow(t)}
            >
              <Download className="h-4 w-4" />
              Export row
            </Button>
          </div>
        ),
      },
    ],
    []
  )

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Trips</h1>
          <p className="mt-1 text-sm text-muted">
            Track riders/drivers and review trip lifecycle (mock).
          </p>
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
          <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted">
            Loading trips…
          </div>
        ) : (
          <DataTable rows={trips} columns={columns} />
        )}
      </div>

      <Modal
        open={detailsOpen}
        title={selectedTrip ? `Trip Details • #${selectedTrip.id}` : 'Trip Details'}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedTrip(null)
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDetailsOpen(false)
                setSelectedTrip(null)
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedTrip ? (
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Trip id</div>
                <div className="text-sm font-bold text-forest">{selectedTrip.id}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Status</div>
                <div className="text-sm font-bold text-forest">{selectedTrip.status}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Rider user id</div>
                <div className="text-sm text-forest">
                  {selectedTrip.user_id} {selectedTrip.rider?.name ? `• ${selectedTrip.rider.name}` : ''}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Driver id</div>
                <div className="text-sm text-forest">
                  {selectedTrip.driver_id}{' '}
                  {selectedTrip.driver ? `• ${[selectedTrip.driver.first_name, selectedTrip.driver.last_name].filter(Boolean).join(' ')}` : ''}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background p-3">
              <div className="text-xs font-semibold text-muted">Pickup & Destination</div>
              <div className="mt-2 space-y-2 text-sm">
                <div>
                  <div className="text-xs text-muted">Pickup address</div>
                  <div className="font-semibold text-forest">{selectedTrip.origin_address}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Destination address</div>
                  <div className="font-semibold text-forest">{selectedTrip.destination_address}</div>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-xs text-muted">Pickup coordinates</div>
                  <div className="text-sm text-forest">
                    {selectedTrip.origin_latitude != null && selectedTrip.origin_longitude != null ? (
                      <>
                        {selectedTrip.origin_latitude}, {selectedTrip.origin_longitude}
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted">Destination coordinates</div>
                  <div className="text-sm text-forest">
                    {selectedTrip.destination_latitude != null && selectedTrip.destination_longitude != null ? (
                      <>
                        {selectedTrip.destination_latitude}, {selectedTrip.destination_longitude}
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Fare</div>
                <div className="text-sm font-bold text-forest">
                  {selectedTrip.fare_price} <span className="text-xs text-muted">USD</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Payment Method</div>
                <div className="text-sm text-forest">{selectedTrip.payment_status ?? '—'}</div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Created / Updated</div>
                <div className="text-sm text-forest">
                  {new Date(selectedTrip.created_at).toLocaleString()}
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">completed_at</div>
                <div className="text-sm text-forest">
                  {selectedTrip.completed_at ? new Date(selectedTrip.completed_at).toLocaleString() : '—'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted">Cancellation info</div>
                <div className="text-sm text-forest">
                  {selectedTrip.status === 'cancelled' ? 'Cancelled (mock admin action)' : '—'}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}
