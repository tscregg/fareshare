import MobileShell from '@/components/layout/MobileShell';
import BottomNav from '@/components/layout/BottomNav';
import Badge from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import SignOutButton from '@/components/layout/SignOutButton';
import { getDashboardData } from '@/lib/actions/dashboard';
import { getInitials } from '@/lib/utils';
import { DashboardItem, BadgeVariant } from '@/lib/types';

function formatDashDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((date.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}

function DashboardSection({ label, items }: { label: string; items: DashboardItem[] }) {
  if (items.length === 0) return null;

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

export default async function DashboardPage() {
  const { myRides, mySeats, myRequests, profile } = await getDashboardData();

  const initials = profile ? getInitials(profile.display_name) : '??';

  const dashboardRides: DashboardItem[] = (myRides ?? []).map((r: any) => {
    const seatCount = r.seats?.[0]?.count ?? 0;
    return {
      id: r.id,
      route: `${r.origin} \u2192 ${r.destination}`,
      meta: `${formatDashDate(r.departure_date)}, ${r.departure_time} \u00b7 ${seatCount}/${r.total_seats} seats`,
      badge: r.status as BadgeVariant,
    };
  });

  const dashboardSeats: DashboardItem[] = (mySeats ?? []).map((s: any) => ({
    id: s.ride.id,
    route: `${s.ride.origin} \u2192 ${s.ride.destination}`,
    meta: `${formatDashDate(s.ride.departure_date)}, ${s.ride.departure_time} \u00b7 ${s.ride.driver.display_name} driving`,
    badge: 'confirmed' as BadgeVariant,
  }));

  const dashboardRequests: DashboardItem[] = (myRequests ?? []).map((r: any) => ({
    id: r.id,
    route: `${r.origin} \u2192 ${r.destination}`,
    meta: r.preferred_date + (r.preferred_time ? `, ${r.preferred_time}` : ''),
    badge: 'pending' as BadgeVariant,
  }));

  return (
    <MobileShell>
      <header className="flex items-center justify-between px-6 py-5 border-b border-border">
        <h1 className="font-heading text-[24px] tracking-[2px] text-text-primary">
          FARESHARE
        </h1>
        <Avatar initials={initials} size="sm" />
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
        <SignOutButton />
      </div>
      <BottomNav />
    </MobileShell>
  );
}
