const lb = document.getElementById("lightbox");
const lbMedia = document.getElementById("lb-media");
const lbTitle = document.getElementById("lb-title");
const lbText = document.getElementById("lb-text");
const lbPost = document.getElementById("lb-post");
let lastFocused = null;

function focusableElements() {
  if (!lb) return [];
  return Array.from(
    lb.querySelectorAll('button, [href], [tabindex]:not([tabindex="-1"])')
  ).filter((el) => !el.hidden && el.offsetParent !== null);
}

function trapFocus(e) {
  if (e.key !== "Tab" || !lb || lb.hidden) return;
  const focusable = focusableElements();
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function openLightbox(trigger) {
  if (!lb || !lbMedia || !lbTitle || !lbText || !lbPost) return;
  lastFocused = trigger;

  const title = trigger.dataset.title ?? "";
  const caption = trigger.dataset.caption ?? "";
  const src = trigger.dataset.src ?? "";
  const alt = trigger.dataset.alt ?? title;
  const post = trigger.dataset.post ?? "";

  lbTitle.textContent = title;
  lbText.textContent = caption;

  if (src) {
    const img = document.createElement("img");
    img.src = src;
    img.alt = alt;
    lbMedia.replaceChildren(img);
  } else {
    lbMedia.replaceChildren();
  }

  if (post) {
    lbPost.href = `/blog/${post}`;
    lbPost.hidden = false;
  } else {
    lbPost.hidden = true;
  }

  lb.hidden = false;
  document.body.style.overflow = "hidden";
  const closeBtn = lb.querySelector(".lightbox-close");
  if (closeBtn) closeBtn.focus();
  document.addEventListener("keydown", trapFocus);
}

function closeLightbox() {
  if (!lb) return;
  lb.hidden = true;
  document.body.style.overflow = "";
  document.removeEventListener("keydown", trapFocus);
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll(".lightbox-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => openLightbox(trigger));
});

lb?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lb && !lb.hidden) closeLightbox();
});

// Reveal animation: fade + small translate on first scroll into view,
// then stop watching. Skipped entirely under reduced motion — items are
// just shown immediately with no transition.
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealTargets = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => observer.observe(el));
}
