/* Hero 3D delle pagine interne: una scena diversa per ogni pagina (Three.js) */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const RED = '#E1001A';
const clamp = (v, a = 0, b = 1) => Math.min(Math.max(v, a), b);
const ease = (x) => 1 - Math.pow(1 - clamp(x), 3);
const back = (x) => { const k = clamp(x) - 1; return 1 + 2.6 * k * k * k + 1.6 * k * k; };
const END = '#include <tonemapping_fragment>\n#include <colorspace_fragment>';

function seeded(a) {
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Texture disegnata su canvas, ridisegnata quando il font è pronto */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  const paint = () => { x.clearRect(0, 0, w, h); draw(x, w, h); };
  paint();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.userData.repaint = () => { paint(); tex.needsUpdate = true; };
  if (document.fonts) document.fonts.load('500 48px "General Sans"').then(tex.userData.repaint).catch(() => {});
  return tex;
}

function heartPath(x, cx, cy, s) {
  x.beginPath();
  x.moveTo(cx, cy + s * 0.8);
  x.bezierCurveTo(cx - s * 1.3, cy + s * 0.1, cx - s * 0.7, cy - s * 1.1, cx, cy - s * 0.3);
  x.bezierCurveTo(cx + s * 0.7, cy - s * 1.1, cx + s * 1.3, cy + s * 0.1, cx, cy + s * 0.8);
  x.fill();
}

/* Luce da studio fotografico per i riflessi dei materiali */
function studio(renderer) {
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(12, 12, 12), new THREE.MeshBasicMaterial({ color: 0x555555, side: THREE.BackSide })));
  const panel = (w, h, x, y, z, k) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  panel(8, 3, 0, 5.5, 1, 5); panel(3, 5, -5.5, 1, 2, 3); panel(3, 5, 5.5, 0, -1, 2); panel(6, 6, 0, 0, 5.5, 1.2);
  const tex = pm.fromScene(env, 0.035).texture;
  pm.dispose();
  env.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
  return tex;
}

/* ------------------------------------------- Alterego: il metro da sarta, vero
   Un nastro di 150 cm simulato (Verlet): cade sul tavolo di lana, si piega e si posa con il suo peso.
   Centimetri davanti, pollici dietro, puntali in ottone. Col mouse lo sposti; tenendo premuto lo sollevi. */
function tapePrint(W, H, inch) {
  return canvasTex(W, H, (x, w, h) => {
    x.fillStyle = inch ? '#EFE3C4' : '#F1EBDD';
    x.fillRect(0, 0, w, h);
    const r = seeded(inch ? 11 : 5);
    for (let i = 0; i < w * 0.8; i++) { x.fillStyle = `rgba(80,60,30,${0.02 + r() * 0.035})`; x.fillRect(r() * w, r() * h, 1 + r() * 3, 1); }
    const units = inch ? 59 : 150, sub = inch ? 8 : 10, per = w / (inch ? 150 / 2.54 : 150);
    x.fillStyle = '#1B1B1B';
    for (let i = 0; i <= units * sub; i++) {
      const px = (i / sub) * per;
      const major = i % sub === 0, half = i % (sub / 2) === 0;
      const len = h * (major ? 0.3 : half ? 0.21 : 0.12);
      const lw = major ? Math.max(2, per * 0.028) : Math.max(1, per * 0.014);
      x.fillRect(px - lw / 2, 0, lw, len);
      x.fillRect(px - lw / 2, h - len, lw, len);
    }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let k = 1; k <= units; k++) {
      const red = inch ? k % 12 === 0 : k % 10 === 0;
      x.fillStyle = red ? RED : '#1B1B1B';
      x.font = `500 ${Math.round(h * (red ? 0.36 : 0.3))}px "General Sans", Arial, sans-serif`;
      x.fillText(String(k), k * per, h / 2 + h * 0.03);
    }
  });
}

function woolTexture() {
  const tex = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#7f7f7f'; x.fillRect(0, 0, w, h);
    const r = seeded(3);
    for (let i = 0; i < 9000; i++) { const g = 100 + r() * 60; x.fillStyle = `rgba(${g},${g},${g},.25)`; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1); }
    x.strokeStyle = 'rgba(0,0,0,.08)'; x.lineWidth = 1.2;
    for (let i = -h; i < w; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.stroke(); }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(26, 26);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

function tape(ctx) {
  const { scene, camera, renderer, canvas, bg } = ctx;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  scene.fog = new THREE.Fog(bg, 11, 24);

  const N = 220, LEN = 15, SEG = LEN / (N - 1), W = 0.16, TH = 0.006, STEP = 1 / 120, G = -7;
  const pos = new Float32Array(N * 3), prev = new Float32Array(N * 3), side = new Float32Array(N * 3), tan = new Float32Array(N * 3), nor = new Float32Array(N * 3);
  let cx = 2.2, grabbed = -1, acc = 0;
  const grabAt = new THREE.Vector3(), hover = new THREE.Vector3(), hasHover = { on: false };

  // ---------- materiali e oggetti
  const maxTex = renderer.capabilities.maxTextureSize >= 8192 ? 8192 : 4096;
  const front = tapePrint(maxTex, Math.round(maxTex / (LEN / W)), false);
  const backT = tapePrint(maxTex, Math.round(maxTex / (LEN / W)), true);
  [front, backT].forEach((t) => { t.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
  const tapeMat = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.46, clearcoat: 0.3, clearcoatRoughness: 0.45 });
  const mkGeo = (back) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    g.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(N * 2 * 3), 3));
    const uv = new Float32Array(N * 2 * 2), idx = [];
    for (let i = 0; i < N; i++) {
      const u = i / (N - 1);
      uv.set([u, back ? 1 : 0, u, back ? 0 : 1], i * 4);
      if (i < N - 1) {
        const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
        if (back) idx.push(a, c, b, b, c, d); else idx.push(a, b, c, b, d, c);
      }
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };
  const faceF = new THREE.Mesh(mkGeo(false), tapeMat(front));
  const faceB = new THREE.Mesh(mkGeo(true), tapeMat(backT));
  [faceF, faceB].forEach((m) => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); });

  const brass = new THREE.MeshStandardMaterial({ color: 0xD2B07A, metalness: 0.9, roughness: 0.22 });
  const capGeo = new THREE.BoxGeometry(W * 1.02, TH * 2, 0.12);
  const caps = [new THREE.Mesh(capGeo, brass), new THREE.Mesh(capGeo, brass)];
  caps.forEach((m) => { m.castShadow = true; m.matrixAutoUpdate = false; scene.add(m); });

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshStandardMaterial({ color: 0x22211F, roughness: 0.96, bumpMap: woolTexture(), bumpScale: 0.6 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);

  const key = new THREE.DirectionalLight(0xFFF4E6, 2.4);
  key.position.set(-4, 9, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 30 });
  key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  scene.add(key, key.target);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x2a2622, 0.35));
  const rim = new THREE.DirectionalLight(0xffffff, 0.6);
  rim.position.set(5, 3, -6);
  scene.add(rim);

  // ---------- simulazione
  const drop = () => {
    const r = seeded(Math.floor(Math.random() * 1e6));
    const ph = r() * 6.28;
    for (let i = 0; i < N; i++) {
      const s = i / (N - 1);
      const x = cx + Math.sin(s * 9.5 + ph) * 1.25 + (s - 0.5) * 2.6;
      const z = Math.sin(s * 14 + ph * 0.7) * 0.95 + Math.cos(s * 4.1 + ph) * 0.35;
      const y = 0.35 + s * 1.8 + Math.sin(s * 17) * 0.12;
      pos.set([x, y, z], i * 3);
      prev.set([x + (r() - 0.5) * 0.004, y + 0.004, z + (r() - 0.5) * 0.004], i * 3);
    }
    for (let i = 0; i < N; i++) {
      const a = Math.max(i - 1, 0) * 3, b = Math.min(i + 1, N - 1) * 3;
      const tx = pos[b] - pos[a], tz = pos[b + 2] - pos[a + 2], l = Math.hypot(tx, tz) || 1;
      side.set([-tz / l, 0, tx / l], i * 3);
    }
  };

  const step = () => {
    const h2 = STEP * STEP;
    for (let i = 0; i < N; i++) {
      if (i === grabbed) continue;
      const k = i * 3;
      const onFloor = pos[k + 1] <= TH * 0.75;
      const fr = onFloor ? 0.86 : 0.995;
      for (let a = 0; a < 3; a++) {
        const v = (pos[k + a] - prev[k + a]) * (a === 1 ? 0.995 : fr);
        prev[k + a] = pos[k + a];
        pos[k + a] += v + (a === 1 ? G * h2 : 0);
      }
    }
    if (grabbed >= 0) {
      const k = grabbed * 3;
      pos[k] += (grabAt.x - pos[k]) * 0.35; pos[k + 1] += (grabAt.y - pos[k + 1]) * 0.35; pos[k + 2] += (grabAt.z - pos[k + 2]) * 0.35;
      prev[k] = pos[k]; prev[k + 1] = pos[k + 1]; prev[k + 2] = pos[k + 2];
    }
    for (let it = 0; it < 14; it++) {
      for (let i = 0; i < N - 1; i++) {
        const a = i * 3, b = a + 3;
        const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2];
        const d = Math.hypot(dx, dy, dz) || 1e-6, diff = (d - SEG) / d;
        const wa = i === grabbed ? 0 : 1, wb = i + 1 === grabbed ? 0 : 1, ws = wa + wb || 1;
        pos[a] += dx * diff * wa / ws; pos[a + 1] += dy * diff * wa / ws; pos[a + 2] += dz * diff * wa / ws;
        pos[b] -= dx * diff * wb / ws; pos[b + 1] -= dy * diff * wb / ws; pos[b + 2] -= dz * diff * wb / ws;
      }
      if (it % 2 === 0) {
        // il nastro è largo e piatto: si curva morbido, non fa spigoli
        for (const [gap, min, kk] of [[2, SEG * 1.965, 0.45], [5, SEG * 4.7, 0.18]]) {
          for (let i = 0; i < N - gap; i++) {
            const a = i * 3, b = (i + gap) * 3;
            const dx = pos[b] - pos[a], dy = pos[b + 1] - pos[a + 1], dz = pos[b + 2] - pos[a + 2];
            const d = Math.hypot(dx, dy, dz) || 1e-6;
            if (d >= min) continue;
            const f = ((min - d) / d) * kk * 0.5;
            if (i !== grabbed) { pos[a] -= dx * f; pos[a + 1] -= dy * f; pos[a + 2] -= dz * f; }
            if (i + gap !== grabbed) { pos[b] += dx * f; pos[b + 1] += dy * f; pos[b + 2] += dz * f; }
          }
        }
      }
      for (let i = 0; i < N; i++) if (pos[i * 3 + 1] < TH * 0.5) pos[i * 3 + 1] = TH * 0.5;
    }
    // dove il nastro si sovrappone, un tratto si appoggia sull'altro
    for (let i = 0; i < N; i++) {
      for (let j = i + 4; j < N; j++) {
        const a = i * 3, b = j * 3;
        const dx = pos[b] - pos[a], dz = pos[b + 2] - pos[a + 2];
        if (dx * dx + dz * dz > W * W * 0.36) continue;
        const dy = pos[b + 1] - pos[a + 1], gap = TH * 1.6;
        if (Math.abs(dy) >= gap) continue;
        const push = (gap - Math.abs(dy)) * 0.5, up = dy >= 0 ? b : a, dn = dy >= 0 ? a : b;
        pos[up + 1] += push;
        pos[dn + 1] = Math.max(TH * 0.5, pos[dn + 1] - push);
      }
    }
    if (hasHover.on && grabbed < 0) {
      for (let i = 0; i < N; i++) {
        const k = i * 3;
        if (pos[k + 1] > 0.25) continue;
        const dx = pos[k] - hover.x, dz = pos[k + 2] - hover.z, d = Math.hypot(dx, dz), R = 0.32;
        if (d < R && d > 1e-4) { pos[k] += (dx / d) * (R - d) * 0.35; pos[k + 2] += (dz / d) * (R - d) * 0.35; }
      }
    }
  };

  // ---------- geometria dal nastro simulato
  const T = new THREE.Vector3(), S = new THREE.Vector3(), Nn = new THREE.Vector3(), F = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), m4 = new THREE.Matrix4();
  const build = () => {
    for (let i = 0; i < N; i++) {
      const a = Math.max(i - 1, 0) * 3, b = Math.min(i + 1, N - 1) * 3, k = i * 3;
      T.set(pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]).normalize();
      tan.set([T.x, T.y, T.z], k);
      S.set(side[k], side[k + 1], side[k + 2]);
      S.addScaledVector(T, -S.dot(T));
      if (pos[k + 1] < 0.05) {
        // appoggiato al tavolo il nastro sta piatto
        F.crossVectors(T, UP).normalize();
        if (F.dot(S) < 0) F.negate();
        S.copy(F);
      }
      S.normalize();
      if (i > 0 && S.x * side[k - 3] + S.y * side[k - 2] + S.z * side[k - 1] < 0) S.negate();
      side.set([S.x, S.y, S.z], k);
    }
    for (let i = 1; i < N - 1; i++) {
      const k = i * 3;
      S.set(side[k - 3] + 2 * side[k] + side[k + 3], side[k - 2] + 2 * side[k + 1] + side[k + 4], side[k - 1] + 2 * side[k + 2] + side[k + 5]).normalize();
      side.set([S.x, S.y, S.z], k);
    }
    const pf = faceF.geometry.attributes.position.array, nf = faceF.geometry.attributes.normal.array;
    const pb = faceB.geometry.attributes.position.array, nb = faceB.geometry.attributes.normal.array;
    for (let i = 0; i < N; i++) {
      const k = i * 3;
      T.set(tan[k], tan[k + 1], tan[k + 2]);
      S.set(side[k], side[k + 1], side[k + 2]);
      Nn.crossVectors(S, T).normalize();
      nor.set([Nn.x, Nn.y, Nn.z], k);
      for (let e = 0; e < 2; e++) {
        const o = (i * 2 + e) * 3, sg = e ? 0.5 : -0.5;
        for (let c = 0; c < 3; c++) {
          const base = pos[k + c] + side[k + c] * W * sg;
          pf[o + c] = base + nor[k + c] * TH * 0.5; nf[o + c] = nor[k + c];
          pb[o + c] = base - nor[k + c] * TH * 0.5; nb[o + c] = -nor[k + c];
        }
      }
    }
    [faceF, faceB].forEach((m) => { m.geometry.attributes.position.needsUpdate = true; m.geometry.attributes.normal.needsUpdate = true; });
    [[0, 1], [N - 1, N - 2]].forEach(([i, j], n) => {
      const k = i * 3;
      T.set(pos[k] - pos[j * 3], pos[k + 1] - pos[j * 3 + 1], pos[k + 2] - pos[j * 3 + 2]).normalize();
      S.set(side[k], side[k + 1], side[k + 2]);
      Nn.set(nor[k], nor[k + 1], nor[k + 2]);
      m4.makeBasis(S, Nn, T).setPosition(pos[k] - T.x * 0.05, pos[k + 1] - T.y * 0.05, pos[k + 2] - T.z * 0.05);
      caps[n].matrix.copy(m4);
    });
  };

  // ---------- mouse: sposta il nastro, tieni premuto per sollevarlo
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), ndc = new THREE.Vector2();
  const hit = (e) => {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ray.setFromCamera(ndc, camera);
    return ray.ray.intersectPlane(plane, new THREE.Vector3());
  };
  const nearest = (p) => {
    let best = -1, bd = 0.45;
    for (let i = 0; i < N; i++) { const d = Math.hypot(pos[i * 3] - p.x, pos[i * 3 + 2] - p.z); if (d < bd) { bd = d; best = i; } }
    return best;
  };
  canvas.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const p = hit(e);
    if (!p) return;
    hover.copy(p); hasHover.on = true;
    if (grabbed >= 0) grabAt.set(p.x, 0.9, p.z);
    canvas.style.cursor = grabbed >= 0 ? 'grabbing' : nearest(p) >= 0 ? 'grab' : '';
  });
  canvas.addEventListener('pointerleave', () => { hasHover.on = false; });
  canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const p = hit(e);
    if (!p) return;
    grabbed = nearest(p);
    if (grabbed >= 0) { grabAt.set(p.x, 0.9, p.z); canvas.setPointerCapture(e.pointerId); }
  });
  const release = () => { grabbed = -1; canvas.style.cursor = ''; };
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  canvas.addEventListener('dblclick', () => { drop(); });

  const target = new THREE.Vector3();
  let dropped = false;
  return {
    layout(c) {
      cx = c.mobile ? 0 : 1.9;
      target.set(c.mobile ? 0 : 0.5, 0, 0.15);
      if (!dropped) {
        // il nastro cade solo quando la scena sa se è su telefono o su schermo grande
        dropped = true;
        drop();
        if (reduce) { for (let i = 0; i < 900; i++) step(); }
        build();
      }
    },
    update(t, dt, p, c) {
      if (dt > 0) {
        acc = Math.min(acc + dt, STEP * 4);
        while (acc >= STEP) { step(); acc -= STEP; }
        build();
      }
      const far = c.mobile ? 1.15 : 1;
      camera.position.set(target.x + c.smooth.x * 0.35, (3.6 - p * 1.1) * far, target.z + (4.1 - p * 0.8) * far);
      camera.lookAt(target);
      key.target.position.copy(target);
    },
  };
}

/* ------------------------------------------- Prova virtuale: l'abito fatto di punti */
const DOTS_VS = `
uniform float uMorph; uniform float uTime; uniform float uScan; uniform float uBurst; uniform float uSize;
attribute vec3 aStart; attribute float aRand;
varying float vGlow; varying float vA;
void main() {
  float m = smoothstep(0.0, 1.0, clamp(uMorph * 1.5 - aRand * 0.5, 0.0, 1.0));
  vec3 p = mix(aStart, position, m);
  float glow = smoothstep(0.22, 0.0, abs(position.y - uScan)) * m;
  p.xz *= 1.0 + glow * 0.07;
  p += normalize(p + vec3(0.0001)) * uBurst * (0.5 + aRand * 2.0);
  p.y += sin(uTime * 1.2 + aRand * 30.0) * 0.008;
  vGlow = glow;
  vA = 0.35 + 0.65 * m;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = uSize * (0.6 + aRand * 0.6 + glow * 1.4) / -mv.z;
  gl_Position = projectionMatrix * mv;
}`;
const DOTS_FS = `
uniform vec3 uInk; uniform vec3 uRed;
varying float vGlow; varying float vA;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  gl_FragColor = vec4(mix(uInk, uRed, vGlow), vA * smoothstep(0.5, 0.2, r));
  ${END}
}`;

function dress(ctx) {
  const { rand } = ctx;
  const N = ctx.mobile ? 9000 : 22000;
  const R = (y) => (y > 0.9 ? 0.4 + 0.06 * Math.sin(((y - 0.9) / 0.55) * Math.PI) : y > 0.35 ? 0.29 + ((y - 0.35) / 0.55) * 0.11 : 0.29 + Math.pow((0.35 - y) / 2.65, 1.25) * 1.5);
  const pos = new Float32Array(N * 3), start = new Float32Array(N * 3), rnd = new Float32Array(N);
  let i = 0;
  while (i < N) {
    const y = -2.3 + rand() * 3.75;
    const r = R(y);
    if (rand() * 1.8 > r) continue;
    const a = rand() * Math.PI * 2;
    const rr = r * (y < 0.35 ? 1 + 0.06 * Math.sin(a * 9 + y * 1.3) : 1) * (0.97 + rand() * 0.05);
    pos.set([Math.cos(a) * rr, y, Math.sin(a) * rr], i * 3);
    const s = 4 + rand() * 4, th = rand() * 6.283, ph = Math.acos(rand() * 2 - 1);
    start.set([s * Math.sin(ph) * Math.cos(th), s * Math.cos(ph), s * Math.sin(ph) * Math.sin(th)], i * 3);
    rnd[i] = rand();
    i++;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aStart', new THREE.BufferAttribute(start, 3));
  geo.setAttribute('aRand', new THREE.BufferAttribute(rnd, 1));
  const u = {
    uMorph: { value: 0 }, uTime: { value: 0 }, uScan: { value: 0 }, uBurst: { value: 0 },
    uSize: { value: 21 * ctx.renderer.getPixelRatio() }, uInk: { value: new THREE.Color('#141414') }, uRed: { value: new THREE.Color(RED) },
  };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms: u, vertexShader: DOTS_VS, fragmentShader: DOTS_FS, transparent: true, depthWrite: false }));
  pts.frustumCulled = false;
  const ringPts = [];
  for (let k = 0; k < 128; k++) { const a = (k / 128) * Math.PI * 2; ringPts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a))); }
  const ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(ringPts), new THREE.LineBasicMaterial({ color: RED, transparent: true }));
  const g = new THREE.Group();
  g.add(pts, ring);
  ctx.scene.add(g);
  return {
    layout(c) { g.position.set(c.mobile ? 0 : c.halfW * 0.42, c.mobile ? 0.25 : 0.55, 0); g.scale.setScalar(c.mobile ? 0.68 : 0.8); },
    update(t, dt, p, c) {
      const morph = ease(t / 2.6);
      const scan = -0.45 + Math.sin(t * 0.55) * 1.85;
      u.uTime.value = t; u.uMorph.value = morph; u.uScan.value = scan; u.uBurst.value = p * 3;
      ring.position.y = scan;
      ring.scale.setScalar(R(scan) * 1.07 + 0.04);
      ring.material.opacity = clamp((morph - 0.8) * 5) * (1 - p);
      g.rotation.y = t * 0.25 + c.smooth.x * 0.9;
      g.rotation.x = -c.smooth.y * 0.2;
    },
  };
}

/* ------------------------------------- Sartoria: l'ago cuce il cuore su un fondo di lino */
function makeNeedle() {
  const m = new THREE.MeshStandardMaterial({ color: '#d9dde2', metalness: 1, roughness: 0.18 });
  const n = new THREE.Group();
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.2, 16), m);
  shaft.rotation.x = Math.PI / 2; shaft.position.z = -0.72;
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.14, 16), m);
  tip.rotation.x = Math.PI / 2; tip.position.z = -0.06;
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 8, 20), m);
  eye.position.z = -1.3; eye.rotation.y = Math.PI / 2;
  n.add(shaft, tip, eye);
  return n;
}

function thread(ctx) {
  const g = new THREE.Group();
  ctx.scene.add(g);
  const linen = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#EEE8DE'; x.fillRect(0, 0, w, h);
    const r = seeded(3);
    for (let i = 0; i < 2600; i++) {
      const vert = r() < 0.5, a = 0.03 + r() * 0.07;
      x.strokeStyle = r() < 0.5 ? `rgba(110,90,70,${a})` : `rgba(255,255,255,${a * 1.5})`;
      x.lineWidth = 0.6 + r();
      const px = r() * w, py = r() * h, l = 10 + r() * 50;
      x.beginPath(); x.moveTo(px, py); x.lineTo(vert ? px : px + l, vert ? py + l : py); x.stroke();
    }
  });
  linen.wrapS = linen.wrapT = THREE.RepeatWrapping;
  linen.repeat.set(7, 4.5);
  g.add(new THREE.Mesh(new THREE.PlaneGeometry(26, 16), new THREE.MeshStandardMaterial({ map: linen, roughness: 1 })));
  const pts = [];
  for (let i = 0; i < 1440; i++) {
    const a = (i / 1440) * Math.PI * 2;
    pts.push(new THREE.Vector3(
      16 * Math.sin(a) ** 3 * 0.1,
      (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 0.1 + 0.25,
      0.085 * Math.sin(a * 72),
    ));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const tube = new THREE.TubeGeometry(curve, 2400, 0.032, 8, true);
  const total = tube.index.count;
  const yarn = new THREE.Mesh(tube, new THREE.MeshPhysicalMaterial({ color: RED, roughness: 0.55, sheen: 1, sheenColor: new THREE.Color('#ff7d8a'), sheenRoughness: 0.4 }));
  const heart = new THREE.Group();
  const needle = makeNeedle();
  heart.add(yarn, needle);
  g.add(heart);
  const sun = new THREE.DirectionalLight('#ffffff', 2.2);
  sun.position.set(-3, 4, 5);
  ctx.scene.add(sun);
  const target = new THREE.Vector3();
  return {
    layout(c) { heart.position.set(c.mobile ? 0 : c.halfW * 0.42, c.mobile ? 0.1 : 0.35, 0); heart.scale.setScalar(c.mobile ? 0.9 : 1.15); },
    update(t, dt, p, c) {
      const d = ease(t / 4.5);
      yarn.geometry.setDrawRange(0, Math.floor((total * d) / 48) * 48);
      const k = d < 1 ? d : ((t - 4.5) * 0.05) % 1;
      const P = curve.getPointAt(k), T = curve.getTangentAt(k);
      needle.position.copy(P);
      heart.updateMatrixWorld();
      needle.lookAt(heart.localToWorld(target.copy(P).add(T)));
      g.rotation.y = c.smooth.x * 0.12;
      g.rotation.x = -c.smooth.y * 0.08 - p * 0.5;
      ctx.camera.position.z = 10 - p * 2.5;
    },
  };
}

/* ------------------------------------------------- Contatti: l'invito che si apre */
function drawCover(x, img, dx, dy, dw, dh, r) {
  x.save();
  x.beginPath(); x.roundRect(dx, dy, dw, dh, r); x.clip();
  if (img) {
    const k = Math.max(dw / img.width, dh / img.height);
    const iw = img.width * k, ih = img.height * k;
    x.drawImage(img, dx + (dw - iw) / 2, dy + (dh - ih) * 0.3, iw, ih);
  } else { x.fillStyle = '#e6e0d7'; x.fillRect(dx, dy, dw, dh); }
  x.restore();
}

function invite(ctx) {
  const W = 4, H = 2.7;
  const g = new THREE.Group();
  ctx.scene.add(g);
  const paper = new THREE.MeshStandardMaterial({ color: '#f5f1ea', roughness: 0.9, side: THREE.DoubleSide });
  const liner = new THREE.Mesh(new THREE.PlaneGeometry(W, H), new THREE.MeshStandardMaterial({ color: RED, roughness: 0.75 }));
  const ps = new THREE.Shape();
  ps.moveTo(-W / 2, -H / 2); ps.lineTo(W / 2, -H / 2); ps.lineTo(W / 2, H / 2); ps.lineTo(0, -H * 0.08); ps.lineTo(-W / 2, H / 2); ps.closePath();
  const pocket = new THREE.Mesh(new THREE.ShapeGeometry(ps), paper);
  pocket.position.z = 0.06;
  const fs = new THREE.Shape();
  fs.moveTo(-W / 2, 0); fs.lineTo(W / 2, 0); fs.lineTo(0, -H * 0.62); fs.closePath();
  const hinge = new THREE.Group();
  hinge.position.set(0, H / 2, 0.08);
  hinge.add(new THREE.Mesh(new THREE.ShapeGeometry(fs), paper));
  const wax = new THREE.MeshPhysicalMaterial({ color: '#b0001a', roughness: 0.35, clearcoat: 0.8 });
  const seal = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.07, 48), wax);
  seal.rotation.x = Math.PI / 2;
  seal.position.set(0, -H * 0.62 + 0.25, 0.04);
  const hs = new THREE.Shape(), k = 0.14;
  hs.moveTo(0, -0.8 * k);
  hs.bezierCurveTo(-1.3 * k, -0.1 * k, -0.7 * k, 1.1 * k, 0, 0.3 * k);
  hs.bezierCurveTo(0.7 * k, 1.1 * k, 1.3 * k, -0.1 * k, 0, -0.8 * k);
  const heart = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 }), wax);
  heart.position.set(0, -H * 0.62 + 0.25, 0.075);
  hinge.add(seal, heart);
  let pic = null;
  const tex = canvasTex(1480, 1000, (x, w, h) => {
    x.fillStyle = '#FBF8F2'; x.fillRect(0, 0, w, h);
    drawCover(x, pic, 40, 40, 600, h - 80, 28);
    const L = 700;
    x.fillStyle = RED; heartPath(x, L + 18, 128, 18);
    x.fillStyle = '#141414'; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    x.font = '500 66px "General Sans", sans-serif';
    x.fillText('Ti aspettiamo', L + 52, 150);
    x.fillText('in atelier', L, 228);
    x.fillStyle = '#4a4a4a'; x.font = '400 36px "General Sans", sans-serif';
    x.fillText('Via Maremmana III, 43', L, 360);
    x.fillText('San Cesareo (Roma)', L, 408);
    x.fillText('Fronte casello autostradale', L, 456);
    x.fillText('Lunedì - Sabato', L, 560);
    x.fillText('9:30 - 13:00 e 16:30 - 20:00', L, 608);
    x.fillStyle = RED; x.font = '500 40px "General Sans", sans-serif';
    x.fillText('06 9589 214', L, 730);
    x.fillStyle = '#141414'; x.font = '400 34px "General Sans", sans-serif';
    x.fillText('Prova gratuita, senza impegno', L, 900);
  });
  if (ctx.pics[0]) { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => { pic = im; tex.userData.repaint(); }; im.src = ctx.pics[0]; }
  const card = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.92, H * 0.92), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  card.position.z = 0.03;
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(7, 5.5), new THREE.MeshBasicMaterial({
    map: canvasTex(256, 256, (x, w, h) => {
      const gr = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
      gr.addColorStop(0, 'rgba(60,30,20,0.28)'); gr.addColorStop(1, 'rgba(60,30,20,0)');
      x.fillStyle = gr; x.fillRect(0, 0, w, h);
    }),
    transparent: true, depthWrite: false,
  }));
  shadow.position.set(0.25, -0.35, -0.3);
  const env = new THREE.Group();
  env.add(shadow, liner, card, pocket, hinge);
  g.add(env);
  ctx.scene.add(new THREE.HemisphereLight('#ffffff', '#efe6dc', 1.2));
  const sun = new THREE.DirectionalLight('#ffffff', 1.6);
  sun.position.set(-3, 5, 6);
  ctx.scene.add(sun);
  return {
    layout(c) { g.position.set(c.mobile ? 0 : c.halfW * 0.42, c.mobile ? -0.7 : -0.55, 0); g.scale.setScalar(c.mobile ? 0.72 : 1); },
    update(t, dt, p, c) {
      const inn = back(t / 1.1);
      env.position.y = (1 - clamp(inn)) * -4 + Math.sin(t * 0.6) * 0.05;
      env.rotation.z = (1 - clamp(inn)) * 0.35;
      const open = ease((t - 1.1) / 0.9);
      hinge.rotation.x = -Math.PI * open;
      hinge.position.z = open > 0.5 ? -0.02 : 0.08;
      const out = ease((t - 1.9) / 1.2);
      card.position.y = out * H * 0.62 + p * 1.3;
      card.rotation.z = out * 0.02 - p * 0.05;
      g.rotation.y = -0.28 + c.smooth.x * 0.3 + Math.sin(t * 0.4) * 0.04;
      g.rotation.x = -c.smooth.y * 0.15 + p * 0.35;
    },
  };
}

const SCENES = {
  dress, thread, invite,
  tape,
};

export function mount(section, opts = {}) {
  const canvas = section.querySelector('.h3d__cv');
  const make = SCENES[section.dataset.scene];
  if (!canvas || !make) return;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.NeutralToneMapping;
  const bgHex = getComputedStyle(section).getPropertyValue('--h3d-bg').trim() || '#F4F3F1';
  const bg = new THREE.Color(bgHex);
  renderer.setClearColor(bg, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  camera.position.set(0, 0, 10);
  scene.environment = studio(renderer);
  const ctx = {
    scene, camera, renderer, section, canvas, opts, bg, rand: seeded(7),
    pics: (section.dataset.pics || '').split('|').filter(Boolean),
    pointer: new THREE.Vector2(), smooth: new THREE.Vector2(), hasPointer: false,
    mobile: window.innerWidth < 761, halfW: 5,
  };
  const sc = make(ctx);

  let raf = 0, visible = true, last = performance.now();
  const t0 = last;
  const draw = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const r = section.getBoundingClientRect();
    const p = clamp(-r.top / Math.max(r.height, 1));
    ctx.smooth.lerp(ctx.pointer, 1 - Math.pow(0.004, dt));
    sc.update(reduce ? 6 : (now - t0) / 1000, reduce ? 0 : dt, reduce ? 0 : p, ctx);
    renderer.render(scene, camera);
  };
  const loop = (now) => {
    raf = 0;
    draw(now);
    if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
  };
  const start = () => { if (!raf && !reduce) { last = performance.now(); raf = requestAnimationFrame(loop); } };

  const resize = () => {
    const w = canvas.clientWidth || 1, h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    ctx.mobile = window.innerWidth < 761;
    ctx.halfW = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 10 * camera.aspect;
    sc.layout?.(ctx);
    if (reduce) draw(performance.now());
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  section.addEventListener('pointermove', (e) => {
    const r = canvas.getBoundingClientRect();
    ctx.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    ctx.hasPointer = e.pointerType === 'mouse';
  });
  section.addEventListener('pointerleave', () => { ctx.pointer.set(0, 0); ctx.hasPointer = false; });

  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); });
  io.observe(section);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(raf);
    io.disconnect(); ro.disconnect();
    scene.traverse((o) => {
      o.geometry?.dispose();
      [].concat(o.material || []).forEach((m) => {
        Object.values(m).forEach((v) => v?.isTexture && v.dispose());
        Object.values(m.uniforms || {}).forEach((u) => u.value?.isTexture && u.value.dispose());
        m.dispose();
      });
    });
    scene.environment?.dispose();
    renderer.dispose();
  });
  if (reduce) draw(performance.now());
  else start();
}
