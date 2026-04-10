import { getInitials } from './utils'
import type { Ride, RideRequest, Passenger } from './types'

export function mapRide(row: {
  id: string
  origin: string
  destination: string
  departure_date: string
  departure_time: string
  driver_id: string
  total_seats: number
  suggested_donation: number
  status: string
  note: string | null
  driver: { id: string; display_name: string }
  seats: Array<{
    id: string
    passenger: { id: string; display_name: string }
  }>
}): Ride {
  const passengers: Passenger[] = (row.seats || []).map((s) => ({
    userId: s.passenger.id,
    name: s.passenger.display_name,
    initials: getInitials(s.passenger.display_name),
  }))

  return {
    id: row.id,
    from: row.origin,
    to: row.destination,
    date: formatDate(row.departure_date),
    time: row.departure_time,
    driverName: row.driver.display_name,
    driverId: row.driver_id,
    driverInitials: getInitials(row.driver.display_name),
    driverRidesShared: 0,
    totalSeats: row.total_seats,
    filledSeats: passengers.length,
    donation: Number(row.suggested_donation),
    status: row.status === 'full' ? 'full' : 'open',
    passengers,
    note: row.note ?? undefined,
  }
}

export function mapRequest(row: {
  id: string
  origin: string
  destination: string
  preferred_date: string
  preferred_time: string | null
  requester_id: string
  note: string | null
  requester: { id: string; display_name: string }
}): RideRequest {
  return {
    id: row.id,
    from: row.origin,
    to: row.destination,
    preferredDate: row.preferred_date + (row.preferred_time ? `, ${row.preferred_time}` : ''),
    requesterName: row.requester.display_name,
    requesterId: row.requester_id,
    note: row.note ?? undefined,
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date.getTime() - today.getTime()) / 86400000)

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays < 0) return date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  return date.toLocaleDateString('en-US', { weekday: 'long' })
}
