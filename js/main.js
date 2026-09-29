/* =========================================================
   风易 · 全站 JS

   当前负责：
   1. 明暗模式切换
   2. 页脚年份显示
   3. Posts / 分类页读取 poems.json

   Header / Footer 已改为每个页面直接写入
   ========================================================= */


document.addEventListener("DOMContentLoaded", async () => {

  setupTheme();

  setCurrentYear();

  await loadPoemData();

});



/* =========================
   明暗模式
   ========================= */

function setupTheme() {

  const savedTheme = localStorage.getItem("fengyi-theme");

  const systemDark =
    window.matchMedia("(prefers-color-scheme: dark)").matches;


  const theme =
    savedTheme || (systemDark ? "dark" : "light");


  applyTheme(theme);


  const button = document.querySelector(".theme-toggle");


  if (!button) return;


  button.addEventListener("click", () => {

    const current =
      document.documentElement.dataset.theme;


    const next =
      current === "dark" ? "light" : "dark";


    applyTheme(next);


    localStorage.setItem(
      "fengyi-theme",
      next
    );

  });

}



function applyTheme(theme) {

  document.documentElement.dataset.theme = theme;

}



/* =========================
   年份
   ========================= */

function setCurrentYear() {

  const year =
    document.getElementById("current-year");


  if (year) {

    year.textContent =
      new Date().getFullYear();

  }

}



/* =========================
   读取诗歌数据
   ========================= */

async function loadPoemData() {


  const postList =
    document.getElementById("post-list");


  const categoryList =
    document.getElementById("category-list");



  if (!postList && !categoryList) return;



  try {


    const response =
      await fetch("data/poems.json");



    if (!response.ok) {

      throw new Error(
        "无法加载 poems.json"
      );

    }



    let poems =
      await response.json();



    /*
      只有 posts.html 进行分类筛选
      category.html 永远显示全部分类
    */

if (postList) { 

  const params = 
    new URLSearchParams(window.location.search); 


  const category = 
    params.get("category"); 


  const title =
    document.getElementById("posts-title");


  const description =
    document.getElementById("posts-description");


  if (category) { 


    poems =
      poems.filter( 
        poem => poem.category === category 
      );


    // 修改页面标题
    document.title =
      `${category} · 风易`;


    // 修改页面大标题
    if (title) {

      title.textContent =
        category;

    }


    // 修改描述
    if (description) {

      description.textContent =
        "该分类下的作品。";

    }


  } else {


    // 普通诗集页面
    document.title =
      "诗集 · 风易";


    if (title) {

      title.textContent =
        "詩集";

    }


    if (description) {

      description.textContent =
        "按创作时间排列的作品。";

    }

  }


  renderPosts(
    postList,
    poems
  );

}



    if (categoryList) {

      renderCategories(
        categoryList,
        poems
      );

    }



  } catch (error) {


    console.error(error);



    const target =
      postList || categoryList;



    if (target) {

      target.innerHTML =
        "<p class='loading'>作品数据暂时无法读取。</p>";

    }

  }

}



/* =========================
   Posts 页面
   ========================= */

function renderPosts(container, poems) {


  const sorted =
    [...poems].sort(
      (a, b) =>
        b.date.localeCompare(a.date)
    );


  const groups =
    new Map();



  for (const poem of sorted) {


    const year =
      poem.date.slice(0, 4);



    if (!groups.has(year)) {

      groups.set(year, []);

    }


    groups.get(year).push(poem);

  }



  container.innerHTML = "";



  for (const [year, items] of groups) {


    const yearElement =
      document.createElement("div");


    yearElement.className =
      "post-year";


    yearElement.textContent =
      year;



    container.appendChild(
      yearElement
    );



    for (const poem of items) {


      const item =
        document.createElement("a");



      item.className =
        "post-item";


      item.href =
        poem.url;



      item.innerHTML = `

        <time class="post-date" datetime="${poem.date}">
          ${formatDate(poem.date)}
        </time>

        <span class="post-title">
          ${escapeHTML(poem.title)}
        </span>

        <span class="post-category">
          ${escapeHTML(poem.category)}
        </span>

      `;



      container.appendChild(item);

    }

  }

}



/* =========================
   分类页面
   ========================= */

function renderCategories(container, poems) {


  const counts =
    new Map();



  for (const poem of poems) {


    counts.set(

      poem.category,

      (counts.get(poem.category) || 0) + 1

    );

  }



  container.innerHTML = "";



  [...counts.entries()]

    .sort(
      (a, b) =>
        a[0].localeCompare(
          b[0],
          "zh-CN"
        )
    )


    .forEach(([category, count]) => {


      const item =
        document.createElement("a");



      item.className =
        "category-item";



      item.href =
        `posts.html?category=${encodeURIComponent(category)}`;



      item.innerHTML = `

        <span class="category-name">
          ${escapeHTML(category)}
        </span>

        <span class="category-count">
          ${count} 篇作品
        </span>

      `;



      container.appendChild(item);


    });

}



/* =========================
   工具函数
   ========================= */

function formatDate(dateString) {

  const parts =
    dateString.split("-");


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
