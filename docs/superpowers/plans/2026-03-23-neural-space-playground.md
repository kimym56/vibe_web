# Neural Space Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive deep learning playground that visualizes how data points transform through each network layer as 3D point clouds in the browser.

**Architecture:** Standalone Vite + Vanilla JS app. TensorFlow.js handles model training. Canvas 2D renders 3D-projected point clouds per layer. State is managed through a central `appState` object that controls and UI read/write. A render loop drives animation, and a separate training loop runs epochs on requestAnimationFrame ticks.

**Tech Stack:** TensorFlow.js, Canvas 2D, Vite, Vanilla JS, Vercel

**Spec:** `docs/superpowers/specs/2026-03-23-neural-space-playground-design.md`

---

## File Structure

```
neural-space/                    # New directory in projects root (sibling to vibe_web)
├── index.html                   # Entry point — layout shell
├── package.json                 # Vite + TensorFlow.js deps
├── vite.config.js               # Vite config
├── src/
│   ├── main.js                  # App entry — wires everything together, render loop
│   ├── state.js                 # Central app state object + constants
│   ├── datasets.js              # 5 dataset generators (spiral, circle, xor, moons, clusters)
│   ├── model.js                 # TensorFlow.js model build, train step, activation extraction
│   ├── renderer.js              # 3D point cloud projection + Canvas 2D drawing
│   ├── controls.js              # Sidebar UI — reads/writes state, rebuilds model on change
│   ├── timeline.js              # Epoch slider + snapshot storage/retrieval
│   ├── loss-chart.js            # Loss line chart (Canvas 2D)
│   └── style.css                # All styles — dark neon theme
└── tests/
    ├── datasets.test.js         # Dataset shape/label validation
    ├── model.test.js            # Model build/train/activation extraction
    └── renderer.test.js         # Projection math validation
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `neural-space/package.json`
- Create: `neural-space/vite.config.js`
- Create: `neural-space/index.html`
- Create: `neural-space/src/main.js`
- Create: `neural-space/src/style.css`
- Create: `neural-space/src/state.js`

- [ ] **Step 1: Create project directory, git init, and package.json**

```bash
mkdir -p /Users/shuzzi/projects/neural-space/src
mkdir -p /Users/shuzzi/projects/neural-space/tests
cd /Users/shuzzi/projects/neural-space
git init
```

Create `.gitignore`:
```
node_modules/
dist/
```

```json
// package.json
{
  "name": "neural-space",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@tensorflow/tfjs": "^4.22.0"
  },
  "devDependencies": {
    "vite": "^5.4.0",
    "vitest": "^2.1.0"
  }
}
```

- [ ] **Step 2: Create vite.config.js**

```javascript
// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 3001 },
  test: { environment: 'node' }
})
```

- [ ] **Step 3: Create state.js with constants and initial state**

```javascript
// src/state.js
export const CONSTANTS = {
  NUM_POINTS: 200,
  MAX_EPOCHS: 200,
  SNAPSHOT_INTERVAL: 5,
  MAX_HIDDEN_LAYERS: 4,
  MIN_HIDDEN_LAYERS: 1,
  MIN_NODES: 2,
  MAX_NODES: 8,
}

export function createState() {
  return {
    dataset: 'spiral',
    activation: 'relu',
    learningRate: 0.01,
    hiddenLayers: [4, 3],       // array of node counts per hidden layer
    speed: 1,                    // 1, 2, or 5
    isTraining: false,
    epoch: 0,
    maxEpochs: CONSTANTS.MAX_EPOCHS,
    // Runtime data (set during training)
    data: null,                  // { xs: Float32Array, ys: Float32Array, labels: Int32Array }
    model: null,                 // tf.Sequential
    layerModels: [],             // sub-models for activation extraction
    activations: [],             // current epoch activations per layer
    snapshots: [],               // [{epoch, activations, loss}]
    lossHistory: [],             // [number]
    cameraAngle: 0,
  }
}
```

- [ ] **Step 4: Create index.html layout shell**

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neural Space</title>
  <link rel="stylesheet" href="/src/style.css">
</head>
<body>
  <div id="app">
    <aside id="controls"></aside>
    <main id="main">
      <div id="timeline"></div>
      <div id="pipeline"></div>
      <div id="loss-chart-container">
        <canvas id="loss-canvas"></canvas>
      </div>
    </main>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>
```

- [ ] **Step 5: Create style.css with layout and neon theme**

Full CSS: dark background (#0a0a1a), sidebar 200px fixed left, main area flex column (timeline 40px, pipeline flex-1, loss-chart 50px). Neon color variables. Button/slider styles matching the mockup.

- [ ] **Step 6: Create main.js entry stub**

```javascript
// src/main.js
import { createState } from './state.js'
import './style.css'

const state = createState()
console.log('Neural Space initialized', state)
```

- [ ] **Step 7: Install dependencies and verify dev server**

```bash
cd /Users/shuzzi/projects/neural-space
npm install
npm run dev
```

Expected: Vite dev server on http://localhost:3001, blank dark page loads.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: scaffold Neural Space project with Vite + state"
```

---

### Task 2: Dataset Generators

**Files:**
- Create: `neural-space/src/datasets.js`
- Create: `neural-space/tests/datasets.test.js`

- [ ] **Step 1: Write dataset tests**

```javascript
// tests/datasets.test.js
import { describe, it, expect } from 'vitest'
import { generateDataset } from '../src/datasets.js'

describe('generateDataset', () => {
  const types = ['spiral', 'circle', 'xor', 'moons', 'clusters']

  types.forEach(type => {
    it(`${type}: returns 200 points with xs[200][2] and labels[200] of 0 or 1`, () => {
      const { xs, labels } = generateDataset(type, 200)
      expect(xs.length).toBe(200)
      expect(labels.length).toBe(200)
      xs.forEach(p => expect(p.length).toBe(2))
      labels.forEach(l => expect(l === 0 || l === 1).toBe(true))
    })

    it(`${type}: has both classes present`, () => {
      const { labels } = generateDataset(type, 200)
      expect(labels.includes(0)).toBe(true)
      expect(labels.includes(1)).toBe(true)
    })
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
cd /Users/shuzzi/projects/neural-space && npx vitest run tests/datasets.test.js
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement datasets.js**

```javascript
// src/datasets.js
export function generateDataset(type, n = 200) {
  const generators = { spiral, circle, xor, moons, clusters }
  return generators[type](n)
}

function spiral(n) {
  const xs = [], labels = []
  const half = n / 2
  for (let i = 0; i < n; i++) {
    const cls = i < half ? 0 : 1
    const idx = i % half
    const angle = (idx / half) * Math.PI * 4 + cls * Math.PI
    const r = idx / half
    const noise = () => (Math.random() - 0.5) * 0.15
    xs.push([r * Math.cos(angle) + noise(), r * Math.sin(angle) + noise()])
    labels.push(cls)
  }
  return { xs, labels }
}

function circle(n) {
  const xs = [], labels = []
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2
    const cls = i < n / 2 ? 0 : 1
    const r = cls === 0 ? Math.random() * 0.4 : 0.5 + Math.random() * 0.5
    xs.push([r * Math.cos(angle), r * Math.sin(angle)])
    labels.push(cls)
  }
  return { xs, labels }
}

function xor(n) {
  const xs = [], labels = []
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 2 - 1
    const y = Math.random() * 2 - 1
    xs.push([x, y])
    labels.push((x > 0) !== (y > 0) ? 1 : 0)
  }
  return { xs, labels }
}

function moons(n) {
  const xs = [], labels = []
  const half = n / 2
  for (let i = 0; i < n; i++) {
    const noise = () => (Math.random() - 0.5) * 0.15
    if (i < half) {
      const angle = (i / half) * Math.PI
      xs.push([Math.cos(angle) + noise(), Math.sin(angle) + noise()])
      labels.push(0)
    } else {
      const angle = ((i - half) / half) * Math.PI
      xs.push([1 - Math.cos(angle) + noise(), 1 - Math.sin(angle) - 0.5 + noise()])
      labels.push(1)
    }
  }
  return { xs, labels }
}

function clusters(n) {
  const xs = [], labels = []
  const half = n / 2
  const centers = [[-0.5, -0.5], [0.5, 0.5]]
  for (let i = 0; i < n; i++) {
    const cls = i < half ? 0 : 1
    const [cx, cy] = centers[cls]
    const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) * 0.27
    xs.push([cx + gauss(), cy + gauss()])
    labels.push(cls)
  }
  return { xs, labels }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run tests/datasets.test.js
```

Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/datasets.js tests/datasets.test.js
git commit -m "feat: add 5 dataset generators with tests"
```

---

### Task 3: TensorFlow.js Model

**Files:**
- Create: `neural-space/src/model.js`
- Create: `neural-space/tests/model.test.js`

- [ ] **Step 1: Write model tests**

```javascript
// tests/model.test.js
import { describe, it, expect } from 'vitest'
import { buildModel, extractActivations } from '../src/model.js'

// TF.js in node needs backend
import '@tensorflow/tfjs'

describe('buildModel', () => {
  it('creates model with correct layer count', () => {
    const { model, layerModels } = buildModel({
      hiddenLayers: [4, 3],
      activation: 'relu',
      learningRate: 0.01,
    })
    // input dense(4) + dense(3) + output dense(1) = 3 dense layers
    // layerModels includes one per dense layer
    expect(model.layers.length).toBe(3)
    expect(layerModels.length).toBe(3)
  })
})

describe('extractActivations', () => {
  it('returns arrays matching point count per layer', () => {
    const { model, layerModels } = buildModel({
      hiddenLayers: [4, 3],
      activation: 'relu',
      learningRate: 0.01,
    })
    const xs = Array.from({ length: 10 }, () => [Math.random(), Math.random()])
    const acts = extractActivations(layerModels, xs)
    expect(acts.length).toBe(3) // hidden1, hidden2, output
    expect(acts[0].length).toBe(10) // 10 points
    expect(acts[0][0].length).toBe(4) // 4 nodes in hidden1
    expect(acts[1][0].length).toBe(3) // 3 nodes in hidden2
    expect(acts[2][0].length).toBe(1) // 1 output node
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run tests/model.test.js
```

Note: If TF.js tests fail with backend errors, add `@tensorflow/tfjs-node` as a devDependency or switch vitest environment to `jsdom`.

- [ ] **Step 3: Implement model.js**

```javascript
// src/model.js
import * as tf from '@tensorflow/tfjs'

export function buildModel({ hiddenLayers, activation, learningRate }) {
  const model = tf.sequential()

  hiddenLayers.forEach((nodes, i) => {
    model.add(tf.layers.dense({
      units: nodes,
      activation,
      inputShape: i === 0 ? [2] : undefined,
    }))
  })

  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))

  model.compile({
    optimizer: tf.train.adam(learningRate),
    loss: 'binaryCrossentropy',
    metrics: ['accuracy'],
  })

  // Create sub-models for activation extraction (one per dense layer)
  const layerModels = model.layers.map(layer =>
    tf.model({ inputs: model.input, outputs: layer.output })
  )

  return { model, layerModels }
}

export async function trainStep(model, xs, ys) {
  const xsTensor = tf.tensor2d(xs)
  const ysTensor = tf.tensor2d(ys.map(y => [y]))

  const result = await model.fit(xsTensor, ysTensor, {
    epochs: 1,
    batchSize: xs.length, // full batch
    verbose: 0,
  })

  xsTensor.dispose()
  ysTensor.dispose()

  return result.history.loss[0]
}

export function extractActivations(layerModels, xs) {
  return tf.tidy(() => {
    const input = tf.tensor2d(xs)
    return layerModels.map(m => m.predict(input).arraySync())
  })
}

export function disposeModel(model, layerModels) {
  layerModels.forEach(m => m.dispose())
  model.dispose()
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run tests/model.test.js
```

- [ ] **Step 5: Commit**

```bash
git add src/model.js tests/model.test.js
git commit -m "feat: add TF.js model builder with activation extraction"
```

---

### Task 4: 3D Point Cloud Renderer

**Files:**
- Create: `neural-space/src/renderer.js`
- Create: `neural-space/tests/renderer.test.js`

- [ ] **Step 1: Write projection math tests**

```javascript
// tests/renderer.test.js
import { describe, it, expect } from 'vitest'
import { normalizeActivations, project3D } from '../src/renderer.js'

describe('normalizeActivations', () => {
  it('maps values to [-1, 1] range', () => {
    const data = [[0, 10], [5, 20], [10, 30]]
    const norm = normalizeActivations(data)
    expect(norm[0]).toEqual([-1, -1])
    expect(norm[1]).toEqual([0, 0])
    expect(norm[2]).toEqual([1, 1])
  })

  it('handles single-value dimension (all same)', () => {
    const data = [[5], [5], [5]]
    const norm = normalizeActivations(data)
    norm.forEach(p => expect(p[0]).toBe(0))
  })
})

describe('project3D', () => {
  it('returns x, y, depth for a 3D point', () => {
    const result = project3D(0, 0, 0, { angle: 0, tilt: 0.4, fov: 2, width: 400, height: 300 })
    expect(result).toHaveProperty('x')
    expect(result).toHaveProperty('y')
    expect(result).toHaveProperty('depth')
    expect(typeof result.x).toBe('number')
  })
})
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npx vitest run tests/renderer.test.js
```

- [ ] **Step 3: Implement renderer.js**

Core functions:
- `normalizeActivations(data)` — per-dimension min-max to [-1, 1]
- `project3D(x, y, z, camera)` — perspective projection (same math as shuzzi-mnist/main.js)
- `mapToCoords(point, numDims)` — 1D→strip, 2D→flat, 3D→direct, 4+→first 3
- `renderPanel(ctx, x, y, w, h, activations, labels, camera, layerName, numNodes)` — draws one layer panel

The render function:
1. Clear panel area with dark bg
2. Draw layer label (top-left) and dimension info (top-right, e.g., "2D", "4 nodes")
3. Normalize activations
4. Map to 3D coords via `mapToCoords`
5. Project all points via `project3D`
6. Sort by depth (far to near)
7. Draw each point with neon color (cyan class 0, magenta class 1), glow, depth-based size/alpha

Also export `renderInputPanel(ctx, x, y, w, h, rawData, labels, camera)` — renders the raw 2D dataset as a flat scatter (z=0, same 3D viewport). This is always 2 dimensions, so uses the 2-node rule (z=0, flat plane).

- [ ] **Step 4: Run tests — verify they pass**

```bash
npx vitest run tests/renderer.test.js
```

- [ ] **Step 5: Commit**

```bash
git add src/renderer.js tests/renderer.test.js
git commit -m "feat: add 3D point cloud renderer with projection math"
```

---

### Task 5: Controls UI

**Files:**
- Create: `neural-space/src/controls.js`

- [ ] **Step 1: Implement controls.js**

Builds the sidebar DOM:
- `buildControls(container, state, callbacks)` — creates all UI elements
- `callbacks`: `{ onDatasetChange, onActivationChange, onLRChange, onLayersChange, onNodesChange, onSpeedChange, onTrain, onReset }`
- Each control reads from state and calls the appropriate callback on change
- Dataset: 5 buttons in a flex-wrap group
- Activation: 3 buttons
- LR: range input (log scale), value display
- Hidden Layers: +/- buttons, count display, per-layer node controls
- Speed: 3 buttons (1x/2x/5x)
- Train/Reset: bottom buttons

All callbacks trigger model rebuild where needed (via main.js orchestration).

- [ ] **Step 2: Verify controls render in browser**

```bash
npm run dev
```

Open http://localhost:3001, verify sidebar shows all controls.

- [ ] **Step 3: Commit**

```bash
git add src/controls.js
git commit -m "feat: add sidebar controls UI"
```

---

### Task 6: Epoch Timeline + Snapshot System

**Files:**
- Create: `neural-space/src/timeline.js`

- [ ] **Step 1: Implement timeline.js**

Functions:
- `buildTimeline(container, state, onScrub)` — creates epoch slider bar
- `updateTimeline(state)` — updates slider position and label
- `saveSnapshot(state)` — saves current activations + loss at current epoch (every SNAPSHOT_INTERVAL)
- `loadSnapshot(state, epoch)` — loads nearest snapshot activations into state
- Slider: range input 0..maxEpochs, disabled during training, enabled when paused after training

- [ ] **Step 2: Verify timeline renders**

Open browser, verify epoch bar appears at top of main area.

- [ ] **Step 3: Commit**

```bash
git add src/timeline.js
git commit -m "feat: add epoch timeline with snapshot storage"
```

---

### Task 7: Loss Chart

**Files:**
- Create: `neural-space/src/loss-chart.js`

- [ ] **Step 1: Implement loss-chart.js**

- `renderLossChart(canvas, lossHistory, currentEpoch)` — draws loss line chart on canvas
- X-axis: epoch (0..maxEpochs), Y-axis: loss (auto-scale)
- Neon magenta line with glow
- Current epoch marker
- Label: "Loss" left, current value right

- [ ] **Step 2: Verify chart renders with dummy data**

Temporarily push dummy loss values in main.js, verify chart draws.

- [ ] **Step 3: Commit**

```bash
git add src/loss-chart.js
git commit -m "feat: add loss chart renderer"
```

---

### Task 8: Main Loop — Wire Everything Together

**Files:**
- Modify: `neural-space/src/main.js`
- Modify: `neural-space/src/style.css`

- [ ] **Step 1: Implement main.js orchestration**

```javascript
// src/main.js — pseudocode structure
import { createState } from './state.js'
import { generateDataset } from './datasets.js'
import { buildModel, trainStep, extractActivations, disposeModel } from './model.js'
import { renderPanel } from './renderer.js'
import { buildControls } from './controls.js'
import { buildTimeline, updateTimeline, saveSnapshot, loadSnapshot } from './timeline.js'
import { renderLossChart } from './loss-chart.js'

const state = createState()

// 1. Generate initial dataset
state.data = generateDataset(state.dataset)

// 2. Build initial model
const { model, layerModels } = buildModel(state)
state.model = model
state.layerModels = layerModels

// 3. Extract initial activations (epoch 0, untrained)
state.activations = extractActivations(state.layerModels, state.data.xs)

// 4. Build UI
buildControls(document.getElementById('controls'), state, {
  onDatasetChange: (type) => { /* regenerate data, rebuild model, reset */ },
  onActivationChange: (act) => { /* rebuild model, reset */ },
  onLRChange: (lr) => { /* rebuild model, reset */ },
  onLayersChange: (layers) => { /* rebuild model, reset */ },
  onNodesChange: (layerIdx, nodes) => { /* rebuild model, reset */ },
  onSpeedChange: (speed) => { state.speed = speed },
  onTrain: () => { state.isTraining = !state.isTraining },
  onReset: () => { /* rebuild model, reset epoch/snapshots/loss */ },
})
buildTimeline(document.getElementById('timeline'), state, (epoch) => {
  loadSnapshot(state, epoch)
})

// 5. Render loop
function render() {
  // Train if active — see Task 8 Step 3 for correct async implementation
  // Use trainTick() with await and trainingInProgress guard

  // Camera rotation
  state.cameraAngle += 0.003

  // Render pipeline panels
  const pipeline = document.getElementById('pipeline')
  // Render input panel + each hidden layer + output panel
  // Each panel gets its own canvas or section of shared canvas

  // Render loss chart
  renderLossChart(document.getElementById('loss-canvas'), state.lossHistory, state.epoch)

  // Update timeline
  updateTimeline(state)

  requestAnimationFrame(render)
}

render()
```

- [ ] **Step 2: Create individual canvases for each pipeline panel**

Each layer (input + hidden layers + output) gets its own `<canvas>` element inside `#pipeline`, created dynamically. Pipeline container uses `display: flex; gap: 2px`. Arrow elements between canvases.

- [ ] **Step 3: Handle async training correctly**

Training needs to be async (TF.js `model.fit` returns a promise). Use a flag to prevent overlapping train calls. Structure:

```javascript
let trainingInProgress = false

async function trainTick() {
  if (trainingInProgress || !state.isTraining) return
  trainingInProgress = true
  for (let i = 0; i < state.speed && state.epoch < state.maxEpochs; i++) {
    const loss = await trainStep(state.model, state.data.xs, state.data.labels)
    state.epoch++
    state.lossHistory.push(loss)
    state.activations = extractActivations(state.layerModels, state.data.xs)
    if (state.epoch % CONSTANTS.SNAPSHOT_INTERVAL === 0) saveSnapshot(state)
  }
  if (state.epoch >= state.maxEpochs) state.isTraining = false
  trainingInProgress = false
}
```

- [ ] **Step 4: Add keyboard shortcuts**

```javascript
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault()
    state.isTraining = !state.isTraining
    updateTrainButton(state)
  }
  if (e.code === 'ArrowLeft' && !state.isTraining && state.snapshots.length > 0) {
    // scrub backward
  }
  if (e.code === 'ArrowRight' && !state.isTraining && state.snapshots.length > 0) {
    // scrub forward
  }
})
```

- [ ] **Step 5: Polish CSS — final layout adjustments**

Ensure sidebar, timeline, pipeline, and loss chart all size correctly. Add transition/hover effects to buttons. Style the epoch slider.

- [ ] **Step 6: Verify full flow in browser**

1. Open http://localhost:3001
2. Select dataset → points appear in Input panel
3. Click Train → points animate through layers, loss chart updates
4. Change speed → training pace changes
5. Pause → scrub epoch slider → snapshots restore
6. Change network structure → model resets and rebuilds
7. Keyboard: Space to toggle, arrows to scrub

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire up main loop with training, rendering, and controls"
```

---

### Task 9: Build, Deploy, and Link

**Files:**
- Modify: `neural-space/package.json` (if needed)
- Modify: `vibe_web/data/shuzzi-mnist.json`

- [ ] **Step 1: Production build**

```bash
cd /Users/shuzzi/projects/neural-space
npm run build
```

Verify `dist/` directory created, no errors.

- [ ] **Step 2: Deploy to Vercel**

```bash
npx vercel --prod
```

Copy the deployment URL.

- [ ] **Step 3: Link from vibe_web**

Update `vibe_web/data/shuzzi-mnist.json`:
```json
{
  "url": "https://neural-space.vercel.app"
}
```

- [ ] **Step 4: Commit vibe_web change**

```bash
cd /Users/shuzzi/projects/vibe_web
git add data/shuzzi-mnist.json
git commit -m "feat: link MNIST canvas cell to Neural Space playground"
```

- [ ] **Step 5: Final verification**

Open vibe_web dev server, click shuzzi-mnist cell → should open Neural Space playground.
