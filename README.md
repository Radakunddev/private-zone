# Private Zone Security — weboldal

Elegáns, prémium megjelenésű weboldal a Private Zone Security részére.
Statikus site, build lépés és külső függőség nélkül — bármilyen tárhelyen azonnal futtatható.
Betűtípus: Helvetica webfontként beépítve (Regular a törzsszöveghez, Bold a címsorokhoz).

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
index.html          — főoldal (hero, szolgáltatások, rólunk, folyamat,
                      referenciák, CTA, kapcsolat, lábléc)

Aloldalak (teljes szöveges tartalommal, GYIK-kel):
  orzes-vedelem.html          — Őrzés-védelem
  szemelyvedelem.html         — Személyvédelem
  rendezvenybiztositas.html   — Rendezvénybiztosítás
  koveteleskezeles.html       — Követeléskezelés
  magannyomozas.html          — Magánnyomozás
  birtokvedelem.html          — Birtokvédelem
  rolunk.html                 — Rólunk
  kapcsolat.html              — Kapcsolat (űrlappal)

css/style.css       — dizájn (CSS-változókkal, téma-támogatással)
js/hero3d.js        — 3D részecske-pajzs a hero-ban (csak a főoldalon)
js/main.js          — navigáció, téma, animációk, űrlap (minden oldalon)
assets/logo-light.svg  — fehér logó (sötét háttérre)
assets/logo-dark.svg   — sötét logó (világos háttérre)
assets/favicon.svg     — arany favicon
tools/build-pages.mjs  — aloldal-generátor (tartalom + sablon egy helyen)
```

Az aloldalak a `tools/build-pages.mjs` scriptből generálódnak — szövegmódosításhoz
a scriptben lévő tartalmat szerkessze, majd futtassa: `node tools/build-pages.mjs`.

## Futtatás

Nyissa meg az `index.html`-t böngészőben, vagy indítson egy statikus szervert:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Testreszabás

- **Elérhetőségek**: a telefonszám (`+36 30 397 6916`) az `index.html`-ben és a
  `tools/build-pages.mjs` tetején (`PHONE_DISPLAY` / `PHONE_TEL`) módosítható;
  az e-mail (`info@privatezonesecurity.hu`) ugyanott és a `js/main.js`-ben.
- **Színek**: a `css/style.css` elején lévő CSS-változókban (`--gold`, `--bg`, …).
- **Statisztikák**: az `index.html` `data-count` attribútumaiban.
