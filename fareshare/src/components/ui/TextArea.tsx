import { cn } from '@/lib/utils';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}

export default function TextArea({ label, className, ...props }: TextAreaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim">
        {label}
      </label>
      <textarea
        className={cn(
          'bg-transparent border border-border px-4 py-3.5 text-[14px] text-text-primary placeholder:text-text-dim outline-none focus:border-accent h-[80px] resize-none',
          className
        )}
        {...props}
      />
    </div>
  );
}
