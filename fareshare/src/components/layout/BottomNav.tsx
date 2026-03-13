'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Plus, User } from 'lucide-react';

const navItems = [
  { label: 'RIDES', icon: Compass, href: '/rides' },
  { label: 'ADD RIDE', icon: Plus, href: '/post/ride' },
  { label: 'YOU', icon: User, href: '/dashboard' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 border-t border-border bg-bg px-6 pt-3.5 pb-7">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === '/rides'
              ? pathname.startsWith('/rides') || pathname.startsWith('/requests')
              : item.href === '/post/ride'
                ? pathname.startsWith('/post')
                : pathname.startsWith('/dashboard');

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1"
            >
              <item.icon
                size={22}
                className={isActive ? 'text-accent' : 'text-text-dim'}
              />
              <span
                className={`text-[9px] font-medium uppercase tracking-[1px] ${
                  isActive ? 'text-accent font-semibold' : 'text-text-dim'
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
