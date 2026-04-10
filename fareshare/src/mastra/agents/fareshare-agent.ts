import { Agent } from '@mastra/core/agent'
import { Memory } from '@mastra/memory'
import { instructions } from '../instructions'

export const fareshareAgent = new Agent({
  id: 'fareshare-agent',
  name: 'FareShare Agent',
  instructions,
  model: 'anthropic/claude-sonnet-4-20250514',
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
  }),
})
