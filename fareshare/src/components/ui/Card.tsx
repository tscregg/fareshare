import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <div className={cn('border border-border bg-bg-card p-4', className)}>
      {children}
    </div>
  );
}
