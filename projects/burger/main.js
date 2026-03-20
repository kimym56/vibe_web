// 버거 — 재료가 쌓이는 애니메이션
function setup(cell) {
  cell.data.layers = [
    { color: '#D4A04A', h: 0.12, label: 'Top Bun', curve: true },
    { color: '#2ecc71', h: 0.04, label: 'Lettuce', wavy: true },
    { color: '#e74c3c', h: 0.05, label: 'Tomato' },
    { color: '#f1c40f', h: 0.04, label: 'Cheese', melt: true },
    { color: '#8B4513', h: 0.10, label: 'Patty' },
    { color: '#f1c40f', h: 0.04, label: 'Cheese', melt: true },
    { color: '#8B4513', h: 0.10, label: 'Patty' },
    { color: '#2ecc71', h: 0.04, label: 'Lettuce', wavy: true },
    { color: '#C89030', h: 0.12, label: 'Bottom Bun' }
  ]
  cell.data.dropPhase = 0
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 배경
  const bg = ctx.createRadialGradient(cellW / 2, cellH / 2, 0, cellW / 2, cellH / 2, cellW * 0.6)
  bg.addColorStop(0, '#2a1a0a')
  bg.addColorStop(1, '#0a0804')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, cellW, cellH)

  const layers = myData.layers
  const burgerW = cellW * 0.55
  const totalH = cellH * 0.65
  const baseY = cellH * 0.82
  const cx = cellW / 2

  // 드롭 애니메이션 — 위에서 하나씩 떨어짐
  myData.dropPhase = Math.min(layers.length, myData.dropPhase + 0.02)
  const visibleCount = Math.floor(myData.dropPhase)

  let currentY = baseY

  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i]
    const layerH = totalH * layer.h

    if (i >= layers.length - visibleCount) {
      // 드롭 중인 레이어 바운스
      const dropIdx = layers.length - 1 - i
      const dropProgress = Math.min(1, myData.dropPhase - dropIdx)
      const bounce = dropProgress < 1 ? Math.abs(Math.sin(dropProgress * Math.PI * 2)) * 30 * (1 - dropProgress) : 0
      const drawY = currentY - layerH - bounce

      ctx.save()

      if (layer.wavy) {
        // 상추 — 물결 모양
        ctx.beginPath()
        ctx.moveTo(cx - burgerW / 2, drawY + layerH)
        for (let x = -burgerW / 2; x <= burgerW / 2; x += 4) {
          const wy = Math.sin(x * 0.1 + frame * 0.05) * 3
          ctx.lineTo(cx + x, drawY + wy)
        }
        ctx.lineTo(cx + burgerW / 2, drawY + layerH)
        ctx.closePath()
        ctx.fillStyle = layer.color
        ctx.fill()
      } else if (layer.curve) {
        // 번 상단 — 둥근 모양
        ctx.beginPath()
        ctx.ellipse(cx, drawY + layerH, burgerW / 2, layerH, 0, Math.PI, 0)
        ctx.fillStyle = layer.color
        ctx.fill()
        // 참깨
        ctx.fillStyle = '#FFF8DC'
        for (let s = 0; s < 5; s++) {
          const sx = cx + (s - 2) * burgerW * 0.1
          const sy = drawY + layerH * 0.4
          ctx.beginPath()
          ctx.ellipse(sx, sy, 3, 2, 0.3, 0, Math.PI * 2)
          ctx.fill()
        }
      } else if (layer.melt) {
        // 치즈 — 녹는 효과
        ctx.fillStyle = layer.color
        ctx.fillRect(cx - burgerW / 2, drawY, burgerW, layerH)
        for (let d = 0; d < 3; d++) {
          const dx = cx - burgerW / 3 + d * burgerW / 3
          const dh = 5 + Math.sin(frame * 0.03 + d) * 4
          ctx.beginPath()
          ctx.ellipse(dx, drawY + layerH + dh / 2, 8, dh, 0, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        // 일반 레이어
        ctx.fillStyle = layer.color
        roundRect(ctx, cx - burgerW / 2, drawY, burgerW, layerH, 4)
      }

      ctx.restore()
    }

    currentY -= layerH
  }

  // 완성 시 반짝임
  if (visibleCount >= layers.length && frame % 2 === 0) {
    const sparkX = cx + (Math.random() - 0.5) * burgerW * 1.2
    const sparkY = baseY - totalH * 0.5 + (Math.random() - 0.5) * totalH
    ctx.beginPath()
    ctx.arc(sparkX, sparkY, 1.5, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(40, 100%, 80%, ${Math.random() * 0.5})`
    ctx.fill()
  }

  // 루프 리셋
  if (myData.dropPhase > layers.length + 3) {
    myData.dropPhase = 0
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
  ctx.fill()
}
