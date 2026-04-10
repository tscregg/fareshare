import { notFound } from 'next/navigation';
import Link from 'next/link';
import MobileShell from '@/components/layout/MobileShell';
import BackHeader from '@/components/layout/BackHeader';
import RideDetailTop from '@/components/rides/RideDetailTop';
import DriverCard from '@/components/rides/DriverCard';
import SeatGrid from '@/components/rides/SeatGrid';
import PassengerRow from '@/components/rides/PassengerRow';
import DonationNudge from '@/components/rides/DonationNudge';
import Button from '@/components/ui/Button';
import ClaimSeatButton from '@/components/rides/ClaimSeatButton';
import CancelSeatButton from '@/components/rides/CancelSeatButton';
import DeleteRideButton from '@/components/rides/DeleteRideButton';
import { getRideById } from '@/lib/actions/rides';
import { mapRide } from '@/lib/mappers';
import { createClient } from '@/lib/supabase/server';
import { Pencil } from 'lucide-react';

interface RideDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RideDetailPage({ params }: RideDetailPageProps) {
  const { id } = await params;
  const rawRide = await getRideById(id);

  if (!rawRide) return notFound();

  const ride = mapRide(rawRide);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const isDriver = ride.driverId === user?.id;
  const isPassenger = ride.passengers.some((p) => p.userId === user?.id);
  const emptySeats = ride.totalSeats - ride.filledSeats;

  return (
    <MobileShell>
      <BackHeader label={isDriver ? 'Your Ride' : 'Ride Details'} />
      <div className="px-6 py-7 flex flex-col gap-7">
        <RideDetailTop ride={ride} />

        {!isDriver && (
          <DriverCard
            name={ride.driverName}
            initials={ride.driverInitials}
            ridesShared={ride.driverRidesShared}
          />
        )}

        {isDriver ? (
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[1px] text-text-dim mb-3">
              Passengers ({ride.filledSeats}/{ride.totalSeats})
            </p>
            <div className="flex flex-col border border-border divide-y divide-border">
              {ride.passengers.map((p) => (
                <PassengerRow key={p.userId} passenger={p} />
              ))}
              {emptySeats > 0 && (
                <div className="flex items-center justify-center py-3">
                  <span className="text-[12px] text-text-dim">
                    {emptySeats} seat{emptySeats > 1 ? 's' : ''} remaining
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <SeatGrid passengers={ride.passengers} totalSeats={ride.totalSeats} />
        )}

        <div className="flex flex-col gap-3">
          {isDriver ? (
            <>
              <Link href={`/edit/ride/${ride.id}`}>
                <Button icon={Pencil}>EDIT RIDE</Button>
              </Link>
              <DeleteRideButton rideId={ride.id} />
            </>
          ) : isPassenger ? (
            <>
              <CancelSeatButton rideId={ride.id} />
              <Button variant="outlined">MESSAGE DRIVER</Button>
            </>
          ) : (
            <>
              {ride.status === 'open' ? (
                <ClaimSeatButton rideId={ride.id} />
              ) : (
                <Button disabled>RIDE IS FULL</Button>
              )}
              <Button variant="outlined">MESSAGE DRIVER</Button>
              <DonationNudge
                text={`Recommended donation: ~\u20AC${ride.donation} per seat`}
              />
            </>
          )}
        </div>
      </div>
    </MobileShell>
  );
}
