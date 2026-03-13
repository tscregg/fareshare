import { Ride } from '@/lib/types';

interface RideDetailTopProps {
  ride: Ride;
}

export default function RideDetailTop({ ride }: RideDetailTopProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim mb-1.5">
        Route
      </p>
      <h2 className="font-heading text-[28px] tracking-[1px] text-text-primary mb-4">
        {ride.from.toUpperCase()} &rarr; {ride.to.toUpperCase()}
      </h2>
      <div className="flex gap-3">
        <div className="flex-1 border border-border p-3.5 flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[1px] text-text-dim">
            When
          </span>
          <span className="text-[16px] font-bold text-text-primary">{ride.date}</span>
          <span className="text-[12px] text-text-muted">{ride.time}</span>
        </div>
        <div className="flex-1 border border-accent p-3.5 flex flex-col gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-[1px] text-text-dim">
            Rec. Donation
          </span>
          <span className="text-[16px] font-bold text-accent">~&euro;{ride.donation}</span>
          <span className="text-[12px] text-text-muted">per seat</span>
        </div>
      </div>
    </div>
  );
}
