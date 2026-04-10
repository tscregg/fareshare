import MobileShell from '@/components/layout/MobileShell';
import Header from '@/components/layout/Header';
import TabBar from '@/components/layout/TabBar';
import BottomNav from '@/components/layout/BottomNav';
import RideCard from '@/components/rides/RideCard';
import { getRides } from '@/lib/actions/rides';
import { mapRide } from '@/lib/mappers';

export default async function RidesPage() {
  const rawRides = await getRides();
  const rides = rawRides.map(mapRide);

  return (
    <MobileShell>
      <Header />
      <TabBar />
      <div className="flex-1 px-6 py-5 flex flex-col gap-3 pb-4">
        {rides.length === 0 ? (
          <p className="text-[13px] text-text-dim text-center py-10">
            No rides available right now. Check back later or post a request.
          </p>
        ) : (
          rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} />
          ))
        )}
      </div>
      <BottomNav />
    </MobileShell>
  );
}
