# Patterns

새 기능 추가 시 따를 패턴 모음. 구현 전 반드시 읽고, 완료 후 새 패턴이 생기면 여기에 추가한다.

---

## 새 화면(페이지) 추가

> 예: 랜딩 페이지, 결과 화면, 튜토리얼 화면

### 패턴: 상태 분기 (라우터 없음)

현재 앱은 React Router를 사용하지 않는다. 새 화면은 App.jsx의 boolean state로 분기한다.

```jsx
// App.jsx에 state 추가
const [showLanding, setShowLanding] = useState(true);

// 렌더링 분기 (if 체인 순서 중요)
if (showLanding) return <LandingPage onEnter={() => setShowLanding(false)} />;
if (!session || showSetup) return <SetupModal ... />;
return <div className="app">...</div>;
```

**파일 추가**: `src/LandingPage.jsx`  
**스타일 추가**: `styles.css` 하단에 `/* ============ LANDING ============ */` 섹션  
**docs 업데이트**: `architecture.md` 파일 구조 + 핵심 상태 테이블

### 주의
- `AUDIO.ensureStarted()`는 반드시 사용자 인터랙션(클릭) 후 호출. 랜딩에서 Begin 버튼이 있다면 거기서 호출.
- 새 화면에서 `session`이 없는 상태를 항상 고려할 것.

---

## 새 추천 케이스 추가

> 예: 특정 장르 전용 로직, 새 추천 소스

App.jsx `recs` useMemo 안의 if 체인을 확장한다.

```js
// 기존 분기 순서 유지
if (progression.length === 0) { ... }        // 1. 시작 코드
if (!keyConfirmed) { ... }                   // 2. 키 미확정
// 여기에 새 케이스 추가 가능
return baseRecs.map(...);                    // 3. 키 확정 기본 흐름
```

**의존 배열** `[progression, session, inferredKey]` — session 객체 참조 깊이 주의.  
**docs 업데이트**: `architecture.md` 추천 로직 테이블에 케이스 추가.

---

## 새 자료구조 메서드 추가

> 예: ChordGraph에 새 탐색 알고리즘 추가

`structures.js` 클래스에 메서드 추가 후, 호출부(주로 App.jsx)에 연결.

```js
// structures.js
class ChordGraph {
  newMethod(args) { ... }
}

// App.jsx
graphRef.current.newMethod(args);
```

**주의**: `stackRef.current.set(newArr)` 호출 후 반드시 `setProgression(stackRef.current.getAll())`로 state 동기화.  
**docs 업데이트**: `architecture.md` 자료구조 섹션.

---

## 새 음악 이론 함수 추가

> 예: 새 코드 감지 로직, 새 키 추론 방식

`music.js`의 `MUSIC` export 객체에 추가.

```js
// music.js
function newFunction(args) { ... }

export const MUSIC = {
  // 기존 함수들...
  newFunction,
};
```

**import 방식**: `MUSIC.newFunction(args)` — named import 변경 금지.  
**docs 업데이트**: `architecture.md` 해당 섹션.

---

## 새 컴포넌트 추가

> 예: 새 패널, 새 모달, 새 버튼 그룹

1. `src/ComponentName.jsx` 생성
2. `styles.css` 하단에 `/* ============ COMPONENT NAME ============ */` 섹션 추가
3. App.jsx 또는 부모 컴포넌트에서 import 후 렌더링
4. props는 App.jsx 상태에서 내려줌 — 컴포넌트 내부에 자체 데이터 fetch 금지

**docs 업데이트**: `architecture.md` 파일 구조 + `design.md` 컴포넌트 섹션 추가.

---

## 새 장르 추가

> 예: classical, folk 장르 추가

1. `data.js` — `transitions`, `startingChords`, `progressions`, `chordMoods`, `genres` 배열에 추가
2. `music.js` — `getDiatonicRomans(genre, mode)` switch에 케이스 추가
3. `styles.css` — 필요시 accent 색상 추가 (data.js genres 배열의 accent와 동일하게)

**docs 업데이트**: `architecture.md` 도수 표기 규칙 섹션.

---

## 세션 설정 항목 추가

> 예: SetupModal에 새 옵션 추가 (swing, reverb 등)

1. `SetupModal.jsx` — 새 Row 추가
2. `App.jsx` — `session` 객체에 새 필드 추가
3. 해당 로직(audio.js, music.js 등)에서 `session.newField` 참조

**주의**: `session` 객체 구조 변경 시 `handleUpdateSession`, `retroactivelyUpdateRomans` 동작 확인.  
**docs 업데이트**: `architecture.md` 핵심 상태 섹션.
