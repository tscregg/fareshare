'use client'

import { useTransition } from 'react'
import Button from '@/components/ui/Button'
import { cancelSeat } from '@/lib/actions/seats'

export default function CancelSeatButton({ rideId }: { rideId: string }) {
  const [pending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSeat(rideId)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button variant="danger-outlined" onClick={handleCancel} disabled={pending}>
      {pending ? 'CANCELLING...' : 'CANCEL SEAT'}
    </Button>
  )
}
