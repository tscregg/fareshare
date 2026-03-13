import { cn } from '@/lib/utils';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-[14px]',
  lg: 'w-[44px] h-[44px] text-[13px]',
};

export default function Avatar({ initials, size = 'md', variant = 'default' }: AvatarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-center font-bold shrink-0',
        variant === 'filled'
          ? 'bg-accent text-bg'
          : 'bg-accent-muted text-accent',
        sizeStyles[size]
      )}
    >
      {initials}
    </div>
  );
}
