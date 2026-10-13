/* Vibe Coding 小程序全书 — 站点逻辑（零依赖） */
(function () {
  "use strict";

  var DATA = window.BOOK_DATA;
  var chapters = DATA.chapters;
  var byId = {};
  var byFile = {};
  chapters.forEach(function (c) {
    byId[c.id] = c;
    byFile[c.file] = c;
  });

  var tocList = document.getElementById("toc-list");
  var heroEl = document.getElementById("hero");
  var contentEl = document.getElementById("content");
  var navEl = document.getElementById("chapter-nav");
  var maskEl = document.getElementById("toc-mask");
  var tocEl = document.getElementById("toc");
  var backTop = document.getElementById("back-top");

  /* ---------- 主题 ---------- */
  var themeToggle = document.getElementById("theme-toggle");
  var iconSun = document.getElementById("icon-sun");
  var iconMoon = document.getElementById("icon-moon");

  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    iconSun.style.display = t === "dark" ? "block" : "none";
    iconMoon.style.display = t === "dark" ? "none" : "block";
    try { localStorage.setItem("vc-book-theme", t); } catch (e) {}
  }
  var savedTheme = "light";
  try {
    savedTheme = localStorage.getItem("vc-book-theme") ||
      (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch (e) {}
  applyTheme(savedTheme);
  themeToggle.addEventListener("click", function () {
    applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
  });

  /* ---------- 路由 ---------- */
  function currentId() {
    var h = location.hash.replace(/^#\/?/, "");
    return byId[h] ? h : "intro";
  }

  function renderToc(activeId) {
    tocList.innerHTML = "";
    chapters.forEach(function (c) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = "#/" + c.id;
      a.textContent = c.short;
      if (c.id === activeId) a.className = "active";
      li.appendChild(a);
      tocList.appendChild(li);
    });
  }

  function renderHero(show) {
    if (!show) { heroEl.innerHTML = ""; heroEl.style.display = "none"; return; }
    var totalWords = chapters.reduce(function (s, c) { return s + c.words; }, 0);
    heroEl.style.display = "block";
    heroEl.innerHTML =
      '<h1>' + esc(DATA.title) + "</h1>" +
      '<p class="hero-sub">' + esc(DATA.subtitle) + "</p>" +
      '<div class="hero-meta">' +
      "<span>" + chapters.length + " 节 · 含 2 个速查附录</span>" +
      "<span>全文约 " + Math.round(totalWords / 1000) + "k 字</span>" +
      "<span>零基础可读</span>" +
      "<span>更新于 " + esc(DATA.updated) + "</span>" +
      "</div>" +
      '<div class="hero-cta">' +
      '<a class="btn btn-primary" href="#/ch1">开始阅读' +
      '<svg class="ic ic-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>' +
      '<a class="btn" href="' + esc(DATA.repo) + '" target="_blank" rel="noopener">在 GitHub 查看仓库</a>' +
      "</div>";
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function renderChapterNav(idx) {
    navEl.innerHTML = "";
    if (idx <= 0 && idx >= chapters.length - 1) return;
    var prev = chapters[idx - 1];
    var next = chapters[idx + 1];
    if (prev) {
      navEl.innerHTML += '<a href="#/' + prev.id + '"><div class="cn-dir">上一章</div><div class="cn-title">' + esc(prev.short) + "</div></a>";
    } else {
      navEl.innerHTML += "<span></span>";
    }
    if (next) {
      navEl.innerHTML += '<a class="cn-next" href="#/' + next.id + '"><div class="cn-dir">下一章</div><div class="cn-title">' + esc(next.short) + "</div></a>";
    }
  }

  function buildChapterToc() {
    var heads = contentEl.querySelectorAll("h2, h3");
    if (!heads.length) return;
    var box = document.createElement("details");
    box.className = "chapter-toc";
    var sum = document.createElement("summary");
    sum.textContent = "本章目录";
    box.appendChild(sum);
    var ul = document.createElement("ul");
    heads.forEach(function (h, i) {
      if (!h.id) h.id = "sec-" + i;
      var li = document.createElement("li");
      if (h.tagName === "H3") li.style.paddingLeft = "16px";
      var a = document.createElement("a");
      a.href = "#" + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      ul.appendChild(li);
    });
    box.appendChild(ul);
    contentEl.insertBefore(box, contentEl.firstChild);
  }

  function stripFooterNav() {
    // 去掉 Markdown 自带的上下章段落（页面已有 styled 导航）
    var ps = contentEl.querySelectorAll("p");
    for (var i = ps.length - 1; i >= 0; i--) {
      var t = ps[i].textContent || "";
      if (t.indexOf("上一章") !== -1 || t.indexOf("下一章") !== -1) {
        ps[i].remove();
        return;
      }
    }
  }

  function render() {
    var id = currentId();
    var idx = chapters.findIndex(function (c) { return c.id === id; });
    if (idx < 0) idx = 0;
    var ch = chapters[idx];

    renderToc(ch.id);
    renderHero(ch.id === "intro");
    contentEl.innerHTML = ch.html;
    stripFooterNav();
    buildChapterToc();
    renderChapterNav(idx);

    // 章题（内容里的 H1 之外，加一个小眉题）
    var h1 = contentEl.querySelector("h1");
    if (h1 && ch.id !== "intro") {
      var kick = document.createElement("div");
      kick.className = "chapter-kicker";
      kick.textContent = "第 " + (idx) + " 章 / 共 " + chapters.length + " 章";
      h1.parentNode.insertBefore(kick, h1);
    }

    document.title = ch.title + " · " + DATA.title;
    window.scrollTo(0, 0);
    closeDrawer();
  }

  /* ---------- Markdown 相对链接 → 站内路由 ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var m = href.match(/([^/]+)\.md\s*$/);
    if (m && byFile[m[1] + ".md"]) {
      e.preventDefault();
      location.hash = "#/" + byFile[m[1] + ".md"].id;
    }
  });

  /* ---------- 搜索 ---------- */
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");

  function snippet(text, q) {
    var i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i < 0) i = 0;
    var start = Math.max(0, i - 30);
    var end = Math.min(text.length, i + q.length + 60);
    var s = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
    var re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    return esc(s).replace(re, function (mm) { return "<mark>" + mm + "</mark>"; });
  }

  function doSearch() {
    var q = input.value.trim();
    if (!q) { results.classList.remove("open"); results.innerHTML = ""; return; }
    var hits = [];
    chapters.forEach(function (c) {
      var i = c.text.toLowerCase().indexOf(q.toLowerCase());
      if (i >= 0) hits.push({ c: c, i: i });
    });
    if (!hits.length) {
      results.innerHTML = '<div class="sr-empty">没有匹配的内容，换个关键词试试。</div>';
    } else {
      results.innerHTML = hits.slice(0, 8).map(function (h) {
        return '<a class="sr-item" href="#/' + h.c.id + '">' +
          '<div class="sr-chapter">' + esc(h.c.short) + "</div>" +
          '<div class="sr-snippet">' + snippet(h.c.text.slice(Math.max(0, h.i - 30), h.i + 120), q) + "</div></a>";
      }).join("");
    }
    results.classList.add("open");
  }

  input.addEventListener("input", doSearch);
  input.addEventListener("focus", doSearch);
  input.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { input.value = ""; results.classList.remove("open"); input.blur(); }
    if (e.key === "Enter") {
      var first = results.querySelector(".sr-item");
      if (first) { location.hash = first.getAttribute("href"); results.classList.remove("open"); input.blur(); }
    }
  });
  results.addEventListener("click", function (e) {
    if (e.target.closest(".sr-item")) { results.classList.remove("open"); input.value = ""; }
  });
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".search-wrap")) results.classList.remove("open");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input) {
      e.preventDefault();
      input.focus();
    }
  });

  /* ---------- 移动端抽屉 ---------- */
  document.getElementById("hamburger").addEventListener("click", function () {
    tocEl.classList.add("open");
    maskEl.classList.add("open");
  });
  maskEl.addEventListener("click", closeDrawer);
  function closeDrawer() {
    tocEl.classList.remove("open");
    maskEl.classList.remove("open");
  }

  /* ---------- 回到顶部 ---------- */
  window.addEventListener("scroll", function () {
    backTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });
  backTop.addEventListener("click", function () { window.scrollTo(0, 0); });

  /* ---------- 页脚 ---------- */
  document.getElementById("footer-updated").textContent = DATA.updated;
  document.getElementById("footer-license").textContent = "内容采用 " + DATA.license + " 许可";

  /* ---------- 启动 ---------- */
  window.addEventListener("hashchange", render);
  render();
})();
