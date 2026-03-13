export type RideStatus = 'open' | 'full';
export type BadgeVariant = 'open' | 'full' | 'confirmed' | 'pending' | 'request';

export interface User {
  id: string;
  displayName: string;
  initials: string;
}

export interface Passenger {
  userId: string;
  name: string;
  initials: string;
}

export interface Ride {
  id: string;
  from: string;
  to: string;
  date: string;
  time: string;
  driverName: string;
  driverId: string;
  driverInitials: string;
  driverRidesShared: number;
  totalSeats: number;
  filledSeats: number;
  donation: number;
  status: RideStatus;
  passengers: Passenger[];
  note?: string;
}

export interface RideRequest {
  id: string;
  from: string;
  to: string;
  preferredDate: string;
  requesterName: string;
  requesterId: string;
  note?: string;
}

export interface DashboardItem {
  id: string;
  route: string;
  meta: string;
  badge: BadgeVariant;
}
