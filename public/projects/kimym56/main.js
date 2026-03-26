function setup(cell) {
  cell.data.x = cell.width / 2;
  cell.data.y = cell.height / 2;
}

function draw(ctx, world) {
  const { cellW, cellH, frame, myData } = world;
  ctx.fillStyle = "#1a1a2e";
  ctx.fillRect(0, 0, cellW, cellH);

  const x = myData.x + Math.sin(frame * 0.03) * 50;
  const y = myData.y + Math.cos(frame * 0.02) * 30;
  ctx.beginPath();
  ctx.arc(x, y, 20, 0, Math.PI * 2);
  ctx.fillStyle = `hsl(${frame % 360}, 70%, 60%)`;
  ctx.fill();
}
