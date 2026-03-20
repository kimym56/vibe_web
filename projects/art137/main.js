// 제너레이티브 아트 — 플로우 필드 + 컬러 하모니
function setup(cell) {
  const cols = 20
  const rows = 15
  cell.data.cols = cols
  cell.data.rows = rows
  cell.data.field = []
  for (let i = 0; i < cols * rows; i++) {
    cell.data.field.push(Math.random() * Math.PI * 2)
  }
  cell.data.walkers = []
  for (let i = 0; i < 80; i++) {
    cell.data.walkers.push({
      x: Math.random() * cell.width,
      y: Math.random() * cell.height,
      hue: Math.random() * 360,
      life: 0.5 + Math.random() * 0.5
    })
  }
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  ctx.fillStyle = 'rgba(10, 8, 25, 0.03)'
  ctx.fillRect(0, 0, cellW, cellH)

  const { cols, rows, field, walkers } = myData
  const cellSzX = cellW / cols
  const cellSzY = cellH / rows

  // 플로우 필드 업데이트
  for (let i = 0; i < field.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    field[i] = Math.sin(col * 0.3 + frame * 0.008) * Math.cos(row * 0.3 + frame * 0.006) * Math.PI * 2
  }

  // 워커 이동 & 그리기
  for (const w of walkers) {
    const col = Math.floor(w.x / cellSzX)
    const row = Math.floor(w.y / cellSzY)
    const idx = Math.max(0, Math.min(field.length - 1, row * cols + col))
    const angle = field[idx]

    const prevX = w.x
    const prevY = w.y

    w.x += Math.cos(angle) * 1.5
    w.y += Math.sin(angle) * 1.5

    // 화면 밖이면 리셋
    if (w.x < 0 || w.x > cellW || w.y < 0 || w.y > cellH) {
      w.x = Math.random() * cellW
      w.y = Math.random() * cellH
      w.hue = (w.hue + 30) % 360
      continue
    }

    ctx.beginPath()
    ctx.moveTo(prevX, prevY)
    ctx.lineTo(w.x, w.y)
    ctx.strokeStyle = `hsla(${(w.hue + frame * 0.2) % 360}, 70%, 55%, ${w.life * 0.4})`
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // 황금각(137.5°) 나선 도트
  if (frame % 4 === 0) {
    const goldenAngle = 137.5 * (Math.PI / 180)
    const n = (frame / 4) % 200
    const r = Math.sqrt(n) * cellW * 0.03
    const a = n * goldenAngle
    const px = cellW / 2 + Math.cos(a) * r
    const py = cellH / 2 + Math.sin(a) * r

    ctx.beginPath()
    ctx.arc(px, py, 2, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${n * 3 + frame}, 80%, 65%, 0.6)`
    ctx.fill()
  }
}
