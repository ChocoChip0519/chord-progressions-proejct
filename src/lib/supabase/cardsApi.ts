import { supabase } from './client';

export interface CardRow {
  id: string;
  user_id: string;
  title: string;
  chord_progression: string[];
  genre: string;
  bpm: number;
  created_at: string;
  sort_order: number;
}

const LOCAL_KEY = 'chord_cards';

function loadLocal(): CardRow[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as CardRow[]) : [];
  } catch {
    return [];
  }
}

function saveLocal(cards: CardRow[]): void {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(cards));
}

export async function fetchCards(_userId: string): Promise<CardRow[]> {
  if (!supabase) return loadLocal();
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return (data as CardRow[]) ?? [];
}

export async function upsertCard(card: Partial<CardRow>): Promise<CardRow> {
  if (!supabase) {
    const cards = loadLocal();
    const existing = cards.findIndex((c) => c.id === card.id);
    const now = new Date().toISOString();
    if (existing !== -1) {
      cards[existing] = { ...cards[existing], ...card };
      saveLocal(cards);
      return cards[existing];
    } else {
      const newCard: CardRow = {
        id: card.id ?? crypto.randomUUID(),
        user_id: card.user_id ?? 'local',
        title: card.title ?? '제목 없음',
        chord_progression: card.chord_progression ?? [],
        genre: card.genre ?? 'pop',
        bpm: card.bpm ?? 120,
        created_at: card.created_at ?? now,
        sort_order: card.sort_order ?? cards.length,
      };
      cards.push(newCard);
      saveLocal(cards);
      return newCard;
    }
  }
  const { data, error } = await supabase
    .from('cards')
    .upsert(card)
    .select()
    .single();
  if (error) throw error;
  return data as CardRow;
}

export async function deleteCard(id: string): Promise<void> {
  if (!supabase) {
    const cards = loadLocal().filter((c) => c.id !== id);
    saveLocal(cards);
    return;
  }
  const { error } = await supabase.from('cards').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderCards(orderedIds: string[]): Promise<void> {
  if (!supabase) {
    const cards = loadLocal();
    const reordered = orderedIds
      .map((id, i) => {
        const card = cards.find((c) => c.id === id);
        return card ? { ...card, sort_order: i } : null;
      })
      .filter(Boolean) as CardRow[];
    const unreordered = cards.filter((c) => !orderedIds.includes(c.id));
    saveLocal([...reordered, ...unreordered]);
    return;
  }
  const updates = orderedIds.map((id, i) =>
    supabase!.from('cards').update({ sort_order: i }).eq('id', id)
  );
  await Promise.all(updates);
}
