import type { Category } from '../../types'

const colors: Record<Category, string> = {
  '成功': 'bg-green-900/60 text-green-300 border border-green-700/50',
  '失敗': 'bg-red-900/60 text-red-300 border border-red-700/50',
  '気づき': 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
  'その他': 'bg-[#3d3028] text-[#a89880] border border-[#4d4038]',
}

export function CategoryBadge({ category }: { category: Category }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[category]}`}>
      {category}
    </span>
  )
}
