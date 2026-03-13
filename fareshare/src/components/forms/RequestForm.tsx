import Input from '@/components/ui/Input';
import TextArea from '@/components/ui/TextArea';
import DatePicker from '@/components/ui/DatePicker';
import TimePicker from '@/components/ui/TimePicker';
import Button from '@/components/ui/Button';

export default function RequestForm() {
  return (
    <div className="flex flex-col gap-[18px]">
      <Input label="From" placeholder="Where are you?" />
      <Input label="To" placeholder="Where do you need to go?" />
      <div className="flex gap-3">
        <div className="flex-1">
          <DatePicker
            label="Preferred Date"
            defaultValue={new Date()}
          />
        </div>
        <div className="flex-1">
          <TimePicker
            label="Preferred Time"
          />
        </div>
      </div>
      <TextArea
        label="Note (Optional)"
        placeholder="Any details to help a driver?"
      />
      <div className="mt-2">
        <Button>POST REQUEST</Button>
      </div>
    </div>
  );
}
