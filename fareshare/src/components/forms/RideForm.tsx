'use client';

import { useActionState } from 'react';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import Button from '@/components/ui/Button';
import DonationNudge from '@/components/rides/DonationNudge';
import { createRide } from '@/lib/actions/rides';
import { Ride } from '@/lib/types';

interface RideFormProps {
  mode: 'post' | 'edit';
  ride?: Ride;
}

export default function RideForm({ mode, ride }: RideFormProps) {
  const [state, formAction, pending] = useActionState(createRide, null);

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <Input
        label="From"
        name="origin"
        placeholder="Departure location"
        defaultValue={ride?.from}
        required
      />
      <Input
        label="To"
        name="destination"
        placeholder="Destination"
        defaultValue={ride?.to}
        required
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <DatePicker
            label="Date"
            name="departureDate"
            defaultValue={ride ? new Date(2026, 1, 27) : new Date()}
          />
        </div>
        <div className="flex-1">
          <TimePicker
            label="Time"
            name="departureTime"
            defaultValue={ride ? '4:00 PM' : undefined}
          />
        </div>
      </div>
      <Input
        label="Seats Available"
        name="totalSeats"
        type="number"
        min="1"
        max="8"
        placeholder="4"
        defaultValue={ride ? String(ride.totalSeats) : undefined}
        required
      />
      <Input
        label="Suggested Donation"
        name="donation"
        type="number"
        min="0"
        step="0.50"
        placeholder="10"
      />
      <TextArea
        label="Note (Optional)"
        name="note"
        placeholder="Anything passengers should know?"
        defaultValue={ride?.note}
      />

      {mode === 'post' && (
        <DonationNudge text="Add a recommended donation to help cover fuel costs" />
      )}

      {state?.error && (
        <p className="text-[13px] text-danger">{state.error}</p>
      )}

      <div className="flex flex-col gap-3 mt-2">
        <Button type="submit" disabled={pending}>
          {pending
            ? (mode === 'post' ? 'POSTING...' : 'SAVING...')
            : (mode === 'post' ? 'POST RIDE' : 'SAVE CHANGES')}
        </Button>
        {mode === 'edit' && (
          <Button variant="outlined" type="button">CANCEL</Button>
        )}
      </div>
    </form>
  );
}
