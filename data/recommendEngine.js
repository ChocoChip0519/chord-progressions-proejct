/**
 * 코드 진행 추천 엔진
 *
 * 입력 : 현재까지 확정된 코드 배열 + 장르 + 조성(장/단조)
 * 출력 : 다음 코드 후보 배열 (점수 내림차순, 최대 8개)
 *
 * 점수 산출:
 *   1. 전이 빈도  – transitions 테이블에서 현재 도수 → 후보 도수 빈도
 *   2. 패턴 매칭  – 현재 진행이 알려진 패턴의 prefix인지 확인, 매칭 시 가중치 추가
 *   3. 장르 보정  – genreWeights로 패턴별 최종 점수 조정
 *
 * 자료구조 활용:
 *   - Stack  : 코드 히스토리 (Backspace 지원)
 *   - Graph  : transitions 전이 테이블
 *   - Array  : 패턴 매칭 슬라이딩 윈도우
 */

import { patterns, transitions, genreWeights } from "./chordData.js";

// ─────────────────────────────────────────────
// 유틸: 코드명 → 도수 변환
//   실제 음이름 기반 도수는 조성(tonic)을 알아야 정확하지만,
//   여기서는 패턴 내 인덱스 위치로 상대 도수를 매핑
// ─────────────────────────────────────────────

/** 도수 목록 (장조) */
const MAJOR_DEGREES = ["I", "ii", "iii", "IV", "V", "vi", "vii°"];
/** 도수 목록 (단조) */
const MINOR_DEGREES = ["i", "ii°", "III", "iv", "v", "VI", "VII", "V"];  // V 포함(하모닉)

/**
 * 패턴 내에서 현재 진행의 마지막 코드가 몇 번째 위치인지 찾아
 * 다음에 올 도수를 반환한다.
 *
 * @param {string[]} history  - 현재까지의 도수 배열 (상대 도수)
 * @param {object}   pattern  - patterns[] 항목
 * @returns {string|null}      - 다음 예상 도수 또는 null
 */
function nextDegreeFromPattern(history, pattern) {
  const prog = pattern.relative;
  const len  = history.length;

  for (let start = 0; start <= prog.length - 1; start++) {
    // history 끝부분이 prog[start..] 와 일치하는지 슬라이딩 윈도우 체크
    const windowSize = Math.min(len, prog.length - start);
    const histSlice  = history.slice(-windowSize);
    const progSlice  = prog.slice(start, start + windowSize);

    if (histSlice.every((d, i) => d === progSlice[i])) {
      const nextIdx = start + windowSize;
      return nextIdx < prog.length ? prog[nextIdx] : prog[0]; // 루프
    }
  }
  return null;
}

// ─────────────────────────────────────────────
// 메인 추천 함수
// ─────────────────────────────────────────────

/**
 * @param {string[]} historyDegrees  - 현재까지 입력된 도수 배열 (예: ["i","VI","III"])
 * @param {"major"|"minor"} mode     - 장/단조
 * @param {string}  genre            - 장르 키 (예: "pop")
 * @param {number}  maxResults       - 반환할 최대 후보 수
 * @returns {{ degree: string, score: number }[]}
 */
export function recommend(historyDegrees, mode, genre = "pop", maxResults = 8) {
  const scoreMap = {};   // degree → score

  // ── 1. 전이 빈도 기반 점수 ─────────────────
  const transTable = transitions[mode] ?? {};
  const lastDegree = historyDegrees.at(-1);

  if (lastDegree && transTable[lastDegree]) {
    for (const [nextDeg, freq] of Object.entries(transTable[lastDegree])) {
      scoreMap[nextDeg] = (scoreMap[nextDeg] ?? 0) + freq * 2;
    }
  }

  // ── 2. 패턴 매칭 기반 점수 ────────────────
  const modePatterns = patterns.filter(p => p.type === mode);
  const weights      = genreWeights[genre]?.patternBonus ?? {};

  for (const pat of modePatterns) {
    const nextDeg = nextDegreeFromPattern(historyDegrees, pat);
    if (!nextDeg) continue;

    const baseScore   = pat.weight;
    const genreBonus  = weights[pat.id] ?? 1.0;
    scoreMap[nextDeg] = (scoreMap[nextDeg] ?? 0) + baseScore * genreBonus;
  }

  // ── 3. 정렬 및 반환 ───────────────────────
  return Object.entries(scoreMap)
    .map(([degree, score]) => ({ degree, score: Math.round(score) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
}

// ─────────────────────────────────────────────
// 히스토리 스택 (자료구조: Stack)
// ─────────────────────────────────────────────
export class ChordHistoryStack {
  #stack = [];

  push(degree) { this.#stack.push(degree); }

  pop() { return this.#stack.pop() ?? null; }

  peek() { return this.#stack.at(-1) ?? null; }

  toArray() { return [...this.#stack]; }

  get size() { return this.#stack.length; }

  clear() { this.#stack = []; }
}
