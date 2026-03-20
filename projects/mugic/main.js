// 음악 — 이퀄라이저 바 + 음파 파티클
function setup(cell) {
  cell.data.bars = 32
  cell.data.particles = []
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  ctx.fillStyle = 'rgba(8, 4, 20, 0.15)'
  ctx.fillRect(0, 0, cellW, cellH)

  const barW = cellW / myData.bars
  const baseY = cellH * 0.75

  // 이퀄라이저 바
  for (let i = 0; i < myData.bars; i++) {
    const freq = Math.sin(i * 0.3 + frame * 0.06) * 0.5 +
                 Math.sin(i * 0.7 + frame * 0.04) * 0.3 +
                 Math.sin(frame * 0.02 + i) * 0.2
    const h = Math.abs(freq) * cellH * 0.55

    const hue = 270 + i * (60 / myData.bars)
    const grad = ctx.createLinearGradient(0, baseY, 0, baseY - h)
    grad.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.8)`)
    grad.addColorStop(1, `hsla(${hue + 30}, 90%, 70%, 0.4)`)

    ctx.fillStyle = grad
    ctx.fillRect(i * barW + 1, baseY - h, barW - 2, h)

    // 반사
    ctx.fillStyle = `hsla(${hue}, 80%, 50%, 0.1)`
    ctx.fillRect(i * barW + 1, baseY, barW - 2, h * 0.3)

    // 바 꼭대기에서 파티클 생성
    if (frame % 3 === 0 && h > cellH * 0.2 && myData.particles.length < 60) {
      myData.particles.push({
        x: i * barW + barW / 2,
        y: baseY - h,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 2 - 1,
        life: 1,
        hue
      })
    }
  }

  // 파티클
  for (let i = myData.particles.length - 1; i >= 0; i--) {
    const p = myData.particles[i]
    p.x += p.vx
    p.y += p.vy
    p.vy += 0.02
    p.life -= 0.015

    if (p.life <= 0) { myData.particles.splice(i, 1); continue }

    ctx.beginPath()
    ctx.arc(p.x, p.y, 2.5 * p.life, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.life * 0.7})`
    ctx.fill()
  }

  // 하단 라인
  ctx.strokeStyle = 'rgba(180, 100, 255, 0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, baseY)
  ctx.lineTo(cellW, baseY)
  ctx.stroke()
}
