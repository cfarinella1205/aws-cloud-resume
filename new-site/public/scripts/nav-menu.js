// Phone menu sheet for Nav.astro. The toggle button is only displayed at
// <=640px, so on desktop none of this is reachable.
const nav = document.getElementById("site-nav");
const toggle = nav?.querySelector(".menu-toggle");

function setOpen(open) {
  if (!nav || !toggle) return;
  nav.toggleAttribute("data-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  const label = toggle.querySelector(".menu-label");
  if (label) label.textContent = open ? "Close" : "Menu";
}

toggle?.addEventListener("click", () => setOpen(!nav.hasAttribute("data-open")));

// Close on a tap outside the nav, on Escape, and when a link is followed
// (so the sheet isn't still open on back/forward cache restore).
document.addEventListener("click", (e) => {
  if (nav?.hasAttribute("data-open") && !nav.contains(e.target)) setOpen(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav?.hasAttribute("data-open")) {
    setOpen(false);
    toggle?.focus();
  }
});
nav?.querySelectorAll("#nav-links a").forEach((a) => a.addEventListener("click", () => setOpen(false)));
window.addEventListener("pageshow", () => setOpen(false));
