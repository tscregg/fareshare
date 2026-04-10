'use client'

import { useTransition } from 'react'
import Button from '@/components/ui/Button'
import { signOut } from '@/lib/actions/auth'

export default function SignOutButton() {
  const [pending, startTransition] = useTransition()

  function handleSignOut() {
    startTransition(async () => {
      await signOut()
    })
  }

  return (
    <Button variant="outlined" onClick={handleSignOut} disabled={pending}>
      {pending ? 'LOGGING OUT...' : 'LOG OUT'}
    </Button>
  )
}
