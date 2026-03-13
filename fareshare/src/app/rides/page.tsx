import MobileShell from '@/components/layout/MobileShell';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import BottomNav from '@/components/layout/BottomNav';
import RideCard from '@/components/rides/RideCard';
import { rides } from '@/lib/mock-data';

export default function RidesPage() {
  return (
    <MobileShell>
      <Header />
      <TabBar />
      <div className="flex-1 px-6 py-5 flex flex-col gap-3 pb-4">
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
