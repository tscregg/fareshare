'use client';

import { useState } from 'react';
import MobileShell from '@/components/layout/MobileShell';
import BackHeader from '@/components/layout/BackHeader';
import RideForm from '@/components/forms/RideForm';
import RequestForm from '@/components/forms/RequestForm';

type PostMode = 'driver' | 'passenger';

export default function PostRidePage() {
  const [mode, setMode] = useState<PostMode>('driver');

  return (
    <MobileShell>
      <BackHeader label="Back" />
      <div className="px-6 py-7">
        <h1 className="font-heading text-[32px] tracking-[1px] text-text-primary">
          {mode === 'driver' ? 'POST A RIDE' : 'POST A REQUEST'}
        </h1>
        <p className="text-[13px] text-text-dim mb-5">
          {mode === 'driver'
            ? 'Share your ride with the community'
            : 'Let drivers know where you need to go'}
        </p>

        <div className="flex mb-7">
          <button
            onClick={() => setMode('driver')}
            className={`flex-1 text-center py-3 text-[11px] uppercase tracking-[1px] cursor-pointer ${
              mode === 'driver'
                ? 'bg-accent text-bg font-bold'
                : 'text-text-dim font-medium border-b border-border'
            }`}
          >
            I&apos;m driving
          </button>
          <button
            onClick={() => setMode('passenger')}
            className={`flex-1 text-center py-3 text-[11px] uppercase tracking-[1px] cursor-pointer ${
              mode === 'passenger'
                ? 'bg-accent text-bg font-bold'
                : 'text-text-dim font-medium border-b border-border'
            }`}
          >
            I need a ride
          </button>
        </div>

        {mode === 'driver' ? <RideForm mode="post" /> : <RequestForm />}
      </div>
    </MobileShell>
  );
}
