/* =========================================================
   风易 · 全站 JS
   当前只负责：
   1. 公共 Header / Footer 注入
   2. Posts / 分类页读取 poems.json
   3. 明暗模式切换
   ========================================================= */

document.addEventListener("DOMContentLoaded", async () => {
  const base = document.body.dataset.base || "./";

  await loadPartials(base);
  setupTheme();
  setCurrentYear();
  await loadPoemData(base);
});

async function loadPartials(base) {
  const targets = [
    ["site-header", "partials/header.html"],
    ["site-footer", "partials/footer.html"]
  ];

  for (const [id, file] of targets) {
    const element = document.getElementById(id);
    if (!element) continue;

    try {
      const response = await fetch(base + file);
      if (!response.ok) throw new Error(`无法加载 ${file}`);
      const html = await response.text();
      element.innerHTML = html.replaceAll("{{BASE}}", base);
    } catch (error) {
      console.error(error);
    }
  }
}

function setupTheme() {
  const savedTheme = localStorage.getItem("fengyi-theme");
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (systemDark ? "dark" : "light");

  applyTheme(theme);

  const button = document.querySelector(".theme-toggle");
  if (!button) return;

  button.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("fengyi-theme", next);
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
}

function setCurrentYear() {
  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();
}

async function loadPoemData(base) {
  const postList = document.getElementById("post-list");
  const categoryList = document.getElementById("category-list");

  if (!postList && !categoryList) return;

  try {
    const response = await fetch(base + "data/poems.json");
    if (!response.ok) throw new Error("无法加载 poems.json");

    const poems = await response.json();

    if (postList) renderPosts(postList, poems);
    if (categoryList) renderCategories(categoryList, poems);
  } catch (error) {
    console.error(error);

    const target = postList || categoryList;
    if (target) {
      target.innerHTML = "<p class='loading'>作品数据暂时无法读取。</p>";
    }
  }
}

function renderPosts(container, poems) {
  const sorted = [...poems].sort((a, b) => b.date.localeCompare(a.date));
  const groups = new Map();

  for (const poem of sorted) {
    const year = poem.date.slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(poem);
  }

  container.innerHTML = "";

  for (const [year, items] of groups) {
    const yearElement = document.createElement("div");
    yearElement.className = "post-year";
    yearElement.textContent = year;
    container.appendChild(yearElement);

    for (const poem of items) {
      const item = document.createElement("a");
      item.className = "post-item";
      item.href = poem.url;

      item.innerHTML = `
        <time class="post-date" datetime="${poem.date}">
          ${formatDate(poem.date)}
        </time>
        <span class="post-title">${escapeHTML(poem.title)}</span>
        <span class="post-category">${escapeHTML(poem.category)}</span>
      `;

      container.appendChild(item);
    }
  }
}

function renderCategories(container, poems) {
  const counts = new Map();

  for (const poem of poems) {
    counts.set(poem.category, (counts.get(poem.category) || 0) + 1);
  }

  container.innerHTML = "";

  [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], "zh-CN"))
    .forEach(([category, count]) => {
      const item = document.createElement("a");
      item.className = "category-item";
      item.href = `posts.html?category=${encodeURIComponent(category)}`;

      item.innerHTML = `
        <span class="category-name">${escapeHTML(category)}</span>
        <span class="category-count">${count} 篇作品</span>
      `;

      container.appendChild(item);
    });
}

function formatDate(dateString) {
  const parts = dateString.split("-");
  return `${parts[1]}.${parts[2]}`;
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

window.addEventListener("load", function(){
    const loader = document.getElementById("page-loader");
    if(loader){
        loader.style.opacity = "0";
        setTimeout(function(){
            loader.remove();
        },600);
    }
});
