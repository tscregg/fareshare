import { Passenger } from '@/lib/types';
import Avatar from '@/components/ui/Avatar';

interface PassengerRowProps {
  passenger: Passenger;
}

export default function PassengerRow({ passenger }: PassengerRowProps) {
  return (
    <div className="flex items-center gap-3 px-3.5 py-2.5">
      <Avatar initials={passenger.initials} size="sm" />
      <span className="text-[14px] text-text-primary">{passenger.name}</span>
    </div>
  );
}
