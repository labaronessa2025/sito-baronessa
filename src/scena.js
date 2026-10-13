// Scena 3D dell'apertura: frutta e verdura di stagione costruite in codice (nessun modello da scaricare).
// Sorgente: viene impacchettata in js/scena.js con esbuild (vedi src/LEGGIMI.md).
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, SphereGeometry, CylinderGeometry, ConeGeometry,
  ShapeGeometry, Shape, MeshStandardMaterial, MeshPhysicalMaterial, HemisphereLight, DirectionalLight,
  AmbientLight, Color, Vector2, Vector3, Raycaster, DoubleSide, SRGBColorSpace, ACESFilmicToneMapping, MathUtils,
  TorusGeometry
} from "three";

const C = {
  zucca: 0xf07a2b, cachi: 0xf2601e, melagrana: 0xb8233a, mela: 0xc8312b, pera: 0x9cb83a,
  limone: 0xffd21f, foglia: 0x4f9a2c, fogliaScura: 0x2d6b22, gambo: 0x6b4a2b, castagna: 0x6e3b1f, uva: 0x5b2a5e
};

const mat = (color, extra = {}) => new MeshPhysicalMaterial({ color, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.4, ...extra });
const opaco = (color, extra = {}) => new MeshStandardMaterial({ color, roughness: 0.75, ...extra });

// deforma una sfera con una funzione di raggio r(theta, phi)
function sferaDeformata(seg, f) {
  const g = new SphereGeometry(1, seg, Math.round(seg * 0.75));
  const p = g.attributes.position, v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const r = Math.hypot(v.x, v.y, v.z) || 1;
    const theta = Math.atan2(v.z, v.x), phi = Math.acos(v.y / r);
    const s = f(theta, phi, v);
    p.setXYZ(i, v.x * s.x, v.y * s.y, v.z * s.z);
  }
  g.computeVertexNormals();
  return g;
}

function foglia(lungh = 0.9, largh = 0.42, colore = C.foglia) {
  const s = new Shape();
  s.moveTo(0, 0);
  s.bezierCurveTo(largh, lungh * 0.25, largh * 0.8, lungh * 0.8, 0, lungh);
  s.bezierCurveTo(-largh * 0.8, lungh * 0.8, -largh, lungh * 0.25, 0, 0);
  const g = new ShapeGeometry(s, 10);
  // leggera curvatura
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i); p.setZ(i, -x * x * 0.9 + Math.sin(y / lungh * Math.PI) * 0.06); }
  g.computeVertexNormals();
  return new Mesh(g, opaco(colore, { side: DoubleSide, roughness: 0.55 }));
}

function gambo(h = 0.35, r = 0.05) {
  const m = new Mesh(new CylinderGeometry(r * 0.7, r, h, 7), opaco(C.gambo));
  m.position.y = h / 2;
  return m;
}

const costruttori = {
  zucca() {
    const g = new Group();
    const corpo = new Mesh(sferaDeformata(64, (t, ph) => {
      const coste = 1 - 0.09 * Math.pow(Math.abs(Math.cos(t * 5)), 0.6) * Math.sin(ph);
      return { x: coste * 1.15, y: 0.78, z: coste * 1.15 };
    }), mat(C.zucca, { roughness: 0.5 }));
    g.add(corpo);
    const s = gambo(0.42, 0.11); s.position.y = 0.7; s.rotation.z = 0.25; g.add(s);
    const f = foglia(0.7, 0.4); f.position.set(0.1, 0.78, 0); f.rotation.set(-1.1, 0.4, -0.5); g.add(f);
    return g;
  },
  cachi() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(48, (t, ph) => {
      const q = 1 - 0.035 * Math.abs(Math.cos(t * 2)) * Math.sin(ph);
      return { x: q, y: 0.82, z: q };
    }), mat(C.cachi, { clearcoat: 0.8, roughness: 0.3 })));
    for (let i = 0; i < 4; i++) {
      const f = foglia(0.48, 0.3, C.fogliaScura);
      f.position.y = 0.8; f.rotation.set(-1.25, i * Math.PI / 2, 0, "YXZ"); g.add(f);
    }
    const s = gambo(0.16, 0.05); s.position.y = 0.8; g.add(s);
    return g;
  },
  melagrana() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(48, (t, ph) => ({ x: 1, y: 0.95 + 0.04 * Math.cos(ph), z: 1 })), mat(C.melagrana, { roughness: 0.38 })));
    const corona = new Mesh(new CylinderGeometry(0.2, 0.13, 0.3, 6, 1, true), opaco(0x8e1b2c, { side: DoubleSide }));
    corona.position.y = 1.0; g.add(corona);
    for (let i = 0; i < 6; i++) {
      const c = new Mesh(new ConeGeometry(0.06, 0.18, 4), opaco(0x8e1b2c));
      c.position.set(Math.cos(i) * 0.19, 1.2, Math.sin(i) * 0.19); c.rotation.z = Math.cos(i) * -0.5; c.rotation.x = Math.sin(i) * 0.5; g.add(c);
    }
    return g;
  },
  mela() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(48, (t, ph) => {
      const fossa = 1 - 0.28 * Math.exp(-ph * ph * 6) - 0.12 * Math.exp(-((Math.PI - ph) ** 2) * 6);
      return { x: fossa, y: 0.92 * fossa, z: fossa };
    }), mat(C.mela, { clearcoat: 0.9, roughness: 0.25 })));
    const s = gambo(0.36, 0.035); s.position.y = 0.62; s.rotation.z = -0.2; g.add(s);
    const f = foglia(0.5, 0.24); f.position.set(0.04, 0.9, 0); f.rotation.set(-0.4, 0, -1.1); g.add(f);
    return g;
  },
  pera() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(48, (t, ph) => {
      const y = Math.cos(ph); // 1 in alto, -1 in basso
      const k = 1 - 0.45 * Math.max(0, y) ** 1.4;
      return { x: k * 0.9, y: 1.25, z: k * 0.9 };
    }), mat(C.pera, { roughness: 0.55, clearcoat: 0.2 })));
    const s = gambo(0.38, 0.04); s.position.y = 1.15; s.rotation.z = 0.3; g.add(s);
    return g;
  },
  limone() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(48, (t, ph, v) => {
      const punta = 1 + 0.22 * Math.pow(Math.abs(Math.cos(ph)), 6);
      return { x: 0.78, y: 1.05 * punta, z: 0.78 };
    }), mat(C.limone, { roughness: 0.6, clearcoat: 0.25 })));
    const f = foglia(0.7, 0.3); f.position.y = 1.2; f.rotation.set(-0.3, 0.6, 0.9); g.add(f);
    g.rotation.z = 1.2;
    return g;
  },
  castagna() {
    const g = new Group();
    g.add(new Mesh(sferaDeformata(40, (t, ph) => {
      const y = Math.cos(ph);
      const k = 1 - 0.5 * Math.max(0, y) ** 2;
      return { x: k, y: 0.85, z: k * 0.62 };
    }), mat(C.castagna, { clearcoat: 1, roughness: 0.2 })));
    const base = new Mesh(sferaDeformata(30, () => ({ x: 0.75, y: 0.1, z: 0.48 })), opaco(0xcfb38a));
    base.position.y = -0.82; g.add(base);
    return g;
  },
  uva() {
    const g = new Group();
    const m = mat(C.uva, { clearcoat: 1, roughness: 0.25, sheen: 0.6, sheenColor: new Color(0x9b7fb0) });
    const acino = new SphereGeometry(0.26, 20, 16);
    const righe = [4, 4, 3, 3, 2, 1];
    righe.forEach((n, r) => {
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2 + r;
        const rad = n === 1 ? 0 : 0.12 + n * 0.07;
        const b = new Mesh(acino, m);
        b.position.set(Math.cos(a) * rad, 0.75 - r * 0.32, Math.sin(a) * rad);
        g.add(b);
      }
    });
    const s = gambo(0.4, 0.04); s.position.y = 0.9; g.add(s);
    const f = foglia(0.9, 0.55); f.position.set(0, 1.1, 0); f.rotation.set(-0.9, 0.5, -0.7); g.add(f);
    return g;
  },
  fogliaSola() {
    const g = new Group();
    const f = foglia(1.3, 0.6); f.position.y = -0.65; g.add(f);
    return g;
  }
};

const NOMI = { zucca: "Zucca", cachi: "Cachi", melagrana: "Melagrana", mela: "Mele", pera: "Pere", limone: "Limoni", castagna: "Castagne", uva: "Uva", fogliaSola: "" };

// disposizione: x,y in coordinate "di scena" relative alla zona del canvas, scala, profondità
const DESKTOP = [
  ["zucca", 2.65, -0.35, 1.2, 0.2], ["cachi", 4.15, 1.45, 0.7, -0.4], ["melagrana", 1.35, 1.9, 0.58, -1.2],
  ["mela", 4.25, -1.5, 0.62, 0.6], ["uva", 1.05, -1.75, 0.66, -0.4], ["pera", 2.9, 2.55, 0.5, -2],
  ["castagna", 1.55, 0.25, 0.4, 1.6], ["limone", 5.3, 0.25, 0.46, -1.6], ["castagna", 5.0, 2.7, 0.34, -2.4],
  ["fogliaSola", 3.6, 0.85, 0.42, 1.1], ["fogliaSola", 2.4, -2.55, 0.48, 0.4]
];
const MOBILE = [
  ["zucca", 0.15, -0.1, 1.15, 0.3], ["cachi", 2.3, 0.75, 0.7, -0.5], ["melagrana", -2.3, 0.95, 0.62, -1.1],
  ["mela", 2.2, -1.55, 0.62, 0.5], ["uva", -2.4, -1.05, 0.66, -0.2], ["castagna", -0.85, 1.75, 0.38, -0.8],
  ["limone", 0.95, 2.05, 0.42, -1.8], ["fogliaSola", -1.0, -2.05, 0.42, 1.0], ["pera", 3.5, 3.0, 0.42, -2.8], ["castagna", 1.25, -2.3, 0.32, 0.8]
];

export function avvia(canvas, opzioni = {}) {
  const ridotto = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scena = new Scene();
  const cam = new PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0, 12);

  scena.add(new HemisphereLight(0xfff6e0, 0x123f20, 1.3));
  scena.add(new AmbientLight(0xffffff, 0.15));
  const sole = new DirectionalLight(0xfff0d6, 2.6); sole.position.set(-4, 6, 7); scena.add(sole);
  const bordo = new DirectionalLight(0xc8ff7a, 1.6); bordo.position.set(6, -2, -4); scena.add(bordo);

  const radice = new Group(); scena.add(radice);
  let frutti = [];
  let layout = null;

  function componi() {
    const mobile = canvas.clientWidth < 760;
    const nuovo = mobile ? "m" : "d";
    if (nuovo === layout) return;
    layout = nuovo;
    frutti.forEach(f => radice.remove(f.g));
    frutti = (mobile ? MOBILE : DESKTOP).map(([tipo, x, y, s, z], i) => {
      const g = costruttori[tipo]();
      g.scale.setScalar(s);
      const base = new Vector3(x, y, z);
      g.position.copy(base);
      g.rotation.set(Math.random() * 0.6 - 0.3, Math.random() * Math.PI * 2, Math.random() * 0.5 - 0.25);
      g.userData = { tipo };
      radice.add(g);
      return { g, base, fase: i * 1.7, vel: 0.15 + (i % 3) * 0.06, giro: 0, spinta: new Vector3() };
    });
  }

  function dimensiona() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    componi();
    // inquadratura: su computer la frutta sta a destra del titolo
    if (layout === "d") { cam.fov = 30; radice.position.set(Math.max(-1.2, (cam.aspect - 1.6) * 1.6), -0.1, 0); }
    else { cam.fov = 35; radice.position.set(0, -0.15, 0); }
    cam.updateProjectionMatrix();
  }

  // interazione: il puntatore inclina la scena, un tocco fa girare il frutto e ne mostra il nome
  const puntatore = new Vector2(0, 0), obiettivo = new Vector2(0, 0);
  const ray = new Raycaster();
  window.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse") return;
    obiettivo.set(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1);
  }, { passive: true });
  canvas.addEventListener("pointerdown", e => {
    const r = canvas.getBoundingClientRect();
    const p = new Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1));
    ray.setFromCamera(p, cam);
    const colpi = ray.intersectObjects(radice.children, true);
    if (!colpi.length) return;
    let o = colpi[0].object; while (o.parent && o.parent !== radice) o = o.parent;
    const f = frutti.find(x => x.g === o);
    if (!f) return;
    f.giro = 1;
    f.spinta.set(0, 0.6, 0);
    const nome = NOMI[f.g.userData.tipo];
    if (nome && opzioni.onNome) opzioni.onNome(nome);
  });

  let scroll = 0;
  window.addEventListener("scroll", () => { scroll = Math.min(1, window.scrollY / (canvas.clientHeight || 1)); }, { passive: true });

  let visibile = true, attivo = true, t0 = performance.now(), ultimo = t0;
  new IntersectionObserver(([e]) => { visibile = e.isIntersecting; if (visibile) loop(); }).observe(canvas);
  document.addEventListener("visibilitychange", () => { attivo = !document.hidden; if (attivo) loop(); });
  new ResizeObserver(dimensiona).observe(canvas);
  dimensiona();

  let inCorsa = false, entrata = ridotto ? 1 : 0;
  function frame(ora) {
    const dt = Math.min(0.05, (ora - ultimo) / 1000); ultimo = ora;
    const t = (ora - t0) / 1000;
    entrata = Math.min(1, entrata + dt * 0.9);
    const e = 1 - Math.pow(1 - entrata, 3);
    puntatore.lerp(obiettivo, 0.05);
    radice.rotation.y = puntatore.x * 0.18;
    radice.rotation.x = puntatore.y * 0.1 + scroll * 0.35;
    frutti.forEach((f, i) => {
      const fl = ridotto ? 0 : 1;
      f.spinta.multiplyScalar(0.92);
      f.g.position.set(
        f.base.x + Math.sin(t * 0.5 + f.fase) * 0.06 * fl,
        f.base.y + Math.sin(t * f.vel * 4 + f.fase) * 0.13 * fl + f.spinta.y - (1 - e) * (3 + i * 0.4) - scroll * (0.8 + f.base.z * 0.4),
        f.base.z
      );
      f.g.rotation.y += dt * f.vel * fl + f.giro * dt * 14;
      f.giro *= 0.94;
      f.g.rotation.x = Math.sin(t * 0.3 + f.fase) * 0.12 * fl;
    });
    renderer.render(scena, cam);
  }
  function loop() {
    if (inCorsa) return;
    inCorsa = true;
    ultimo = performance.now();
    const passo = ora => {
      if (!visibile || !attivo) { inCorsa = false; return; }
      frame(ora);
      if (ridotto && entrata >= 1) { inCorsa = false; return; }
      requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }
  loop();
  return { renderer };
}
