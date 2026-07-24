const SEQUENCE = ["a", "a", "b", "b", "a"];
const IDLE_RESET_MS = 5000;

const marks = document.querySelectorAll("[data-mark]");
const link = document.querySelector("[data-mark-link]");

let taps = [];
let idleTimer = null;

function reset() {
  taps = [];
  clearTimeout(idleTimer);
}

// Longest run of trailing taps that matches the start of the sequence. A
// rolling comparison rather than a running counter, so a repeated mark still
// resolves: tapping a,a,a,b,b,a ends on a valid run instead of dead-ending.
function matchLength() {
  for (let k = Math.min(taps.length, SEQUENCE.length); k > 0; k--) {
    const tail = taps.slice(taps.length - k);
    if (tail.every((v, i) => v === SEQUENCE[i])) return k;
  }
  return 0;
}

function reveal() {
  reset();
  if (!link || !link.hidden) return;
  link.hidden = false;
  // Force a reflow so the opacity transition has a starting frame to run from.
  void link.offsetWidth;
  link.classList.add("is-shown");
}

marks.forEach((mark) => {
  mark.addEventListener("click", () => {
    taps.push(mark.dataset.mark);
    if (taps.length > SEQUENCE.length) taps.shift();

    const matched = matchLength();

    if (matched > 0) {
      mark.classList.add("is-lit");
      setTimeout(() => mark.classList.remove("is-lit"), 260);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(reset, IDLE_RESET_MS);
    }

    if (matched === SEQUENCE.length) reveal();
  });
});
