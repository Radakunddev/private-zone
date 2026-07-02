#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — aloldal-generátor
   Futtatás:  node tools/build-pages.mjs
   A repó gyökerébe generálja a szolgáltatás- és tartalmi aloldalakat
   egységes sablonból. Az index.html kézzel karbantartott.
   ═══════════════════════════════════════════════════════════════ */
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const PHONE_DISPLAY = "+36 30 397 6916";
const PHONE_TEL = "+36303976916";
const EMAIL = "info@privatezonesecurity.hu";
const ADDRESS_L1 = "Panorama Office irodaház";
const ADDRESS_L2 = "1024 Budapest, Ady Endre utca 19";

/* ── logó (hivatalos PNG-k, témafüggő váltással) ── */
const LOGO_IMG = `<img src="assets/logo-light.png" alt="" class="logo-on-dark">
          <img src="assets/logo-dark.png" alt="" class="logo-on-light">`;

/* ── szolgáltatások listája (menühöz, footerhez, kapcsolódókhoz) ── */
// Sorrend = fontossági sorrend. Az első kettő a két kiemelt szolgáltatás.
const SERVICES = [
  { slug: "orzes-vedelem", name: "Őrzés-védelem", i18n: "svc.orzes" },
  { slug: "koveteleskezeles", name: "Követeléskezelés", i18n: "svc.koveteles" },
  { slug: "szemelyvedelem", name: "Személyvédelem", i18n: "svc.szemely" },
  { slug: "rendezvenybiztositas", name: "Rendezvénybiztosítás", i18n: "svc.rendezveny" },
  { slug: "magannyomozas", name: "Magánnyomozás", i18n: "svc.magannyomozas" },
  { slug: "birtokvedelem", name: "Birtokvédelem", i18n: "svc.birtok" },
];

/* ── i18n: aloldal-szótár gyűjtő ──
   T(hu,en) regisztrálja mindkét nyelvet és egy <span data-i18n-html>-t ad
   vissza (alap: magyar), amit az i18n motor a nyelv szerint kicserél. */
const PAGE_I18N = { hu: {}, en: {} };
let _gk = 0;
function key(hu, en) {
  const k = "p" + ++_gk;
  PAGE_I18N.hu[k] = hu;
  PAGE_I18N.en[k] = en;
  return k;
}
function T(hu, en) {
  return `<span data-i18n-html="${key(hu, en)}">${hu}</span>`;
}
function attr(hu, en) {
  // data-i18n kulcs sima attribútumhoz (textContent-hez)
  return `data-i18n="${key(hu, en)}"`;
}

/* ── közös sablonrészek ── */
const nav = (active) => {
  const inServices = active === "szolgaltatasok" || SERVICES.some((s) => s.slug === active);
  return `
  <header class="nav" id="nav">
    <div class="nav-inner">
      <a href="index.html" class="brand" aria-label="Private Zone Security — kezdőlap">
        <span class="brand-mark">${LOGO_IMG}</span>
        <span class="brand-text">
          <strong>PRIVATE ZONE</strong>
          <em>SECURITY</em>
        </span>
      </a>

      <nav class="nav-links" id="navLinks" aria-label="Fő navigáció">
        <div class="has-dropdown">
          <button class="dropdown-toggle${inServices ? " active" : ""}" aria-haspopup="true" aria-expanded="false">
            <span data-i18n="nav.services">Szolgáltatások</span>
            <svg class="caret" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
          </button>
          <div class="dropdown">
            <div class="dropdown-inner">
              ${SERVICES.map((s) => `<a href="${s.slug}.html"${active === s.slug ? ' class="active"' : ""} data-i18n="${s.i18n}">${s.name}</a>`).join("\n              ")}
            </div>
          </div>
        </div>
        <a href="rolunk.html" ${active === "rolunk" ? 'class="active"' : ""} data-i18n="nav.about">Rólunk</a>
        <a href="index.html#folyamat" data-i18n="nav.process">Folyamat</a>
        <a href="index.html#referenciak" data-i18n="nav.references">Referenciák</a>
        <a href="kapcsolat.html" ${active === "kapcsolat" ? 'class="active"' : ""} data-i18n="nav.contact">Kapcsolat</a>
      </nav>

      <div class="nav-actions">
        <button class="lang-toggle" data-lang-toggle aria-label="Language">EN</button>
        <button class="theme-toggle" id="themeToggle" aria-label="Világos / sötét mód váltása">
          <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/></svg>
          <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>
        </button>
        <a href="kapcsolat.html" class="btn btn-gold btn-nav" data-i18n="nav.cta">Ajánlatkérés</a>
        <button class="hamburger" id="hamburger" aria-label="Menü megnyitása" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </header>`;
};

const footer = `
  <footer class="footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <img src="assets/logo-light.png" alt="Private Zone Security logó" class="footer-logo logo-on-dark">
        <img src="assets/logo-dark.png" alt="Private Zone Security logó" class="footer-logo logo-on-light">
        <p><strong>PRIVATE ZONE SECURITY</strong><br><span data-i18n="footer.tagline">Diszkréció. Elegancia. Biztonság.</span></p>
        <p style="margin-top:.6rem"><span data-i18n="footer.addr1">${ADDRESS_L1}</span><br><span data-i18n="footer.addr2">${ADDRESS_L2}</span></p>
        <p style="margin-top:.4rem"><a href="tel:${PHONE_TEL}" style="color:inherit;text-decoration:none">${PHONE_DISPLAY}</a></p>
      </div>
      <nav class="footer-nav" aria-label="Lábléc navigáció">
        ${SERVICES.map((s) => `<a href="${s.slug}.html" data-i18n="${s.i18n}">${s.name}</a>`).join("\n        ")}
        <a href="rolunk.html" data-i18n="nav.about">Rólunk</a>
        <a href="kapcsolat.html" data-i18n="nav.contact">Kapcsolat</a>
        <a href="aszf.html" data-i18n="footer.aszf">ÁSZF</a>
        <a href="adatvedelem.html" data-i18n="footer.privacy">Adatvédelem</a>
      </nav>
      <div class="footer-meta">
        <p data-i18n="footer.note">Hatósági engedéllyel rendelkező személy- és vagyonvédelmi szolgáltató.</p>
        <p>© <span id="year"></span> Private Zone Security. <span data-i18n="footer.rights">Minden jog fenntartva.</span></p>
      </div>
    </div>
  </footer>`;

const ctaBand = `
    <section class="cta-band">
      <div class="container">
        <div class="glass cta-panel reveal">
          <div>
            <h2 data-i18n-html="cta.h">Az Ön privát zónája<br><span class="gold-text">egy hívásra van.</span></h2>
            <p data-i18n="cta.sub">Bizalmas konzultáció, 24 órán belüli visszajelzés.</p>
          </div>
          <div class="cta-actions">
            <a href="tel:${PHONE_TEL}" class="btn btn-gold">${PHONE_DISPLAY}</a>
            <a href="kapcsolat.html" class="btn btn-ghost" data-i18n="cta.write">Írjon nekünk</a>
          </div>
        </div>
      </div>
    </section>`;

const page = ({ title, titleEn, desc, active, body, noCta }) => `<!DOCTYPE html>
<html lang="hu" data-theme="dark" data-title-hu="${title} — Private Zone Security" data-title-en="${(titleEn || title)} — Private Zone Security">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script>document.documentElement.setAttribute('data-lang',(function(){try{var s=localStorage.getItem('pzs-lang');if(s==='hu'||s==='en')return s;var l=navigator.languages||[navigator.language||''];return [].some.call(l,function(x){return /^hu/i.test(x)})?'hu':'en'}catch(e){return 'hu'}})());</script>
  <title>${title} — Private Zone Security</title>
  <meta name="description" content="${desc}">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
  <link rel="icon" type="image/png" sizes="256x256" href="assets/favicon.png">
  <link rel="apple-touch-icon" href="assets/favicon.png">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
${nav(active)}

  <main>
${body}
${noCta ? "" : ctaBand}
  </main>
${footer}

  <script src="js/i18n-dict.js"></script>
  <script src="js/i18n-pages.js"></script>
  <script src="js/i18n.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
`;

const breadcrumb = (items) => `
        <nav class="breadcrumb" aria-label="Morzsamenü">
          ${items
            .map((it, i) =>
              i === items.length - 1
                ? `<strong>${it[0]}</strong>`
                : `<a href="${it[1]}">${it[0]}</a><span class="sep">/</span>`
            )
            .join("\n          ")}
        </nav>`;

const othersStrip = (slug) => `
    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal" style="margin-bottom:1.8rem">
          <p class="overline">${T("Kapcsolódó", "Related")}</p>
          <h2 style="font-size:1.6rem">${T("További szolgáltatásaink", "More of our services")}</h2>
        </header>
        <div class="others reveal">
          ${SERVICES.filter((s) => s.slug !== slug)
            .map((s) => `<a href="${s.slug}.html"><span data-i18n="${s.i18n}">${s.name}</span> →</a>`)
            .join("\n          ")}
        </div>
      </div>
    </section>`;

/* ── szolgáltatás-oldal sablon (kétnyelvű: s = HU tartalom, e = EN tükör) ── */
const servicePage = (s) => {
  const e = CONTENT_EN[s.slug] || {};
  const P = (hu, en) => `<p>${T(hu, en)}</p>`;
  return page({
    title: s.name,
    titleEn: e.name || s.name,
    desc: s.metaDesc,
    active: s.slug,
    body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([
  [T("Főoldal", "Home"), "index.html"],
  [T("Szolgáltatások", "Services"), "index.html#szolgaltatasok"],
  [T(s.name, e.name || s.name)],
])}
        <p class="overline reveal">${T(s.overline, e.overline)}</p>
        <h1 class="reveal d1">${T(s.h1, e.h1)}</h1>
        <p class="lead reveal d2">${T(s.lead, e.lead)}</p>
        <div class="hero-cta reveal d3">
          <a href="kapcsolat.html" class="btn btn-gold">${T("Ajánlatot kérek", "Request a quote")}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="tel:${PHONE_TEL}" class="btn btn-ghost">${PHONE_DISPLAY}</a>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container intro-grid">
        <div class="intro-copy reveal">
          ${s.intro.map((p, i) => P(p, (e.intro || [])[i] || p)).join("\n          ")}
        </div>
        <aside class="glass facts reveal d1">
          <h3>${T("Röviden", "In brief")}</h3>
          <ul>
            ${s.facts.map((f, i) => `<li>${T(f, (e.facts || [])[i] || f)}</li>`).join("\n            ")}
          </ul>
        </aside>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">${T("Mit tartalmaz", "What it includes")}</p>
          <h2>${T(s.featuresTitle, e.featuresTitle)}</h2>
        </header>
        <div class="cards">
          ${s.features
            .map(
              (f, i) => `<article class="glass card tilt reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>${T(f.t, ((e.features || [])[i] || {}).t || f.t)}</h3>
            <p>${T(f.d, ((e.features || [])[i] || {}).d || f.d)}</p>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">${T("Hogyan dolgozunk", "How we work")}</p>
          <h2>${T(s.processTitle, e.processTitle)}</h2>
        </header>
        <div class="steps">
          ${s.process
            .map(
              (st, i) => `<div class="glass step reveal${i ? ` d${i}` : ""}">
            <span class="step-num">0${i + 1}</span>
            <h3>${T(st.t, ((e.process || [])[i] || {}).t || st.t)}</h3>
            <p>${T(st.d, ((e.process || [])[i] || {}).d || st.d)}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">${T("Gyakori kérdések", "Frequently asked questions")}</p>
          <h2>${T("Amit ügyfeleink kérdezni szoktak", "What our clients tend to ask")}</h2>
        </header>
        <div class="faq">
          ${s.faq
            .map(
              (q, i) => `<details class="glass reveal">
            <summary>${T(q.q, ((e.faq || [])[i] || {}).q || q.q)}</summary>
            <p>${T(q.a, ((e.faq || [])[i] || {}).a || q.a)}</p>
          </details>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>
${othersStrip(s.slug)}`,
  });
};

/* ═══════════════════════════════════════════════════════════════
   TARTALMAK — eredeti, saját megfogalmazású szövegek
   ═══════════════════════════════════════════════════════════════ */

const CONTENT = [
  {
    slug: "orzes-vedelem",
    name: "Őrzés-védelem",
    metaDesc:
      "Élőerős őrzés-védelem és objektumvédelem Budapesten és országosan: telephelyőrzés, portaszolgálat, járőrszolgálat, recepciós biztonsági szolgálat — a Private Zone Security-től.",
    overline: "Őrzés-védelem",
    h1: "Őrzés-védelem, amely<br>észrevétlenül is <span class=\"gold-text\">jelen van</span>.",
    lead: "Élőerős objektum- és vagyonvédelem cégeknek és magánszemélyeknek, Budapesten és országosan. Képzett, hatósági engedéllyel rendelkező állomány — egyenruhában vagy öltönyben, ahogy a helyszín megkívánja.",
    intro: [
      "A vagyon elleni károk túlnyomó része megelőzhető — ha a megfelelő ember, a megfelelő időben, a megfelelő helyen áll. Az élőerős őrzés máig a leghatékonyabb visszatartó erő: a kamera rögzít, az őr <strong>megakadályoz</strong>.",
      "A Private Zone Security őrei nem csupán „ott vannak”: minden helyszínre egyedi őrutasítás készül, amely rögzíti a beléptetés, a kulcskezelés, a járőrútvonalak és a rendkívüli események protokollját. Munkatársaink rendszeres ellenőrzésen és továbbképzésen vesznek részt, szolgálatukat elektronikus járőrellenőrző rendszer dokumentálja.",
      "Vállalunk hosszú távú, állandó őrzést és ideiglenes megbízásokat is — például felújítás, költözés vagy üresen álló ingatlan idejére. Igény szerint az élőerőt technikai védelemmel (kamerarendszer, riasztó, távfelügyelet szervezése) kombináljuk.",
    ],
    facts: [
      "Hatósági engedéllyel és felelősségbiztosítással rendelkező állomány",
      "Egyenruhás vagy civil ruhás (öltönyös) megjelenés",
      "Elektronikus járőrellenőrzés, naplózott szolgálat",
      "24/7 diszpécser-háttér és riasztási protokoll",
      "Indulás akár 48 órán belül",
    ],
    featuresTitle: "Őrzési szolgáltatásaink",
    features: [
      { t: "Telephely- és irodaházőrzés", d: "Állandó vagy időszakos élőerős védelem ipari telephelyek, irodaházak és üzemek részére, teljes körű beléptetés-kezeléssel." },
      { t: "Porta- és recepciós szolgálat", d: "Reprezentatív, ügyfélbarát portaszolgálat: vendégkezelés, csomag- és kulcskezelés, parkolásirányítás — az első benyomás is hozzánk tartozik." },
      { t: "Járőrszolgálat", d: "Mobil járőreink előre nem kiszámítható időpontokban, dokumentáltan ellenőrzik ingatlanát — költséghatékony alternatíva az állandó őrzés helyett." },
      { t: "Magánbirtok és rezidencia védelme", d: "Családi házak, birtokok és nyaralók diszkrét őrzése, a család életritmusához igazodva, teljes titoktartással." },
      { t: "Építési területek őrzése", d: "Gépek, anyagok és eszközök védelme a kivitelezés teljes ideje alatt — éjszakai és hétvégi megerősített jelenléttel." },
      { t: "Üzlet- és áruházbiztonság", d: "Lopásmegelőzés, vagyonvédelmi jelenlét és konfliktuskezelés kereskedelmi egységekben, civil ruhás megfigyeléssel is." },
    ],
    processTitle: "Így épül fel az őrzés",
    process: [
      { t: "Helyszíni felmérés", d: "Díjmentesen felmérjük az ingatlan adottságait, kockázatait és a meglévő védelmi rendszereket." },
      { t: "Őrutasítás és terv", d: "Egyedi őrutasítást és szolgálati rendet készítünk — Ön pontosan látja, mit, mikor és hogyan védünk." },
      { t: "Szolgálat indítása", d: "A helyszínre betanított, ellenőrzött állomány áll munkába; az átállás zökkenőmentes." },
      { t: "Ellenőrzés és riport", d: "Rendszeres vezetői ellenőrzés, elektronikus járőrnapló és havi jelentés — a minőség nálunk mérhető." },
    ],
    faq: [
      { q: "Milyen gyorsan tudják elkezdeni az őrzést?", a: "Normál esetben a felméréstől számított 48–72 órán belül szolgálatba állunk; sürgős esetben — például betörés vagy káresemény után — ideiglenes őrzést akár aznap biztosítunk." },
      { q: "Egyenruhás vagy civil ruhás őrt érdemes választani?", a: "A látható, egyenruhás jelenlét elrettentő erejű, míg a civil ruhás (öltönyös) kolléga diszkréten simul a környezetbe — irodaházban, szállodában vagy rezidencián ez utóbbit javasoljuk. A felméréskor segítünk dönteni." },
      { q: "Vállalnak rövid, néhány napos megbízást is?", a: "Igen. Gyakran őrzünk ingatlant költözés, felújítás, hagyatéki eljárás vagy tulajdonosváltás idejére — akár egyetlen éjszakára is." },
      { q: "Mi történik riasztás vagy rendkívüli esemény esetén?", a: "Őreink rögzített protokoll szerint járnak el: intézkednek, értesítik diszpécserközpontunkat, szükség esetén a hatóságokat, Önt pedig azonnal tájékoztatjuk. Minden eseményről írásos jelentés készül." },
    ],
  },
  {
    slug: "szemelyvedelem",
    name: "Személyvédelem",
    metaDesc:
      "VIP testőrszolgálat és személyvédelem: kísérés, rezidenciavédelem, utazásbiztosítás, családvédelem — diszkrét, képzett testőrökkel a Private Zone Security-től.",
    overline: "Személyvédelem",
    h1: "Testőrszolgálat, amely<br>nem kelt <span class=\"gold-text\">feltűnést</span>.",
    lead: "Személyi védelem üzletembereknek, közszereplőknek és családoknak. Testőreink rendvédelmi és katonai múlttal, protokoll-ismerettel és teljes diszkrécióval dolgoznak — jelenlétük biztonságot ad, nem látványosságot.",
    intro: [
      "A jó személyvédelem paradoxona, hogy akkor működik igazán, ha soha nem derül ki, mennyire volt rá szükség. Testőreink feladata nem a demonstráció, hanem a <strong>megelőzés</strong>: az útvonalak, helyszínek és helyzetek előzetes elemzésével a kockázatok többségét már azelőtt kizárjuk, hogy Ön elindulna otthonról.",
      "Minden megbízás egyéni fenyegetettség-értékeléssel indul. Ez alapján javaslunk védelmi szintet: az alkalmankénti kíséréstől a 24 órás, váltásos testőrszolgálatig. Munkatársaink öltönyben, a környezetbe illeszkedve dolgoznak, protokoll- és etikett-ismeretük révén tárgyalásokon, gálákon és magánprogramokon egyaránt megállják a helyüket.",
      "Kérésre védett gépjárművel és biztonsági sofőrrel egészítjük ki a szolgáltatást, külföldi utazás esetén pedig a teljes út biztosítását megszervezzük — a repülőtéri transzfertől a szálloda ellenőrzéséig.",
    ],
    facts: [
      "Rendvédelmi és katonai múltú, vizsgázott testőrök",
      "Előzetes útvonal- és helyszínfelderítés",
      "Alkalmi kísérés vagy 24/7 váltásos szolgálat",
      "Biztonsági sofőr- és gépjármű-szolgáltatás",
      "Teljes titoktartás, írásos garanciával",
    ],
    featuresTitle: "Személyvédelmi szolgáltatásaink",
    features: [
      { t: "Személyi kísérés", d: "Diszkrét testőri jelenlét üzleti tárgyalásokon, rendezvényeken és magánprogramokon — egy vagy több fős kísérettel." },
      { t: "24 órás védelem", d: "Folyamatos, váltásos testőrszolgálat tartós fenyegetettség esetén, éjjel-nappali rezidencia-jelenléttel." },
      { t: "Családvédelem", d: "Házastárs és gyermekek védelme: iskolai kísérés, programok biztosítása — megnyugtató háttér a mindennapokhoz." },
      { t: "Utazásbiztosítás", d: "Bel- és külföldi utak teljes körű biztosítása: útvonaltervezés, előfutár-feladatok, szállás-ellenőrzés, helyi kíséret szervezése." },
      { t: "Biztonsági sofőrszolgálat", d: "Védelmi vezetéstechnikai képzettségű sofőrök, akik a volán mögött is testőrként gondolkodnak." },
      { t: "Fenyegetettség-értékelés", d: "Kockázatelemzés zaklatás, fenyegetés vagy vitás üzleti helyzet esetén — írásos javaslattal a szükséges védelmi szintre." },
    ],
    processTitle: "Így épül fel a védelem",
    process: [
      { t: "Bizalmas konzultáció", d: "Megismerjük élethelyzetét, napirendjét és a konkrét aggodalmakat — szigorú titoktartás mellett." },
      { t: "Fenyegetettség-értékelés", d: "Elemezzük a kockázatokat, útvonalakat és helyszíneket; írásos védelmi javaslatot készítünk." },
      { t: "Csapat kiválasztása", d: "A feladathoz és az Ön személyiségéhez illő testőrt vagy csapatot jelölünk ki — a bizalom nálunk szempont." },
      { t: "Szolgálat és finomhangolás", d: "A védelem az Ön életritmusához igazodik; a tapasztalatok alapján folyamatosan finomítjuk a protokollt." },
    ],
    faq: [
      { q: "Mennyire lesz feltűnő a testőr jelenléte?", a: "Amennyire Ön szeretné. Alapesetben munkatársaink öltönyben, kísérőként jelennek meg — a külső szemlélő kollégának vagy asszisztensnek látja őket. Kifejezett kérésre látható, elrettentő jelenlétet is biztosítunk." },
      { q: "Egy alkalomra is kérhető testőr?", a: "Igen. Gyakori megbízás az egyszeri kísérés: nagy értékű tranzakció, bírósági tárgyalás, konfliktusos üzleti találkozó vagy rendezvény idejére." },
      { q: "Külföldre is tudnak kísérni?", a: "Igen, testőreink útlevéllel, nyelvtudással és nemzetközi tapasztalattal rendelkeznek. A célországtól függően helyi partnerhálózatunkat is bevonjuk." },
      { q: "Hogyan biztosítják a diszkréciót?", a: "Minden munkatársunk szerződésben vállalt titoktartási kötelezettség alatt áll, amely a megbízás után is korlátlan ideig fennmarad. Az Ön adatait, napirendjét és a megbízás tényét harmadik fél nem ismerheti meg." },
    ],
  },
  {
    slug: "rendezvenybiztositas",
    name: "Rendezvénybiztosítás",
    metaDesc:
      "Rendezvénybiztosítás elegáns kivitelben: gálák, esküvők, céges események, koncertek biztosítása — beléptetés, tömegirányítás, VIP-védelem a Private Zone Security-től.",
    overline: "Rendezvénybiztosítás",
    h1: "Az Ön rendezvényén a biztonság<br>a <span class=\"gold-text\">vendégélmény</span> része.",
    lead: "Gálák, esküvők, céges események, koncertek és zártkörű összejövetelek teljes körű biztosítása. Csapatunk elegáns megjelenéssel, határozott háttérmunkával garantálja, hogy az est főszereplője az esemény maradjon.",
    intro: [
      "Egy jól biztosított rendezvényen a vendég semmit sem érzékel a biztonsági munkából — csak azt, hogy minden gördülékeny: a beléptetés gyors, a hívatlan látogatók kint maradnak, a konfliktusok pedig azelőtt oldódnak meg, hogy bárki észrevenné őket.",
      "A Private Zone Security rendezvénybiztosítási csapata a helyszínbejárástól az utolsó vendég távozásáig kézben tartja az esemény biztonságát. Elkészítjük a <strong>biztonsági és kiürítési tervet</strong>, egyeztetünk a helyszín üzemeltetőjével, szükség esetén a hatóságokkal és a mentőszolgálattal, kollégáink pedig az esemény jellegéhez öltöznek: gálán szmokingban, fesztiválon jól látható szolgálati öltözetben.",
      "Kiemelt vendégek érkezése esetén a rendezvénybiztosítást személyvédelemmel kombináljuk: a VIP-vendég a parkolótól a színpadig zárt biztonsági láncban mozog.",
    ],
    facts: [
      "Biztonsági és kiürítési terv minden eseményhez",
      "Elegáns, az eseményhez illő megjelenés",
      "Beléptetés, jegy- és meghívókezelés",
      "VIP-vendégek kísérése, backstage-védelem",
      "Együttműködés hatóságokkal és mentőszolgálattal",
    ],
    featuresTitle: "Rendezvénybiztosítási szolgáltatásaink",
    features: [
      { t: "Zártkörű és VIP események", d: "Gálák, díjátadók, magánrendezvények és esküvők diszkrét biztosítása — vendéglistakezeléssel és protokoll-ismerettel." },
      { t: "Céges rendezvények", d: "Konferenciák, termékbemutatók és csapatépítők biztosítása, a cég arculatához illeszkedő megjelenéssel." },
      { t: "Koncertek és fesztiválok", d: "Nagy létszámú események tömegirányítása, színpad- és backstage-védelem, jegyellenőrzés, kordonszolgálat." },
      { t: "Beléptetés és szűrés", d: "Gyors, udvarias, mégis alapos beléptetés: meghívó-ellenőrzés, csomagátvizsgálás, fémkereső kapuk és kézi detektorok." },
      { t: "Sportesemények", d: "Mérkőzések és sportgálák biztosítása szektorfelügyelettel, szurkolói konfliktusok megelőzésével." },
      { t: "Parkolás és forgalomirányítás", d: "A rendezvényhez tartozó parkolók, VIP-beállók és érkeztetési pontok irányítása — az élmény már a kapunál kezdődik." },
    ],
    processTitle: "Így biztosítunk egy rendezvényt",
    process: [
      { t: "Helyszínbejárás", d: "Felmérjük a helyszín adottságait, be- és kijáratait, kockázati pontjait — még az ajánlat előtt." },
      { t: "Biztonsági terv", d: "Létszám, pozíciók, kommunikáció, kiürítési útvonalak: minden forgatókönyvre írásos terv készül." },
      { t: "Esemény napja", d: "Csapatunk a vendégek előtt érkezik és utánuk távozik; rádiós kapcsolatban, vezető irányításával dolgozik." },
      { t: "Zárás és értékelés", d: "Az eseményt írásos összefoglalóval zárjuk; visszatérő rendezvényeknél a tapasztalatokat beépítjük." },
    ],
    faq: [
      { q: "Hány biztonsági munkatársra van szükség a rendezvényemen?", a: "A létszám a vendégszámtól, a helyszíntől és az esemény jellegétől függ — egy 150 fős esküvő és egy 150 fős céges parti sem egyforma. A helyszínbejárás után pontos létszám- és pozíciójavaslatot adunk." },
      { q: "Milyen öltözetben jelennek meg a kollégák?", a: "Az eseményhez illően: gálán öltönyben vagy szmokingban, kitűző nélkül is felismerhetően a szervezők számára; fesztiválon, sporteseményen jól látható szolgálati öltözetben." },
      { q: "Alkoholt fogyasztó, konfliktusos vendéggel mi történik?", a: "Kollégáink konfliktuskezelési képzést kaptak: a cél mindig a csendes, feltűnésmentes megoldás — a vendég udvarias leválasztása, szükség esetén hazajutásának megszervezése. Az erő alkalmazása mindig a legutolsó, jogszerű eszköz." },
      { q: "Mennyivel előbb kell megrendelni a biztosítást?", a: "Ideálisan 2–3 héttel az esemény előtt, hogy legyen idő a bejárásra és a tervezésre. Kisebb, zártkörű eseményt rövidebb határidővel is vállalunk — hívjon minket bizalommal." },
    ],
  },
  {
    slug: "koveteleskezeles",
    name: "Követeléskezelés",
    metaDesc:
      "Jogszerű és diszkrét követeléskezelés cégeknek és magánszemélyeknek: peren kívüli egyeztetés, helyszíni kapcsolatfelvétel, részletfizetési megállapodás, jogi előkészítés — Private Zone Security.",
    overline: "Követeléskezelés",
    h1: "Lejárt követelés?<br>Van <span class=\"gold-text\">elegáns</span> megoldás.",
    lead: "Kintlévőségek diszkrét és jogszerű kezelése cégeknek és magánszemélyeknek — a fizetési felszólítástól a peren kívüli megállapodáson át a jogi eljárás előkészítéséig. Eredményt hozunk, botrány nélkül.",
    intro: [
      "Egy kifizetetlen számla nemcsak pénzügyi veszteség: idő, energia és sokszor évekig húzódó bosszúság. Tapasztalatunk szerint a követelések jelentős része <strong>peren kívül, megállapodással</strong> rendezhető — ha az adós szakszerű, határozott és következetes megkereséssel találkozik.",
      "A Private Zone Security követeléskezelési csapata pontosan ezt nyújtja: felvesszük a kapcsolatot az adóssal, feltárjuk a valós fizetőképességét, és a jog adta keretek között képviseljük az Ön érdekeit — írásban, telefonon és személyes, helyszíni egyeztetés formájában is. Ha megállapodás születik, annak betartását végigkísérjük; ha nem, ügyvédi partnereinkkel előkészítjük a fizetési meghagyást vagy a peres eljárást.",
      "Fontos: nem vagyunk „behajtók”. Nem fenyegetünk, nem zaklatunk és nem alkalmazunk nyomásgyakorlást a jogszabályi kereteken túl — épp ez a hatékonyságunk titka. Az adós számára is korrekt, dokumentált folyamat a bíróság előtt is megállja a helyét.",
    ],
    facts: [
      "Sikerdíjas konstrukció is elérhető",
      "Peren kívüli megállapodásra törekszünk",
      "Helyszíni, személyes kapcsolatfelvétel",
      "Részletfizetési megállapodások kidolgozása és követése",
      "Ügyvédi partnerhálózat a jogi szakaszhoz",
    ],
    featuresTitle: "Követeléskezelési szolgáltatásaink",
    features: [
      { t: "Fizetési felszólítás", d: "Szakszerűen megfogalmazott, jogilag megalapozott írásos felszólítások — már ez a lépés is gyakran eredményt hoz." },
      { t: "Helyszíni kapcsolatfelvétel", d: "Munkatársaink személyesen keresik fel az adóst — kulturáltan, dokumentáltan, két tanúval. A személyes jelenlét a legerősebb érv." },
      { t: "Peren kívüli megállapodás", d: "Reális, betartható fizetési ütemezést dolgozunk ki, amely Önnek pénzt, mindkét félnek pert spórol." },
      { t: "Adós-átvilágítás", d: "Feltárjuk az adós tényleges vagyoni helyzetét és fizetőképességét — hogy tudja, mire számíthat, mielőtt költene az eljárásra." },
      { t: "Jogi eljárás előkészítése", d: "Ha az egyeztetés nem vezet eredményre, ügyvédi partnereinkkel előkészítjük a fizetési meghagyást, pert vagy felszámolási eljárást." },
      { t: "Folyamatos követés", d: "A megállapodás aláírása nem a folyamat vége: a teljesítést végigkövetjük, csúszás esetén azonnal lépünk." },
    ],
    processTitle: "Így kezeljük a követelését",
    process: [
      { t: "Ingyenes előminősítés", d: "Átnézzük a követelés dokumentumait és megmondjuk őszintén: mennyi az esély, és mennyi idő a realitás." },
      { t: "Stratégia", d: "Az adós helyzetéhez igazított ütemterv: felszólítás, személyes egyeztetés, megállapodás — lépésről lépésre." },
      { t: "Aktív ügykezelés", d: "Kapcsolatfelvétel, tárgyalás, dokumentálás. Önt minden lépésről tájékoztatjuk, döntés nélkül nem lépünk." },
      { t: "Rendezés", d: "Megállapodás és teljesítés-követés — vagy a jogi szakasz átadása ügyvédi partnereinknek, kész iratanyaggal." },
    ],
    faq: [
      { q: "Milyen díjazással dolgoznak?", a: "Az ügy jellegétől függően fix díjas vagy sikerdíjas konstrukciót kínálunk — utóbbinál csak a ténylegesen behajtott összeg után számítunk fel jutalékot. Az előminősítés minden esetben díjmentes." },
      { q: "Régi, több éves követeléssel is foglalkoznak?", a: "Igen, de fontos tudni, hogy a követelések általános elévülési ideje 5 év, amelyet bizonyos jogi lépések megszakíthatnak. Az előminősítéskor ezt is megvizsgáljuk, és megmondjuk, érdemes-e belevágni." },
      { q: "Magánszemélyek tartozásával is foglalkoznak?", a: "Igen — kölcsön, bérleti díj, vállalkozói díj vagy akár károkozás összegét is kezeljük, ha a követelés dokumentumokkal alátámasztható." },
      { q: "Jogszerű, amit csinálnak?", a: "Teljes mértékben. Nem alkalmazunk fenyegetést, zaklatást vagy megtévesztést; minden lépésünk dokumentált és a hatályos jogszabályoknak megfelelő. Ez nemcsak elvi kérdés: csak a jogszerűen felépített ügy vihető sikerre a bíróságon is." },
    ],
  },
  {
    slug: "magannyomozas",
    name: "Magánnyomozás",
    metaDesc:
      "Engedéllyel rendelkező magánnyomozás: háttérellenőrzés, bizonyítékgyűjtés, céges visszaélések feltárása, eltűnt személyek felkutatása — diszkréten, jogszerűen. Private Zone Security.",
    overline: "Magánnyomozás",
    h1: "A bizonyosság többet ér<br>a <span class=\"gold-text\">gyanúnál</span>.",
    lead: "Engedéllyel rendelkező magánnyomozóink információt és bizonyítékot gyűjtenek — kizárólag törvényes eszközökkel, bíróság előtt is felhasználható formában. Diszkréten, gyorsan, ítélkezés nélkül.",
    intro: [
      "Vannak helyzetek, amikor a döntéshez tények kellenek: egy üzleti partner megbízhatósága, egy munkavállaló lojalitása, egy magánéleti gyanú vagy egy eltűnt hozzátartozó holléte. A találgatás rossz tanácsadó — a <strong>dokumentált tény</strong> viszont dönt, akár tárgyalóasztalnál, akár bíróságon.",
      "A Private Zone Security magánnyomozói a személy- és vagyonvédelmi, valamint a magánnyomozói tevékenységről szóló törvény szerinti engedéllyel dolgoznak. Ez a garancia arra, hogy az összegyűjtött információ jogszerűen keletkezik — és arra is, hogy az Ön megbízása titokban marad.",
      "Minden ügy bizalmas konzultációval indul, ahol őszintén megmondjuk: mit lehet jogszerűen kideríteni, mennyi idő alatt és milyen költséggel. Nem vállalunk olyan megbízást, amely törvénybe ütközne — ez az Ön védelme is.",
    ],
    facts: [
      "Hatósági engedéllyel rendelkező magánnyomozók",
      "Bíróságon felhasználható, dokumentált bizonyítékok",
      "Írásos zárójelentés fotó- és videómelléklettel",
      "Teljes titoktartás — a megbízás ténye is védett",
      "Ingyenes, bizalmas első konzultáció",
    ],
    featuresTitle: "Nyomozati szolgáltatásaink",
    features: [
      { t: "Háttérellenőrzés", d: "Üzleti partner, befektető, leendő munkavállaló vagy bérlő ellenőrzése: cégháttér, kapcsolatrendszer, adósságok, reputáció." },
      { t: "Magánéleti megfigyelés", d: "Hűtlenség gyanúja, válóperes bizonyítékgyűjtés, gyermekelhelyezési ügyek — tapintattal és ítélkezés nélkül." },
      { t: "Céges visszaélések feltárása", d: "Belső lopás, adatszivárgás, versenytárshoz átjátszott információ, betegállomány-visszaélés — a bizonyítás a mi dolgunk." },
      { t: "Eltűnt személyek felkutatása", d: "Kapcsolatot vesztett hozzátartozók, régi ismerősök, örökösök és tartozásuk elől elköltözött adósok felkutatása." },
      { t: "Bizonyítékgyűjtés eljáráshoz", d: "Polgári perhez vagy feljelentéshez szükséges tényfeltárás, tanúkutatás, dokumentálás — ügyvédjével együttműködve." },
      { t: "Vagyonfelmérés", d: "Végrehajtás vagy követelés előtt felmérjük az adós tényleges, fellelhető vagyonát — hogy ne költsön eljárásra feleslegesen." },
    ],
    processTitle: "Így zajlik egy nyomozás",
    process: [
      { t: "Bizalmas konzultáció", d: "Meghallgatjuk az ügyet, és megmondjuk, mi deríthető ki jogszerűen — díjmentesen, kötelezettség nélkül." },
      { t: "Megbízási terv", d: "Rögzítjük a célt, az eszközöket, az időkeretet és a költséget. Nincsenek rejtett tételek." },
      { t: "Információgyűjtés", d: "Megfigyelés, adatgyűjtés, környezettanulmány — folyamatos, egyeztetett időközönkénti tájékoztatással." },
      { t: "Zárójelentés", d: "Írásos, mellékletekkel dokumentált jelentést kap, amely jogi eljárásban is felhasználható." },
    ],
    faq: [
      { q: "Titokban marad, hogy nyomozót bíztam meg?", a: "Igen. A megbízás ténye, tartalma és eredménye is szigorú titoktartás alá esik — ez törvényi kötelezettségünk és szakmai alapelvünk is. Az érintett nem szerez tudomást a megfigyelésről." },
      { q: "Mit szabad egy magánnyomozónak, és mit nem?", a: "Nyomozóink megfigyelhetnek közterületen, gyűjthetnek nyilvános és jogszerűen hozzáférhető adatokat, készíthetnek fotót és videót a törvényi keretek között. Nem hallgathatnak le telefont, nem törhetnek fel fiókokat és nem hatolhatnak be magánlakásba — az ilyen „bizonyíték” jogellenes, és Önt is bajba sodorná." },
      { q: "Mennyibe kerül egy magánnyomozás?", a: "Az ár az ügy összetettségétől és a ráfordított időtől függ; óradíjas és fix csomagáras konstrukcióval is dolgozunk. Az első konzultáción pontos kalkulációt adunk — meglepetések nélkül." },
      { q: "Felhasználható a jelentés a bíróságon?", a: "Igen — épp ezért dolgozunk kizárólag jogszerű eszközökkel. A zárójelentés tényeket, időpontokat és dokumentált mellékleteket tartalmaz, ügyvédje polgári perben bizonyítékként hivatkozhat rá." },
    ],
  },
  {
    slug: "birtokvedelem",
    name: "Birtokvédelem",
    metaDesc:
      "Birtokvédelem és ingatlan-visszafoglalás jogszerűen: önkényes lakásfoglalók és jogcím nélküli bentlakók kezelése, zárcsere, utólagos őrzés — Private Zone Security.",
    overline: "Birtokvédelem",
    h1: "Az Ön ingatlana.<br>Az Ön <span class=\"gold-text\">birtoka</span>. Pont.",
    lead: "Önkényes beköltözők, jogcím nélküli bentlakók, birtokháborítás? Jogi képviselettel megtámogatva, higgadtan és határozottan állítjuk helyre az Ön birtokát — a felszólítástól a zárcseréig és az utólagos őrzésig.",
    intro: [
      "Kevés felkavaróbb élmény van, mint amikor a saját ingatlanába nem tud belépni — mert azt mások önkényesen elfoglalták, vagy egy lejárt jogviszony után egyszerűen nem hajlandók elhagyni. A rossz hír: az önbíráskodás Önt hozná jogilag támadható helyzetbe. A jó hír: <strong>a birtokvédelemnek kiforrott, jogszerű eszköztára van</strong> — és mi ezt az eszköztárat teljes egészében kezeljük.",
      "A Private Zone Security birtokvédelmi csapata ügyvédi partnereivel közösen méri fel a helyzetet: tisztázzuk a jogi státuszt, dokumentáljuk az állapotot, majd a jegyzői birtokvédelmi eljárás, a bírósági út vagy — friss, egy éven belüli birtokháborítás esetén — a jogos önhatalom keretei között járunk el. A helyszíni jelenlétet minden esetben képzett, higgadt munkatársak biztosítják, akiknek a feladata a konfliktus megelőzése, nem a gerjesztése.",
      "A birtok helyreállítása után sem hagyjuk magára: a zárcserét, az ingatlan műszaki zárását és az átmeneti őrzést is elvégezzük, hogy a helyzet ne ismétlődhessen meg.",
    ],
    facts: [
      "Ügyvédi partnerekkel, jogszerű keretek között",
      "Helyszíni jelenlét képzett, higgadt csapattal",
      "Jegyzői és bírósági eljárások támogatása",
      "Zárcsere, műszaki zárás, utólagos őrzés",
      "Teljes dokumentálás fotóval és jegyzőkönyvvel",
    ],
    featuresTitle: "Birtokvédelmi szolgáltatásaink",
    features: [
      { t: "Önkényes beköltözők kezelése", d: "Elfoglalt ingatlan visszavétele a jogszabályi keretek között — dokumentáltan, hatósági együttműködéssel." },
      { t: "Jogcím nélküli bentlakók", d: "Lejárt bérleti szerződés vagy megszűnt használati jog után bent maradt személyek jogszerű kiléptetésének végigvitele." },
      { t: "Birtokháborítás megszüntetése", d: "Zavaró, jogsértő magatartás — önkényes használat, területfoglalás, bejárás — megszüntetése és megelőzése." },
      { t: "Ingatlan-átvétel lebonyolítása", d: "Vitás átadás-átvételek biztosítása: jelenlét, állapotrögzítés, jegyzőkönyv — hogy utóbb ne legyen vita." },
      { t: "Zárcsere és műszaki zárás", d: "A visszavett ingatlan azonnali biztonságba helyezése: zárcsere, nyílászárók zárása, szükség esetén ideiglenes technikai védelem." },
      { t: "Utólagos őrzés", d: "Átmeneti élőerős őrzés vagy járőrszolgálat, amíg az ingatlan sorsa — eladás, kiadás, felújítás — rendeződik." },
    ],
    processTitle: "Így állítjuk helyre a birtokát",
    process: [
      { t: "Jogi helyzetfelmérés", d: "Ügyvédi partnereinkkel tisztázzuk a tulajdoni és birtokviszonyokat, és kiválasztjuk a leggyorsabb jogszerű utat." },
      { t: "Dokumentálás", d: "Fotókkal, tanúkkal, jegyzőkönyvvel rögzítjük a fennálló állapotot — ez később perdöntő lehet." },
      { t: "Eljárás és jelenlét", d: "Felszólítás, hatósági eljárás támogatása, helyszíni biztosítás — higgadtan, provokáció nélkül." },
      { t: "Biztonságba helyezés", d: "Zárcsere, műszaki zárás, igény szerint őrzés — hogy az ingatlan az Ön birtokában is maradjon." },
    ],
    faq: [
      { q: "Nem tehetem ki egyszerűen a hívatlan lakókat?", a: "Sajnos nem: az önbíráskodás — például a holmik kirakása vagy a zár lecserélése, amíg bent tartózkodnak — Önt teheti jogsértővé, akár büntetőjogi következménnyel. Éppen ezért kell a folyamatot jogi útra terelni, és ebben vagyunk gyorsak." },
      { q: "Mennyi idő alatt szerezhetem vissza az ingatlanomat?", a: "Ez a jogi helyzettől függ: friss, egy éven belüli birtokháborításnál a jegyzői birtokvédelmi eljárás viszonylag gyors lehet, elhúzódó eseteknél bírósági útra lehet szükség. Az első konzultáción reális időtávot mondunk — nem ígérgetünk." },
      { q: "Mi történik, ha a kiköltöztetés után visszatérnek?", a: "Erre készülünk: a birtok helyreállítása után azonnali zárcserét és műszaki zárást végzünk, igény szerint átmeneti őrzést vagy járőrszolgálatot adunk. Visszatérési kísérlet esetén dokumentálunk és azonnal intézkedünk." },
      { q: "A nem fizető bérlő ügye is birtokvédelem?", a: "Részben: a nem fizető, de szerződéssel rendelkező bérlő ügye elsősorban jogi út (felmondás, kiürítési per), amelyben ügyvédi partnereink járnak el — mi a folyamat biztonsági oldalát adjuk: állapotrögzítés, átadás-átvétel biztosítása, majd az ingatlan védelme." },
    ],
  },
];

/* ═══════════ ANGOL TÜKÖR-TARTALOM (a szolgáltatás-aloldalakhoz) ═══════════ */
const CONTENT_EN = {
  "orzes-vedelem": {
    name: "Guarding & property protection",
    overline: "Guarding & property protection",
    h1: "Guarding that is<br>present even <span class=\"gold-text\">unnoticed</span>.",
    lead: "Manned property and asset protection for companies and individuals, in Budapest and nationwide. Trained, officially licensed personnel — in uniform or in a suit, as the location requires.",
    intro: [
      "The vast majority of damage to property can be prevented — if the right person stands in the right place at the right time. Manned guarding remains the most effective deterrent: the camera records, the guard <strong>prevents</strong>.",
      "Private Zone Security's guards don't merely “stand there”: a bespoke guarding order is drawn up for every location, setting out the protocol for access control, key handling, patrol routes and extraordinary events. Our staff undergo regular checks and continuous training, and their service is documented by an electronic patrol-control system.",
      "We take on long-term, permanent guarding as well as temporary assignments — for example during renovation, relocation or while a property stands empty. On request we combine manned guarding with technical protection (camera systems, alarms, arranging remote monitoring).",
    ],
    facts: [
      "Personnel with official licence and liability insurance",
      "Uniformed or plain-clothes (suited) appearance",
      "Electronic patrol control, logged service",
      "24/7 dispatch support and alarm protocol",
      "Deployment within as little as 48 hours",
    ],
    featuresTitle: "Our guarding services",
    features: [
      { t: "Site and office-building guarding", d: "Permanent or periodic manned protection for industrial sites, office buildings and plants, with full access-control management." },
      { t: "Reception and front-desk service", d: "Representative, guest-friendly reception: visitor handling, parcel and key management, parking direction — the first impression is part of our job." },
      { t: "Patrol service", d: "Our mobile patrols check your property at unpredictable times and in a documented way — a cost-effective alternative to permanent guarding." },
      { t: "Private estate and residence protection", d: "Discreet guarding of family houses, estates and holiday homes, aligned to the family's rhythm of life, in full confidence." },
      { t: "Construction-site guarding", d: "Protection of machinery, materials and equipment throughout the build — with reinforced presence at night and on weekends." },
      { t: "Retail and store security", d: "Loss prevention, security presence and conflict handling in commercial units, including plain-clothes observation." },
    ],
    processTitle: "How guarding is set up",
    process: [
      { t: "On-site survey", d: "We assess the property's features, risks and existing protection systems free of charge." },
      { t: "Guarding order and plan", d: "We prepare a bespoke guarding order and service schedule — you see exactly what we protect, when and how." },
      { t: "Service launch", d: "Trained, vetted personnel briefed on the site start work; the transition is seamless." },
      { t: "Control and reporting", d: "Regular management checks, an electronic patrol log and a monthly report — with us, quality is measurable." },
    ],
    faq: [
      { q: "How quickly can you start guarding?", a: "Normally we go on duty within 48–72 hours of the survey; in urgent cases — for example after a break-in or incident — we can provide temporary guarding the same day." },
      { q: "Should I choose a uniformed or plain-clothes guard?", a: "A visible, uniformed presence has a deterrent effect, while a plain-clothes (suited) colleague blends discreetly into the environment — in an office building, hotel or residence we recommend the latter. We help you decide during the survey." },
      { q: "Do you take on short, few-day assignments?", a: "Yes. We often guard a property during a move, renovation, probate or change of ownership — even for a single night." },
      { q: "What happens in the event of an alarm or incident?", a: "Our guards act according to a set protocol: they intervene, notify our dispatch centre and, if needed, the authorities, and inform you immediately. A written report is produced on every event." },
    ],
  },
  "szemelyvedelem": {
    name: "Close protection",
    overline: "Close protection",
    h1: "Bodyguard service that<br>draws no <span class=\"gold-text\">attention</span>.",
    lead: "Personal protection for business people, public figures and families. Our bodyguards work with law-enforcement and military backgrounds, protocol expertise and full discretion — their presence provides security, not spectacle.",
    intro: [
      "The paradox of good close protection is that it truly works when it never becomes apparent how much it was needed. Our bodyguards' task is not demonstration but <strong>prevention</strong>: by analysing routes, locations and situations in advance, we rule out most risks before you even leave home.",
      "Every assignment begins with an individual threat assessment. Based on it we recommend a protection level: from occasional escorting to a 24-hour, shift-based bodyguard service. Our staff work in suits, blending into the environment, and thanks to their protocol and etiquette knowledge they hold their own at negotiations, galas and private events alike.",
      "On request we add an armoured vehicle and a security driver, and for travel abroad we organise protection for the entire trip — from the airport transfer to checking the hotel.",
    ],
    facts: [
      "Vetted bodyguards with law-enforcement and military backgrounds",
      "Advance route and location reconnaissance",
      "Occasional escort or 24/7 shift service",
      "Security-driver and vehicle service",
      "Full confidentiality, with a written guarantee",
    ],
    featuresTitle: "Our close-protection services",
    features: [
      { t: "Personal escort", d: "Discreet bodyguard presence at business meetings, events and private programmes — with a one- or multi-person detail." },
      { t: "24-hour protection", d: "Continuous, shift-based bodyguard service in case of a sustained threat, with round-the-clock residence presence." },
      { t: "Family protection", d: "Protection of spouse and children: school escort, securing programmes — a reassuring background for everyday life." },
      { t: "Travel protection", d: "Full protection for domestic and international trips: route planning, advance-party tasks, accommodation checks, arranging local escort." },
      { t: "Security-driver service", d: "Drivers trained in protective driving techniques who think like bodyguards behind the wheel too." },
      { t: "Threat assessment", d: "Risk analysis in cases of harassment, threats or a contentious business situation — with a written recommendation on the required protection level." },
    ],
    processTitle: "How protection is built up",
    process: [
      { t: "Confidential consultation", d: "We get to know your situation, schedule and specific concerns — under strict confidentiality." },
      { t: "Threat assessment", d: "We analyse the risks, routes and locations and prepare a written protection proposal." },
      { t: "Selecting the team", d: "We assign a bodyguard or team suited to the task and to your personality — trust matters to us." },
      { t: "Service and fine-tuning", d: "Protection adapts to your rhythm of life; we continuously refine the protocol based on experience." },
    ],
    faq: [
      { q: "How noticeable will the bodyguard's presence be?", a: "As much as you wish. By default our staff appear in a suit, as companions — an outside observer sees them as a colleague or assistant. On explicit request we also provide a visible, deterrent presence." },
      { q: "Can a bodyguard be booked for a single occasion?", a: "Yes. One-off escorting is a common assignment: for a high-value transaction, a court hearing, a contentious business meeting or an event." },
      { q: "Can you escort abroad?", a: "Yes, our bodyguards have passports, language skills and international experience. Depending on the destination country, we also involve our local partner network." },
      { q: "How do you ensure discretion?", a: "Every member of our staff is under a contractual confidentiality obligation that remains in force indefinitely after the assignment. Your data, schedule and the fact of the assignment cannot become known to any third party." },
    ],
  },
  "rendezvenybiztositas": {
    name: "Event security",
    overline: "Event security",
    h1: "At your event, security is<br>part of the <span class=\"gold-text\">guest experience</span>.",
    lead: "Full security for galas, weddings, corporate events, concerts and private gatherings. With an elegant appearance and firm behind-the-scenes work, our team ensures the event itself remains the star of the evening.",
    intro: [
      "At a well-secured event the guest perceives nothing of the security work — only that everything runs smoothly: entry is quick, uninvited visitors stay out, and conflicts are resolved before anyone notices them.",
      "Private Zone Security's event team keeps the event's safety in hand from the site walk-through to the departure of the last guest. We prepare the <strong>security and evacuation plan</strong>, coordinate with the venue operator and, where needed, the authorities and ambulance service, and our staff dress to match the event: black tie at a gala, clearly visible service attire at a festival.",
      "When high-profile guests arrive, we combine event security with close protection: the VIP guest moves from the car park to the stage in a closed security chain.",
    ],
    facts: [
      "Security and evacuation plan for every event",
      "Elegant appearance suited to the event",
      "Access control, ticket and invitation handling",
      "Escorting VIP guests, backstage protection",
      "Cooperation with authorities and ambulance service",
    ],
    featuresTitle: "Our event-security services",
    features: [
      { t: "Private and VIP events", d: "Discreet security for galas, award ceremonies, private events and weddings — with guest-list management and protocol expertise." },
      { t: "Corporate events", d: "Security for conferences, product launches and team-building events, with an appearance that fits the company's image." },
      { t: "Concerts and festivals", d: "Crowd management for large-scale events, stage and backstage protection, ticket checks, barrier service." },
      { t: "Access control and screening", d: "Fast, courteous yet thorough entry: invitation checks, bag searches, metal-detector gates and hand-held detectors." },
      { t: "Sporting events", d: "Security for matches and sports galas with sector supervision and prevention of supporter conflicts." },
      { t: "Parking and traffic control", d: "Managing the event's car parks, VIP bays and arrival points — the experience begins at the gate." },
    ],
    processTitle: "How we secure an event",
    process: [
      { t: "Site walk-through", d: "We assess the venue's features, entrances and exits and risk points — before the quote." },
      { t: "Security plan", d: "Headcount, positions, communication, evacuation routes: a written plan for every scenario." },
      { t: "Event day", d: "Our team arrives before the guests and leaves after them; it works in radio contact under a leader's direction." },
      { t: "Wrap-up and review", d: "We close the event with a written summary; for recurring events we build the lessons learned into the next one." },
    ],
    faq: [
      { q: "How many security staff does my event need?", a: "The number depends on the guest count, the venue and the nature of the event — a 150-guest wedding and a 150-guest corporate party are not the same. After the site walk-through we give a precise headcount and position proposal." },
      { q: "What do the staff wear?", a: "To suit the event: at a gala in a suit or black tie, recognisable to the organisers even without a badge; at a festival or sporting event in clearly visible service attire." },
      { q: "What happens with an intoxicated, confrontational guest?", a: "Our staff are trained in conflict management: the goal is always a quiet, unobtrusive solution — politely separating the guest and, if needed, arranging their way home. The use of force is always the last, lawful resort." },
      { q: "How far in advance should security be booked?", a: "Ideally 2–3 weeks before the event, to allow time for the walk-through and planning. We also take on smaller, private events at shorter notice — call us with confidence." },
    ],
  },
  "koveteleskezeles": {
    name: "Debt collection",
    overline: "Debt collection",
    h1: "Overdue debt?<br>There is an <span class=\"gold-text\">elegant</span> solution.",
    lead: "Discreet and lawful handling of receivables for companies and individuals — from the payment notice through out-of-court settlement to preparing legal proceedings. We deliver results, without scandal.",
    intro: [
      "An unpaid invoice is not only a financial loss: it is time, energy and often years of aggravation. In our experience a significant share of receivables can be settled <strong>out of court, by agreement</strong> — if the debtor is met with a professional, firm and consistent approach.",
      "This is exactly what Private Zone Security's debt-collection team provides: we contact the debtor, establish their real ability to pay, and represent your interests within the bounds of the law — in writing, by phone and through personal, on-site discussion. If an agreement is reached, we see its performance through; if not, together with our legal partners we prepare the order for payment or the lawsuit.",
      "Importantly: we are not “enforcers”. We do not threaten, harass or apply pressure beyond the legal framework — that is precisely the secret of our effectiveness. A process that is fair and documented for the debtor too also holds up before a court.",
    ],
    facts: [
      "Success-fee arrangement also available",
      "We aim for an out-of-court settlement",
      "On-site, in-person contact",
      "Drafting and monitoring instalment agreements",
      "Legal partner network for the litigation stage",
    ],
    featuresTitle: "Our debt-collection services",
    features: [
      { t: "Payment notice", d: "Professionally worded, legally grounded written notices — even this step often brings results." },
      { t: "On-site contact", d: "Our staff visit the debtor in person — courteously, documented, with two witnesses. Personal presence is the strongest argument." },
      { t: "Out-of-court settlement", d: "We work out a realistic, sustainable payment schedule that saves you money and both parties a lawsuit." },
      { t: "Debtor due diligence", d: "We uncover the debtor's actual financial situation and ability to pay — so you know what to expect before spending on proceedings." },
      { t: "Preparing legal proceedings", d: "If negotiation fails, together with our legal partners we prepare the order for payment, lawsuit or liquidation proceedings." },
      { t: "Continuous follow-up", d: "Signing the agreement is not the end: we track performance and act immediately if there is a slip." },
    ],
    processTitle: "How we handle your receivable",
    process: [
      { t: "Free pre-assessment", d: "We review the documents of the claim and tell you honestly: what the chances are and what timeframe is realistic." },
      { t: "Strategy", d: "A schedule tailored to the debtor's situation: notice, personal discussion, agreement — step by step." },
      { t: "Active case handling", d: "Contact, negotiation, documentation. We keep you informed of every step and take no action without your decision." },
      { t: "Resolution", d: "Agreement and performance tracking — or handing the legal stage to our legal partners with a complete file." },
    ],
    faq: [
      { q: "What fee model do you work with?", a: "Depending on the nature of the case we offer a fixed-fee or success-fee arrangement — with the latter we charge commission only on the amount actually recovered. The pre-assessment is always free." },
      { q: "Do you handle old, multi-year receivables?", a: "Yes, but note that the general limitation period for claims is 5 years, which certain legal steps can interrupt. We examine this during the pre-assessment and tell you whether it is worth pursuing." },
      { q: "Do you handle debts of private individuals?", a: "Yes — a loan, rent, contractor's fee or even the amount of damage caused, if the claim can be supported by documents." },
      { q: "Is what you do lawful?", a: "Entirely. We use no threats, harassment or deception; every step is documented and compliant with the law in force. This is not just a matter of principle: only a lawfully built case can be carried to success before a court as well." },
    ],
  },
  "magannyomozas": {
    name: "Private investigation",
    overline: "Private investigation",
    h1: "Certainty is worth more<br>than <span class=\"gold-text\">suspicion</span>.",
    lead: "Our licensed private investigators gather information and evidence — solely by lawful means, in a form usable before a court. Discreetly, quickly, without judgement.",
    intro: [
      "There are situations where a decision requires facts: the reliability of a business partner, the loyalty of an employee, a private suspicion or the whereabouts of a missing relative. Guessing is a poor advisor — but a <strong>documented fact</strong> decides, whether at the negotiating table or in court.",
      "Private Zone Security's investigators work under the licence required by the act on personal and property protection and private-investigation activity. This is the guarantee that the information gathered arises lawfully — and that your assignment stays confidential.",
      "Every case begins with a confidential consultation where we tell you honestly: what can lawfully be uncovered, in what time and at what cost. We do not take on any assignment that would breach the law — this protects you too.",
    ],
    facts: [
      "Officially licensed private investigators",
      "Documented evidence usable in court",
      "Written final report with photo and video annexes",
      "Full confidentiality — even the fact of the assignment is protected",
      "Free, confidential first consultation",
    ],
    featuresTitle: "Our investigation services",
    features: [
      { t: "Background checks", d: "Checking a business partner, investor, prospective employee or tenant: corporate background, network of connections, debts, reputation." },
      { t: "Private-life surveillance", d: "Suspicion of infidelity, evidence gathering for divorce, child-custody matters — with tact and without judgement." },
      { t: "Uncovering corporate abuse", d: "Internal theft, data leaks, information passed to competitors, sick-leave abuse — the proof is our job." },
      { t: "Locating missing persons", d: "Finding relatives who have lost contact, old acquaintances, heirs and debtors who have moved away from their debt." },
      { t: "Evidence gathering for proceedings", d: "Fact-finding, witness research and documentation needed for a civil suit or criminal complaint — in cooperation with your lawyer." },
      { t: "Asset assessment", d: "Before enforcement or a claim we assess the debtor's actual, traceable assets — so you don't spend on proceedings needlessly." },
    ],
    processTitle: "How an investigation proceeds",
    process: [
      { t: "Confidential consultation", d: "We listen to the case and tell you what can lawfully be uncovered — free of charge, without obligation." },
      { t: "Assignment plan", d: "We set out the goal, the means, the timeframe and the cost. There are no hidden items." },
      { t: "Information gathering", d: "Surveillance, data collection, environment study — with continuous updates at agreed intervals." },
      { t: "Final report", d: "You receive a written report documented with annexes that is usable in legal proceedings too." },
    ],
    faq: [
      { q: "Does it stay secret that I hired an investigator?", a: "Yes. The fact, content and result of the assignment are all under strict confidentiality — this is both our legal obligation and our professional principle. The person concerned does not learn of the surveillance." },
      { q: "What may a private investigator do, and what not?", a: "Our investigators may observe in public spaces, collect publicly and lawfully accessible data, and take photos and video within the legal limits. They may not tap phones, break into accounts or enter a private home — such “evidence” is unlawful and would land you in trouble too." },
      { q: "How much does a private investigation cost?", a: "The price depends on the complexity of the case and the time spent; we work with both hourly and fixed-package rates. At the first consultation we give a precise estimate — with no surprises." },
      { q: "Is the report usable in court?", a: "Yes — which is exactly why we work solely by lawful means. The final report contains facts, dates and documented annexes; your lawyer can rely on it as evidence in a civil suit." },
    ],
  },
  "birtokvedelem": {
    name: "Possession protection",
    overline: "Possession protection",
    h1: "Your property.<br>Your <span class=\"gold-text\">possession</span>. Full stop.",
    lead: "Squatters, occupants without title, disturbance of possession? Backed by legal representation, calmly and firmly, we restore your possession — from the notice to the lock change and follow-up guarding.",
    intro: [
      "Few experiences are more distressing than being unable to enter your own property — because others have occupied it arbitrarily, or after a lapsed legal relationship simply refuse to leave. The bad news: taking the law into your own hands would put you in a legally vulnerable position. The good news: <strong>possession protection has a well-established, lawful toolkit</strong> — and we manage that toolkit in full.",
      "Private Zone Security's possession-protection team assesses the situation together with its legal partners: we clarify the legal status, document the condition, and then act within the framework of the notarial possession-protection procedure, the court route or — in the case of a recent disturbance within one year — lawful self-help. On-site presence is always provided by trained, level-headed staff whose task is to prevent conflict, not to provoke it.",
      "We don't leave you alone after possession is restored either: we carry out the lock change, the technical closing of the property and interim guarding, so the situation cannot recur.",
    ],
    facts: [
      "With legal partners, within a lawful framework",
      "On-site presence with a trained, level-headed team",
      "Support for notarial and court procedures",
      "Lock change, technical closing, follow-up guarding",
      "Full documentation with photos and minutes",
    ],
    featuresTitle: "Our possession-protection services",
    features: [
      { t: "Handling squatters", d: "Recovering an occupied property within the legal framework — documented, with the cooperation of the authorities." },
      { t: "Occupants without title", d: "Seeing through the lawful removal of persons remaining after a lapsed lease or terminated right of use." },
      { t: "Ending disturbance of possession", d: "Ending and preventing disruptive, unlawful conduct — arbitrary use, occupation of land, trespass." },
      { t: "Managing property handover", d: "Securing contested handovers: presence, recording of condition, minutes — so there is no dispute afterwards." },
      { t: "Lock change and technical closing", d: "Immediately securing the recovered property: lock change, closing of openings and, if needed, temporary technical protection." },
      { t: "Follow-up guarding", d: "Interim manned guarding or patrol service until the property's fate — sale, letting, renovation — is settled." },
    ],
    processTitle: "How we restore your possession",
    process: [
      { t: "Legal situation assessment", d: "Together with our legal partners we clarify the ownership and possession relations and choose the fastest lawful route." },
      { t: "Documentation", d: "We record the existing condition with photos, witnesses and minutes — this can be decisive later." },
      { t: "Procedure and presence", d: "Notice, support for the official procedure, on-site security — calmly, without provocation." },
      { t: "Securing", d: "Lock change, technical closing and, on request, guarding — so the property stays in your possession too." },
    ],
    faq: [
      { q: "Can't I simply throw the uninvited occupants out?", a: "Unfortunately not: taking the law into your own hands — for example putting belongings out or changing the lock while they are inside — can make you the offender, even with criminal consequences. That is exactly why the process must be taken down the legal route, and we are fast at that." },
      { q: "How long will it take to get my property back?", a: "It depends on the legal situation: for a recent disturbance within one year the notarial possession-protection procedure can be relatively fast, while protracted cases may require the court route. At the first consultation we give a realistic timeframe — we don't make empty promises." },
      { q: "What happens if they return after being removed?", a: "We prepare for this: after possession is restored we carry out an immediate lock change and technical closing and, on request, provide interim guarding or patrol service. In the event of a return attempt we document it and act immediately." },
      { q: "Is a non-paying tenant's case also possession protection?", a: "Partly: the case of a non-paying tenant who has a contract is primarily a legal route (termination, eviction suit) handled by our legal partners — we provide the security side of the process: recording of condition, securing the handover, then protecting the property." },
    ],
  },
};

/* ═══════════ RÓLUNK ═══════════ */
const rolunk = page({
  title: "Rólunk",
  titleEn: "About us",
  desc: "A Private Zone Security csapata rendvédelmi és katonai múlttal rendelkező, hatósági engedéllyel bíró biztonsági szakemberekből áll. Ismerje meg értékeinket és működésünket.",
  active: "rolunk",
  body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([[T("Főoldal", "Home"), "index.html"], [T("Rólunk", "About us")]])}
        <p class="overline reveal" data-i18n="about.overline">Miért mi</p>
        <h1 class="reveal d1">${T('Elegancia kívül,<br><span class="gold-text">acél fegyelem</span> belül.', 'Elegance outside,<br><span class="gold-text">steel discipline</span> within.')}</h1>
        <p class="lead reveal d2">${T("A Private Zone Security prémium személy- és vagyonvédelmi szolgáltató. Abban hiszünk, hogy a valódi biztonság nem hivalkodó: csendben, pontosan és következetesen működik — mint egy jól szabott öltöny.", "Private Zone Security is a premium personal and property protection provider. We believe that true security is never showy: it works quietly, precisely and consistently — like a well-tailored suit.")}</p>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container intro-grid">
        <div class="intro-copy reveal">
          <p>${T("Csapatunkat <strong>rendvédelmi és katonai múlttal rendelkező szakemberek</strong> alkotják, akik a hivatásos szolgálatban tanulták meg, mit jelent a fegyelem, a protokoll és a felelősség — és a magánszférában tanulták meg mindezt diszkrécióval, tapintattal és ügyfélközpontúsággal párosítani.", "Our team is made up of <strong>professionals with law-enforcement and military backgrounds</strong>, who learned in professional service what discipline, protocol and responsibility mean — and learned in the private sector to pair all of this with discretion, tact and a client-first approach.")}</p>
          <p>${T("Nem tömegszolgáltatást nyújtunk. Ügyfeleink száma szándékosan korlátozott: minden megbízáshoz dedikált kapcsolattartót rendelünk, és a vezetőink személyesen ismernek minden futó ügyet. Ez az, amit egy nagy létszámú őrző-védő cég nem tud megadni — és amiért ügyfeleink hosszú évek óta visszatérnek.", "We do not provide a mass service. The number of our clients is deliberately limited: we assign a dedicated contact to every engagement, and our managers personally know every active case. This is what a large-headcount guarding company cannot offer — and why our clients have returned for many years.")}</p>
          <p>${T("Működésünk minden eleme <strong>jogszerű és dokumentált</strong>: munkatársaink a személy- és vagyonvédelmi tevékenységről szóló törvény szerinti hatósági engedéllyel és igazolvánnyal rendelkeznek, tevékenységünket felelősségbiztosítás fedezi, megbízásainkat pedig titoktartási megállapodás védi.", "Every element of our operation is <strong>lawful and documented</strong>: our staff hold the official licence and ID required by the act on personal and property protection, our activity is covered by liability insurance, and our engagements are protected by a confidentiality agreement.")}</p>
        </div>
        <aside class="glass facts reveal d1">
          <h3>${T("Számokban", "In numbers")}</h3>
          <ul>
            <li>${T("15+ év szakmai tapasztalat a csapat vezetésében", "15+ years of professional experience in the team's leadership")}</li>
            <li>${T("500+ biztosított rendezvény", "500+ events secured")}</li>
            <li>${T("98% visszatérő ügyfél", "98% returning clients")}</li>
            <li>${T("24/7 diszpécser-elérhetőség", "24/7 dispatch availability")}</li>
            <li>${T("Budapest központtal, országos lefedettséggel", "Based in Budapest, with nationwide coverage")}</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">${T("Értékeink", "Our values")}</p>
          <h2>${T("Amiben nem ismerünk kompromisszumot", "Where we make no compromise")}</h2>
        </header>
        <div class="values-grid">
          <article class="glass card tilt reveal">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>${T("Diszkréció", "Discretion")}</h3>
            <p>${T("A megbízás ténye is titok. Ügyfeleink nevét nem használjuk referenciaként, adataikat nem adjuk ki, jelenlétünk pedig csak annyira látható, amennyire Ön szeretné.", "Even the fact of the engagement is confidential. We do not use our clients' names as references, we do not disclose their data, and our presence is only as visible as you wish.")}</p>
          </article>
          <article class="glass card tilt reveal d1">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>${T("Jogszerűség", "Lawfulness")}</h3>
            <p>${T("Egyetlen ügy sem ér annyit, hogy törvényt sértsünk érte — és Önnek sem érdeke. Minden eszközünk jogszerű, minden lépésünk dokumentált és számonkérhető.", "No case is worth breaking the law for — and it is not in your interest either. All our means are lawful, and every step is documented and accountable.")}</p>
          </article>
          <article class="glass card tilt reveal d2">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>${T("Következetesség", "Consistency")}</h3>
            <p>${T("Amit vállalunk, azt tartjuk: időben érkezünk, riportot adunk, visszahívjuk. A biztonság bizalmi műfaj — a bizalmat pedig apró, megbízható gesztusok építik.", "We keep what we promise: we arrive on time, we report, we call back. Security is a matter of trust — and trust is built by small, reliable gestures.")}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">${T("Működésünk", "How we operate")}</p>
          <h2>${T("Amire minden megbízásnál számíthat", "What you can count on in every engagement")}</h2>
        </header>
        <div class="steps">
          <div class="glass step reveal">
            <span class="step-num">✦</span>
            <h3>${T("Dedikált kapcsolattartó", "Dedicated contact")}</h3>
            <p>${T("Egyetlen embert kell ismernie, aki minden kérdésére válaszol — nem egy call centert.", "You only need to know one person who answers all your questions — not a call centre.")}</p>
          </div>
          <div class="glass step reveal d1">
            <span class="step-num">✦</span>
            <h3>${T("Írásos riportok", "Written reports")}</h3>
            <p>${T("Szolgálati napló, eseményjelentés, havi összefoglaló — a munkánk átlátható és visszakereshető.", "Service log, incident report, monthly summary — our work is transparent and traceable.")}</p>
          </div>
          <div class="glass step reveal d2">
            <span class="step-num">✦</span>
            <h3>${T("Ellenőrzött állomány", "Vetted personnel")}</h3>
            <p>${T("Munkatársainkat magunk válogatjuk, képezzük és ellenőrizzük — alvállalkozói láncok nélkül.", "We select, train and vet our staff ourselves — with no subcontractor chains.")}</p>
          </div>
          <div class="glass step reveal d3">
            <span class="step-num">✦</span>
            <h3>${T("Átlátható díjazás", "Transparent pricing")}</h3>
            <p>${T("Az ajánlatunkban minden tétel szerepel. Rejtett költség nálunk nincs — meglepetés sem.", "Our quote lists every item. With us there are no hidden costs — and no surprises.")}</p>
          </div>
        </div>
      </div>
    </section>
${othersStrip("")}`,
});

/* ═══════════ KAPCSOLAT ═══════════ */
const kapcsolat = page({
  title: "Kapcsolat",
  titleEn: "Contact",
  desc: "Lépjen kapcsolatba a Private Zone Security csapatával: telefon, e-mail és bizalmas üzenetküldés. 24/7 elérhetőség, 24 órán belüli visszajelzés.",
  active: "kapcsolat",
  body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([[T("Főoldal", "Home"), "index.html"], [T("Kapcsolat", "Contact")]])}
        <p class="overline reveal" data-i18n="contact.overline">Kapcsolat</p>
        <h1 class="reveal d1">${T("Kezdjük egy<br><span class=\"gold-text\">bizalmas</span> beszélgetéssel.", "Let’s start with a<br><span class=\"gold-text\">confidential</span> conversation.")}</h1>
        <p class="lead reveal d2">${T("Minden megkeresést szigorúan bizalmasan kezelünk. Hívjon minket a nap bármely órájában, vagy írjon — munkatársunk 24 órán belül jelentkezik.", "We treat every enquiry in strict confidence. Call us at any hour of the day, or write — a colleague will get back to you within 24 hours.")}</p>
      </div>
    </section>

    <section class="section contact" style="padding-top:2rem">
      <div class="container contact-grid">
        <div class="contact-info">
          <ul class="contact-list reveal">
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg></span>
              <div><strong data-i18n="contact.phone">Telefon</strong><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>
              <div><strong data-i18n="contact.email">E-mail</strong><a href="mailto:${EMAIL}">${EMAIL}</a></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
              <div><strong data-i18n="contact.office">Iroda</strong><span data-i18n-html="contact.office_addr">${ADDRESS_L1}<br>${ADDRESS_L2}</span></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span>
              <div><strong data-i18n="contact.avail_label">Elérhetőség</strong><span data-i18n="contact.avail">24/7 — az év minden napján</span></div>
            </li>
          </ul>

          <div class="glass facts reveal d1" style="margin-top:2rem;position:static">
            <h3>${T("Az első konzultáció", "The first consultation")}</h3>
            <ul>
              <li>${T("Díjmentes és kötelezettség nélküli", "Free of charge and without obligation")}</li>
              <li>${T("Személyesen, telefonon vagy videóhívásban", "In person, by phone or by video call")}</li>
              <li>${T("Titoktartás már az első szótól", "Confidentiality from the very first word")}</li>
              <li>${T("Őszinte válasz: ha nem mi vagyunk a megoldás, azt is megmondjuk", "An honest answer: if we are not the solution, we will say so too")}</li>
            </ul>
          </div>
        </div>

        <form class="glass contact-form reveal d2" id="contactForm" novalidate>
          <div class="form-row">
            <div class="field">
              <label for="fName" data-i18n="form.name">Név *</label>
              <input id="fName" name="name" type="text" required autocomplete="name" placeholder="Az Ön neve" data-i18n="form.name_ph" data-i18n-attr="placeholder">
            </div>
            <div class="field">
              <label for="fPhone" data-i18n="form.phone">Telefon</label>
              <input id="fPhone" name="phone" type="tel" autocomplete="tel" placeholder="+36 …">
            </div>
          </div>
          <div class="field">
            <label for="fEmail" data-i18n="form.email">E-mail *</label>
            <input id="fEmail" name="email" type="email" required autocomplete="email" placeholder="pelda@email.hu" data-i18n="form.email_ph" data-i18n-attr="placeholder">
          </div>
          <div class="field">
            <label for="fService" data-i18n="form.service">Szolgáltatás</label>
            <select id="fService" name="service">
              <option value="" data-i18n="form.choose">Válasszon…</option>
              ${SERVICES.map((s) => `<option data-i18n="${s.i18n}">${s.name}</option>`).join("\n              ")}
              <option data-i18n="form.other">Egyéb / összetett megbízás</option>
            </select>
          </div>
          <div class="field">
            <label for="fMsg" data-i18n="form.message">Üzenet *</label>
            <textarea id="fMsg" name="message" rows="4" required placeholder="Írja le röviden, miben segíthetünk…" data-i18n="form.message_ph" data-i18n-attr="placeholder"></textarea>
          </div>
          <p class="form-note" data-i18n="form.note">Üzenetét bizalmasan kezeljük, harmadik félnek nem adjuk ki.</p>
          <button type="submit" class="btn btn-gold btn-block" data-i18n="form.submit">Bizalmas üzenet küldése</button>
          <p class="form-status" id="formStatus" role="status"></p>
        </form>
      </div>
    </section>`,
});

/* ═══════════ JOGI OLDALAK (ÁSZF, Adatvédelem) ═══════════ */
const legalPage = ({ slug, title, titleEn, crumb, crumbEn, desc, updated, updatedEn, lead, leadEn, blocks }) =>
  page({
    title,
    titleEn: titleEn || title,
    desc,
    active: slug,
    noCta: true,
    body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([[T("Főoldal", "Home"), "index.html"], [T(crumb, crumbEn || crumb)]])}
        <p class="overline reveal">${T("Jogi tájékoztató", "Legal information")}</p>
        <h1 class="reveal d1">${T(title, titleEn || title)}</h1>
        <p class="lead reveal d2">${T(lead, leadEn || lead)}</p>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container">
        <article class="legal reveal">
          <p class="updated">${T("Hatályos / utolsó frissítés: " + updated, "Effective / last updated: " + (updatedEn || updated))}</p>
          ${blocks.join("\n          ")}
        </article>
      </div>
    </section>`,
  });

// Cégadat-blokk (a hiányzó jogi adatokat a Megrendelőnek kell kitöltenie)
// Teljes cégadat-doboz (Adatvédelemhez) — a GDPR-nál elvárt tételekkel,
// a még ismeretlen adatok kitöltendőként jelölve.
const TODO = T("[kitöltendő]", "[to be completed]");
const COMPANY_BOX = `<div class="legal-callout glass">
            <h3>${T("A Szolgáltató (Adatkezelő) adatai", "Details of the Provider (Data Controller)")}</h3>
            <ul>
              <li><strong>${T("Név:", "Name:")}</strong> Private Zone Security ${T("[cégnév pontosítandó]", "[company name to be confirmed]")}</li>
              <li><strong>${T("Székhely:", "Registered seat:")}</strong> <span data-i18n-html="${key(ADDRESS_L1 + ", " + ADDRESS_L2, "Panorama Office building, Ady Endre utca 19, 1024 Budapest")}">${ADDRESS_L1}, ${ADDRESS_L2}</span></li>
              <li><strong>${T("Cégjegyzékszám:", "Company registration number:")}</strong> ${TODO}</li>
              <li><strong>${T("Adószám:", "Tax number:")}</strong> ${TODO}</li>
              <li><strong>${T("Működési / SzVMSzK engedély száma:", "Operating / SzVMSzK licence number:")}</strong> ${TODO}</li>
              <li><strong>${T("Képviselő:", "Representative:")}</strong> ${TODO}</li>
              <li><strong>${T("Telefon:", "Phone:")}</strong> <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></li>
              <li><strong>${T("E-mail:", "Email:")}</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
            </ul>
          </div>`;

// Rövidített cégadat-doboz (ÁSZF-hez) — csak a ténylegesen ismert adatok.
const COMPANY_BOX_ASZF = `<div class="legal-callout glass">
            <h3>${T("A Szolgáltató adatai", "Details of the Provider")}</h3>
            <ul>
              <li><strong>${T("Név:", "Name:")}</strong> Private Zone Security</li>
              <li><strong>${T("Székhely:", "Registered seat:")}</strong> <span data-i18n-html="${key(ADDRESS_L1 + ", " + ADDRESS_L2, "Panorama Office building, Ady Endre utca 19, 1024 Budapest")}">${ADDRESS_L1}, ${ADDRESS_L2}</span></li>
              <li><strong>${T("Telefon:", "Phone:")}</strong> <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></li>
              <li><strong>${T("E-mail:", "Email:")}</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
            </ul>
          </div>`;

const LEGAL_DISCLAIMER = `<div class="legal-note">${T(
    "<strong>Megjegyzés:</strong> Ez a dokumentum sablon, amely a Private Zone Security szolgáltatásaihoz készült. A szögletes zárójelben [ … ] jelölt adatokat a tényleges cégadatokkal szükséges kitölteni, és a végleges szöveget javasolt jogi szakértővel véleményeztetni a hatályos jogszabályoknak való teljes megfelelés érdekében.",
    "<strong>Note:</strong> This document is a template prepared for Private Zone Security's services. The items marked in square brackets [ … ] need to be completed with the actual company details, and it is advisable to have the final text reviewed by a legal expert to ensure full compliance with the applicable law."
  )}
          </div>`;

const aszf = legalPage({
  slug: "aszf",
  title: "Általános Szerződési Feltételek",
  titleEn: "General Terms and Conditions",
  crumb: "ÁSZF",
  crumbEn: "Terms",
  desc: "A Private Zone Security személy- és vagyonvédelmi szolgáltatásaira vonatkozó Általános Szerződési Feltételek.",
  updated: "2026. július 1.",
  updatedEn: "1 July 2026",
  lead: "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Private Zone Security által nyújtott biztonsági szolgáltatások igénybevételének feltételeit szabályozzák.",
  leadEn: "These General Terms and Conditions (hereinafter: GTC) govern the conditions for using the security services provided by Private Zone Security.",
  blocks: [
    COMPANY_BOX_ASZF,
    `<h2>${T("1. Az ÁSZF hatálya", "1. Scope of the GTC")}</h2>
          <p>${T("Jelen ÁSZF a Szolgáltató és a szolgáltatásait igénybe vevő Megrendelő (a továbbiakban együtt: Felek) között létrejövő valamennyi szerződéses jogviszonyra irányadó, kivéve, ha a Felek egyedi szerződésben ettől eltérően állapodnak meg. Egyedi szerződés és az ÁSZF eltérése esetén az egyedi szerződés rendelkezései az irányadók.", "These GTC apply to every contractual relationship between the Provider and the Client using its services (hereinafter together: the Parties), unless the Parties agree otherwise in an individual contract. Where an individual contract and the GTC differ, the provisions of the individual contract prevail.")}</p>
          <p>${T("A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására; a módosítás a közzététel napjától hatályos, a már megkötött szerződéseket nem érinti hátrányosan.", "The Provider reserves the right to amend the GTC unilaterally; the amendment takes effect from the date of publication and does not adversely affect contracts already concluded.")}</p>`,
    `<h2>${T("2. A szolgáltatások köre", "2. Scope of services")}</h2>
          <p>${T("A Szolgáltató különösen az alábbi tevékenységeket végzi, a vonatkozó jogszabályi keretek között:", "The Provider carries out, in particular, the following activities within the applicable legal framework:")}</p>
          <ul>
            <li>${T("élőerős őrzés-védelem, objektum- és vagyonvédelem;", "manned guarding, property and asset protection;")}</li>
            <li>${T("személyvédelem;", "close protection;")}</li>
            <li>${T("rendezvénybiztosítás;", "event security;")}</li>
            <li>${T("követeléskezelés;", "debt collection;")}</li>
            <li>${T("magánnyomozás;", "private investigation;")}</li>
            <li>${T("birtokvédelemmel összefüggő biztonsági közreműködés.", "security assistance related to possession protection.")}</li>
          </ul>
          <p>${T("A Szolgáltató tevékenységét a személy- és vagyonvédelmi, valamint a magánnyomozói tevékenység szabályairól szóló hatályos jogszabályok (különösen a 2005. évi CXXXIII. törvény) szerint, engedéllyel és felelősségbiztosítással végzi.", "The Provider carries out its activity in accordance with the legislation in force on personal and property protection and private-investigation activity (in particular Act CXXXIII of 2005), with a licence and liability insurance.")}</p>`,
    `<h2>${T("3. A szerződés létrejötte", "3. Conclusion of the contract")}</h2>
          <p>${T("A szerződés a Felek egyező akaratnyilatkozatával, írásban jön létre. A Megrendelő ajánlatkérését követően a Szolgáltató egyedi árajánlatot ad; a szerződés az ajánlat elfogadásával és a szolgáltatási szerződés aláírásával jön létre.", "The contract is concluded in writing by the concurring declarations of the Parties. Following the Client's request for a quote, the Provider gives an individual quotation; the contract is concluded upon acceptance of the offer and signature of the service contract.")}</p>
          <p>${T("A megrendeléshez szükséges adatok valódiságáért a Megrendelő felel.", "The Client is responsible for the accuracy of the data required for the order.")}</p>`,
    `<h2>${T("4. Díjazás és fizetési feltételek", "4. Fees and payment terms")}</h2>
          <p>${T("A szolgáltatás díját az egyedi szerződés tartalmazza. Eltérő megállapodás hiányában a Szolgáltató a teljesítésről számlát állít ki, amelyet a Megrendelő a számlán feltüntetett fizetési határidőn belül köteles kiegyenlíteni.", "The fee for the service is set out in the individual contract. Unless otherwise agreed, the Provider issues an invoice for performance, which the Client must settle within the payment deadline indicated on the invoice.")}</p>
          <p>${T("Késedelmes fizetés esetén a Szolgáltató a Ptk. szerinti késedelmi kamatot és behajtási költségátalányt érvényesíthet.", "In the event of late payment, the Provider may charge default interest and a flat-rate recovery cost as provided by the Civil Code.")}</p>`,
    `<h2>${T("5. A Felek jogai és kötelezettségei", "5. Rights and obligations of the Parties")}</h2>
          <p>${T("A Szolgáltató a szolgáltatást a tőle elvárható gondossággal, szakszerűen, a vonatkozó jogszabályok betartásával nyújtja. A Megrendelő köteles a teljesítéshez szükséges információkat és feltételeket biztosítani, valamint a díjat határidőben megfizetni.", "The Provider delivers the service with due care, professionally, in compliance with the applicable law. The Client must provide the information and conditions necessary for performance and pay the fee on time.")}</p>`,
    `<h2>${T("6. Titoktartás", "6. Confidentiality")}</h2>
          <p>${T("A Szolgáltató a szerződés teljesítése során tudomására jutott minden információt bizalmasan kezel, azt harmadik félnek – jogszabályi kötelezettség hiányában – nem adja ki. A titoktartási kötelezettség a szerződés megszűnését követően is fennmarad.", "The Provider treats all information obtained during performance of the contract as confidential and does not disclose it to third parties, absent a legal obligation. The confidentiality obligation survives the termination of the contract.")}</p>`,
    `<h2>${T("7. Felelősség", "7. Liability")}</h2>
          <p>${T("A Szolgáltató felelősségére a Ptk. és az egyedi szerződés rendelkezései az irányadók. A Szolgáltató nem felel a Megrendelő által szolgáltatott hibás vagy hiányos adatokból, illetve a Megrendelő mulasztásából eredő károkért.", "The Provider's liability is governed by the Civil Code and the individual contract. The Provider is not liable for damage arising from incorrect or incomplete data supplied by the Client or from the Client's omission.")}</p>`,
    `<h2>${T("8. Panaszkezelés", "8. Complaint handling")}</h2>
          <p>${T("A Megrendelő az esetleges panaszát a Szolgáltató fenti elérhetőségein jelentheti be. A Szolgáltató a panaszt kivizsgálja, és a jogszabályban meghatározott határidőn belül írásban válaszol.", "The Client may submit any complaint via the Provider's contact details above. The Provider investigates the complaint and responds in writing within the deadline prescribed by law.")}</p>`,
    `<h2>${T("9. Vegyes és záró rendelkezések", "9. Miscellaneous and final provisions")}</h2>
          <p>${T("A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a Polgári Törvénykönyv rendelkezései az irányadók. A Felek a jogvitáikat elsősorban egyeztetés útján rendezik.", "Matters not regulated in these GTC are governed by Hungarian law, in particular the provisions of the Civil Code. The Parties resolve their disputes primarily by negotiation.")}</p>`,
  ],
});

const adatvedelem = legalPage({
  slug: "adatvedelem",
  title: "Adatvédelmi Nyilatkozat",
  titleEn: "Privacy Policy",
  crumb: "Adatvédelem",
  crumbEn: "Privacy",
  desc: "A Private Zone Security adatkezelési tájékoztatója a GDPR és a hatályos adatvédelmi jogszabályok szerint.",
  updated: "2026. július 1.",
  updatedEn: "1 July 2026",
  lead: "A Private Zone Security elkötelezett a személyes adatok védelme mellett. Jelen tájékoztató bemutatja, hogyan kezeljük az Ön adatait az EU 2016/679 (GDPR) rendelettel és a hatályos magyar jogszabályokkal összhangban.",
  leadEn: "Private Zone Security is committed to protecting personal data. This notice explains how we handle your data in accordance with EU Regulation 2016/679 (GDPR) and the applicable Hungarian law.",
  blocks: [
    LEGAL_DISCLAIMER,
    COMPANY_BOX,
    `<h2>${T("1. A kezelt adatok köre és célja", "1. Scope and purpose of the data processed")}</h2>
          <p>${T("A weboldalon a kapcsolatfelvételi űrlapon keresztül az alábbi adatokat kezeljük, kizárólag a megkeresés megválaszolása és az ajánlatadás céljából:", "Through the contact form on the website we process the following data, solely for the purpose of answering the enquiry and providing a quote:")}</p>
          <ul>
            <li>${T("<strong>név</strong> – a kapcsolatfelvételhez;", "<strong>name</strong> – for making contact;")}</li>
            <li>${T("<strong>e-mail cím</strong> – a válaszadáshoz;", "<strong>email address</strong> – for replying;")}</li>
            <li>${T("<strong>telefonszám</strong> (opcionális) – a kapcsolatfelvételhez;", "<strong>phone number</strong> (optional) – for making contact;")}</li>
            <li>${T("<strong>az üzenet tartalma</strong> – az igény megértéséhez.", "<strong>the content of the message</strong> – to understand the request.")}</li>
          </ul>
          <p>${T("A kapcsolati űrlap az adatokat nem tárolja szerveren: az elküldés az Ön levelezőprogramját nyitja meg egy előre kitöltött e-maillel, így az adatok e-mailben jutnak el hozzánk.", "The contact form does not store data on a server: sending opens your email client with a pre-filled message, so the data reaches us by email.")}</p>`,
    `<h2>${T("2. Az adatkezelés jogalapja", "2. Legal basis for processing")}</h2>
          <p>${T("Az adatkezelés jogalapja az érintett hozzájárulása (GDPR 6. cikk (1) a) pont), illetve a szerződés megkötését megelőző lépések megtétele az érintett kérésére (GDPR 6. cikk (1) b) pont). Szerződéskötés esetén az adatkezelést jogi kötelezettség teljesítése (pl. számviteli előírások) is megalapozhatja.", "The legal basis for processing is the consent of the data subject (GDPR Article 6(1)(a)) and taking steps at the data subject's request prior to entering into a contract (GDPR Article 6(1)(b)). In the case of a contract, processing may also be based on compliance with a legal obligation (e.g. accounting requirements).")}</p>`,
    `<h2>${T("3. Az adatkezelés időtartama", "3. Duration of processing")}</h2>
          <p>${T("A megkeresés kapcsán megadott adatokat a cél eléréséhez szükséges ideig, legfeljebb a kapcsolatfelvételt követő ésszerű ideig kezeljük, ezt követően töröljük. Szerződéses jogviszony esetén a jogszabályban előírt megőrzési idő (pl. számviteli bizonylatok esetén 8 év) az irányadó.", "We process the data provided with an enquiry for as long as necessary to achieve the purpose, at most for a reasonable period after contact, after which we delete it. In the case of a contractual relationship, the retention period prescribed by law (e.g. 8 years for accounting documents) applies.")}</p>`,
    `<h2>${T("4. Sütik (cookies) és tárolás", "4. Cookies and storage")}</h2>
          <p>${T("A weboldal nem használ nyomkövető vagy marketing sütiket. Kizárólag a böngésző helyi tárolóját (localStorage) alkalmazzuk a választott megjelenési téma (világos/sötét) és nyelv megjegyzésére; ez az adat nem kerül továbbításra, és nem alkalmas személyazonosításra.", "The website does not use tracking or marketing cookies. We only use the browser's local storage (localStorage) to remember the chosen display theme (light/dark) and language; this data is not transmitted and cannot identify you.")}</p>`,
    `<h2>${T("5. Adatfeldolgozók és adattovábbítás", "5. Data processors and transfers")}</h2>
          <p>${T("Személyes adatait harmadik félnek nem adjuk el és nem továbbítjuk, kivéve, ha erre jogszabály kötelez. A weboldal tárhelyszolgáltatója az adatokhoz technikai okból hozzáférhet; a tárhelyszolgáltató adatai: [kitöltendő].", "We do not sell or transfer your personal data to third parties, except where required by law. The website's hosting provider may access the data for technical reasons; hosting provider details: [to be completed].")}</p>`,
    `<h2>${T("6. Az érintett jogai", "6. Rights of the data subject")}</h2>
          <p>${T("Az irányadó jogszabályok szerint Önt megilletik az alábbi jogok:", "Under the applicable law you have the following rights:")}</p>
          <ul>
            <li>${T("tájékoztatáshoz és hozzáféréshez való jog;", "the right to information and access;")}</li>
            <li>${T("helyesbítéshez való jog;", "the right to rectification;")}</li>
            <li>${T("törléshez való jog („elfeledtetéshez való jog\");", "the right to erasure (the “right to be forgotten”);")}</li>
            <li>${T("az adatkezelés korlátozásához való jog;", "the right to restriction of processing;")}</li>
            <li>${T("adathordozhatósághoz való jog;", "the right to data portability;")}</li>
            <li>${T("tiltakozáshoz való jog, valamint a hozzájárulás bármikori visszavonása.", "the right to object, and to withdraw consent at any time.")}</li>
          </ul>
          <p>${T("Jogai gyakorlását a fenti elérhetőségeinken kezdeményezheti; kérelmére indokolatlan késedelem nélkül válaszolunk.", "You may exercise your rights via our contact details above; we respond to your request without undue delay.")}</p>`,
    `<h2>${T("7. Adatbiztonság", "7. Data security")}</h2>
          <p>${T("Megfelelő technikai és szervezési intézkedésekkel gondoskodunk a személyes adatok védelméről a jogosulatlan hozzáférés, megváltoztatás, továbbítás, nyilvánosságra hozatal, törlés vagy megsemmisítés ellen.", "We ensure the protection of personal data against unauthorised access, alteration, transfer, disclosure, deletion or destruction by appropriate technical and organisational measures.")}</p>`,
    `<h2>${T("8. Jogorvoslat", "8. Legal remedy")}</h2>
          <p>${T('Amennyiben úgy ítéli meg, hogy adatai kezelése jogsértő, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, 1055 Budapest, Falk Miksa utca 9-11., <a href="https://naih.hu" target="_blank" rel="noopener">naih.hu</a>), illetve bírósághoz fordulhat.', 'If you consider that the processing of your data infringes the law, you may lodge a complaint with the Hungarian National Authority for Data Protection and Freedom of Information (NAIH, Falk Miksa utca 9-11, 1055 Budapest, <a href="https://naih.hu" target="_blank" rel="noopener">naih.hu</a>) or turn to a court.')}</p>`,
  ],
});

/* ── generálás ── */
for (const s of CONTENT) {
  writeFileSync(join(ROOT, `${s.slug}.html`), servicePage(s));
  console.log(`✓ ${s.slug}.html`);
}
writeFileSync(join(ROOT, "rolunk.html"), rolunk);
console.log("✓ rolunk.html");
writeFileSync(join(ROOT, "kapcsolat.html"), kapcsolat);
console.log("✓ kapcsolat.html");
writeFileSync(join(ROOT, "aszf.html"), aszf);
console.log("✓ aszf.html");
writeFileSync(join(ROOT, "adatvedelem.html"), adatvedelem);
console.log("✓ adatvedelem.html");

// az aloldalak összegyűjtött fordításai
writeFileSync(
  join(ROOT, "js/i18n-pages.js"),
  "/* Generált aloldal-fordítások — ne szerkeszd kézzel! Forrás: tools/build-pages.mjs */\n" +
    "window.I18N_PAGES = " +
    JSON.stringify(PAGE_I18N, null, 0) +
    ";\n"
);
console.log(`✓ js/i18n-pages.js (${Object.keys(PAGE_I18N.hu).length} kulcs)`);
