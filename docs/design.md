# ChordFlow — UI 디자인 스펙

현재 구현 상태 기준 문서. 컴포넌트별 실제 구조, 클래스명, 상태 분기 기록.

---

## 디자인 토큰

### 컬러 (styles.css 변수)

```css
/* 워크스페이스 */
--bg:        #f8f9fa      /* 앱 배경 */
--panel:     #ffffff      /* 카드/패널 */
--border:    #e9ecef      /* 테두리 */
--text:      #1a1a2e      /* 기본 텍스트 */
--text-2:    #6c757d      /* 보조 텍스트 */
--text-3:    #adb5bd      /* 비활성/힌트 */

/* 장르별 accent — App.jsx에서 동적 주입 */
--accent:               /* hex */
--accent-10:            /* rgba(accent, 0.10) */
--accent-15:            /* rgba(accent, 0.15) */
--accent-40:            /* rgba(accent, 0.40) */

/* 대시보드 웜톤 */
--dash-bg:      #F5F0EB   /* 배경 */
--dash-sidebar: #EFEBE4   /* 사이드바 */
--dash-card:    #FFFDF9   /* 카드 */
--dash-text:    #1A1714
--dash-text-2:  #6B6459
--dash-text-3:  #A89F95
--dash-border:  rgba(0,0,0,0.08)
--dash-card-shadow / --dash-card-hover
```

장르별 accent 값 (`data.js` genres 배열):

| 장르 | accent |
|---|---|
| Pop | `#6c63ff` |
| Jazz | `#e07b39` |
| Rock | `#d63031` |
| Blues | `#2980b9` |

### 타이포그래피

```
'Inter', sans-serif         — UI 전반
'JetBrains Mono', monospace — 코드명, 로마자 (.mono 클래스)

코드명 (카드 메인):   16–20px, font-weight 600
분위기 설명:          13px, color var(--text-2)
로마자:               11–12px, monospace
퍼센트:               12px, monospace, font-weight 600
버튼 텍스트:          13–14px
헤더:                 14–15px, font-weight 600
```

### 공통 쉐도우 / 반지름

```
워크스페이스 카드 shadow:   0 2px 8px rgba(0,0,0,0.08)
워크스페이스 카드 hover:    0 6px 20px rgba(0,0,0,0.12) + translateY(-4px)
워크스페이스 카드 radius:   10–12px
버튼 radius:   8px
badge radius:  20px (pill)

대시보드 카드 shadow:  --dash-card-shadow (0 2px 8px + 0.5px outline)
대시보드 카드 hover:   --dash-card-hover  (0 6px 20px + 0.5px outline)
대시보드 카드 radius:  11px (그리드), 9px (리스트)
```

---

## 전체 레이아웃

### 화면 구조 (currentView 분기)

```
landing     → LandingPage.jsx       (중앙 정렬 히어로)
dashboard   → ProjectDashboard.jsx  (좌측 사이드바 220px + 우측 메인, 웜 베이지)
workspace   → 기존 4분할 레이아웃
```

### dashboard 레이아웃

```
┌──────────┬────────────────────────────────────┐
│ sidebar  │  topbar (52px)                     │
│ 220px    ├────────────────────────────────────┤
│          │  scroll content                    │
│  라이브   │    폴더 블록 (all/folder 필터)      │
│  러리     │    플랫 그리드 (recent/unfiled 필터)│
│  폴더     │                                    │
│  목록     │                                    │
│  ──────  │                                    │
│ 새프로젝트│                                    │
└──────────┴────────────────────────────────────┘
```

**필터별 렌더 분기**:
- `all` / `folderId` → `FolderBlock` 목록 + 미분류 섹션
- `recent` / `unfiled` → 폴더 구분 없이 `filteredProjects` 플랫 그리드

### workspace 레이아웃

세로 4분할. 스크롤 없음.

```
┌─────────────────────────────┐
│  Header          (56px)     │
├─────────────────────────────┤
│  Timeline        (auto)     │
├─────────────────────────────┤
│  Recommendations (auto)     │
├─────────────────────────────┤
│  Piano           (flex-1)   │
└─────────────────────────────┘
```

---

## 컴포넌트별 구조

---

### LandingPage.jsx

밝은 배경(`#f0f0f2`) 기반. 대시보드와 동일한 디자인 언어.

```
.landing                 — 밝은 배경 (#f0f0f2), min-height 100vh
  .landing-inner         — max-width 860px, 중앙 정렬, padding 0 40px
    .landing-header      — 로고 + "시작하기 →" 버튼
      .landing-wordmark
      .landing-header-btn — var(--panel) 배경, var(--border) 테두리
    .landing-hero        — 메인 텍스트 영역
      .landing-eyebrow   — accent-10 bg 뱃지, monospace
      .landing-title     — 60px, weight 800, letter-spacing -0.04em
      .landing-subtitle  — 17px, var(--text-2)
      .landing-cta       — accent 배경 버튼, box-shadow glow
    .landing-features    — 3열 그리드
      .landing-feat-card — var(--panel) bg, shadow-sm, border-radius 14px
        .landing-feat-icon
        .landing-feat-title
        .landing-feat-desc
```

---

### ProjectDashboard.jsx

굿노트 스타일. 좌측 사이드바 + 우측 메인 영역 2단 레이아웃. 웜 베이지 배경.

```
.dash                    — height 100vh, flex row, bg --dash-bg (#F5F0EB)
  .dash-sidebar          — width 220px, bg --dash-sidebar (#EFEBE4)
    .dash-sidebar-logo   — 로고 아이콘 + "ChordFlow"
    .dash-sidebar-label  — 섹션 레이블 (LIBRARY, 폴더)
    .dash-sidebar-item   — 필터 아이템 (모두 / 최근 작업 / 폴더 / 미분류)
      .dash-sidebar-dot  — 폴더 색상 dot
      .dash-sidebar-count — 우측 카운트 뱃지
    .dash-sidebar-divider
    .dash-sidebar-footer — 하단 "새 프로젝트" 버튼
  .dash-main             — flex: 1, flex column
    .dash-topbar         — height 52px, 현재 필터 제목 + 정렬/뷰/폴더추가/새 프로젝트
      .dash-topbar-title
      .dash-topbar-right
        .dash-sort-group  — 최신순/오래된순 세그먼트 버튼
        .dash-view-toggle — 그리드/리스트 토글
        .dash-folder-add-btn
        .dash-new-btn
    .dash-scroll         — flex: 1, overflow-y auto
      .dash-content      — padding 24px 20px
        .dash-folder-block — 폴더 블록 (--dash-card, border-radius 13px)
          .dash-folder-header — 컬러 dot + 이름 + 카운트
            .dash-folder-chevron — › 회전
            .dash-folder-dot-badge — 폴더 색상 dot
            .dash-folder-name
            .dash-folder-count
            .dash-folder-actions — hover 시 노출
          .dash-grid / .dash-grid.list-view
        .dash-section — 미분류 섹션
        .dash-empty   — 완전 빈 상태
```

**사이드바 필터**: `activeFilter` state (`'all'` / `'recent'` / `folderId` / `'unfiled'`). 선택된 항목만 `.active`.
**폴더 색상**: `onCreateFolder(name, color)` — `FOLDER_COLORS` 배열에서 순환 할당.
**폴더 블록 접기**: `FolderBlock` 로컬 state `collapsed` (기본값 `true` — 접힌 상태로 시작). 헤더 클릭 토글, chevron 90도 회전.
**폴더 이름 인라인 편집**: `.dash-folder-input`으로 전환. Enter/blur 확정, Escape 취소.
**그리드/리스트 토글**: `isListView` state. `.dash-grid.list-view` 클래스 토글.

---

### ProjectCard.jsx

굿노트 스타일. 상단 컬러 바 + 코드 미리보기 프리뷰 영역 + 하단 footer.

```
.proj-card               — --dash-card 배경, border-radius 11px, fadeUp 애니메이션, aspect-ratio 3/2
  .proj-card-color-bar   — 4px 컬러 바 (폴더 색 or 장르 accent)
  .proj-card-preview     — 코드 미리보기 (그리드 뷰에서만 표시)
    .proj-card-preview-chords — monospace 13px, 코드명 + .proj-card-arrow(→) 나열
    .proj-card-preview-fade   — 하단 그라데이션 페이드
  .proj-card-footer      — 이름 + 메타 (border-top)
    .proj-card-name      — 더블클릭 시 input으로 전환
    .proj-card-chords    — 리스트 뷰에서만 표시 (한줄 코드 나열)
    .proj-card-footer-meta
      .proj-card-folder-tag — 폴더 색상 기반 태그 (tagBg, folderColor)
      상대 시간
  .proj-card-actions     — hover 시 노출 (우상단 absolute)
    .proj-move-dropdown
    삭제 버튼
```

**컬러 바 색상**: `folder.color` 우선, 없으면 장르 accent (`CHORD_DATA_GENRES_COLORS[genre]`).
**그리드/리스트 분기**: `isListView` prop. 리스트 뷰에서는 `.proj-card-preview` 숨김, `.proj-card-chords` 표시.
**카드 클릭**: workspace 이동. **이름 더블클릭**: 인라인 `input` 편집.
**삭제**: `window.confirm` 후 삭제.

---

### Header.jsx

```
.header
  .logo
    "← 대시보드" 버튼  — onBackToDashboard prop 있을 때만
    프로젝트 이름       — projectName prop (없으면 "ChordFlow")
  .session-bar   — 세션 뱃지 4개
  .header-right  — 설정 버튼
```

**세션 뱃지 (`.session-badge`)**:
- 장르 뱃지: `background: ${accent}26`, `color: accent`
- key 없음: `.muted` 클래스 (color var(--text-3))
- 전부 클릭 시 SetupModal 열림

---

### Timeline.jsx

```
.timeline-section
  .section-header
    .section-title     — "코드 진행"
    .toolbar           — 버튼 그룹
  .timeline-cards      — 가로 스크롤
    .tl-card           — 코드 카드
    .tl-arrow          — "→"
    .tl-add            — [+] 점선 카드
    .tl-empty          — 진행 없을 때 안내 텍스트
```

**Toolbar 버튼 (`.icon-btn`)**:
- undo / redo: disabled 시 opacity 낮춤
- 전체듣기 / 자동생성: `.icon-btn.text` (아이콘 + 텍스트)
- 재생 중: `background: var(--accent-10)`, `color: var(--accent)`
- 자동생성: 키 없으면 `disabled` + tooltip "키를 먼저 설정해주세요"
- 구분선: `.toolbar-divider`
- **저장 버튼**: `isDirty=true` → accent 색 + "저장•", `false` → text-3 색 + "저장됨". Ctrl+S와 동일 동작.

**타임라인 카드 (`.tl-card`)**:
- 크기: 72×72px
- `.current`: accent 테두리 + accent-10 배경
- `.playing`: pulse 애니메이션 (테두리 깜빡임)
- 내부: `.name` (코드명) + `.roman.mono` (도수) + `.remove` (× 버튼, hover 시 노출)

---

### Recommendations.jsx

```
.recs-section
  .rec-title         — 섹션 제목 + inferredKey 뱃지 + 탐색 힌트
  .rec-grid          — 카드 4개 가로 배열 (gap 12px)
    .rec-card        — 추천 카드
    .rec-empty       — 추천 없을 때
```

**추천 카드 (`.rec-card`)**:
- `.top`: 1위 카드, accent 테두리 강조
- `.pending`: Space 대기 중 카드 (accent 배경 15%)

카드 내부 구조:
```
.rec-card-top
  .rec-name          — 코드명 (20px bold)
  .rec-top-tag.mono  — "top" 또는 "space ↵" (pending 시)

.rec-piano-wrap
  ChordPiano         — 미니 피아노 (rec.chord.notes 하이라이트)

.rec-bar-row
  .rec-bar           — 배경 바 (var(--border))
    .rec-bar-fill    — 채워진 부분 (width: weight%, background: var(--accent))
  .rec-pct.mono      — "28%"

.rec-mood
  .roman.mono        — 도수 (I, ii7 등)
  텍스트             — 분위기 설명
```

**섹션 제목 줄**:
- `progression.length === 0`: "시작 코드"
- `progression.length >= 1`: "다음 코드 추천"
- inferredKey 있고 key 미확정: `key-badge` 버튼 "예상 키 X major — 확정"
- 우측: `.rec-keyhint.mono` "← → 탐색 · space 확정"

---

### ChordPiano.jsx

추천 카드 안에 들어가는 미니 피아노. `notes` prop으로 하이라이트할 음 전달.

```
.chord-piano
  흰건반 7개 (C4~B4)
  검은건반 5개
  활성 음: accent 배경
```

---

### Piano.jsx

```
.piano-section
  .piano-header
    .piano-title       — "Piano"
    .key-badge         — inferredKey 버튼 or .confirmed span
    .mode-toggle       — 자유/코드 버튼 (선택됨: .active)
  .piano-wrap
    .piano-keys        — 건반 컨테이너 (tabIndex=0)
      .white-key       — 흰건반
      .black-key       — 검은건반 (absolute 배치)
    .piano-status      — 하단 상태 텍스트
```

**건반 크기**:
- 흰건반: `WHITE_W = 46px` 너비, 흰건반 14개 (C4–B5)
- 검은건반: `BLACK_W = 28px` 너비, `left = (afterWhiteIdx + 1) * (WHITE_W - 1) - BLACK_W / 2`

**건반 클래스 조합**:

| 클래스 | 조건 |
|---|---|
| `.active` | 자유 모드: 현재 눌린 음 |
| `.preview` | 코드 모드: 클릭한 건반 (pendingChord 시작 음) |
| `.in-chord` | 코드 모드: pendingChord의 나머지 구성음 |

**건반 레이블 (`.key-label`)**:
- 자유 모드: `.mono` — 키보드 단축키 (Z, X, S …)
- 코드 모드, 키 설정: `.chord` — 코드명 (흰건반: "Dm", 검은건반: 근음 이름)
- 코드 모드, 로마자: `.mono` style `opacity: 0.55, fontSize: 9` — "ii"

**상태 텍스트 (`.piano-status`)**:

| 상황 | 텍스트 |
|---|---|
| pendingChord 있음 | `{코드명} {도수} — Space 또는 재클릭으로 추가` |
| 자유 모드, 음 없음 | `건반을 누르고 코드를 만든 뒤 Space` |
| 자유 모드, 1–2음 | `음을 더 눌러보세요 (n/3)` |
| 자유 모드, 3음+ 감지 | `{코드명} {도수} — Space로 추가` |
| 자유 모드, 감지 실패 | `감지된 코드가 없어요` |
| 코드 모드, 대기 | `건반을 누른 뒤 Space로 추가` (키 없으면 "장조로 고정" 부연) |

**키 뱃지**:
- 미확정 inferredKey: `button.key-badge` — 클릭 시 키 확정
- 확정된 key: `span.key-badge.confirmed` — 읽기 전용

---

### SetupModal.jsx

```
.modal-overlay   — 풀스크린 반투명 배경 (클릭 시 닫힘, onCancel 있을 때만)
  .cfg-sheet     — 중앙 카드 (max-width ~480px)
    .cfg-head    — eyebrow "configuration" + h2 "코드 진행 추천"
    .cfg-body    — Row 목록
    .cfg-foot    — Enter 힌트 + Begin 버튼
```

**Row 구조 (`.cfg-row`)**:
```
.cfg-label    — Genre / Key / Mode / Tempo
.cfg-control  — 각 입력 UI
```

**Genre**: `.seg` > `.seg-btn` (선택됨: `.on`)  
**Key**: `.cfg-keys` > `.key-cell.mono` (선택됨: `.on`) + `.key-cell.none` (— 버튼 = key null)  
**Mode**: `.seg` > `.seg-btn`  
**Tempo**: `.cfg-bpm-row` > `input[type=range].bpm-slider` + `.bpm-value.mono` + `.cfg-unit`

BPM 슬라이더: `--p` CSS 변수로 채워진 비율 전달 (`(bpm-60)/120*100%`)

**Begin 버튼 (`.cfg-begin`)**: accent 배경, 흰 텍스트, Enter 키로도 실행

---

## 인터랙션

| 요소 | 동작 |
|---|---|
| 추천 카드 hover | `translateY(-4px)`, shadow 강해짐 |
| 추천 카드 클릭 1회 | pendingChord 설정 + 미리듣기 |
| 추천 카드 클릭 2회 (같은 카드) | 코드 확정 + 타임라인에 추가 |
| ← → 키 | 추천 카드 순환 탐색 + 미리듣기 |
| Space | pendingChord 확정 (피아노/추천 공통) |
| Escape | pendingChord 취소 |
| 재생 중 카드 | pulse 애니메이션 (`.playing`) |
| 설정 뱃지 클릭 | SetupModal 열림 |
| inferredKey 뱃지 클릭 | 키 확정 + romanNumeral 소급 업데이트 |

---

## 반응형

- **1280px+**: 전체 레이아웃
- **768–1279px**: 피아노 건반 너비 축소 (WHITE_W 기준)
- **~767px**: 피아노 영역 숨김 또는 축소, 카드 중심 조작
