# Private Zone Security — weboldal

Elegáns, prémium megjelenésű bemutatkozó oldal a Private Zone Security részére.
Statikus site, build lépés és külső függőség nélkül — bármilyen tárhelyen azonnal futtatható.

## Fő jellemzők

- **3D hero effekt** — a logó pajzsformája élő, 3D-ben forgó arany részecske-konstellációként
  jelenik meg a nyitóképernyőn, az egérmozgásra parallax-szal reagál (saját, függőség nélküli
  canvas-implementáció).
- **Glassmorphism** — üveghatású kártyák, panelek és navigáció (`backdrop-filter`).
- **Világos / sötét téma** — kapcsolóval, a választás mentésre kerül (`localStorage`),
  a logó automatikusan vált a light/dark változat között.
- **Mikrointerakciók** — 3D tilt a szolgáltatáskártyákon, animált számlálók,
  scroll-reveal, rajzolódó logó a preloaderben.
- Teljesen reszponzív, `prefers-reduced-motion` támogatással.

## Szerkezet

```
index.html          — a teljes oldal (hero, szolgáltatások, rólunk, folyamat,
                      referenciák, CTA, kapcsolat, lábléc)
css/style.css       — dizájn (CSS-változókkal, téma-támogatással)
js/hero3d.js        — 3D részecske-pajzs a hero-ban
js/main.js          — navigáció, téma, animációk, űrlap
assets/logo-light.svg  — fehér logó (sötét háttérre)
assets/logo-dark.svg   — sötét logó (világos háttérre)
assets/favicon.svg     — arany favicon
```

## Futtatás

Nyissa meg az `index.html`-t böngészőben, vagy indítson egy statikus szervert:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Testreszabás

- **Elérhetőségek**: az `index.html`-ben a `+36 30 000 0000` és az
  `info@privatezonesecurity.hu` helykitöltők — cserélje a valós adatokra
  (a kapcsolati űrlap `mailto:` címét a `js/main.js`-ben is).
- **Színek**: a `css/style.css` elején lévő CSS-változókban (`--gold`, `--bg`, …).
- **Statisztikák**: az `index.html` `data-count` attribútumaiban.
