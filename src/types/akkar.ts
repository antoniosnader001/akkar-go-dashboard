export type UserRole = 'rider' | 'driver'

export type User = {
  id: number
  clerk_id: string
  name: string | null
  email: string | null
  phone: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export type DriverApprovalStatus =
  | 'pending_approval'
  | 'approved'
  | 'rejected'

export type DriverOnlineStatus = 'offline' | 'online' | 'busy'

export type Driver = {
  id: number
  user_id: number
  first_name: string | null
  last_name: string | null
  phone: string | null
  vehicle_type: string | null
  vehicle_label: string | null
  vehicle_color: string | null
  plate_number: string | null
  service_area: string | null
  approval_status: DriverApprovalStatus
  online_status: DriverOnlineStatus
  latitude?: number | null
  longitude?: number | null
  last_location_updated_at?: string | null
  created_at: string
  updated_at: string
  user?: User
}

export type TripStatus =
  | 'requested'
  | 'accepted'
  | 'driver_on_way'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'cancelled'

export type Trip = {
  id: number
  user_id: number
  driver_id: number
  origin_address: string
  destination_address: string
  origin_latitude?: number | null
  origin_longitude?: number | null
  destination_latitude?: number | null
  destination_longitude?: number | null
  fare_price: number
  payment_status?: string | null
  status: TripStatus
  created_at: string
  updated_at?: string | null
  completed_at?: string | null
  rider?: User
  driver?: Driver
}
