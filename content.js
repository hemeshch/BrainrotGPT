// Контейнер карточки
const CONTAINER_SELECTOR = ".flex.w-full.items-start.justify-between.text-start.flex-col";
const DATA_HOLDER_ATTR = "data-thinking-video-holder";
const VIDEO_SRC = chrome.runtime.getURL("img/video.mp4");

// Создаем видео: 400px, autoplay, loop, muted, с плавным появлением
function createVideo() {
  const v = document.createElement("video");
  v.src = VIDEO_SRC;
  v.autoplay = true;
  v.loop = true;
  v.muted = true;
  v.playsInline = true;
  v.setAttribute("muted", "");
  v.setAttribute("autoplay", "");
  v.setAttribute("loop", "");
  v.setAttribute("playsinline", "");
  v.preload = "metadata";

  // Размер и внешний вид
  v.style.width = "400px";
  v.style.height = "auto";
  v.style.display = "block";
  v.style.marginTop = "8px";

  // Эффект появления
  v.style.opacity = "0";
  v.style.transform = "translateY(4px)";
  v.style.transition = "opacity 240ms ease, transform 240ms ease";

  return v;
}

function fadeIn(el) {
  // Двойной requestAnimationFrame для корректного старта transition
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  });
}

function ensureHolder(column) {
  let holder = column.querySelector(`div[${DATA_HOLDER_ATTR}]`);
  if (holder) return holder;

  holder = document.createElement("div");
  holder.setAttribute(DATA_HOLDER_ATTR, "1");

  // Вставляем сразу после первой кнопки-заголовка
  const firstChild = column.firstElementChild;
  if (firstChild && firstChild.tagName === "BUTTON") {
    firstChild.after(holder);
  } else {
    column.appendChild(holder);
  }
  return holder;
}

function removeHolder(column) {
  const holder = column.querySelector(`div[${DATA_HOLDER_ATTR}]`);
  if (holder && holder.parentNode) holder.parentNode.removeChild(holder);
}

function updateColumn(column) {
  if (!column || !(column instanceof Element)) return;

  const loading = !!column.querySelector(".loading-shimmer");

  if (loading) {
    const holder = ensureHolder(column);
    if (!holder.querySelector("video")) {
      const v = createVideo();
      holder.replaceChildren(v);
      fadeIn(v);
    }
  } else {
    removeHolder(column);
  }
}

function initialScan() {
  document.querySelectorAll(CONTAINER_SELECTOR).forEach(updateColumn);
}

function observe() {
  const observer = new MutationObserver((mutations) => {
    const touched = new Set();

    for (const m of mutations) {
      const nodes = [];
      if (m.type === "childList") {
        m.addedNodes.forEach(n => nodes.push(n));
        m.removedNodes.forEach(n => nodes.push(n));
      } else if (m.type === "characterData" || m.type === "attributes") {
        nodes.push(m.target);
      }

      for (const n of nodes) {
        const el = n instanceof Text ? n.parentElement : n;
        if (!el) continue;

        let column = el.matches?.(CONTAINER_SELECTOR) ? el : el.closest?.(CONTAINER_SELECTOR);
        if (!column && el instanceof Element) {
          el.querySelectorAll?.(CONTAINER_SELECTOR).forEach(c => touched.add(c));
        } else if (column) {
          touched.add(column);
        }
      }
    }

    touched.forEach(updateColumn);
  });

  observer.observe(document.documentElement || document.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ["class", "style"]
  });
}

// Старт
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initialScan();
    observe();
  });
} else {
  initialScan();
  observe();
}