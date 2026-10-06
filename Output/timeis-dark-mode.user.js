// ==UserScript==
// @name         Time.is 深色模式（纯黑/纯白）
// @name:zh-CN   Time.is 深色模式（纯黑/纯白）
// @namespace    https://github.com/Minecraft365871/HeYiWei
// @version      1.2.1
// @description  Give time.is a pure black / pure white dark theme (palette similar to clock.qqhkx.com). Pure CSS overlay that appends a layer on top and never modifies the site's original stylesheets. Keeps the site's original red accent (#c35) and its branded accent colors (white popular-city chips .s1/.s2, purple quote section #quote). Two-state toggle button styled to match the site (serif + letter-spacing).
// @description:zh-CN 为 Time.is 添加深色模式。配色参考沉浸式时钟（clock.qqhkx.com）的纯黑/纯白风格：纯黑背景、纯白文字。保留 Time.is 原本的红色强调色（#c35）以及原站品牌色：热门城市块 .s1/.s2（白底黑字）、紫色引言区 #quote（保持紫色）。脚本仅追加一层 CSS 覆盖，不修改、不删除网站原有样式的任何规则，页面原始布局与排版保持不变。提供符合原站风格（衬线字体+字母间距）的双态切换按钮，偏好自动保存。
// @author       Minecraft365871
// @license      MIT
// @copyright    2026 Minecraft365871
// @match        *://time.is/*
// @match        *://*.time.is/*
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  /* ==========================================================================
   * Time.is 深色模式（纯黑 / 纯白）
   * --------------------------------------------------------------------------
   * 设计目标
   *  1. 深色配色参考 clock.qqhkx.com：纯黑背景、纯白文字，简洁高对比。
   *  2. 零修改网站原样式：所有规则都是“追加”的一层覆盖，只改颜色 / 边框 /
   *     阴影 / 滤镜，绝不动 display / float / 尺寸 / 间距等布局属性，
   *     也不 touch 网站自带的任何 CSS 文件。
   *  3. 保留 Time.is 原本的红色强调色（#c35）——即“原本的红色”保持不变，
   *     悬停红边、选中红块、错误提示等全部维持原样。
   *  3b. 同时保留原站的品牌色，让深色不至于“亮度爆炸”却依然舒适：
   *     - 热门城市块 .top_cities_cloud a.s1 / a.s2（原站白底黑字，如東京/洛杉矶/紐約）
   *     - 紫色引言区 section#quote（原站 #75a 紫底白字）
   *  4. 双态切换按钮（仅“深色 / 浅色”两态），衬线字体 + 字母间距，
   *     符合 Time.is 原站风格，偏好自动保存。
   * --------------------------------------------------------------------------
   * 配色
   *   背景（纯黑）     #000000
   *   前景（纯白）     #ffffff
   *   次要文字         #c8c8c8 / #999999
   *   边框 / 分隔线    #333333 / #2a2a2a
   *   红色强调（原站） #c35（不变）
   *   热门城市块       白底黑字（原站保留）
   *   引言区           紫色 #75a（原站保留）
   * ========================================================================== */

  var STORAGE_KEY = 'tiDarkMode'; // '1' = 深色, '0' = 浅色

  var CSS = /* css */ `
/* ---- 作用域类 html.ti-dark：全部规则追加，不动原 CSS ---------------- */
html.ti-dark body { background-color: #000000 !important; color: #ffffff !important; }
html.ti-dark { color-scheme: dark !important; }

/* 通用文字 */
html.ti-dark h1, html.ti-dark h2, html.ti-dark h3, html.ti-dark h4,
html.ti-dark h5, html.ti-dark h6, html.ti-dark label, html.ti-dark legend {
  color: #ffffff !important;
}
html.ti-dark h1#pL, html.ti-dark .clockdate, html.ti-dark #daydiv,
html.ti-dark time, html.ti-dark .lsp, html.ti-dark #lC, html.ti-dark #front_loc,
html.ti-dark #syncH, html.ti-dark #syncDtl {
  color: #ffffff !important;
}
html.ti-dark .divider { color: #333333 !important; }

/* 链接：白色文字；悬停沿用原站红边（#c35 不变） */
html.ti-dark a:link, html.ti-dark a:visited {
  color: #ffffff !important;
  border-bottom-color: #333333 !important;
}
html.ti-dark a:hover {
  color: #ffffff !important;
  border-bottom-color: #c35 !important;
}
html.ti-dark #nav a.logo, html.ti-dark nav a.logo { color: #ffffff !important; }

/* 分隔线 / 表格边框 */
html.ti-dark .infotable td, html.ti-dark .blanktable td,
html.ti-dark .CM td { border-top-color: #2a2a2a !important; }
html.ti-dark .infotable .lastrow td { border-bottom-color: #2a2a2a !important; }
html.ti-dark section { border-top-color: #2a2a2a !important; }
html.ti-dark .CM td { border-left-color: #2a2a2a !important; border-right-color: #000000 !important; }
html.ti-dark .CM td.headline { border-bottom-color: #ffffff !important; }
html.ti-dark .CM td.hl { border-left-color: #2a2a2a !important; border-right-color: #000000 !important; }

/* 结构性表面（原站 #eee / #f8f8f8 → 纯黑系）
   注意：#clock0_bg 必须保持透明！原站大时钟 #clock 是 z-index:-1，
   靠透过 #clock0_bg 的透明背景显示在 body 上。若给它不透明背景，
   时钟会被盖住而不可见（修复图1 福州页深色时钟消失 Bug）。 */
html.ti-dark #navbg,
html.ti-dark .map.simplify #navbg,
html.ti-dark .showall #navbg,
html.ti-dark .highlight,
html.ti-dark .even,
html.ti-dark section.even {
  background-color: #111111 !important;
}
/* #clock0_bg 保持透明：让时钟数字直接显示在纯黑 body 之上（与浅色机制一致） */
html.ti-dark #clock0_bg,
html.ti-dark .factspage #clock0_bg {
  background-color: transparent !important;
}

/* 导航 / 底部 */
html.ti-dark nav, html.ti-dark footer,
html.ti-dark #menupositioner { background-color: #0a0a0a !important; }
html.ti-dark nav a:link, html.ti-dark nav a:visited,
html.ti-dark footer, html.ti-dark footer div,
html.ti-dark footer a:link, html.ti-dark footer a:visited,
html.ti-dark #menulinks a:link, html.ti-dark #menulinks a:visited {
  color: #ffffff !important;
  border-color: #333333 !important;
}
html.ti-dark nav a:hover, html.ti-dark footer a:hover,
html.ti-dark #menulinks a:hover { color: #ffffff !important; border-color: #c35 !important; }
html.ti-dark nav li.chosen a, html.ti-dark #menulinks li.chosen a {
  color: #ffffff !important; border-color: #c35 !important;
}

/* 区域 / 卡片 / 信息框 */
html.ti-dark section, html.ti-dark .infobox, html.ti-dark fieldset,
html.ti-dark .links, html.ti-dark pre, html.ti-dark .ptab, html.ti-dark .ltab,
html.ti-dark .widget_examples, html.ti-dark .bsap a, html.ti-dark .veil,
html.ti-dark .progress_bar, html.ti-dark .top_cities_cloud,
html.ti-dark .susdiv tr {
  background-color: #111111 !important;
  color: #ffffff !important;
}
html.ti-dark fieldset { border-color: #333333 !important; }
html.ti-dark .links { background-color: #0d0d0d !important; }
html.ti-dark .links li, html.ti-dark .links li .source { color: #c8c8c8 !important; }
html.ti-dark pre { border-color: #2a2a2a !important; color: #c8c8c8 !important; }

/* 紫色引言区 section#quote：保留原站紫色 #75a，不被上面 section 规则压暗（修复图2） */
html.ti-dark #quote {
  background-color: #75a !important;
  color: #ffffff !important;
}
html.ti-dark #quote blockquote,
html.ti-dark #quote cite {
  color: #ffffff !important;
}

/* 城市云 .top_cities_cloud：背景深色、普通城市白字；
   热门城市块 a.s1 / a.s2 保留原站白底黑字（修复图2，如東京/洛杉矶/紐約，图3效果） */
html.ti-dark .top_cities_cloud { background-color: #111111 !important; }
html.ti-dark .top_cities_cloud a:link,
html.ti-dark .top_cities_cloud a:visited {
  color: #ffffff !important;
  border-color: transparent !important;
}
html.ti-dark .top_cities_cloud a.s1,
html.ti-dark .top_cities_cloud a.s2,
html.ti-dark .top_cities_cloud a.cloudhome {
  background-color: #ffffff !important;   /* 白底 */
  color: #000000 !important;              /* 黑字 */
  border-color: #ffffff !important;
}
html.ti-dark .top_cities_cloud a.s1:hover,
html.ti-dark .top_cities_cloud a.s2:hover {
  background-color: #c35 !important;      /* 悬停保留原站红色 */
  color: #ffffff !important;
  border-color: #c35 !important;
}

/* 收藏城市块 .tbx */
html.ti-dark .tbx a {
  background-color: #111111 !important;
  border-color: #333333 !important;
  color: #ffffff !important;
}
html.ti-dark .tbx a:hover {
  background-color: #c35 !important;   /* 保留原站红色 */
  border-color: #c35 !important;
  color: #ffffff !important;
}
html.ti-dark .tbx a.chosen {
  background-color: #c35 !important;   /* 选中态 = 原本的红色 */
  border-color: #c35 !important;
  color: #ffffff !important;
}
html.ti-dark .tbx span.time, html.ti-dark #favs li span { color: #999999 !important; }
html.ti-dark .tbx a.chosen span, html.ti-dark .tbx a:hover span { color: #ffffff !important; }

/* 表单与输入框 */
html.ti-dark .txtin, html.ti-dark .dateinput,
html.ti-dark input[type="text"], html.ti-dark input[type="search"],
html.ti-dark input[type="email"], html.ti-dark input[type="password"],
html.ti-dark input[type="number"], html.ti-dark textarea, html.ti-dark select,
html.ti-dark #widgetform .mout, html.ti-dark #customize,
html.ti-dark .inputframe input {
  background-color: #111111 !important;
  color: #ffffff !important;
  border-color: #333333 !important;
}
html.ti-dark select option { background-color: #111111 !important; color: #ffffff !important; }
html.ti-dark .txtin:focus, html.ti-dark .txtin:hover,
html.ti-dark #q.focused, html.ti-dark #q.hovered, html.ti-dark .focused {
  background-color: #1a1a1a !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(195, 51, 51, 0.35) !important;  /* 红边聚焦 */
}
html.ti-dark #q.txtin { background-color: #111111 !important; }
html.ti-dark #q.blr, html.ti-dark .minihdr #q.blr { background-color: #000000 !important; color: #ffffff !important; }
html.ti-dark #q:focus { color: #ffffff !important; }

/* 按钮 */
html.ti-dark .button, html.ti-dark .buttonlink,
html.ti-dark div.action_buttons a {
  background-color: #111111 !important;
  border-color: #333333 !important;
  color: #ffffff !important;
}
html.ti-dark .button:hover, html.ti-dark .button.focused,
html.ti-dark .buttonlink:hover, html.ti-dark div.action_buttons a:hover {
  background-color: #1a1a1a !important;
  border-color: #c35 !important;      /* 悬停红边 */
  color: #ffffff !important;
}

/* 覆盖层 / 弹窗 */
html.ti-dark #overlayer { background-color: #000000 !important; opacity: 0.85 !important; }
html.ti-dark #popmsgbg { background-color: #111111 !important; color: #ffffff !important; }

/* 日历弹窗 */
html.ti-dark .popc .month, html.ti-dark .popc table.caln {
  background-color: #111111 !important;
  border-color: #333333 !important;
  color: #ffffff !important;
}
html.ti-dark .caln td div { color: #ffffff !important; }
html.ti-dark .caln .dayheaders th { color: #c8c8c8 !important; border-color: #2a2a2a !important; }
html.ti-dark .caln td:hover div { background-color: #1a1a1a !important; color: #ffffff !important; }
html.ti-dark .caln tr td.chosen div { background-color: #c35 !important; border-color: #c35 !important; color: #ffffff !important; }
html.ti-dark .caln td.holiday div { background-color: rgba(195, 51, 51, 0.25) !important; color: #ff9aa0 !important; }

/* 大时钟：纯白，醒目，不被背景遮挡（修复图1）
   原站 #clock 是 z-index:-1，必须保持 #clock0_bg 透明，时钟才能显示。
   此处仅改颜色，不动布局与 z-index（保持与原站一致）。 */
html.ti-dark #clock,
html.ti-dark time#clock,
html.ti-dark .mt #clock {
  color: #ffffff !important;
  text-shadow: 0 0 1px #ffffff, 0 0 8px rgba(255, 255, 255, 0.15) !important;
  background: transparent !important;
  -webkit-text-fill-color: #ffffff !important;
}

/* 搜索建议（原站已深色，统一纯黑系） */
html.ti-dark .susdiv tr { background-color: #111111 !important; }
html.ti-dark .susdiv a span { color: #ffffff !important; }
html.ti-dark .susdiv td { border-top-color: #000000 !important; }
html.ti-dark .susdiv .chosen { background-color: #c35 !important; color: #ffffff !important; }

/* 图片 / 嵌入媒体：略微压暗以融入纯黑画布 */
html.ti-dark img:not([src*=".svg"]):not(#logo):not([id*="flag"]):not([class*="flag"]),
html.ti-dark video {
  filter: brightness(0.85) saturate(0.95);
}

/* 滚动条 */
html.ti-dark * { scrollbar-color: #333333 transparent; }
@supports selector(::-webkit-scrollbar) {
  html.ti-dark ::-webkit-scrollbar { width: 10px; height: 10px; }
  html.ti-dark ::-webkit-scrollbar-track { background: #000000; }
  html.ti-dark ::-webkit-scrollbar-thumb { background: #333333; border-radius: 6px; border: 2px solid #000000; }
}

/* 文字选中：保留原站红色 */
html.ti-dark ::selection { background-color: rgba(195, 51, 51, 0.35); color: #ffffff; }

/* ---- 双态切换按钮（符合原站风格：衬线 + 字母间距） ------------------ */
#ti-dark-toggle {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483647;
  font: 15px/1 "Times New Roman", Times, FreeSerif, serif;
  letter-spacing: 2px;
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  border: 1px solid #999999;
  background-color: #ffffff;   /* 浅色态：白底黑字 */
  color: #000000;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
}
#ti-dark-toggle:hover { border-color: #c35; color: #c35; }
html.ti-dark #ti-dark-toggle {
  background-color: #000000;   /* 深色态：黑底白字 */
  color: #ffffff;
  border-color: #999999;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.6);
}
html.ti-dark #ti-dark-toggle:hover { border-color: #c35; color: #c35; }
`;

  /* ---------------- 样式注入（多引擎降级） ------------------------------ */
  function injectStyle(cssText) {
    if (typeof GM_addStyle === 'function') {
      try { GM_addStyle(cssText); return; } catch (e) { /* fall through */ }
    }
    var apply = function () {
      if (!document.documentElement) return;
      var el = document.getElementById('ti-dark-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'ti-dark-style';
        el.textContent = cssText;
        (document.head || document.documentElement).appendChild(el);
      }
    };
    if (document.head) apply();
    else document.addEventListener('DOMContentLoaded', apply, { once: true });
  }

  /* ---------------- 偏好：仅两态 ------------------------------- */
  function getPref() {
    var v;
    try { v = (typeof GM_getValue === 'function') ? GM_getValue(STORAGE_KEY, '0') : localStorage.getItem(STORAGE_KEY); }
    catch (e) { v = '0'; }
    return v === '1' ? '1' : '0';
  }
  function setPref(v) {
    try {
      if (typeof GM_setValue === 'function') GM_setValue(STORAGE_KEY, v);
      else localStorage.setItem(STORAGE_KEY, v);
    } catch (e) { /* private mode */ }
  }

  function applyMode() {
    var dark = getPref() === '1';
    var root = document.documentElement;
    if (!root) return;
    root.classList.toggle('ti-dark', dark);
    var btn = document.getElementById('ti-dark-toggle');
    if (btn) {
      btn.textContent = dark ? '浅色' : '深色';
      btn.setAttribute('aria-label', dark ? '切换到浅色模式' : '切换到深色模式');
      btn.title = dark ? '当前：深色模式 · 点击切换为浅色' : '当前：浅色模式 · 点击切换为深色';
    }
  }

  function toggle() {
    setPref(getPref() === '1' ? '0' : '1');
    applyMode();
  }

  /* ---------------- 挂载按钮 ---------------------------------- */
  function mountButton() {
    if (!document.body || document.getElementById('ti-dark-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'ti-dark-toggle';
    btn.type = 'button';
    btn.addEventListener('click', toggle);
    document.body.appendChild(btn);
    applyMode();
  }

  /* ---------------- 启动 -------------------------------------- */
  injectStyle(CSS);
  applyMode(); // document-start，首帧前生效

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  } else {
    mountButton();
  }

  // Time.is 整体是静态页，但部分部件会重绘；MutationObserver 保证类与按钮常驻
  var mo = new MutationObserver(function () {
    if (!document.documentElement.classList.contains('ti-dark') && getPref() === '1') applyMode();
    if (!document.getElementById('ti-dark-toggle')) mountButton();
  });
  function observe() {
    if (document.documentElement) {
      mo.observe(document.documentElement, { childList: true, subtree: false });
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', observe, { once: true });
  } else {
    observe();
  }
})();