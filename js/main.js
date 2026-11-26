/* ---------------------------------------------------------
   Sposami Atelier — script condiviso da tutte le pagine
   --------------------------------------------------------- */
const { gsap, ScrollTrigger } = window;
gsap.registerPlugin(ScrollTrigger);
window.__siteReady = true;

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MOBILE = window.matchMedia('(max-width: 760px)').matches;
// dispositivi meno potenti (telefoni, pc con pochi core o poca memoria): effetti più leggeri
const LOW = MOBILE || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
ScrollTrigger.config({ ignoreMobileResize: true, limitCallbacks: true });
if (reduce) root.classList.add('reduced');

const PAGE = document.body.dataset.page;
const CATALOG = window.CATALOG || [];
const MEDIA = 'https://static.wixstatic.com/media/';
const img = (id, w, h) => id.startsWith('assets/') ? id : `${MEDIA}${id}/v1/fill/w_${w},h_${h},al_c,q_82,enc_auto/${id.split('~')[0].split('.')[0]}.jpg`;
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const ARR = '<svg class="arr" viewBox="0 0 14 10" aria-hidden="true"><path d="M0 5h12M8.5 1 12.5 5 8.5 9" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>';

/* ---------- Brand ---------- */
const BRANDS = [
  { k: 'milla-nova', n: 'Milla Nova', g: 'donna', tile: 'e81dc4_c5f32bc00cbf4a85864bb5e5a9905a31~mv2.jpg', d: "Brand internazionale di lusso, apprezzato per le sue creazioni glamour e d'impatto. Milla Nova propone abiti che uniscono silhouette moderne, tessuti pregiati e dettagli couture, perfetti per le spose che desiderano distinguersi." },
  { k: 'evie-young', n: 'Evie Young', g: 'donna', tile: 'e81dc4_c71c99b9529f47f3b50264f576eea3af~mv2.webp', d: 'Marchio australiano dedicato alle spose moderne che cercano stile, comfort e personalità. Le collezioni Evie Young reinterpretano le tendenze contemporanee con linee pulite, dettagli ricercati e vestibilità inclusive.' },
  { k: 'rosa-clara', n: 'Rosa Clarà', g: 'donna', tile: 'e81dc4_efb33a3c10d945eeb04215ec94d5fb95~mv2.jpeg', d: 'Uno dei marchi più prestigiosi del panorama bridal internazionale. Rosa Clarà è sinonimo di eleganza senza tempo, design innovativo e qualità sartoriale, con collezioni che esaltano raffinatezza e femminilità.' },
  { k: 'adriana-alier', n: 'Adriana Alier', g: 'donna', tile: 'e81dc4_1e0ffcdbbe534d1ab62b55b157a946dd~mv2.jpeg', d: 'Brand spagnolo che propone abiti romantici e contemporanei, caratterizzati da linee leggere, tessuti delicati e dettagli raffinati. Ideale per le spose che desiderano uno stile elegante e naturale.' },
  { k: 'pronovias', n: 'Pronovias', g: 'donna', tile: 'e81dc4_d59f1ab1265e4caba25c3304c453cb90~mv2.webp', d: "Icona mondiale dell'alta moda sposa, Pronovias realizza abiti che combinano innovazione, artigianalità e design esclusivo. Le sue collezioni spaziano dal classico al contemporaneo, soddisfacendo ogni stile di sposa." },
  { k: 'st-patrick', n: 'St Patrick', g: 'donna', tile: 'e81dc4_ecf4a136302e4c3dbe1807704399dd14~mv2.webp', d: "Marchio del gruppo Pronovias che offre abiti raffinati e versatili. Le collezioni St Patrick si distinguono per l'equilibrio tra tradizione, eleganza e tendenze moderne, con modelli pensati per valorizzare ogni silhouette." },
  { k: 'diamond-couture', n: 'Diamond Couture', g: 'donna', tile: 'e81dc4_67a8a7755c1642b8bc7ee19df6a31d91~mv2.jpg', d: 'Brand dedicato alle spose che desiderano un look esclusivo e ricercato. Gli abiti Diamond Couture si caratterizzano per dettagli luminosi, lavorazioni sartoriali e uno stile sofisticato che unisce glamour ed eleganza.' },
  { k: 'altri-brand', n: 'Altri brand', g: 'donna', tile: 'e81dc4_3fafadd7807f4ba3bacf14a42ec86782~mv2.jpg', d: "L'atelier seleziona inoltre numerosi marchi nazionali e internazionali per offrire una proposta ampia e diversificata, capace di soddisfare ogni gusto, stile ed esigenza." },
  { k: 'nicole', n: 'Nicole', g: 'donna', tile: 'e81dc4_d0931347fb49462cb8e983bb1aabcc6f~mv2.jpg', d: 'Marchio italiano simbolo di romanticismo ed eleganza contemporanea. Nicole realizza collezioni raffinate, impreziosite da ricami, pizzi e dettagli sartoriali che valorizzano la personalità di ogni sposa.' },
  { k: 'natali-styran', n: 'Natali Styran', g: 'donna', tile: 'e81dc4_b7f9f35da8cc4436bb241f914da20a80~mv2.webp', d: 'Brand di alta gamma conosciuto per il suo stile sofisticato e contemporaneo. Le collezioni Natali Styran combinano design innovativo, materiali esclusivi e dettagli couture per creare abiti unici.' },
  { k: 'musani', n: 'Musani', g: 'donna', tile: 'e81dc4_3b69e082cf53498b8a18b3595bd325f8~mv2.webp', d: 'Storico marchio italiano che interpreta la sposa con eleganza, romanticismo e cura sartoriale. Gli abiti Musani uniscono tradizione, qualità dei tessuti e design raffinato.' },
  { k: 'anna-bella', n: 'Anna Bella', g: 'donna', tile: '268ca4_56ead1b4fce141219886ecaff636ca06~mv2.jpg', d: "Tra i marchi selezionati dall'atelier: chiedi i modelli disponibili durante la prova." },
  { k: 'anna-sposa', n: 'Anna Sposa', g: 'donna', tile: 'assets/anna-sposa/samba-1.jpg', d: "Tra i marchi selezionati dall'atelier: chiedi i modelli disponibili durante la prova." },
  { k: 'alberto-palatchi', n: 'Alberto Palatchi', g: 'donna', tile: 'e81dc4_a5e6715b78f24e5d9d9b8b8a00a600b9~mv2.webp', d: "Alberto Palatchi è un brand di abiti da sposa che unisce l'eleganza della tradizione sartoriale spagnola a uno stile contemporaneo e raffinato. Le sue collezioni si distinguono per linee pulite, tessuti pregiati e dettagli ricercati, pensati per valorizzare la femminilità con classe e modernità." },
  { k: 'angelo-toma', n: 'Angelo Toma', g: 'uomo', tile: 'e81dc4_f8920630d4cc429b9a5991a9a88dfbbf~mv2.jpg', d: "Brand italiano che interpreta l'eleganza classica con uno stile raffinato e senza tempo. Le collezioni Angelo Toma si distinguono per la qualità sartoriale, i tessuti pregiati e i dettagli ricercati, pensati per valorizzare ogni sposa." },
  { k: 'petrelli', n: 'Petrelli', g: 'uomo', tile: 'e81dc4_5190f6a2e7574e22bbbd125e5a541166~mv2.jpeg', d: 'Storica maison italiana specializzata in abiti da cerimonia e da sposa. Petrelli unisce tradizione artigianale e gusto contemporaneo, proponendo creazioni eleganti, curate nei minimi dettagli e realizzate con materiali di alta qualità.' },
  { k: 'scribano', n: 'Scribano', g: 'uomo', tile: 'e81dc4_c16627c08aea4d70bd4de957cb1b0f07~mv2.png', d: 'Marchio italiano che celebra la femminilità attraverso abiti sofisticati e ricchi di personalità. Le collezioni Scribano fondono lavorazioni sartoriali, ricami preziosi e linee moderne per uno stile esclusivo.' },
  { k: 'rocchini', n: 'Rocchini', g: 'uomo', tile: 'e81dc4_3a2dddadfdd14fc395329b333fa34f3a~mv2.jpg', d: "Maison italiana che propone abiti da sposa caratterizzati da eleganza classica e lavorazioni artigianali. Ogni creazione è studiata per offrire raffinatezza, qualità e una vestibilità impeccabile." },
];
const brandByName = (n) => BRANDS.find((b) => b.n === n);

/* =========================================================
   SCROLL MORBIDO
   ========================================================= */
let lenis = null;
if (!reduce && window.Lenis && !LOW) {
  lenis = new window.Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* =========================================================
   NAVIGAZIONE
   ========================================================= */
const wa = $('.wa');
window.addEventListener('scroll', () => wa?.classList.toggle('is-on', window.scrollY > 600), { passive: true });

const menuBtn = $('.bar__menu');
const sheet = $('#sheet');
let sheetOpen = false;
function setSheet(open) {
  sheetOpen = open;
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
  menuBtn.classList.toggle('is-open', open);
  if (open) {
    lenis?.stop();
    sheet.hidden = false;
    gsap.set(sheet, { visibility: 'visible' });
    gsap.to(sheet, { opacity: 1, duration: reduce ? 0 : 0.35 });
    if (!reduce) gsap.fromTo($$('.sheet__links a'), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.05, ease: 'expo.out' });
    $('.sheet__links a').focus({ preventScroll: true });
  } else {
    lenis?.start();
    gsap.to(sheet, { opacity: 0, duration: reduce ? 0 : 0.3, onComplete: () => { sheet.hidden = true; } });
  }
}
menuBtn?.addEventListener('click', () => setSheet(!sheetOpen));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sheetOpen) { setSheet(false); menuBtn.focus(); } });

/* Transizione tra pagine: tendina bianca col cuore */
const curtain = $('.curtain');
function revealPage() {
  if (!curtain) return;
  curtain.style.animation = 'none';
  if (reduce) { curtain.style.display = 'none'; return; }
  gsap.timeline()
    .fromTo($('.heart', curtain), { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' })
    .to($('.heart', curtain), { scale: 0.8, opacity: 0, duration: 0.25 }, '+=0.1')
    .to(curtain, { opacity: 0, duration: 0.45, ease: 'power2.out' }, '-=0.1')
    .set(curtain, { visibility: 'hidden' });
}
function leaveTo(href) {
  if (reduce || !curtain) { location.href = href; return; }
  gsap.set(curtain, { visibility: 'visible', opacity: 0 });
  gsap.set($('.heart', curtain), { opacity: 0 });
  gsap.to(curtain, { opacity: 1, duration: 0.35, ease: 'power2.in', onComplete: () => { location.href = href; } });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin) return;
  if (url.pathname === location.pathname && url.hash) {
    const t = document.getElementById(url.hash.slice(1));
    if (t) { e.preventDefault(); if (sheetOpen) setSheet(false); lenis ? lenis.scrollTo(t, { offset: -90 }) : t.scrollIntoView(); }
    return;
  }
  e.preventDefault();
  if (sheetOpen) setSheet(false);
  leaveTo(url.href);
});
window.addEventListener('pageshow', (e) => { if (e.persisted && curtain) gsap.set(curtain, { visibility: 'hidden', opacity: 0 }); });

/* =========================================================
   MOVIMENTO COMUNE
   ========================================================= */
function initEntrances(scope = document) {
  if (reduce) return;
  // per ogni sezione: titolo, poi testo, poi immagine, sfalsati
  const groups = new Map();
  $$('[data-in]', scope).forEach((el) => {
    if (el.dataset.inDone) return;
    el.dataset.inDone = '1';
    const sec = el.closest('section, footer, .phead, .grid') || document.body;
    if (!groups.has(sec)) groups.set(sec, []);
    groups.get(sec).push(el);
  });
  groups.forEach((els) => {
    ScrollTrigger.batch(els, {
      start: 'top 96%', once: true,
      onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out', stagger: 0.07, overwrite: true }),
    });
  });
}

function initParallax(scope = document) {
  if (reduce || MOBILE) return;
  $$('[data-par]', scope).forEach((im) => {
    gsap.fromTo(im, { yPercent: -6 }, {
      yPercent: 6, ease: 'none',
      scrollTrigger: { trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/* Il nome come monumento: pesa con lo scroll */
function initWordmarks() {
  if (reduce) return;
  const foot = $('.foot__name');
  if (foot) {
    gsap.fromTo(foot, { scale: 0.92 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.foot', start: 'top bottom', end: 'bottom bottom', scrub: true } });
  }
}

/* Anteprima che segue il cursore */
function initPeek(scope) {
  if (!scope || reduce || !window.matchMedia('(hover: hover) and (min-width: 861px)').matches) return;
  const peek = document.createElement('div');
  peek.className = 'peek';
  peek.setAttribute('aria-hidden', 'true');
  document.body.appendChild(peek);
  gsap.set(peek, { xPercent: -50, yPercent: -50 });
  const xTo = gsap.quickTo(peek, 'x', { duration: 0.7, ease: 'power3' });
  const yTo = gsap.quickTo(peek, 'y', { duration: 0.7, ease: 'power3' });
  scope.addEventListener('pointermove', (e) => { xTo(e.clientX + 120); yTo(e.clientY); });
  $$('[data-peek]', scope).forEach((a) => {
    a.addEventListener('pointerenter', () => {
      const im = document.createElement('img');
      im.src = a.dataset.peek; im.alt = '';
      peek.appendChild(im);
      gsap.fromTo(im, { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' });
      while (peek.children.length > 3) peek.firstChild.remove();
      gsap.to(peek, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
    });
    a.addEventListener('pointerleave', () => gsap.to(peek, { autoAlpha: 0, duration: 0.3, overwrite: 'auto' }));
  });
}

/* =========================================================
   HOME
   ========================================================= */
const DETAILS = [
  { l: 'Pizzo', k: ['pizzo'] }, { l: 'Maniche', k: ['manic'] }, { l: 'Schiena scoperta', k: ['schiena'] },
  { l: 'Strascico', k: ['strascico', 'coda'] }, { l: 'Mikado', k: ['mikado'] }, { l: 'Tulle', k: ['tull'] },
];
const GROOM = [
  { l: 'Smoking', test: (i) => /smoking/i.test(i.s) }, { l: 'Tight e mezzo tight', test: (i) => /tight/i.test(i.s) },
  { l: 'Collo coreano', test: (i) => /coreano/i.test(i.s) }, { l: 'Doppiopetto', test: (i) => /doppio/i.test(`${i.s} ${i.n} ${i.d}`) },
];

/* Trova il tuo abito: tre domande, abiti veri */
function initQuiz() {
  const stage = $('.quiz__stage');
  if (!stage) return;
  const back = $('[data-q="back"]');
  const bar = $('.quiz__bar i');
  const count = $('#quiz-count');
  const frame = $('.quiz__pic');
  const sil = $('#quiz-sil');
  const ans = { cat: null, a2: null, a3: null };
  let step = 0;
  let shownId = null;

  const pool = () => CATALOG.filter((i) => {
    if (!i.img.length) return false;
    if (ans.cat && i.c !== ans.cat) return false;
    if (ans.a2 && ans.a2 !== 'any') {
      if (ans.cat === 'sposo') { const g = GROOM.find((x) => x.l === ans.a2); if (g && !g.test(i)) return false; }
      else if (i.s !== ans.a2) return false;
    }
    if (ans.a3 && ans.a3 !== 'any') {
      if (ans.cat === 'sposo') { if (i.b !== ans.a3) return false; }
      else {
        const d = DETAILS.find((x) => x.l === ans.a3);
        const t = `${i.d} ${i.n}`.toLowerCase();
        if (d && !d.k.some((k) => t.includes(k))) return false;
      }
    }
    return true;
  });

  // la foto a destra mostra un abito vero che corrisponde alle scelte
  function setPic(list) {
    count.textContent = list.length;
    const it = list[0];
    if (!it || it.id === shownId) return;
    shownId = it.id;
    const next = document.createElement('img');
    next.src = img(it.img[0], 800, 1000);
    next.alt = '';
    next.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover';
    frame.appendChild(next);
    const prune = () => { while (frame.children.length > 1) frame.firstElementChild.replaceWith(); };
    if (reduce) { prune(); return; }
    gsap.fromTo(next, { clipPath: 'inset(100% 0 0 0)', scale: 1.12 }, { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 0.9, ease: 'expo.out', onComplete: prune });
  }
  const silIcon = (name) => { const t = sil.content.querySelector(`[data-sil="${name}"]`); return t ? t.outerHTML : ''; };

  function question() {
    if (step === 0) return { q: 'Per quale occasione cerchi l’abito?', key: 'cat', opts: [['sposa', 'Sposa'], ['sposo', 'Sposo'], ['cerimonia', 'Cerimonia']] };
    if (step === 1) {
      if (ans.cat === 'sposo') return { q: 'Che stile preferisci?', key: 'a2', opts: [...GROOM.map((g) => [g.l, g.l]), ['any', 'Non lo so ancora']] };
      const styles = ans.cat === 'cerimonia' ? ['Sirena', 'Scivolato', 'Principessa'] : ['Principessa', 'Sirena', 'Scivolato', 'A line'];
      return { q: 'Quale silhouette ti somiglia di più?', key: 'a2', sil: true, opts: [...styles.map((x) => [x, x]), ['any', 'Non lo so ancora']] };
    }
    if (ans.cat === 'sposo') return { q: 'Hai un brand preferito?', key: 'a3', opts: [['Angelo Toma', 'Angelo Toma'], ['Petrelli', 'Petrelli'], ['Scribano', 'Scribano'], ['Rocchini', 'Rocchini'], ['any', 'Indifferente']] };
    return { q: 'Un dettaglio a cui non rinunci?', key: 'a3', opts: [...DETAILS.map((d) => [d.l, d.l]), ['any', 'Nessuno in particolare']] };
  }

  function render(dir = 1) {
    const Q = question();
    stage.innerHTML = `<p class="quiz__q">${Q.q}</p><div class="quiz__opts${Q.sil ? ' quiz__opts--sil' : ''}">${Q.opts.map(([v, l]) =>
      `<button type="button" class="quiz__opt" data-v="${esc(v)}" aria-pressed="${ans[Q.key] === v}">${Q.sil && v !== 'any' ? silIcon(v) : ''}<span>${esc(l)}</span></button>`).join('')}</div>`;
    back.hidden = step === 0;
    bar.style.width = `${(step / 3) * 100}%`;
    if (!reduce) gsap.fromTo(stage.children, { opacity: 0, x: 24 * dir }, { opacity: 1, x: 0, duration: 0.6, ease: 'expo.out', stagger: 0.05 });
    setPic(pool());
  }

  function results() {
    bar.style.width = '100%';
    let list = pool();
    if (!list.length) { ans.a3 = null; list = pool(); }
    const box = $('.quiz__results');
    box.hidden = false;
    $('#quiz-grid').innerHTML = list.slice(0, 4).map(cardHTML).join('');
    const page = { sposa: 'sposa.html', sposo: 'sposo.html', cerimonia: 'cerimonia.html' }[ans.cat];
    const qs = new URLSearchParams();
    if (ans.a2 && ans.a2 !== 'any' && ans.cat !== 'sposo') qs.set('stile', ans.a2);
    if (ans.a3 && ans.a3 !== 'any') qs.set(ans.cat === 'sposo' ? 'brand' : 'dettaglio', ans.a3);
    $('#quiz-all').href = `${page}${qs.toString() ? `?${qs}` : ''}#catalogo`;
    $('#quiz-all').textContent = `Vedi tutti i ${list.length} abiti`;
    $('#quiz-book').href = `prenota.html?abito=${encodeURIComponent(list.slice(0, 4).map((i) => `${i.n} (${i.b})`).join(', '))}`;
    stage.innerHTML = `<p class="quiz__q">Ecco gli abiti che fanno per te</p><p class="muted">Li trovi qui sotto: scegli quelli da provare in atelier, gratis e senza impegno.</p><button type="button" class="btn btn--soft btn--sm" data-q="restart" style="margin-top:1.2rem">Ricomincia</button>`;
    back.hidden = true;
    if (!reduce) animateIn($$('#quiz-grid .card'));
    ScrollTrigger.refresh();
    if (lenis) lenis.scrollTo(box, { offset: -120 }); else box.scrollIntoView();
  }

  stage.addEventListener('click', (e) => {
    if (e.target.closest('[data-q="restart"]')) {
      ans.cat = ans.a2 = ans.a3 = null; step = 0; $('.quiz__results').hidden = true; render(-1); return;
    }
    const b = e.target.closest('.quiz__opt');
    if (!b) return;
    const Q = question();
    ans[Q.key] = b.dataset.v;
    if (Q.key === 'cat') { ans.a2 = null; ans.a3 = null; }
    $$('.quiz__opt', stage).forEach((o) => o.setAttribute('aria-pressed', String(o === b)));
    setPic(pool());
    setTimeout(() => { if (step < 2) { step += 1; render(1); } else results(); }, reduce ? 0 : 260);
  });
  back.addEventListener('click', () => { if (step > 0) { step -= 1; render(-1); } });
  render();
}

/* Recensioni: una alla volta, con frecce, pallini e avanzamento automatico */
function initReviews() {
  $$('.rv__box').forEach((box) => {
    const slides = $$('.rv__slide', box);
    const dots = $$('.rv__dot', box);
    let at = 0;
    let timer = 0;
    const go = (n) => {
      at = (n + slides.length) % slides.length;
      slides.forEach((sl, k) => { sl.classList.toggle('is-on', k === at); sl.setAttribute('aria-hidden', String(k !== at)); });
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === at)));
      clearInterval(timer);
      if (!reduce) timer = setInterval(() => go(at + 1), 8000);
    };
    $$('.rv__btn', box).forEach((b) => b.addEventListener('click', () => go(at + Number(b.dataset.dir))));
    dots.forEach((d, k) => d.addEventListener('click', () => go(k)));
    box.addEventListener('pointerenter', () => clearInterval(timer));
    box.addEventListener('pointerleave', () => go(at));
    go(0);
  });
}

/* Nastro dei loghi: il contenuto si ripete per scorrere senza stacchi */
function initMarquee() {
  $$('.marquee__track').forEach((t) => {
    const copy = [...t.children].map((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); return c; });
    copy.forEach((c) => t.appendChild(c));
  });
}

/* =========================================================
   HERO: fotogrammi legati allo scroll
   dal mezzo busto (frame_001) all'abito intero (frame_140)
   ========================================================= */
function canvasHeroFrames(section, canvas, N) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const portrait = window.matchMedia('(max-width: 760px), (orientation: portrait) and (max-width: 1024px)').matches;
  // telefono: 70 fotogrammi leggeri (540x900), caricati una volta e tenuti tutti: niente ricarichi durante lo scroll
  const M = MOBILE ? 70 : N;
  const dir = MOBILE ? 'assets/hero/frames-m' : portrait ? 'assets/hero/frames-mobile' : 'assets/hero/frames';
  const src = (i) => `${dir}/frame_${String(i + 1).padStart(3, '0')}.webp`;
  const imgs = new Array(M);
  let current = 0;
  let lastImage = null;
  let renderPending = false;

  function size() {
    const dpr = Math.min(window.devicePixelRatio || 1, LOW ? 1.25 : 1.5);
    const width = Math.round(canvas.clientWidth * dpr);
    const height = Math.round(canvas.clientHeight * dpr);
    if (width === canvas.width && height === canvas.height) return;
    canvas.width = width;
    canvas.height = height;
    lastImage = null;
    scheduleDraw();
  }
  function scheduleDraw() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
      renderPending = false;
      let im = imgs[current];
      for (let d = 1; !im && d < M; d++) im = imgs[current - d] || imgs[current + d];
      if (!im || im === lastImage) return;
      const cw = canvas.width, ch = canvas.height;
      const scale = Math.max(cw / im.naturalWidth, ch / im.naturalHeight);
      const w = im.naturalWidth * scale, h = im.naturalHeight * scale;
      ctx.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h);
      lastImage = im;
      section.classList.add('vhero--live');
    });
  }

  // prima il primo fotogramma, poi uno ogni 8 (per i salti lunghi), poi tutti gli altri; 4 alla volta
  const order = [0];
  for (let i = 8; i < M; i += 8) order.push(i);
  order.push(M - 1);
  for (let i = 1; i < M; i++) if (!order.includes(i)) order.push(i);
  let next = 0, active = 0;
  async function load(i) {
    const im = new Image();
    im.decoding = 'async';
    try {
      im.src = src(i);
      await im.decode();
      imgs[i] = im;
      if (!lastImage || Math.abs(i - current) < 3) scheduleDraw();
    } catch { /* fotogramma mancante: si usa il più vicino */ }
  }
  function pump() {
    while (active < 4 && next < order.length) {
      active++;
      load(order[next++]).finally(() => { active--; pump(); });
    }
  }
  size();
  pump();
  window.addEventListener('resize', size);

  return (frame) => {
    const f = Math.round((frame * (M - 1)) / (N - 1));
    if (f === current) return;
    current = f;
    scheduleDraw();
  };
}

function initFrameHero() {
  const section = $('.vhero');
  if (!section || reduce) return;
  const canvas = $('.vhero__canvas', section);
  const stage = $('.vhero__stage', section);
  const N = 140;
  if (MOBILE) section.classList.add('vhero--sticky');
  const showFrame = canvasHeroFrames(section, canvas, N);
  const state = { f: 0 };
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: section, start: 'top top',
      end: () => MOBILE ? '+=' + (section.offsetHeight - stage.offsetHeight) : '+=260%',
      pin: !MOBILE, scrub: MOBILE ? true : 1, anticipatePin: MOBILE ? 0 : 1,
    },
  });
  tl.to(state, { f: N - 1, duration: 1, onUpdate: () => showFrame(Math.round(state.f)) }, 0)
    .to('.vhero__hint', { opacity: 0, duration: 0.06 }, 0)
    .to('.vhero__step--name', { opacity: 0, scale: 0.86, y: -30, duration: 0.14 }, 0.3)
    .fromTo('.vhero__claim', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.12 }, 0.42)
    .to('.vhero__claim', { opacity: 0, y: -24, duration: 0.1 }, 0.72)
    .fromTo('.vhero__end', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.1 }, 0.84);
  gsap.set(['.vhero__claim', '.vhero__end'], { opacity: 0 });
  gsap.from('.vhero__step--name > *', { opacity: 0, y: 24, duration: 0.8, ease: 'expo.out', stagger: 0.1, delay: 0.1 });
}

function initHome() {
  initQuiz();
  initFrameHero();
}

/* =========================================================
   CATALOGO
   ========================================================= */
function cardHTML(it) {
  const a = it.img[0], b = it.img[1];
  return `<a class="card" href="abito.html?id=${encodeURIComponent(it.id)}">
    <div class="card__pic">
      <img loading="lazy" src="${img(a, 600, 800)}" alt="${esc(it.n)}, ${esc(it.b)}" width="600" height="800">
      ${b ? `<img loading="lazy" src="${img(b, 600, 800)}" alt="" width="600" height="800">` : ''}
    </div>
    <div class="card__meta">
      <div><p class="card__name">${esc(it.n)}</p><p class="card__sub">${esc(it.b)}</p></div>
      <span class="card__style">${esc(it.s)}</span>
    </div>
  </a>`;
}

/* Gli abiti outlet hanno la taglia nel nome (es. "TG 48 ITA") */
const isOutlet = (i) => /TG\s*\d/i.test(i.n);

function initCatalog() {
  const cat = document.body.dataset.cat;
  const grid = $('#grid');
  const items = cat === 'outlet' ? CATALOG.filter(isOutlet) : CATALOG.filter((i) => i.c === cat);
  const params = new URLSearchParams(location.search);
  const state = { style: new Set(), brand: '', sort: 'new', shown: 24, det: null, q: '' };
  if (params.get('stile')) state.style.add(params.get('stile'));
  if (params.get('brand')) state.brand = params.get('brand');
  const det = DETAILS.find((d) => d.l === params.get('dettaglio'));

  const count = (key, v) => items.filter((i) => i[key] === v).length;
  const styles = [...new Set(items.map((i) => i.s))].sort();
  const brands = [...new Set(items.map((i) => i.b))].sort();
  state.det = det || null;
  $('#f-style').innerHTML = (state.det ? `<button type="button" class="chip" data-det aria-pressed="true">${esc(state.det.l)} <svg class="n" width="10" height="10" viewBox="0 0 10 10" aria-hidden="true"><path d="M1 1l8 8M9 1L1 9" stroke="currentColor" stroke-width="1.5"/></svg><span class="sr">Rimuovi filtro</span></button>` : '') + styles.map((s) => `<button type="button" class="chip" data-v="${esc(s)}" aria-pressed="${state.style.has(s)}">${esc(s)}<span class="n">${count('s', s)}</span></button>`).join('');
  $('#f-brand').innerHTML = `<label class="select"><span class="sr">Brand</span><select id="brand-sel"><option value="">Tutti i brand</option>${brands.map((b) => `<option value="${esc(b)}"${state.brand === b ? ' selected' : ''}>${esc(b)} (${count('b', b)})</option>`).join('')}</select></label>`;

  const filtered = () => {
    let l = items.filter((i) => (!state.style.size || state.style.has(i.s)) && (!state.brand || i.b === state.brand) && (!state.det || state.det.k.some((k) => (i.d + ' ' + i.n).toLowerCase().includes(k))) && (!state.q || `${i.n} ${i.b} ${i.s} ${i.d}`.toLowerCase().includes(state.q)));
    if (state.sort === 'az') l = [...l].sort((a, b) => a.n.localeCompare(b.n, 'it'));
    return l;
  };
  function render(append = false) {
    const list = filtered();
    const from = append ? grid.children.length : 0;
    if (!append) grid.innerHTML = '';
    grid.insertAdjacentHTML('beforeend', list.slice(from, state.shown).map(cardHTML).join(''));
    animateIn([...grid.children].slice(from));
    $('#count').textContent = `${list.length} ${list.length === 1 ? 'abito' : 'abiti'}`;
    $('#empty').hidden = list.length > 0;
    $('#more').hidden = state.shown >= list.length;
    $('#more-txt').textContent = `${Math.min(state.shown, list.length)} di ${list.length} abiti`;
    ScrollTrigger.refresh();
  }
  $('#f-style').addEventListener('click', (e) => {
    const b = e.target.closest('.chip'); if (!b) return;
    if (b.hasAttribute('data-det')) { state.det = null; b.hidden = true; state.shown = 24; render(); return; }
    const v = b.dataset.v;
    state.style.has(v) ? state.style.delete(v) : state.style.add(v);
    b.setAttribute('aria-pressed', String(state.style.has(v)));
    state.shown = 24; render();
  });
  $('#brand-sel').addEventListener('change', (e) => { state.brand = e.target.value; state.shown = 24; render(); });
  let qt = 0;
  $('#search')?.addEventListener('input', (e) => { clearTimeout(qt); qt = setTimeout(() => { state.q = e.target.value.trim().toLowerCase(); state.shown = 24; render(); }, 180); });
  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; state.shown = 24; render(); });
  $('#more-btn').addEventListener('click', () => { state.shown += 24; render(true); });
  $('#reset').addEventListener('click', () => {
    state.style.clear(); state.brand = ''; state.det = null; $('#brand-sel').value = ''; if ($('[data-det]')) $('[data-det]').hidden = true;
    $$('#f-style .chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
    render();
  });
  render();
}

/* =========================================================
   SCHEDA ABITO
   ========================================================= */
function initDress() {
  const id = new URLSearchParams(location.search).get('id');
  const it = CATALOG.find((i) => i.id === id) || CATALOG[0];
  document.title = `${it.n}, ${it.b} | Sposami Atelier`;
  const brand = brandByName(it.b);
  const catPage = { sposa: 'sposa.html', sposo: 'sposo.html', cerimonia: 'cerimonia.html' }[it.c];
  const catName = { sposa: 'Abiti da sposa', sposo: 'Abiti da sposo', cerimonia: 'Abiti da cerimonia' }[it.c];
  $('#crumb').innerHTML = `<a href="index.html">Home</a><span>/</span><a href="${catPage}">${catName}</a>`;
  initGallery($('#gallery'), it);
  $('#name').textContent = it.n;
  $('#brand').innerHTML = brand ? `<a class="link" href="brand.html?b=${brand.k}">${esc(it.b)} ${ARR}</a>` : esc(it.b);
  $('#facts').innerHTML = `<dt>Brand</dt><dd>${esc(it.b)}</dd><dt>Stile</dt><dd>${esc(it.s)}</dd><dt>Catalogo</dt><dd>${catName}</dd>`;
  $('#desc').textContent = it.d || 'Vieni a provarlo in atelier: ti racconteremo tessuti, dettagli e possibilità di personalizzazione della sartoria interna.';
  $('#book').href = `prenota.html?abito=${encodeURIComponent(`${it.n} (${it.b})`)}`;
  $('#try').href = `prova-virtuale.html?id=${encodeURIComponent(it.id)}`;
  // messaggio già scritto per WhatsApp e per email, con il nome dell'abito
  const page = location.href.split('#')[0];
  const msg = `Buongiorno, vorrei ricevere più informazioni sull'abito ${it.n} di ${it.b}: disponibilità, taglie e prezzo. Ecco la scheda: ${page}`;
  $('#ask-wa').href = `https://wa.me/393248790033?text=${encodeURIComponent(msg)}`;
  $('#ask-mail').href = `mailto:info@sposamiatelier.com?subject=${encodeURIComponent(`Informazioni sull'abito ${it.n} (${it.b})`)}&body=${encodeURIComponent(`${msg}\n\nGrazie!`)}`;
  const askBtn = $('.ask__btn'), askMenu = $('#ask-menu');
  askBtn.addEventListener('click', () => {
    const open = askMenu.hidden;
    askMenu.hidden = !open;
    askBtn.setAttribute('aria-expanded', String(open));
    if (open && !reduce) gsap.from($$('.ask__opt', askMenu), { opacity: 0, y: -10, duration: 0.6, ease: 'expo.out', stagger: 0.07 });
  });
  const rel = CATALOG.filter((i) => i.b === it.b && i.id !== it.id && i.c === it.c).slice(0, 4);
  $('#related').innerHTML = rel.map(cardHTML).join('');
  $('#related-title').textContent = rel.length ? `Altri abiti ${it.b}` : '';
  if (!reduce) {
    gsap.from('.pdp__info > *', { opacity: 0, y: 24, duration: 1, ease: 'expo.out', stagger: 0.06, delay: 0.4 });
  }
}

/* Galleria dell'abito: le foto intere in fila, si scorrono col dito, col trackpad o trascinando col mouse */
const imgFit = (id, w, h) => id.startsWith('assets/') ? id : `${MEDIA}${id}/v1/fit/w_${w},h_${h},q_85,enc_auto/${id.split('~')[0].split('.')[0]}.jpg`;
function initGallery(box, it) {
  const pics = it.img;
  const n = pics.length;
  const pad = (k) => String(k).padStart(2, '0');
  box.innerHTML = `<div class="gl${n > 1 ? '' : ' gl--one'}" aria-roledescription="galleria" aria-label="Foto di ${esc(it.n)}">
    <div class="gl__track" tabindex="0" data-lenis-prevent>${pics.map((src, k) => `<figure class="gl__slide"><img src="${imgFit(src, 1400, 1750)}" alt="${esc(`${it.n}, ${it.b}, foto ${k + 1} di ${n}`)}"${k > 1 ? ' loading="lazy"' : ''} draggable="false"></figure>`).join('')}</div>
    ${n > 1 ? `<div class="gl__ui"><p class="gl__count" aria-live="polite"><b>01</b> / ${pad(n)}</p><div class="gl__bar" aria-hidden="true"><i></i></div><div class="gl__nav"><button type="button" class="gl__btn" data-d="-1" aria-label="Foto precedente"><svg viewBox="0 0 14 10" aria-hidden="true"><path d="M14 5H2M5.5 1 1.5 5l4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button><button type="button" class="gl__btn" data-d="1" aria-label="Foto successiva"><svg viewBox="0 0 14 10" aria-hidden="true"><path d="M0 5h12M8.5 1l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.2"/></svg></button></div></div>` : ''}
  </div>`;
  const track = $('.gl__track', box);
  const slides = $$('.gl__slide', box);
  if (!reduce) gsap.from(slides, { opacity: 0, x: 60, duration: 1.4, ease: 'expo.out', stagger: 0.08, delay: 0.2 });
  if (n < 2) return;
  const count = $('.gl__count b', box), bar = $('.gl__bar i', box);
  const nearest = () => {
    const x = track.scrollLeft;
    let best = 0;
    slides.forEach((s, k) => { if (Math.abs(s.offsetLeft - track.offsetLeft - x) < Math.abs(slides[best].offsetLeft - track.offsetLeft - x)) best = k; });
    return best;
  };
  const to = (k) => {
    k = Math.max(0, Math.min(n - 1, k));
    track.scrollTo({ left: slides[k].offsetLeft - track.offsetLeft, behavior: reduce ? 'auto' : 'smooth' });
  };
  const sync = () => {
    const max = track.scrollWidth - track.clientWidth;
    const k = track.scrollLeft >= max - 2 ? n - 1 : nearest();
    count.textContent = pad(k + 1);
    bar.style.transform = `scaleX(${max > 0 ? Math.max(0.06, track.scrollLeft / max) : 1})`;
  };
  track.addEventListener('scroll', sync, { passive: true });
  sync();
  box.addEventListener('click', (e) => {
    const btn = e.target.closest('.gl__btn');
    if (btn) to(nearest() + +btn.dataset.d);
  });
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); to(nearest() + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); to(nearest() - 1); }
  });
  // trascinamento col mouse, con inerzia e aggancio alla foto più vicina
  let drag = null;
  track.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    drag = { x: e.clientX, left: track.scrollLeft, v: 0, t: performance.now(), moved: false };
    track.classList.add('is-drag');
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const now = performance.now(), dx = e.clientX - drag.x;
    const nextLeft = drag.left - dx;
    drag.v = (track.scrollLeft - nextLeft) / Math.max(now - drag.t, 1);
    drag.t = now;
    if (Math.abs(dx) > 4) drag.moved = true;
    track.scrollLeft = nextLeft;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    const fling = drag.v * 260;
    track.classList.remove('is-drag');
    const target = track.scrollLeft - fling;
    let k = 0;
    slides.forEach((s, i) => { if (Math.abs(s.offsetLeft - track.offsetLeft - target) < Math.abs(slides[k].offsetLeft - track.offsetLeft - target)) k = i; });
    to(k);
    drag = null;
  });
}

/* =========================================================
   BRAND
   ========================================================= */
function initBrands() {
  const key = new URLSearchParams(location.search).get('b');
  const b = BRANDS.find((x) => x.k === key);
  if (!b) {
    const card = (x) => {
      const n = CATALOG.filter((i) => i.b === x.n).length;
      return `<a class="bcard" href="brand.html?b=${x.k}" data-in><div class="bcard__pic">${x.tile ? `<img src="${img(x.tile, 600, 750)}" alt="Abito ${esc(x.n)}" loading="lazy">` : `<span>${esc(x.n)}</span>`}</div><p class="bcard__name">${esc(x.n)}</p><p class="bcard__ct">${n ? `${n} abiti` : 'Modelli in atelier'}</p></a>`;
    };
    $('#b-donna').innerHTML = BRANDS.filter((x) => x.g === 'donna').map(card).join('');
    $('#b-uomo').innerHTML = BRANDS.filter((x) => x.g === 'uomo').map(card).join('');
    return;
  }
  $('#brand-index').hidden = true;
  $('#brand-one').hidden = false;
  document.title = `${b.n} | Brand | Sposami Atelier`;
  const list = CATALOG.filter((i) => i.b === b.n);
  const n = list.length;
  $('#bname').textContent = b.n;
  $('#bdesc').textContent = b.d;
  $('#bcount').textContent = n ? `${n} abiti in atelier` : 'Modelli disponibili in atelier';
  const hero = b.tile || list[0]?.img[0];
  if (hero) { $('#bimg').src = img(hero, 1800, 2250); $('#bimg').alt = `Abito ${b.n}`; }
  const book = `prenota.html?abito=${encodeURIComponent(b.n)}`;
  $('#bbook').href = book; $('#binv-book').href = book;
  $('#binv-lead').textContent = `Vieni in atelier a scoprire gli abiti ${b.n}: la prova è gratuita e senza impegno, e la nostra sartoria li adatta su di te.`;
  $('#binv-try').href = list[0] ? `prova-virtuale.html?id=${encodeURIComponent(list[0].id)}` : 'prova-virtuale.html';
  if (!n) $('#binv-try').remove();

  // collezione con filtri per stile
  const grid = $('#bgrid');
  const styles = [...new Set(list.map((i) => i.s))].sort();
  const filter = $('#bfilter');
  filter.innerHTML = n > 1 && styles.length > 1 ? ['Tutti', ...styles].map((st, k) => `<button type="button" class="chip" aria-pressed="${k === 0}" data-s="${esc(st)}">${esc(st)}${k ? `<span class="n">${list.filter((i) => i.s === st).length}</span>` : ''}</button>`).join('') : '';
  const draw = (st) => {
    const l = st === 'Tutti' ? list : list.filter((i) => i.s === st);
    grid.innerHTML = l.length ? l.map(cardHTML).join('') : '<p class="empty">Chiedi in atelier i modelli disponibili di questo brand.</p>';
    animateIn($$('.card', grid));
    ScrollTrigger.refresh();
  };
  filter.addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    $$('.chip', filter).forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    draw(c.dataset.s);
  });
  draw('Tutti');

  // altre maison
  const others = BRANDS.filter((x) => x.k !== b.k && x.g === b.g && (x.tile || CATALOG.some((i) => i.b === x.n)));
  $('#bmore').innerHTML = others.map((x) => `<a class="bmore__item" href="brand.html?b=${x.k}"><div class="bmore__pic">${typeOrPic(x, 600, 800, `Abito ${x.n}`)}</div><span>${esc(x.n)}</span></a>`).join('');

  if (!reduce) {
    gsap.fromTo('.bh__media img', { scale: 1.08, opacity: 0 }, { scale: 1, opacity: 1, duration: 2.4, ease: 'power2.out' });
    gsap.from('.bh__copy > *', { opacity: 0, y: 14, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.5 });
    gsap.to('.bh__media img', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.bh', start: 'top top', end: 'bottom top', scrub: true } });
  }
}

/* =========================================================
   PROVA VIRTUALE
   ========================================================= */
function initTryOn() {
  const drop = $('#drop');
  const file = $('#photo');
  file.addEventListener('change', () => {
    const f = file.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    let im = $('img', drop);
    if (!im) { im = document.createElement('img'); drop.appendChild(im); }
    im.src = URL.createObjectURL(f); im.alt = 'La tua foto';
    $('.drop__txt', drop).hidden = true;
    if (!reduce) gsap.fromTo(im, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 1, ease: 'expo.out' });
  });
  ['dragenter', 'dragover'].forEach((t) => drop.addEventListener(t, () => drop.classList.add('is-over')));
  ['dragleave', 'drop'].forEach((t) => drop.addEventListener(t, () => drop.classList.remove('is-over')));

  const list = CATALOG.filter((i) => i.c !== 'sposo' && i.img.length);
  const pre = new URLSearchParams(location.search).get('id');
  const brands = [...new Set(list.map((i) => i.b))];
  const pick = $('#pick');
  const chips = $('#pick-brands');
  chips.innerHTML = ['Tutti', ...brands].map((b, n) => `<button type="button" class="chip" aria-pressed="${n === 0}" data-b="${esc(b)}">${esc(b)}</button>`).join('');
  const choose = (it) => {
    $('#chosen').textContent = `${it.n}, ${it.b}`;
    const im = $('#chosen-img');
    im.src = img(it.img[0], 240, 300); im.alt = `${it.n}, ${it.b}`; im.hidden = false;
    $('#chosen-card').classList.add('is-on');
  };
  function draw(brand) {
    let l = brand === 'Tutti' ? list.slice(0, 60) : list.filter((i) => i.b === brand);
    const p = CATALOG.find((i) => i.id === pre);
    if (p && !l.includes(p) && brand === 'Tutti') l = [p, ...l];
    pick.innerHTML = l.map((i) => `<button type="button" role="radio" aria-checked="${i.id === pre}" data-id="${esc(i.id)}" aria-label="${esc(`${i.n}, ${i.b}`)}"><img loading="lazy" src="${img(i.img[0], 240, 320)}" alt=""></button>`).join('');
  }
  chips.addEventListener('click', (e) => {
    const c = e.target.closest('.chip'); if (!c) return;
    $$('.chip', chips).forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    draw(c.dataset.b);
  });
  pick.addEventListener('click', (e) => {
    const b = e.target.closest('[role="radio"]'); if (!b) return;
    $$('[role="radio"]', pick).forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    choose(CATALOG.find((i) => i.id === b.dataset.id));
  });
  draw('Tutti');
  const p = CATALOG.find((i) => i.id === pre);
  if (p) {
    choose(p);
    // arrivando dalla scheda di un abito si va dritti all'abito scelto, ben visibile
    const tool = $('#chosen-card');
    setTimeout(() => { const y = tool.getBoundingClientRect().top + scrollY - 110; lenis ? lenis.scrollTo(y) : window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); }, 700);
  }
}

/* =========================================================
   MODULI (dimostrativi)
   ========================================================= */
function initForms() {
  const params = new URLSearchParams(location.search);
  const d = $('#b-data');
  if (d) d.min = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  if (params.get('abito') && $('#b-note')) $('#b-note').value = `Vorrei provare: ${params.get('abito')}`;
  const s = params.get('settore');
  if (s) { const r = $(`input[name="settore"][value="${s}"]`); if (r) r.checked = true; }

  $$('form[data-demo]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      $$('.form__err', form).forEach((n) => n.remove());
      let first = null;
      $$('[required]', form).forEach((f) => {
        if (f.type === 'radio') return;
        const bad = f.type === 'checkbox' ? !f.checked : !f.value.trim();
        f.setAttribute('aria-invalid', String(bad));
        if (!bad) { f.removeAttribute('aria-describedby'); return; }
        const m = document.createElement('p');
        m.className = 'form__err'; m.id = `${f.id}-err`;
        m.textContent = f.type === 'checkbox' ? 'Serve il consenso per continuare.' : 'Compila questo campo per continuare.';
        (f.closest('.check') || f).insertAdjacentElement('afterend', m);
        f.setAttribute('aria-describedby', m.id);
        first ??= f;
      });
      if (first) { first.focus(); return; }
      const ok = $('.form__ok', form);
      ok.classList.add('is-on'); ok.tabIndex = -1; ok.focus();
      form.reset();
      if (!reduce) gsap.fromTo(ok, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' });
    });
  });
}

/* Schede (pagina Contatti): una sola scheda aperta, frecce per spostarsi, #domanda apre la seconda */
function initTabs() {
  $$('.tabs').forEach((box) => {
    const tabs = $$('[role="tab"]', box);
    const show = (t, focus = false) => {
      tabs.forEach((x) => {
        const on = x === t;
        x.setAttribute('aria-selected', String(on));
        x.tabIndex = on ? 0 : -1;
        $(`#${x.getAttribute('aria-controls')}`).hidden = !on;
      });
      if (focus) t.focus();
      const panel = $(`#${t.getAttribute('aria-controls')}`);
      if (!reduce) gsap.fromTo(panel, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: 'expo.out' });
      ScrollTrigger.refresh();
    };
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => show(t));
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        show(tabs[(k + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length], true);
      });
    });
    if (location.hash === '#domanda') show(tabs[1]);
  });
}

/* =========================================================
   MOTION v6
   ========================================================= */
const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/* Testate in motion, una variante per pagina */
/* Hero delle pagine: una scena 3D diversa per ogni pagina (js/hero3d.js) */
function initHero3D() {
  const el = $('.h3d');
  if (!el) return;
  const title = $('.h3d__title', el);
  if (!reduce) {
    title.setAttribute('aria-label', title.textContent.trim());
    title.innerHTML = title.textContent.trim().split(/\s+/).map((w) => `<span class="w" aria-hidden="true"><span>${esc(w)}</span></span>`).join(' ');
    gsap.from($$('.w > span', title), { yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.06, delay: 0.3 });
    gsap.from($$('.h3d__body > *', el), { opacity: 0, y: 20, duration: 1, ease: 'expo.out', stagger: 0.08, delay: 0.6 });
  }
  import(`./hero3d.js${new URL(import.meta.url).search}`).then((m) => m.mount(el, { brands: BRANDS, low: LOW })).catch((err) => console.warn('Hero 3D non disponibile', err));
}

/* Hero d'immagine: "cinema" (sposa, sposo, cerimonia) e "dal dettaglio all'abito" (brand) */
function initImageHero() {
  const el = $$('[data-ih]').find((x) => !x.closest('[hidden]'));
  if (!el) return;
  if (el.dataset.ih === 'cinema') initCinema(el);
  if (el.dataset.ih === 'zoom') initZoom(el);
}

/* Lettere del titolo, per farle comparire una alla volta */
function splitChars(title) {
  const text = title.textContent.trim();
  title.setAttribute('aria-label', text);
  title.innerHTML = [...text].map((c) => `<span class="ch" aria-hidden="true">${c === ' ' ? '&nbsp;' : esc(c)}</span>`).join('');
  return $$('.ch', title);
}

/* Cinema: foto a tutto schermo; scorrendo la camera scende lungo l'abito, lentissima.
   La foto si sposta con transform (la scheda grafica la muove senza ridisegnarla); su telefono resta ferma (sticky). */
function initCinema(el) {
  const im = $('.cn__img', el);
  const pin = $('.cn__pin', el);
  const small = window.matchMedia('(max-width: 760px)').matches;
  const from = small ? el.dataset.mfrom : el.dataset.from;
  const to = small ? el.dataset.mto : el.dataset.to;
  im.style.objectPosition = from;
  if (reduce) return;
  if (MOBILE) el.classList.add('cn--sticky');
  const chars = splitChars($('.cn__title', el));
  gsap.timeline({ delay: 0.1 })
    .from($('.cn__media', el), { opacity: 0, scale: 1.06, duration: 2.4, ease: 'power2.out' }, 0)
    .from(chars, { opacity: 0, duration: 1.2, ease: 'power1.out', stagger: 0.07 }, 0.6)
    .from($$('.cn__copy > :not(.cn__title), .cn__hint', el), { opacity: 0, y: 10, duration: 1.2, ease: 'expo.out', stagger: 0.12 }, 1.1);
  const dim = document.createElement('div');
  dim.className = 'cn__dim';
  dim.setAttribute('aria-hidden', 'true');
  $('.cn__shade', el).after(dim);
  const box = { W: 1, H: 1, w: 1, h: 1 };
  const fit = () => {
    const W = pin.clientWidth, H = pin.clientHeight;
    const r = (im.naturalWidth || 4) / (im.naturalHeight || 5);
    const wide = W / H > r;
    Object.assign(box, { W, H, w: wide ? W : H * r, h: wide ? W / r : H });
    Object.assign(im.style, { position: 'absolute', left: '0', top: '0', maxWidth: 'none', width: `${box.w}px`, height: `${box.h}px` });
  };
  const at = (s) => {
    const [px, py] = s.split(' ').map((p) => parseFloat(p) / 100);
    return { x: -(box.w - box.W) * px, y: -(box.h - box.H) * py };
  };
  fit();
  if (!im.complete) im.addEventListener('load', () => { fit(); ScrollTrigger.refresh(); }, { once: true });
  ScrollTrigger.addEventListener('refreshInit', fit);
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: MOBILE ? true : 0.8, invalidateOnRefresh: true } })
    .fromTo(im, { x: () => at(from).x, y: () => at(from).y, scale: 1 }, { x: () => at(to).x, y: () => at(to).y, scale: 1.07, duration: 1 }, 0)
    .to($('.cn__hint', el), { opacity: 0, duration: 0.08 }, 0)
    .to($('.cn__copy', el), { opacity: 0, y: -16, duration: 0.3 }, 0.05)
    .to(dim, { opacity: 1, duration: 0.35 }, 0.65);
}

/* Brand: si parte dal pizzo in primissimo piano e la camera si allontana fino all'abito */
function initZoom(el) {
  const im = $('.bz__img', el);
  const u = +el.dataset.u, v = +el.dataset.v, S = MOBILE ? 1.7 : +el.dataset.s || 2.4;
  const aim = () => {
    const W = im.clientWidth, H = im.clientHeight;
    const w = im.naturalWidth || 3508, h = im.naturalHeight || 2480;
    const k = Math.max(W / w, H / h), dw = w * k, dh = h * k;
    const [px, py] = getComputedStyle(im).objectPosition.split(' ').map((p) => parseFloat(p) / 100);
    im.style.transformOrigin = `${(W - dw) * px + u * dw}px ${(H - dh) * py + v * dh}px`;
  };
  aim();
  im.complete ? aim() : im.addEventListener('load', aim, { once: true });
  ScrollTrigger.addEventListener('refreshInit', aim);
  if (reduce) return;
  el.classList.add('bz--animated');
  const stage = $('.bz__pin', el);
  if (!MOBILE) gsap.from(im, { opacity: 0, duration: 2, ease: 'power2.out' });
  gsap.from($$('.bz__open, .cn__hint', el), { opacity: 0, y: 10, duration: 1.4, ease: 'expo.out', stagger: 0.2, delay: 0.6 });
  gsap.set($('.bz__copy', el), { opacity: 0, y: 16 });
  gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: el, start: 'top top', end: () => '+=' + (el.offsetHeight - stage.offsetHeight), scrub: MOBILE ? true : 0.8 } })
    .fromTo(im, { scale: S }, { scale: 1, duration: 0.8, ease: MOBILE ? 'none' : 'power2.inOut' }, 0)
    .to($$('.bz__open, .cn__hint', el), { opacity: 0, duration: 0.12 }, 0.04)
    .to($('.bz__shade', el), { opacity: 1, duration: 0.25 }, 0.6)
    .to($('.bz__copy', el), { opacity: 1, y: 0, duration: 0.2 }, 0.7);
}

/* La barra resta trasparente, con logo e testi bianchi, finché si è sopra la foto della hero */
function initBarOver() {
  const hero = $$('.vhero, .cn, .bz, .bh, .h3d--dark').find((el) => !el.closest('[hidden]'));
  const bar = $('.bar');
  if (!hero || !bar) return;
  document.body.classList.add('has-over');
  bar.classList.add('bar--over');
  ScrollTrigger.create({
    trigger: hero.closest('.pin-spacer') || hero,
    start: 'top top',
    end: () => `bottom ${bar.offsetHeight}px`,
    onLeave: () => bar.classList.remove('bar--over'),
    onEnterBack: () => bar.classList.add('bar--over'),
  });
}

function typeOrPic(b, w, h, alt) {
  return b.tile
    ? `<img src="${img(b.tile, w, h)}" alt="${esc(alt)}" loading="lazy">`
    : `<b class="type-tile"><i aria-hidden="true">♥</i>${esc(b.n)}</b>`;
}

// Card in bianco e nero che si colorano entrando nello schermo: una transizione CSS, nessun calcolo durante lo scroll
const greyIO = 'IntersectionObserver' in window ? new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.remove('is-grey');
    greyIO.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -18% 0px' }) : null;
function animateIn(els) {
  if (reduce || MOBILE || !greyIO || !els.length) return;
  els.forEach((card) => { card.classList.add('is-grey'); greyIO.observe(card); });
}

/* Perché sceglierci: le icone si disegnano */
function initWhy() {
  const items = $$('.whyl__list > li, .points > div, .services__list > li, .steps > li, .sar-cols > li');
  if (!items.length) return;
  const draw = (li, d = 0) => gsap.fromTo($$('.ic svg > *', li), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut', stagger: 0.12, delay: d });
  if (reduce) { gsap.set($$('.ic svg > *'), { strokeDashoffset: 0 }); return; }
  ScrollTrigger.batch(items, { start: 'top 88%', once: true, onEnter: (b) => b.forEach((li, k) => draw(li, 0.2 + k * 0.15)) });
  items.forEach((li) => li.addEventListener('pointerenter', () => draw(li)));
}

/* Titoli: le parole salgono una alla volta */
function initWords() {
  if (reduce) return;
  $$('.head, .mh__title').forEach((h) => {
    if (h.dataset.words || h.querySelector('*')) return;
    h.dataset.words = '1';
    h.innerHTML = h.textContent.trim().split(/\s+/).map((w) => `<span class="w"><span>${esc(w)}</span></span>`).join(' ');
    gsap.from($$('.w > span', h), { yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.05, scrollTrigger: { trigger: h, start: 'top 92%', once: true } });
  });
}

/* Foto che si aprono come una tendina */
function initImageReveals() {
  if (reduce) return;
  const sel = '.story__pic, .services__pic, .who__pic, .intro__pic, .bcard__pic, .gal__pic, .quiz__side';
  ScrollTrigger.batch(sel, {
    start: 'top 92%', once: true,
    onEnter: (els) => gsap.fromTo(els, { clipPath: 'inset(18% 0 18% 0 round 22px)', scale: 0.94 }, { clipPath: 'inset(0% 0 0% 0 round 22px)', scale: 1, duration: 1.3, ease: 'expo.out', stagger: 0.08 }),
  });
}

/* Card con inclinazione 3D e pulsanti magnetici */
function initTilt() {
  if (reduce || !fine) return;
  document.addEventListener('pointermove', (e) => {
    const c = e.target.closest('.band a, .cflow__item.is-on');
    if (!c) return;
    const r = c.getBoundingClientRect();
    gsap.to(c, { rotationY: ((e.clientX - r.left) / r.width - 0.5) * 10, rotationX: -((e.clientY - r.top) / r.height - 0.5) * 10, transformPerspective: 900, duration: 0.5, ease: 'power3' });
  });
  document.addEventListener('pointerout', (e) => {
    const c = e.target.closest('.card, .bcard, .band a');
    if (c && !c.contains(e.relatedTarget)) gsap.to(c, { rotationY: 0, rotationX: 0, duration: 0.8, ease: 'elastic.out(1, .5)' });
  });
  $$('.btn').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); gsap.to(b, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power3' }); });
    b.addEventListener('pointerleave', () => gsap.to(b, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, .4)' }));
  });
}

/* Nastro di parole mosso dallo scroll */
function initBand() {
  $$('.tband').forEach((b) => {
    const [a, c] = $$('.tband__row', b);
    if (reduce) return;
    gsap.fromTo(a, { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
    gsap.fromTo(c, { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: b, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
}

/* Home, "Collezione 2027": le foto si scoprono dal basso, una dopo l'altra */
function initCollection() {
  const band = $('.band');
  if (!band) return;
  const cards = $$('a', band);
  cards.forEach((a) => { a.dataset.inDone = '1'; });
  if (reduce) { gsap.set(cards, { opacity: 1, y: 0 }); return; }
  gsap.set(cards, { opacity: 1, y: 0, clipPath: 'inset(100% 0 0 0)' });
  gsap.set(cards.map((a) => $('img', a)), { yPercent: 10 });
  ScrollTrigger.create({
    trigger: band, start: 'top 78%', once: true,
    onEnter: () => {
      gsap.to(cards, { clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: 'expo.inOut', stagger: 0.12 });
      gsap.to(cards.map((a) => $('img', a)), { yPercent: 0, duration: 1.8, ease: 'expo.out', stagger: 0.12, delay: 0.15 });
    },
  });
}

/* File di card scorrevoli: se il dito ha trascinato, il tocco non apre il link */
function initSwipeGuard() {
  $$('.band, .bmore__row, .alt-steps__list, .gal, .gl__track').forEach((row) => {
    let x0 = 0, y0 = 0, s0 = 0;
    row.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; s0 = row.scrollLeft; }, { passive: true });
    row.addEventListener('click', (e) => {
      if (Math.abs(e.clientX - x0) > 8 || Math.abs(e.clientY - y0) > 8 || Math.abs(row.scrollLeft - s0) > 4) { e.preventDefault(); e.stopPropagation(); }
    }, true);
  });
}

/* Prima e dopo da trascinare */
function initBeforeAfter() {
  $$('.ba').forEach((ba) => {
    const after = $('.ba__after', ba);
    const before = $('.ba__before img', ba);
    const single = () => { ba.classList.add('ba--single'); if (after.dataset.fallback && !after.dataset.used) { after.dataset.used = '1'; after.src = after.dataset.fallback; } };
    after.addEventListener('error', single);
    before.addEventListener('error', single);
    if ([after, before].some((im) => im.complete && !im.naturalWidth)) single();
    const range = $('.ba__range', ba);
    const set = (v) => { ba.style.setProperty('--pos', `${v}%`); range.value = v; };
    range.addEventListener('input', () => set(range.value));
    let drag = false;
    const move = (e) => { const r = ba.getBoundingClientRect(); set(gsap.utils.clamp(0, 100, ((e.clientX - r.left) / r.width) * 100)); };
    ba.addEventListener('pointerdown', (e) => { drag = true; move(e); });
    window.addEventListener('pointerup', () => { drag = false; });
    ba.addEventListener('pointermove', (e) => { if (drag || fine) move(e); });
    if (!reduce) {
      const o = { v: 50 };
      gsap.timeline({ scrollTrigger: { trigger: ba, start: 'top 70%', once: true } })
        .to(o, { v: 15, duration: 1, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 85, duration: 1.4, ease: 'power2.inOut', onUpdate: () => set(o.v) })
        .to(o, { v: 50, duration: 1, ease: 'power2.inOut', onUpdate: () => set(o.v) });
    }
  });
}

/* Brand in home: carosello 3D trascinabile */
function initCoverflow() {
  const stage = $('.cflow__stage');
  if (!stage) return;
  const list = BRANDS.filter((b) => b.g === 'donna' || b.tile);
  stage.innerHTML = list.map((b) => `<a class="cflow__item" href="brand.html?b=${b.k}">${typeOrPic(b, 600, 800, '')}<span>${esc(b.n)}</span></a>`).join('');
  const items = $$('.cflow__item', stage);
  const name = $('.cflow__name');
  let at = 2;
  let timer = 0;
  const render = () => {
    items.forEach((el, k) => {
      let d = k - at;
      if (d > items.length / 2) d -= items.length;
      if (d < -items.length / 2) d += items.length;
      const a = Math.abs(d);
      el.classList.toggle('is-on', d === 0);
      el.tabIndex = d === 0 ? 0 : -1;
      gsap.to(el, { x: d * Math.min(240, innerWidth * 0.2), z: -a * 180, rotationY: gsap.utils.clamp(-50, 50, -d * 38), opacity: a > 3 ? 0 : 1 - a * 0.18, zIndex: 50 - a, duration: reduce ? 0 : 0.9, ease: 'expo.out' });
    });
    const b = list[at];
    name.textContent = `${b.n}, ${CATALOG.filter((i) => i.b === b.n).length || 'modelli in atelier'}${CATALOG.filter((i) => i.b === b.n).length ? ' abiti' : ''}`;
  };
  const go = (n) => { at = (n + items.length) % items.length; render(); clearInterval(timer); if (!reduce) timer = setInterval(() => go(at + 1), 3500); };
  $$('[data-cf]').forEach((b) => b.addEventListener('click', () => go(at + Number(b.dataset.cf))));
  let sx = null;
  let moved = false;
  stage.addEventListener('pointerdown', (e) => { sx = e.clientX; moved = false; });
  window.addEventListener('pointerup', (e) => { if (sx === null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 40) { moved = true; go(at - Math.sign(dx)); } sx = null; });
  stage.addEventListener('click', (e) => { const it = e.target.closest('.cflow__item'); if (!it) return; if (moved || !it.classList.contains('is-on')) { e.preventDefault(); e.stopPropagation(); if (!moved) go(items.indexOf(it)); } }, true);
  go(at);
}

/* =========================================================
   AVVIO
   ========================================================= */
if (PAGE === 'home') initHome();
if (PAGE === 'catalog') initCatalog();
if (PAGE === 'dress') initDress();
if (PAGE === 'brands') initBrands();
if (PAGE === 'tryon') initTryOn();
initReviews();
initMarquee();
initHero3D();
initImageHero();
initBarOver();
initWords();
initWhy();
initImageReveals();
initTilt();
initBand();
initCollection();
initBeforeAfter();
initCoverflow();
initForms();
initSwipeGuard();
initTabs();
initEntrances();
initParallax();
initWordmarks();
revealPage();
window.addEventListener('load', () => ScrollTrigger.refresh());
document.fonts?.ready.then(() => ScrollTrigger.refresh());
