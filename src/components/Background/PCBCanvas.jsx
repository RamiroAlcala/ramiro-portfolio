import { useRef, useEffect } from "react";

// ============================================================
// CONFIGURACIÓN
// ============================================================
const CFG = {
  cell: 14, // Grilla base

  // Pistas — color cobre sobre fondo oscuro
  traceWidths: [0.8, 1, 1.4, 2, 2.8],
  traceColor: "#1a3a2a",
  traceColorMed: "#1e4430",
  traceColorThick: "#234a34",

  // Vías
  viaOuterRadius: 3.5,
  viaInnerRadius: 1.2,
  viaColor: "#2a5a3d",
  viaDrillColor: "#0a0e14",

  // Pads (puntos de soldadura)
  padRadius: 2.5,
  padColor: "#2d5a3d",

  // Electrón
  electronSpeed: 10,
  glowRadius: 110,
  trailLength: 50,

  // Fondo
  bgColor: "#0a0e14",
};

// ============================================================
// SEEDED RANDOM
// ============================================================
function createRng(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ============================================================
// GENERACIÓN DE PCB — Alta densidad con giros a 45°
//
// Estrategia:
// 1. Grilla densa de nodos (junctions)
// 2. Cada nodo lanza múltiples trazas que avanzan ortogonal
//    y giran 45° antes de cada cambio de dirección
// 3. Las trazas buscan conectarse a nodos existentes
// 4. Vías en cada junction
// 5. Pads distribuidos regularmente
// ============================================================
function generatePCB(width, height) {
  const rng = createRng(42);
  const cell = CFG.cell;
  const cols = Math.floor(width / cell);
  const rows = Math.floor(height / cell);

  const segments = [];
  const vias = [];
  const pads = []; // Puntos de soldadura simples

  // 8 direcciones: 0=right, 1=down-right(45°), 2=down, 3=down-left, etc.
  const dirs = [
    [1, 0], [1, 1], [0, 1], [-1, 1],
    [-1, 0], [-1, -1], [0, -1], [1, -1],
  ];

  // Grilla de ocupación para evitar superposición excesiva
  const density = new Uint8Array(cols * rows);
  const maxDensity = 3; // Máximo trazas por celda

  function cellIdx(x, y) {
    const c = Math.floor(x / cell);
    const r = Math.floor(y / cell);
    if (c < 0 || c >= cols || r < 0 || r >= rows) return -1;
    return r * cols + c;
  }

  function canPass(x, y) {
    const idx = cellIdx(x, y);
    return idx >= 0 && density[idx] < maxDensity;
  }

  function markCell(x, y) {
    const idx = cellIdx(x, y);
    if (idx >= 0) density[idx]++;
  }

  // --- Fase 1: Junctions (nodos) en grilla regular ---
  const jSpacing = 7; // Un nodo cada 7 celdas
  const junctions = [];

  for (let jc = 1; jc <= Math.floor(cols / jSpacing); jc++) {
    for (let jr = 1; jr <= Math.floor(rows / jSpacing); jr++) {
      const x = jc * jSpacing * cell;
      const y = jr * jSpacing * cell;
      if (x > 0 && x < width && y > 0 && y < height) {
        junctions.push({ x, y });
        vias.push({ x, y });
      }
    }
  }

  // --- Fase 2: Trazas desde cada junction ---
  // Cada junction lanza 2-5 trazas en direcciones variadas
  for (const junc of junctions) {
    const traceCount = Math.floor(rng() * 3) + 2;

    for (let t = 0; t < traceCount; t++) {
      let cx = junc.x;
      let cy = junc.y;
      let dirIdx = Math.floor(rng() * 8);
      const tw = CFG.traceWidths[Math.floor(rng() * CFG.traceWidths.length)];
      const maxSteps = Math.floor(rng() * 8) + 4;

      for (let s = 0; s < maxSteps; s++) {
        const [dx, dy] = dirs[dirIdx];
        const stepCells = Math.floor(rng() * 5) + 2;
        const stepLen = stepCells * cell;
        const nx = cx + dx * stepLen;
        const ny = cy + dy * stepLen;

        // Límites
        if (nx < cell || nx > width - cell || ny < cell || ny > height - cell) break;
        if (!canPass(nx, ny)) break;

        segments.push({ x1: cx, y1: cy, x2: nx, y2: ny, width: tw });

        // Marcar celdas a lo largo del segmento
        const segLen = Math.hypot(nx - cx, ny - cy);
        const markSteps = Math.ceil(segLen / cell);
        for (let m = 0; m <= markSteps; m++) {
          const t2 = m / markSteps;
          markCell(cx + (nx - cx) * t2, cy + (ny - cy) * t2);
        }

        cx = nx;
        cy = ny;

        // Giro: 45° o 90° (cambio de 1 o 2 posiciones en el array de dirs)
        if (rng() > 0.25) {
          const turn = rng() > 0.5 ? 1 : -1;
          // 65% giro de 45°, 35% giro de 90°
          const amount = rng() > 0.35 ? 1 : 2;
          dirIdx = (dirIdx + turn * amount + 8) % 8;
        }

        // Vía en punto de giro (probabilidad alta)
        if (rng() > 0.4) {
          vias.push({ x: cx, y: cy });
        }
      }

      // Conectar el extremo a la junction más cercana
      let bestDist = Infinity;
      let bestJunc = null;
      for (const j2 of junctions) {
        if (j2.x === junc.x && j2.y === junc.y) continue;
        const d = Math.hypot(j2.x - cx, j2.y - cy);
        if (d < bestDist && d > cell * 2) {
          bestDist = d;
          bestJunc = j2;
        }
      }
      // Conectar si está a distancia razonable
      if (bestJunc && bestDist < jSpacing * cell * 1.8) {
        // Ruta ortogonal en L hacia la junction
        const midX = cx;
        const midY = bestJunc.y;
        segments.push({ x1: cx, y1: cy, x2: midX, y2: midY, width: tw });
        segments.push({ x1: midX, y1: midY, x2: bestJunc.x, y2: midY, width: tw });
        vias.push({ x: midX, y: midY });
      }
    }
  }

  // --- Fase 3: Trazas paralelas (buses) ---
  const busCount = Math.floor(Math.max(cols, rows) / 20) + 2;

  for (let b = 0; b < busCount; b++) {
    const horizontal = rng() > 0.5;
    const lineCount = Math.floor(rng() * 4) + 2;
    const gap = cell * (rng() * 0.4 + 0.5);
    const tw = CFG.traceWidths[Math.floor(rng() * 2)]; // Fino

    if (horizontal) {
      const baseY = Math.round((rng() * (height - cell * 8) + cell * 4) / cell) * cell;
      const x1 = Math.round((rng() * width * 0.15) / cell) * cell;
      const x2 = Math.round((width - rng() * width * 0.15) / cell) * cell;

      for (let l = 0; l < lineCount; l++) {
        const y = baseY + l * gap;
        // Traza recta con posible desvío diagonal en el medio
        if (rng() > 0.6) {
          const midX = x1 + (x2 - x1) * (0.3 + rng() * 0.4);
          const offset = (rng() > 0.5 ? 1 : -1) * cell * (Math.floor(rng() * 3) + 1);
          segments.push({ x1: x1, y1: y, x2: midX, y2: y, width: tw });
          segments.push({ x1: midX, y1: y, x2: midX + Math.abs(offset), y2: y + offset, width: tw });
          segments.push({ x1: midX + Math.abs(offset), y1: y + offset, x2: x2, y2: y + offset, width: tw });
        } else {
          segments.push({ x1: x1, y1: y, x2: x2, y2: y, width: tw });
        }
      }
      vias.push({ x: x1, y: baseY });
      vias.push({ x: x2, y: baseY });
    } else {
      const baseX = Math.round((rng() * (width - cell * 8) + cell * 4) / cell) * cell;
      const y1 = Math.round((rng() * height * 0.15) / cell) * cell;
      const y2 = Math.round((height - rng() * height * 0.15) / cell) * cell;

      for (let l = 0; l < lineCount; l++) {
        const x = baseX + l * gap;
        if (rng() > 0.6) {
          const midY = y1 + (y2 - y1) * (0.3 + rng() * 0.4);
          const offset = (rng() > 0.5 ? 1 : -1) * cell * (Math.floor(rng() * 3) + 1);
          segments.push({ x1: x, y1: y1, x2: x, y2: midY, width: tw });
          segments.push({ x1: x, y1: midY, x2: x + offset, y2: midY + Math.abs(offset), width: tw });
          segments.push({ x1: x + offset, y1: midY + Math.abs(offset), x2: x + offset, y2: y2, width: tw });
        } else {
          segments.push({ x1: x, y1: y1, x2: x, y2: y2, width: tw });
        }
      }
      vias.push({ x: baseX, y: y1 });
      vias.push({ x: baseX, y: y2 });
    }
  }

  // --- Fase 4: Relleno de zonas vacías con trazas cortas ---
  const fillStep = cell * 4;
  for (let fx = fillStep; fx < width - fillStep; fx += fillStep) {
    for (let fy = fillStep; fy < height - fillStep; fy += fillStep) {
      const idx = cellIdx(fx, fy);
      if (idx >= 0 && density[idx] >= 1) continue; // Ya hay algo
      if (rng() > 0.45) continue;

      const x = Math.round(fx / cell) * cell;
      const y = Math.round(fy / cell) * cell;
      const tw = CFG.traceWidths[Math.floor(rng() * 3)];

      // Traza corta con giro a 45°
      const dirIdx = Math.floor(rng() * 8);
      const [dx1, dy1] = dirs[dirIdx];
      const len1 = (Math.floor(rng() * 4) + 2) * cell;
      const mx = x + dx1 * len1;
      const my = y + dy1 * len1;

      if (mx > cell && mx < width - cell && my > cell && my < height - cell) {
        segments.push({ x1: x, y1: y, x2: mx, y2: my, width: tw });

        // Segundo tramo con giro
        const turn = rng() > 0.5 ? 1 : -1;
        const dirIdx2 = (dirIdx + turn + 8) % 8;
        const [dx2, dy2] = dirs[dirIdx2];
        const len2 = (Math.floor(rng() * 3) + 1) * cell;
        const ex = mx + dx2 * len2;
        const ey = my + dy2 * len2;

        if (ex > cell && ex < width - cell && ey > cell && ey < height - cell) {
          segments.push({ x1: mx, y1: my, x2: ex, y2: ey, width: tw });
        }

        // Pad o vía en extremos
        if (rng() > 0.5) pads.push({ x, y });
        if (rng() > 0.4) vias.push({ x: mx, y: my });
      }
    }
  }

  // --- Fase 5: Pads distribuidos regularmente ---
  const padStep = cell * 6;
  for (let px = padStep; px < width; px += padStep) {
    for (let py = padStep; py < height; py += padStep) {
      if (rng() > 0.45) continue;
      pads.push({
        x: Math.round(px / cell) * cell,
        y: Math.round(py / cell) * cell,
      });
    }
  }

  // --- Fase 6: Vías adicionales en grilla regular ---
  const viaStep = cell * 10;
  for (let vx = viaStep; vx < width; vx += viaStep) {
    for (let vy = viaStep; vy < height; vy += viaStep) {
      if (rng() > 0.5) continue;
      vias.push({
        x: Math.round(vx / cell) * cell + Math.round((rng() - 0.5) * cell * 2),
        y: Math.round(vy / cell) * cell + Math.round((rng() - 0.5) * cell * 2),
      });
    }
  }

  return { segments, vias, pads };
}

// ============================================================
// GRAFO + CONEXIDAD
// ============================================================
function buildGraph(segments) {
  const pointMap = new Map();
  const points = [];

  function getOrAdd(x, y) {
    const k = `${Math.round(x)},${Math.round(y)}`;
    if (!pointMap.has(k)) {
      pointMap.set(k, points.length);
      points.push({ x, y, neighbors: [] });
    }
    return pointMap.get(k);
  }

  for (const seg of segments) {
    const iA = getOrAdd(seg.x1, seg.y1);
    const iB = getOrAdd(seg.x2, seg.y2);
    const dist = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1);
    if (dist > 0 && iA !== iB) {
      if (!points[iA].neighbors.some((n) => n.idx === iB)) {
        points[iA].neighbors.push({ idx: iB, dist });
        points[iB].neighbors.push({ idx: iA, dist });
      }
    }
  }

  // Garantizar conexidad
  const visited = new Uint8Array(points.length);
  const components = [];

  for (let i = 0; i < points.length; i++) {
    if (visited[i] || points[i].neighbors.length === 0) {
      visited[i] = 1;
      continue;
    }
    const comp = [];
    const queue = [i];
    visited[i] = 1;
    while (queue.length > 0) {
      const cur = queue.shift();
      comp.push(cur);
      for (const nb of points[cur].neighbors) {
        if (!visited[nb.idx]) {
          visited[nb.idx] = 1;
          queue.push(nb.idx);
        }
      }
    }
    components.push(comp);
  }

  if (components.length > 1) {
    components.sort((a, b) => b.length - a.length);
    const main = components[0];

    for (let c = 1; c < components.length; c++) {
      const other = components[c];
      let bestDist = Infinity;
      let bestA = -1;
      let bestB = -1;

      const sample = main.length > 100
        ? main.filter((_, idx) => idx % Math.ceil(main.length / 100) === 0)
        : main;

      for (const ai of sample) {
        for (const bi of other) {
          const d = Math.hypot(points[ai].x - points[bi].x, points[ai].y - points[bi].y);
          if (d < bestDist) { bestDist = d; bestA = ai; bestB = bi; }
        }
      }

      if (bestA >= 0 && bestB >= 0) {
        points[bestA].neighbors.push({ idx: bestB, dist: bestDist });
        points[bestB].neighbors.push({ idx: bestA, dist: bestDist });
        segments.push({
          x1: points[bestA].x, y1: points[bestA].y,
          x2: points[bestB].x, y2: points[bestB].y,
          width: CFG.traceWidths[0],
        });
        main.push(...other);
      }
    }
  }

  // Eliminar dead-ends: conectar nodos con solo 1 vecino al nodo
  // más cercano que no sea ya su vecino, para que el electrón
  // nunca quede rebotando en un punto final.
  let changed = true;
  let passes = 0;
  while (changed && passes < 5) {
    changed = false;
    passes++;
    for (let i = 0; i < points.length; i++) {
      if (points[i].neighbors.length !== 1) continue;

      const p = points[i];
      const existingNeighbor = p.neighbors[0].idx;
      let bestDist = Infinity;
      let bestJ = -1;

      for (let j = 0; j < points.length; j++) {
        if (j === i || j === existingNeighbor) continue;
        if (points[j].neighbors.length === 0) continue;
        const d = Math.hypot(points[j].x - p.x, points[j].y - p.y);
        if (d < bestDist) { bestDist = d; bestJ = j; }
      }

      if (bestJ >= 0) {
        points[i].neighbors.push({ idx: bestJ, dist: bestDist });
        points[bestJ].neighbors.push({ idx: i, dist: bestDist });
        segments.push({
          x1: p.x, y1: p.y,
          x2: points[bestJ].x, y2: points[bestJ].y,
          width: CFG.traceWidths[0],
        });
        changed = true;
      }
    }
  }

  return { points };
}

// ============================================================
// DIBUJAR PCB ESTÁTICO
// ============================================================
function drawStaticPCB(ctx, w, h, pcb) {
  const { segments, vias, pads } = pcb;

  ctx.fillStyle = CFG.bgColor;
  ctx.fillRect(0, 0, w, h);

  // Pistas
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const seg of segments) {
    ctx.strokeStyle = seg.width > 2 ? CFG.traceColorThick
                    : seg.width > 1.2 ? CFG.traceColorMed
                    : CFG.traceColor;
    ctx.lineWidth = seg.width;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
  }

  // Pads
  for (const p of pads) {
    ctx.fillStyle = CFG.padColor;
    ctx.beginPath();
    ctx.arc(p.x, p.y, CFG.padRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Vías
  for (const v of vias) {
    ctx.fillStyle = CFG.viaColor;
    ctx.beginPath();
    ctx.arc(v.x, v.y, CFG.viaOuterRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = CFG.viaDrillColor;
    ctx.beginPath();
    ctx.arc(v.x, v.y, CFG.viaInnerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ============================================================
// BFS
// ============================================================
function bfsNextStep(graph, fromIdx, toIdx) {
  if (fromIdx === toIdx || fromIdx < 0 || toIdx < 0) return -1;
  const from = graph.points[fromIdx];
  if (!from || from.neighbors.length === 0) return -1;

  const visited = new Set([fromIdx]);
  const parent = new Map();
  const queue = [fromIdx];
  let steps = 0;

  while (queue.length > 0 && steps < 1500) {
    const cur = queue.shift();
    steps++;
    if (cur === toIdx) {
      let node = toIdx;
      while (parent.get(node) !== fromIdx) {
        node = parent.get(node);
        if (node === undefined) return from.neighbors[0].idx;
      }
      return node;
    }
    for (const nb of graph.points[cur].neighbors) {
      if (!visited.has(nb.idx)) {
        visited.add(nb.idx);
        parent.set(nb.idx, cur);
        queue.push(nb.idx);
      }
    }
  }

  // Greedy fallback
  const target = graph.points[toIdx];
  let best = from.neighbors[0].idx;
  let bestDist = Math.hypot(graph.points[best].x - target.x, graph.points[best].y - target.y);
  for (let i = 1; i < from.neighbors.length; i++) {
    const ni = from.neighbors[i].idx;
    const d = Math.hypot(graph.points[ni].x - target.x, graph.points[ni].y - target.y);
    if (d < bestDist) { bestDist = d; best = ni; }
  }
  return best;
}

function findClosestConnectedNode(graph, mx, my) {
  let best = -1;
  let bestDist = Infinity;
  for (let i = 0; i < graph.points.length; i++) {
    if (graph.points[i].neighbors.length === 0) continue;
    const d = Math.hypot(graph.points[i].x - mx, graph.points[i].y - my);
    if (d < bestDist) { bestDist = d; best = i; }
  }
  return best;
}

// ============================================================
// COMPONENTE
// ============================================================
export default function PCBCanvas({ mousePos, electronActive }) {
  const canvasRef = useRef(null);
  const offscreenRef = useRef(null);
  const graphRef = useRef(null);
  const pcbRef = useRef(null);
  const animFrameRef = useRef(null);
  const opacityRef = useRef(0);

  const mousePosRef = useRef(mousePos);
  const electronActiveRef = useRef(electronActive);
  useEffect(() => { mousePosRef.current = mousePos; }, [mousePos]);
  useEffect(() => { electronActiveRef.current = electronActive; }, [electronActive]);

  const elecRef = useRef({
    pointIdx: -1,
    targetIdx: -1,
    progress: 0,
    x: -200,
    y: -200,
    trail: [],
    reachedGoal: false,
  });

  const lastMouseRef = useRef({ x: -1, y: -1 });

  // Init
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;

      const pcb = generatePCB(canvas.width, canvas.height);
      const graph = buildGraph(pcb.segments);
      drawStaticPCB(offscreen.getContext("2d"), canvas.width, canvas.height, pcb);

      offscreenRef.current = offscreen;
      graphRef.current = graph;
      pcbRef.current = pcb;

      const ranked = graph.points
        .map((p, i) => ({ i, n: p.neighbors.length }))
        .filter((p) => p.n >= 2)
        .sort((a, b) => b.n - a.n);

      if (ranked.length > 0) {
        const start = ranked[Math.floor(Math.random() * Math.min(ranked.length, 30))].i;
        const elec = elecRef.current;
        elec.pointIdx = start;
        elec.targetIdx = -1;
        elec.progress = 0;
        elec.x = graph.points[start].x;
        elec.y = graph.points[start].y;
        elec.trail = [];
        elec.reachedGoal = false;
      }
    };

    init();
    window.addEventListener("resize", init);
    return () => window.removeEventListener("resize", init);
  }, []);

  // Animation loop
  useEffect(() => {
    let running = true;

    function loop() {
      if (!running) return;

      const canvas = canvasRef.current;
      const graph = graphRef.current;
      if (!canvas || !graph) {
        animFrameRef.current = requestAnimationFrame(loop);
        return;
      }

      const ctx = canvas.getContext("2d");

      if (offscreenRef.current) {
        ctx.drawImage(offscreenRef.current, 0, 0);
      }

      const active = electronActiveRef.current;
      const mPos = mousePosRef.current;
      const elec = elecRef.current;

      // Detectar movimiento del mouse para reactivar
      const mouseMoved = mPos.x !== lastMouseRef.current.x || mPos.y !== lastMouseRef.current.y;
      const mouseDist = Math.hypot(mPos.x - lastMouseRef.current.x, mPos.y - lastMouseRef.current.y);

      if (mouseMoved) {
        const wasOff = elec.reachedGoal;
        lastMouseRef.current = { x: mPos.x, y: mPos.y };
        elec.reachedGoal = false;

        // Teleportar el electrón al nodo más cercano al mouse si:
        // - Se reactiva después de haberse apagado, O
        // - El mouse saltó una distancia grande (ej. cruzó la consola)
        const teleportThreshold = 300;
        const elecToMouse = Math.hypot(elec.x - mPos.x, elec.y - mPos.y);
        if ((wasOff || mouseDist > teleportThreshold) && elecToMouse > teleportThreshold) {
          const nearNode = findClosestConnectedNode(graph, mPos.x, mPos.y);
          if (nearNode >= 0) {
            elec.pointIdx = nearNode;
            elec.targetIdx = -1;
            elec.progress = 0;
            elec.x = graph.points[nearNode].x;
            elec.y = graph.points[nearNode].y;
            elec.trail = [];
          }
        }
      }

      const shouldShow = active && !elec.reachedGoal;
      const targetOpacity = shouldShow ? 1 : 0;
      opacityRef.current += (targetOpacity - opacityRef.current) * 0.08;

      if (opacityRef.current > 0.005 && graph.points.length > 0) {
        const alpha = opacityRef.current;
        const from = graph.points[elec.pointIdx];

        if (!from || from.neighbors.length === 0) {
          const fb = findClosestConnectedNode(graph, elec.x, elec.y);
          if (fb >= 0) {
            elec.pointIdx = fb;
            elec.targetIdx = -1;
            elec.progress = 0;
            elec.x = graph.points[fb].x;
            elec.y = graph.points[fb].y;
          }
          animFrameRef.current = requestAnimationFrame(loop);
          return;
        }

        if (elec.targetIdx < 0 || elec.progress >= 1) {
          if (elec.targetIdx >= 0) elec.pointIdx = elec.targetIdx;
          elec.progress = 0;

          const current = graph.points[elec.pointIdx];
          const goalIdx = findClosestConnectedNode(graph, mPos.x, mPos.y);

          if (goalIdx >= 0 && elec.pointIdx === goalIdx) {
            elec.reachedGoal = true;
            elec.targetIdx = -1;
          } else if (goalIdx >= 0) {
            const next = bfsNextStep(graph, elec.pointIdx, goalIdx);
            elec.targetIdx = next;
          } else {
            elec.targetIdx = current.neighbors[Math.floor(Math.random() * current.neighbors.length)].idx;
          }
        }

        if (elec.targetIdx >= 0) {
          const fPt = graph.points[elec.pointIdx];
          const tPt = graph.points[elec.targetIdx];
          if (fPt && tPt) {
            const segDist = Math.hypot(tPt.x - fPt.x, tPt.y - fPt.y);
            const step = segDist > 0 ? CFG.electronSpeed / segDist : 1;
            elec.progress = Math.min(1, elec.progress + step);
            elec.x = fPt.x + (tPt.x - fPt.x) * elec.progress;
            elec.y = fPt.y + (tPt.y - fPt.y) * elec.progress;
          }
        }

        // Trail
        elec.trail.unshift({ x: elec.x, y: elec.y });
        if (elec.trail.length > CFG.trailLength) elec.trail.pop();

        // --- GLOW ---
        const segs = pcbRef.current?.segments;
        if (segs) {
          ctx.lineCap = "round";
          for (const seg of segs) {
            const mx = (seg.x1 + seg.x2) / 2;
            const my = (seg.y1 + seg.y2) / 2;
            const d = Math.hypot(mx - elec.x, my - elec.y);
            if (d < CFG.glowRadius) {
              const intensity = (1 - d / CFG.glowRadius) * alpha;
              ctx.strokeStyle = `rgba(0, 255, 245, ${intensity * 0.35})`;
              ctx.lineWidth = seg.width + 1;
              ctx.beginPath();
              ctx.moveTo(seg.x1, seg.y1);
              ctx.lineTo(seg.x2, seg.y2);
              ctx.stroke();
            }
          }
        }

        const pcbVias = pcbRef.current?.vias;
        if (pcbVias) {
          for (const v of pcbVias) {
            const d = Math.hypot(v.x - elec.x, v.y - elec.y);
            if (d < CFG.glowRadius) {
              const intensity = (1 - d / CFG.glowRadius) * alpha;
              ctx.fillStyle = `rgba(0, 255, 245, ${intensity * 0.5})`;
              ctx.beginPath();
              ctx.arc(v.x, v.y, CFG.viaOuterRadius + 1, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Trail glow
        if (elec.trail.length > 1) {
          ctx.lineCap = "round";
          for (let i = 1; i < elec.trail.length; i++) {
            const t = 1 - i / elec.trail.length;
            ctx.strokeStyle = `rgba(0, 255, 245, ${t * 0.5 * alpha})`;
            ctx.lineWidth = Math.max(0.5, 2.5 * t);
            ctx.beginPath();
            ctx.moveTo(elec.trail[i - 1].x, elec.trail[i - 1].y);
            ctx.lineTo(elec.trail[i].x, elec.trail[i].y);
            ctx.stroke();
          }
        }

        // Glow central
        const grad = ctx.createRadialGradient(elec.x, elec.y, 0, elec.x, elec.y, 22);
        grad.addColorStop(0, `rgba(0, 255, 245, ${0.9 * alpha})`);
        grad.addColorStop(0.25, `rgba(0, 255, 245, ${0.35 * alpha})`);
        grad.addColorStop(1, "rgba(0, 255, 245, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(elec.x, elec.y, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * alpha})`;
        ctx.beginPath();
        ctx.arc(elec.x, elec.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        elecRef.current.trail = [];
      }

      animFrameRef.current = requestAnimationFrame(loop);
    }

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
