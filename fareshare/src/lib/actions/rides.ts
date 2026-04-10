'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getRides() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rides')
    .select(`
      *,
      driver:profiles!driver_id(id, display_name),
      seats(id, passenger:profiles!passenger_id(id, display_name))
    `)
    .in('status', ['open', 'full'])
    .order('departure_date', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getRideById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('rides')
    .select(`
      *,
      driver:profiles!driver_id(id, display_name),
      seats(id, passenger:profiles!passenger_id(id, display_name))
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function createRide(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('rides').insert({
    driver_id: user.id,
    origin: formData.get('origin') as string,
    destination: formData.get('destination') as string,
    departure_date: formData.get('departureDate') as string,
    departure_time: formData.get('departureTime') as string,
    total_seats: parseInt(formData.get('totalSeats') as string),
    suggested_donation: parseFloat(formData.get('donation') as string) || 0,
    note: (formData.get('note') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/rides')
  redirect('/rides')
}

export async function updateRide(id: string, prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('rides')
    .update({
      origin: formData.get('origin') as string,
      destination: formData.get('destination') as string,
      departure_date: formData.get('departureDate') as string,
      departure_time: formData.get('departureTime') as string,
      total_seats: parseInt(formData.get('totalSeats') as string),
      suggested_donation: parseFloat(formData.get('donation') as string) || 0,
      note: (formData.get('note') as string) || null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath(`/rides/${id}`)
  revalidatePath('/rides')
  redirect(`/rides/${id}`)
}

export async function deleteRide(rideId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('rides').delete().eq('id', rideId)

  if (error) return { error: error.message }

  revalidatePath('/rides')
  redirect('/rides')
}
