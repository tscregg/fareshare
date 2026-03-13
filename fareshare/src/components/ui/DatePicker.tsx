'use client';

import { useState, useRef, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';

interface DatePickerProps {
  label: string;
  defaultValue?: Date;
  onChange?: (date: Date | undefined) => void;
}

export default function DatePicker({ label, defaultValue, onChange }: DatePickerProps) {
  const [selected, setSelected] = useState<Date | undefined>(defaultValue);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(date: Date | undefined) {
    setSelected(date);
    onChange?.(date);
    setOpen(false);
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref}>
      <label className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="bg-transparent border border-border px-4 py-3.5 text-[14px] text-left flex items-center justify-between cursor-pointer"
      >
        <span className={selected ? 'text-text-primary' : 'text-text-dim'}>
          {selected ? format(selected, 'd MMM yyyy') : 'Select date'}
        </span>
        <CalendarDays size={16} className="text-text-dim" />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 border border-border bg-bg-card p-3">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected || new Date()}
            disabled={{ before: new Date() }}
            classNames={{
              root: 'font-body text-text-primary',
              months: 'flex flex-col',
              month_caption: 'flex items-center justify-center mb-3',
              caption_label: 'text-[14px] font-semibold text-text-primary',
              nav: 'flex items-center justify-between absolute top-3 left-0 right-0 px-1',
              button_previous: 'text-text-muted hover:text-accent cursor-pointer p-1',
              button_next: 'text-text-muted hover:text-accent cursor-pointer p-1',
              weekdays: 'flex',
              weekday: 'w-9 text-center text-[10px] font-semibold uppercase tracking-[1px] text-text-dim pb-2',
              week: 'flex',
              day: 'w-9 h-9 flex items-center justify-center text-[13px]',
              day_button: 'w-full h-full flex items-center justify-center cursor-pointer hover:bg-bg-hover text-text-primary',
              selected: '!bg-accent !text-bg',
              today: 'text-accent font-bold',
              disabled: '!text-text-dim/30 !cursor-default hover:!bg-transparent',
              outside: 'text-text-dim/30',
            }}
          />
        </div>
      )}
    </div>
  );
}
