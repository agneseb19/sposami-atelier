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

/* ------------------------------------- Sposo e Alterego: nastro di raso, metro da sarta */
const BAND_VS = `
uniform float uTime; uniform float uPull; uniform float uIntro; uniform float uPath; uniform float uW; uniform float uLen;
varying vec3 vN; varying vec3 vV; varying vec2 vUv;
vec3 C(float s) {
  float t = uTime;
  if (uPath < 0.5) {
    float x = (s - 0.5) * uLen + (1.0 - uIntro) * uLen * 0.9 - uPull * 6.0;
    return vec3(x, sin(s * 4.2 + t * 0.45) * 1.0 + cos(s * 1.7 - t * 0.3) * 0.45, cos(s * 3.1 + t * 0.35) * 1.5);
  }
  float th = s * 26.0 + t * 0.35;
  float R = 1.25 + 0.12 * sin(s * 7.0 + t * 0.8);
  float y = (s - 0.5) * (2.6 + uPull * 10.0);
  return vec3(cos(th) * R, y, sin(th) * R);
}
float S(float x) { return uPath < 0.5 ? x : x * max(uIntro, 0.002); }
vec3 P(vec2 q) {
  float s = S(q.x);
  vec3 c = C(s);
  vec3 T = normalize(C(s + 0.001) - c);
  vec3 B = normalize(cross(T, vec3(0.0, 1.0, 0.0)));
  vec3 N = normalize(cross(B, T));
  float a = uPath < 0.5 ? s * 5.0 + sin(uTime * 0.4 + s * 3.0) * 1.2 : sin(s * 30.0 + uTime) * 0.12;
  return c + (cos(a) * N + sin(a) * B) * (q.y - 0.5) * uW;
}
void main() {
  vec3 p = P(uv);
  vec3 a = P(uv + vec2(0.0015, 0.0)) - p;
  vec3 b = P(uv + vec2(0.0, 0.02)) - p;
  vN = normalize(normalMatrix * normalize(cross(a, b)));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vV = -mv.xyz;
  vUv = vec2(S(uv.x), uv.y);
  gl_Position = projectionMatrix * mv;
}`;
const BAND_FS = `
uniform float uPath; uniform sampler2D uTex; uniform float uRepeat;
varying vec3 vN; varying vec3 vV; varying vec2 vUv;
void main() {
  if (uPath < 0.5 && min(vUv.x, 1.0 - vUv.x) < 0.035 * (1.0 - abs(vUv.y - 0.5) * 2.0)) discard;
  vec3 n = normalize(vN);
  vec3 v = normalize(vV);
  if (dot(n, v) < 0.0) n = -n;
  vec3 L1 = normalize(vec3(0.5, 0.8, 0.6));
  vec3 L2 = normalize(vec3(-0.7, 0.1, 0.6));
  vec3 h1 = normalize(L1 + v);
  vec3 h2 = normalize(L2 + v);
  vec3 col;
  if (uPath < 0.5) {
    float edge = step(vUv.y, 0.06) + step(0.94, vUv.y);
    vec3 base = mix(vec3(0.02), vec3(0.62, 0.0, 0.05), edge);
    float dif = max(dot(n, L1), 0.0) * 0.6 + 0.25;
    float sp = pow(max(dot(n, h1), 0.0), 70.0) * 1.4 + pow(max(dot(n, h2), 0.0), 16.0) * 0.28;
    float rim = pow(1.0 - abs(dot(n, v)), 3.0) * 0.18;
    col = base * dif * 2.2 + vec3(sp + rim) * mix(vec3(0.85, 0.88, 0.95), vec3(1.0, 0.6, 0.6), edge);
  } else {
    vec3 tex = texture2D(uTex, vec2(vUv.x * uRepeat, vUv.y)).rgb;
    float dif = 0.45 + 0.55 * max(dot(n, L1), 0.0);
    col = tex * dif + pow(max(dot(n, h1), 0.0), 40.0) * 0.3;
  }
  gl_FragColor = vec4(col, 1.0);
  ${END}
}`;

function tapeTexture() {
  const tex = canvasTex(4096, 110, (x, w, h) => {
    x.fillStyle = '#F6F3EC'; x.fillRect(0, 0, w, h);
    const cm = w / 100;
    x.fillStyle = '#141414';
    for (let i = 0; i <= 1000; i++) {
      const px = (i * cm) / 10;
      const big = i % 10 === 0, half = i % 5 === 0;
      const len = big ? 30 : half ? 22 : 13;
      x.fillRect(px, 0, big ? 3 : 1.5, len);
      x.fillRect(px, h - len, big ? 3 : 1.5, len);
    }
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (let k = 1; k < 100; k++) {
      const ten = k % 10 === 0;
      x.fillStyle = ten ? RED : '#141414';
      x.font = `${ten ? 600 : 500} ${ten ? 34 : 26}px "General Sans", sans-serif`;
      x.fillText(String(k), k * cm, h / 2 + 1);
    }
  });
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

function band(ctx, tape) {
  const u = {
    uTime: { value: 0 }, uPull: { value: 0 }, uIntro: { value: 0 }, uPath: { value: tape ? 1 : 0 },
    uW: { value: tape ? 0.42 : 1.15 }, uLen: { value: 10 }, uTex: { value: tape ? tapeTexture() : null }, uRepeat: { value: 2 },
  };
  const mesh = new THREE.Mesh(
    tape ? new THREE.PlaneGeometry(1, 1, 1100, 4) : new THREE.PlaneGeometry(1, 1, 500, 24),
    new THREE.ShaderMaterial({ uniforms: u, vertexShader: BAND_VS, fragmentShader: BAND_FS, side: THREE.DoubleSide }),
  );
  mesh.frustumCulled = false;
  const g = new THREE.Group();
  g.add(mesh);
  ctx.scene.add(g);
  return {
    layout(c) {
      g.position.set(c.mobile ? 0 : c.halfW * (tape ? 0.45 : 0.48), tape ? 0.2 : 0.55, 0);
      g.scale.setScalar(c.mobile ? 0.6 : tape ? 1 : 0.85);
    },
    update(t, dt, p, c) {
      u.uTime.value = t; u.uPull.value = p; u.uIntro.value = ease(t / (tape ? 3 : 2.2));
      g.rotation.y = (tape ? t * 0.2 : 0) + c.smooth.x * 0.35;
      g.rotation.x = -c.smooth.y * 0.2 + (tape ? 0.25 : 0);
      g.rotation.z = tape ? 0 : 0.55;
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
  ribbon: (ctx) => band(ctx, false),
  tape: (ctx) => band(ctx, true),
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
