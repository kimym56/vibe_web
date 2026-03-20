// 비디오 — 필름 스트립 + 프레임 전환 효과
function setup(cell) {
  cell.data.frames = []
  for (let i = 0; i < 6; i++) {
    cell.data.frames.push({
      hue: Math.random() * 360,
      pattern: Math.floor(Math.random() * 3)
    })
  }
  cell.data.scanY = 0
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  ctx.fillStyle = '#0a0a12'
  ctx.fillRect(0, 0, cellW, cellH)

  const cols = 3
  const rows = 2
  const pad = 8
  const fw = (cellW - pad * (cols + 1)) / cols
  const fh = (cellH - pad * (rows + 1)) / rows

  // 필름 프레임들
  for (let i = 0; i < myData.frames.length; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    const fx = pad + col * (fw + pad)
    const fy = pad + row * (fh + pad)
    const f = myData.frames[i]
    const hue = (f.hue + frame * 0.3) % 360

    // 프레임 배경
    const grad = ctx.createLinearGradient(fx, fy, fx + fw, fy + fh)
    grad.addColorStop(0, `hsla(${hue}, 60%, 15%, 0.9)`)
    grad.addColorStop(1, `hsla(${hue + 40}, 60%, 10%, 0.9)`)
    ctx.fillStyle = grad
    ctx.fillRect(fx, fy, fw, fh)

    // 프레임 안 패턴
    ctx.save()
    ctx.beginPath()
    ctx.rect(fx, fy, fw, fh)
    ctx.clip()

    if (f.pattern === 0) {
      // 원형 줌
      const r = (frame * 0.5 + i * 30) % (fw * 0.6)
      ctx.beginPath()
      ctx.arc(fx + fw / 2, fy + fh / 2, r, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue}, 70%, 60%, 0.4)`
      ctx.lineWidth = 2
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(fx + fw / 2, fy + fh / 2, r * 0.6, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${hue + 30}, 70%, 60%, 0.3)`
      ctx.stroke()
    } else if (f.pattern === 1) {
      // 대각선 스캔
      const offset = (frame * 2 + i * 40) % (fw + fh)
      ctx.beginPath()
      ctx.moveTo(fx + offset, fy)
      ctx.lineTo(fx, fy + offset)
      ctx.strokeStyle = `hsla(${hue}, 80%, 60%, 0.5)`
      ctx.lineWidth = fw * 0.3
      ctx.stroke()
    } else {
      // 노이즈 바
      for (let b = 0; b < 5; b++) {
        const by = fy + (fh / 5) * b + Math.sin(frame * 0.03 + b) * 8
        const bw = fw * (0.3 + Math.sin(frame * 0.05 + b * 2) * 0.3)
        ctx.fillStyle = `hsla(${hue}, 60%, 60%, 0.25)`
        ctx.fillRect(fx + (fw - bw) / 2, by, bw, 3)
      }
    }

    ctx.restore()

    // 프레임 테두리
    ctx.strokeStyle = `hsla(${hue}, 50%, 40%, 0.5)`
    ctx.lineWidth = 1.5
    ctx.strokeRect(fx, fy, fw, fh)
  }

  // 스캔라인
  myData.scanY = (myData.scanY + 1.5) % cellH
  ctx.fillStyle = 'rgba(100, 200, 255, 0.04)'
  ctx.fillRect(0, myData.scanY - 20, cellW, 40)

  // 타임라인 바
  const progress = (frame % 300) / 300
  ctx.fillStyle = 'rgba(255,255,255,0.1)'
  ctx.fillRect(0, cellH - 4, cellW, 4)
  ctx.fillStyle = 'rgba(100, 180, 255, 0.6)'
  ctx.fillRect(0, cellH - 4, cellW * progress, 4)
}
