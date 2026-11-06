const articles = Array.from(document.querySelectorAll("[data-project]"));
const cards = Array.from(document.querySelectorAll(".card[data-key]"));
const keys = articles.map((article) => article.id);
const heroImage = document.querySelector("#hero-image");
const detail = document.querySelector("#detail");
let currentKey;

function showProject(key) {
  const selected = articles.find((article) => article.id === key);
  if (!selected || key === currentKey) return;
  for (const article of articles) {
    if (article !== selected) {
      for (const player of article.querySelectorAll("video,audio")) player.pause();
    }
    article.hidden = article !== selected;
  }
  currentKey = key;
  const info = selected.dataset;
  heroImage.src = info.picture;
  heroImage.alt = info.alt;
  heroImage.parentElement.dataset.scene = key;
  document.querySelector("#hero-status").textContent = info.state;
  document.querySelector("#hero-type").textContent = info.type;
  document.querySelector("#hero-title").textContent = selected.querySelector("h2").textContent;
  document.querySelector("#hero-summary").textContent = info.summary;
  for (const card of cards) {
    if (card.dataset.key === key) card.setAttribute("aria-current", "true");
    else card.removeAttribute("aria-current");
  }
}

function selectProject(key) {
  if (key === currentKey) return;
  history.pushState({ project: key }, "", "#" + key);
  showProject(key);
}

function restoreProject() {
  const hash = location.hash.slice(1);
  const key = keys.includes(hash) ? hash : history.state?.project;
  showProject(keys.includes(key) ? key : keys[0]);
}

for (const card of cards) {
  card.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectProject(card.dataset.key);
    detail.scrollIntoView({ block: "start" });
    detail.focus({ preventScroll: true });
  });
}
function step(direction) {
  selectProject(keys[(keys.indexOf(currentKey) + direction + keys.length) % keys.length]);
}
document.querySelector("#previous").addEventListener("click", () => step(-1));
document.querySelector("#next").addEventListener("click", () => step(1));
for (const link of document.querySelectorAll(
  'a[href="#detail"],a[href="#projects"],a[href="#top"]',
)) {
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const target = document.getElementById(link.hash.slice(1));
    target.scrollIntoView({ block: "start" });
    target.focus({ preventScroll: true });
  });
}
window.addEventListener("popstate", restoreProject);
restoreProject();

const viewer = document.querySelector("#photo-viewer");
const expandedPhoto = document.querySelector("#expanded-photo");
let activePhoto;

function displayPhoto(link) {
  activePhoto = link;
  expandedPhoto.src = link.href;
  expandedPhoto.alt = link.querySelector("img").alt;
  const photos = Array.from(link.parentElement.querySelectorAll("a"));
  document.querySelector("#photo-position").textContent =
    (photos.indexOf(link) + 1) + " / " + photos.length;
  document.querySelector("#photo-caption").textContent = link.querySelector("span").textContent;
}

function movePhoto(direction) {
  const grid = activePhoto.parentElement;
  const next = direction > 0
    ? activePhoto.nextElementSibling || grid.firstElementChild
    : activePhoto.previousElementSibling || grid.lastElementChild;
  displayPhoto(next);
}

for (const link of document.querySelectorAll(".photo-grid a")) {
  if (viewer.showModal) link.setAttribute("aria-haspopup", "dialog");
  link.addEventListener("click", (event) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !viewer.showModal) return;
    event.preventDefault();
    displayPhoto(link);
    viewer.showModal();
  });
}
document.querySelector("#previous-photo").addEventListener("click", () => movePhoto(-1));
document.querySelector("#next-photo").addEventListener("click", () => movePhoto(1));
document.querySelector("#close-photo").addEventListener("click", () => viewer.close());
viewer.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    movePhoto(event.key === "ArrowLeft" ? -1 : 1);
  }
});
window.addEventListener("popstate", () => {
  if (viewer.open) viewer.close();
});
