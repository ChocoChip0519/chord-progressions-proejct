# 추천 로직 상세 설명

## 전체 흐름 요약

```
코드 입력
    │
    ├─ 키 미확정 ──→ inferKey (키 자동 추론 시도)
    │                    │
    │                    ├─ 추론 실패 (confidence < 0.7)
    │                    │       └─→ getAbsolutePatternRecs (실제 곡 패턴)
    │                    │                   └─ 매칭 없으면 → getRecommendations (diatonic=null 폴백)
    │                    │
    │                    └─ 추론 성공 (confidence ≥ 0.7)
    │                            └─→ getRecommendations (diatonic 필터 적용)
    │
    └─ 키 확정  ──→ getRecommendations (diatonic 필터 적용)
```

---

## 1. `inferKey` — 현재 진행에서 키 추론

### 역할

사용자가 키를 직접 설정하지 않았을 때, 지금까지 입력한 코드들로부터 **어떤 키인지 자동으로 추측**한다.
신뢰도가 0.7 이상이면 키 확정 → 도수 기반 추천으로 전환, 미만이면 패턴 매칭 추천을 유지한다.

### 수도코드

```
function inferKey(playedChords):
    if 코드 수 < 3: return []  // 데이터 부족

    for 모든 키(C, C#, D, ..., B):
        for 모든 모드(major, minor):
            score = 0
            for 각 코드 in playedChords:
                if 코드의 루트음이 해당 키의 스케일 안에 있으면: score += 1
                if 코드의 루트음 == 키의 으뜸음 AND 품질이 맞으면: score += 0.5 (보너스)
            confidence = score / 전체 코드 수
            결과에 추가

    결과를 confidence 내림차순 정렬
    최고 점수가 0.7 미만이면 return []
    return [1등 후보]
```

### 코드 내부 동작

```js
// music.js:182
function inferKey(playedChords) {
  if (playedChords.length < 3) return [];
  const rootPcs = playedChords.map(c => pc(c.rootNote));   // 루트음을 0~11 숫자로
  const qualities = playedChords.map(c => c.quality);

  const results = [];
  for (const keyName of NOTES) {               // 12개 키
    for (const mode of ["major", "minor"]) {   // 장/단조
      const scPcs = scale(keyName, mode).map(pc);  // 해당 키의 스케일 음들
      let score = 0;
      for (let i = 0; i < playedChords.length; i++) {
        if (scPcs.includes(rootPcs[i])) score += 1;  // 스케일 안에 있으면 +1
        if (rootPcs[i] === pc(keyName)) {             // 으뜸음 보너스
          if (mode === "major" && ["maj","dom7","maj7"].includes(qualities[i])) score += 0.5;
          if (mode === "minor" && ["min","min7"].includes(qualities[i]))         score += 0.5;
        }
      }
      results.push({ key: keyName, mode, confidence: score / playedChords.length });
    }
  }
  results.sort((a, b) => b.confidence - a.confidence);
  return results[0].confidence >= 0.7 ? [results[0]] : [];
}
```

### 데이터셋 예시

> `inferKey`는 **키를 선택하지 않았을 때** 코드 진행을 보고 키를 자동으로 추론하는 함수다.  
> 케이스 1은 `session.key`가 있어 호출 자체가 스킵되고,  
> 케이스 2는 호출되지만 코드들이 한 키에 수렴하지 않아 `[]`를 반환하며,  
> 케이스 3은 호출되어 키를 성공적으로 반환한다.

#### 케이스 1 — 장르(Pop) + 키(C) 직접 입력: inferKey 호출 안 함

키를 직접 선택했으므로 추론 자체가 불필요하다.

```js
// App.jsx:51-55
const inferredKey = useMemo(() => {
  if (!session || session.key) return null;  // ← session.key="C" 이므로 즉시 null 반환
  ...
}, [...]);
```

`hasKey = true` → `keyConfirmed = true` → inferKey 실행 없이 바로 그래프 분기

---

#### 케이스 2 — 장르(Rock)만, 예상 키 미도출: inferKey가 `[]` 반환

입력된 코드: `[E major, D major, A major]`  
→ rootPcs = `[4, 2, 9]`, qualities = `["maj", "maj", "maj"]`

**E major 스케일 검사** `[E,F#,G#,A,B,C#,D#]` = `[4,6,8,9,11,1,3]`

| 코드 | rootPc | 스케일 포함? | 으뜸음 보너스 | 누적 |
|------|--------|------------|------------|------|
| E major | 4 | ✅ +1 | ✅ E==E, maj → +0.5 | 1.5 |
| D major | 2 | ❌ (D#=3이지만 D=2는 없음) | — | 1.5 |
| A major | 9 | ✅ +1 | — | 2.5 |

confidence(E major) = 2.5 / 3 ≈ **0.83**

**A major 스케일 검사** `[A,B,C#,D,E,F#,G#]` = `[9,11,1,2,4,6,8]`

| 코드 | rootPc | 스케일 포함? | 으뜸음 보너스 | 누적 |
|------|--------|------------|------------|------|
| E major | 4 | ✅ +1 | — | 1.0 |
| D major | 2 | ✅ +1 | — | 2.0 |
| A major | 9 | ✅ +1 | ✅ A==A, maj → +0.5 | 3.5 |

confidence(A major) = 3.5 / 3 ≈ **1.17** ← 1위

> E major(0.83)보다 A major(1.17)가 더 높지만,  
> 이 예시에서는 사용자가 키를 설정하지 않았고 진행이 I-bVII-IV 패턴(조성 모호)이라 가정.  
> **실제 케이스 2 시나리오**: `[E, C#, Ab]` 같이 여러 키에 분산된 코드 입력

입력된 코드: `[E major, C# minor, Ab major]` (조성 모호)  
→ 어떤 키의 스케일에도 3개가 깔끔하게 들어맞지 않음  
→ 최고 confidence < 0.7 → `[]` 반환 → 패턴 매칭으로 진행

---

#### 케이스 3 — 장르(Jazz)만, 예상 키 도출: inferKey가 키 반환

입력된 코드: `[Dm7, G7, Cmaj7]` (재즈 ii-V-I)  
→ rootPcs = `[2, 7, 0]`, qualities = `["min7", "dom7", "maj7"]`

**C major 스케일 검사** `[C,D,E,F,G,A,B]` = `[0,2,4,5,7,9,11]`

| 코드 | rootPc | 스케일 포함? | 으뜸음 보너스 | 누적 |
|------|--------|------------|------------|------|
| Dm7 | 2 | ✅ +1 | — | 1.0 |
| G7 | 7 | ✅ +1 | — | 2.0 |
| Cmaj7 | 0 | ✅ +1 | ✅ C==C, maj7 → +0.5 | 3.5 |

confidence(C major) = 3.5 / 3 ≈ **1.17** → 다른 후보들 압도 → 0.7 이상  
→ `[{ key: "C", mode: "major", confidence: 1.17 }]` 반환  
→ UI에 `💡 예상 키: C major — 확정` 뱃지 표시

---

## 2. `getAbsolutePatternRecs` — 절대음명 패턴 매칭

### 역할

키가 확정되지 않은 상태에서, **실제 곡 데이터(songs.json)**의 코드 진행과 현재 사용자 진행을 비교해 다음에 올 법한 코드를 추천한다.
도수(roman)가 아닌 **절대 음이름(C, G, Am...)** 기준으로 비교하기 때문에 키를 몰라도 된다.

### 수도코드

```
function getAbsolutePatternRecs(progression, songs):
    if progression이 비어있으면: return []

    progNames = progression에서 루트음 이름만 추출  // ["C", "G"]
    nextIdx = progression.length                   // 다음 위치 인덱스

    matched = songs에서 필터:
        - 곡의 길이가 nextIdx보다 길어야 함 (다음 코드가 존재해야 함)
        - 곡의 앞부분이 progNames와 완전히 일치해야 함

    if matched가 비어있으면: return []

    counts = {}
    for song in matched:
        next = song.absolute[nextIdx]  // 매칭된 곡의 다음 코드
        counts[next] += 1

    total = counts의 합계
    결과 = counts를 정규화하여 weight 생성
    내림차순 정렬 후 상위 4개 반환
```

### 코드 내부 동작

```js
// music.js:243
function getAbsolutePatternRecs(progression, songs) {
  if (!progression.length || !songs || !songs.length) return [];

  // pitch class(0~11)로 비교 — flat(Bb)/sharp(A#) 표기 불일치 해소
  const progPcs = progression.map(c => pc(c.rootNote));
  const nextIdx = progression.length;

  const matched = songs.filter(song => {
    if (song.absolute.length <= nextIdx) return false;
    return progPcs.every((p, i) => {
      const sp = pc(song.absolute[i]);
      return sp >= 0 && sp === p;  // 숫자 비교: pc("A#") === pc("Bb") === 10
    });
  });

  if (!matched.length) return [];

  const counts = {};
  for (const song of matched) {
    const next = song.absolute[nextIdx];
    counts[next] = (counts[next] || 0) + 1;
  }

  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  return Object.entries(counts)
    .map(([name, count]) => {
      // flat 표기를 sharp으로 정규화 (noteFromPc(pc("Bb")) = "A#")
      const rootPc = pc(name);
      const rootNote = rootPc >= 0 ? noteFromPc(rootPc) : name;
      return { name: rootNote, rootNote, quality: "maj", weight: count / total };
    })
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 4);
}
```

### 데이터셋 예시

> `getAbsolutePatternRecs`는 **케이스 2** (장르만, 키 미확정)에서만 호출된다.  
> 케이스 1은 처음부터 키가 있어 이 함수를 건너뛰고,  
> 케이스 3은 `inferKey`가 키를 도출한 순간 이 함수 대신 그래프 분기로 넘어간다.

#### 케이스 1 — 장르(Pop) + 키(C) 직접 입력: 호출 안 함

```js
// App.jsx:87
if (!keyConfirmed) {          // ← keyConfirmed = true 이므로 이 블록 자체를 건너뜀
  const patternRecs = MUSIC.getAbsolutePatternRecs(...)
  ...
}
```

바로 아래 키 확정 분기(`getRecommendations`)로 진입

---

#### 케이스 2 — 장르(Rock)만, 예상 키 미도출: 핵심 동작

`progNames = ["E", "D"]`, `nextIdx = 2` (세 번째 코드 예측)

songs.json rock에서 `absolute[0]==="E" && absolute[1]==="D"` 인 곡:

| 곡 | absolute | absolute[2] |
|----|----------|-------------|
| Whole Lotta Love | E, D, A | **A** |
| Good Times Bad Times | E, D, A | **A** |
| Saturday Night Alright | E, D, A | **A** |
| Paranoid | E, D, E, G | **E** |

counts: `{ A:3, E:1 }`, total = 4

| 순위 | name | weight | 화면 표시 |
|------|------|--------|---------|
| 1 | **A** | 3/4 = 0.75 | romanNumeral="?", mood 없음 |
| 2 | **E** | 1/4 = 0.25 | romanNumeral="?", mood 없음 |

→ I-bVII-IV (E-D-A) 패턴이 자연스럽게 도출됨

**매칭 실패 → 그래프 폴백**: `progNames = ["E", "C#", "Ab"]` 같은 모호한 진행이라면  
songs.json에서 일치하는 곡 없음 → `patternRecs = []` → `App.jsx:103` 폴백으로 이동

---

#### 케이스 3 — 장르(Jazz)만, 예상 키 도출: 키 도출 전까지만 동작

코드를 2개 입력한 시점: `[Dm7, G7]`  
→ `inferKey`가 아직 코드 2개라 `[]` 반환 → `keyConfirmed = false` → 이 함수 호출

`progNames = ["D", "G"]`, `nextIdx = 2`

songs.json jazz에서 `absolute[0]==="D" && absolute[1]==="G"` 인 곡:

| 곡 | absolute | absolute[2] |
|----|----------|-------------|
| Thinking Out Loud (pop) | D, G, A, B | (jazz 아님) |
| Wave | D, E, A, D | (E 아님) |
| Cheek to Cheek | G, A, D, G | (G 아님) |

→ jazz songs에서 "D", "G" prefix 곡 없음 → `patternRecs = []` → 폴백  

폴백: `impliedTonicFromProgression([Dm7, G7])` → `{ key:"D", mode:"minor" }`  
→ `getRelativeRoman(G7, "D", "minor") = "IV7"` → `graph.getRecommendations("IV7", null, 4)`  
→ 임시 추천 반환 (mood 없음)

코드 3개째 `[Dm7, G7, Cmaj7]` 입력 시:  
→ `inferKey` → C major 확정 → 이 함수는 더 이상 호출되지 않음

---

## 3. `getRecommendations` — 그래프 기반 도수 추천

### 역할

키가 확정된 이후(또는 패턴 매칭 실패 시 폴백으로), **ChordGraph의 가중치 데이터(transitions.json)**를 이용해 현재 코드에서 다음 코드를 추천한다.
인접 리스트 그래프에서 현재 노드(로마 숫자)의 이웃 노드들을 weight 순으로 반환한다.

### 수도코드

```
function getRecommendations(from, diatonic, topN=4, genre=null):
    neighbors = adj[from]           // 그래프에서 현재 코드의 이웃들
    if neighbors가 없으면: return []

    candidates = neighbors 전체 목록

    if diatonic 필터가 있으면:
        candidates = diatonic에 포함된 코드만 남김
        장르별 예외:
          bVII  → genre === "rock" 일 때만 허용
          bII7, VI7, II7 → genre === "jazz" 일 때만 허용 (재즈 고유 어법)

    weight 내림차순 정렬
    상위 topN개 반환
```

### 코드 내부 동작

```js
// structures.js:18
getRecommendations(from, diatonic, topN = 4, genre = null) {
  const m = this.adj.get(from);
  if (!m) return [];
  let arr = [...m.entries()].map(([r, w]) => ({ romanNumeral: r, weight: w }));
  if (diatonic && diatonic.length) {
    const allowed = new Set(diatonic);
    const JAZZ_EXTRAS = new Set(["bII7", "VI7", "II7"]);
    arr = arr.filter(x =>
      allowed.has(x.romanNumeral) ||
      (genre === "rock" && x.romanNumeral === "bVII") ||
      (genre === "jazz" && JAZZ_EXTRAS.has(x.romanNumeral))  // 삼전음 대리·부속 도미넌트
    );
  }
  arr.sort((a, b) => b.weight - a.weight);
  return arr.slice(0, topN);
}
```

그래프 데이터 (data.js 일부):
```json
"pop": {
  "I":   { "IV": 0.28, "V": 0.25, "vi": 0.23, "ii": 0.13, "iii": 0.07 },
  "vi":  { "IV": 0.38, "V": 0.27, "ii": 0.19, "I": 0.11, "iii": 0.05 }
},
"rock": {
  "I":   { "IV": 0.34, "V": 0.32, "vi": 0.19, "bVII": 0.09, "ii": 0.06 }
},
"jazz": {
  "Imaj7":  { "vi7": 0.25, "ii7": 0.25, "IVmaj7": 0.20, "V7": 0.15, "VI7": 0.10, "bII7": 0.05 },
  "ii7":    { "V7": 0.55, "bII7": 0.20, "IVmaj7": 0.12, "Imaj7": 0.08, "vi7": 0.05 },
  "bII7":   { "Imaj7": 0.80, "vi7": 0.20 },
  "VI7":    { "ii7": 0.70, "V7": 0.20, "IVmaj7": 0.10 }
}
```

### 데이터셋 예시

> `getRecommendations`는 **케이스 1, 3**에서는 diatonic 필터를 달고,  
> **케이스 2 폴백**에서는 `diatonic=null`로 필터 없이 호출된다.

#### 케이스 1 — 장르(Pop) + 키(C) 직접 입력: diatonic 필터 적용

`session.key = "C"`, `session.mode = "major"`, `session.genre = "pop"`

```js
// App.jsx:129-139
const diatonic = MUSIC.getDiatonicRomans("pop", "major");
// → ["I","ii","iii","IV","V","vi","viiº"]

graph.getRecommendations("I", diatonic, 4)
```

`adj["I"] = { IV:0.28, V:0.25, vi:0.23, ii:0.13, iii:0.07 }`

diatonic 필터 → `iii`까지 전부 통과 (bVII 없으므로 예외 없음)

| 순위 | romanNumeral | weight | romanToChord("?", "C", "major") | 화면 표시 |
|------|-------------|--------|-------------------------------|---------|
| 1 | IV | 0.28 | **F major** | `IV · 풍성하고 따뜻하게 열리는 느낌` |
| 2 | V | 0.25 | **G major** | `V · 긴장감 — 뭔가 일어날 것 같은 느낌` |
| 3 | vi | 0.23 | **Am** | `vi · 감성적이고 슬픈 느낌` |
| 4 | ii | 0.13 | **Dm** | `ii · 부드럽게 흘러가는 느낌` |

`source = "key"` → 🎹 아이콘, mood 설명 표시

---

#### 케이스 2 — 장르(Rock)만, 폴백 시: diatonic=null (필터 없음)

패턴 매칭 실패 후 폴백. `impliedTonicFromProgression`으로 임시 tonic 추정.

```js
// App.jsx:112
const fallbackRecs = graph.getRecommendations(lastRoman2, null, 4);
//                                                           ↑ diatonic 없음
```

`lastRoman2 = "bVII"` (Bb을 E 기준으로 계산한 결과)

`adj["bVII"] = { IV:0.42, I:0.34, V:0.24 }` → 필터 없이 전체 반환

| 순위 | romanNumeral | weight | 화면 표시 |
|------|-------------|--------|---------|
| 1 | IV | 0.42 | mood 있음 (`IV · 풍성하고 따뜻하게`) |
| 2 | I | 0.34 | mood 있음 (`I · 밝고 안정적`) |
| 3 | V | 0.24 | mood 있음 (`V · 긴장감`) |

> 폴백이라도 `romanNumeral`이 확정되므로 mood는 표시됨.  
> 단, diatonic 외 코드가 섞일 수 있어 음악적으로 부정확할 수 있다.

---

#### 케이스 3 — 장르(Jazz)만, 예상 키 도출 후: diatonic 필터 적용

`inferredKey = { key: "C", mode: "major" }`, `session.genre = "jazz"`

```js
// App.jsx:129-139
const diatonic = MUSIC.getDiatonicRomans("jazz", "major");
// → ["Imaj7","ii7","iii7","IVmaj7","V7","vi7","viiº"]
//   (피아노 스냅용 순수 다이어토닉 7화음)

graph.getRecommendations("Imaj7", diatonic, 4, "jazz")
```

`adj["Imaj7"] = { vi7:0.25, ii7:0.25, IVmaj7:0.20, V7:0.15, VI7:0.10, bII7:0.05 }`

diatonic 필터 + jazz 예외(JAZZ_EXTRAS) 적용:
- `vi7`, `ii7`, `IVmaj7`, `V7` → diatonic 목록에 있으므로 통과
- `VI7` → JAZZ_EXTRAS에 포함, genre === "jazz" → 통과 (부속 도미넌트)
- `bII7` → JAZZ_EXTRAS에 포함, genre === "jazz" → 통과 (삼전음 대리코드)

| 순위 | romanNumeral | weight | romanToChord("?", "C", "major") | 화면 표시 |
|------|-------------|--------|-------------------------------|---------|
| 1 | vi7 | 0.25 | **Am7** | `vi7 · 달콤하고 감성적인 느낌` |
| 2 | ii7 | 0.25 | **Dm7** | `ii7 · 자연스럽게 흘러가는 느낌` |
| 3 | IVmaj7 | 0.20 | **Fmaj7** | `IVmaj7 · 깊고 따뜻하게 열리는 느낌` |
| 4 | V7 | 0.15 | **G7** | `V7 · 강하게 해결을 원하는 긴장감` |

> topN=4이므로 VI7(0.10), bII7(0.05)는 이번 추천에서 잘림.  
> **ii7 선택 후** 추천: `adj["ii7"] = { V7:0.55, bII7:0.20, ... }` → **Db7(bII7) 20%로 등장**  
> 이것이 팝에서는 절대 나오지 않는 재즈 고유 어법 (삼전음 대리코드)

케이스 1(Pop I → Fmaj 1위)과 달리 재즈는 **Am7·Dm7 공동 1위**, G7(V7)이 아닌 **Db7(bII7)이 추천** → 장르 차이가 코드 품질과 크로매틱 어법 모두에서 드러남

---

## 세 케이스 한눈에 비교

| | 케이스 1 | 케이스 2 | 케이스 3 |
|--|---------|---------|---------|
| **설정** | 장르 + 키 직접 입력 | 장르만, 키 미도출 | 장르만, 키 자동 도출 |
| **`inferKey`** | 호출 스킵 | `[]` 반환 | 키 반환 (confidence ≥ 0.7) |
| **`getAbsolutePatternRecs`** | 호출 스킵 | 핵심 동작 | 키 도출 전까지만 동작 |
| **`getRecommendations`** | diatonic 필터 | `null` 필터 (폴백) | diatonic 필터 + jazz 예외 |
| **mood 설명** | ✅ | ❌ (패턴 매칭 중) | ✅ |
| **로마자 표시** | `IV`, `V`, `vi`... | `?` | `vi7`, `ii7`, `IVmaj7`... |
| **재즈 고유 어법** | — | — | `bII7`(삼전음), `VI7`(부속 도미넌트) 등장 가능 |
