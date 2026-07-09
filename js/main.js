/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — main
   Preloader, navbar, téma, reveal, számlálók, 3D tilt, űrlap
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Preloader (csak a főoldalon van) ── */
  const preloader = document.getElementById("preloader");
  if (preloader) {
    window.addEventListener("load", () => {
      setTimeout(() => preloader.classList.add("done"), reduceMotion ? 0 : 900);
    });
    // biztonsági háló, ha a load esemény elmaradna
    setTimeout(() => preloader.classList.add("done"), 3500);
  }

  /* ── Téma ── */
  const root = document.documentElement;
  const saved = localStorage.getItem("pzs-theme");
  if (saved === "light" || saved === "dark") root.dataset.theme = saved;
  document.getElementById("themeToggle").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    localStorage.setItem("pzs-theme", root.dataset.theme);
  });

  /* ── Navbar ── */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    hamburger.classList.toggle("open", open);
    hamburger.setAttribute("aria-expanded", String(open));
  });
  navLinks.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      navLinks.classList.remove("open");
      hamburger.classList.remove("open");
      hamburger.setAttribute("aria-expanded", "false");
    })
  );

  // legördülő "Szolgáltatások": mobilon kattintásra bomlik ki
  const dd = navLinks.querySelector(".has-dropdown");
  const ddToggle = dd && dd.querySelector(".dropdown-toggle");
  if (dd && ddToggle) {
    ddToggle.addEventListener("click", (e) => {
      // csak mobil nézetben kezeljük kattintással (desktopon hover nyitja)
      if (window.matchMedia("(min-width: 881px)").matches) return;
      e.preventDefault();
      const open = dd.classList.toggle("open");
      ddToggle.setAttribute("aria-expanded", String(open));
    });
  }

  // aktív szekció jelölése (csak az oldalon belüli horgony-linkekre)
  const sections = [...document.querySelectorAll("main section[id]")];
  const linkFor = {};
  navLinks.querySelectorAll("a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) linkFor[href.slice(1)] = a;
  });
  const activeObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const link = linkFor[e.target.id];
      if (link && e.isIntersecting) {
        navLinks.querySelectorAll("a").forEach((a) => a.classList.remove("active"));
        link.classList.add("active");
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach((s) => activeObs.observe(s));

  /* ── Reveal ── */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => revealObs.observe(el));

  /* ── Számlálók ── */
  const counterObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      counterObs.unobserve(e.target);
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || "";
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const t0 = performance.now(), dur = 1800;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat-num[data-count]").forEach((el) => counterObs.observe(el));

  /* ── 3D tilt a kártyákon ── */
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".tilt").forEach((card) => {
      let raf = 0;
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${(0.5 - py) * 8}deg) rotateY(${(px - 0.5) * 10}deg) translateY(-4px)`;
          card.style.setProperty("--mx", `${px * 100}%`);
          card.style.setProperty("--my", `${py * 100}%`);
        });
      });
      card.addEventListener("pointerleave", () => {
        cancelAnimationFrame(raf);
        card.style.transform = "";
      });
    });
  }

  /* ── Kapcsolati űrlap (webhookra küldve, JSON POST) ── */
  const WEBHOOK_URL =
    "https://resend-in.lovable.app/api/public/hook/ab640c16ce2561c820c6f893812eb688d79a5500aa5a446e";
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  // Aktuális nyelvhez tartozó szótári szöveg (fallback az adott kulcsra).
  function i18nText(key, fallback) {
    const lang = document.documentElement.getAttribute("data-lang") || "hu";
    const a = window.I18N && window.I18N[lang];
    if (a && a[key] != null) return a[key];
    const b = window.I18N_PAGES && window.I18N_PAGES[lang];
    if (b && b[key] != null) return b[key];
    return fallback;
  }

  if (form) form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const submitBtn = form.querySelector('button[type="submit"], [type="submit"]');
    const d = new FormData(form);
    const payload = {
      name: (d.get("name") || "").toString().trim(),
      email: (d.get("email") || "").toString().trim(),
      phone: (d.get("phone") || "").toString().trim(),
      service: (d.get("service") || "").toString().trim(),
      message: (d.get("message") || "").toString().trim(),
      language: document.documentElement.getAttribute("data-lang") || "hu",
      page: location.pathname + location.search,
      submitted_at: new Date().toISOString(),
    };

    if (submitBtn) submitBtn.disabled = true;
    if (status) {
      status.textContent = i18nText("form.sending", "Küldés…");
      status.removeAttribute("data-error");
    }

    // A törzs JSON, de "text/plain" content-type-pal küldjük: így a kérés
    // CORS szempontból "egyszerű" marad, és nem indít preflight (OPTIONS)
    // kérést, amit a webhook nem feltétlen kezel. A hook a nyers törzset
    // JSON-ként tudja értelmezni.
    const body = JSON.stringify(payload);
    const showSent = () => {
      if (status) {
        status.textContent = i18nText(
          "form.sent",
          "Köszönjük! Üzenetét megkaptuk — hamarosan jelentkezünk."
        );
      }
      form.reset();
    };
    const showError = () => {
      if (status) {
        status.textContent = i18nText(
          "form.error",
          "Hiba történt a küldés során. Kérjük, próbálja újra, vagy hívjon minket."
        );
        status.setAttribute("data-error", "");
      }
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body,
      });
      // A szerver olvasható választ adott (van CORS-fejléc).
      if (res.ok) showSent();
      else showError();
    } catch (err) {
      // A fetch eldobta magát: jellemzően azért, mert a webhook nem küld
      // CORS-fejlécet, így a böngésző elrejti a választ. Ilyenkor "no-cors"
      // módban újraküldjük — a kérés célba ér, csak a válasz lesz átlátszó,
      // ezért sikeresnek tekintjük (best-effort kézbesítés).
      try {
        await fetch(WEBHOOK_URL, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body,
        });
        showSent();
      } catch (err2) {
        showError();
      }
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* ── Hero 3D modell: egérrel forgatás desktopon ── */
  const heroModel = document.getElementById("heroModel");
  if (heroModel && matchMedia("(hover: hover) and (min-width: 881px)").matches) {
    heroModel.setAttribute("camera-controls", "");
  }

  /* ── Évszám ── */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
