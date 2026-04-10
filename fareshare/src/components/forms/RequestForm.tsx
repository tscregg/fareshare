'use client';

import { useActionState } from 'react';
import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import Button from '@/components/ui/Button';
import { createRequest } from '@/lib/actions/requests';

export default function RequestForm() {
  const [state, formAction, pending] = useActionState(createRequest, null);

  return (
    <form action={formAction} className="flex flex-col gap-[18px]">
      <Input
        label="From"
        name="origin"
        placeholder="Where are you?"
        required
      />
      <Input
        label="To"
        name="destination"
        placeholder="Where do you need to go?"
        required
      />
      <div className="flex gap-3">
        <div className="flex-1">
          <DatePicker
            label="Preferred Date"
            name="preferredDate"
            defaultValue={new Date()}
          />
        </div>
        <div className="flex-1">
          <TimePicker
            label="Preferred Time"
            name="preferredTime"
          />
        </div>
      </div>
      <TextArea
        label="Note (Optional)"
        name="note"
        placeholder="Any details to help a driver?"
      />

      {state?.error && (
        <p className="text-[13px] text-danger">{state.error}</p>
      )}

      <div className="mt-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'POSTING...' : 'POST REQUEST'}
        </Button>
      </div>
    </form>
  );
}
