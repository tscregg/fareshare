import Avatar from '@/components/ui/Avatar';

interface DriverCardProps {
  name: string;
  initials: string;
  ridesShared: number;
}

export default function DriverCard({ name, initials, ridesShared }: DriverCardProps) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim mb-3">
        Driver
      </p>
      <div className="flex items-center gap-3.5 border border-border px-4 py-3">
        <Avatar initials={initials} size="md" variant="filled" />
        <div>
          <p className="text-[15px] font-semibold text-text-primary">{name}</p>
          <p className="text-[12px] text-text-muted">{ridesShared} rides shared</p>
        </div>
      </div>
    </div>
  );
}
