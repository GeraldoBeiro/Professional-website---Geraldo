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

  if (sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
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

  /* =========================
     Featured project switcher (projects.html)
     - Click a project card -> update Featured section
     - Ignore clicks on buttons/links inside the card
  ========================= */

  const featuredEl = document.getElementById("featured");
  const projectCards = document.querySelectorAll(".project");

  // Only run on pages that actually have Featured + projects grid
  if (featuredEl && projectCards.length) {
    const featuredTitle = document.getElementById("featuredTitle");
    const featuredDesc = document.getElementById("featuredDesc");
    const featuredImg = document.getElementById("featuredImg");
    const featuredChips = document.getElementById("featuredChips");
    const featuredBullets = document.getElementById("featuredBullets");

    const featuredRepo = document.getElementById("featuredRepo");
    const featuredRelease = document.getElementById("featuredRelease");
    const featuredLoadJobs = document.getElementById("featuredLoadJobs");
    const jobsPanel = document.getElementById("jobsPanel");

    projectCards.forEach((card) => {
      card.addEventListener("click", (e) => {
        // If user clicked a link/button inside the card, don't hijack it
        const clickedInteractive = e.target.closest("a, button");
        if (clickedInteractive) return;

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
        const release = card.dataset.release || "#";

        // Update Featured text
        if (featuredTitle) featuredTitle.textContent = title;
        if (featuredDesc) featuredDesc.textContent = desc;

        // Update Featured image
        if (featuredImg && img) {
          featuredImg.src = img;
          featuredImg.alt = title || "Featured project image";
        }

        // Update Featured chips
        if (featuredChips) {
          featuredChips.innerHTML = "";
          chips.forEach((c) => {
            const span = document.createElement("span");
            span.className = "chip";
            span.textContent = c;
            featuredChips.appendChild(span);
          });
        }

        // Update Featured bullets
        if (featuredBullets) {
          featuredBullets.innerHTML = "";
          bullets.forEach((b) => {
            const li = document.createElement("li");
            li.textContent = b;
            featuredBullets.appendChild(li);
          });
        }

        // Toggle CTA buttons + jobs panel
        if (featuredRepo && featuredRelease && featuredLoadJobs && jobsPanel) {
          if (isFirebaseProject) {
            // Firebase: show Load Jobs + panel
            featuredRepo.style.display = "none";
            featuredRelease.style.display = "none";
            featuredLoadJobs.style.display = "inline-block";
            jobsPanel.style.display = "block";
          } else {
            // Other projects: show Repo + Download, hide jobs UI
            featuredRepo.style.display = "inline-block";
            featuredRelease.style.display = "inline-block";
            featuredLoadJobs.style.display = "none";
            jobsPanel.style.display = "none";

            // Only set links for non-Firebase projects
            featuredRepo.href = repo;
            featuredRelease.href = release;
          }
        }

        // Smooth scroll to featured
        featuredEl.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    // =========================
    // Firebase "Load jobs" button (public GET)
    // =========================
    const API_BASE = "https://us-central1-cloudjobtrackerapi.cloudfunctions.net/api";

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
})();
