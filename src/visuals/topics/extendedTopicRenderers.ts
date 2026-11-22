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

function drawGridAndAxes(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cx: number,
  cy: number,
  scale: number
) {
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
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
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, cy);
  ctx.lineTo(width, cy);
  ctx.moveTo(cx, 0);
  ctx.lineTo(cx, height);
  ctx.stroke();
}

function glowPoint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  color: string,
  r = 5.2
) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3.4);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 3.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#05070C';
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
    ctx.strokeStyle = 'rgba(56, 217, 255, 0.35)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(vx, 12);
    ctx.lineTo(vx, height - 12);
    ctx.stroke();
    ctx.setLineDash([]);

    // Glow V curve
    const traceV = (lw: number, alpha: number) => {
      ctx.strokeStyle = `rgba(245, 188, 94, ${alpha})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let sx = 12; sx <= width - 12; sx += 3) {
        const x = (sx - cx) / scale;
        const y = a * Math.abs(x - h) + k;
        const py = cy - y * scale;
        if (sx === 12) ctx.moveTo(sx, py);
        else ctx.lineTo(sx, py);
      }
      ctx.stroke();
    };
    traceV(9, 0.16);
    traceV(2.5, 1);

    // Animated symmetric distance caliper |x - h| = d
    const d = 1.15 + 0.85 * Math.sin(t * 1.15);
    const yD = a * d + k;
    const [lx, ly] = toPx(h - d, yD);
    const [rx, ry] = toPx(h + d, yD);
    ctx.strokeStyle = '#36EBA8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.stroke();

    glowPoint(ctx, vx, vy, '#FF7A5C', 5.5);
    glowPoint(ctx, lx, ly, '#36EBA8', 4.5);
    glowPoint(ctx, rx, ry, '#36EBA8', 4.5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#36EBA8';
    ctx.fillText(`Symmetric wings: |x − (${h.toFixed(1)})| = ${d.toFixed(2)}`, 16, 24);
    ctx.fillStyle = '#F5BC5E';
    ctx.fillText(`Vertex V(${h.toFixed(1)}, ${k.toFixed(2)}) · Slopes ±${Math.abs(a).toFixed(2)}`, 16, 42);
    return true;
  }

  if (topicId === 'a1-radicals-exp') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const a = p1;
    const h = p2;
    const [hx, hy] = toPx(h, 0);

    // Forbidden domain region x < h
    ctx.fillStyle = 'rgba(255, 122, 92, 0.08)';
    ctx.fillRect(0, 0, Math.max(0, hx), height);
    ctx.strokeStyle = 'rgba(255, 122, 92, 0.55)';
    ctx.setLineDash([5, 4]);
    ctx.beginPath();
    ctx.moveTo(hx, 0);
    ctx.lineTo(hx, height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Radical curve y = a * sqrt(x - h)
    const drawRad = (lw: number, alpha: number) => {
      ctx.strokeStyle = `rgba(245, 188, 94, ${alpha})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
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
      ctx.stroke();
    };
    drawRad(8, 0.16);
    drawRad(2.6, 1);

    // Ghost parabolic inverse half y = (x/a)^2 + h
    ctx.strokeStyle = 'rgba(56, 217, 255, 0.35)';
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
    glowPoint(ctx, hx, hy, '#FF7A5C', 5);
    glowPoint(ctx, tx, ty, '#36EBA8', 5.2);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#36EBA8';
    ctx.fillText(`Domain: x ≥ ${h.toFixed(1)} · Probe (${xProbe.toFixed(2)}, ${yProbe.toFixed(2)})`, 16, 24);
    ctx.fillStyle = '#FF7A5C';
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

    // Live breathing slight data pulse
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
      // Residual square
      ctx.fillStyle = 'rgba(255, 122, 92, 0.16)';
      ctx.strokeStyle = 'rgba(255, 122, 92, 0.65)';
      ctx.lineWidth = 1.2;
      ctx.fillRect(px, Math.min(py, ly), side, side);
      ctx.strokeRect(px, Math.min(py, ly), side, side);
    }

    // Regression line
    const [xA, yA] = toPx(-4.5, slope * -4.5 + intercept);
    const [xB, yB] = toPx(4.5, slope * 4.5 + intercept);
    ctx.strokeStyle = 'rgba(245, 188, 94, 0.22)';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(xA, yA);
    ctx.lineTo(xB, yB);
    ctx.stroke();

    ctx.strokeStyle = '#F5BC5E';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(xA, yA);
    ctx.lineTo(xB, yB);
    ctx.stroke();

    for (const [x, y] of pts) {
      const [px, py] = toPx(x, y);
      glowPoint(ctx, px, py, '#38D9FF', 4);
    }

    const r2 = Math.max(0, 1 - sse / Math.max(0.001, sst));
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = r2 > 0.85 ? '#36EBA8' : '#F5BC5E';
    ctx.fillText(`Sum of Squared Residuals Σe² = ${sse.toFixed(2)} · Fit R² = ${r2.toFixed(3)}`, 16, 24);
    return true;
  }

  if (topicId === 'g-parallel-angles') {
    const gap = Math.min(height * 0.34, 118);
    const y1 = cy - gap * 0.5;
    const y2 = cy + gap * 0.5;
    const angleDeg = p1 + 14 * Math.sin(t * 0.75);
    const rad = (angleDeg * Math.PI) / 180;
    const dx = Math.cos(rad);
    const dy = Math.sin(rad);

    // Parallel rails
    for (const ry of [y1, y2]) {
      ctx.strokeStyle = 'rgba(56, 217, 255, 0.2)';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(28, ry);
      ctx.lineTo(width - 28, ry);
      ctx.stroke();

      ctx.strokeStyle = '#38D9FF';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(28, ry);
      ctx.lineTo(width - 28, ry);
      ctx.stroke();
    }

    // Intersection points on top and bottom rails
    const t1 = (y1 - cy) / dy;
    const t2 = (y2 - cy) / dy;
    const ix1 = cx + dx * t1;
    const ix2 = cx + dx * t2;

    // Transversal
    ctx.strokeStyle = 'rgba(245, 188, 94, 0.22)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx - dx * 260, cy - dy * 260);
    ctx.lineTo(cx + dx * 260, cy + dy * 260);
    ctx.stroke();

    ctx.strokeStyle = '#F5BC5E';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(cx - dx * 260, cy - dy * 260);
    ctx.lineTo(cx + dx * 260, cy + dy * 260);
    ctx.stroke();

    // Angle wedges: alternate interior (emerald) + supplementary (coral)
    const drawWedge = (vx: number, vy: number, a0: number, a1: number, col: string) => {
      ctx.fillStyle = `${col}38`;
      ctx.strokeStyle = col;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(vx, vy);
      ctx.arc(vx, vy, 34, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawWedge(ix1, y1, 0, rad, '#36EBA8');
    drawWedge(ix2, y2, Math.PI, Math.PI + rad, '#36EBA8');
    drawWedge(ix1, y1, rad, Math.PI, '#FF7A5C');
    drawWedge(ix2, y2, 0, rad, '#38D9FF');

    glowPoint(ctx, ix1, y1, '#F5BC5E', 4.5);
    glowPoint(ctx, ix2, y2, '#F5BC5E', 4.5);

    const supp = 180 - angleDeg;
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#36EBA8';
    ctx.fillText(`Alternate Interior & Corresponding: α = ${angleDeg.toFixed(1)}°`, 16, 24);
    ctx.fillStyle = '#FF7A5C';
    ctx.fillText(`Linear Pair Supplement: β = ${supp.toFixed(1)}°  (α + β = 180.0°)`, 16, 42);
    return true;
  }

  if (topicId === 'g-similarity') {
    const k = p1 + 0.18 * Math.sin(t * 0.9);
    const ox = width * 0.16;
    const oy = height * 0.78;
    const baseTri: [number, number][] = [
      [84, -18],
      [152, -18],
      [126, -78],
    ];
    const scaledTri: [number, number][] = baseTri.map(([x, y]) => [x * k, y * k]);

    // Homothety projection rays
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
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
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(ox + x, oy + y);
        else ctx.lineTo(ox + x, oy + y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };
    drawPoly(scaledTri, '#F5BC5E', 'rgba(245, 188, 94, 0.15)');
    drawPoly(baseTri, '#38D9FF', 'rgba(56, 217, 255, 0.25)');
    glowPoint(ctx, ox, oy, '#36EBA8', 5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38D9FF';
    ctx.fillText(`Scale Factor k = ${k.toFixed(2)} · Perimeter scales ×${k.toFixed(2)}`, 16, 24);
    ctx.fillStyle = '#F5BC5E';
    ctx.fillText(`Area Ratio A′ / A = k² = ${(k * k).toFixed(2)}× (Angles strictly preserved)`, 16, 42);
    return true;
  }

  if (topicId === 'g-quadrilaterals') {
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

    ctx.fillStyle = 'rgba(56, 217, 255, 0.14)';
    ctx.strokeStyle = '#38D9FF';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Diagonals
    ctx.strokeStyle = '#F5BC5E';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    ctx.lineTo(pts[2][0], pts[2][1]);
    ctx.stroke();

    ctx.strokeStyle = '#36EBA8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(pts[1][0], pts[1][1]);
    ctx.lineTo(pts[3][0], pts[3][1]);
    ctx.stroke();

    pts.forEach(([x, y]) => glowPoint(ctx, x, y, '#38D9FF', 4.5));
    glowPoint(ctx, cx, cy, '#FF7A5C', 5);

    const isRect = Math.abs(shear) < 0.12;
    const isSquare = isRect && Math.abs(halfW - halfH) < 14;
    const label = isSquare ? 'SQUARE (90° + Equal Sides + ⊥ Diagonals)' : isRect ? 'RECTANGLE (90° + Congruent Diagonals)' : 'PARALLELOGRAM (Bisecting Diagonals)';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = isSquare ? '#36EBA8' : '#F5BC5E';
    ctx.fillText(`Live Classification: ${label}`, 16, 24);
    ctx.fillStyle = '#A5B4CC';
    ctx.fillText(`Interior Sum = (4 − 2)·180° = 360°`, 16, 42);
    return true;
  }

  if (topicId === 'a2-quad-systems') {
    drawGridAndAxes(ctx, width, height, cx, cy, scale);
    const m = p1;
    const b = p2 + 0.85 * Math.sin(t * 0.85);
    const a = 0.55;
    const c = -1.6;

    // Shaded region inside parabola
    ctx.fillStyle = 'rgba(54, 235, 168, 0.08)';
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

    // Parabola y = ax^2 + c
    ctx.strokeStyle = '#36EBA8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let sx = 0; sx <= width; sx += 3) {
      const x = (sx - cx) / scale;
      const py = cy - (a * x * x + c) * scale;
      if (sx === 0) ctx.moveTo(sx, py);
      else ctx.lineTo(sx, py);
    }
    ctx.stroke();

    // Line y = mx + b
    const [lx1, ly1] = toPx(-5, m * -5 + b);
    const [lx2, ly2] = toPx(5, m * 5 + b);
    ctx.strokeStyle = '#F5BC5E';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(lx1, ly1);
    ctx.lineTo(lx2, ly2);
    ctx.stroke();

    // Solve ax^2 - mx + (c - b) = 0
    const disc = m * m - 4 * a * (c - b);
    if (disc >= 0) {
      const s = Math.sqrt(disc);
      const roots = disc < 0.04 ? [m / (2 * a)] : [(m - s) / (2 * a), (m + s) / (2 * a)];
      roots.forEach((rx) => {
        const ry = m * rx + b;
        const [px, py] = toPx(rx, ry);
        glowPoint(ctx, px, py, '#FF7A5C', 5.5);
      });
    }

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = disc > 0.04 ? '#36EBA8' : disc >= 0 ? '#F5BC5E' : '#FF7A5C';
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

    // Mirror y = x
    const [m1x, m1y] = toPx(-4, -4);
    const [m2x, m2y] = toPx(4, 4);
    ctx.strokeStyle = 'rgba(255,255,255,0.28)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(m1x, m1y);
    ctx.lineTo(m2x, m2y);
    ctx.stroke();
    ctx.setLineDash([]);

    // f(x) = 0.45(x - shift)^2 + k (domain x >= shift)
    ctx.strokeStyle = '#F5BC5E';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    let started = false;
    for (let x = shift; x <= 4.8; x += 0.05) {
      const y = 0.45 * (x - shift) * (x - shift) + k;
      const [px, py] = toPx(x, y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // f^-1(x) = sqrt((x - k)/0.45) + shift
    ctx.strokeStyle = '#36EBA8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    started = false;
    for (let x = k; x <= 4.8; x += 0.05) {
      const y = Math.sqrt((x - k) / 0.45) + shift;
      const [px, py] = toPx(x, y);
      if (!started) {
        ctx.moveTo(px, py);
        started = true;
      } else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Live reflection photon bouncing across y = x
    const u = 0.3 + 2.3 * (0.5 + 0.5 * Math.sin(t * 1.0));
    const fx = shift + u;
    const fy = 0.45 * u * u + k;
    const [pAx, pAy] = toPx(fx, fy);
    const [pBx, pBy] = toPx(fy, fx);
    ctx.strokeStyle = 'rgba(56, 217, 255, 0.6)';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(pAx, pAy);
    ctx.lineTo(pBx, pBy);
    ctx.stroke();
    ctx.setLineDash([]);

    glowPoint(ctx, pAx, pAy, '#F5BC5E', 5.2);
    glowPoint(ctx, pBx, pBy, '#36EBA8', 5.2);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38D9FF';
    ctx.fillText(`Mirror Swap: f(${fx.toFixed(1)}) = ${fy.toFixed(1)}  ⟺  f⁻¹(${fy.toFixed(1)}) = ${fx.toFixed(1)}`, 16, 24);
    return true;
  }

  if (topicId === 'a2-combinatorics') {
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

    // Edges + animated cascading photon pulses
    const pulseRow = (t * 1.4) % (nRows + 1);
    for (let r = 0; r < nRows; r++) {
      for (let c = 0; c <= r; c++) {
        const [x0, y0] = pos(r, c);
        const [xL, yL] = pos(r + 1, c);
        const [xR, yR] = pos(r + 1, c + 1);
        const active = Math.abs(r - pulseRow) < 0.8;
        ctx.strokeStyle = active ? 'rgba(54, 235, 168, 0.55)' : 'rgba(56, 217, 255, 0.18)';
        ctx.lineWidth = active ? 2 : 1.1;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(xL, yL);
        ctx.moveTo(x0, y0);
        ctx.lineTo(xR, yR);
        ctx.stroke();
      }
    }

    // Nodes
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let r = 0; r <= nRows; r++) {
      for (let c = 0; c <= r; c++) {
        const [nx, ny] = pos(r, c);
        const isTarget = r === nRows && c === hiCol;
        const glow = isTarget ? '#36EBA8' : r === nRows ? '#F5BC5E' : '#38D9FF';
        ctx.fillStyle = isTarget ? 'rgba(54, 235, 168, 0.28)' : 'rgba(9, 14, 24, 0.92)';
        ctx.strokeStyle = glow;
        ctx.lineWidth = isTarget ? 2.2 : 1.3;
        ctx.beginPath();
        ctx.arc(nx, ny, isTarget ? 16 : 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F4F3EE';
        ctx.fillText(String(tri[r][c]), nx, ny);
      }
    }
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    const val = tri[nRows][hiCol];
    ctx.fillStyle = '#36EBA8';
    ctx.fillText(`Binomial Row n = ${nRows} · C(${nRows}, ${hiCol}) = ${val} distinct paths`, 16, 24);
    return true;
  }

  if (topicId === 'pc-trig-identities') {
    drawGridAndAxes(ctx, width, height, width * 0.12, cy + height * 0.14, scale);
    const freq = p1;
    const phase = p2;
    const baseY = cy + height * 0.14;
    const ampPx = height * 0.36;

    // Conservation ceiling y = 1
    const yOne = baseY - ampPx;
    ctx.strokeStyle = 'rgba(54, 235, 168, 0.7)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(20, yOne);
    ctx.lineTo(width - 20, yOne);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawWave = (fn: (th: number) => number, col: string) => {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      for (let sx = 24; sx <= width - 24; sx += 3) {
        const th = ((sx - 24) / (width - 48)) * Math.PI * 2 * freq + t * 0.65;
        const y = baseY - fn(th) * ampPx;
        if (sx === 24) ctx.moveTo(sx, y);
        else ctx.lineTo(sx, y);
      }
      ctx.stroke();
    };

    drawWave((th) => Math.sin(th + phase) ** 2, '#FF7A5C');
    drawWave((th) => Math.cos(th + phase) ** 2, '#38D9FF');

    // Live vertical energy-stack probe showing sin^2 + cos^2 = 1.000
    const probeX = width * 0.54;
    const thP = ((probeX - 24) / (width - 48)) * Math.PI * 2 * freq + t * 0.65 + phase;
    const s2 = Math.sin(thP) ** 2;
    const c2 = Math.cos(thP) ** 2;

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#FF7A5C';
    ctx.beginPath();
    ctx.moveTo(probeX, baseY);
    ctx.lineTo(probeX, baseY - s2 * ampPx);
    ctx.stroke();

    ctx.strokeStyle = '#38D9FF';
    ctx.beginPath();
    ctx.moveTo(probeX, baseY - s2 * ampPx);
    ctx.lineTo(probeX, baseY - (s2 + c2) * ampPx);
    ctx.stroke();

    glowPoint(ctx, probeX, yOne, '#36EBA8', 5);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#36EBA8';
    ctx.fillText(`sin²(θ) [${s2.toFixed(2)}] + cos²(θ) [${c2.toFixed(2)}] = ${(s2 + c2).toFixed(3)} (Exact Invariant)`, 16, 24);
    return true;
  }

  if (topicId === 'pc-law-sines') {
    const R = Math.min(width, height) * 0.34;
    const angA = -Math.PI * 0.55 + 0.55 * Math.sin(t * 0.75) + (p1 - 1.5) * 0.4;
    const angB = Math.PI * 0.18;
    const angC = Math.PI * 0.82 + (p2 - 1.5) * 0.25;

    const pt = (a: number): [number, number] => [cx + R * Math.cos(a), cy + R * Math.sin(a)];
    const A = pt(angA);
    const B = pt(angB);
    const C = pt(angC);

    // Circumcircle diameter 2R
    ctx.strokeStyle = 'rgba(56, 217, 255, 0.34)';
    ctx.setLineDash([5, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Triangle
    ctx.fillStyle = 'rgba(255, 122, 92, 0.14)';
    ctx.strokeStyle = '#FF7A5C';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(A[0], A[1]);
    ctx.lineTo(B[0], B[1]);
    ctx.lineTo(C[0], C[1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Side lengths in unit radius terms (R = 5 units)
    const dist = (P: [number, number], Q: [number, number]) =>
      (Math.hypot(P[0] - Q[0], P[1] - Q[1]) / R) * 5;
    const aLen = dist(B, C);
    const bLen = dist(A, C);
    const cLen = dist(A, B);
    const cosA = Math.max(-0.99, Math.min(0.99, (bLen * bLen + cLen * cLen - aLen * aLen) / (2 * bLen * cLen)));
    const degA = (Math.acos(cosA) * 180) / Math.PI;
    const ratio = aLen / Math.sin(Math.acos(cosA));

    glowPoint(ctx, A[0], A[1], '#F5BC5E', 5.2);
    glowPoint(ctx, B[0], B[1], '#38D9FF', 4.6);
    glowPoint(ctx, C[0], C[1], '#36EBA8', 4.6);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#38D9FF';
    ctx.fillText(`Circumcircle Invariant: a / sin(A) = ${aLen.toFixed(2)} / sin(${degA.toFixed(1)}°) = ${ratio.toFixed(2)} = 2R`, 16, 24);
    ctx.fillStyle = '#F5BC5E';
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

    // Glowing Lissajous curve
    const traceCurve = (lw: number, alpha: number) => {
      ctx.strokeStyle = `rgba(255, 122, 92, ${alpha})`;
      ctx.lineWidth = lw;
      ctx.beginPath();
      for (let i = 0; i <= 220; i++) {
        const u = (i / 220) * Math.PI * 2;
        const x = cx + rx * Math.sin(aFreq * u + delta);
        const y = cy - ry * Math.sin(bFreq * u);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    traceCurve(8, 0.16);
    traceCurve(2.2, 0.95);

    // Moving particle + velocity tangent vector v(t) = <x'(t), y'(t)>
    const tau = t * 0.85;
    const px = cx + rx * Math.sin(aFreq * tau + delta);
    const py = cy - ry * Math.sin(bFreq * tau);
    const vx = aFreq * Math.cos(aFreq * tau + delta) * 24;
    const vy = -bFreq * Math.cos(bFreq * tau) * 18;

    ctx.strokeStyle = '#36EBA8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + vx, py + vy);
    ctx.stroke();

    glowPoint(ctx, px, py, '#F5BC5E', 5.8);

    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#FF7A5C';
    ctx.fillText(`Lissajous Ratio ${aFreq}:${bFreq} · Velocity vector v(t) = ⟨x′(t), y′(t)⟩`, 16, 24);
    return true;
  }

  return false;
}
