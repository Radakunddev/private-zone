/* ═══════════════════════════════════════════════════════════════
   PRIVATE ZONE SECURITY — main
   Preloader, navbar, téma, reveal, számlálók, 3D tilt, űrlap
   ═══════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── Preloader ── */
  const preloader = document.getElementById("preloader");
  window.addEventListener("load", () => {
    setTimeout(() => preloader.classList.add("done"), reduceMotion ? 0 : 900);
  });
  // biztonsági háló, ha a load esemény elmaradna (pl. lassú betűtípus)
  setTimeout(() => preloader.classList.add("done"), 3500);

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

  // aktív szekció jelölése
  const sections = [...document.querySelectorAll("main section[id]")];
  const linkFor = {};
  navLinks.querySelectorAll("a[href^='#']").forEach((a) => (linkFor[a.hash.slice(1)] = a));
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

  /* ── Kapcsolati űrlap (mailto-ba csomagolva, backend nélkül) ── */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const subject = encodeURIComponent(
      `Ajánlatkérés — ${d.get("service") || "általános megkeresés"}`
    );
    const body = encodeURIComponent(
      `Név: ${d.get("name")}\nTelefon: ${d.get("phone") || "-"}\nE-mail: ${d.get("email")}\n` +
      `Szolgáltatás: ${d.get("service") || "-"}\n\nÜzenet:\n${d.get("message")}`
    );
    window.location.href = `mailto:info@privatezonesecurity.hu?subject=${subject}&body=${body}`;
    status.textContent = "Köszönjük! A levelezőprogramja megnyílt az előkészített üzenettel.";
    form.reset();
  });

  /* ── Évszám ── */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
