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
          <p class="overline">Kapcsolódó</p>
          <h2 style="font-size:1.6rem">További szolgáltatásaink</h2>
        </header>
        <div class="others reveal">
          ${SERVICES.filter((s) => s.slug !== slug)
            .map((s) => `<a href="${s.slug}.html">${s.name} →</a>`)
            .join("\n          ")}
        </div>
      </div>
    </section>`;

/* ── szolgáltatás-oldal sablon ── */
const servicePage = (s) =>
  page({
    title: s.name,
    desc: s.metaDesc,
    active: s.slug,
    body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([["Főoldal", "index.html"], ["Szolgáltatások", "index.html#szolgaltatasok"], [s.name]])}
        <p class="overline reveal">${s.overline}</p>
        <h1 class="reveal d1">${s.h1}</h1>
        <p class="lead reveal d2">${s.lead}</p>
        <div class="hero-cta reveal d3">
          <a href="kapcsolat.html" class="btn btn-gold">Ajánlatot kérek
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
          <a href="tel:${PHONE_TEL}" class="btn btn-ghost">${PHONE_DISPLAY}</a>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container intro-grid">
        <div class="intro-copy reveal">
          ${s.intro.map((p) => `<p>${p}</p>`).join("\n          ")}
        </div>
        <aside class="glass facts reveal d1">
          <h3>Röviden</h3>
          <ul>
            ${s.facts.map((f) => `<li>${f}</li>`).join("\n            ")}
          </ul>
        </aside>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">Mit tartalmaz</p>
          <h2>${s.featuresTitle}</h2>
        </header>
        <div class="cards">
          ${s.features
            .map(
              (f, i) => `<article class="glass card tilt reveal${i % 3 === 1 ? " d1" : i % 3 === 2 ? " d2" : ""}">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>${f.t}</h3>
            <p>${f.d}</p>
          </article>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">Hogyan dolgozunk</p>
          <h2>${s.processTitle}</h2>
        </header>
        <div class="steps">
          ${s.process
            .map(
              (st, i) => `<div class="glass step reveal${i ? ` d${i}` : ""}">
            <span class="step-num">0${i + 1}</span>
            <h3>${st.t}</h3>
            <p>${st.d}</p>
          </div>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">Gyakori kérdések</p>
          <h2>Amit ügyfeleink kérdezni szoktak</h2>
        </header>
        <div class="faq">
          ${s.faq
            .map(
              (q) => `<details class="glass reveal">
            <summary>${q.q}</summary>
            <p>${q.a}</p>
          </details>`
            )
            .join("\n          ")}
        </div>
      </div>
    </section>
${othersStrip(s.slug)}`,
  });

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

/* ═══════════ RÓLUNK ═══════════ */
const rolunk = page({
  title: "Rólunk",
  desc: "A Private Zone Security csapata rendvédelmi és katonai múlttal rendelkező, hatósági engedéllyel bíró biztonsági szakemberekből áll. Ismerje meg értékeinket és működésünket.",
  active: "rolunk",
  body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([["Főoldal", "index.html"], ["Rólunk"]])}
        <p class="overline reveal">Rólunk</p>
        <h1 class="reveal d1">Elegancia kívül,<br><span class="gold-text">acél fegyelem</span> belül.</h1>
        <p class="lead reveal d2">A Private Zone Security prémium személy- és vagyonvédelmi szolgáltató.
        Abban hiszünk, hogy a valódi biztonság nem hivalkodó: csendben, pontosan és
        következetesen működik — mint egy jól szabott öltöny.</p>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container intro-grid">
        <div class="intro-copy reveal">
          <p>Csapatunkat <strong>rendvédelmi és katonai múlttal rendelkező szakemberek</strong> alkotják,
          akik a hivatásos szolgálatban tanulták meg, mit jelent a fegyelem, a protokoll és a
          felelősség — és a magánszférában tanulták meg mindezt diszkrécióval, tapintattal és
          ügyfélközpontúsággal párosítani.</p>
          <p>Nem tömegszolgáltatást nyújtunk. Ügyfeleink száma szándékosan korlátozott: minden
          megbízáshoz dedikált kapcsolattartót rendelünk, és a vezetőink személyesen ismernek
          minden futó ügyet. Ez az, amit egy nagy létszámú őrző-védő cég nem tud megadni —
          és amiért ügyfeleink hosszú évek óta visszatérnek.</p>
          <p>Működésünk minden eleme <strong>jogszerű és dokumentált</strong>: munkatársaink a
          személy- és vagyonvédelmi tevékenységről szóló törvény szerinti hatósági engedéllyel és
          igazolvánnyal rendelkeznek, tevékenységünket felelősségbiztosítás fedezi, megbízásainkat
          pedig titoktartási megállapodás védi.</p>
        </div>
        <aside class="glass facts reveal d1">
          <h3>Számokban</h3>
          <ul>
            <li>15+ év szakmai tapasztalat a csapat vezetésében</li>
            <li>500+ biztosított rendezvény</li>
            <li>98% visszatérő ügyfél</li>
            <li>24/7 diszpécser-elérhetőség</li>
            <li>Budapest központtal, országos lefedettséggel</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">Értékeink</p>
          <h2>Amiben nem ismerünk kompromisszumot</h2>
        </header>
        <div class="values-grid">
          <article class="glass card tilt reveal">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>Diszkréció</h3>
            <p>A megbízás ténye is titok. Ügyfeleink nevét nem használjuk referenciaként,
            adataikat nem adjuk ki, jelenlétünk pedig csak annyira látható, amennyire Ön szeretné.</p>
          </article>
          <article class="glass card tilt reveal d1">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>Jogszerűség</h3>
            <p>Egyetlen ügy sem ér annyit, hogy törvényt sértsünk érte — és Önnek sem érdeke.
            Minden eszközünk jogszerű, minden lépésünk dokumentált és számonkérhető.</p>
          </article>
          <article class="glass card tilt reveal d2">
            <div class="card-icon"><span style="font-size:1.1rem;color:var(--gold)">✦</span></div>
            <h3>Következetesség</h3>
            <p>Amit vállalunk, azt tartjuk: időben érkezünk, riportot adunk, visszahívjuk.
            A biztonság bizalmi műfaj — a bizalmat pedig apró, megbízható gesztusok építik.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section" style="padding-top:0">
      <div class="container">
        <header class="section-head reveal">
          <p class="overline">Működésünk</p>
          <h2>Amire minden megbízásnál számíthat</h2>
        </header>
        <div class="steps">
          <div class="glass step reveal">
            <span class="step-num">✦</span>
            <h3>Dedikált kapcsolattartó</h3>
            <p>Egyetlen embert kell ismernie, aki minden kérdésére válaszol — nem egy call centert.</p>
          </div>
          <div class="glass step reveal d1">
            <span class="step-num">✦</span>
            <h3>Írásos riportok</h3>
            <p>Szolgálati napló, eseményjelentés, havi összefoglaló — a munkánk átlátható és visszakereshető.</p>
          </div>
          <div class="glass step reveal d2">
            <span class="step-num">✦</span>
            <h3>Ellenőrzött állomány</h3>
            <p>Munkatársainkat magunk válogatjuk, képezzük és ellenőrizzük — alvállalkozói láncok nélkül.</p>
          </div>
          <div class="glass step reveal d3">
            <span class="step-num">✦</span>
            <h3>Átlátható díjazás</h3>
            <p>Az ajánlatunkban minden tétel szerepel. Rejtett költség nálunk nincs — meglepetés sem.</p>
          </div>
        </div>
      </div>
    </section>
${othersStrip("")}`,
});

/* ═══════════ KAPCSOLAT ═══════════ */
const kapcsolat = page({
  title: "Kapcsolat",
  desc: "Lépjen kapcsolatba a Private Zone Security csapatával: telefon, e-mail és bizalmas üzenetküldés. 24/7 elérhetőség, 24 órán belüli visszajelzés.",
  active: "kapcsolat",
  body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([["Főoldal", "index.html"], ["Kapcsolat"]])}
        <p class="overline reveal">Kapcsolat</p>
        <h1 class="reveal d1">Kezdjük egy<br><span class="gold-text">bizalmas</span> beszélgetéssel.</h1>
        <p class="lead reveal d2">Minden megkeresést szigorúan bizalmasan kezelünk. Hívjon minket a nap
        bármely órájában, vagy írjon — munkatársunk 24 órán belül jelentkezik.</p>
      </div>
    </section>

    <section class="section contact" style="padding-top:2rem">
      <div class="container contact-grid">
        <div class="contact-info">
          <ul class="contact-list reveal">
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/></svg></span>
              <div><strong>Telefon</strong><a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg></span>
              <div><strong>E-mail</strong><a href="mailto:${EMAIL}">${EMAIL}</a></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg></span>
              <div><strong>Iroda</strong><span>${ADDRESS_L1}<br>${ADDRESS_L2}</span></div>
            </li>
            <li>
              <span class="ci"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg></span>
              <div><strong>Elérhetőség</strong><span>24/7 — az év minden napján</span></div>
            </li>
          </ul>

          <div class="glass facts reveal d1" style="margin-top:2rem;position:static">
            <h3>Az első konzultáció</h3>
            <ul>
              <li>Díjmentes és kötelezettség nélküli</li>
              <li>Személyesen, telefonon vagy videóhívásban</li>
              <li>Titoktartás már az első szótól</li>
              <li>Őszinte válasz: ha nem mi vagyunk a megoldás, azt is megmondjuk</li>
            </ul>
          </div>
        </div>

        <form class="glass contact-form reveal d2" id="contactForm" novalidate>
          <div class="form-row">
            <div class="field">
              <label for="fName">Név *</label>
              <input id="fName" name="name" type="text" required autocomplete="name" placeholder="Az Ön neve">
            </div>
            <div class="field">
              <label for="fPhone">Telefon</label>
              <input id="fPhone" name="phone" type="tel" autocomplete="tel" placeholder="+36 …">
            </div>
          </div>
          <div class="field">
            <label for="fEmail">E-mail *</label>
            <input id="fEmail" name="email" type="email" required autocomplete="email" placeholder="pelda@email.hu">
          </div>
          <div class="field">
            <label for="fService">Szolgáltatás</label>
            <select id="fService" name="service">
              <option value="">Válasszon…</option>
              ${SERVICES.map((s) => `<option>${s.name}</option>`).join("\n              ")}
              <option>Egyéb / összetett megbízás</option>
            </select>
          </div>
          <div class="field">
            <label for="fMsg">Üzenet *</label>
            <textarea id="fMsg" name="message" rows="4" required placeholder="Írja le röviden, miben segíthetünk…"></textarea>
          </div>
          <p class="form-note">Üzenetét bizalmasan kezeljük, harmadik félnek nem adjuk ki.</p>
          <button type="submit" class="btn btn-gold btn-block">Bizalmas üzenet küldése</button>
          <p class="form-status" id="formStatus" role="status"></p>
        </form>
      </div>
    </section>`,
});

/* ═══════════ JOGI OLDALAK (ÁSZF, Adatvédelem) ═══════════ */
const legalPage = ({ slug, title, crumb, desc, updated, lead, blocks }) =>
  page({
    title,
    desc,
    active: slug,
    noCta: true,
    body: `
    <section class="page-hero">
      <div class="container">
${breadcrumb([["Főoldal", "index.html"], [crumb]])}
        <p class="overline reveal">Jogi tájékoztató</p>
        <h1 class="reveal d1">${title}</h1>
        <p class="lead reveal d2">${lead}</p>
      </div>
    </section>

    <section class="section" style="padding-top:2rem">
      <div class="container">
        <article class="legal reveal">
          <p class="updated">Hatályos / utolsó frissítés: ${updated}</p>
          ${blocks.join("\n          ")}
        </article>
      </div>
    </section>`,
  });

// Cégadat-blokk (a hiányzó jogi adatokat a Megrendelőnek kell kitöltenie)
// Teljes cégadat-doboz (Adatvédelemhez) — a GDPR-nál elvárt tételekkel,
// a még ismeretlen adatok kitöltendőként jelölve.
const COMPANY_BOX = `<div class="legal-callout glass">
            <h3>A Szolgáltató (Adatkezelő) adatai</h3>
            <ul>
              <li><strong>Név:</strong> Private Zone Security [cégnév pontosítandó]</li>
              <li><strong>Székhely:</strong> ${ADDRESS_L1}, ${ADDRESS_L2}</li>
              <li><strong>Cégjegyzékszám:</strong> [kitöltendő]</li>
              <li><strong>Adószám:</strong> [kitöltendő]</li>
              <li><strong>Működési / SzVMSzK engedély száma:</strong> [kitöltendő]</li>
              <li><strong>Képviselő:</strong> [kitöltendő]</li>
              <li><strong>Telefon:</strong> <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></li>
              <li><strong>E-mail:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
            </ul>
          </div>`;

// Rövidített cégadat-doboz (ÁSZF-hez) — csak a ténylegesen ismert adatok,
// kitöltendő/placeholder mezők nélkül.
const COMPANY_BOX_ASZF = `<div class="legal-callout glass">
            <h3>A Szolgáltató adatai</h3>
            <ul>
              <li><strong>Név:</strong> Private Zone Security</li>
              <li><strong>Székhely:</strong> ${ADDRESS_L1}, ${ADDRESS_L2}</li>
              <li><strong>Telefon:</strong> <a href="tel:${PHONE_TEL}">${PHONE_DISPLAY}</a></li>
              <li><strong>E-mail:</strong> <a href="mailto:${EMAIL}">${EMAIL}</a></li>
            </ul>
          </div>`;

const LEGAL_DISCLAIMER = `<div class="legal-note">
            <strong>Megjegyzés:</strong> Ez a dokumentum sablon, amely a Private Zone Security
            szolgáltatásaihoz készült. A szögletes zárójelben [ … ] jelölt adatokat a tényleges
            cégadatokkal szükséges kitölteni, és a végleges szöveget javasolt jogi szakértővel
            véleményeztetni a hatályos jogszabályoknak való teljes megfelelés érdekében.
          </div>`;

const aszf = legalPage({
  slug: "aszf",
  title: "Általános Szerződési Feltételek",
  crumb: "ÁSZF",
  desc: "A Private Zone Security személy- és vagyonvédelmi szolgáltatásaira vonatkozó Általános Szerződési Feltételek.",
  updated: "2026. július 1.",
  lead: "Jelen Általános Szerződési Feltételek (a továbbiakban: ÁSZF) a Private Zone Security által nyújtott biztonsági szolgáltatások igénybevételének feltételeit szabályozzák.",
  blocks: [
    COMPANY_BOX_ASZF,
    `<h2>1. Az ÁSZF hatálya</h2>
          <p>Jelen ÁSZF a Szolgáltató és a szolgáltatásait igénybe vevő Megrendelő (a továbbiakban együtt: Felek) között létrejövő valamennyi szerződéses jogviszonyra irányadó, kivéve, ha a Felek egyedi szerződésben ettől eltérően állapodnak meg. Egyedi szerződés és az ÁSZF eltérése esetén az egyedi szerződés rendelkezései az irányadók.</p>
          <p>A Szolgáltató fenntartja a jogot az ÁSZF egyoldalú módosítására; a módosítás a közzététel napjától hatályos, a már megkötött szerződéseket nem érinti hátrányosan.</p>`,
    `<h2>2. A szolgáltatások köre</h2>
          <p>A Szolgáltató különösen az alábbi tevékenységeket végzi, a vonatkozó jogszabályi keretek között:</p>
          <ul>
            <li>élőerős őrzés-védelem, objektum- és vagyonvédelem;</li>
            <li>személyvédelem;</li>
            <li>rendezvénybiztosítás;</li>
            <li>követeléskezelés;</li>
            <li>magánnyomozás;</li>
            <li>birtokvédelemmel összefüggő biztonsági közreműködés.</li>
          </ul>
          <p>A Szolgáltató tevékenységét a személy- és vagyonvédelmi, valamint a magánnyomozói tevékenység szabályairól szóló hatályos jogszabályok (különösen a 2005. évi CXXXIII. törvény) szerint, engedéllyel és felelősségbiztosítással végzi.</p>`,
    `<h2>3. A szerződés létrejötte</h2>
          <p>A szerződés a Felek egyező akaratnyilatkozatával, írásban jön létre. A Megrendelő ajánlatkérését követően a Szolgáltató egyedi árajánlatot ad; a szerződés az ajánlat elfogadásával és a szolgáltatási szerződés aláírásával jön létre.</p>
          <p>A megrendeléshez szükséges adatok valódiságáért a Megrendelő felel.</p>`,
    `<h2>4. Díjazás és fizetési feltételek</h2>
          <p>A szolgáltatás díját az egyedi szerződés tartalmazza. Eltérő megállapodás hiányában a Szolgáltató a teljesítésről számlát állít ki, amelyet a Megrendelő a számlán feltüntetett fizetési határidőn belül köteles kiegyenlíteni.</p>
          <p>Késedelmes fizetés esetén a Szolgáltató a Ptk. szerinti késedelmi kamatot és behajtási költségátalányt érvényesíthet.</p>`,
    `<h2>5. A Felek jogai és kötelezettségei</h2>
          <p>A Szolgáltató a szolgáltatást a tőle elvárható gondossággal, szakszerűen, a vonatkozó jogszabályok betartásával nyújtja. A Megrendelő köteles a teljesítéshez szükséges információkat és feltételeket biztosítani, valamint a díjat határidőben megfizetni.</p>`,
    `<h2>6. Titoktartás</h2>
          <p>A Szolgáltató a szerződés teljesítése során tudomására jutott minden információt bizalmasan kezel, azt harmadik félnek – jogszabályi kötelezettség hiányában – nem adja ki. A titoktartási kötelezettség a szerződés megszűnését követően is fennmarad.</p>`,
    `<h2>7. Felelősség</h2>
          <p>A Szolgáltató felelősségére a Ptk. és az egyedi szerződés rendelkezései az irányadók. A Szolgáltató nem felel a Megrendelő által szolgáltatott hibás vagy hiányos adatokból, illetve a Megrendelő mulasztásából eredő károkért.</p>`,
    `<h2>8. Panaszkezelés</h2>
          <p>A Megrendelő az esetleges panaszát a Szolgáltató fenti elérhetőségein jelentheti be. A Szolgáltató a panaszt kivizsgálja, és a jogszabályban meghatározott határidőn belül írásban válaszol.</p>`,
    `<h2>9. Vegyes és záró rendelkezések</h2>
          <p>A jelen ÁSZF-ben nem szabályozott kérdésekben a magyar jog, különösen a Polgári Törvénykönyv rendelkezései az irányadók. A Felek a jogvitáikat elsősorban egyeztetés útján rendezik.</p>`,
  ],
});

const adatvedelem = legalPage({
  slug: "adatvedelem",
  title: "Adatvédelmi Nyilatkozat",
  crumb: "Adatvédelem",
  desc: "A Private Zone Security adatkezelési tájékoztatója a GDPR és a hatályos adatvédelmi jogszabályok szerint.",
  updated: "2026. július 1.",
  lead: "A Private Zone Security elkötelezett a személyes adatok védelme mellett. Jelen tájékoztató bemutatja, hogyan kezeljük az Ön adatait az EU 2016/679 (GDPR) rendelettel és a hatályos magyar jogszabályokkal összhangban.",
  blocks: [
    LEGAL_DISCLAIMER,
    COMPANY_BOX,
    `<h2>1. A kezelt adatok köre és célja</h2>
          <p>A weboldalon a kapcsolatfelvételi űrlapon keresztül az alábbi adatokat kezeljük, kizárólag a megkeresés megválaszolása és az ajánlatadás céljából:</p>
          <ul>
            <li><strong>név</strong> – a kapcsolatfelvételhez;</li>
            <li><strong>e-mail cím</strong> – a válaszadáshoz;</li>
            <li><strong>telefonszám</strong> (opcionális) – a kapcsolatfelvételhez;</li>
            <li><strong>az üzenet tartalma</strong> – az igény megértéséhez.</li>
          </ul>
          <p>A kapcsolati űrlap az adatokat nem tárolja szerveren: az elküldés az Ön levelezőprogramját nyitja meg egy előre kitöltött e-maillel, így az adatok e-mailben jutnak el hozzánk.</p>`,
    `<h2>2. Az adatkezelés jogalapja</h2>
          <p>Az adatkezelés jogalapja az érintett hozzájárulása (GDPR 6. cikk (1) a) pont), illetve a szerződés megkötését megelőző lépések megtétele az érintett kérésére (GDPR 6. cikk (1) b) pont). Szerződéskötés esetén az adatkezelést jogi kötelezettség teljesítése (pl. számviteli előírások) is megalapozhatja.</p>`,
    `<h2>3. Az adatkezelés időtartama</h2>
          <p>A megkeresés kapcsán megadott adatokat a cél eléréséhez szükséges ideig, legfeljebb a kapcsolatfelvételt követő ésszerű ideig kezeljük, ezt követően töröljük. Szerződéses jogviszony esetén a jogszabályban előírt megőrzési idő (pl. számviteli bizonylatok esetén 8 év) az irányadó.</p>`,
    `<h2>4. Sütik (cookies) és tárolás</h2>
          <p>A weboldal nem használ nyomkövető vagy marketing sütiket. Kizárólag a böngésző helyi tárolóját (localStorage) alkalmazzuk a választott megjelenési téma (világos/sötét) megjegyzésére; ez az adat nem kerül továbbításra, és nem alkalmas személyazonosításra.</p>`,
    `<h2>5. Adatfeldolgozók és adattovábbítás</h2>
          <p>Személyes adatait harmadik félnek nem adjuk el és nem továbbítjuk, kivéve, ha erre jogszabály kötelez. A weboldal tárhelyszolgáltatója az adatokhoz technikai okból hozzáférhet; a tárhelyszolgáltató adatai: [kitöltendő].</p>`,
    `<h2>6. Az érintett jogai</h2>
          <p>Az irányadó jogszabályok szerint Önt megilletik az alábbi jogok:</p>
          <ul>
            <li>tájékoztatáshoz és hozzáféréshez való jog;</li>
            <li>helyesbítéshez való jog;</li>
            <li>törléshez való jog („elfeledtetéshez való jog");</li>
            <li>az adatkezelés korlátozásához való jog;</li>
            <li>adathordozhatósághoz való jog;</li>
            <li>tiltakozáshoz való jog, valamint a hozzájárulás bármikori visszavonása.</li>
          </ul>
          <p>Jogai gyakorlását a fenti elérhetőségeinken kezdeményezheti; kérelmére indokolatlan késedelem nélkül válaszolunk.</p>`,
    `<h2>7. Adatbiztonság</h2>
          <p>Megfelelő technikai és szervezési intézkedésekkel gondoskodunk a személyes adatok védelméről a jogosulatlan hozzáférés, megváltoztatás, továbbítás, nyilvánosságra hozatal, törlés vagy megsemmisítés ellen.</p>`,
    `<h2>8. Jogorvoslat</h2>
          <p>Amennyiben úgy ítéli meg, hogy adatai kezelése jogsértő, panaszt tehet a Nemzeti Adatvédelmi és Információszabadság Hatóságnál (NAIH, 1055 Budapest, Falk Miksa utca 9-11., <a href="https://naih.hu" target="_blank" rel="noopener">naih.hu</a>), illetve bírósághoz fordulhat.</p>`,
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
