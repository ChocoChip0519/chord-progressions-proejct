# ChordFlow — UI Design Spec

> Claude Design용 디자인 스펙. React + TypeScript + Tailwind CSS 기준.

---

## 앱 개요

코드 진행 추천 웹앱. 사용자가 가상 피아노로 코드를 누르면 다음 코드를 카드로 추천해준다.
비전공자도 쉽게 쓸 수 있도록 분위기 설명 위주. 라이트 테마.

---

## 디자인 토큰

### 컬러

```
배경:       #f8f9fa
패널/카드:  #ffffff
테두리:     #e9ecef
텍스트:     #1a1a2e  (기본)
            #6c757d  (보조, 작은 설명)
            #adb5bd  (비활성)

장르 accent:
  Pop:   #6c63ff  (보라)
  Jazz:  #e07b39  (주황)
  Rock:  #d63031  (빨강)
  Blues: #2980b9  (파랑)

성공:   #2ecc71
경고:   #f39c12
피아노 검은건반: #2d3436
피아노 흰건반:   #ffffff
```

### 타이포그래피

```
font-family: 'Inter', sans-serif (UI 전반)
             'JetBrains Mono', monospace (코드명, 로마자)

코드명 (카드 메인):   20px, font-weight 600
분위기 설명:          13px, font-weight 400, color #6c757d
로마자:               11px, monospace, font-weight 500
가중치 퍼센트:        12px, font-weight 600
버튼 텍스트:          14px, font-weight 500
헤더:                 15px, font-weight 600
```

### 간격 & 반지름

```
카드 padding:    16px
카드 radius:     12px
카드 shadow:     0 2px 8px rgba(0,0,0,0.08)
카드 hover:      0 6px 20px rgba(0,0,0,0.12) + translateY(-4px)
버튼 radius:     8px
피아노 radius:   0 0 6px 6px (흰건반 하단)
gap (카드 사이): 12px
```

---

## 전체 레이아웃

세로 4분할. 고정 높이, 스크롤 없음 (1280×800 기준).

```
┌─────────────────────────────────────────────┐
│  Header (56px)                              │
├─────────────────────────────────────────────┤
│  Progression Timeline (120px)               │
├─────────────────────────────────────────────┤
│  Recommendation Panel (200px)               │
├─────────────────────────────────────────────┤
│  Piano Area (flex-1, 최소 280px)            │
└─────────────────────────────────────────────┘
```

---

## 컴포넌트 상세

---

### 1. Header

높이 56px. 좌측 로고, 중앙 세션 뱃지, 우측 설정 버튼.

```
[🎵 ChordFlow]   [Pop 🎤] [키: C] [장조] [♩ 120]   [⚙ 설정]
```

**세션 뱃지**:
- 배경: 장르 accent 색상, 투명도 15% (`rgba(accent, 0.15)`)
- 텍스트: 장르 accent 색상
- padding: 4px 10px, radius: 20px
- 클릭 시 SetupModal 열림

**로고**: `🎵 ChordFlow`, 18px bold, color #1a1a2e

---

### 2. Progression Timeline

높이 120px. 코드 카드들이 좌→우로 나열. 가로 스크롤 가능.

```
[↩] [↪]              [▶ 전체듣기] [✨ 자동생성] [🗑]
  C     →   Am   →   F    →   G    →  [+추가]
  I        vi        IV        V
```

**코드 카드 (타임라인용)**:
- 크기: 72×72px
- 배경: #ffffff
- 테두리: 1px solid #e9ecef
- radius: 10px
- **현재(마지막)** 카드: 장르 accent 테두리 2px, accent 배경 10%
- **재생 중** 카드: pulse 애니메이션 (테두리가 accent 색상으로 깜빡임)
- 내부: 코드명 (14px bold) 위, 로마자 (11px mono) 아래

**[+추가] 점선 카드**:
- 동일 크기, 테두리: 2px dashed #adb5bd
- 중앙에 + 아이콘, color #adb5bd

**툴바 버튼**:
- 아이콘 버튼, 32×32px, radius 8px
- hover: #f1f3f5 배경
- ✨ 자동생성: 키 없으면 `opacity: 0.4, cursor: not-allowed`, tooltip "키를 먼저 설정해주세요"
- ▶ 재생 중: ⏹ 정지로 텍스트 교체

---

### 3. Recommendation Panel

높이 200px. 제목 + 카드 4개 가로 배열.

**섹션 제목**: `💡 다음 코드로 어때요?`, 14px, color #6c757d

**추천 카드 (4개)**:
- 크기: `flex: 1`, 최소 140px
- 높이: 140px
- 배경: #ffffff
- 테두리: 1px solid #e9ecef, radius 12px
- shadow: 0 2px 8px rgba(0,0,0,0.08)

카드 내부 레이아웃:
```
┌──────────────────────┐
│  [🎹] C major     [⭐]│  ← 코드명 (20px bold) + source 아이콘 + 1위 별
│                      │
│  ████████████  28%   │  ← 가중치 바 (accent 색) + 퍼센트 (12px bold)
│                      │
│  I · 밝고 안정적     │  ← 로마자 + 분위기 (13px, color #6c757d)
└──────────────────────┘
```

**가중치 바**:
- 배경: #f1f3f5, 높이 6px, radius 3px
- 채워진 부분: 장르 accent 색상
- 너비: weight × 100%

**카드 상태**:
- 기본: 위 디자인
- hover: `translateY(-4px)`, shadow 강해짐, 0.5초 코드 미리듣기 재생
- 클릭: scale(0.97) 클릭 피드백

**출처 아이콘**:
- 🎹 = 키 기반 추천 (diatonic)
- 🎵 = 장르 기반 추천 (graph only)

**진행 0개 상태**:
- 카드에 "시작 코드" 레이블 표시 (I, vi 등)
- 분위기: "여기서 시작해보세요"

---

### 4. Piano Area

상단: 피아노 제목 줄 (상태 표시 + 모드 토글)
중단: 피아노 건반
하단: 현재 상태 텍스트

**피아노 제목 줄**:
```
🎹 피아노   [💡 예상 키: C major ✓]   [자유 모드 ↔ 코드 모드]
```

- `💡 예상 키` 뱃지: 초록 배경 (#eafaf1), 초록 텍스트 (#27ae60), radius 20px
  - 클릭하면 키 확정 (뱃지가 accent 색으로 바뀜)
- 모드 토글: pill 형태 toggle, 선택된 쪽 accent 배경

**피아노 건반**:
```
흰건반 13개 (C4~C5): 각 44px 너비, 160px 높이
검은건반 8개: 각 28px 너비, 100px 높이, 흰건반 위에 absolute 배치
```

흰건반:
- 기본: #ffffff, 테두리 1px solid #dee2e6
- hover: #f8f9fa
- 활성(눌림): 장르 accent 색상, 투명도 40%
- radius: 0 0 6px 6px

검은건반:
- 기본: #2d3436
- hover: #495057
- 활성: 장르 accent 색상 (진하게)
- radius: 0 0 4px 4px

**건반 레이블** (하단 중앙):
- 자유 모드: 키보드 단축키 (A, W, S …), 11px, color #adb5bd
- 코드 모드: 코드명 약어 (C(I), Dm(ii) …), 10px, color #6c63ff (accent)

**하단 상태 줄**:
```
[자유 모드]: 1~2개 → "음을 더 눌러보세요"
             3개+  → "✅ C major (I) — Space로 추가"
[코드 모드]:        → "건반을 눌러보세요 — Space로 추가"
             선택 후 → "✅ D minor (ii) — Space 또는 재클릭으로 추가"
```

---

### 5. SetupModal

풀스크린 오버레이. 중앙 정렬 카드 (max-width 500px).

```
┌──────────────────────────────────────┐
│  🎵 어떤 느낌의 음악을 만들까요?      │
│                                        │
│  ┌──────────┐  ┌──────────┐           │
│  │ 🎤  팝   │  │ 🎷 재즈  │           │
│  │I-V-vi-IV │  │ ii-V-I  │           │
│  └──────────┘  └──────────┘           │
│  ┌──────────┐  ┌──────────┐           │
│  │ 🎸  락   │  │🎵 블루스 │           │
│  │ I-IV-V-I │  │ 12-bar  │           │
│  └──────────┘  └──────────┘           │
│                                        │
│  키 (선택)                             │
│  C  C# D  D# E  F  F# G  G# A  A# B  │
│  [●]                                  │
│  [나중에 정하기]                        │
│                                        │
│  모드:  [장조 ●]  [단조  ]            │
│                                        │
│  BPM:  ──────────●──────  120         │
│        60                180           │
│                                        │
│  ┌─────────────────────────┐           │
│  │   🎵 시작하기 →         │           │
│  └─────────────────────────┘           │
└──────────────────────────────────────┘
```

**장르 카드** (4개):
- 크기: 210×80px, radius 12px
- 기본: 배경 #f8f9fa, 테두리 1px solid #e9ecef
- 선택됨: accent 배경 15%, accent 테두리 2px
- 내부: 이모지 + 장르명 (16px bold) / 예시 진행 (12px, #6c757d)

**키 선택**:
- 12개 버튼 가로 배열, 각 38×36px, radius 8px
- 선택됨: accent 배경, 흰 텍스트
- [나중에 정하기]: 텍스트 버튼, 14px, color #6c757d, underline

**모드 토글**: pill 형태

**BPM 슬라이더**:
- 트랙: 4px, accent 색상 (채워진 쪽)
- 썸: 16×16px, accent 색상 circle

**시작하기 버튼**:
- 전체 너비, 48px 높이, accent 배경, 흰 텍스트, radius 10px
- hover: 살짝 어두워짐

---

## 인터랙션 & 애니메이션

| 요소 | 애니메이션 |
|---|---|
| 추천 카드 hover | `translateY(-4px)`, shadow 강해짐, `transition: 200ms ease` |
| 추천 카드 클릭 | `scale(0.97)`, `transition: 100ms` |
| 피아노 건반 누름 | 배경색 변경, `transition: 50ms` |
| 재생 중 타임라인 카드 | `border-color` pulse 애니메이션, 1초 주기 |
| 자동생성 후 카드 등장 | 카드마다 `fadeInUp`, 100ms 간격으로 순차 등장 |
| 모달 열림/닫힘 | `opacity + scale(0.95→1)`, `200ms ease-out` |
| 키 추론 뱃지 등장 | `fadeIn + slideDown`, `300ms` |
| ✨ 클릭 시 | 버튼 spin 아이콘 → 카드 순차 등장 |

---

## 반응형

- **1280px+**: 전체 레이아웃
- **768~1279px**: 피아노 건반 너비 축소 (흰건반 36px)
- **모바일(~767px)**: 피아노 숨김, 카드 모드만 표시 (코드 모드 전용)

---

## 아이콘

Lucide React (`npm install lucide-react`) 사용.

| 기능 | 아이콘 |
|---|---|
| 재생 | `Play` |
| 정지 | `Square` |
| Undo | `Undo2` |
| Redo | `Redo2` |
| 자동생성 | `Sparkles` |
| 초기화 | `Trash2` |
| 설정 | `Settings` |
| 피아노 | `Piano` |
| 예상 키 | `Lightbulb` |

---

## 컴포넌트 구현 우선순위

Claude Design에 순서대로 요청:

1. **SetupModal** — 앱 시작 진입점, 독립적
2. **RecommendationPanel + ChordCard** — 핵심 기능, 가장 많이 보임
3. **ProgressionTimeline + Toolbar** — 코드 진행 표시 + 조작
4. **Piano** — 가장 복잡, 마지막에
5. **Header** — 간단, 마지막

각 컴포넌트 요청 시 함께 줄 것:
- 이 DESIGN.md 전체
- `src/types/music.ts` 타입 정의
- 해당 컴포넌트의 props 인터페이스
