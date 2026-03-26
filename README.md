# Vibe Canvas

JSON + Canvas 기반 크리에이티브 포트폴리오. 누구나 자신만의 캔버스 비주얼과 프로젝트 정보를 추가하고 PR을 올려 참여할 수 있습니다.

**Live:** https://vibe-web-gamma.vercel.app

---

## Claude Code로 참여하기 (가장 빠른 방법)

### 1. Fork & 클론

GitHub에서 오른쪽 위 **Fork** 버튼 클릭 → 본인 계정에 복사본 생성

```bash
git clone https://github.com/{본인-github-id}/vibe_web.git
cd vibe_web
npm install
```

### 2. Claude Code 실행

```bash
claude
```

### 3. 비주얼 만들기

Claude Code에게 이렇게 말하세요:

> **"README 읽고 내 프로젝트 추가해줘. ID는 hong-dev, 캔버스에 네온 파티클이 원형으로 회전하는 비주얼 만들어줘."**

- ID는 본인의 GitHub 아이디 또는 원하는 영문 소문자 이름 (예: `hong-dev`, `my-project`)
- 비주얼 설명은 자유롭게 — Canvas 2D로 그릴 수 있는 건 다 됩니다

### 4. 로컬에서 확인

```bash
npm run dev
# → http://localhost:3000 에서 본인 셀이 나오는지 확인
```

맘에 들 때까지 Claude Code에게 수정 요청하세요.

### 5. 확인 끝나면 PR

다 맘에 들면 Claude Code에게:

> **"브랜치 만들고 커밋 푸시해서 PR 올려줘"**

---

## 수동으로 참여하기 (단계별)

### 1. 이 저장소를 Fork

GitHub에서 오른쪽 위 **Fork** 버튼을 클릭합니다. 본인 계정에 복사본이 생깁니다.

### 2. Fork한 저장소를 클론

```bash
git clone https://github.com/{본인-github-id}/vibe_web.git
cd vibe_web
npm install
```

### 3. 브랜치 생성

```bash
git checkout -b add/{your-id}
```

> ID는 **영문 소문자 + 하이픈**만 사용 (예: `john-doe`, `myproject`)

### 4. 파일 3개 작성

**A. 캔버스 코드** — `public/projects/{your-id}/main.js`

```javascript
function setup(cell) {
  cell.data.x = cell.width / 2
  cell.data.y = cell.height / 2
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(0, 0, cellW, cellH)

  const x = myData.x + Math.sin(frame * 0.03) * 50
  const y = myData.y + Math.cos(frame * 0.02) * 30
  ctx.beginPath()
  ctx.arc(x, y, 20, 0, Math.PI * 2)
  ctx.fillStyle = `hsl(${frame % 360}, 70%, 60%)`
  ctx.fill()
}
```

**B. 프로젝트 정보** — `public/data/{your-id}.json`

```json
{
  "id": "{your-id}",
  "title": "프로젝트 이름",
  "description": "한두 줄 설명",
  "url": "https://your-project-url.com",
  "stack": ["React", "Three.js"],
  "author": "이름",
  "code": "projects/{your-id}/main.js"
}
```

**C. config에 ID 추가** — `public/data/config.json`

`players` 배열 **맨 뒤에** 본인 ID 추가 (기존 순서 변경 금지)

### 5. 로컬에서 확인

```bash
npm run dev
# → http://localhost:3000 에서 본인 셀이 보이는지 확인
```

### 6. 커밋 & 푸시

```bash
git add public/projects/{your-id}/main.js public/data/{your-id}.json public/data/config.json
git commit -m "add: {your-id} 프로젝트 추가"
git push origin add/{your-id}
```

### 7. Pull Request 생성

GitHub에서 본인 Fork 저장소에 가면 **"Compare & pull request"** 버튼이 나타납니다.
클릭해서 PR을 생성하면 끝. 머지되면 자동으로 사이트에 반영됩니다.

---

## 프로젝트 구조

```
├── index.html              ← 메인 페이지 (수정 금지)
├── js/
│   ├── portfolio.js        ← 렌더링 엔진 (수정 금지)
│   └── engine.js           ← 코드 실행기 (수정 금지)
├── public/
│   ├── data/
│   │   ├── config.json     ← 참여자 ID 목록 (본인 ID만 추가)
│   │   ├── mugic.json      ← 예시 — 프로젝트 메타데이터
│   │   └── {your-id}.json  ← 새로 만들기
│   └── projects/
│       ├── mugic/main.js   ← 예시 — 캔버스 코드
│       └── {your-id}/
│           └── main.js     ← 새로 만들기
└── vite.config.js
```

> `public/` 안의 파일은 Vite 빌드 시 그대로 `dist/`에 복사됩니다.

---

## API 레퍼런스

| 변수 | 설명 |
|---|---|
| `ctx` | [Canvas 2D Context](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D) |
| `world.cellW` | 셀 너비 (px) — 화면/참여자 수에 따라 변동 |
| `world.cellH` | 셀 높이 (px) — 화면/참여자 수에 따라 변동 |
| `world.frame` | 프레임 카운터 (1부터 증가) |
| `world.myData` | `setup()`에서 `cell.data`에 저장한 객체 |

| JSON 필드 | 필수 | 설명 |
|---|---|---|
| `id` | O | 영문 소문자 ID (폴더명과 동일) |
| `title` | O | 프로젝트 이름 |
| `description` | O | 프로젝트 설명 |
| `url` | O | 클릭 시 이동할 링크 |
| `stack` | O | 기술 스택 배열 |
| `author` | - | 만든 사람 이름 |
| `code` | O | 캔버스 코드 경로 (`projects/{id}/main.js`) |

> **중요**: 좌표를 절대값으로 하드코딩하면 화면 크기가 바뀔 때 깨집니다.
> 항상 `cellW`, `cellH` 기준 비율로 작성하세요. (예: `cellW / 2`, `cellH * 0.3`)

---

## 규칙

### 수정해도 되는 파일

| 파일 | 할 수 있는 것 |
|---|---|
| `public/projects/{your-id}/main.js` | 새로 생성 |
| `public/data/{your-id}.json` | 새로 생성 |
| `public/data/config.json` | **본인 ID만 맨 뒤에 추가** |

### 절대 수정하면 안 되는 파일

| 파일 | 이유 |
|---|---|
| `index.html` | 공용 페이지 |
| `js/portfolio.js` | 렌더링 엔진 |
| `js/engine.js` | 코드 실행기 |
| `public/data/{남의-id}.json` | 다른 사람의 프로젝트 정보 |
| `public/projects/{남의-id}/*` | 다른 사람의 캔버스 코드 |

> PR에서 본인 파일 외 다른 파일이 변경되어 있으면 머지되지 않습니다.

---

## 배포

Vercel로 자동 배포됩니다. PR을 머지하면 Production이 자동 업데이트됩니다.

## 팁

- `public/projects/` 폴더의 기존 코드를 참고하면 좋습니다
- `ctx.fillRect(0, 0, cellW, cellH)`로 매 프레임 배경을 그려야 이전 프레임이 지워집니다
- 반투명 배경(`rgba`)을 사용하면 잔상(trail) 효과를 낼 수 있습니다
- `frame` 값과 `Math.sin()`/`Math.cos()`를 조합하면 자연스러운 애니메이션이 됩니다
- 파티클 배열은 일정 개수 이상 늘어나지 않도록 제한하세요 (성능)
