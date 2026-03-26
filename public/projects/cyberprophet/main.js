// PageMint — 오빗 다이어그램 (중앙 허브 + 4 노드 궤도 + 펄스)
function setup(cell) {
  cell.data.pulses = []
  cell.data.nodes = [
    { label: 'P3', name: 'Design Agency', color: '#a78bfa', angle: Math.PI * 0.25 },
    { label: 'P4', name: 'OpenCode Bridge', color: '#fb923c', angle: Math.PI * 0.75 },
    { label: 'P5', name: 'Server', color: '#4ade80', angle: Math.PI * 1.25 },
    { label: 'P6', name: 'Client', color: '#60a5fa', angle: Math.PI * 1.75 }
  ]
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world

  // 배경
  ctx.fillStyle = '#0a0a1a'
  ctx.fillRect(0, 0, cellW, cellH)

  const cx = cellW / 2
  const cy = cellH / 2
  const orbitR = Math.min(cellW, cellH) * 0.32
  const hubR = Math.min(cellW, cellH) * 0.09
  const nodeR = Math.min(cellW, cellH) * 0.055
  const speed = 0.003

  // 궤도 링
  ctx.beginPath()
  ctx.arc(cx, cy, orbitR, 0, Math.PI * 2)
  ctx.strokeStyle = 'rgba(167, 139, 250, 0.12)'
  ctx.lineWidth = 1
  ctx.stroke()

  // 노드 그리기 + 연결선 + 펄스 생성
  for (let i = 0; i < myData.nodes.length; i++) {
    const node = myData.nodes[i]
    node.angle += speed
    const nx = cx + Math.cos(node.angle) * orbitR
    const ny = cy + Math.sin(node.angle) * orbitR

    // 연결선 (점선)
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(nx, ny)
    ctx.strokeStyle = node.color + '40'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.stroke()
    ctx.setLineDash([])

    // 펄스 생성
    if (frame % 90 === i * 22 && myData.pulses.length < 12) {
      myData.pulses.push({ sx: cx, sy: cy, tx: nx, ty: ny, t: 0, color: node.color })
    }

    // 노드 글로우
    const glow = ctx.createRadialGradient(nx, ny, 0, nx, ny, nodeR * 1.8)
    glow.addColorStop(0, node.color + '30')
    glow.addColorStop(1, 'transparent')
    ctx.fillStyle = glow
    ctx.fillRect(nx - nodeR * 2, ny - nodeR * 2, nodeR * 4, nodeR * 4)

    // 노드 원
    ctx.beginPath()
    ctx.arc(nx, ny, nodeR, 0, Math.PI * 2)
    ctx.fillStyle = '#0a0a1a'
    ctx.fill()
    ctx.strokeStyle = node.color + 'aa'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 노드 라벨
    ctx.fillStyle = node.color
    ctx.font = `bold ${Math.max(8, cellW * 0.022)}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(node.label, nx, ny - nodeR * 0.2)

    // 노드 이름
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.font = `${Math.max(6, cellW * 0.014)}px sans-serif`
    ctx.fillText(node.name, nx, ny + nodeR * 0.5)
  }

  // 펄스 애니메이션
  for (let i = myData.pulses.length - 1; i >= 0; i--) {
    const p = myData.pulses[i]
    p.t += 0.025
    if (p.t > 1) { myData.pulses.splice(i, 1); continue }

    const px = p.sx + (p.tx - p.sx) * p.t
    const py = p.sy + (p.ty - p.sy) * p.t

    ctx.beginPath()
    ctx.arc(px, py, 3, 0, Math.PI * 2)
    ctx.fillStyle = p.color + Math.round((1 - p.t) * 255).toString(16).padStart(2, '0')
    ctx.fill()
  }

  // 중앙 허브 글로우
  const hubGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, hubR * 2.5)
  hubGlow.addColorStop(0, 'rgba(56, 224, 187, 0.18)')
  hubGlow.addColorStop(1, 'transparent')
  ctx.fillStyle = hubGlow
  ctx.fillRect(cx - hubR * 3, cy - hubR * 3, hubR * 6, hubR * 6)

  // 중앙 허브
  ctx.beginPath()
  ctx.arc(cx, cy, hubR, 0, Math.PI * 2)
  ctx.fillStyle = '#0a1a1a'
  ctx.fill()
  ctx.strokeStyle = 'rgba(56, 224, 187, 0.6)'
  ctx.lineWidth = 2
  ctx.stroke()

  // 허브 텍스트
  ctx.fillStyle = '#38e0bb'
  ctx.font = `bold ${Math.max(9, cellW * 0.026)}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('PageMint', cx, cy - hubR * 0.15)

  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = `${Math.max(7, cellW * 0.016)}px sans-serif`
  ctx.fillText('Orchestrator', cx, cy + hubR * 0.35)
}
