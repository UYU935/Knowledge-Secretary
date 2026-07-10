import { Anthropic } from '@anthropic-ai/sdk'

function getClient(): Anthropic {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || localStorage.getItem('anthropic_api_key')
  if (!apiKey) throw new Error('Anthropic API key not configured')
  return new Anthropic({ apiKey })
}

const SEARCH_SYSTEM_PROMPT = `あなたはシステムトレード研究アシスタントです。
ユーザーの記録から関連する知見を抽出し、実践的な視点で整理します。`

export async function summarizeSearchResults(
  keyword: string,
  entries: Array<{ title: string; body: string }>
): Promise<string> {
  const client = getClient()

  const context = entries
    .map((e, i) => `[${i + 1}] ${e.title}\n${e.body.slice(0, 500)}`)
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: SEARCH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `キーワード: ${keyword}\n\n記録:\n${context}`,
      },
    ],
  })

  return response.content.find(b => b.type === 'text')?.text || ''
}

const RESEARCH_SEARCH_SYSTEM_PROMPT = `以下は私のシステムトレード研究ノート（知見データベース）です。
キーワードに関連する知見を、実践に使える形で200〜300文字でまとめてください。
数値・パラメータ・注意点など具体性を優先し、参考にしたノートの番号も示してください。`

export async function summarizeResearchNotes(
  keyword: string,
  notes: Array<{ title: string; body_md: string | null; notebook: string[] | null }>
): Promise<string> {
  const client = getClient()

  const context = notes
    .map((n, i) => {
      const body = (n.body_md || '').slice(0, 1500)
      return `[${i + 1}] ${n.title}（${(n.notebook || []).join('・')}）\n${body}`
    })
    .join('\n\n---\n\n')

  const response = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 512,
    system: RESEARCH_SEARCH_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `キーワード: ${keyword}\n\n研究ノート:\n${context}`,
      },
    ],
  })

  return response.content.find(b => b.type === 'text')?.text || ''
}
