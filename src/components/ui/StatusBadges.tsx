import type { DriverApprovalStatus, DriverOnlineStatus, TripStatus } from '../../types/akkar'
import { Badge } from './Badge'

function approvalToVariant(status: DriverApprovalStatus): Parameters<typeof Badge>[0]['variant'] {
  switch (status) {
    case 'pending_approval':
      return 'approval_pending'
    case 'approved':
      return 'approval_approved'
    case 'rejected':
      return 'approval_rejected'
  }
}

function onlineToVariant(status: DriverOnlineStatus): Parameters<typeof Badge>[0]['variant'] {
  switch (status) {
    case 'online':
      return 'online_online'
    case 'busy':
      return 'online_busy'
    case 'offline':
      return 'online_offline'
  }
}

// Trip badges: keep minimal (we reuse approval variants visually)
export function tripStatusColor(status: TripStatus): Parameters<typeof Badge>[0]['variant'] {
  // best-effort mapping for now
  switch (status) {
    case 'completed':
      return 'approval_approved'
    case 'cancelled':
      return 'approval_rejected'
    default:
      return 'approval_pending'
  }
}

export function ApprovalBadge({ status }: { status: DriverApprovalStatus }) {
  return <Badge variant={approvalToVariant(status)}>{status.replace(/_/g, ' ')}</Badge>
}

export function OnlineStatusBadge({ status }: { status: DriverOnlineStatus }) {
  const label = status === 'online' ? 'online' : status === 'busy' ? 'busy' : 'offline'
  return <Badge variant={onlineToVariant(status)}>{label}</Badge>
}
