/**
 * Seed script: creates test users and sample data in Supabase.
 * Run with: npx tsx scripts/seed.ts
 */
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const TEST_PASSWORD = 'testpass123'

const users = [
  { email: 'miguel@fareshare.local', displayName: 'Miguel R.' },
  { email: 'sara@fareshare.local', displayName: 'Sara M.' },
  { email: 'joao@fareshare.local', displayName: 'João P.' },
  { email: 'tiago@fareshare.local', displayName: 'Tiago L.' },
  { email: 'ana@fareshare.local', displayName: 'Ana K.' },
  { email: 'joaol@fareshare.local', displayName: 'João L.' },
  { email: 'luis@fareshare.local', displayName: 'Luís F.' },
  { email: 'rita@fareshare.local', displayName: 'Rita B.' },
  { email: 'clara@fareshare.local', displayName: 'Clara S.' },
  { email: 'marta@fareshare.local', displayName: 'Marta F.' },
  { email: 'pedro@fareshare.local', displayName: 'Pedro T.' },
  { email: 'toby@fareshare.local', displayName: 'Toby S.' },
]

async function createUsers(): Promise<Record<string, string>> {
  const idMap: Record<string, string> = {}

  for (const user of users) {
    // Check if user already exists
    const { data: existing } = await supabase.auth.admin.listUsers()
    const found = existing?.users?.find((u) => u.email === user.email)

    if (found) {
      console.log(`  User exists: ${user.displayName} (${found.id})`)
      idMap[user.email] = found.id
      continue
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: TEST_PASSWORD,
      email_confirm: true,
      user_metadata: { display_name: user.displayName },
    })

    if (error) {
      console.error(`  Failed to create ${user.email}: ${error.message}`)
      continue
    }

    console.log(`  Created: ${user.displayName} (${data.user.id})`)
    idMap[user.email] = data.user.id
  }

  return idMap
}

async function seedRides(ids: Record<string, string>) {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const friday = new Date(today)
  friday.setDate(friday.getDate() + ((5 - friday.getDay() + 7) % 7 || 7))
  const monday = new Date(today)
  monday.setDate(monday.getDate() + ((1 - monday.getDay() + 7) % 7 || 7))

  const fmt = (d: Date) => d.toISOString().split('T')[0]

  const rides = [
    {
      driver_id: ids['miguel@fareshare.local'],
      origin: 'Ericeira',
      destination: 'Lisbon',
      departure_date: fmt(today),
      departure_time: '4–6pm',
      total_seats: 4,
      suggested_donation: 10,
      note: 'Leaving from the main square. Can pick up along the way.',
      status: 'open',
    },
    {
      driver_id: ids['sara@fareshare.local'],
      origin: 'Lisbon',
      destination: 'Ericeira',
      departure_date: fmt(tomorrow),
      departure_time: '9am',
      total_seats: 5,
      suggested_donation: 25,
      status: 'open',
    },
    {
      driver_id: ids['joao@fareshare.local'],
      origin: 'Ericeira',
      destination: 'Sintra',
      departure_date: fmt(friday),
      departure_time: '2–4pm',
      total_seats: 3,
      suggested_donation: 15,
      status: 'full',
    },
    {
      driver_id: ids['toby@fareshare.local'],
      origin: 'Mafra',
      destination: 'Lisbon',
      departure_date: fmt(monday),
      departure_time: '7:30am',
      total_seats: 4,
      suggested_donation: 8,
      status: 'open',
    },
  ]

  // Clear existing rides (cascades to seats)
  await supabase.from('seats').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('rides').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data, error } = await supabase.from('rides').insert(rides).select()
  if (error) {
    console.error('  Failed to insert rides:', error.message)
    return []
  }

  console.log(`  Inserted ${data.length} rides`)
  return data
}

async function seedSeats(rides: any[], ids: Record<string, string>) {
  const seatMap = [
    // Ride 0 (Miguel, Ericeira→Lisbon): Ana K. + João L.
    { rideIdx: 0, passengers: ['ana@fareshare.local', 'joaol@fareshare.local'] },
    // Ride 1 (Sara, Lisbon→Ericeira): Toby S. + Luís F. + Rita B.
    { rideIdx: 1, passengers: ['toby@fareshare.local', 'luis@fareshare.local', 'rita@fareshare.local'] },
    // Ride 2 (João P., Ericeira→Sintra): Toby S. + Clara S. + Marta F. (full)
    { rideIdx: 2, passengers: ['toby@fareshare.local', 'clara@fareshare.local', 'marta@fareshare.local'] },
    // Ride 3 (Toby, Mafra→Lisbon): Pedro T.
    { rideIdx: 3, passengers: ['pedro@fareshare.local'] },
  ]

  const seats = seatMap.flatMap(({ rideIdx, passengers }) =>
    passengers.map((email) => ({
      ride_id: rides[rideIdx].id,
      passenger_id: ids[email],
    }))
  )

  const { error } = await supabase.from('seats').insert(seats)
  if (error) {
    console.error('  Failed to insert seats:', error.message)
    return
  }

  console.log(`  Inserted ${seats.length} seats`)
}

async function seedRequests(ids: Record<string, string>) {
  await supabase.from('requests').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const requests = [
    {
      requester_id: ids['clara@fareshare.local'],
      origin: 'Lisbon',
      destination: 'Ericeira',
      preferred_date: 'Saturday',
      preferred_time: 'afternoon preferred',
      note: 'Need to get back after visiting family. Flexible on exact time.',
      status: 'open',
    },
    {
      requester_id: ids['pedro@fareshare.local'],
      origin: 'Ericeira',
      destination: 'Mafra',
      preferred_date: 'Monday',
      preferred_time: 'morning',
      note: 'Doctor appointment at 10am. Can leave as early as 8.',
      status: 'open',
    },
    {
      requester_id: ids['marta@fareshare.local'],
      origin: 'Sintra',
      destination: 'Ericeira',
      preferred_date: 'Wednesday',
      preferred_time: 'evening',
      status: 'open',
    },
  ]

  const { data, error } = await supabase.from('requests').insert(requests)
  if (error) {
    console.error('  Failed to insert requests:', error.message)
    return
  }

  console.log(`  Inserted ${requests.length} requests`)
}

async function main() {
  console.log('Seeding FareShare database...\n')

  console.log('1. Creating users...')
  const ids = await createUsers()

  const missingUsers = users.filter((u) => !ids[u.email])
  if (missingUsers.length > 0) {
    console.error(`Missing users: ${missingUsers.map((u) => u.email).join(', ')}`)
    process.exit(1)
  }

  console.log('\n2. Seeding rides...')
  const rides = await seedRides(ids)

  if (rides.length > 0) {
    console.log('\n3. Seeding seats...')
    await seedSeats(rides, ids)
  }

  console.log('\n4. Seeding requests...')
  await seedRequests(ids)

  console.log('\nDone.')
}

main().catch(console.error)
