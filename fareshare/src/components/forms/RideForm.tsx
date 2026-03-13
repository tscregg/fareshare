import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import Button from '@/components/ui/Button';
import DonationNudge from '@/components/rides/DonationNudge';
import { Ride } from '@/lib/types';

interface RideFormProps {
  mode: 'post' | 'edit';
  ride?: Ride;
}

export default function RideForm({ mode, ride }: RideFormProps) {
  return (
    <div className="flex flex-col gap-[18px]">
      <Input
        label="From"
        placeholder="Departure location"
        defaultValue={ride?.from}
      />
      <Input
        label="To"
        placeholder="Destination"
        defaultValue={ride?.to}
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <DatePicker
            label="Date"
            defaultValue={ride ? new Date(2026, 1, 27) : new Date()}
          />
        </div>
        <div className="flex-1">
          <TimePicker
            label="Time"
            defaultValue={ride ? '4:00 PM' : undefined}
          />
        </div>
      </div>
      <Input
        label="Seats Available"
        placeholder="4"
        defaultValue={ride ? String(ride.totalSeats) : undefined}
      />
      <TextArea
        label="Note (Optional)"
        placeholder="Anything passengers should know?"
        defaultValue={ride?.note}
      />

      {mode === 'post' && (
        <DonationNudge text="Add a recommended donation to help cover fuel costs" />
      )}

      <div className="flex flex-col gap-3 mt-2">
        <Button>{mode === 'post' ? 'POST RIDE' : 'SAVE CHANGES'}</Button>
        {mode === 'edit' && (
          <Button variant="outlined">CANCEL</Button>
        )}
      </div>
    </div>
  );
}
