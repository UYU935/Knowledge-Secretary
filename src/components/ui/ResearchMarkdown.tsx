import ReactMarkdown from 'react-markdown'

interface ResearchMarkdownProps {
  markdown: string
  onWikiLink: (target: string) => void
}

const WIKILINK_PREFIX = '#wikilink='

/**
 * Obsidian形式の [[リンク]] / [[リンク|表示名]] を、
 * レンダリング前にアプリ内リンク（#wikilink=...）へ変換する。
 */
function preprocessWikiLinks(md: string): string {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_match, inner: string) => {
    const [dest, label] = inner.split('|')
    const text = (label || dest).trim()
    return `[${text}](${WIKILINK_PREFIX}${encodeURIComponent(dest.trim())})`
  })
}

export function ResearchMarkdown({ markdown, onWikiLink }: ResearchMarkdownProps) {
  return (
    <div className="research-markdown text-[#d4c5ad] text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-[#f0e6d3] text-lg font-semibold mt-5 mb-2 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[#c8a96e] text-base font-semibold mt-5 mb-2 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[#c8a96e] text-sm font-semibold mt-4 mb-1.5">{children}</h3>
          ),
          p: ({ children }) => <p className="mb-3">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1.5">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          strong: ({ children }) => <strong className="text-[#f0e6d3] font-semibold">{children}</strong>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#c8a96e]/40 pl-3 my-3 text-[#a89880]">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isBlock = !!className
            return isBlock ? (
              <code className="block bg-[#2a2218] border border-[#3d3028] rounded-lg p-3 my-3 text-xs overflow-x-auto whitespace-pre">
                {children}
              </code>
            ) : (
              <code className="bg-[#2a2218] px-1.5 py-0.5 rounded text-xs text-[#c8a96e]">
                {children}
              </code>
            )
          },
          pre: ({ children }) => <pre className="my-0">{children}</pre>,
          hr: () => <hr className="border-[#3d3028] my-4" />,
          a: ({ href, children }) => {
            if (href && href.startsWith(WIKILINK_PREFIX)) {
              const target = decodeURIComponent(href.slice(WIKILINK_PREFIX.length))
              return (
                <button
                  onClick={() => onWikiLink(target)}
                  className="text-[#c8a96e] underline underline-offset-2 decoration-[#c8a96e]/40 hover:decoration-[#c8a96e] text-left"
                >
                  {children}
                </button>
              )
            }
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c8a96e] underline underline-offset-2 decoration-[#c8a96e]/40 break-all"
              >
                {children}
              </a>
            )
          },
        }}
      >
        {preprocessWikiLinks(markdown)}
      </ReactMarkdown>
    </div>
  )
}
