import { useState } from 'react'
import { useChatStore } from '../store/chatStore'

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`

const SYSTEM_CONTEXT = `You are a helpful carbon footprint assistant for CarbonTracker app. 
Help users understand their electronic device energy consumption, carbon emissions, and electricity costs.
Keep responses concise and actionable. Use metric units. User is in Indonesia.`

export function useGeminiChat() {
  const [loading, setLoading] = useState(false)
  const { messages, addMessage } = useChatStore()

  async function sendMessage(userText: string) {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      text: userText,
    }
    addMessage(userMsg)
    setLoading(true)

    try {
      const history = messages.map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }))

      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_CONTEXT }] },
          contents: [...history, { role: 'user', parts: [{ text: userText }] }],
        }),
      })

      const data = await res.json()
      const reply =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Sorry, I couldn't process that."

      addMessage({
        id: Date.now().toString() + 'r',
        role: 'model',
        text: reply,
      })
    } catch {
      addMessage({
        id: Date.now().toString() + 'e',
        role: 'model',
        text: 'Connection error. Please try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return { sendMessage, loading }
}
