import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim">
        {label}
      </label>
      <input
        className={cn(
          'bg-transparent border border-border px-4 py-3.5 text-[14px] text-text-primary placeholder:text-text-dim outline-none focus:border-accent',
          className
        )}
        {...props}
      />
    </div>
  );
}
