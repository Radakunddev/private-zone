# Private Zone Security — weboldal

Elegáns, prémium megjelenésű weboldal a Private Zone Security részére.
Statikus site, build lépés és külső függőség nélkül — bármilyen tárhelyen azonnal futtatható.
Betűtípus: Helvetica webfontként beépítve (Regular a törzsszöveghez, Bold a címsorokhoz,
Bold Oblique a színnel is kiemelt, dőlt szavakhoz).

## Fő jellemzők

- **3D hero** — valódi, interaktív 3D öltönyös biztonsági őr (manöken) modell a nyitóképernyőn:
  automatikusan forog, desktopon egérrel is forgatható (`assets/models/bodyguard.glb`,
  lokálisan vendorolt `model-viewer` komponenssel). Mögötte finom por-animáció (off-white/charcoal)
  (saját, függőség nélküli canvas).
- **Aurora háttéreffekt** — a React Bits `<Aurora />` komponens hűséges vanilla WebGL2 portja
  (`js/aurora.js`), a brand off-white/charcoal színeivel a hero hátterében. Ugyanazok a shaderek és
  prop-ok (colorStops, speed, blend, amplitude), de React és `ogl` függőség nélkül.
- **Glassmorphism** — üveghatású kártyák, panelek és navigáció (`backdrop-filter`).
- **Kétnyelvűség (HU / EN)** — teljes magyar és angol tartalom, kulcs alapú i18n motorral
  (`js/i18n.js` + `js/i18n-dict.js` a főoldalhoz/közös elemekhez, `js/i18n-pages.js` a
  generált aloldalakhoz). Automatikus nyelvfelismerés a böngésző nyelvéből (magyar
  látogató → HU, minden más → EN), kézi HU/EN váltóval, `localStorage`-ban mentve.
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
js/aurora.js        — Aurora WebGL2 háttéreffekt (React Bits port, csak a főoldalon)
js/hero3d.js        — por-háttéranimáció a hero-ban (off-white/charcoal, csak a főoldalon)
js/main.js          — navigáció, téma, animációk, űrlap (minden oldalon)
assets/models/bodyguard.glb — a hero 3D öltönyös alakja (glTF binary)
assets/js/model-viewer.min.js — Google model-viewer webkomponens (Apache-2.0, vendorolt)
assets/logo-light.png  — hivatalos fehér logó (sötét háttérre), négyzetre vágva
assets/logo-dark.png   — hivatalos sötét logó (világos háttérre), négyzetre vágva
assets/logo-*-original.png — a hivatalos logók eredeti, vágatlan (1080×1080) változata
assets/favicon.png / favicon-32.png — favicon (fehér logó sötét, lekerekített háttéren)
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
- **Színek**: a `css/style.css` elején lévő CSS-változókban (az akcent a `--gold*`/`--gold-rgb` — jelenleg monokróm charcoal/off-white, témánként; `--bg`, `--ink`, …).
- **Statisztikák**: az `index.html` `data-count` attribútumaiban.
