async function updateCounter() {
  try {
    const res = await fetch("https://sg47t70dpa.execute-api.us-east-1.amazonaws.com/Prod/visitor");
    const data = await res.json();
    const el = document.getElementById("counter");
    if (el) el.textContent = data.count;
  } catch {
    const el = document.getElementById("counter");
    if (el) el.textContent = "unavailable";
  }
}
updateCounter();
