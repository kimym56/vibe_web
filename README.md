# Vibe Canvas

JSON + Canvas 기반 크리에이티브 포트폴리오. 누구나 자신만의 캔버스 비주얼과 프로젝트 정보를 추가하고 PR을 올려 참여할 수 있습니다.

## 실행

```bash
git clone https://github.com/{owner}/vibe-canvas.git
cd vibe-canvas
npm install
npm run dev
# → http://localhost:3000
```

## 프로젝트 구조

```
├── index.html              ← 메인 페이지 (수정 금지)
├── js/
│   ├── portfolio.js        ← 렌더링 엔진 (수정 금지)
│   └── engine.js           ← 코드 실행기 (수정 금지)
├── data/
│   ├── config.json         ← 참여자 ID 목록 (본인 ID만 추가)
│   ├── mugic.json          ← 예시 — 프로젝트 메타데이터
│   └── {your-id}.json      ← ✅ 새로 만들기
└── projects/
    ├── mugic/main.js        ← 예시 — 캔버스 코드
    └── {your-id}/
        └── main.js          ← ✅ 새로 만들기
```

---

## 참여 방법

### Step 1. 브랜치 생성

```bash
git checkout -b add/{your-id}
```

> ID는 **영문 소문자 + 하이픈**만 사용 (예: `john-doe`, `myproject`)

### Step 2. 캔버스 코드 작성

`projects/{your-id}/main.js` 파일을 만듭니다.

```javascript
// projects/{your-id}/main.js

function setup(cell) {
  // 한 번 실행되는 초기화
  // cell.width / cell.height: 셀 크기
  // cell.data: 프레임 간 데이터 저장용 객체
  cell.data.x = cell.width / 2
  cell.data.y = cell.height / 2
}

function draw(ctx, world) {
  // 매 프레임 실행
  const { cellW, cellH, frame, myData } = world

  // 배경 (반드시 매 프레임 그려야 함)
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, cellW, cellH)

  // 예시: 움직이는 원
  const x = myData.x + Math.sin(frame * 0.03) * 50
  const y = myData.y + Math.cos(frame * 0.02) * 30
  ctx.beginPath()
  ctx.arc(x, y, 20, 0, Math.PI * 2)
  ctx.fillStyle = `hsl(${frame % 360}, 70%, 60%)`
  ctx.fill()
}
```

#### API 레퍼런스

| 변수 | 설명 |
|---|---|
| `ctx` | [Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) |
| `world.cellW` | 셀 너비 (px) — 화면/참여자 수에 따라 변동 |
| `world.cellH` | 셀 높이 (px) — 화면/참여자 수에 따라 변동 |
| `world.frame` | 프레임 카운터 (1부터 증가) |
| `world.myData` | `setup()`에서 `cell.data`에 저장한 객체 |

> **중요**: 좌표를 절대값으로 하드코딩하면 화면 크기가 바뀔 때 깨집니다.
> 항상 `cellW`, `cellH` 기준 비율로 작성하세요. (예: `cellW / 2`, `cellH * 0.3`)

### Step 3. JSON 메타데이터 작성

`data/{your-id}.json` 파일을 만듭니다.

```json
{
  "id": "{your-id}",
  "title": "프로젝트 이름",
  "description": "이 프로젝트가 무엇인지 한두 줄 설명",
  "url": "https://your-project-url.com",
  "stack": ["React", "Three.js"],
  "author": "이름",
  "code": "projects/{your-id}/main.js"
}
```

| 필드 | 필수 | 설명 |
|---|---|---|
| `id` | O | 영문 소문자 ID (폴더명과 동일) |
| `title` | O | 프로젝트 이름 |
| `description` | O | 프로젝트 설명 |
| `url` | O | 클릭 시 이동할 링크 |
| `stack` | O | 기술 스택 배열 |
| `author` | - | 만든 사람 이름 |
| `code` | O | 캔버스 코드 경로 (`projects/{id}/main.js`) |

### Step 4. config.json에 본인 ID 추가

`data/config.json`의 `players` 배열 **맨 뒤에** 자신의 ID를 추가합니다.

```json
{
  "players": ["mugic", "vidgen", "art137", "burger", "zealot", "fortune", "{your-id}"]
}
```

> **기존 ID 순서를 변경하거나 삭제하지 마세요.** 맨 뒤에 추가만 합니다.

### Step 5. 로컬 테스트

```bash
npm run dev
```

확인 사항:
- [ ] 자신의 셀이 그리드에 나타나는가
- [ ] 에러 없이 애니메이션이 동작하는가
- [ ] 호버 시 프로젝트 정보가 표시되는가
- [ ] 클릭 시 URL로 이동하는가
- [ ] 브라우저 콘솔에 에러가 없는가

### Step 6. PR 올리기

```bash
git add projects/{your-id}/main.js data/{your-id}.json data/config.json
git commit -m "add: {your-id} 프로젝트 추가"
git push origin add/{your-id}
```

GitHub에서 Pull Request를 생성합니다.

---

## 규칙

### 수정해도 되는 파일

| 파일 | 할 수 있는 것 |
|---|---|
| `projects/{your-id}/main.js` | 새로 생성 |
| `data/{your-id}.json` | 새로 생성 |
| `data/config.json` | **본인 ID만 맨 뒤에 추가** |

### 절대 수정하면 안 되는 파일

| 파일 | 이유 |
|---|---|
| `index.html` | 공용 페이지 |
| `js/portfolio.js` | 렌더링 엔진 |
| `js/engine.js` | 코드 실행기 |
| `data/{남의-id}.json` | 다른 사람의 프로젝트 정보 |
| `projects/{남의-id}/*` | 다른 사람의 캔버스 코드 |

> PR에서 본인 파일 외 다른 파일이 변경되어 있으면 머지되지 않습니다.

---

## 팁

- `projects/` 폴더의 기존 코드를 참고하면 좋습니다
- `ctx.fillRect(0, 0, cellW, cellH)`로 매 프레임 배경을 그려야 이전 프레임이 지워집니다
- 반투명 배경(`rgba`)을 사용하면 잔상(trail) 효과를 낼 수 있습니다
- `frame` 값과 `Math.sin()`/`Math.cos()`를 조합하면 자연스러운 애니메이션이 됩니다
- 파티클 배열은 일정 개수 이상 늘어나지 않도록 제한하세요 (성능)
