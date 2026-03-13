import { User, Ride, RideRequest, DashboardItem } from './types';

export const currentUser: User = {
  id: 'user-ts',
  displayName: 'Toby S.',
  initials: 'TS',
};

export const rides: Ride[] = [
  {
    id: 'ride-1',
    from: 'Ericeira', to: 'Lisbon',
    date: 'Today', time: '4\u20136pm',
    driverName: 'Miguel R.', driverId: 'user-mr',
    driverInitials: 'MR', driverRidesShared: 12,
    totalSeats: 4, filledSeats: 2, donation: 10,
    status: 'open',
    passengers: [
      { userId: 'user-ak', name: 'Ana K.', initials: 'AK' },
      { userId: 'user-jl', name: 'Jo\u00e3o L.', initials: 'JL' },
    ],
    note: 'Leaving from the main square. Can pick up along the way.',
  },
  {
    id: 'ride-2',
    from: 'Lisbon', to: 'Ericeira',
    date: 'Tomorrow', time: '9am',
    driverName: 'Sara M.', driverId: 'user-sm',
    driverInitials: 'SM', driverRidesShared: 8,
    totalSeats: 5, filledSeats: 3, donation: 25,
    status: 'open',
    passengers: [
      { userId: 'user-ts', name: 'Toby S.', initials: 'TS' },
      { userId: 'user-lf', name: 'Lu\u00eds F.', initials: 'LF' },
      { userId: 'user-rb', name: 'Rita B.', initials: 'RB' },
    ],
  },
  {
    id: 'ride-3',
    from: 'Ericeira', to: 'Sintra',
    date: 'Friday', time: '2\u20134pm',
    driverName: 'Jo\u00e3o P.', driverId: 'user-jp',
    driverInitials: 'JP', driverRidesShared: 5,
    totalSeats: 3, filledSeats: 3, donation: 15,
    status: 'full',
    passengers: [
      { userId: 'user-ts', name: 'Toby S.', initials: 'TS' },
      { userId: 'user-cs', name: 'Clara S.', initials: 'CS' },
      { userId: 'user-mf', name: 'Marta F.', initials: 'MF' },
    ],
  },
  {
    id: 'ride-4',
    from: 'Mafra', to: 'Lisbon',
    date: 'Monday', time: '7:30am',
    driverName: 'Tiago L.', driverId: 'user-ts',
    driverInitials: 'TL', driverRidesShared: 3,
    totalSeats: 4, filledSeats: 1, donation: 8,
    status: 'open',
    passengers: [
      { userId: 'user-pt', name: 'Pedro T.', initials: 'PT' },
    ],
  },
];

export const requests: RideRequest[] = [
  {
    id: 'req-1',
    from: 'Lisbon', to: 'Ericeira',
    preferredDate: 'Saturday, afternoon preferred',
    requesterName: 'Clara S.', requesterId: 'user-cs',
    note: 'Need to get back after visiting family. Flexible on exact time.',
  },
  {
    id: 'req-2',
    from: 'Ericeira', to: 'Mafra',
    preferredDate: 'Monday, morning',
    requesterName: 'Pedro T.', requesterId: 'user-pt',
    note: 'Doctor appointment at 10am. Can leave as early as 8.',
  },
  {
    id: 'req-3',
    from: 'Sintra', to: 'Ericeira',
    preferredDate: 'Wednesday, evening',
    requesterName: 'Marta F.', requesterId: 'user-mf',
  },
];

export const dashboardRides: DashboardItem[] = [
  { id: 'ride-4', route: 'Ericeira \u2192 Lisbon', meta: 'Today, 4\u20136pm \u00b7 2/4 seats', badge: 'open' },
];

export const dashboardSeats: DashboardItem[] = [
  { id: 'ride-2', route: 'Lisbon \u2192 Ericeira', meta: 'Tomorrow, 9am \u00b7 Sara M. driving', badge: 'confirmed' },
  { id: 'ride-3', route: 'Ericeira \u2192 Sintra', meta: 'Friday, 2\u20134pm \u00b7 Jo\u00e3o P. driving', badge: 'full' },
];

export const dashboardRequests: DashboardItem[] = [
  { id: 'req-x', route: 'Mafra \u2192 Ericeira', meta: 'Next week, flexible', badge: 'pending' },
];
