import React, { useRef, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet'
import { Sparkles, X, Send } from 'lucide-react-native'
import { useChatStore } from '../store/chatStore'
import { useGeminiChat } from '../hooks/useGeminiChat'
import AppLoading from '@/shared/components/feedback/AppLoading'

const SNAP_POINTS = ['75%']

export function GeminiChatSheet() {
  const { isOpen, messages, close } = useChatStore()
  const { sendMessage, loading } = useGeminiChat()
  const [input, setInput] = useState('')
  const sheetRef = useRef<BottomSheet>(null)
  const scrollRef = useRef<ScrollView>(null)

  if (!isOpen) return null

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    await sendMessage(text)
    scrollRef.current?.scrollToEnd({ animated: true })
  }

  return (
    <BottomSheet
      ref={sheetRef}
      snapPoints={SNAP_POINTS}
      onClose={close}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
      backgroundStyle={{ backgroundColor: '#FFFFFF' }}
      handleIndicatorStyle={{ backgroundColor: '#D4D4D4' }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2 px-5 py-3 border-b border-neutral-200">
        <Sparkles size={18} color="#25CE7F" strokeWidth={1.8} />
        <Text className="text-black font-semibold text-sm flex-1">
          Carbon AI Assistant
        </Text>
        <View className="bg-brand/10 border border-brand/20 rounded-full px-2.5 py-0.5">
          <Text className="text-brand text-[11px] font-semibold">Gemini</Text>
        </View>
        <Pressable onPress={close} className="ml-2">
          <X size={18} color="#737373" />
        </Pressable>
      </View>

      {/* Messages */}
      <BottomSheetScrollView
        ref={scrollRef}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      >
        {messages.length === 0 && (
          <View className="items-center py-8 gap-2">
            <Sparkles size={32} color="#25CE7F44" />
            <Text className="text-neutral-500 text-sm text-center">
              Ask me anything about your carbon footprint
            </Text>
          </View>
        )}
        {messages.map((msg) => (
          <View
            key={msg.id}
            className={`max-w-[85%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'self-end bg-brand/15 border border-brand/20 rounded-br-sm'
                : 'self-start bg-neutral-100 rounded-bl-sm'
            }`}
          >
            <Text className="text-black text-sm leading-relaxed">
              {msg.text}
            </Text>
          </View>
        ))}
        {loading && (
          <View className="self-start bg-neutral-100 rounded-2xl rounded-bl-sm px-4 py-3">
            <AppLoading size="sm" color="brand" />
          </View>
        )}
      </BottomSheetScrollView>

      {/* Input */}
      <View className="flex-row items-center gap-3 px-4 py-3 border-t mt-20 border-neutral-200">
        <BottomSheetTextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask about your carbon usage..."
          placeholderTextColor="#A3A3A3"
          onSubmitEditing={handleSend}
          returnKeyType="send"
          style={{
            flex: 1,
            backgroundColor: '#F5F5F5',
            borderRadius: 999,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 14,
            marginBottom: 20,
            color: '#000',
          }}
        />
        <Pressable
          onPress={handleSend}
          disabled={!input.trim() || loading}
          style={{ opacity: !input.trim() || loading ? 0.4 : 1 }}
          className="w-9 h-9 rounded-full bg-brand items-center justify-center"
        >
          <Send size={16} color="#fff" />
        </Pressable>
      </View>
    </BottomSheet>
  )
}
