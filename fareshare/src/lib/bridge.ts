import { supabase } from './supabase/service'
import { mastra } from '../mastra'

interface Profile {
  id: string
  telegram_id: string
  display_name: string | null
}

export async function resolveUser(
  telegramId: string,
  displayName: string | null
): Promise<Profile> {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, telegram_id, display_name')
    .eq('telegram_id', telegramId)
    .single()

  if (existing) return existing as Profile

  const { data: created, error } = await supabase
    .from('profiles')
    .insert({
      telegram_id: telegramId,
      display_name: displayName,
    })
    .select('id, telegram_id, display_name')
    .single()

  if (error) throw new Error(`Failed to create profile: ${error.message}`)
  return created as Profile
}

export async function callAgent(
  message: string,
  threadId: string,
  userId: string
): Promise<string> {
  const agent = mastra.getAgent('fareshareAgent')

  const response = await agent.generate(message, {
    memory: {
      thread: threadId,
      resource: userId,
    },
  })

  return response.text
}
