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

  const qW = hw, qH = hh;

  // Single paper background style for both top and under-page
  function drawPaper() {
    ctx.fillStyle = "#faf7f4";
    ctx.fillRect(0, 0, qW, qH);
    ctx.strokeStyle = "rgba(0,0,0,0.05)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < qW; x += qW/6) { ctx.moveTo(x, 0); ctx.lineTo(x, qH); }
    for (let y = 0; y < qH; y += qH/6) { ctx.moveTo(0, y); ctx.lineTo(qW, y); }
    ctx.stroke();
  }

  // Yoyo loop: page curls and then un-curls back to the corner
  const tp = 0.5 - 0.5 * Math.cos(f * 0.02); 
  const tSmooth = tp;

  const diag = Math.sqrt(qW * qW + qH * qH);
  // Peel about 85% of the way and return
  const maxDrag = diag * 0.85;

  const dragX = qW - (qW / diag) * (tSmooth * maxDrag);
  const dragY = qH - (qH / diag) * (tSmooth * maxDrag);

  const dvx = dragX - qW, dvy = dragY - qH;
  const dvLen = Math.sqrt(dvx * dvx + dvy * dvy);

  // 1) Draw Under-page (what is revealed)
  drawPaper();

  if (dvLen >= 2) {
    const dnx = dvx / dvLen, dny = dvy / dvLen;
    const flx = -dny, fly = dnx;
    const fmx = (qW + dragX) * 0.5, fmy = (qH + dragY) * 0.5;

    const foldPts = [];
    const edges = [[0,0,qW,0],[qW,0,qW,qH],[qW,qH,0,qH],[0,qH,0,0]];
    for (const [ax,ay,bx,by] of edges) {
      const edx = bx-ax, edy = by-ay;
      const den = flx*edy - fly*edx;
      if (Math.abs(den) < 1e-8) continue;
      const s = ((ax-fmx)*edy - (ay-fmy)*edx) / den;
      const u = ((ax-fmx)*fly - (ay-fmy)*flx) / den;
      if (u > -0.001 && u < 1.001)
        foldPts.push({ x: fmx + s*flx, y: fmy + s*fly });
    }
    const uniq = [];
    for (const pt of foldPts)
      if (!uniq.some(q => Math.abs(q.x-pt.x)<0.5 && Math.abs(q.y-pt.y)<0.5)) uniq.push(pt);

    if (uniq.length >= 2) {
      uniq.sort((a,b)=>(a.x-fmx)*flx+(a.y-fmy)*fly - ((b.x-fmx)*flx+(b.y-fmy)*fly));
      const fp1 = uniq[0], fp2 = uniq[1];

      function clipToPeelSide(positive) {
        const corners = [{x:0,y:0},{x:qW,y:0},{x:qW,y:qH},{x:0,y:qH}];
        const out = [];
        function inside(pt) {
          const d = (pt.x-fmx)*dnx + (pt.y-fmy)*dny;
          return positive ? d >= 0 : d <= 0;
        }
        function intersect(a, b) {
          const dx=b.x-a.x, dy=b.y-a.y;
          const num = (fmx-a.x)*dnx + (fmy-a.y)*dny;
          const den = dx*dnx + dy*dny;
          if (Math.abs(den)<1e-8) return a;
          const t2 = num/den;
          return { x: a.x+t2*dx, y: a.y+t2*dy };
        }
        for (let i=0; i<corners.length; i++) {
          const curr = corners[i], prev = corners[(i-1+4)%4];
          if (inside(curr)) { if (!inside(prev)) out.push(intersect(prev,curr)); out.push(curr); }
          else if (inside(prev)) out.push(intersect(prev,curr));
        }
        return out;
      }

      // Soft cast shadow on under-page
      ctx.save();
      const spUnder = clipToPeelSide(true);
      if (spUnder.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(spUnder[0].x, spUnder[0].y);
        for (let i=1;i<spUnder.length;i++) ctx.lineTo(spUnder[i].x, spUnder[i].y);
        ctx.closePath();
        const sg = ctx.createLinearGradient(fmx, fmy, qW, qH);
        sg.addColorStop(0,   `rgba(0,0,0,${0.35 * Math.min(1, tSmooth*2)})`);
        sg.addColorStop(0.4, `rgba(0,0,0,${0.15 * Math.min(1, tSmooth*2)})`);
        sg.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.fillStyle = sg;
        ctx.fill();
      }
      ctx.restore();

      // Static front page (non-peeled)
      ctx.save();
      const spStatic = clipToPeelSide(false);
      if (spStatic.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(spStatic[0].x, spStatic[0].y);
        for (let i=1;i<spStatic.length;i++) ctx.lineTo(spStatic[i].x, spStatic[i].y);
        ctx.closePath();
        ctx.clip(); // Mask the drawing to just the unpeeled area
        
        drawPaper();
        
        // Edge shadow where page bends
        const eg = ctx.createLinearGradient(fp1.x, fp1.y, fp1.x - dnx*22, fp1.y - dny*22);
        eg.addColorStop(0, `rgba(0,0,0,${0.15 * Math.min(1, tSmooth*2)})`);
        eg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = eg;
        ctx.fillRect(0, 0, qW, qH);
      }
      ctx.restore();

      // Back face of curling page (cylindrical lighting)
      ctx.save();
      const spBack = clipToPeelSide(true);
      if (spBack.length >= 2) {
        ctx.beginPath();
        ctx.moveTo(spBack[0].x, spBack[0].y);
        for (let i=1;i<spBack.length;i++) ctx.lineTo(spBack[i].x, spBack[i].y);
        ctx.closePath();
        const cylGrad = ctx.createLinearGradient(
          fmx, fmy,
          fmx + dnx * dvLen * 0.9, fmy + dny * dvLen * 0.9
        );
        cylGrad.addColorStop(0.00, "rgba(248,243,238,0.97)"); 
        cylGrad.addColorStop(0.08, "rgba(195,186,176,0.97)"); 
        cylGrad.addColorStop(0.35, "rgba(162,154,144,0.95)"); 
        cylGrad.addColorStop(0.65, "rgba(178,170,161,0.90)"); 
        cylGrad.addColorStop(1.00, "rgba(205,197,188,0.82)"); 
        ctx.fillStyle = cylGrad;
        ctx.fill();
      }
      ctx.restore();

      // Crease glow
      ctx.save();
      ctx.lineCap = "round";
      const alphaPulse = Math.min(1, tSmooth*3); // fully solid after just a little movement
      ctx.beginPath(); ctx.moveTo(fp1.x, fp1.y); ctx.lineTo(fp2.x, fp2.y);
      ctx.strokeStyle = `rgba(255,255,255,${0.28 * alphaPulse})`;
      ctx.lineWidth = 18; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fp1.x, fp1.y); ctx.lineTo(fp2.x, fp2.y);
      ctx.strokeStyle = `rgba(255,255,255,${0.50 * alphaPulse})`;
      ctx.lineWidth = 7; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(fp1.x, fp1.y); ctx.lineTo(fp2.x, fp2.y);
      ctx.strokeStyle = `rgba(255,255,255,${0.88 * alphaPulse})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    } else {
      // If the page is peeled entirely off the boundary, the underpage covers everything.
      // And since drawPaper() is already the underpage, we don't need to do anything else.
    }
  } else {
    drawPaper();
  }

  // Label
  ctx.fillStyle = "rgba(0,0,0,0.30)";
  ctx.font = `600 ${Math.max(9, cellH * 0.035)}px 'SF Pro', sans-serif`;
  ctx.fillText("iOS Page Curl", 12, qH - 12);
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
