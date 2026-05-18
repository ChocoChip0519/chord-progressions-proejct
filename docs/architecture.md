# Architecture

현재 구현 기준 파일 구조, 상태 관리, 데이터 흐름 문서.

---

## 파일 구조 및 책임

```
src/
├── App.jsx              — 전체 상태 관리, 추천 로직 (useMemo), 이벤트 핸들러, 화면 분기
├── useProjectStore.js   — localStorage CRUD 훅 (projects/folders)
├── LandingPage.jsx      — 랜딩 화면 (앱 소개 + 시작하기 버튼)
├── ProjectDashboard.jsx — 프로젝트 목록 화면 (좌측 사이드바 필터 + 우측 카드 그리드/리스트)
├── ProjectCard.jsx      — 프로젝트 카드 (컬러바 + 코드 미리보기 + 이름/폴더이동/삭제)
├── data.js              — CHORD_DATA: transitions/moods/genres/keys 인라인 + songs.json import
├── music.js             — MUSIC: 음악 이론 순수 함수 (export const MUSIC = {...})
├── structures.js        — ChordGraph, ProgressionStack, PlaybackQueue 클래스
├── audio.js             — AUDIO: Tone.js 래퍼 (Sampler + PolySynth 폴백)
├── styles.css           — 전체 CSS 단일 파일
├── data/
│   └── songs.json       — 장르별 실제 곡 진행 데이터 (absolute 절대음명 배열)
├── Piano.jsx            — 가상 피아노, 자유/코드 모드, 키보드 매핑
├── Recommendations.jsx  — 추천 카드 4개 + ChordPiano 미니 피아노
├── ChordPiano.jsx       — 추천 카드 안 미니 피아노 SVG 시각화
├── Timeline.jsx         — 코드 진행 카드 목록 + Toolbar (저장 버튼 포함)
├── Header.jsx           — 로고, 세션 뱃지, 설정 버튼, 대시보드 뒤로가기
├── SetupModal.jsx       — 장르/키/모드/BPM 설정 모달
└── icons.jsx            — SVG 아이콘 컴포넌트 (Icon name=...)
```

---

## 핵심 상태 (App.jsx)

```js
// 화면 내비게이션
currentView    // 'landing' | 'dashboard' | 'workspace'
activeProjectId // string | null — 현재 열린 프로젝트 ID
isDirty        // boolean — 미저장 변경사항 여부 (Ctrl+S 또는 저장 버튼으로 저장)

// 작업창 상태
session        // { genre, key|null, mode, bpm } — SetupModal에서 설정
progression    // ChordEntry[] — stackRef.current와 항상 동기화
pendingChord   // ChordEntry | null — Space 누르기 전 미리보기 상태
inferredKey    // { key, mode, confidence } | null — progression에서 자동 추론
recs           // RecommendedChord[] — useMemo([progression, session, inferredKey])
playingIdx     // number — 재생 중인 카드 인덱스 (-1 = 미재생)
isPlaying      // boolean
showSetup      // boolean — SetupModal 표시 여부
pianoMode      // 'free' | 'chord'
```

### localStorage (useProjectStore.js)

```js
// Key: chordflow_projects — Project[]
{ id, name, folderId, session, progression, createdAt, updatedAt }

// Key: chordflow_folders — Folder[]
{ id, name, color, createdAt }   // color: hex — 사이드바 dot + 카드 컬러바에 사용
```

### 인스턴스 ref (리렌더 무관하게 유지)

```js
graphRef       // ChordGraph 인스턴스 — session.genre 변경 시 loadFromData 재호출
stackRef       // ProgressionStack 인스턴스 — push/undo/redo/set/clear
```

---

## 데이터 흐름

### 추천 로직 (App.jsx `recs` useMemo)

| 상황 | 동작 |
|---|---|
| `progression.length === 0` | `startingChords[genre]` 고정 카드. key 없으면 C 기준으로 이름 표시 |
| `progression.length >= 1`, 키 미확정 (inferKey < 0.7) | `getAbsolutePatternRecs` → 결과 없으면 `impliedTonicFromProgression` + graph 폴백 |
| 키 확정 (직접 설정 or inferKey >= 0.7) | `getRelativeRoman` → `graph.getRecommendations(lastRoman, diatonic, 4, genre)` |

### 키 추론 흐름

```
progression 변경
  → inferKey(progression): length >= 3이면 12키×2모드 스코어링
  → confidence >= 0.7이면 inferredKey 세팅
  → 뱃지 클릭 (handleConfirmInferredKey)
    → retroactivelyUpdateRomans: 기존 progression romanNumeral 소급 업데이트
    → session.key 확정
```

### 코드 추가 흐름

```
피아노 pressKey / Recommendations onPick
  → setPendingChord(ch) + AUDIO.playChord 미리듣기
  → Space 또는 같은 카드/건반 재클릭
  → pushChord(ch)
    → stackRef.current.push(ch)
    → setProgression(stackRef.current.getAll())
```

### 재생 흐름

```
handlePlayStop
  → AUDIO.playProgression(progression, bpm, onIndex)
    → PlaybackQueue에 enqueueAll
    → dequeue 루프: triggerAttackRelease → setTimeout(chordDur)
    → onIndex(i) 콜백 → setPlayingIdx(i)
  → 완료 또는 stopPlayback() 시 setPlayingIdx(-1)
```

---

## 자료구조 구현

### ChordGraph (structures.js)

- 인접 리스트: `Map<string, Map<string, number>>`
- `getRecommendations(from, diatonic, topN, genre)`: diatonic null이면 필터 없음. jazz는 `JAZZ_EXTRAS(bII7, VI7, II7)` 추가 허용
- `randomWalk(start, steps, diatonic, genre)`: 가중치 기반 랜덤 워크 (자동생성용)

### ProgressionStack (structures.js)

- `current[]`, `past[][]`, `future[][]` 이중 스택
- `push(item)`: past에 현재 스냅샷 저장 후 추가
- `set(newArr)`: 배열 통째로 교체 (자동생성, 소급 업데이트 시 사용)
- `undo() / redo()`: past/future 스택 이동

### PlaybackQueue (structures.js)

- 단순 배열 기반 FIFO
- `enqueueAll(items)` → `dequeue()` 루프로 재생

---

## 오디오 엔진 (audio.js)

- `ensureStarted()`: Tone.start() + Sampler 초기화. **SetupModal Begin에서만 호출**
- Sampler 로딩 실패 시 PolySynth로 폴백 (8초 타임아웃)
- `attackNote / releaseNote`: 자유 모드 실시간 연주
- `playChord(notes, duration)`: 추천 카드 미리듣기
- `playProgression(chords, bpm, onIndex)`: Queue 기반 전체 재생

---

## CSS 변수 시스템 (styles.css)

장르 accent는 App.jsx `useEffect`에서 동적 주입. CSS에서 hex 직접 사용 금지.

```css
--accent          /* 장르 메인 색상 */
--accent-10       /* rgba(accent, 0.10) */
--accent-15       /* rgba(accent, 0.15) */
--accent-40       /* rgba(accent, 0.40) */
```

장르별 accent 값 (data.js):

| 장르 | accent |
|---|---|
| Pop | `#6c63ff` |
| Jazz | `#e07b39` |
| Rock | `#d63031` |
| Blues | `#2980b9` |

---

## 도수 표기 규칙

### 재즈
diatonic: `Imaj7 ii7 iii7 IVmaj7 V7 vi7 viiº`
transitions 키도 이 표기 기준. `JAZZ_EXTRAS = { bII7, VI7, II7 }` 추가 허용.

### 블루스
diatonic: `I7 IV7 V7`
`getRecommendations` 호출 전 `lastRoman`에 "7" 없으면 붙임.

---

## 피아노 키보드 매핑

| 건반 | 키 |
|---|---|
| 흰건반 C4–B5 (14개) | `Z X C V B N M` / `Q W E R T Y U` |
| 검은건반 (10개) | `S D G H J` / `2 3 5 6 7` |
| 코드 확정 | `Space` (자유/코드 모드 공통) |
| 추천 카드 탐색 | `← →` |
| 미리보기 취소 | `Escape` |

타이핑 중 (INPUT / TEXTAREA / isContentEditable) 이면 모든 피아노 이벤트 무시.
