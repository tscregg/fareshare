import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

type ButtonVariant = 'primary' | 'outlined' | 'outlined-accent' | 'danger-outlined';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: LucideIcon;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-bg font-heading text-[18px] tracking-[2px] uppercase py-4',
  outlined:
    'bg-transparent text-text-primary font-body text-[13px] font-medium border border-text-primary py-3.5',
  'outlined-accent':
    'bg-transparent text-accent font-body text-[12px] font-semibold tracking-[1px] uppercase border border-accent py-2.5',
  'danger-outlined':
    'bg-transparent text-danger font-body text-[13px] font-semibold border border-danger py-3.5',
};

export default function Button({
  variant = 'primary',
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'w-full flex items-center justify-center gap-2 cursor-pointer',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
