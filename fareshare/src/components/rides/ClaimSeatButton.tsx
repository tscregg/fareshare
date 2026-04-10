'use client'

import { useTransition } from 'react'
import Button from '@/components/ui/Button'
import { claimSeat } from '@/lib/actions/seats'

export default function ClaimSeatButton({ rideId }: { rideId: string }) {
  const [pending, startTransition] = useTransition()

  function handleClaim() {
    startTransition(async () => {
      const result = await claimSeat(rideId)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button onClick={handleClaim} disabled={pending}>
      {pending ? 'CLAIMING...' : 'CLAIM A SEAT'}
    </Button>
  )
}
