'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import MobileShell from '@/components/layout/MobileShell'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { signIn } from '@/lib/actions/auth'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signIn, null)

  return (
    <MobileShell>
      <div className="flex-1 flex flex-col justify-center px-6 py-12">
        <h1 className="font-heading text-[40px] tracking-[2px] text-text-primary text-center mb-1">
          FARESHARE
        </h1>
        <p className="text-[13px] text-text-dim text-center mb-10">
          Community rides, Ericeira to Lisbon
        </p>

        <form action={formAction} className="flex flex-col gap-[18px]">
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Your password"
            required
          />

          {state?.error && (
            <p className="text-[13px] text-danger">{state.error}</p>
          )}

          <div className="mt-2">
            <Button type="submit" disabled={pending}>
              {pending ? 'LOGGING IN...' : 'LOG IN'}
            </Button>
          </div>
        </form>

        <p className="text-[13px] text-text-dim text-center mt-8">
          No account yet?{' '}
          <Link href="/signup" className="text-accent underline">
            Sign up
          </Link>
        </p>
      </div>
    </MobileShell>
  )
}
