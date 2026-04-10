'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getRequests() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('requests')
    .select('*, requester:profiles!requester_id(id, display_name)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createRequest(prevState: { error: string } | null, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('requests').insert({
    requester_id: user.id,
    origin: formData.get('origin') as string,
    destination: formData.get('destination') as string,
    preferred_date: formData.get('preferredDate') as string,
    preferred_time: (formData.get('preferredTime') as string) || null,
    note: (formData.get('note') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/requests')
  redirect('/requests')
}

export async function deleteRequest(requestId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('requests').delete().eq('id', requestId)

  if (error) return { error: error.message }

  revalidatePath('/requests')
  revalidatePath('/dashboard')
  return { success: true }
}
