# ChordFlow — 개발 로드맵

> 작성일: 2026-05-16 / 마지막 업데이트: 2026-05-17  
> 현재 완성도: ~85% (핵심 기능 동작 + 버그 수정 완료, 저장/공유/편집 미구현)

---

## 현재 코드베이스 점검

### 버그 / 데이터 오류

| # | 파일 | 문제 | 영향 | 상태 |
|---|------|------|------|------|
| B1 | `src/data/songs.json` L74 | `"ㅐroman"` 오타 (한글 자소 혼입) | 패턴 매칭에서 해당 곡 무시됨 | ✅ 완료 |
| B2 | `src/data/songs.json` | Blues 곡 데이터 없음 | Blues 키 추론·패턴 매칭 불능 | 미완료 |
| B3 | `src/music.js` ~L266 | 패턴 매칭 반환 시 `quality`가 항상 `"maj"` | 도미넌트·마이너 코드가 메이저로 표시됨 | 미완료 |
| B4 | `src/music.js` ~L182-206 | 키 추론이 루트 포함 여부만 체크 (코드 품질 무시) | C장조 / F장조 혼동 발생 | 미완료 |
| B5 | `src/audio.js` | `window.__STOP_PLAYBACK` 전역 플래그로 재생 제어 | 빠른 연속 재생 시 타이밍 깨짐 | ✅ 완료 |
| B6 | `src/Piano.jsx` | 코드 모드 빠른 클릭 시 이전 프리뷰 해제 안 됨 | 신스 보이스 누락(leak) | 미완료 |

### 미구현 기능

| # | 항목 | 현황 |
|---|------|------|
| M1 | `PlaybackQueue` 자료구조 | ✅ 완료 — `structures.js`에 구현, `audio.js`에서 사용 |
| M2 | localStorage 세션/진행 저장 | 완전 미구현 |
| M3 | 단조(minor) 다이어토닉 완전 지원 | 일부 하드코딩, 코드 감지 미검증 |
| M4 | 모바일 반응형 레이아웃 | 데스크톱 전용 |
| M5 | 키보드 단축키 도움말 모달 | 없음 |

### 구조적 부채

| # | 파일 | 문제 |
|---|------|------|
| S1 | `src/App.jsx` | 346줄 — 상태·로직·렌더 혼재 |
| S2 | `src/styles.css` | 400줄+ 단일 파일, 스코핑 없음 |
| S3 | `src/data.js` | JSON이어야 할 데이터가 JS 인라인 (~300줄) |
| S4 | `src/Piano.jsx` | `useRef` 8개+, 테스트·추론 어려움 |
| S5 | 전체 | TypeScript 미도입 (런타임 에러 방어 불가) |
| S6 | UI | 키 추론 뱃지가 Piano·Recommendations 두 곳에 중복 렌더 |

---

## 개발 단계

### Phase 0 — 즉시 버그 수정 (1~2일)

- [x] `songs.json` L74 오타 수정 (`"ㅐroman"` → `"roman"`)
- [ ] Blues 곡 데이터 10개 이상 추가 (12-bar 표준 진행 중심)
- [ ] 패턴 매칭 반환 품질 수정 (`quality` 필드를 songs.json에서 읽기)
- [x] `PlaybackQueue` 클래스 `structures.js`에 추가 후 `audio.js`에 연결
- [ ] Piano 코드 모드 보이스 leak 수정 (이전 프리뷰 명시적 해제)

---

### Phase 1 — 홈 화면 + 코드 진행 저장·폴더 관리 (2~3주)

#### 화면 구조

```
작업 list | list1 | list2 | +          ← 폴더 탭 바
┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │ +  │           ← 새 코드 진행 만들기 (고정)
└────┘ └────┘ └────┘ └────┘
┌────┐ ┌────┐ ┌────┐ ┌────┐
│    │ │    │ │    │ │    │
└────┘ └────┘ └────┘ └────┘
```

- 탭 클릭 시 해당 폴더의 카드 그리드로 전환 (4열, 세로 스크롤)
- 첫 줄 마지막 셀 = "새 코드 진행 만들기" 버튼 고정

#### 폴더 구조

- **작업 list**: 저장된 모든 코드 진행의 전체 보관함
- **list1, list2 …**: 사용자 정의 폴더
  - 카드를 여러 폴더에 동시 포함 가능
  - 탭 우측 `+`로 폴더 생성 / 폴더명 클릭으로 이름 수정 / 폴더 삭제
  - 폴더 삭제 시 카드는 삭제되지 않고 작업 list에 유지

#### 드래그앤드롭 (dnd-kit)

- **폴더 간 이동**: 카드를 드래그해 상단 탭 위에 올리면 해당 폴더에 추가
- **카드 재배열**: 롱 프레스 or 드래그 시작 시 편집 모드
  - 카드가 float 형태로 떠오르며 그림자 생김
  - 드래그로 위치 이동, 다른 카드 자동으로 밀려남
  - 빈 영역 클릭 or 완료 버튼으로 편집 모드 종료 후 순서 저장

#### 카드 구성

- 코드 진행 제목
- 코드 진행 요약 (예: `C - Am - F - G`)
- 장르 태그, 저장 일시
- 폴더 지정 버튼
- 🗑 삭제 버튼 (삭제 확인 모달)

#### 정렬 (폴더별 독립 적용)

- 제목 이름순 / 최신순

---

### Phase 2 — 추천 로직 체계화 (1~2주)

#### 2-A. 추천 엔진 모듈화

- [ ] `src/lib/RecommendationEngine.ts` 생성 — 모든 추천 분기를 단일 함수로 통합
  ```typescript
  function getRecommendations(
    progression: ChordEntry[],
    session: Session,
    inferredKey: InferredKey | null
  ): RecommendedChord[]
  ```
- [ ] 분기 우선순위 명시적 문서화 + 단위 테스트 (Vitest)

#### 2-B. 키 추론 알고리즘 개선

현재: 루트음이 스케일에 포함되는지만 체크 → 조성 혼동 빈번

개선:
- [ ] 코드 품질까지 반영 (C major → C장조 가능성 ↑, C minor → C단조 or Eb장조)
- [ ] 도수 기반 가중치 행렬 도입 (I/IV/V 포함 시 해당 조성 점수 대폭 상승)
- [ ] 신뢰도 임계값 0.7을 상수로 추출해 조정 가능하게

#### 2-C. 데이터 보강

- [ ] **Blues songs.json**: 유명 블루스 10곡 이상 추가 (Stormy Monday, Sweet Home Chicago, Red House 등)
- [x] **Jazz 전이 데이터**: 7화음(Imaj7/ii7/V7 등) + 삼전음 대리(bII7), 부속 도미넌트(VI7/II7) 추가
- [ ] **단조 전이 데이터**: rock/pop 단조 transitions 분리

---

### Phase 3 — UI 개선

#### 3-A. 디자인 시스템 정립

- [ ] CSS 변수 체계화
  ```css
  --color-bg, --color-surface, --color-text-primary
  --color-accent   /* 장르별 자동 교체 */
  --radius-sm, --radius-md, --radius-lg
  --shadow-sm, --shadow-card
  ```
- [ ] 다크 모드 지원 (`prefers-color-scheme`)
- [ ] 컴포넌트별 CSS 모듈 분리 (`*.module.css`)
- [ ] `transition` 기간·easing 변수화

---

### Phase 4 — 공유 기능 (2~3주)

#### 4-A. URL 공유 (백엔드 없이)

- [ ] 진행을 Base64/msgpack으로 인코딩 → URL hash에 삽입
  ```
  https://chordflow.app/#s=eyJnZW5...
  ```
- [ ] URL 로드 시 세션 자동 복원
- [ ] "링크 복사" 버튼 + 복사 완료 토스트

#### 4-B. 내보내기

- [ ] **텍스트 복사**: `C - Am - F - G (Pop, BPM 120)`
- [ ] **이미지 내보내기**: 타임라인 캡처 (html2canvas)
- [ ] **MIDI 내보내기**: `.mid` 파일 다운로드
- [ ] **코드 시트 PDF**: 인쇄용 레이아웃

---

### Phase 5 — TypeScript 마이그레이션 (1주)

- [ ] Vite 설정에 TypeScript 추가
- [ ] `src/types/music.ts` 공통 타입 (CLAUDE.md 스펙 기준)
- [ ] `music.js` → `musicTheory.ts`
- [ ] `structures.js` → `ChordGraph.ts`, `ProgressionStack.ts`, `PlaybackQueue.ts`
- [ ] `audio.js` → `audioEngine.ts`
- [ ] 컴포넌트 `.jsx` → `.tsx` 순차 변환
- [ ] ESLint + `@typescript-eslint` 설정

---

### Phase 6 — 테스트 · 품질 (1주, Phase 5와 병행)

- [ ] Vitest 설정
- [ ] `ChordGraph` 단위 테스트 (getRecommendations, randomWalk)
- [ ] `ProgressionStack` 단위 테스트 (undo/redo 시나리오 10개)
- [ ] `PlaybackQueue` 단위 테스트
- [ ] `musicTheory` 단위 테스트 (detectChord, inferKey, romanToChordName)
- [ ] CLAUDE.md 검증 체크리스트 10개 시나리오 → E2E 테스트 (Playwright)

---

## 우선순위 요약

| 시기 | 우선순위 | 내용 |
|------|----------|------|
| ~~즉시 (이번 주)~~ | ~~P0~~ | ~~B1~B6 버그 수정, M1 PlaybackQueue 추가~~ → **✅ B1/B5/M1 완료, B2/B3/B4/B6 잔여** |
| 단기 (2~4주) | P1 | 저장·편집·폴더 (Phase 1) |
| 단기 (2~4주) | P2 | 추천 로직 모듈화 + 잔여 데이터 보강 (Blues곡, 단조 transitions) |
| 중기 (1~2개월) | P3 | UI 개선 (Phase 3) |
| 장기 (2~3개월) | P4 | URL 공유·내보내기 (Phase 4) |
| 장기 (2~3개월) | P5 | TypeScript 마이그레이션 (Phase 5) |
| 장기 (2~3개월) | P6 | 테스트 인프라 (Phase 6) |
| 장기 (2~3개월) | P7 | 모바일 완전 대응, 다크 모드, MIDI 입력 |

---

## 데이터 추가 계획

### Blues songs.json 추가 예시

```json
{ "title": "Sweet Home Chicago", "key": "E", "mode": "major",
  "absolute": ["E7","A7","E7","E7","A7","A7","E7","E7","B7","A7","E7","B7"],
  "roman":    ["I7","IV7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"] },
{ "title": "Red House", "key": "Bb", "mode": "major",
  "absolute": ["Bb7","Bb7","Bb7","Bb7","Eb7","Eb7","Bb7","Bb7","F7","Eb7","Bb7","F7"],
  "roman":    ["I7","I7","I7","I7","IV7","IV7","I7","I7","V7","IV7","I7","V7"] }
```

### Jazz 전이 데이터 (✅ 구현 완료)

7화음 표기로 전면 교체 + 재즈 고유 어법 노드 추가됨:

```js
// src/data.js — transitions.jazz
"Imaj7":  { "vi7": 0.25, "ii7": 0.25, "IVmaj7": 0.20, "V7": 0.15, "VI7": 0.10, "bII7": 0.05 },
"ii7":    { "V7": 0.55, "bII7": 0.20, "IVmaj7": 0.12, "Imaj7": 0.08, "vi7": 0.05 },
"bII7":   { "Imaj7": 0.80, "vi7": 0.20 },           // 삼전음 대리코드
"VI7":    { "ii7": 0.70, "V7": 0.20, "IVmaj7": 0.10 } // 부속 도미넌트
```

---

*이 문서는 개발 진행에 따라 지속 업데이트.*
