import { Mastra } from '@mastra/core'
import { PostgresStore } from '@mastra/pg'
import { fareshareAgent } from './agents/fareshare-agent'

const storage = process.env.POSTGRES_URL
  ? new PostgresStore({
      id: 'fareshare-storage',
      connectionString: process.env.POSTGRES_URL,
    })
  : undefined

export const mastra = new Mastra({
  agents: { fareshareAgent },
  ...(storage && { storage }),
})
