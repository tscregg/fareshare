import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-[13px]',
  lg: 'w-[44px] h-[44px] text-[13px]',
};

export default function Avatar({ initials, size = 'md' }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-accent-muted text-accent font-bold shrink-0',
        sizeStyles[size]
      )}
    >
      {initials}
    </div>
  );
}
