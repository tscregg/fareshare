import Link from 'next/link';
import { Ride } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

interface RideCardProps {
  ride: Ride;
}

export default function RideCard({ ride }: RideCardProps) {
  return (
    <Link href={`/rides/${ride.id}`}>
      <Card>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[15px] font-bold tracking-[-0.3px] text-text-primary">
            {ride.from.toUpperCase()} &rarr; {ride.to.toUpperCase()}
          </span>
          <Badge variant={ride.status}>
            {ride.status.toUpperCase()}
          </Badge>
        </div>
        <p className="text-[12px] text-text-muted mb-2">
          {ride.date}, {ride.time} &middot; {ride.driverName}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-text-dim">
            {ride.filledSeats}/{ride.totalSeats} seats
          </span>
          <span className="text-[13px] font-semibold text-accent">
            ~&euro;{ride.donation} rec. donation
          </span>
        </div>
      </Card>
    </Link>
  );
}
