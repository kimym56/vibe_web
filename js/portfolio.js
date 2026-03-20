import { executeCode } from './engine.js'

const canvas = document.getElementById('main-canvas')
const ctx = canvas.getContext('2d')
const overlay = document.getElementById('overlay')

// 플레이어(프로젝트) 상태
const players = []
let frame = 0

// 캔버스 리사이즈 (뷰포트 전체)
function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

// JSON 파일 목록 로드
async function loadPlayers() {
  const res = await fetch('/data/config.json')
  const config = await res.json()

  for (const id of config.players) {
    try {
      const metaRes = await fetch(`/data/${id}.json`)
      const meta = await metaRes.json()

      const codeRes = await fetch(`/${meta.code}`)
      const code = await codeRes.text()

      players.push({
        id,
        meta,
        code,
        data: {},
        needsSetup: true,
        hasError: false,
        errorMessage: ''
      })
    } catch (e) {
      console.error(`Failed to load player ${id}:`, e)
    }
  }

  buildOverlay()
}

// 동적 그리드 계산
function calcGrid(count) {
  if (count <= 0) return { cols: 1, rows: 1 }
  if (count === 1) return { cols: 1, rows: 1 }
  if (count === 2) return { cols: 2, rows: 1 }
  if (count === 3) return { cols: 3, rows: 1 }
  if (count === 4) return { cols: 2, rows: 2 }
  if (count <= 6) return { cols: 3, rows: 2 }
  if (count <= 9) return { cols: 3, rows: 3 }
  return { cols: 4, rows: 3 }
}

// 오버레이 (프로젝트 정보 카드)
function buildOverlay() {
  overlay.innerHTML = ''
  const { cols, rows } = calcGrid(players.length)

  players.forEach((player, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)

    const card = document.createElement('div')
    card.className = 'player-card'
    card.style.left = `${(col / cols) * 100}%`
    card.style.top = `${(row / rows) * 100}%`
    card.style.width = `${100 / cols}%`
    card.style.height = `${100 / rows}%`

    const m = player.meta
    card.innerHTML = `
      <div class="card-inner">
        <div class="card-top">
          <span class="card-title">${m.title}</span>
          <span class="card-author">by ${m.author || m.id}</span>
        </div>
        <div class="card-bottom">
          <p class="card-desc">${m.description}</p>
          <div class="card-stack">${m.stack.map(s => `<span class="tag">${s}</span>`).join('')}</div>
          ${m.url ? `<span class="card-url">${m.url.replace(/^https?:\/\//, '')}</span>` : ''}
        </div>
      </div>
    `

    card.addEventListener('mouseenter', () => card.classList.add('active'))
    card.addEventListener('mouseleave', () => card.classList.remove('active'))

    if (m.url) {
      card.addEventListener('click', () => window.open(m.url, '_blank'))
    }

    overlay.appendChild(card)
  })
}

// 에러 셀 그리기
function drawError(ctx, x, y, w, h, player) {
  ctx.fillStyle = '#1a1a2e'
  ctx.fillRect(x, y, w, h)

  ctx.strokeStyle = '#ff4444'
  ctx.lineWidth = 3
  ctx.strokeRect(x + 2, y + 2, w - 4, h - 4)

  ctx.fillStyle = '#ff4444'
  ctx.font = `${Math.min(w, h) * 0.08}px monospace`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(player.errorMessage.slice(0, 40), x + w / 2, y + h / 2)
}

// 메인 렌더링 루프
function render() {
  frame++
  ctx.fillStyle = '#0a0a1a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  if (players.length === 0) {
    ctx.fillStyle = '#555'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2)
    requestAnimationFrame(render)
    return
  }

  const { cols, rows } = calcGrid(players.length)
  const cellW = canvas.width / cols
  const cellH = canvas.height / rows

  players.forEach((player, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const x = col * cellW
    const y = row * cellH

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, cellW, cellH)
    ctx.clip()
    ctx.translate(x, y)

    const world = {
      frame,
      cellW,
      cellH,
      myData: player.data || {}
    }

    const result = executeCode(player.code, ctx, world, player)

    ctx.translate(-x, -y)

    if (result.error) {
      player.hasError = true
      player.errorMessage = result.error
      drawError(ctx, x, y, cellW, cellH, player)
    } else {
      player.hasError = false
    }

    ctx.restore()
  })

  // 그리드 라인
  const { cols: c, rows: r } = calcGrid(players.length)
  ctx.strokeStyle = 'rgba(255,255,255,0.05)'
  ctx.lineWidth = 1
  for (let i = 1; i < c; i++) {
    ctx.beginPath()
    ctx.moveTo(i * cellW, 0)
    ctx.lineTo(i * cellW, canvas.height)
    ctx.stroke()
  }
  for (let i = 1; i < r; i++) {
    ctx.beginPath()
    ctx.moveTo(0, i * cellH)
    ctx.lineTo(canvas.width, i * cellH)
    ctx.stroke()
  }

  requestAnimationFrame(render)
}

// 초기화
resize()
window.addEventListener('resize', () => {
  resize()
  buildOverlay()
})

loadPlayers().then(() => {
  render()
})
