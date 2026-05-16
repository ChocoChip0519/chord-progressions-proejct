# ChordFlow — PPT 발표 자료

---

## 슬라이드 1 · 목표

**제목**: ChordFlow — 코드 진행 추천 웹앱

**핵심 문장**
비전공자도 직접 코드 진행을 만들어보고, 작곡가는 새로운 아이디어를 얻을 수 있는 인터랙티브 음악 도구

**만들고자 한 것**
- 장르(Pop / Jazz / Rock / Blues)와 키를 선택하면 다음 코드를 추천
- 가상 피아노로 직접 코드를 누르거나 추천 카드를 클릭해서 코드 진행을 구성
- 쌓인 코드 진행을 전체 재생하거나 자동으로 생성 가능

---

## 슬라이드 2 · 시스템 흐름도

```
사용자 입력 (장르 / 키 / BPM 설정)
        │
        ▼
   SetupModal
        │
        ▼
┌───────────────────────────────────────────────────────┐
│                    App.jsx (전역 상태)                  │
│   session / progression / pendingChord / inferredKey   │
└────────┬──────────────┬──────────────┬────────────────┘
         │              │              │
         ▼              ▼              ▼
    ChordGraph     ProgressionStack   MUSIC 유틸
  (transitions)   (push/undo/redo)  (detectChord,
                                     inferKey 등)
         │              │
         ▼              ▼
  추천 로직 계산     Timeline 렌더링
  (recs useMemo)
         │
         ▼
  RecommendationPanel          Piano
  (카드 클릭 → pick)    (건반 → 코드 확정)
         │                      │
         └──────────┬───────────┘
                    ▼
               pushChord()
              (Stack에 추가)
                    │
                    ▼
          AUDIO.playProgression
          (PlaybackQueue 기반)
```

---

## 슬라이드 3 · 유스케이스 다이어그램 & 사용 기술

### 유스케이스

```
[사용자]
  ├─ 장르 / 키 / BPM 설정
  ├─ 피아노 건반 눌러 코드 추가  (자유 모드 / 코드 모드)
  ├─ 추천 카드 클릭해서 코드 추가
  ├─ 코드 진행 전체 재생
  ├─ Undo / Redo
  ├─ 자동 생성  (키 설정 시에만 활성)
  └─ 키 추론 뱃지 확정
```

### 사용 기술 명세

| 분류 | 기술 |
|---|---|
| 프레임워크 | React 19, Vite |
| 오디오 | Tone.js (PolySynth + Reverb) |
| 상태 관리 | useState / useMemo / useRef |
| 자료구조 | Graph, Stack, Queue, Array (직접 구현) |
| 데이터 | Hooktheory 통계 기반 수동 수집 JSON |
| 스타일 | CSS (라이트 테마, CSS 변수로 장르별 accent 색상) |

---

## 슬라이드 4 · 웹페이지 상태

> 스크린샷으로 대체

보여줄 화면 목록:
1. SetupModal — 시작 전 장르 / 키 / BPM 설정 화면
2. 코드 0개 상태 — startingChords 추천 카드 표시
3. 코드 진행 쌓인 상태 + 추천 카드 (키 있음)
4. `💡 예상 키: C major` 뱃지 표시 상태 (키 없이 진행)
5. 재생 중 상태 — 타임라인 pulse 강조

---

## 슬라이드 5 · 코드 진행 추천 방식 (개요)

```
장르 + 키 선택
      │
      └─► 도수(로마자) 기반 추천
          transitions[genre]["I"] → { IV:28%, V:25%, vi:23% }
          + diatonic 필터 (해당 키 스케일 내 코드만 통과)


장르만 선택 (키 없음)
      │
      ├─► 코드 0개: startingChords 고정 카드
      │
      ├─► 코드 1개+: songs.json 절대음명 패턴 매칭
      │     현재 진행 prefix와 같은 곡 찾기
      │     → 그 곡들의 다음 코드 빈도 집계 → 추천
      │
      ├─► (패턴 매칭 실패 시) 장르 전이 가중치 폴백
      │
      └─► inferKey 신뢰도 ≥ 0.7 되면 자동으로 도수 기반 전환
```

---

## 슬라이드 6 · 데이터셋

### ① songs.json — 실제 곡 데이터

```json
"pop": [
  {
    "title": "Let It Be",
    "key": "C",
    "mode": "major",
    "absolute": ["C", "G", "Am", "F"],
    "roman":    ["I", "V", "vi", "IV"]
  }
]
```

- `absolute` : 키 미확정 시 절대음명 패턴 매칭에 사용
- `roman`    : 도수 참고용
- 출처 : Hooktheory Trends, de Clercq & Temperley 2011 논문

### ② transitions — 코드 전이 확률 (Pop 기준, data.js 인라인)

```
Pop I  → { IV:28%, V:25%, vi:23%, ii:13%, iii:7% }
Pop IV → { V:38%,  I:28%, ii:18%, vi:9%,  IV:7%  }
Pop V  → { I:52%,  vi:28%, IV:15%, ii:5%          }
Pop vi → { IV:38%, V:27%, ii:19%, I:11%,  iii:5%  }
```

### ③ chordMoods — 분위기 설명 (Pop 기준, 비전공자용)

```
I  (C major) → "밝고 안정적 — 집에 돌아온 느낌"
IV (F major) → "풍성하고 따뜻하게 열리는 느낌"
V  (G major) → "긴장감 — 뭔가 일어날 것 같은 느낌"
vi (Am)      → "감성적이고 슬픈 느낌"
ii (Dm)      → "부드럽게 흘러가는 느낌"
```

---

## 슬라이드 7 · 코드 진행 추천 방식 상세

### 장르 + 키 설정 시

```
마지막 코드의 로마자 (예: "I")
        │
        ▼
ChordGraph.getRecommendations("I", diatonic)
  transitions.pop["I"] = { IV:0.28, V:0.25, vi:0.23, ii:0.13 }
  diatonic 필터: C장조 = [I, ii, iii, IV, V, vi, viiº] → 전부 통과
        │
        ▼
상위 4개 추천 카드:
  F major (IV) 28%  |  G major (V) 25%
  Am (vi)      23%  |  Dm (ii)  13%
```

### 장르만 선택 시 (키 없음)

```
현재 진행: [C, Am]  (절대음명)
        │
        ▼
songs[genre].filter(song =>
  song.absolute.startsWith(["C", "Am"])
)
  → 매칭된 곡들의 다음 코드(인덱스 2) 집계
  → { F: 3회, G: 1회 } → 정규화 → F:75%, G:25%
        │
        ▼
추천 카드:  F major 75%  |  G major 25%

※ inferKey 신뢰도 ≥ 0.7 → 자동으로 도수 기반 방식으로 전환
```

---

## 슬라이드 8 · 자료구조 활용 (4가지)

### ① Graph — 코드 추천

- **구조**: 코드(I, IV, V…)를 노드로, "다음에 올 확률"을 간선 가중치로 연결한 방향 그래프
- **동작**: 현재 마지막 코드를 입력하면 → 연결된 코드들을 확률 높은 순으로 최대 4개 반환
- **자동 생성**: 시작 코드에서 출발해 확률에 따라 랜덤하게 다음 코드를 골라 6개 진행 생성

```
I ──28%──► IV
I ──25%──► V
I ──23%──► vi
I ──13%──► ii
```

### ② Stack — Undo / Redo

- `past[][]` / `current[]` / `future[][]` 이중 스택 구조
- 코드 추가 시 `current`를 `past`에 저장 → undo 시 복원
- redo: `future`에서 꺼내 `current`로 복구

```
시작:       past[ ]                  current[ ]        future[ ]
C 추가:     past[ [] ]               current[ C ]      future[ ]
Am 추가:    past[ [], [C] ]          current[ C, Am ]  future[ ]
Undo:       past[ [] ]               current[ C ]      future[ [C,Am] ]
Redo:       past[ [], [C] ]          current[ C, Am ]  future[ ]
```

### ③ Queue — 전체 재생

- **구조**: 먼저 넣은 것이 먼저 나오는 FIFO 줄 세우기
- **동작**: 코드 진행 전체를 한 번에 큐에 넣고 → 앞에서부터 하나씩 꺼내 순서대로 재생
- BPM에 맞춰 코드당 2박자 간격으로 Tone.js에 전달

```
enqueue: [ C → Am → F → G ]
dequeue:   C 재생 → Am 재생 → F 재생 → G 재생
```

### ④ Array — 다이어토닉 필터

- **구조**: 해당 키에서 쓸 수 있는 코드 목록을 배열로 저장
- **용도 1**: Graph 추천 결과 중 이 배열에 없는 코드는 걸러냄 (조성 밖 코드 제외)
- **용도 2**: 코드 모드 피아노에서 건반을 누르면 이 배열에서 가장 가까운 코드로 자동 스냅

```
C장조 다이어토닉: [ I, ii, iii, IV, V, vi, viiº ]
                  [ C, Dm, Em,  F,  G, Am, Bdim ]
```
