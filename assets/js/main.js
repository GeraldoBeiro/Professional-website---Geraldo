/* =========================
   main.js
   - Mobile nav toggle
   - Close nav on link click
   - Footer year
   - Optional: active section highlight (scroll spy)
   - Featured project switcher (projects.html)
   - Firebase Load Jobs (projects.html)
   - Cookie consent (simple)
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
    if (!navList || !toggleBtn) return;
    navList.classList.add("is-open");
    toggleBtn.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!navList || !toggleBtn) return;
    navList.classList.remove("is-open");
    toggleBtn.setAttribute("aria-expanded", "false");
  }

  function isMenuOpen() {
    return !!navList && navList.classList.contains("is-open");
  }

  if (toggleBtn && navList) {
    toggleBtn.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
      else openMenu();
    });

    navList.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches && target.matches("a.nav__link")) {
        closeMenu();
      }
    });

    document.addEventListener("click", (e) => {
      const target = e.target;
      if (!target) return;

      const clickedToggle = toggleBtn.contains(target);
      const clickedMenu = navList.contains(target);

      if (!clickedToggle && !clickedMenu && isMenuOpen()) {
        closeMenu();
      }
    });

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

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((en) => en.isIntersecting)
          .sort(
            (a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0)
          )[0];

        if (visible && visible.target && visible.target.id) {
          setActiveLink(visible.target.id);
        }
      },
      { root: null, threshold: [0.2, 0.35, 0.5, 0.65] }
    );

    sections.forEach((sec) => observer.observe(sec));
  }

  /* =========================
     Featured project switcher (projects.html)
  ========================= */

  const featuredEl = document.getElementById("featured");
  const projectCards = document.querySelectorAll(".project");

  function updateFeaturedFromCard(card) {
    if (!card) return;

    const featuredTitle = document.getElementById("featuredTitle");
    const featuredDesc = document.getElementById("featuredDesc");
    const featuredImg = document.getElementById("featuredImg");
    const featuredChips = document.getElementById("featuredChips");
    const featuredBullets = document.getElementById("featuredBullets");

    const featuredRepo = document.getElementById("featuredRepo");
    const featuredPrimary = document.getElementById("featuredPrimary");
    const featuredLoadJobs = document.getElementById("featuredLoadJobs");
    const jobsPanel = document.getElementById("jobsPanel");

    const title = card.dataset.title || "";
    const isFirebaseProject = title.toLowerCase().includes("firebase");

    const desc = card.dataset.desc || "";
    const img = card.dataset.img || "";

    const chips = (card.dataset.chips || "")
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean);

    const bullets = (card.dataset.bullets || "")
      .split("|")
      .map((x) => x.trim())
      .filter(Boolean);

    const repo = card.dataset.repo || "#";
    const primaryHref = card.dataset.primary || "#";
    const primaryLabel = card.dataset.primaryLabel || "View Demo";

    // Text
    if (featuredTitle) featuredTitle.textContent = title;
    if (featuredDesc) featuredDesc.textContent = desc;

    // Image
    if (featuredImg && img) {
      featuredImg.src = img;
      featuredImg.alt = title || "Featured project image";
    }

    // Chips
    if (featuredChips) {
      featuredChips.innerHTML = "";
      chips.forEach((c) => {
        const span = document.createElement("span");
        span.className = "chip";
        span.textContent = c;
        featuredChips.appendChild(span);
      });
    }

    // Bullets
    if (featuredBullets) {
      featuredBullets.innerHTML = "";
      bullets.forEach((b) => {
        const li = document.createElement("li");
        li.textContent = b;
        featuredBullets.appendChild(li);
      });
    }

    // CTA logic
    if (featuredRepo) {
      featuredRepo.href = repo;
      featuredRepo.style.display = isFirebaseProject ? "none" : "inline-flex";
    }

    if (featuredPrimary) {
      featuredPrimary.href = primaryHref;
      featuredPrimary.textContent = primaryLabel;
      featuredPrimary.style.display = isFirebaseProject ? "none" : "inline-flex";
    }

    if (featuredLoadJobs && jobsPanel) {
      if (isFirebaseProject) {
        featuredLoadJobs.style.display = "inline-flex";
        jobsPanel.style.display = "block";
      } else {
        featuredLoadJobs.style.display = "none";
        jobsPanel.style.display = "none";
      }
    }
  }

  if (featuredEl && projectCards.length) {
    // Load default project on page load (Gemini)
    const defaultCard =
      document.querySelector('.project[data-default="true"]') || projectCards[0];
    updateFeaturedFromCard(defaultCard);

    projectCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        const clickedInteractive = e.target.closest("a, button");
        if (clickedInteractive) return;

        updateFeaturedFromCard(card);
        featuredEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // Firebase Load Jobs button
    const featuredLoadJobs = document.getElementById("featuredLoadJobs");
    const API_BASE =
      "https://us-central1-cloudjobtrackerapi.cloudfunctions.net/api";

    if (featuredLoadJobs) {
      featuredLoadJobs.addEventListener("click", async () => {
        const statusEl = document.getElementById("jobsStatus");
        const listEl = document.getElementById("jobsList");

        if (!statusEl || !listEl) return;

        statusEl.textContent = "Loading jobs...";
        listEl.innerHTML = "";

        try {
          const res = await fetch(`${API_BASE}/jobs`);
          if (!res.ok) throw new Error(`Request failed (${res.status})`);

          const jobs = await res.json();
          statusEl.textContent = jobs.length
            ? `Loaded ${jobs.length} job(s).`
            : "No jobs found.";

          jobs.forEach((job) => {
            const item = document.createElement("div");
            item.style.marginBottom = "10px";
            item.innerHTML = `
              <strong>${job.title ?? "Untitled"}</strong><br/>
              <span>${job.description ?? ""}</span><br/>
              <small>Status: ${job.status ?? "n/a"}</small>
            `;
            listEl.appendChild(item);
          });
        } catch (err) {
          statusEl.textContent = "Failed to load jobs.";
          listEl.textContent = String(err);
        }
      });
    }
  }

  // =========================
  // Cookie consent (simple)
  // =========================
  const banner = document.getElementById("cookieBanner");
  const acceptBtn = document.getElementById("cookieAccept");
  const rejectBtn = document.getElementById("cookieReject");
  const prefsBtn = document.getElementById("cookiePrefsBtn");

  if (banner && acceptBtn && rejectBtn) {
    const KEY = "cookie_consent";

    if (localStorage.getItem(KEY)) banner.setAttribute("hidden", "");
    else banner.removeAttribute("hidden");

    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(KEY, "accepted");
      banner.setAttribute("hidden", "");
    });

    rejectBtn.addEventListener("click", () => {
      localStorage.setItem(KEY, "rejected");
      banner.setAttribute("hidden", "");
    });

    prefsBtn?.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      banner.removeAttribute("hidden");
    });
  }
  // =========================
// Simple hero carousel
// =========================
const carouselImages = document.querySelectorAll(".carousel__img");

if (carouselImages.length > 1) {
  let current = 0;

  setInterval(() => {
    carouselImages[current].classList.remove("is-active");
    current = (current + 1) % carouselImages.length;
    carouselImages[current].classList.add("is-active");
  }, 3500); // change every 3.5s
}

})();

