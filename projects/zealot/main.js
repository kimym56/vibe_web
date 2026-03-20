// 질럿 — 사이오닉 블레이드 + 워프인 이펙트
function setup(cell) {
  cell.data.particles = []
  cell.data.slashes = []
  cell.data.warpPhase = 0
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  ctx.fillStyle = 'rgba(2, 2, 15, 0.12)'
  ctx.fillRect(0, 0, cellW, cellH)

  const cx = cellW / 2
  const cy = cellH / 2

  // 워프인 링
  myData.warpPhase = (myData.warpPhase + 0.015) % (Math.PI * 2)
  const warpAlpha = Math.max(0, Math.sin(myData.warpPhase) * 0.5)
  if (warpAlpha > 0.01) {
    for (let r = 0; r < 3; r++) {
      const radius = 30 + r * 25 + Math.sin(frame * 0.05 + r) * 10
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(80, 160, 255, ${warpAlpha * (1 - r * 0.25)})`
      ctx.lineWidth = 2 - r * 0.5
      ctx.stroke()
    }
  }

  // 사이오닉 블레이드 (2개)
  const bladeLen = cellH * 0.3
  const bladeAngle = Math.sin(frame * 0.04) * 0.3
  const bladeGlow = 0.5 + Math.sin(frame * 0.08) * 0.3

  for (let side = -1; side <= 1; side += 2) {
    const bx = cx + side * cellW * 0.12
    const by = cy

    ctx.save()
    ctx.translate(bx, by)
    ctx.rotate(bladeAngle * side)

    // 블레이드 글로우
    const grad = ctx.createLinearGradient(0, 0, 0, -bladeLen)
    grad.addColorStop(0, `rgba(100, 200, 255, ${bladeGlow})`)
    grad.addColorStop(0.5, `rgba(150, 220, 255, ${bladeGlow * 0.7})`)
    grad.addColorStop(1, `rgba(200, 240, 255, 0)`)

    ctx.beginPath()
    ctx.moveTo(-6, 0)
    ctx.lineTo(0, -bladeLen)
    ctx.lineTo(6, 0)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    // 블레이드 코어
    ctx.beginPath()
    ctx.moveTo(-2, 0)
    ctx.lineTo(0, -bladeLen * 0.9)
    ctx.lineTo(2, 0)
    ctx.closePath()
    ctx.fillStyle = `rgba(200, 240, 255, ${bladeGlow * 0.9})`
    ctx.fill()

    ctx.restore()

    // 블레이드 파티클
    if (frame % 2 === 0) {
      myData.particles.push({
        x: bx + (Math.random() - 0.5) * 10,
        y: by - Math.random() * bladeLen,
        vx: (Math.random() - 0.5) * 1.5 * side,
        vy: -Math.random() * 1.5,
        life: 1,
        size: 1 + Math.random() * 2
      })
    }
  }

  // 슬래시 이펙트 (주기적)
  if (frame % 60 === 0) {
    myData.slashes.push({
      x: cx, y: cy,
      angle: (Math.random() - 0.5) * 1.5,
      life: 1,
      len: cellW * 0.3
    })
  }

  for (let i = myData.slashes.length - 1; i >= 0; i--) {
    const s = myData.slashes[i]
    s.life -= 0.03
    if (s.life <= 0) { myData.slashes.splice(i, 1); continue }

    const ex = s.x + Math.cos(s.angle) * s.len
    const ey = s.y + Math.sin(s.angle) * s.len

    ctx.beginPath()
    ctx.moveTo(s.x - Math.cos(s.angle) * s.len * 0.3, s.y - Math.sin(s.angle) * s.len * 0.3)
    ctx.lineTo(ex, ey)
    ctx.strokeStyle = `rgba(150, 220, 255, ${s.life * 0.6})`
    ctx.lineWidth = 3 * s.life
    ctx.stroke()

    ctx.strokeStyle = `rgba(200, 240, 255, ${s.life * 0.2})`
    ctx.lineWidth = 10 * s.life
    ctx.stroke()
  }

  // 파티클 업데이트
  for (let i = myData.particles.length - 1; i >= 0; i--) {
    const p = myData.particles[i]
    p.x += p.vx
    p.y += p.vy
    p.life -= 0.02

    if (p.life <= 0) { myData.particles.splice(i, 1); continue }

    ctx.beginPath()
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(100, 200, 255, ${p.life * 0.6})`
    ctx.fill()
  }

  // 배경 별
  if (frame % 10 === 0) {
    const sx = Math.random() * cellW
    const sy = Math.random() * cellH
    ctx.beginPath()
    ctx.arc(sx, sy, 0.8, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(150, 180, 255, 0.3)'
    ctx.fill()
  }
}
