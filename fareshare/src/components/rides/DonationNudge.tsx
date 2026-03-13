import { Heart } from 'lucide-react';

interface DonationNudgeProps {
  text: string;
}

export default function DonationNudge({ text }: DonationNudgeProps) {
  return (
    <div className="flex items-center gap-2 bg-accent-muted px-3.5 py-2.5">
      <Heart size={14} className="text-accent shrink-0" />
      <span className="text-[11px] text-text-muted">{text}</span>
    </div>
  );
}
