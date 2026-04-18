/**
 * Lightweight enhancements: mobile nav, smooth in-page navigation, header scroll state.
 */
(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  function setOpen(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = !nav.classList.contains("is-open");
      setOpen(open);
    });

    nav.querySelectorAll("a[href^='#']").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!header) return;
      if (!ticking) {
        window.requestAnimationFrame(() => {
          header.classList.toggle("is-scrolled", window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true }
  );

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const id = this.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) {
          history.replaceState(null, "", id);
        }
      }
    });
  });
})();
