// MNIST Clustering Visualization
// 1000 data points in 3D space converge into 10 clusters through simulated training epochs
// Mimics a slow-converging model: wandering → loose grouping → tight clusters

function setup(cell) {
  const NUM_POINTS = 1000
  const NUM_CLASSES = 10

  // Neon color palette for each digit class
  const palette = [
    '#00fff2', // 0 - cyan
    '#ff00e4', // 1 - magenta
    '#aaff00', // 2 - lime
    '#ff6600', // 3 - orange
    '#6644ff', // 4 - purple
    '#ff0066', // 5 - hot pink
    '#00ff88', // 6 - mint
    '#ffdd00', // 7 - yellow
    '#0088ff', // 8 - blue
    '#ff4444', // 9 - red
  ]

  // Generate cluster target positions in 3D (spread on a sphere-ish layout)
  const targets = []
  for (let c = 0; c < NUM_CLASSES; c++) {
    const phi = (c / NUM_CLASSES) * Math.PI * 2
    const theta = Math.PI * 0.3 + (c % 3) * Math.PI * 0.2
    targets.push({
      x: Math.cos(phi) * Math.sin(theta) * 0.35,
      y: (c % 2 === 0 ? -1 : 1) * (0.1 + (c % 5) * 0.06),
      z: Math.sin(phi) * Math.sin(theta) * 0.35,
    })
  }

  // Create points with random initial positions
  const points = []
  for (let i = 0; i < NUM_POINTS; i++) {
    const cls = i % NUM_CLASSES
    // Each point has a "stubbornness" — some converge faster, some resist longer
    const stubbornness = 0.3 + Math.random() * 0.7
    // Random wander direction (simulates noisy gradients)
    const wanderPhase = Math.random() * Math.PI * 2
    points.push({
      // Random starting position in 3D cube
      x: (Math.random() - 0.5) * 0.9,
      y: (Math.random() - 0.5) * 0.9,
      z: (Math.random() - 0.5) * 0.9,
      // Target position (cluster center + per-point jitter)
      tx: targets[cls].x + (Math.random() - 0.5) * 0.08,
      ty: targets[cls].y + (Math.random() - 0.5) * 0.08,
      tz: targets[cls].z + (Math.random() - 0.5) * 0.08,
      cls: cls,
      stubbornness: stubbornness,
      wanderPhase: wanderPhase,
    })
  }

  cell.data.points = points
  cell.data.palette = palette
  cell.data.epoch = 0
  cell.data.maxEpoch = 800 // much slower convergence
  cell.data.holdFrames = 200 // pause after convergence before reset
  cell.data.holdCounter = 0
  cell.data.cameraAngle = 0
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world
  const { points, palette, maxEpoch } = myData

  // Reset cycle: converge → hold → scatter → reconverge
  if (myData.epoch >= maxEpoch) {
    myData.holdCounter++
    if (myData.holdCounter >= myData.holdFrames) {
      // Reset: scatter points to new random positions
      myData.epoch = 0
      myData.holdCounter = 0
      for (let i = 0; i < points.length; i++) {
        points[i].x = (Math.random() - 0.5) * 0.9
        points[i].y = (Math.random() - 0.5) * 0.9
        points[i].z = (Math.random() - 0.5) * 0.9
        points[i].wanderPhase = Math.random() * Math.PI * 2
      }
    }
  }

  // Epoch progress: 0 → 1
  myData.epoch = Math.min(myData.epoch + 1, maxEpoch)
  const progress = myData.epoch / maxEpoch

  // S-curve easing — slow start, slow end, most movement in the middle
  // Simulates: early confusion → rapid learning → fine-tuning plateau
  const ease = 1 / (1 + Math.exp(-12 * (progress - 0.5)))

  // Trail fade: heavy trails early (shows trajectories), fades to clean
  const trailAlpha = 0.03 + ease * 0.9
  ctx.fillStyle = `rgba(8, 6, 18, ${trailAlpha})`
  ctx.fillRect(0, 0, cellW, cellH)

  // Camera rotation
  const rotSpeed = 0.003 + ease * 0.002
  myData.cameraAngle += rotSpeed
  const camAngle = myData.cameraAngle
  const camTilt = 0.4

  const cosA = Math.cos(camAngle)
  const sinA = Math.sin(camAngle)
  const cosT = Math.cos(camTilt)
  const sinT = Math.sin(camTilt)

  // Perspective projection
  const fov = 2.0
  const centerX = cellW / 2
  const centerY = cellH / 2
  const scale = Math.min(cellW, cellH) * 0.8

  // Update point positions
  for (let i = 0; i < points.length; i++) {
    const p = points[i]

    // Per-point progress: stubborn points lag behind
    const pointProgress = Math.max(0, ease - (1 - p.stubbornness) * 0.3)
    const lerpFactor = 0.002 + pointProgress * 0.025

    // Early epochs: add wander noise (simulates noisy gradient descent)
    const wanderStrength = (1 - ease) * 0.003
    const wanderX = Math.sin(frame * 0.02 + p.wanderPhase) * wanderStrength
    const wanderY = Math.cos(frame * 0.025 + p.wanderPhase * 1.3) * wanderStrength
    const wanderZ = Math.sin(frame * 0.018 + p.wanderPhase * 0.7) * wanderStrength

    p.x += (p.tx - p.x) * lerpFactor + wanderX
    p.y += (p.ty - p.y) * lerpFactor + wanderY
    p.z += (p.tz - p.z) * lerpFactor + wanderZ
  }

  // Project and depth-sort
  const projected = []
  for (let i = 0; i < points.length; i++) {
    const p = points[i]

    // Rotate around Y axis (camera orbit)
    const rx = p.x * cosA - p.z * sinA
    const rz = p.x * sinA + p.z * cosA

    // Tilt (rotate around X axis)
    const ry = p.y * cosT - rz * sinT
    const rz2 = p.y * sinT + rz * cosT

    // Perspective divide
    const depth = rz2 + fov
    if (depth < 0.1) continue
    const px = (rx / depth) * scale + centerX
    const py = (ry / depth) * scale + centerY

    projected.push({
      x: px,
      y: py,
      depth: depth,
      cls: p.cls,
    })
  }

  // Sort far to near
  projected.sort((a, b) => b.depth - a.depth)

  // Draw points
  for (let i = 0; i < projected.length; i++) {
    const p = projected[i]
    const depthNorm = (p.depth - 0.5) / (fov + 0.5)
    const size = (1.2 + (1 - depthNorm) * 2.5) * (cellW / 300)
    const alpha = 0.3 + (1 - depthNorm) * 0.6

    const color = palette[p.cls]
    const r = parseInt(color.slice(1, 3), 16)
    const g = parseInt(color.slice(3, 5), 16)
    const b = parseInt(color.slice(5, 7), 16)

    // Glow effect
    ctx.shadowBlur = size * 3
    ctx.shadowColor = color

    ctx.beginPath()
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`
    ctx.fill()
  }

  // Reset shadow
  ctx.shadowBlur = 0

  // Epoch counter (fades out as training completes)
  if (progress < 1) {
    const epochNum = Math.floor(progress * 100)
    const textAlpha = 0.4 * (1 - ease)
    if (textAlpha > 0.02) {
      ctx.fillStyle = `rgba(255, 255, 255, ${textAlpha})`
      ctx.font = `${Math.max(10, cellW * 0.035)}px monospace`
      ctx.textAlign = 'left'
      ctx.fillText(`epoch ${epochNum}`, cellW * 0.04, cellH * 0.95)
    }
  }
}
