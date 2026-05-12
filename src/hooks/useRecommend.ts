import { useState, useCallback } from 'react';
import { CircularQueue } from '@/lib/datastructures/Queue';
import { recommend, type Candidate } from '@/lib/music/recommendEngine';
import { degreeToChord, degreeToVariants } from '@/lib/music/degreeConverter';
import { useEditorStore } from '@/store/useEditorStore';

export interface RecommendCard {
  degree: string;
  chord: string;
  variants: string[];
  score: number;
}

export function useRecommend() {
  const [isOpen, setIsOpen] = useState(false);
  const [queue] = useState(() => new CircularQueue<RecommendCard>());
  const [cards, setCards] = useState<RecommendCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { mode, tonicMidi, genre, confirmChord, getDegrees } = useEditorStore();

  const openPopup = useCallback(() => {
    const degrees = getDegrees();
    const candidates: Candidate[] = recommend(degrees, mode, genre, 8);

    queue.clear();
    const cardList: RecommendCard[] = candidates.map((c) => ({
      degree: c.degree,
      chord: degreeToChord(c.degree, tonicMidi, mode) ?? c.degree,
      variants: degreeToVariants(c.degree, tonicMidi, mode),
      score: c.score,
    }));
    cardList.forEach((c) => queue.enqueue(c));
    setCards(cardList);
    setCurrentIndex(0);
    setIsOpen(true);
  }, [getDegrees, mode, tonicMidi, genre, queue]);

  const closePopup = useCallback(() => {
    setIsOpen(false);
  }, []);

  const next = useCallback(() => {
    queue.advance();
    setCurrentIndex(queue.currentIndex);
  }, [queue]);

  const prev = useCallback(() => {
    queue.retreat();
    setCurrentIndex(queue.currentIndex);
  }, [queue]);

  const selectCard = useCallback((card: RecommendCard) => {
    confirmChord({ chord: card.chord, degree: card.degree });
    setIsOpen(false);
  }, [confirmChord]);

  const visibleCards = cards.slice(currentIndex, currentIndex + 4).concat(
    cards.slice(0, Math.max(0, currentIndex + 4 - cards.length))
  );

  return { isOpen, openPopup, closePopup, next, prev, selectCard, visibleCards, allCards: cards, currentIndex };
}
