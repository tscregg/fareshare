'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const tabs = [
  { label: 'FIND A DRIVER', href: '/rides' },
  { label: 'FIND A PASSENGER', href: '/requests' },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.label}
            href={tab.href}
            className={`flex-1 text-center py-3.5 text-[11px] uppercase tracking-[1px] ${
              isActive
                ? 'bg-accent text-bg font-bold'
                : 'text-text-dim font-medium'
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
