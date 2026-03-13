import { Passenger } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';
import { Plus } from 'lucide-react';

interface SeatGridProps {
  passengers: Passenger[];
  totalSeats: number;
}

export default function SeatGrid({ passengers, totalSeats }: SeatGridProps) {
  const emptySeats = totalSeats - passengers.length;

  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim mb-3">
        Passengers ({passengers.length}/{totalSeats})
      </p>
      <div className="flex gap-2">
        {passengers.map((p) => (
          <Avatar key={p.userId} initials={p.initials} size="lg" />
        ))}
        {Array.from({ length: emptySeats }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="w-[44px] h-[44px] border border-border flex items-center justify-center"
          >
            <Plus size={16} className="text-text-dim" />
          </div>
        ))}
      </div>
    </div>
  );
}
