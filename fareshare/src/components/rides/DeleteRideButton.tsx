'use client'

import { useTransition } from 'react'
import Button from '@/components/ui/Button'
import { deleteRide } from '@/lib/actions/rides'
import { Trash2 } from 'lucide-react'

export default function DeleteRideButton({ rideId }: { rideId: string }) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Delete this ride? This cannot be undone.')) return

    startTransition(async () => {
      const result = await deleteRide(rideId)
      if (result?.error) {
        alert(result.error)
      }
    })
  }

  return (
    <Button variant="danger-outlined" icon={Trash2} onClick={handleDelete} disabled={pending}>
      {pending ? 'DELETING...' : 'DELETE RIDE'}
    </Button>
  )
}
