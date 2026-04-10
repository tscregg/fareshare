'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function claimSeat(rideId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Check seat availability
  const { data: ride } = await supabase
    .from('rides')
    .select('total_seats')
    .eq('id', rideId)
    .single()

  if (!ride) return { error: 'Ride not found' }

  const { count } = await supabase
    .from('seats')
    .select('*', { count: 'exact', head: true })
    .eq('ride_id', rideId)

  const filledSeats = count ?? 0
  if (filledSeats >= ride.total_seats) return { error: 'This ride is full' }

  const { error } = await supabase.from('seats').insert({
    ride_id: rideId,
    passenger_id: user.id,
  })

  if (error) {
    if (error.code === '23505') return { error: 'You already have a seat on this ride' }
    return { error: error.message }
  }

  // Auto-update ride status to 'full' if last seat claimed
  if (filledSeats + 1 >= ride.total_seats) {
    await supabase.from('rides').update({ status: 'full' }).eq('id', rideId)
  }

  revalidatePath(`/rides/${rideId}`)
  revalidatePath('/rides')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function cancelSeat(rideId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('seats')
    .delete()
    .eq('ride_id', rideId)
    .eq('passenger_id', user.id)

  if (error) return { error: error.message }

  // Revert status from 'full' to 'open' if a seat freed up
  await supabase
    .from('rides')
    .update({ status: 'open' })
    .eq('id', rideId)
    .eq('status', 'full')

  revalidatePath(`/rides/${rideId}`)
  revalidatePath('/rides')
  revalidatePath('/dashboard')
  return { success: true }
}
