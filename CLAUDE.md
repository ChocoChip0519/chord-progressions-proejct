# Chord Progression Recommender — 프로젝트 문서

## 프로젝트 개요

자료구조 수업 프로젝트. 실제 작곡자가 아이디어를 얻거나, 비전공자가 처음으로 코드 진행을 만들어볼 수 있는 인터랙티브 웹앱.

- 장르/키/모드/BPM 선택 (키는 선택사항)
- 가상 피아노 + 키보드 매핑 (자유 모드 / 코드 모드)
- 다음 코드 카드 추천 (Graph 기반 실데이터 가중치 + 분위기 설명)
- undo/redo, 전체 재생, 자동 생성 (키 설정 시에만)

**기술 스택**: React + TypeScript (Vite), Tone.js (오디오), localStorage

---

## 자료구조 활용 전략

| 자료구조 | 파일 | 용도 |
|---|---|---|
| **Graph** (인접 리스트) | `src/lib/ChordGraph.ts` | 장르별 코드 전환 가중치. 노드=로마자 코드, 간선=다음 코드 확률 |
| **Stack** | `src/lib/ProgressionStack.ts` | 코드 진행 undo/redo. `past[][]` / `future[][]` 이중 스택 |
| **Queue** | `src/lib/PlaybackQueue.ts` | 전체 코드진행 순차 재생. enqueue → Tone.js 타이밍 연동 |
| **Array** | `src/lib/musicTheory.ts` | 키·모드별 다이어토닉 코드 집합. 추천 필터링에 사용 |

---

## 파일 구조

```
src/
├── data/
│   ├── transitions.json       # Graph 간선 (Hooktheory 기반 실데이터)
│   ├── progressions.json      # 장르별 대표 진행 (자동생성용, 키 필요)
│   ├── startingChords.json    # 장르별 시작 코드 (진행 0개일 때 추천)
│   └── chordMoods.json        # 로마자별 분위기 설명 (비전공자용)
├── lib/
│   ├── ChordGraph.ts
│   ├── ProgressionStack.ts
│   ├── PlaybackQueue.ts
│   ├── musicTheory.ts
│   └── audioEngine.ts
├── components/
│   ├── SetupModal/
│   ├── Piano/
│   ├── ProgressionTimeline/
│   ├── RecommendationPanel/
│   └── Toolbar/
├── hooks/
│   ├── useChordDetection.ts
│   ├── useAudio.ts
│   └── useSession.ts
├── store/
│   └── progressionStore.ts
├── types/
│   └── music.ts
└── App.tsx
```

---

## 데이터 파일 설계

### 데이터 출처 방침

| 장르 | 출처 | 방식 |
|---|---|---|
| 팝 | Hooktheory Trends (hooktheory.com/trends) | `I→?` 전환 확률 수동 수집 |
| 록 | Hooktheory Trends + de Clercq & Temperley 2011 | 수동 수집 + 논문 수치 보정 |
| 재즈 | 재즈 화성 이론 (ii-V-I 중심) | 이론 기반 직접 작성 |
| 블루스 | 12-bar 패턴 (사실상 표준) | 직접 하드코딩 |

> McGill Billboard는 절대 코드명 → 로마자 변환에 별도 키 추정 필요 → 범위 초과, 제외.

### `transitions.json`

```json
{
  "pop": {
    "I":   { "IV": 0.28, "V": 0.25, "vi": 0.23, "ii": 0.13, "iii": 0.07 },
    "IV":  { "V": 0.38, "I": 0.28, "ii": 0.18, "vi": 0.09, "IV": 0.07 },
    "V":   { "I": 0.52, "vi": 0.28, "IV": 0.15, "ii": 0.05 },
    "vi":  { "IV": 0.38, "V": 0.27, "ii": 0.19, "I": 0.11, "iii": 0.05 },
    "ii":  { "V": 0.62, "IV": 0.22, "I": 0.11, "vi": 0.05 },
    "iii": { "vi": 0.52, "IV": 0.28, "I": 0.20 }
  },
  "jazz": {
    "I":   { "vi": 0.30, "ii": 0.28, "IV": 0.22, "V": 0.20 },
    "ii":  { "V": 0.68, "IV": 0.18, "I": 0.09, "vi": 0.05 },
    "V":   { "I": 0.58, "vi": 0.24, "IV": 0.13, "ii": 0.05 },
    "vi":  { "ii": 0.52, "V": 0.28, "IV": 0.20 },
    "IV":  { "ii": 0.38, "V": 0.34, "I": 0.23, "vi": 0.05 }
  },
  "rock": {
    "I":   { "IV": 0.34, "V": 0.32, "vi": 0.19, "bVII": 0.09, "ii": 0.06 },
    "IV":  { "I": 0.34, "V": 0.32, "vi": 0.18, "bVII": 0.11, "ii": 0.05 },
    "V":   { "I": 0.58, "IV": 0.24, "vi": 0.14, "bVII": 0.04 },
    "vi":  { "IV": 0.40, "I": 0.30, "V": 0.26, "ii": 0.04 },
    "bVII":{ "IV": 0.42, "I": 0.34, "V": 0.24 }
  },
  "blues": {
    "I7":  { "IV7": 0.50, "V7": 0.30, "I7": 0.20 },
    "IV7": { "I7": 0.60, "V7": 0.30, "IV7": 0.10 },
    "V7":  { "IV7": 0.50, "I7": 0.40, "V7": 0.10 }
  }
}
```

### `startingChords.json`

```json
{
  "pop":   ["I", "vi"],
  "jazz":  ["I", "ii"],
  "rock":  ["I"],
  "blues": ["I7"]
}
```

### `progressions.json`

```json
{
  "pop":   [["I","V","vi","IV"], ["I","IV","V","I"], ["vi","IV","I","V"]],
  "jazz":  [["ii","V","I"], ["I","vi","ii","V"], ["iii","vi","ii","V"]],
  "rock":  [["I","IV","V","I"], ["I","V","IV","I"], ["I","bVII","IV","I"]],
  "blues": [["I7","I7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"]]
}
```

### `chordMoods.json`

```json
{
  "I":    "밝고 안정적 — 집에 돌아온 느낌",
  "ii":   "부드럽게 흘러가는 느낌",
  "iii":  "약간 신비롭고 따뜻한 느낌",
  "IV":   "풍성하고 따뜻하게 열리는 느낌",
  "V":    "긴장감 — 뭔가 일어날 것 같은 느낌",
  "vi":   "감성적이고 슬픈 느낌",
  "viiº": "불안하고 긴박한 느낌",
  "bVII": "강렬하고 록적인 에너지",
  "I7":   "블루지하고 풍성한 느낌",
  "IV7":  "부드럽고 느긋한 블루스",
  "V7":   "강하게 해결을 원하는 긴장감"
}
```

---

## 공통 타입 (`types/music.ts`)

```typescript
export type Genre = 'pop' | 'jazz' | 'rock' | 'blues';
export type Mode = 'major' | 'minor';
export type ChordQuality = 'maj' | 'min' | 'dom7' | 'maj7' | 'min7' | 'dim' | 'aug';
export type PianoMode = 'free' | 'chord';

export interface ChordEntry {
  romanNumeral: string;     // "I", "ii", "V7", "bVII"
  name: string;             // "C major", "D minor", "G7"
  rootNote: string;
  quality: ChordQuality;
  notes: string[];          // ["C4","E4","G4"]
}

export interface RecommendedChord {
  romanNumeral: string;
  name: string;
  quality: ChordQuality;
  weight: number;
  source: 'genre' | 'key';
  mood: string;
}

export interface Session {
  genre: Genre;
  key: string | null;
  mode: Mode;
  bpm: number;
}
```

---

## 핵심 자료구조 구현 스펙

### ChordGraph.ts

```typescript
export class ChordGraph {
  private adj: Map<string, Map<string, number>> = new Map();

  loadFromData(data: Record<string, Record<string, number>>): void
  addEdge(from: string, to: string, weight: number): void

  // diatonic=null → 필터 없이 전체 반환 (키 미설정 시)
  getRecommendations(from: string, diatonic: string[] | null, topN?: number): { romanNumeral: string; weight: number }[]

  // 가중치 기반 랜덤 워크 (자동생성, 키 필요하므로 diatonic은 항상 string[])
  randomWalk(start: string, steps: number, diatonic: string[]): string[]
}
```

### ProgressionStack.ts / PlaybackQueue.ts

```typescript
class ProgressionStack<T> {
  push(item: T): void; undo(): T[] | null; redo(): T[] | null
  peek(): T | null; getAll(): T[]; clear(): void
  canUndo(): boolean; canRedo(): boolean
}

class PlaybackQueue<T> {
  enqueueAll(items: T[]): void; dequeue(): T | undefined
  isEmpty(): boolean; peek(): T | undefined; size(): number; clear(): void
}
```

---

## musicTheory.ts 핵심 함수

```typescript
getDiatonicChords(genre: Genre, mode: Mode): string[]
detectChord(notes: string[], key: string | null, mode: Mode): ChordEntry | null
romanToChordName(roman: string, key: string, mode: Mode, genre: Genre): string

// 신뢰도 = topScore / playedCount. 0.7 미만이면 빈 배열 반환
inferKey(playedChords: ChordEntry[]): { key: string; mode: Mode; confidence: number }[]

// 키 있음 + 검은건반 → 가장 가까운 다이어토닉 근음으로 스냅
buildDiatonicChord(rootNote: string, key: string | null, mode: Mode, genre: Genre): ChordEntry
```

---

## 오디오 엔진

- **라이브러리**: Tone.js
- **AudioContext unlock**: "시작하기" 클릭 시 `await Tone.start()` (브라우저 정책 필수)
- `Tone.PolySynth` + `Tone.Reverb`
- `playChord(notes, duration)` / `playProgression(chords, bpm)` — Queue 기반, 코드당 2박자

---

## 피아노 키보드 매핑

```
흰건반: A  S  D  F  G  H  J  K  L  ;  '  → C4~F5
검은건반: W  E     T  Y  U     O  P   → C#4~D#5
```

**포커스 관리**: 피아노 컨테이너에 `tabIndex={0}`. `document.activeElement`가 input/textarea면 키보드 이벤트 무시.

---

## 피아노 듀얼 모드

두 모드 모두 **Space = 코드 추가 확정**으로 통일.

### 자유 모드 (작곡가용)
키를 누르고 있는 동안 실시간 코드 감지 표시. 3개 이상이면 코드명 표시.
→ **Space** 누르면 확정 & 추가.

```
1~2개 눌림: "음을 더 눌러보세요"
3개+:       "✅ C major (I) — Space로 추가"
```

### 코드 모드 (비전공자용)
건반 하나 클릭/누름 → 해당 다이어토닉 코드 즉시 미리보기 + 소리 재생.
→ **Space** 누르거나 **건반을 다시 클릭**하면 확정 & 추가.
→ 다른 건반 클릭 시 미리보기가 그 코드로 교체됨.

| 상황 | 동작 |
|---|---|
| 키 설정 O, 흰건반 | 다이어토닉 코드 자동 적용 (D → Dm in C장조) |
| 키 설정 O, 검은건반 | 가장 가까운 다이어토닉 근음으로 스냅 |
| 키 설정 X | 누른 음 기반 major 코드 |

코드 모드 시 건반 레이블: `D` → `Dm(ii)` 형태 표시.

---

## 키 없이 시작 (Key-Free Mode)

**코드 하나씩 추가**: 키 없어도 정상 동작. graph weight만 사용 (diatonic 필터 없음). 진행 쌓이면서 자동 추론.

**자동생성 (✨)**: 키 미설정 시 비활성화 + "키를 먼저 설정해주세요" 툴팁.

### 추천 점수 공식

| 상황 | 공식 |
|---|---|
| 코드 0개 | startingChords[genre] 카드 |
| 코드 1개+, 키 없음 | `score = genre_weight` |
| 코드 3개+, 추론 신뢰도 ≥ 0.7 | `score = 0.7 × genre + 0.3 × diatonic(inferred)` |
| 키 직접 설정 | `score = 0.6 × genre + 0.4 × diatonic(selected)` |

뱃지: 신뢰도 ≥ 0.7 → `💡 예상 키: C major` 표시. 클릭하면 확정.

---

## 추천 카드 레이아웃

비전공자 우선. 분위기 설명이 핵심.

```
┌──────────────────┐
│   C major        │  ← 코드명 (크게)
│ ████████████ 28% │  ← 가중치 바 + 퍼센트
│ I · 밝고 안정적  │  ← 로마자 + 분위기 (작게, 하단)
└──────────────────┘
```

- 1위 카드: ⭐ + 강조 border
- `source='key'` → 🎹, `source='genre'` → 🎵 아이콘
- hover: `translateY(-4px)` + 코드 0.5초 미리듣기
- 로마자(I) hover 시 상세 설명 툴팁 (작곡가용)

---

## UI 레이아웃 (라이트 테마)

```
┌──────────────────────────────────────────────────────────────────────┐
│  🎵 ChordFlow   [Pop] [키: C] [장조] [BPM:120]  [⚙ 설정]           │
├──────────────────────────────────────────────────────────────────────┤
│  코드 진행                          [↩] [↪] [▶ 전체듣기] [✨*] [🗑] │
│  ┌──────┐→┌──────┐→┌──────┐→┌──────┐→┌ ─ ─ ─┐                     │  (* 키 없으면 비활성)
│  │C / I │ │Am/vi │ │F /IV │ │G / V │ │  +   │                     │
│  └──────┘ └──────┘ └──────┘ └──────┘ └ ─ ─ ─┘                     │
├──────────────────────────────────────────────────────────────────────┤
│  💡 다음 코드로 어때요?                                                │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐│
│  │ ⭐ C major  │ │   Am         │ │   F major    │ │   Em         ││
│  │ ████████ 28%│ │ ██████ 25%  │ │ █████ 23%   │ │ ███ 13%      ││
│  │ I·밝고안정적│ │ vi·감성적    │ │ IV·따뜻하게  │ │ iii·신비롭게  ││
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘│
├──────────────────────────────────────────────────────────────────────┤
│  🎹 피아노  [💡 예상 키: C major]  [자유 모드 ↔ 코드 모드]           │
│  ┌──┬─┬─┬──┬──┬─┬─┬─┬──┬──┬─┬─┬──┐                               │
│  │  │█│█│  │  │█│█│█│  │  │█│█│  │                               │
│  │C │ │ │E │F │ │ │ │A │B │ │ │C │  [코드모드: C(I) Dm(ii) 표시] │
│  └──┴─┴─┴──┴──┴─┴─┴─┴──┴──┴─┴─┴──┘                               │
│  [A]   [S]  [D][F]  [G]  [H][J]                                    │
│  ✅ C major (I) — Space로 추가   (양쪽 모드 동일)                   │
└──────────────────────────────────────────────────────────────────────┘
```

### SetupModal

```
┌──────────────────────────────────────────────────┐
│  🎵 어떤 느낌의 음악을 만들까요?                   │
│  [🎤 팝]  [🎷 재즈]  [🎸 락]  [🎵 블루스]        │
│  키 (선택):  C C# D D# E F F# G G# A A# B        │
│              ──────────────  [나중에 정하기]       │
│  모드: [장조 ●] [단조  ]                          │
│  BPM: ──●──  120  (60~180)                       │
│  [🎵 시작하기 →]                                  │
└──────────────────────────────────────────────────┘
```

---

## 색상 & 스타일 (라이트 테마)

- **배경**: `#f8f9fa`
- **카드/패널**: `#ffffff`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`
- **텍스트**: `#1a1a2e` (진한 네이비), 보조 `#6c757d`
- **장르 accent**: Pop `#6c63ff` / Jazz `#e07b39` / Rock `#d63031` / Blues `#2980b9`
- **피아노 흰건반**: `#ffffff` + border, 검은건반: `#2d3436`, 활성 건반: accent 색상
- **폰트**: `Inter` (UI), `JetBrains Mono` (코드명/로마자)

---

## 상태 관리

```typescript
interface AppState {
  session: Session | null;
  pianoMode: 'free' | 'chord';
  progression: ChordEntry[];
  activeNotes: string[];
  pendingChord: ChordEntry | null;    // Space 누르기 전 미리보기 중인 코드
  inferredKey: { key: string; mode: Mode; confidence: number } | null;
  recommendations: RecommendedChord[];
  isPlaying: boolean;
  playingIndex: number;
}
```

---

## 구현 순서 (단계별 체크리스트)

### Step 1. 프로젝트 초기화
- [ ] `npm create vite@latest . -- --template react-ts`
- [ ] `npm install tone`
- [ ] 폴더 구조 생성
- [ ] `src/types/music.ts` 공통 타입

### Step 2. 데이터 파일 작성
- [ ] `transitions.json` (Hooktheory 수동 입력)
- [ ] `startingChords.json`
- [ ] `progressions.json`
- [ ] `chordMoods.json`

### Step 3. 자료구조 구현
- [ ] `ChordGraph.ts` (`diatonic=null` 지원)
- [ ] `ProgressionStack.ts`
- [ ] `PlaybackQueue.ts`
- [ ] 브라우저 콘솔 단위 동작 확인

### Step 4. 음악 로직 (`musicTheory.ts`)
- [ ] `getDiatonicChords(genre, mode)`
- [ ] `detectChord(notes, key, mode)` — 인버전 처리
- [ ] `romanToChordName(roman, key, mode, genre)` — 블루스 7화음
- [ ] `inferKey(playedChords)` — 신뢰도 0.7 임계값
- [ ] `buildDiatonicChord(rootNote, key, mode, genre)` — 검은건반 스냅

### Step 5. 오디오 엔진
- [ ] "시작하기" → `await Tone.start()` unlock
- [ ] `Tone.PolySynth` + `Tone.Reverb`
- [ ] `playChord(notes, duration)`
- [ ] `playProgression(chords, bpm)` — Queue, 코드당 2박자

### Step 6. 글로벌 상태
- [ ] `AppState` + `useReducer` actions
- [ ] Context Provider + `useProgressionStore` 훅

### Step 7. 컴포넌트
- [ ] `SetupModal` — "시작하기" → `Tone.start()`
- [ ] `Piano` — 듀얼 모드, Space 통일, 포커스 관리, 코드 미리보기
- [ ] `ProgressionTimeline` — Stack 렌더링, 재생 pulse
- [ ] `RecommendationPanel` — 카드(코드명+가중치바+분위기), hover 미리듣기
- [ ] `Toolbar` — ✨ 키 없으면 비활성

### Step 8. 통합 & 마무리
- [ ] 추천 로직 전체 흐름
- [ ] 키 추론 뱃지
- [ ] localStorage 저장
- [ ] 라이트 테마 스타일링

---

## 검증 체크리스트

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 1 | 자유 모드: C+E+G → Space | C major (I) 추가 |
| 2 | 코드 모드: D 클릭 → Space | Dm (ii) 추가 (C장조 기준) |
| 3 | 코드 모드: D 클릭 → D 재클릭 | Dm (ii) 추가 |
| 4 | 코드 모드: C# 클릭 (C장조) | 가장 가까운 다이어토닉 스냅 |
| 5 | 키 없이 C, Am, F 추가 | `💡 예상 키: C major` 뱃지 |
| 6 | Pop I 후 추천 | IV(28%) "따뜻하게", V(25%) "긴장감" |
| 7 | 진행 0개 | startingChords 카드 표시 |
| 8 | 키 없이 ✨ | 버튼 비활성 + 툴팁 |
| 9 | BPM 120 재생 | 코드당 1초 간격 |
| 10 | BPM 입력 중 키 타이핑 | 피아노 소리 안 남 |
