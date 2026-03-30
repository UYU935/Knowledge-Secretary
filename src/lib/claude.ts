import Anthropic from '@anthropic-ai/sdk'
import type { EntryInput } from '../types'

function getApiKey(): string {
  return import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key') || ''
}

function getClient(): Anthropic {
  return new Anthropic({
    apiKey: getApiKey(),
    dangerouslyAllowBrowser: true,
  })
}

const RECORD_SYSTEM_PROMPT = `あなたは個人の経験・知識を整理するAI秘書です。
入力されたテキストを以下のJSON形式のみで返してください。
マークダウンや説明文は不要です。必ずJSON単体で返してください。
{
  "title": "15文字以内のタイトル",
  "category": "成功 or 失敗 or 気づき or その他",
  "summary": "2〜3文の要約",
  "lesson": "学んだこと1〜2文",
  "tags": ["タグ1", "タグ2", "タグ3（最大5個）"],
  "book_note": "本・教材のネタポイント（なければ空文字）"
}`

export async function structureEntry(rawText: string): Promise<EntryInput> {
  const client = getClient()
  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    system: RECORD_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: rawText }],
  })

  const text = response.content.find(b => b.type === 'text')?.text || '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('JSONの解析に失敗しました')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title: parsed.title || '無題',
    category: ['成功', '失敗', '気づき', 'その他'].includes(parsed.category) ? parsed.category : 'その他',
    summary: parsed.summary || '',
    lesson: parsed.lesson || '',
    book_note: parsed.book_note || '',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
  }
}

const SEARCH_SYSTEM_PROMPT = `以下は私の経験データベースです。
キーワードに関連する知識・経験を実践的なアドバイスとして200〜300文字でまとめてください。
参考にした記録の番号も示してください。`

export async function summarizeSearchResults(
  keyword: string,
  entries: Array<{ id: string; title: string; summary: string | null; lesson: string | null; category: string }>
): Promise<string> {
  const client = getClient()

  const context = entries
    .map((e, i) => `[${i + 1}] ${e.title}（${e.category}）\n要約: ${e.summary || ''}\n学び: ${e.lesson || ''}`)
    .join('\n\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: SEARCH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `キーワード: ${keyword}\n\n経験データ:\n${context}`,
      },
    ],
  })

  return response.content.find(b => b.type === 'text')?.text || ''
}
