/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — i18n motor (HU / EN)

   Kulcs alapú fordítás. A szótár a window.I18N objektumban van
   (js/i18n-dict.js — a főoldal + közös elemek, valamint a
   generátor által előállított aloldal-kulcsok).

   Használat a HTML-ben:
     <h2 data-i18n="services.title">Szolgáltatásaink</h2>
     <p  data-i18n-html="hero.h1">…<span>…</span>…</p>   (HTML tartalom)
     <input data-i18n-attr="placeholder" data-i18n="contact.form.name_ph">

   Nyelvfelismerés (geo-proxy): magyar böngésző → HU, más → EN.
   A választás localStorage-ban tárolódik, kézzel is váltható.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const KEY = "pzs-lang";
  const SUPPORTED = ["hu", "en"];

  // A közös/főoldali szótár (window.I18N) és a generált aloldal-szótár
  // (window.I18N_PAGES) összefésülése.
  function lookup(lang, key) {
    const a = window.I18N && window.I18N[lang];
    if (a && a[key] != null) return a[key];
    const b = window.I18N_PAGES && window.I18N_PAGES[lang];
    if (b && b[key] != null) return b[key];
    return null;
  }

  function detect() {
    try {
      const saved = localStorage.getItem(KEY);
      if (SUPPORTED.includes(saved)) return saved;
    } catch (e) {}
    const langs =
      navigator.languages && navigator.languages.length
        ? navigator.languages
        : [navigator.language || ""];
    return langs.some((l) => /^hu/i.test(l)) ? "hu" : "en";
  }

  function t(lang, key) {
    return lookup(lang, key);
  }

  function apply(lang) {
    if (!SUPPORTED.includes(lang)) lang = "en";
    const root = document.documentElement;
    root.lang = lang;
    root.setAttribute("data-lang", lang);
    try { localStorage.setItem(KEY, lang); } catch (e) {}

    // szöveges tartalom
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      const attr = el.getAttribute("data-i18n-attr");
      const val = t(lang, key);
      if (val == null) return;
      if (attr) el.setAttribute(attr, val);
      else el.textContent = val;
    });

    // HTML tartalom (br, span, stb.)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = t(lang, el.getAttribute("data-i18n-html"));
      if (val != null) el.innerHTML = val;
    });

    // dokumentumcím — vagy közvetlen <html data-title-xx>, vagy szótárkulcs
    const directTitle = root.getAttribute("data-title-" + lang);
    const titleKey = document.body && document.body.getAttribute("data-title-key");
    if (directTitle) {
      document.title = directTitle;
    } else if (titleKey) {
      const val = t(lang, titleKey);
      if (val) document.title = val;
    }

    // váltógomb(ok) a MÁSIK nyelvet mutatják
    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.textContent = lang === "hu" ? "EN" : "HU";
      btn.setAttribute(
        "aria-label",
        lang === "hu" ? "Switch to English" : "Váltás magyar nyelvre"
      );
    });

    document.dispatchEvent(new CustomEvent("pzs:langchange", { detail: { lang } }));
  }

  // globálisan elérhető, hogy más szkript is használhassa
  window.PZSLang = {
    get: () => document.documentElement.getAttribute("data-lang") || "hu",
    set: apply,
    toggle: () => apply(window.PZSLang.get() === "hu" ? "en" : "hu"),
  };

  const initial = document.documentElement.getAttribute("data-lang") || detect();

  function boot() {
    apply(initial);
    document.querySelectorAll("[data-lang-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => window.PZSLang.toggle());
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
