import { useState, useRef } from 'react'
import { Mic, MicOff, Sparkles } from 'lucide-react'
import { GenreTabs } from '../components/ui/GenreTabs'
import { Spinner } from '../components/ui/Spinner'
import { structureEntry } from '../lib/claude'
import { getSupabaseClient } from '../lib/supabase'
import type { Genre } from '../types'

interface RecordScreenProps {
  genres: Genre[]
  onSuccess: () => void
  onError: (msg: string) => void
}

export function RecordScreen({ genres, onSuccess, onError }: RecordScreenProps) {
  const [selectedGenre, setSelectedGenre] = useState<string | null>(genres[0]?.id || null)
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)

  function toggleVoice() {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionAPI) {
      onError('このブラウザは音声入力に対応していません')
      return
    }

    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
      return
    }

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results as SpeechRecognitionResultList)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('')
      setText(transcript)
    }

    recognition.onend = () => setIsRecording(false)
    recognition.onerror = () => {
      setIsRecording(false)
      onError('音声認識エラーが発生しました')
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }

  async function handleSubmit() {
    if (!text.trim()) {
      onError('テキストを入力してください')
      return
    }

    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key')
    if (!apiKey) {
      onError('Claude API Keyが設定されていません（設定画面で入力してください）')
      return
    }

    setIsProcessing(true)
    try {
      const structured = await structureEntry(text)
      const client = getSupabaseClient()
      const { error } = await client.from('entries').insert({
        genre_id: selectedGenre,
        raw_text: text,
        ...structured,
      })
      if (error) throw error
      setText('')
      onSuccess()
    } catch (err) {
      onError(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-3">
        <h1 className="text-[#c8a96e] text-2xl font-semibold mb-1">経験を記録</h1>
        <p className="text-[#6b5e4e] text-xs">今日の経験・学び・失敗をAIが整理します</p>
      </div>

      {/* Genre Select */}
      <div className="mb-4">
        <GenreTabs genres={genres} selected={selectedGenre} onSelect={setSelectedGenre} showAll={false} />
      </div>

      {/* Text Input */}
      <div className="flex-1 px-4 flex flex-col gap-3">
        <div className="relative flex-1">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="経験・出来事・気づきを自由に書いてください...&#10;&#10;例）今日の患者さんの診察で、聴診の際に呼吸音の異常を見つけた。予習していた肺音の分類が役立った。"
            className="w-full h-full min-h-[220px] bg-[#2a2218] border border-[#3d3028] rounded-2xl px-4 py-3.5
              text-[#f0e6d3] text-sm leading-relaxed resize-none focus:outline-none focus:border-[#c8a96e]/60
              placeholder:text-[#4d4038]"
          />
          <span className="absolute bottom-3 right-3 text-xs text-[#4d4038]">
            {text.length}字
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pb-4">
          <button
            onClick={toggleVoice}
            className={`
              flex items-center justify-center w-14 h-14 rounded-2xl border transition-all flex-shrink-0
              ${isRecording
                ? 'bg-red-900/50 border-red-700 text-red-300 animate-pulse'
                : 'bg-[#2a2218] border-[#3d3028] text-[#a89880] hover:border-[#c8a96e]/50'
              }
            `}
          >
            {isRecording ? <MicOff size={22} /> : <Mic size={22} />}
          </button>

          <button
            onClick={handleSubmit}
            disabled={isProcessing || !text.trim()}
            className="flex-1 h-14 flex items-center justify-center gap-2.5 rounded-2xl
              bg-gradient-to-r from-[#c8a96e] to-[#a88b52] text-[#1a1410]
              font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed
              active:scale-[0.97] transition-all shadow-lg shadow-[#c8a96e]/20"
          >
            {isProcessing ? (
              <>
                <Spinner size="sm" />
                <span>AI処理中...</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span>✦ AIで記録する</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
