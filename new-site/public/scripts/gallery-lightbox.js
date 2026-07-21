const lb = document.getElementById("lightbox");
const lbMedia = document.getElementById("lb-media");
const lbTitle = document.getElementById("lb-title");
const lbText = document.getElementById("lb-text");
const lbPost = document.getElementById("lb-post");
let lastFocused = null;

function openLightbox(tile) {
  if (!lb || !lbMedia || !lbTitle || !lbText || !lbPost) return;
  lastFocused = tile;

  const title = tile.dataset.title ?? "";
  const caption = tile.dataset.caption ?? "";
  const src = tile.dataset.src ?? "";
  const post = tile.dataset.post ?? "";

  lbTitle.textContent = title;
  lbText.textContent = caption;

  if (src) {
    lbMedia.innerHTML = `<img src="${src}" alt="${title.replace(/"/g, "&quot;")}" />`;
  } else {
    lbMedia.innerHTML = `<span class="slot slot-lg" aria-hidden="true"><span>Image · 3:2</span></span>`;
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
}

function closeLightbox() {
  if (!lb) return;
  lb.hidden = true;
  document.body.style.overflow = "";
  if (lastFocused) lastFocused.focus();
}

document.querySelectorAll(".tile").forEach((tile) => {
  tile.addEventListener("click", () => openLightbox(tile));
});

lb?.querySelectorAll("[data-close]").forEach((el) => {
  el.addEventListener("click", closeLightbox);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lb && !lb.hidden) closeLightbox();
});
