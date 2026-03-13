import { BadgeVariant } from '@/lib/types';
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BadgeVariant, string> = {
  open: 'text-status-open bg-status-open-bg',
  full: 'text-status-full bg-status-full-bg',
  confirmed: 'text-accent bg-accent-muted',
  pending: 'text-accent bg-accent-muted',
  request: 'text-accent bg-accent-muted',
};

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-[1px]',
        variantStyles[variant]
      )}
    >
      {children}
    </span>
  );
}
