'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const [ridesResult, seatsResult, requestsResult, profileResult] = await Promise.all([
    // My rides (where I'm the driver)
    supabase
      .from('rides')
      .select('*, seats(count)')
      .eq('driver_id', user.id)
      .in('status', ['open', 'full'])
      .order('departure_date'),

    // My seats (rides I've joined as passenger)
    supabase
      .from('seats')
      .select(`
        ride_id,
        ride:rides!ride_id(
          id, origin, destination, departure_date, departure_time,
          status, total_seats,
          driver:profiles!driver_id(display_name)
        )
      `)
      .eq('passenger_id', user.id),

    // My requests
    supabase
      .from('requests')
      .select('*')
      .eq('requester_id', user.id)
      .eq('status', 'open')
      .order('created_at', { ascending: false }),

    // Profile
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ])

  return {
    myRides: ridesResult.data ?? [],
    mySeats: seatsResult.data ?? [],
    myRequests: requestsResult.data ?? [],
    profile: profileResult.data,
    userId: user.id,
  }
}
