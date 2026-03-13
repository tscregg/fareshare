import MobileShell from '@/components/layout/MobileShell';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import { currentUser, dashboardRides, dashboardSeats, dashboardRequests } from '@/lib/mock-data';
import { DashboardItem } from '@/lib/types';

function DashboardSection({ label, items }: { label: string; items: DashboardItem[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-muted mb-3">
        {label}
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="border border-border bg-bg-card px-4 py-3 flex items-center justify-between"
          >
            <div>
              <p className="text-[14px] font-semibold text-text-primary">{item.route}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{item.meta}</p>
            </div>
            <Badge variant={item.badge}>{item.badge.toUpperCase()}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <MobileShell>
      <header className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h1 className="font-heading text-[24px] tracking-[2px] text-text-primary">
          FARESHARE
        </h1>
        <Avatar initials={currentUser.initials} size="sm" />
      </header>
      <div className="px-6 py-7 flex flex-col gap-7">
        <div>
          <h2 className="font-heading text-[28px] tracking-[1px] text-text-primary">
            YOUR DASHBOARD
          </h2>
          <p className="text-[13px] text-text-dim">
            Manage your rides, seats, and requests
          </p>
        </div>
        <DashboardSection label="My Rides" items={dashboardRides} />
        <DashboardSection label="My Seats" items={dashboardSeats} />
        <DashboardSection label="My Requests" items={dashboardRequests} />
      </div>
      <BottomNav />
    </MobileShell>
  );
}
