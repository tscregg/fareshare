import { Chat } from 'chat'
import { createTelegramAdapter } from '@chat-adapter/telegram'
import { createPostgresState } from '@chat-adapter/state-pg'
import { createMemoryState } from '@chat-adapter/state-memory'
import { callAgent, resolveUser } from './bridge'

const state = process.env.POSTGRES_URL
  ? createPostgresState({ url: process.env.POSTGRES_URL })
  : createMemoryState()

const bot = new Chat({
  userName: process.env.TELEGRAM_BOT_USERNAME || 'Fareshare_bot',
  adapters: {
    telegram: createTelegramAdapter(),
  },
  state,
})

bot.onNewMention(async (thread, message) => {
  await thread.subscribe()

  const telegramId = message.author.userId
  const displayName = message.author.fullName || message.author.userName || null
  const profile = await resolveUser(telegramId, displayName)

  const text = message.text?.trim()
  if (!text) {
    await thread.post('Send a text message and I can help you find or share a ride.')
    return
  }

  const response = await callAgent(text, thread.id, profile.id)
  await thread.post(response)
})

bot.onSubscribedMessage(async (thread, message) => {
  const telegramId = message.author.userId
  const displayName = message.author.fullName || message.author.userName || null
  const profile = await resolveUser(telegramId, displayName)

  const text = message.text?.trim()
  if (!text) return

  const response = await callAgent(text, thread.id, profile.id)
  await thread.post(response)
})

export { bot }
