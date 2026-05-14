type SortKey = 'updatedAt' | 'title' | 'custom'

interface Props {
  sort: SortKey
  onSort: (s: SortKey) => void
}

export default function SortControl({ sort, onSort }: Props) {
  return (
    <div className="sort-control">
      <button className={`sort-btn${sort === 'updatedAt' ? ' active' : ''}`} onClick={() => onSort('updatedAt')}>최신순</button>
      <button className={`sort-btn${sort === 'title' ? ' active' : ''}`} onClick={() => onSort('title')}>이름순</button>
      <button className={`sort-btn${sort === 'custom' ? ' active' : ''}`} onClick={() => onSort('custom')}>사용자 지정</button>
    </div>
  )
}
