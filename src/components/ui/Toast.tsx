import type { Toast } from '../../types'

interface ToastContainerProps {
  toasts: Toast[]
  onRemove: (id: string) => void
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[90vw] max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          className={`
            pointer-events-auto px-4 py-3 rounded-xl text-sm font-medium shadow-lg
            animate-[slideDown_0.3s_ease]
            ${toast.type === 'success' ? 'bg-green-800 text-green-100' : ''}
            ${toast.type === 'error' ? 'bg-red-900 text-red-100' : ''}
            ${toast.type === 'info' ? 'bg-[#2a2218] border border-[#c8a96e] text-[#f0e6d3]' : ''}
          `}
        >
          {toast.message}
        </div>
      ))}
    </div>
  )
}
