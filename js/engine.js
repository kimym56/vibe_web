// 프로젝트 코드 실행 엔진 (소켓 없이 정적 실행)

export function executeCode(code, ctx, world, playerState) {
  try {
    if (playerState.needsSetup) {
      playerState.needsSetup = false
      playerState.data = {}

      const cell = {
        width: world.cellW,
        height: world.cellH,
        data: playerState.data
      }

      const setupFn = new Function('cell', `
        ${code}
        if (typeof setup === 'function') setup(cell);
      `)

      try {
        setupFn(cell)
        playerState.data = cell.data
      } catch (e) {
        return { error: `setup error: ${e.message}` }
      }
    }

    world.myData = playerState.data

    const drawFn = new Function('ctx', 'world', `
      ${code}
      if (typeof draw === 'function') draw(ctx, world);
    `)

    drawFn(ctx, world)
    return { error: null }
  } catch (e) {
    return { error: e.message }
  }
}
