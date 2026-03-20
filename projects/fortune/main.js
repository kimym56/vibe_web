// 운세 — 12간지 심볼 회전 + 오행 파티클
function setup(cell) {
  cell.data.zodiac = ['🐀','🐂','🐅','🐇','🐉','🐍','🐎','🐏','🐵','🐔','🐶','🐷']
  cell.data.elements = [
    { name: 'wood', color: '#4CAF50' },
    { name: 'fire', color: '#f44336' },
    { name: 'earth', color: '#FF9800' },
    { name: 'metal', color: '#9E9E9E' },
    { name: 'water', color: '#2196F3' }
  ]
  cell.data.orbs = []
  for (let i = 0; i < 5; i++) {
    cell.data.orbs.push({
      angle: (i / 5) * Math.PI * 2,
      speed: 0.008 + i * 0.002,
      dist: 0
    })
  }
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 배경
  const bg = ctx.createRadialGradient(cellW / 2, cellH / 2, 0, cellW / 2, cellH / 2, cellW * 0.6)
  bg.addColorStop(0, '#1a0a2e')
  bg.addColorStop(1, '#05020a')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cellW, cellH)

  const cx = cellW / 2
  const cy = cellH / 2
  const radius = Math.min(cellW, cellH) * 0.35

  // 외곽 원
  ctx.beginPath()
  ctx.arc(cx, cy, radius + 5, 0, Math.PI * 2)
  ctx.strokeStyle = `hsla(45, 60%, 50%, ${0.2 + Math.sin(frame * 0.02) * 0.1})`
  ctx.lineWidth = 1.5
  ctx.stroke()

  // 12간지 배치
  const zodiacAngleOffset = frame * 0.005
  ctx.font = `${Math.min(cellW, cellH) * 0.06}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + zodiacAngleOffset - Math.PI / 2
    const zx = cx + Math.cos(angle) * radius
    const zy = cy + Math.sin(angle) * radius

    // 활성 간지 강조
    const active = Math.floor((frame * 0.01) % 12) === i
    if (active) {
      ctx.beginPath()
      ctx.arc(zx, zy, Math.min(cellW, cellH) * 0.05, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 215, 0, 0.15)'
      ctx.fill()
    }

    ctx.fillStyle = active ? 'rgba(255, 215, 0, 0.9)' : 'rgba(255, 255, 255, 0.5)'
    ctx.fillText(myData.zodiac[i], zx, zy)
  }

  // 오행 오브 (중앙 회전)
  const orbRadius = radius * 0.45
  for (let i = 0; i < 5; i++) {
    const orb = myData.orbs[i]
    const elem = myData.elements[i]
    orb.angle += orb.speed
    orb.dist = orbRadius + Math.sin(frame * 0.02 + i * 1.2) * 15

    const ox = cx + Math.cos(orb.angle) * orb.dist
    const oy = cy + Math.sin(orb.angle) * orb.dist

    // 오브 글로우
    const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 15)
    glow.addColorStop(0, elem.color + 'aa')
    glow.addColorStop(1, elem.color + '00')
    ctx.beginPath()
    ctx.arc(ox, oy, 15, 0, Math.PI * 2)
    ctx.fillStyle = glow
    ctx.fill()

    // 오브 코어
    ctx.beginPath()
    ctx.arc(ox, oy, 5, 0, Math.PI * 2)
    ctx.fillStyle = elem.color
    ctx.fill()

    // 연결선
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(ox, oy)
    ctx.strokeStyle = elem.color + '20'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  // 중앙 태극 느낌
  const centerPulse = 8 + Math.sin(frame * 0.03) * 3
  ctx.beginPath()
  ctx.arc(cx, cy, centerPulse, 0, Math.PI * 2)
  const cGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, centerPulse)
  cGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)')
  cGrad.addColorStop(1, 'rgba(255, 215, 0, 0)')
  ctx.fillStyle = cGrad
  ctx.fill()
}
