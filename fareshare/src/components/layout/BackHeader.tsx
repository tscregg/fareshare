'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackHeaderProps {
  label: string;
}

export default function BackHeader({ label }: BackHeaderProps) {
  const router = useRouter();

  return (
    <header
      className="flex items-center gap-3 px-6 py-5 border-b border-border cursor-pointer"
      onClick={() => router.back()}
    >
      <ArrowLeft size={20} className="text-accent" />
      <span className="text-[14px] text-text-muted font-medium">{label}</span>
    </header>
  );
}
