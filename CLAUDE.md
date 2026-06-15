# ChordFlow — Claude 지침

## 이 파일의 역할

요청 유형에 따라 읽을 문서를 안내하는 진입점.
코드 수정 전 반드시 해당 docs를 읽고, 작업 완료 후 반드시 docs를 업데이트한다.

---

## 요청 유형별 참조 문서

| 요청 유형 | 읽을 문서 |
|---|---|
| 새 기능 추가, 새 컴포넌트 추가 | `docs/architecture.md` + `docs/patterns.md` |
| 기존 로직 수정 (추천, 음악 이론, 오디오) | `docs/architecture.md` |
| UI 수정, 스타일 변경, 새 컴포넌트 디자인 | `docs/design.md` |
| 자료구조 수정 (Graph, Stack, Queue) | `docs/architecture.md` |

---

## 항상 작업 완료 후 필수 절차

구현이 끝나면 반드시 아래를 수행한다:

1. **새 파일이 생겼으면** → `docs/architecture.md` 파일 구조 테이블 업데이트
2. **새 상태/데이터 흐름이 생겼으면** → `docs/architecture.md` 해당 섹션 업데이트
3. **새 패턴이 생겼으면** → `docs/patterns.md`에 패턴 추가
4. **UI 컴포넌트가 추가/변경됐으면** → `docs/design.md` 해당 컴포넌트 섹션 업데이트

---

## 프로젝트 한 줄 요약

장르/키/BPM 선택 후 가상 피아노로 코드를 추가하면 다음 코드를 그래프 기반으로 추천해주는 인터랙티브 웹앱.
자료구조 수업 프로젝트. **기술 스택**: React (JSX), Vite, Tone.js, plain CSS

---

## 절대 규칙 (문서 읽기 전에도 적용)

- `MUSIC` export 형태 `export const MUSIC = { ... }` 변경 금지
- `AUDIO.ensureStarted()` 는 SetupModal Begin 버튼에서만 호출
- CSS 파일 분리 금지 — `styles.css` 단일 파일 유지
- 장르 색상 hex 직접 사용 금지 — `--accent` 계열 CSS 변수만 사용
