async function updateCounter() {
  const el = document.getElementById("counter");
  try {
    const res = await fetch("https://sg47t70dpa.execute-api.us-east-1.amazonaws.com/Prod/visitor");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    // Guard against a 200 whose body isn't the shape we expect.
    if (typeof data.count !== "number" && typeof data.count !== "string") throw new Error("bad payload");
    if (el) el.textContent = data.count;
  } catch {
    if (el) el.textContent = "unavailable";
  }
}
updateCounter();
