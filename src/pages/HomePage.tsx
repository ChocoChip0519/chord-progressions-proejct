import FolderTabBar from '../components/home/FolderTabBar'
import CardGrid from '../components/home/CardGrid'

interface Props {
  onNewCard: () => void
  onOpenCard: (id: string) => void
}

export default function HomePage({ onNewCard, onOpenCard }: Props) {
  return (
    <div className="page page--home">
      <div className="home-header">
        <h1 className="home-title">🎵 Chord Recommender</h1>
        <FolderTabBar />
      </div>
      <CardGrid onNewCard={onNewCard} onOpenCard={onOpenCard} />
    </div>
  )
}
