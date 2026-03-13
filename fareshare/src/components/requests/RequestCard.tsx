import { RideRequest } from '@/lib/types';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface RequestCardProps {
  request: RideRequest;
}

export default function RequestCard({ request }: RequestCardProps) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[15px] font-bold tracking-[-0.3px] text-text-primary">
          {request.from.toUpperCase()} &rarr; {request.to.toUpperCase()}
        </span>
        <Badge variant="request">REQUEST</Badge>
      </div>
      <p className="text-[12px] text-text-muted mb-2">
        {request.preferredDate} &middot; {request.requesterName}
      </p>
      {request.note && (
        <p className="text-[12px] text-text-dim mb-3">{request.note}</p>
      )}
      <Button variant="outlined-accent">I CAN DO THIS</Button>
    </Card>
  );
}
