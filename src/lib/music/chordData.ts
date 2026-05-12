export interface Song {
  id: number;
  title: string;
  artist: string;
  year: number;
  key: string;
  timeSignature: string;
  bpm: number;
  progression: string[];
  relative: string[];
  tags: string[];
}

export interface Pattern {
  id: string;
  name: string;
  relative: string[];
  type: 'major' | 'minor';
  count: number;
  weight: number;
  exampleKey: string;
  example: string[];
  songs: number[];
}

export type TransitionTable = Record<string, Record<string, number>>;

export interface Transitions {
  major: TransitionTable;
  minor: TransitionTable;
}

export interface GenreWeight {
  patternBonus: Record<string, number>;
  prefer7th: boolean;
}

export const songs: Song[] = [
  { id: 1, title: "Supernova", artist: "aespa", year: 2024, key: "C#m", timeSignature: "4/4", bpm: 130, progression: ["C#m","A","E","B"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 2, title: "Whiplash", artist: "aespa", year: 2024, key: "Am", timeSignature: "4/4", bpm: 140, progression: ["Am","F","C","G"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 3, title: "Baddie", artist: "IVE", year: 2024, key: "Dm", timeSignature: "4/4", bpm: 120, progression: ["Dm","Bb","F","C"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 4, title: "All Night", artist: "IVE", year: 2024, key: "F", timeSignature: "4/4", bpm: 118, progression: ["F","Dm","Bb","C"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 5, title: "Supernatural", artist: "NewJeans", year: 2024, key: "G", timeSignature: "4/4", bpm: 116, progression: ["G","Em","C","D"], relative: ["I","vi","IV","V"], tags: ["loop","retro-pop","major"] },
  { id: 6, title: "How Sweet", artist: "NewJeans", year: 2024, key: "Eb", timeSignature: "4/4", bpm: 112, progression: ["Ebmaj7","Cm7","Abmaj7","Bb7"], relative: ["Imaj7","vim7","IVmaj7","V7"], tags: ["loop","pop","major","7th"] },
  { id: 7, title: "Strategy", artist: "TWICE", year: 2024, key: "C", timeSignature: "4/4", bpm: 125, progression: ["C","Am","F","G"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 8, title: "I Got You", artist: "TWICE", year: 2025, key: "Ab", timeSignature: "4/4", bpm: 108, progression: ["Abmaj7","Fm7","Dbmaj7","Eb"], relative: ["Imaj7","vim7","IVmaj7","V"], tags: ["loop","pop","major","7th"] },
  { id: 9, title: "Pink Venom", artist: "BLACKPINK", year: 2022, key: "Bm", timeSignature: "4/4", bpm: 127, progression: ["Bm","G","D","A"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 10, title: "Flower", artist: "JISOO", year: 2023, key: "Gm", timeSignature: "4/4", bpm: 120, progression: ["Gm","Eb","Bb","F"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 11, title: "Standing Next to You", artist: "Jung Kook", year: 2023, key: "Dm", timeSignature: "4/4", bpm: 114, progression: ["Dm","Am","Bb","C"], relative: ["i","v","VI","VII"], tags: ["loop","funk-pop","minor"] },
  { id: 12, title: "Seven", artist: "Jung Kook", year: 2023, key: "C#", timeSignature: "4/4", bpm: 125, progression: ["C#","A#m","F#","G#"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 13, title: "Love Me Again", artist: "V (BTS)", year: 2023, key: "Eb", timeSignature: "4/4", bpm: 90, progression: ["Ebmaj7","Cm","Ab","Bb"], relative: ["Imaj7","vi","IV","V"], tags: ["loop","pop-ballad","major"] },
  { id: 14, title: "MIROH", artist: "Stray Kids", year: 2019, key: "Cm", timeSignature: "4/4", bpm: 140, progression: ["Cm","Bb","Ab","G"], relative: ["i","VII","VI","V"], tags: ["loop","dance-pop","minor"] },
  { id: 15, title: "LALALALA", artist: "Stray Kids", year: 2023, key: "Am", timeSignature: "4/4", bpm: 138, progression: ["Am","G","F","E"], relative: ["i","VII","VI","V"], tags: ["loop","dance-pop","minor"] },
  { id: 16, title: "Easy", artist: "LE SSERAFIM", year: 2024, key: "F#m", timeSignature: "4/4", bpm: 122, progression: ["F#m","D","A","E"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 17, title: "UNFORGIVEN", artist: "LE SSERAFIM", year: 2023, key: "Em", timeSignature: "4/4", bpm: 130, progression: ["Em","C","G","D"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 18, title: "Queencard", artist: "(G)I-DLE", year: 2023, key: "F", timeSignature: "4/4", bpm: 118, progression: ["F","Dm","Bb","C"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 19, title: "I DO", artist: "(G)I-DLE", year: 2024, key: "Gm", timeSignature: "4/4", bpm: 115, progression: ["Gm","Eb","Bb","F"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 20, title: "Drama", artist: "aespa", year: 2023, key: "Cm", timeSignature: "4/4", bpm: 128, progression: ["Cm","Ab","Eb","Bb"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 21, title: "DASH", artist: "NMIXX", year: 2024, key: "Dm", timeSignature: "4/4", bpm: 135, progression: ["Dm","Bb","F","C"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 22, title: "MAESTRO", artist: "SEVENTEEN", year: 2024, key: "Bm", timeSignature: "4/4", bpm: 118, progression: ["Bm","G","D","A"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 23, title: "Super", artist: "SEVENTEEN", year: 2023, key: "F", timeSignature: "4/4", bpm: 122, progression: ["F","Dm","Gm","C"], relative: ["I","vi","ii","V"], tags: ["loop","pop","major"] },
  { id: 24, title: "Cream Soda", artist: "Baekhyun", year: 2022, key: "G", timeSignature: "4/4", bpm: 100, progression: ["G","Em","Am","D"], relative: ["I","vi","ii","V"], tags: ["loop","retro-pop","major"] },
  { id: 25, title: "Killin' Me Good", artist: "TAEYEON", year: 2024, key: "Bb", timeSignature: "4/4", bpm: 110, progression: ["Bbmaj7","Gm7","Ebmaj7","F7"], relative: ["Imaj7","vim7","IVmaj7","V7"], tags: ["loop","pop","major","7th"] },
  { id: 26, title: "INVU", artist: "TAEYEON", year: 2022, key: "F#m", timeSignature: "4/4", bpm: 116, progression: ["F#m","Dmaj7","Amaj7","E"], relative: ["i","VImaj7","IIImaj7","VII"], tags: ["loop","pop","minor","7th"] },
  { id: 27, title: "Better Babe", artist: "HYOYEON", year: 2023, key: "Am", timeSignature: "4/4", bpm: 120, progression: ["Am","F","C","G"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 28, title: "Shutdown", artist: "Hwasa", year: 2022, key: "Fm", timeSignature: "4/4", bpm: 98, progression: ["Fm","Db","Ab","Eb"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 29, title: "Maria", artist: "Hwasa", year: 2020, key: "Dm", timeSignature: "4/4", bpm: 100, progression: ["Dm","Am","Bb","F"], relative: ["i","v","VI","III"], tags: ["loop","pop","minor"] },
  { id: 30, title: "Attention", artist: "NewJeans", year: 2022, key: "C", timeSignature: "4/4", bpm: 105, progression: ["C","Am","F","G"], relative: ["I","vi","IV","V"], tags: ["loop","retro-pop","major"] },
  { id: 31, title: "Hype Boy", artist: "NewJeans", year: 2022, key: "Eb", timeSignature: "4/4", bpm: 118, progression: ["Eb","Cm","Ab","Bb"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 32, title: "OMG", artist: "NewJeans", year: 2023, key: "G", timeSignature: "4/4", bpm: 115, progression: ["G","Em","C","D"], relative: ["I","vi","IV","V"], tags: ["loop","retro-pop","major"] },
  { id: 33, title: "Midas Touch", artist: "KISS OF LIFE", year: 2024, key: "Eb", timeSignature: "4/4", bpm: 105, progression: ["Ebmaj7","Cm7","Fm7","Bb7"], relative: ["Imaj7","vim7","iim7","V7"], tags: ["loop","retro-pop","major","7th"] },
  { id: 34, title: "Sugarcoat", artist: "KISS OF LIFE", year: 2024, key: "Bb", timeSignature: "4/4", bpm: 100, progression: ["Bb","Gm","Eb","F"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 35, title: "눈이 오네요", artist: "Sole", year: 2022, key: "D", timeSignature: "4/4", bpm: 90, progression: ["D","Bm","G","A"], relative: ["I","vi","IV","V"], tags: ["loop","indie-pop","major"] },
  { id: 36, title: "Guilty", artist: "SHINee Taemin", year: 2023, key: "Am", timeSignature: "4/4", bpm: 110, progression: ["Am","F","C","G"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 37, title: "Sweet Venom", artist: "ENHYPEN", year: 2023, key: "Gm", timeSignature: "4/4", bpm: 130, progression: ["Gm","Eb","Bb","F"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 38, title: "Bite Me", artist: "ENHYPEN", year: 2023, key: "Dm", timeSignature: "4/4", bpm: 120, progression: ["Dm","Bb","F","C"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 39, title: "Sugar Rush Ride", artist: "TXT", year: 2023, key: "Em", timeSignature: "4/4", bpm: 135, progression: ["Em","C","G","D"], relative: ["i","VI","III","VII"], tags: ["loop","pop-rock","minor"] },
  { id: 40, title: "Deja Vu", artist: "TXT", year: 2024, key: "Am", timeSignature: "4/4", bpm: 118, progression: ["Am","G","F","E"], relative: ["i","VII","VI","V"], tags: ["loop","pop","minor"] },
  { id: 41, title: "Stupid Liar", artist: "ILLIT", year: 2024, key: "G", timeSignature: "4/4", bpm: 110, progression: ["G","Em","C","D"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 42, title: "Magnetic", artist: "ILLIT", year: 2024, key: "F", timeSignature: "4/4", bpm: 112, progression: ["F","Dm","Bb","C"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 43, title: "Love 119", artist: "RIIZE", year: 2023, key: "C", timeSignature: "4/4", bpm: 108, progression: ["C","Am","F","G"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 44, title: "Impossible", artist: "RIIZE", year: 2024, key: "Eb", timeSignature: "4/4", bpm: 116, progression: ["Eb","Cm","Ab","Bb"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 45, title: "One and Only", artist: "BOYNEXTDOOR", year: 2023, key: "D", timeSignature: "4/4", bpm: 105, progression: ["D","Bm","G","A"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 46, title: "In Bloom", artist: "ZEROBASEONE", year: 2023, key: "F#m", timeSignature: "4/4", bpm: 112, progression: ["F#m","D","A","E"], relative: ["i","VI","III","VII"], tags: ["loop","pop","minor"] },
  { id: 47, title: "Chasing That Feeling", artist: "TXT", year: 2024, key: "C", timeSignature: "4/4", bpm: 128, progression: ["C","G","Am","F"], relative: ["I","V","vi","IV"], tags: ["loop","pop","major"] },
  { id: 48, title: "Baggy Jeans", artist: "NCT 127", year: 2022, key: "Bb", timeSignature: "4/4", bpm: 115, progression: ["Bb","Gm","Eb","F"], relative: ["I","vi","IV","V"], tags: ["loop","pop","major"] },
  { id: 49, title: "Istj", artist: "NCT DREAM", year: 2023, key: "Dm", timeSignature: "4/4", bpm: 118, progression: ["Dm","Bb","F","C"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
  { id: 50, title: "Spicy", artist: "aespa", year: 2023, key: "Cm", timeSignature: "4/4", bpm: 133, progression: ["Cm","Ab","Eb","Bb"], relative: ["i","VI","III","VII"], tags: ["loop","dance-pop","minor"] },
];

export const patterns: Pattern[] = [
  { id: "P01", name: "팝 4도 루프 (장조)", relative: ["I","vi","IV","V"], type: "major", count: 16, weight: 100, exampleKey: "C", example: ["C","Am","F","G"], songs: [4,7,12,18,23,24,30,32,34,36,41,42,43,47,48,50] },
  { id: "P02", name: "팝 4도 루프 변형 – I V vi IV (axis)", relative: ["I","V","vi","IV"], type: "major", count: 5, weight: 60, exampleKey: "C", example: ["C","G","Am","F"], songs: [5,32,41,44,47] },
  { id: "P03", name: "팝 4도 루프 변형 – I vi ii V", relative: ["I","vi","ii","V"], type: "major", count: 4, weight: 55, exampleKey: "C", example: ["C","Am","Dm","G"], songs: [23,24,35,45] },
  { id: "P04", name: "재즈팝 maj7 루프", relative: ["Imaj7","vim7","IVmaj7","V7"], type: "major", count: 6, weight: 70, exampleKey: "C", example: ["Cmaj7","Am7","Fmaj7","G7"], songs: [6,8,25,33,26,13] },
  { id: "P05", name: "재즈팝 maj7 루프 변형 – Imaj7 vim7 iim7 V7", relative: ["Imaj7","vim7","iim7","V7"], type: "major", count: 3, weight: 50, exampleKey: "C", example: ["Cmaj7","Am7","Dm7","G7"], songs: [33,8,25] },
  { id: "P06", name: "팝 4도 루프 (단조) – i VI III VII", relative: ["i","VI","III","VII"], type: "minor", count: 18, weight: 100, exampleKey: "Am", example: ["Am","F","C","G"], songs: [1,2,3,9,10,11,16,17,19,20,21,27,28,29,37,38,39,50] },
  { id: "P07", name: "하모닉 단조 – i VII VI V", relative: ["i","VII","VI","V"], type: "minor", count: 4, weight: 65, exampleKey: "Am", example: ["Am","G","F","E"], songs: [14,15,36,40] },
  { id: "P08", name: "단조 i v VI VII", relative: ["i","v","VI","VII"], type: "minor", count: 3, weight: 55, exampleKey: "Am", example: ["Am","Em","F","G"], songs: [11,29,36] },
];

export const transitions: Transitions = {
  major: {
    I:       { vi: 22, V: 12, IV: 18, ii: 8,  I: 2 },
    vi:      { IV: 25, ii: 10, I: 8,  V: 6,  vi: 1 },
    IV:      { V: 28,  I: 12, vi: 8,  ii: 6, IV: 1 },
    V:       { I: 30,  vi: 10, IV: 5, ii: 3,  V: 1 },
    ii:      { V: 24,  I: 8,  IV: 6,  vi: 4, ii: 1 },
    Imaj7:   { vim7: 10, IVmaj7: 8, V7: 6,  iim7: 4 },
    vim7:    { IVmaj7: 9, iim7: 7,  Imaj7: 5, V7: 4 },
    IVmaj7:  { V7: 10,   Imaj7: 6, vim7: 4,  iim7: 3 },
    V7:      { Imaj7: 12, vim7: 5, IVmaj7: 3, iim7: 2 },
    iim7:    { V7: 10,   Imaj7: 4, IVmaj7: 3, vim7: 2 },
  },
  minor: {
    i:   { VI: 28, III: 18, VII: 16, v: 10, iv: 8, V: 6 },
    VI:  { III: 20, VII: 16, i: 12,  iv: 8, V: 5 },
    III: { VII: 22, i: 14,  VI: 10,  iv: 6, V: 4 },
    VII: { i: 24,  VI: 14,  III: 10, iv: 5, V: 4 },
    V:   { i: 20,  VI: 8,   VII: 6,  iv: 4 },
    v:   { i: 16,  VI: 8,   VII: 6 },
    iv:  { i: 12,  VII: 10, V: 8,    VI: 6 },
  },
};

export const genreWeights: Record<string, GenreWeight> = {
  pop: {
    patternBonus: { P01: 1.5, P06: 1.5, P04: 1.2, P02: 1.1 },
    prefer7th: false,
  },
};
