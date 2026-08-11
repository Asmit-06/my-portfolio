const body = document.body;
const navbar = document.querySelector("#navbar");
const menuToggle = document.querySelector(".menu-toggle");
const siteMenu = document.querySelector("#site-menu");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];
const themeToggle = document.querySelector(".theme-toggle");
const scrollProgress = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");
const toast = document.querySelector(".toast");
const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
const finePointer = window.matchMedia?.("(pointer: fine)")?.matches ?? false;

/* Mobile navigation */
const setMenuState = (isOpen) => {
  if (!menuToggle || !siteMenu) return;

  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  siteMenu.classList.toggle("is-open", isOpen);
  body.classList.toggle("menu-open", isOpen);
};

menuToggle?.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  setMenuState(!isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => setMenuState(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenuState(false);
});

/* Dark/light mode with local persistence */
const updateThemeToggle = (theme) => {
  if (!themeToggle) return;

  const isLight = theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
  themeToggle.querySelector(".theme-toggle__label").textContent = isLight ? "Dark mode" : "Light mode";
  themeToggle.querySelector(".theme-toggle__icon").textContent = isLight ? "◑" : "☼";
};

const applyTheme = (theme, persist = false) => {
  if (theme === "light") {
    body.dataset.theme = "light";
  } else {
    delete body.dataset.theme;
  }

  updateThemeToggle(theme);

  if (persist) {
    try {
      localStorage.setItem("asmit-portfolio-theme", theme);
    } catch {
      // Storage can be unavailable in privacy-focused browser modes.
    }
  }
};

let savedTheme = "dark";
try {
  savedTheme = localStorage.getItem("asmit-portfolio-theme") || "dark";
} catch {
  savedTheme = "dark";
}

applyTheme(savedTheme);
themeToggle?.addEventListener("click", () => {
  const nextTheme = body.dataset.theme === "light" ? "dark" : "light";
  applyTheme(nextTheme, true);
});

/* Scroll state, progress bar, and back-to-top button */
const updateScrollUi = () => {
  navbar?.classList.toggle("is-scrolled", window.scrollY > 12);

  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
  scrollProgress?.style.setProperty("--scroll-progress", `${progress}%`);

  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
  backToTop?.classList.toggle("is-visible", window.scrollY > window.innerHeight * 0.7);
};

updateScrollUi();
window.addEventListener("scroll", updateScrollUi, { passive: true });

backToTop?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
});

/* Scroll reveal */
const revealItems = document.querySelectorAll("[data-reveal]");

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

/* Active navigation link */
if ("IntersectionObserver" in window && sections.length) {
  const activeSectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", isCurrent);
        });
      });
    },
    { rootMargin: "-35% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach((section) => activeSectionObserver.observe(section));
}

/* Ambient cursor and spotlight */
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");

if (finePointer && !reduceMotion) {
  body.classList.add("has-pointer");

  window.addEventListener("pointermove", (event) => {
    body.style.setProperty("--cursor-x", `${event.clientX}px`);
    body.style.setProperty("--cursor-y", `${event.clientY}px`);
    body.style.setProperty("--spotlight-x", `${event.clientX}px`);
    body.style.setProperty("--spotlight-y", `${event.clientY}px`);
  });

  document.addEventListener("pointerover", (event) => {
    if (event.target.closest("a, button, [data-tilt]")) {
      cursorRing?.classList.add("is-hovering");
    }
  });

  document.addEventListener("pointerout", (event) => {
    if (event.target.closest("a, button, [data-tilt]") && !event.relatedTarget?.closest?.("a, button, [data-tilt]")) {
      cursorRing?.classList.remove("is-hovering");
    }
  });

  document.addEventListener("pointerdown", () => cursorRing?.classList.add("is-clicking"));
  document.addEventListener("pointerup", () => cursorRing?.classList.remove("is-clicking"));
}

/* Magnetic buttons */
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-magnetic]").forEach((element) => {
    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const strength = element.classList.contains("contact-email") ? 0.12 : 0.2;
      const x = (event.clientX - (bounds.left + bounds.width / 2)) * strength;
      const y = (event.clientY - (bounds.top + bounds.height / 2)) * strength;

      element.style.setProperty("--mag-x", `${x}px`);
      element.style.setProperty("--mag-y", `${y}px`);
    });

    element.addEventListener("pointerleave", () => {
      element.style.setProperty("--mag-x", "0px");
      element.style.setProperty("--mag-y", "0px");
    });
  });
}

/* Lightweight 3D tilt for the hero and project previews */
if (finePointer && !reduceMotion) {
  document.querySelectorAll("[data-tilt]").forEach((element) => {
    const maxRotation = Number(element.dataset.tilt) || 6;

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      const rotateX = y * maxRotation * -1;
      const rotateY = x * maxRotation;

      element.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    });

    element.addEventListener("pointerleave", () => {
      element.style.removeProperty("transform");
    });
  });
}

/* Rotating learning focus */
const rotatingWord = document.querySelector("[data-rotating-word]");
const rotatingWords = ["machine learning", "Three.js", "advanced DSA", "better UX"];
let rotatingIndex = 0;

if (rotatingWord && !reduceMotion) {
  window.setInterval(() => {
    rotatingWord.classList.add("is-changing");

    window.setTimeout(() => {
      rotatingIndex = (rotatingIndex + 1) % rotatingWords.length;
      rotatingWord.textContent = rotatingWords[rotatingIndex];
      rotatingWord.classList.remove("is-changing");
    }, 170);
  }, 2600);
}

/* Project quick-view dialog */
const projectDialog = document.querySelector("#project-dialog");
const dialogTitle = document.querySelector("#dialog-title");
const dialogKicker = document.querySelector("#dialog-kicker");
const dialogDescription = document.querySelector("#dialog-description");
const dialogTags = document.querySelector("#dialog-tags");
const dialogGithub = document.querySelector("#dialog-github");
const dialogLive = document.querySelector("#dialog-live");
const dialogClose = document.querySelector(".dialog-close");

const projectData = {
  expense: {
    kicker: "01 / Full-stack web development",
    title: "Expense Tracker Web Application",
    description: "A full-stack finance dashboard designed to make everyday spending easier to understand. Users can track expenses, review spending patterns, and manage their finances through a focused interface.",
    tags: ["MERN Stack", "React", "Node.js", "Express.js", "MongoDB", "REST APIs"],
    github: "https://github.com/Asmit-06/Expense-Tracker",
    live: "",
  },
  "two-good": {
    kicker: "02 / Animated landing page",
    title: "Two Good Co Website Landing Page",
    description: "A responsive landing page created to practice expressive frontend work, smooth transitions, and motion-led storytelling with React, Tailwind CSS, and GSAP.",
    tags: ["React", "Tailwind CSS", "GSAP", "Responsive UI", "Animations"],
    github: "https://github.com/Asmit-06/Two-Good-Co-Website",
    live: "https://two-good-co-website-508yv65si-asmitchhotaray-6883s-projects.vercel.app",
  },
};

const openProjectDialog = (projectKey) => {
  const project = projectData[projectKey];
  if (!project || !projectDialog) return;

  dialogKicker.textContent = project.kicker;
  dialogTitle.textContent = project.title;
  dialogDescription.textContent = project.description;
  dialogTags.innerHTML = project.tags.map((tag) => `<span>${tag}</span>`).join("");
  dialogGithub.href = project.github;

  if (project.live) {
    dialogLive.hidden = false;
    dialogLive.href = project.live;
  } else {
    dialogLive.hidden = true;
    dialogLive.removeAttribute("href");
  }

  projectDialog.showModal();
};

document.querySelectorAll("[data-project]").forEach((trigger) => {
  trigger.addEventListener("click", () => openProjectDialog(trigger.dataset.project));
});

dialogClose?.addEventListener("click", () => projectDialog?.close());
projectDialog?.addEventListener("click", (event) => {
  if (event.target === projectDialog) projectDialog.close();
});

/* Copy-to-clipboard contact action */
let toastTimer;
const showToast = (message) => {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
};

document.querySelector("[data-copy-email]")?.addEventListener("click", async (event) => {
  const button = event.currentTarget;
  const email = button.dataset.copyEmail;

  try {
    await navigator.clipboard.writeText(email);
    button.childNodes[0].nodeValue = "Copied ";
    button.querySelector("span").textContent = "✓";
    showToast("Email address copied to your clipboard.");
  } catch {
    showToast(email);
  }

  window.setTimeout(() => {
    button.childNodes[0].nodeValue = "Copy email ";
    button.querySelector("span").textContent = "⧉";
  }, 2400);
});

document.querySelector("#year").textContent = new Date().getFullYear();
