'use client';

import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

const TIMES = [
  '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM',
  '8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM',
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
  '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM',
  '10:00 PM',
];

interface TimePickerProps {
  label: string;
  defaultValue?: string;
  onChange?: (time: string) => void;
}

export default function TimePicker({ label, defaultValue, onChange }: TimePickerProps) {
  const [selected, setSelected] = useState<string | undefined>(defaultValue);
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

  function handleSelect(time: string) {
    setSelected(time);
    onChange?.(time);
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
          {selected || 'Select time'}
        </span>
        <Clock size={16} className="text-text-dim" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 border border-border bg-bg-card max-h-[240px] overflow-y-auto">
          {TIMES.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => handleSelect(time)}
              className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer ${
                selected === time
                  ? 'bg-accent text-bg font-semibold'
                  : 'text-text-primary hover:bg-bg-hover'
              }`}
            >
              {time}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
