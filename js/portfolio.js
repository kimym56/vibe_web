import { executeCode } from './engine.js'

const canvas = document.getElementById('main-canvas')
const ctx = canvas.getContext('2d')
const overlay = document.getElementById('overlay')

// 플레이어(프로젝트) 상태
const players = []
let filteredPlayers = []
let frame = 0
let searchQuery = ''

// 애니메이션 상태: 각 플레이어의 현재 렌더링 위치/크기
const animState = new Map()
const LERP_SPEED = 0.08

function lerp(a, b, t) {
  return a + (b - a) * t
}

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

  applyFilter()
}

// 검색 필터 적용
function applyFilter() {
  if (!searchQuery) {
    filteredPlayers = [...players]
  } else {
    const q = searchQuery.toLowerCase()
    filteredPlayers = players.filter(p => {
      const m = p.meta
      return m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        (m.author || '').toLowerCase().includes(q) ||
        m.stack.some(s => s.toLowerCase().includes(q))
    })
  }
  filteredPlayers.forEach(p => { p.needsSetup = true })
  updateTargets()
  buildOverlay()
}

// 목표 위치/크기 갱신
function updateTargets() {
  const { cols, rows } = calcGrid(filteredPlayers.length)
  const cellW = canvas.width / cols
  const cellH = canvas.height / rows

  filteredPlayers.forEach((player, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    const target = { x: col * cellW, y: row * cellH, w: cellW, h: cellH }

    if (!animState.has(player.id)) {
      // 첫 등장: 현재값을 목표값으로 즉시 세팅
      animState.set(player.id, {
        cur: { ...target },
        target,
        visible: true,
        opacity: 1
      })
    } else {
      const state = animState.get(player.id)
      state.target = target
      state.visible = true
    }
  })

  // 필터에서 빠진 플레이어는 페이드아웃
  for (const [id, state] of animState) {
    if (!filteredPlayers.find(p => p.id === id)) {
      state.visible = false
    }
  }
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
  if (count <= 12) return { cols: 4, rows: 3 }
  if (count <= 16) return { cols: 4, rows: 4 }
  if (count <= 20) return { cols: 5, rows: 4 }
  if (count <= 25) return { cols: 5, rows: 5 }
  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)
  return { cols, rows }
}

// 오버레이 (프로젝트 정보 카드)
function buildOverlay() {
  overlay.innerHTML = ''
  const { cols, rows } = calcGrid(filteredPlayers.length)

  filteredPlayers.forEach((player, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)

    const card = document.createElement('div')
    card.className = 'player-card'
    card.dataset.playerId = player.id
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

// 오버레이 카드 위치를 애니메이션 상태에 맞춰 갱신
function updateOverlayPositions() {
  const cards = overlay.querySelectorAll('.player-card')
  cards.forEach(card => {
    const state = animState.get(card.dataset.playerId)
    if (!state) return
    const { cur } = state
    card.style.left = `${cur.x}px`
    card.style.top = `${cur.y}px`
    card.style.width = `${cur.w}px`
    card.style.height = `${cur.h}px`
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

  if (filteredPlayers.length === 0) {
    ctx.fillStyle = '#555'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(players.length === 0 ? 'Loading...' : 'No results', canvas.width / 2, canvas.height / 2)
    requestAnimationFrame(render)
    return
  }

  // 애니메이션: 현재값을 목표값으로 보간
  for (const [, state] of animState) {
    if (!state.visible) continue
    state.cur.x = lerp(state.cur.x, state.target.x, LERP_SPEED)
    state.cur.y = lerp(state.cur.y, state.target.y, LERP_SPEED)
    state.cur.w = lerp(state.cur.w, state.target.w, LERP_SPEED)
    state.cur.h = lerp(state.cur.h, state.target.h, LERP_SPEED)
  }

  // 오버레이도 애니메이션에 맞춰 이동
  updateOverlayPositions()

  filteredPlayers.forEach((player) => {
    const state = animState.get(player.id)
    if (!state) return

    const { x, y, w, h } = state.cur

    ctx.save()
    ctx.beginPath()
    ctx.rect(x, y, w, h)
    ctx.clip()
    ctx.translate(x, y)

    const world = {
      frame,
      cellW: w,
      cellH: h,
      myData: player.data || {}
    }

    const result = executeCode(player.code, ctx, world, player)

    ctx.translate(-x, -y)

    if (result.error) {
      player.hasError = true
      player.errorMessage = result.error
      drawError(ctx, x, y, w, h, player)
    } else {
      player.hasError = false
    }

    ctx.restore()
  })

  // 그리드 라인
  const { cols: c, rows: r } = calcGrid(filteredPlayers.length)
  const cellW = canvas.width / c
  const cellH = canvas.height / r
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

// 검색
const searchBar = document.getElementById('search-bar')
const searchInput = document.getElementById('search-input')
const searchHint = document.getElementById('search-hint')

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim()
  applyFilter()
})

// / 키로 검색창 열기, Escape로 닫기
document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault()
    searchBar.classList.add('visible')
    searchHint.classList.add('hidden')
    searchInput.focus()
  }
  if (e.key === 'Escape') {
    searchInput.value = ''
    searchQuery = ''
    searchBar.classList.remove('visible')
    searchHint.classList.remove('hidden')
    searchInput.blur()
    applyFilter()
  }
})

// 초기화
resize()
window.addEventListener('resize', () => {
  resize()
  updateTargets()
  buildOverlay()
})

loadPlayers().then(() => {
  render()
})
