import { create } from 'zustand'

type Message = {
  id: string
  role: 'user' | 'model'
  text: string
}

type ChatStore = {
  isOpen: boolean
  messages: Message[]
  open: () => void
  close: () => void
  addMessage: (msg: Message) => void
  clearMessages: () => void
}

export const useChatStore = create<ChatStore>((set) => ({
  isOpen: false,
  messages: [],
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
  clearMessages: () => set({ messages: [] }),
}))
