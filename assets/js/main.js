/* =========================
   main.js
   - Mobile nav toggle
   - Close nav on link click
   - Footer year
   - Optional: active section highlight (scroll spy)
========================= */

(function () {
  "use strict";

  // Footer year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile nav toggle
  const toggleBtn = document.querySelector(".nav__toggle");
  const navList = document.getElementById("navList");

  function openMenu() {
    navList.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    navList.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function isMenuOpen() {
    return navList.classList.contains("is-open");
  }

  if (toggleBtn && navList) {
    toggleBtn.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });

    // Close menu when clicking a nav link (mobile)
    navList.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches && target.matches("a.nav__link")) {
        closeMenu();
      }
    });

    // Close menu when clicking outside (mobile)
    document.addEventListener("click", (e) => {
      const target = e.target;

      const clickedToggle = toggleBtn.contains(target);
      const clickedMenu = navList.contains(target);

      if (!clickedToggle && !clickedMenu && isMenuOpen()) {
        closeMenu();
      }
    });

    // Close menu on ESC
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isMenuOpen()) closeMenu();
    });
  }

  // Optional: active section highlight (scroll spy)
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const sectionIds = navLinks
    .map((a) => a.getAttribute("href"))
    .filter((href) => href && href.startsWith("#"))
    .map((href) => href.slice(1));

  const sections = sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  function setActiveLink(activeId) {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href") || "";
      const isActive = href === `#${activeId}`;
      a.classList.toggle("is-active", isActive);
    });
  }

  // Add minimal active style if you want:
  // (You can also move this to CSS. Keeping JS-only won't break anything.)
  // We'll still toggle the class; you can add styling later.

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        // pick the most visible section
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

        if (visible && visible.target && visible.target.id) {
          setActiveLink(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
      }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
})();
