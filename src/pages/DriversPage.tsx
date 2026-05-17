import { useEffect, useMemo, useState } from 'react'
import { ShieldCheck, ShieldX, RefreshCcw, Eye, Clock } from 'lucide-react'
import type { Driver } from '../types/akkar'
import { getDrivers, approveDriver, rejectDriver, setDriverOnlineStatus } from '../services/api'
import { Button } from '../components/ui/Button'
import { DataTable, type Column } from '../components/ui/DataTable'
import { Modal } from '../components/ui/Modal'
import { Card, CardContent } from '../components/ui/Card'
import { ApprovalBadge, OnlineStatusBadge } from '../components/ui/StatusBadges'

type OnlineAction = 'offline' | 'online' | 'busy'

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)

  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  async function refresh() {
    setLoading(true)
    const d = await getDrivers()
    setDrivers(d)
    setLoading(false)
  }

  useEffect(() => {
    void refresh()
  }, [])

  async function handleApprove(driverId: number) {
    await approveDriver(driverId)
    await refresh()
  }

  async function handleReject(driverId: number) {
    await rejectDriver(driverId)
    await refresh()
  }

  async function handleOnlineStatus(driverId: number, onlineStatus: OnlineAction) {
    await setDriverOnlineStatus(driverId, onlineStatus)
    await refresh()
  }

  const columns = useMemo<Column<Driver>[]>(
    () => [
      {
        key: 'id',
        header: 'Driver ID',
        cell: (d) => <span className="font-semibold text-forest">{d.id}</span>,
      },
      {
        key: 'name',
        header: 'Name',
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
        key: 'phone',
        header: 'Phone',
        cell: (d) => <span className="text-muted">{d.phone ?? '—'}</span>,
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
        key: 'service_area',
        header: 'Service Area',
        cell: (d) => <span className="text-muted">{d.service_area ?? '—'}</span>,
      },
      {
        key: 'approval_status',
        header: 'Approval Status',
        cell: (d) => <ApprovalBadge status={d.approval_status} />,
      },
      {
        key: 'online_status',
        header: 'Online Status',
        cell: (d) => <OnlineStatusBadge status={d.online_status} />,
      },
      {
        key: 'created_at',
        header: 'Created At',
        cell: (d) => (
          <span className="text-xs text-muted">
            {new Date(d.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        className: 'w-[360px]',
        cell: (d) => {
          const canApprove = d.approval_status === 'pending_approval'
          const canReject = d.approval_status === 'pending_approval' || d.approval_status === 'approved'
          const canSetOffline = d.online_status === 'online' || d.online_status === 'busy'

          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="ghost"
                className="px-2.5 py-2"
                onClick={() => {
                  setSelectedDriver(d)
                  setDetailsOpen(true)
                }}
              >
                <Eye className="h-4 w-4" />
                View Details
              </Button>

              {canApprove ? (
                <Button
                  className="px-2.5 py-2"
                  onClick={() => void handleApprove(d.id)}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Approve
                </Button>
              ) : null}

              {canReject ? (
                <Button
                  variant="danger"
                  className="px-2.5 py-2"
                  onClick={() => void handleReject(d.id)}
                >
                  <ShieldX className="h-4 w-4" />
                  Reject / Set Rejected
                </Button>
              ) : null}

              {canSetOffline ? (
                <Button
                  variant="secondary"
                  className="px-2.5 py-2"
                  onClick={() => void handleOnlineStatus(d.id, 'offline')}
                >
                  <Clock className="h-4 w-4" />
                  Set Offline
                </Button>
              ) : null}

              <Button
                variant="ghost"
                className="px-2.5 py-2"
                onClick={() => void refresh()}
              >
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </div>
          )
        },
      },
    ],
    [drivers]
  )

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-forest">Drivers</h1>
          <p className="mt-1 text-sm text-muted">
            Approve Tuk Tuk drivers, manage approval + online status.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => void refresh()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh list
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
          <DataTable
            rows={drivers}
            columns={columns}
          />
        )}
      </div>

      <Modal
        open={detailsOpen}
        title={selectedDriver ? `Driver Details • #${selectedDriver.id}` : 'Driver Details'}
        onClose={() => {
          setDetailsOpen(false)
          setSelectedDriver(null)
        }}
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => {
                setDetailsOpen(false)
                setSelectedDriver(null)
              }}
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedDriver ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Driver ID</div>
              <div className="text-sm font-bold text-forest">{selectedDriver.id}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Linked user id</div>
              <div className="text-sm font-bold text-forest">{selectedDriver.user_id}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Clerk ID if available</div>
              <div className="text-sm text-forest">
                {selectedDriver.user?.clerk_id ?? '—'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Name</div>
              <div className="text-sm text-forest">
                {[selectedDriver.first_name, selectedDriver.last_name].filter(Boolean).join(' ') || '—'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Phone</div>
              <div className="text-sm text-forest">{selectedDriver.phone ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Email</div>
              <div className="text-sm text-forest">{selectedDriver.user?.email ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Vehicle type</div>
              <div className="text-sm text-forest">{selectedDriver.vehicle_type ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Vehicle label</div>
              <div className="text-sm text-forest">{selectedDriver.vehicle_label ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Vehicle color</div>
              <div className="flex items-center gap-3">
                <div
                  className="h-4 w-10 rounded-lg border border-border/70"
                  style={{
                    background:
                      selectedDriver.vehicle_color && /^#([0-9a-fA-F]{3}){1,2}$/.test(selectedDriver.vehicle_color)
                        ? selectedDriver.vehicle_color
                        : '#EAF3EE',
                  }}
                />
                <div className="text-sm text-forest">{selectedDriver.vehicle_color ?? '—'}</div>
              </div>
              <div className="mt-1 text-xs text-muted">Map marker color</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Plate number</div>
              <div className="text-sm text-forest">{selectedDriver.plate_number ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Service area</div>
              <div className="text-sm text-forest">{selectedDriver.service_area ?? '—'}</div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Approval status</div>
              <div className="text-sm">
                <ApprovalBadge status={selectedDriver.approval_status} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Online status</div>
              <div className="text-sm">
                <OnlineStatusBadge status={selectedDriver.online_status} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Created At</div>
              <div className="text-sm text-forest">
                {new Date(selectedDriver.created_at).toLocaleString()}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-semibold text-muted">Updated At</div>
              <div className="text-sm text-forest">
                {selectedDriver.updated_at ? new Date(selectedDriver.updated_at).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* end page */}
    </div>
  )
}
