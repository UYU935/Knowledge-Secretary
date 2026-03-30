export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-6 h-6'
  return (
    <div
      className={`${s} border-2 border-[#c8a96e]/30 border-t-[#c8a96e] rounded-full animate-spin`}
    />
  )
}

export function LoadingOverlay({ text = '処理中...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-8">
      <Spinner size="lg" />
      <p className="text-[#a89880] text-sm">{text}</p>
    </div>
  )
}
