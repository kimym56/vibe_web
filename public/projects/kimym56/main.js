// ─── Mimesis: "The instinct of imitation is implanted in man from childhood."
// Four quadrants, each embodying one sub-project.

function setup(cell) {
  // Staggered text characters
  cell.data.chars = "MIMESIS".split("").map((ch, i) => ({
    ch,
    phase: i * 0.38,         // stagger offset
    flipY: 0,                // 0..1 flip progress
  }));

  // Wiper typography — lines of text-like blocks
  cell.data.wiperBlocks = Array.from({ length: 7 }, (_, i) => ({
    y: 0.12 + i * 0.11,
    width: 0.25 + ((i * 37) % 100) / 250,
    alpha: 0.0,
  }));

  // Yin-yang — arc angles
  cell.data.yinPhase = 0;

  // Page curl corner
  cell.data.curlProgress = 0;
  cell.data.curlDir = 1;
}

// ─── Utilities ──────────────────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * t; }
function easeInOut(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;
  const { chars, wiperBlocks, curlProgress } = myData;

  const f = frame;
  const hw = cellW * 0.5;
  const hh = cellH * 0.5;

  // ── Background: warm paper white ─────────────────────────────────────────
  ctx.fillStyle = "#f5f0eb";
  ctx.fillRect(0, 0, cellW, cellH);

  // Thin cross divider
  ctx.strokeStyle = "rgba(0,0,0,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hw, 0); ctx.lineTo(hw, cellH);
  ctx.moveTo(0, hh); ctx.lineTo(cellW, hh);
  ctx.stroke();

  // ══════════════════════════════════════════════════════════════════════════
  // Q1 — TOP LEFT: iOS Page Curl
  // ══════════════════════════════════════════════════════════════════════════
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, hw, hh);
  ctx.clip();

  // Animated curl progress
  const curl = 0.5 + 0.5 * Math.sin(f * 0.018);
  const cornerX = hw;
  const cornerY = hh;
  const peelX   = hw   - curl * hw * 0.75;
  const peelY   = hh   - curl * hh * 0.75;

  // Page surface (under-page — darker)
  ctx.fillStyle = "#ddd7cf";
  ctx.fillRect(0, 0, hw, hh);

  // Grid lines on under-page
  ctx.strokeStyle = "rgba(0,0,0,0.07)";
  ctx.lineWidth = 0.5;
  for (let gx = 0; gx < hw; gx += hw / 6) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, hh); ctx.stroke();
  }
  for (let gy = 0; gy < hh; gy += hh / 6) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(hw, gy); ctx.stroke();
  }

  // Curling page polygon (triangle folding from bottom-right corner)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(peelX, 0);
  ctx.lineTo(cornerX, peelY);
  ctx.lineTo(cornerX, cornerY);
  // diagonal fold edge
  ctx.lineTo(peelX, cornerY);
  ctx.lineTo(0, cornerY);
  ctx.closePath();
  ctx.fillStyle = "#faf7f4";
  ctx.fill();

  // Shadow along fold diagonal
  const shadowGrad = ctx.createLinearGradient(
    peelX, peelY, peelX + 18, peelY + 18
  );
  shadowGrad.addColorStop(0, "rgba(0,0,0,0.18)");
  shadowGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.moveTo(peelX, 0);
  ctx.lineTo(cornerX, peelY);
  ctx.lineTo(cornerX, peelY + 22);
  ctx.lineTo(peelX, 22);
  ctx.closePath();
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // Curled flap triangle
  ctx.beginPath();
  ctx.moveTo(peelX, 0);
  ctx.lineTo(cornerX, 0);
  ctx.lineTo(cornerX, peelY);
  ctx.closePath();
  const flap = ctx.createLinearGradient(peelX, 0, cornerX, peelY);
  flap.addColorStop(0, "rgba(200,190,180,0.85)");
  flap.addColorStop(1, "rgba(170,160,150,0.55)");
  ctx.fillStyle = flap;
  ctx.fill();

  // Label
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.font = `${Math.max(7, cellH * 0.032)}px 'SF Mono', monospace`;
  ctx.fillText("iOS Page Curl", 10, hh - 10);

  ctx.restore();

  // ══════════════════════════════════════════════════════════════════════════
  // Q2 — TOP RIGHT: Wiper Typography
  // ══════════════════════════════════════════════════════════════════════════
  ctx.save();
  ctx.beginPath();
  ctx.rect(hw, 0, hw, hh);
  ctx.clip();
  ctx.translate(hw, 0);

  // Background
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, hw, hh);

  // Wiper band — sharp moving horizontal reveal line
  const wiperX = ((f * 1.6) % (hw * 1.4)) - hw * 0.2;

  // Text-block rows (revealed left of wiper)
  const rowCount = 8;
  const rowH = hh / (rowCount + 1);
  for (let r = 0; r < rowCount; r++) {
    const ry = (r + 0.5) * rowH;
    const blockW = hw * (0.3 + ((r * 53) % 100) / 200);
    const blockX = hw * 0.08;

    const revealed = clamp((wiperX - blockX) / blockW, 0, 1);

    // Dark unrevealed block
    ctx.fillStyle = "rgba(255,255,255,0.07)";
    ctx.fillRect(blockX, ry - rowH * 0.18, blockW, rowH * 0.36);

    // Bright revealed portion
    if (revealed > 0) {
      ctx.fillStyle = `rgba(255,255,255,${0.75 + 0.2 * Math.sin(f * 0.05 + r)})`;
      ctx.fillRect(blockX, ry - rowH * 0.18, blockW * revealed, rowH * 0.36);
    }
  }

  // Wiper blade
  if (wiperX > 0 && wiperX < hw) {
    const bladeGrad = ctx.createLinearGradient(wiperX - 6, 0, wiperX + 10, 0);
    bladeGrad.addColorStop(0, "rgba(255,255,255,0)");
    bladeGrad.addColorStop(0.4, "rgba(255,255,255,0.9)");
    bladeGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = bladeGrad;
    ctx.fillRect(wiperX - 6, 0, 16, hh);
  }

  // Label
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = `${Math.max(7, cellH * 0.032)}px 'SF Mono', monospace`;
  ctx.fillText("Wiper Typography", 10, hh - 10);

  ctx.restore();

  // ══════════════════════════════════════════════════════════════════════════
  // Q3 — BOTTOM LEFT: Black & White Circle (Yin-Yang)
  // ══════════════════════════════════════════════════════════════════════════
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hh, hw, hh);
  ctx.clip();
  ctx.translate(0, hh);

  ctx.fillStyle = "#f5f0eb";
  ctx.fillRect(0, 0, hw, hh);

  const ycx = hw * 0.5;
  const ycy = hh * 0.5;
  const yR  = Math.min(hw, hh) * 0.34;

  // Slowly rotating phase
  const yPhase = f * 0.02;

  // Draw yin-yang using two half-circles + two small circles
  // Top half: black rotated by phase
  ctx.save();
  ctx.translate(ycx, ycy);
  ctx.rotate(yPhase);

  // Full black circle base
  ctx.beginPath();
  ctx.arc(0, 0, yR, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // White right half
  ctx.beginPath();
  ctx.arc(0, 0, yR, -Math.PI * 0.5, Math.PI * 0.5);
  ctx.fillStyle = "#f5f0eb";
  ctx.fill();

  // White small top bump
  ctx.beginPath();
  ctx.arc(0, -yR * 0.5, yR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f0eb";
  ctx.fill();

  // Black small bottom bump
  ctx.beginPath();
  ctx.arc(0, yR * 0.5, yR * 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  // Inner dots
  ctx.beginPath();
  ctx.arc(0, -yR * 0.5, yR * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#111";
  ctx.fill();

  ctx.beginPath();
  ctx.arc(0, yR * 0.5, yR * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f0eb";
  ctx.fill();

  // Subtle pulse ring
  const pRing = yR * (1.1 + 0.06 * Math.sin(f * 0.04));
  ctx.beginPath();
  ctx.arc(0, 0, pRing, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0,0,0,${0.06 + 0.04 * Math.sin(f * 0.04)})`;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Label
  ctx.fillStyle = "rgba(0,0,0,0.22)";
  ctx.font = `${Math.max(7, cellH * 0.032)}px 'SF Mono', monospace`;
  ctx.fillText("Black & White Circle", 10, hh - 10);

  ctx.restore();

  // ══════════════════════════════════════════════════════════════════════════
  // Q4 — BOTTOM RIGHT: Staggered Text
  // ══════════════════════════════════════════════════════════════════════════
  ctx.save();
  ctx.beginPath();
  ctx.rect(hw, hh, hw, hh);
  ctx.clip();
  ctx.translate(hw, hh);

  ctx.fillStyle = "#0d0d0d";
  ctx.fillRect(0, 0, hw, hh);

  const word = "MIMESIS";
  const fontSize = Math.min(hw / (word.length * 0.72), hh * 0.28);
  ctx.font = `700 ${fontSize}px 'Arial Black', sans-serif`;
  ctx.textBaseline = "middle";

  const totalW = word.split("").reduce((acc, ch) => {
    return acc + ctx.measureText(ch).width;
  }, 0);
  let tx = (hw - totalW) * 0.5;
  const ty = hh * 0.5;

  word.split("").forEach((ch, i) => {
    const staggerPhase = (f * 0.04) - i * 0.55;
    // flip: -1..1 via sin, mapped to vertical skewY-like offset
    const flip = Math.sin(staggerPhase);
    const flipAbs = Math.abs(flip);
    const scaleY = 1 - flipAbs * 0.85;          // squash during flip
    const transY = flipAbs * fontSize * 0.1;     // slight vertical drift

    // Color shift during flip
    const hue = (i * 40 + f * 1.5) % 360;
    const bright = flip > 0 ? "#ffffff" : `hsl(${hue},90%,68%)`;

    const w = ctx.measureText(ch).width;

    ctx.save();
    ctx.translate(tx + w * 0.5, ty + transY);
    ctx.scale(1, scaleY);
    ctx.fillStyle = bright;
    ctx.globalAlpha = 0.85 + 0.15 * (1 - flipAbs);
    ctx.fillText(ch, -w * 0.5, 0);
    ctx.restore();

    // Underline dot
    ctx.beginPath();
    ctx.arc(tx + w * 0.5, ty + fontSize * 0.62, 2 * (1 - flipAbs * 0.7), 0, Math.PI * 2);
    ctx.fillStyle = bright;
    ctx.globalAlpha = 0.4 * (1 - flipAbs);
    ctx.fill();
    ctx.globalAlpha = 1;

    tx += w;
  });

  // Label
  ctx.fillStyle = "rgba(255,255,255,0.22)";
  ctx.font = `${Math.max(7, cellH * 0.032)}px 'SF Mono', monospace`;
  ctx.fillText("Staggered Text", 10, hh - 10);

  ctx.restore();

  // ══════════════════════════════════════════════════════════════════════════
  // Center mark — subtle Mimesis logo intersection
  // ══════════════════════════════════════════════════════════════════════════
  const markR = Math.min(cellW, cellH) * 0.022;
  const markPulse = 0.7 + 0.3 * Math.sin(f * 0.06);
  ctx.beginPath();
  ctx.arc(hw, hh, markR * markPulse, 0, Math.PI * 2);
  ctx.fillStyle = "#f5f0eb";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.15)";
  ctx.lineWidth = 1;
  ctx.stroke();
}
