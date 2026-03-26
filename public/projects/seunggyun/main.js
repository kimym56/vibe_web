function setup(cell) {
  const fishCount = 6;
  cell.data.fishes = [];
  for (let i = 0; i < fishCount; i++) {
    cell.data.fishes.push({
      x: Math.random() * cell.width,
      y: cell.height * 0.2 + Math.random() * cell.height * 0.6,
      size: 0.03 + Math.random() * 0.04,
      speed: 0.3 + Math.random() * 0.5,
      hue: 180 + Math.random() * 60,
      wobbleOffset: Math.random() * Math.PI * 2,
      dir: Math.random() > 0.5 ? 1 : -1,
    });
  }
  cell.data.bubbles = [];
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;

  // ocean gradient background
  const grad = ctx.createLinearGradient(0, 0, 0, cellH);
  grad.addColorStop(0, "#0a1628");
  grad.addColorStop(0.5, "#0d2847");
  grad.addColorStop(1, "#103050");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cellW, cellH);

  // subtle caustics
  for (let i = 0; i < 5; i++) {
    const cx = cellW * (0.15 + i * 0.18) + Math.sin(frame * 0.012 + i) * cellW * 0.05;
    const cy = cellH * 0.3 + Math.cos(frame * 0.015 + i * 2) * cellH * 0.15;
    const r = cellW * 0.12;
    const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    cg.addColorStop(0, "rgba(80,180,220,0.06)");
    cg.addColorStop(1, "rgba(80,180,220,0)");
    ctx.fillStyle = cg;
    ctx.fillRect(0, 0, cellW, cellH);
  }

  // bubbles
  if (frame % 20 === 0) {
    myData.bubbles.push({
      x: cellW * (0.1 + Math.random() * 0.8),
      y: cellH,
      r: cellW * (0.005 + Math.random() * 0.01),
      speed: 0.3 + Math.random() * 0.5,
    });
  }
  for (let i = myData.bubbles.length - 1; i >= 0; i--) {
    const b = myData.bubbles[i];
    b.y -= b.speed;
    b.x += Math.sin(frame * 0.05 + i) * 0.3;
    if (b.y < -10) {
      myData.bubbles.splice(i, 1);
      continue;
    }
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(150,220,255,0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // draw fishes
  myData.fishes.forEach(function (fish) {
    // move
    fish.x += fish.speed * fish.dir;
    // wrap around
    if (fish.dir === 1 && fish.x > cellW + cellW * fish.size * 3) {
      fish.x = -cellW * fish.size * 3;
    }
    if (fish.dir === -1 && fish.x < -cellW * fish.size * 3) {
      fish.x = cellW + cellW * fish.size * 3;
    }
    // wobble vertically
    const wobbleY = Math.sin(frame * 0.04 + fish.wobbleOffset) * cellH * 0.03;
    const fy = fish.y + wobbleY;

    const s = cellW * fish.size;

    ctx.save();
    ctx.translate(fish.x, fy);
    ctx.scale(fish.dir, 1);

    // tail
    const tailSwing = Math.sin(frame * 0.1 + fish.wobbleOffset) * s * 0.4;
    ctx.beginPath();
    ctx.moveTo(-s * 1.2, 0);
    ctx.lineTo(-s * 1.8, -s * 0.5 + tailSwing);
    ctx.lineTo(-s * 1.8, s * 0.5 + tailSwing);
    ctx.closePath();
    ctx.fillStyle = "hsl(" + (fish.hue + 20) + ",70%,55%)";
    ctx.fill();

    // body
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 1.2, s * 0.6, 0, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(" + fish.hue + ",65%,55%)";
    ctx.fill();

    // belly highlight
    ctx.beginPath();
    ctx.ellipse(s * 0.1, s * 0.15, s * 0.8, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fillStyle = "hsl(" + fish.hue + ",60%,72%)";
    ctx.fill();

    // dorsal fin
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.55);
    ctx.lineTo(s * 0.3, -s * 0.9);
    ctx.lineTo(s * 0.5, -s * 0.5);
    ctx.closePath();
    ctx.fillStyle = "hsl(" + (fish.hue + 10) + ",60%,50%)";
    ctx.fill();

    // eye
    ctx.beginPath();
    ctx.arc(s * 0.6, -s * 0.1, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(s * 0.65, -s * 0.1, s * 0.07, 0, Math.PI * 2);
    ctx.fillStyle = "#111";
    ctx.fill();

    ctx.restore();
  });

  // water surface ripples
  ctx.strokeStyle = "rgba(120,200,255,0.12)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    for (let x = 0; x <= cellW; x += 4) {
      const y = cellH * 0.03 * (i + 1) + Math.sin(x * 0.02 + frame * 0.03 + i) * cellH * 0.01;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
