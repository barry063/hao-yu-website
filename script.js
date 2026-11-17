/**
 * Progressive enhancement: usable anchor links and navigation without JS.
 */
(function () {
  "use strict";
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const mobile = window.matchMedia("(max-width: 880px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Plain language links work without JS; carry a shared section when enhanced.
  const languageLinks = [...document.querySelectorAll("a[data-language-link]")]
    .filter(link => link.hasAttribute("data-language-link"));
  const languageDestinations = languageLinks.map(link => [link, link.getAttribute("href")]);
  function syncLanguageLinks() {
    const fragment = window.location?.hash || "";
    const valid = /^#[a-z][a-z0-9-]*$/.test(fragment) && document.getElementById(fragment.slice(1));
    languageDestinations.forEach(([link, base]) => link.setAttribute("href", base + (valid ? fragment : "")));
  }
  if (languageLinks.length) {
    syncLanguageLinks();
    window.addEventListener("hashchange", syncLanguageLinks);
    window.addEventListener("popstate", syncLanguageLinks);
  }

  if (toggle && nav) {
    function setOpen(open, restoreFocus = false) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      nav.inert = mobile.matches && !open;
      document.body.classList.toggle("nav-open", mobile.matches && open);
      if (restoreFocus) toggle.focus();
    }
    function syncViewport() {
      toggle.hidden = !mobile.matches;
      setOpen(false);
    }
    document.documentElement.classList.add("has-js");
    syncViewport();
    mobile.addEventListener("change", syncViewport);
    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false, true);
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) setOpen(false);
    });
    nav.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener("click", () => setOpen(false));
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", event => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey ||
          event.ctrlKey || event.shiftKey || event.altKey) return;
      const hash = anchor.getAttribute("href");
      if (!hash || hash === "#") return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
      target.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });
      window.history.pushState(null, "", hash);
      if (languageLinks.length) syncLanguageLinks();
    });
  });

  let scheduled = false;
  const updateHeader = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
    scheduled = false;
  };
  updateHeader();
  window.addEventListener("scroll", () => {
    if (!scheduled) {
      scheduled = true;
      window.requestAnimationFrame(updateHeader);
    }
  }, { passive: true });
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
