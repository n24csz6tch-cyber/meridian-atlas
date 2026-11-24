export type ExtendedTopicId =
  | 'a1-abs-piecewise'
  | 'a1-radicals-exp'
  | 'a1-statistics'
  | 'g-parallel-angles'
  | 'g-similarity'
  | 'g-quadrilaterals'
  | 'a2-quad-systems'
  | 'a2-radicals'
  | 'a2-combinatorics'
  | 'pc-trig-identities'
  | 'pc-law-sines'
  | 'pc-parametric';

export interface ExtendedRenderArgs {
  ctx: CanvasRenderingContext2D;
  topicId: string;
  width: number;
  height: number;
  cx: number;
  cy: number;
  p1: number;
  p2: number;
  t: number;
}

function drawCartographicGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number
) {
  // Subtle minor golden cartographic grid
  ctx.strokeStyle = 'rgba(244, 196, 108, 0.055)';
  ctx.lineWidth = 1;
  for (let gx = cx % scale; gx < width; gx += scale) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, height);
    ctx.stroke();
  }
  for (let gy = cy % scale; gy < height; gy += scale) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(width, gy);
    ctx.stroke();
  }
}

function drawGridAndAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number
) {
  drawCartographicGrid(ctx, width, height, cx, cy, scale);

  // Primary golden-slate axes
  ctx.strokeStyle = 'rgba(244, 196, 108, 0.24)';
  ctx.lineWidth = 1.25;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.stroke();

  // Sharp unit tick marks & coordinate tags
  ctx.font = '500 9.5px "JetBrains Mono", monospace';
  ctx.fillStyle = 'rgba(168, 178, 198, 0.58)';
  ctx.strokeStyle = 'rgba(244, 196, 108, 0.34)';
  ctx.lineWidth = 1;

  for (let k = -6; k <= 6; k++) {
    if (k === 0) continue;
    const tx = cx + k * scale;
    if (tx > 22 && tx < width - 22) {
      ctx.beginPath();
      ctx.moveTo(tx, cy - 3.5);
      ctx.lineTo(tx, cy + 3.5);
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillText(String(k), tx, cy + 14);
    }
    const ty = cy - k * scale;
    if (ty > 22 && ty < height - 22) {
      ctx.beginPath();
      ctx.moveTo(cx - 3.5, ty);
      ctx.lineTo(cx + 3.5, ty);
      ctx.stroke();
      ctx.textAlign = 'right';
      ctx.fillText(String(k), cx - 7, ty + 3);
    }
  }
  ctx.textAlign = 'left';
}

function glowStroke(
  ctx: CanvasRenderingContext2D,
  color: string,
  lineWidth: number,
  blur: number,
  drawFn: () => void
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.beginPath();
  drawFn();
  ctx.stroke();
  ctx.restore();
}

function glowPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  r = 5.2
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.6);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#05060A';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

export function renderExtendedTopic({
  ctx,
  topicId,
  width,
  height,
  cx,
  cy,
  p1,
  p2,
  t,
}: ExtendedRenderArgs): boolean {
  const scale = Math.min(width, height) * 0.125;
  const toPx = (x: number, y: number): [number, number] => [cx + x * scale, cy - y * scale];

  if (topicId === 'a1-abs-piecewise') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const a = p1;
    const h = p2;
    const k = -1.1 + 0.35 * Math.sin(t * 0.9);
    const [vx, vy] = toPx(h, k);

    // Axis of symmetry
    ctx.strokeStyle = 'rgba(70, 214, 232, 0.42)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(vx, 12);
    ctx.lineTo(vx, height - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glow V curve
    glowStroke(ctx, '#F4C46C', 2.6, 14, () => {
      for (let sx = 12; sx <= width - 12; sx += 3) {
        const x = (sx - cx) / scale;
        const y = a * Math.abs(x - h) + k;
        const py = cy - y * scale;
        if (sx === 12) ctx.moveTo(sx, py);
        else ctx.lineTo(sx, py);
      }
    });

    // Animated symmetric distance caliper |x - h| = d
    const d = 1.15 + 0.85 * Math.sin(t * 1.15);
    const yD = a * d + k;
    const [lx, ly] = toPx(h - d, yD);
    const [rx, ry] = toPx(h + d, yD);
    glowStroke(ctx, '#45E6A6', 1.9, 10, () => {
      ctx.moveTo(lx, ly);
      ctx.lineTo(rx, ry);
    });

    glowPoint(ctx, vx, vy, '#FF8563', 5.5);
    glowPoint(ctx, lx, ly, '#45E6A6', 4.5);
    glowPoint(ctx, rx, ry, '#45E6A6', 4.5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(`Symmetric wings: |x − (${h.toFixed(1)})| = ${d.toFixed(2)}`, 16, 24);
    ctx.fillStyle = '#FFE29E';
    ctx.fillText(`Vertex V(${h.toFixed(1)}, ${k.toFixed(2)}) · Slopes ±${Math.abs(a).toFixed(2)}`, 16, 42);
    return true;
  }

  if (topicId === 'a1-radicals-exp') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const a = p1;
    const h = p2;
    const [hx, hy] = toPx(h, 0);

    // Forbidden domain region x < h
    ctx.fillStyle = 'rgba(255, 133, 99, 0.08)';
    ctx.fillRect(0, 0, Math.max(0, hx), height);
    ctx.strokeStyle = 'rgba(255, 133, 99, 0.58)';
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(hx, 0);
    ctx.lineTo(hx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radical curve y = a * sqrt(x - h)
    glowStroke(ctx, '#F4C46C', 2.7, 14, () => {
      let started = false;
      for (let sx = Math.max(0, Math.floor(hx)); sx <= width; sx += 2) {
        const x = (sx - cx) / scale;
        if (x < h) continue;
        const y = a * Math.sqrt(x - h);
        const py = cy - y * scale;
        if (!started) {
          ctx.moveTo(sx, py);
          started = true;
        } else {
          ctx.lineTo(sx, py);
        }
      }
    });

    // Ghost parabolic inverse half y = (x/a)^2 + h
    ctx.strokeStyle = 'rgba(70, 214, 232, 0.38)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (let u = 0; u <= 3.2; u += 0.08) {
      const [px, py] = toPx(u, (u * u) / Math.max(0.4, a * a) + h);
      if (u === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Moving tracer bead
    const xProbe = h + 0.35 + 3.2 * (0.5 + 0.5 * Math.sin(t * 0.95));
    const yProbe = a * Math.sqrt(xProbe - h);
    const [tx, ty] = toPx(xProbe, yProbe);
    glowPoint(ctx, hx, hy, '#FF8563', 5);
    glowPoint(ctx, tx, ty, '#45E6A6', 5.2);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(`Domain: x ≥ ${h.toFixed(1)} · Probe (${xProbe.toFixed(2)}, ${yProbe.toFixed(2)})`, 16, 24);
    ctx.fillStyle = '#FF8563';
    ctx.fillText(`x < ${h.toFixed(1)} undefined in ℝ`, 16, 42);
    return true;
  }

  if (topicId === 'a1-statistics') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const slope = p1;
    const intercept = p2;
    const points: [number, number][] = [
      [-3.1, -1.7],
      [-2.3, -1.0],
      [-1.6, -0.8],
      [-0.7, 0.1],
      [0.1, 0.45],
      [0.9, 1.35],
      [1.7, 1.4],
      [2.5, 2.3],
      [3.3, 2.55],
    ];

    const pts = points.map(([x, y], i): [number, number] => [
      x,
      y + 0.12 * Math.sin(t * 1.1 + i * 0.8),
    ]);

    const meanY = pts.reduce((s, p) => s + p[1], 0) / pts.length;
    let sse = 0;
    let sst = 0;

    for (const [x, y] of pts) {
      const yHat = slope * x + intercept;
      const err = y - yHat;
      sse += err * err;
      sst += (y - meanY) * (y - meanY);

      const [px, py] = toPx(x, y);
      const [, ly] = toPx(x, yHat);
      const side = Math.abs(py - ly);
      ctx.fillStyle = 'rgba(255, 133, 99, 0.15)';
      ctx.strokeStyle = 'rgba(255, 133, 99, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.fillRect(px, Math.min(py, ly), side, side);
      ctx.strokeRect(px, Math.min(py, ly), side, side);
    }

    // Regression line with shadowBlur glow
    const [xA, yA] = toPx(-4.5, slope * -4.5 + intercept);
    const [xB, yB] = toPx(4.5, slope * 4.5 + intercept);
    glowStroke(ctx, '#F4C46C', 2.5, 14, () => {
      ctx.moveTo(xA, yA);
      ctx.lineTo(xB, yB);
    });

    for (const [x, y] of pts) {
      const [px, py] = toPx(x, y);
      glowPoint(ctx, px, py, '#46D6E8', 4);
    }

    const r2 = Math.max(0, 1 - sse / Math.max(0.001, sst));
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = r2 > 0.85 ? '#45E6A6' : '#FFE29E';
    ctx.fillText(`Sum of Squared Residuals Σe² = ${sse.toFixed(2)} · Fit R² = ${r2.toFixed(3)}`, 16, 24);
    return true;
  }

  if (topicId === 'g-parallel-angles') {
    drawCartographicGrid(ctx, width, height, cx, cy, scale);
    const gap = Math.min(height * 0.34, 118) * Math.max(0.75, p2 * 0.88);
    const y1 = cy - gap * 0.5;
    const y2 = cy + gap * 0.5;
    const angleDeg = p1 + 14 * Math.sin(t * 0.75);
    const rad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    // Parallel rails
    for (const ry of [y1, y2]) {
      glowStroke(ctx, '#46D6E8', 2.3, 12, () => {
        ctx.moveTo(28, ry);
        ctx.lineTo(width - 28, ry);
      });
    }

    const t1 = (y1 - cy) / dy;
    const t2 = (y2 - cy) / dy;
    const ix1 = cx + dx * t1;
    const ix2 = cx + dx * t2;

    // Transversal
    glowStroke(ctx, '#F4C46C', 2.5, 13, () => {
      ctx.moveTo(cx - dx * 260, cy - dy * 260);
      ctx.lineTo(cx + dx * 260, cy + dy * 260);
    });

    const drawWedge = (vx: number, vy: number, a0: number, a1: number, col: string) => {
      ctx.fillStyle = `${col}36`;
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.arc(vx, vy, 34, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawWedge(ix1, y1, 0, rad, '#45E6A6');
    drawWedge(ix2, y2, Math.PI, Math.PI + rad, '#45E6A6');
    drawWedge(ix1, y1, rad, Math.PI, '#FF8563');
    drawWedge(ix2, y2, 0, rad, '#46D6E8');

    glowPoint(ctx, ix1, y1, '#FFE29E', 4.5);
    glowPoint(ctx, ix2, y2, '#FFE29E', 4.5);

    const supp = 180 - angleDeg;
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(`Alternate Interior & Corresponding: α = ${angleDeg.toFixed(1)}°`, 16, 24);
    ctx.fillStyle = '#FF8563';
    ctx.fillText(`Linear Pair Supplement: β = ${supp.toFixed(1)}°  (α + β = 180.0°)`, 16, 42);
    return true;
  }

  if (topicId === 'g-similarity') {
    drawCartographicGrid(ctx, width, height, cx, cy, scale);
    const k = p1 + 0.18 * Math.sin(t * 0.9);
    const ox = width * 0.16;
    const oy = height * 0.78;
    const shapeIdx = Math.round(p2);
    const baseTri: [number, number][] =
      shapeIdx === 1
        ? [
            [80, -16],
            [156, -16],
            [156, -74],
          ]
        : shapeIdx === 3
          ? [
              [84, -18],
              [160, -18],
              [104, -84],
            ]
          : [
              [84, -18],
              [152, -18],
              [126, -78],
            ];
    const scaledTri: [number, number][] = baseTri.map(([x, y]) => [x * k, y * k]);

    ctx.strokeStyle = 'rgba(244, 196, 108, 0.22)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + scaledTri[i][0] * 1.15, oy + scaledTri[i][1] * 1.15);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const drawPoly = (pts: [number, number][], stroke: string, fill: string) => {
      ctx.save();
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.shadowColor = stroke;
      ctx.shadowBlur = 11;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(ox + x, oy + y);
        else ctx.lineTo(ox + x, oy + y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    };
    drawPoly(scaledTri, '#F4C46C', 'rgba(244, 196, 108, 0.14)');
    drawPoly(baseTri, '#46D6E8', 'rgba(70, 214, 232, 0.22)');
    glowPoint(ctx, ox, oy, '#45E6A6', 5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#46D6E8';
    ctx.fillText(`Scale Factor k = ${k.toFixed(2)} · Perimeter scales ×${k.toFixed(2)}`, 16, 24);
    ctx.fillStyle = '#FFE29E';
    ctx.fillText(`Area Ratio A′ / A = k² = ${(k * k).toFixed(2)}× (Angles preserved)`, 16, 42);
    return true;
  }

  if (topicId === 'g-quadrilaterals') {
    drawCartographicGrid(ctx, width, height, cx, cy, scale);
    const shear = p1 * Math.cos(t * 0.7);
    const aspect = p2;
    const halfW = Math.min(width * 0.22, 118) * aspect;
    const halfH = Math.min(height * 0.26, 86);
    const sPx = shear * 54;

    const pts: [number, number][] = [
      [cx - halfW + sPx, cy - halfH],
      [cx + halfW + sPx, cy - halfH],
      [cx + halfW - sPx, cy + halfH],
      [cx - halfW - sPx, cy + halfH],
    ];

    ctx.save();
    ctx.fillStyle = 'rgba(70, 214, 232, 0.13)';
    ctx.strokeStyle = '#46D6E8';
    ctx.shadowColor = '#46D6E8';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    glowStroke(ctx, '#F4C46C', 1.8, 8, () => {
      ctx.moveTo(pts[0][0], pts[0][1]);
      ctx.lineTo(pts[2][0], pts[2][1]);
    });
    glowStroke(ctx, '#45E6A6', 1.8, 8, () => {
      ctx.moveTo(pts[1][0], pts[1][1]);
      ctx.lineTo(pts[3][0], pts[3][1]);
    });

    pts.forEach(([x, y]) => glowPoint(ctx, x, y, '#46D6E8', 4.5));
    glowPoint(ctx, cx, cy, '#FF8563', 5);

    const isRect = Math.abs(shear) < 0.12;
    const isSquare = isRect && Math.abs(halfW - halfH) < 14;
    const label = isSquare
      ? 'SQUARE (90° + Equal Sides + ⊥ Diagonals)'
      : isRect
        ? 'RECTANGLE (90° + Congruent Diagonals)'
        : 'PARALLELOGRAM (Bisecting Diagonals)';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = isSquare ? '#45E6A6' : '#FFE29E';
    ctx.fillText(`Live Classification: ${label}`, 16, 24);
    ctx.fillStyle = '#A8B2C6';
    ctx.fillText(`Interior Sum = (4 − 2)·180° = 360°`, 16, 42);
    return true;
  }

  if (topicId === 'a2-quad-systems') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const m = p1;
    const b = p2 + 0.85 * Math.sin(t * 0.85);
    const a = 0.55;
    const c = -1.6;

    ctx.fillStyle = 'rgba(69, 230, 166, 0.08)';
    ctx.beginPath();
    for (let sx = 0; sx <= width; sx += 4) {
      const x = (sx - cx) / scale;
      const y = a * x * x + c;
      const py = cy - y * scale;
      if (sx === 0) ctx.moveTo(sx, py);
      else ctx.lineTo(sx, py);
    }
    ctx.lineTo(width, 0);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    glowStroke(ctx, '#45E6A6', 2.5, 13, () => {
      for (let sx = 0; sx <= width; sx += 3) {
        const x = (sx - cx) / scale;
        const py = cy - (a * x * x + c) * scale;
        if (sx === 0) ctx.moveTo(sx, py);
        else ctx.lineTo(sx, py);
      }
    });

    const [lx1, ly1] = toPx(-5, m * -5 + b);
    const [lx2, ly2] = toPx(5, m * 5 + b);
    glowStroke(ctx, '#F4C46C', 2.3, 12, () => {
      ctx.moveTo(lx1, ly1);
      ctx.lineTo(lx2, ly2);
    });

    const disc = m * m - 4 * a * (c - b);
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      const roots = disc < 0.04 ? [m / (2 * a)] : [(m - s) / (2 * a), (m + s) / (2 * a)];
      roots.forEach((rx) => {
        const ry = m * rx + b;
        const [px, py] = toPx(rx, ry);
        glowPoint(ctx, px, py, '#FF8563', 5.5);
      });
    }

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = disc > 0.04 ? '#45E6A6' : disc >= 0 ? '#FFE29E' : '#FF8563';
    ctx.fillText(
      `System Discriminant Δ = ${disc.toFixed(2)} → ${disc > 0.04 ? '2 Real Intersections' : disc >= 0 ? '1 Tangent Point' : '0 Real Crossings'}`,
      16,
      24
    );
    return true;
  }

  if (topicId === 'a2-radicals') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const shift = p1;
    const k = p2;

    const [m1x, m1y] = toPx(-4, -4);
    const [m2x, m2y] = toPx(4, 4);
    ctx.strokeStyle = 'rgba(244, 196, 108, 0.34)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(m1x, m1y);
    ctx.lineTo(m2x, m2y);
    ctx.stroke();
    ctx.setLineDash([]);

    glowStroke(ctx, '#F4C46C', 2.4, 12, () => {
      let started = false;
      for (let x = shift; x <= 4.8; x += 0.05) {
        const y = 0.45 * (x - shift) * (x - shift) + k;
        const [px, py] = toPx(x, y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      }
    });

    glowStroke(ctx, '#45E6A6', 2.4, 12, () => {
      let started = false;
      for (let x = k; x <= 4.8; x += 0.05) {
        const y = Math.sqrt((x - k) / 0.45) + shift;
        const [px, py] = toPx(x, y);
        if (!started) {
          ctx.moveTo(px, py);
          started = true;
        } else ctx.lineTo(px, py);
      }
    });

    const u = 0.3 + 2.3 * (0.5 + 0.5 * Math.sin(t * 1.0));
    const fx = shift + u;
    const fy = 0.45 * u * u + k;
    const [pAx, pAy] = toPx(fx, fy);
    const [pBx, pBy] = toPx(fy, fx);
    ctx.strokeStyle = 'rgba(70, 214, 232, 0.65)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pAx, pAy);
    ctx.lineTo(pBx, pBy);
    ctx.stroke();
    ctx.setLineDash([]);

    glowPoint(ctx, pAx, pAy, '#F4C46C', 5.2);
    glowPoint(ctx, pBx, pBy, '#45E6A6', 5.2);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#46D6E8';
    ctx.fillText(`Mirror Swap: f(${fx.toFixed(1)}) = ${fy.toFixed(1)}  ⟺  f⁻¹(${fy.toFixed(1)}) = ${fx.toFixed(1)}`, 16, 24);
    return true;
  }

  if (topicId === 'a2-combinatorics') {
    drawCartographicGrid(ctx, width, height, cx, cy, scale);
    const nRows = Math.round(Math.max(4, Math.min(7, p1)));
    const hiCol = Math.min(nRows, Math.round(p2));
    const topY = 48;
    const rowStep = (height - 115) / nRows;
    const colStep = Math.min(58, (width - 90) / (nRows + 1));

    const tri: number[][] = [];
    for (let r = 0; r <= nRows; r++) {
      const row: number[] = [];
      for (let c = 0; c <= r; c++) {
        row.push(c === 0 || c === r ? 1 : tri[r - 1][c - 1] + tri[r - 1][c]);
      }
      tri.push(row);
    }

    const pos = (r: number, c: number): [number, number] => [
      cx + (c - r / 2) * colStep,
      topY + r * rowStep,
    ];

    const pulseRow = (t * 1.4) % (nRows + 1);
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c <= r; c++) {
        const [x0, y0] = pos(r, c);
        const [xL, yL] = pos(r + 1, c);
        const [xR, yR] = pos(r + 1, c + 1);
        const active = Math.abs(r - pulseRow) < 0.8;
        ctx.strokeStyle = active ? 'rgba(69, 230, 166, 0.58)' : 'rgba(244, 196, 108, 0.22)';
        ctx.lineWidth = active ? 2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(xL, yL);
        ctx.moveTo(x0, y0);
        ctx.lineTo(xR, yR);
        ctx.stroke();
      }
    }

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r <= nRows; r++) {
      for (let c = 0; c <= r; c++) {
        const [nx, ny] = pos(r, c);
        const isTarget = r === nRows && c === hiCol;
        const glow = isTarget ? '#45E6A6' : r === nRows ? '#F4C46C' : '#46D6E8';
        ctx.save();
        ctx.fillStyle = isTarget ? 'rgba(69, 230, 166, 0.28)' : 'rgba(11, 12, 18, 0.94)';
        ctx.strokeStyle = glow;
        ctx.shadowColor = glow;
        ctx.shadowBlur = isTarget ? 12 : 4;
        ctx.lineWidth = isTarget ? 2.2 : 1.3;
        ctx.beginPath();
        ctx.arc(nx, ny, isTarget ? 16 : 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = '#F7F4EC';
        ctx.fillText(String(tri[r][c]), nx, ny);
      }
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const val = tri[nRows][hiCol];
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(`Binomial Row n = ${nRows} · C(${nRows}, ${hiCol}) = ${val} distinct paths`, 16, 24);
    return true;
  }

  if (topicId === 'pc-trig-identities') {
    drawGridAndAxes(ctx, width, height, width * 0.12, cy + height * 0.14, scale);
    const freq = p1;
    const phase = p2;
    const baseY = cy + height * 0.14;
    const ampPx = height * 0.36;

    const yOne = baseY - ampPx;
    ctx.strokeStyle = 'rgba(69, 230, 166, 0.72)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(20, yOne);
    ctx.lineTo(width - 20, yOne);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawWave = (fn: (th: number) => number, col: string) => {
      glowStroke(ctx, col, 2.3, 10, () => {
        for (let sx = 24; sx <= width - 24; sx += 3) {
          const th = ((sx - 24) / (width - 48)) * Math.PI * 2 * freq + t * 0.65;
          const y = baseY - fn(th) * ampPx;
          if (sx === 24) ctx.moveTo(sx, y);
          else ctx.lineTo(sx, y);
        }
      });
    };

    drawWave((th) => Math.sin(th + phase) ** 2, '#FF8563');
    drawWave((th) => Math.cos(th + phase) ** 2, '#46D6E8');

    const probeX = width * 0.54;
    const thP = ((probeX - 24) / (width - 48)) * Math.PI * 2 * freq + t * 0.65 + phase;
    const s2 = Math.sin(thP) ** 2;
    const c2 = Math.cos(thP) ** 2;

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FF8563';
    ctx.beginPath();
    ctx.moveTo(probeX, baseY);
    ctx.lineTo(probeX, baseY - s2 * ampPx);
    ctx.stroke();

    ctx.strokeStyle = '#46D6E8';
    ctx.beginPath();
    ctx.moveTo(probeX, baseY - s2 * ampPx);
    ctx.lineTo(probeX, baseY - (s2 + c2) * ampPx);
    ctx.stroke();

    glowPoint(ctx, probeX, yOne, '#45E6A6', 5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#45E6A6';
    ctx.fillText(`sin²(θ) [${s2.toFixed(2)}] + cos²(θ) [${c2.toFixed(2)}] = ${(s2 + c2).toFixed(3)} (Exact Invariant)`, 16, 24);
    return true;
  }

  if (topicId === 'pc-law-sines') {
    drawCartographicGrid(ctx, width, height, cx, cy, scale);
    const R = Math.min(width, height) * 0.34;
    const angA = -Math.PI * 0.55 + 0.55 * Math.sin(t * 0.75) + (p1 - 1.5) * 0.4;
    const angB = Math.PI * 0.18;
    const angC = Math.PI * 0.82 + (p2 - 1.5) * 0.25;

    const pt = (a: number): [number, number] => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    const A = pt(angA);
    const B = pt(angB);
    const C = pt(angC);

    ctx.strokeStyle = 'rgba(70, 214, 232, 0.36)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.save();
    ctx.fillStyle = 'rgba(255, 133, 99, 0.14)';
    ctx.strokeStyle = '#FF8563';
    ctx.shadowColor = '#FF8563';
    ctx.shadowBlur = 12;
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.lineTo(C[0], C[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const dist = (P: [number, number], Q: [number, number]) =>
      (Math.hypot(P[0] - Q[0], P[1] - Q[1]) / R) * 5;
    const aLen = dist(B, C);
    const bLen = dist(A, C);
    const cLen = dist(A, B);
    const cosA = Math.max(-0.99, Math.min(0.99, (bLen * bLen + cLen * cLen - aLen * aLen) / (2 * bLen * cLen)));
    const degA = (Math.acos(cosA) * 180) / Math.PI;
    const ratio = aLen / Math.sin(Math.acos(cosA));

    glowPoint(ctx, A[0], A[1], '#F4C46C', 5.2);
    glowPoint(ctx, B[0], B[1], '#46D6E8', 4.6);
    glowPoint(ctx, C[0], C[1], '#45E6A6', 4.6);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#46D6E8';
    ctx.fillText(`Circumcircle Invariant: a / sin(A) = ${aLen.toFixed(2)} / sin(${degA.toFixed(1)}°) = ${ratio.toFixed(2)} = 2R`, 16, 24);
    ctx.fillStyle = '#FFE29E';
    ctx.fillText(`Sides: a=${aLen.toFixed(1)} · b=${bLen.toFixed(1)} · c=${cLen.toFixed(1)}`, 16, 42);
    return true;
  }

  if (topicId === 'pc-parametric') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const aFreq = Math.round(p1);
    const bFreq = Math.round(p2);
    const rx = Math.min(width * 0.36, 220);
    const ry = Math.min(height * 0.34, 128);
    const delta = 0.55 + t * 0.25;

    glowStroke(ctx, '#FF8563', 2.3, 14, () => {
      for (let i = 0; i <= 220; i++) {
        const u = (i / 220) * Math.PI * 2;
        const x = cx + rx * Math.sin(aFreq * u + delta);
        const y = cy - ry * Math.sin(bFreq * u);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    });

    const tau = t * 0.85;
    const px = cx + rx * Math.sin(aFreq * tau + delta);
    const py = cy - ry * Math.sin(bFreq * tau);
    const vx = aFreq * Math.cos(aFreq * tau + delta) * 24;
    const vy = -bFreq * Math.cos(bFreq * tau) * 18;

    glowStroke(ctx, '#45E6A6', 2.4, 10, () => {
      ctx.moveTo(px, py);
      ctx.lineTo(px + vx, py + vy);
    });

    glowPoint(ctx, px, py, '#FFE29E', 5.8);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FF8563';
    ctx.fillText(`Lissajous Ratio ${aFreq}:${bFreq} · Velocity vector v(t) = ⟨x′(t), y′(t)⟩`, 16, 24);
    return true;
  }

  return false;
}
