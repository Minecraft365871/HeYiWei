// ==UserScript==
// @name         Time.is Dark Mode (BewlyBewly Style)
// @name:zh-CN   Time.is 深色模式（仿 BewlyBewly / clock.qqhkx.com 配色）
// @namespace    https://github.com/Minecraft365871
// @version      1.0.0
// @description  Give time.is a dark theme inspired by BewlyBewly, using the exact color palette of clock.qqhkx.com. Pure CSS overlay: it does not modify or remove any original site stylesheet rule — it only adds an additional layer on top, so the page's original layout and styling stay intact. Includes a floating toggle button (🌙 / ☀️) with persisted preference and automatic follow-system mode.
// @description:zh-CN 为 Time.is 添加深色模式，配色取自 clock.qqhkx.com（与 BewlyBewly 深色风格一致）。脚本仅追加一层 CSS 覆盖样式，不修改、不删除网站原有样式的任何规则，页面原始布局与排版保持不变。提供悬浮切换按钮（🌙 / ☀️），偏好自动保存，支持跟随系统。
// @author       Minecraft365871
// @license      MIT
// @copyright    2026 Minecraft365871
// @match        *://time.is/*
// @match        *://*.time.is/*
// @match        *://timeanddate.tips/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=time.is
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @noframes
// ==/UserScript==

(function () {
  'use strict';

  /* ==========================================================================
   * Time.is Dark Mode
   * --------------------------------------------------------------------------
   * Design goals
   *  1. Dark theme visually matching clock.qqhkx.com / BewlyBewly dark style.
   *  2. Zero modification of the site's original stylesheets: every rule below
   *     is *appended* as an extra author-level layer. The site's own CSS files
   *     are never touched, patched or removed. Layout properties (display,
   *     float, position, sizes, spacing…) are deliberately left alone — only
   *     colors / borders / shadows / filters are overridden.
   *  3. Graceful degradation: if the user disables dark mode, the page returns
   *     to its untouched original appearance instantly.
   *
   * Palette (extracted from clock.qqhkx.com production CSS custom properties):
   *   --ui-color-bg          #0c1110   page background (deep green-black)
   *   --ui-color-bg-raised   #111715   raised surfaces
   *   --ui-color-bg-muted    #141b18   muted surfaces / alternating rows
   *   --ui-color-bg-elevated #18201d   elevated surfaces (cards, popups)
   *   --ui-color-text        #f0f1ec   primary text
   *   --ui-color-text-muted  #a3a8a1   secondary text
   *   --ui-color-text-subtle #7e857e   tertiary text
   *   --ui-color-accent      #2fecc6   accent (teal-mint)
   *   --ui-color-accent-strong #17c7ad accent hover/active
   *   --ui-color-border      rgba(232,233,224,.13)
   *   --ui-color-border-strong rgba(232,233,224,.22)
   * ========================================================================== */

  var STORAGE_KEY = 'tmIsDarkModeEnabled'; // 'on' | 'off' | 'auto'
  var MODE_AUTO = 'auto';
  var MODE_ON = 'on';
  var MODE_OFF = 'off';

  var CSS = /* css */ `
/* ---- tokens -------------------------------------------------------------- */
html.qdark,
body.qdark {
  --qd-bg: #0c1110;
  --qd-bg-raised: #111715;
  --qd-bg-muted: #141b18;
  --qd-bg-elevated: #18201d;
  --qd-text: #f0f1ec;
  --qd-text-muted: #a3a8a1;
  --qd-text-subtle: #7e857e;
  --qd-accent: #2fecc6;
  --qd-accent-strong: #17c7ad;
  --qd-accent-soft: rgba(47, 236, 198, 0.14);
  --qd-danger: #ef5f67;
  --qd-warning: #d7a541;
  --qd-success: #4fce8b;
  --qd-info: #63c4e8;
  --qd-border: rgba(232, 233, 224, 0.13);
  --qd-border-strong: rgba(232, 233, 224, 0.22);
  --qd-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  --qd-glass: rgba(2, 5, 4, 0.55);
  color-scheme: dark !important;
}

/* ---- base canvas & typography -------------------------------------------- */
html.qdark body,
html.qdark body.d,
html.qdark #bdy {
  background-color: var(--qd-bg) !important;
  color: var(--qd-text) !important;
}

/* Headings / generic text that the site paints near-black on white pages */
html.qdark h1, html.qdark h2, html.qdark h3, html.qdark h4,
html.qdark h5, html.qdark h6 {
  color: var(--qd-text) !important;
}
html.qdark h1#pL, html.qdark .clockdate, html.qdark #daydiv,
html.qdark time, html.qdark .lsp, html.qdark #lC {
  color: var(--qd-text) !important;
}
html.qdark label, html.qdark legend, html.qdark .button {
  color: var(--qd-text) !important;
}

/* Links: keep the site's own red (#c35) as the brand accent for inline links,
   but lift greys onto the palette instead of crushing them to black. */
html.qdark a:link, html.qdark a:visited { color: var(--qd-text-muted); }
html.qdark a:hover { color: var(--qd-accent) !important; }
html.qdark #nav a.logo, html.qdark nav a.logo { color: var(--qd-accent) !important; }
html.qdark cite a:link, html.qdark cite a:visited { color: var(--qd-text-subtle) !important; }

/* Borders used as separators (site uses #ccc/#ddd hairlines on white) */
html.qdark .infotable td, html.qdark .blanktable td { border-top-color: var(--qd-border) !important; }
html.qdark .infotable .lastrow td { border-bottom-color: var(--qd-border) !important; }
html.qdark section { border-top-color: var(--qd-border) !important; }
html.qdark .faqitem { border-color: var(--qd-border-strong) !important; }

/* ---- structural surfaces -------------------------------------------------- */
/* Clock backdrop strip + nav background (site default: #eee) */
html.qdark #navbg,
html.qdark .map.simplify #navbg,
html.qdark .showall #navbg,
html.qdark #clock0_bg,
html.qdark .factspage #clock0_bg,
html.qdark .highlight,
html.qdark .even,
html.qdark section.even,
html.qdark .section.even {
  background-color: var(--qd-bg-raised) !important;
}

/* Nav bar & footer (site default: #333) */
html.qdark nav, html.qdark footer {
  background-color: var(--qd-bg-raised) !important;
}
html.qdark nav a:link, html.qdark nav a:visited,
html.qdark footer, html.qdark footer div,
html.qdark footer a:link, html.qdark footer a:visited {
  color: var(--qd-text-muted) !important;
}
html.qdark nav a:hover, html.qdark footer a:hover,
html.qdark footer div a:hover {
  color: var(--qd-text) !important;
}
html.qdark nav li.chosen a,
html.qdark footer nav .hzlist li.chosen a {
  background-color: var(--qd-accent-soft) !important;
  color: var(--qd-accent) !important;
  border-radius: 6px;
}

/* Sections / cards (site default: #222 blocks on #000 or white on white) */
html.qdark section,
html.qdark .infobox,
html.qdark fieldset,
html.qdark .links,
html.qdark pre,
html.qdark .ptab, html.qdark .ltab,
html.qdark .widget_examples,
html.qdark .bsap a,
html.qdark .veil,
html.qdark .progress_bar,
html.qdark .top_cities_cloud,
html.qdark #menupositioner,
html.qdark .susdiv tr {
  background-color: var(--qd-bg-raised) !important;
  color: var(--qd-text) !important;
}
html.qdark .infobox { box-shadow: var(--qd-shadow) !important; border-radius: 10px; }
html.qdark fieldset { border-color: var(--qd-border-strong) !important; box-shadow: none !important; border-radius: 10px; }
html.qdark .links { background-color: var(--qd-bg-muted) !important; border-radius: 10px; }
html.qdark .links li, html.qdark .links li .source { color: var(--qd-text-muted) !important; }
html.qdark .links a:link, html.qdark .links a:visited { color: var(--qd-text) !important; }
html.qdark pre { border: 1px solid var(--qd-border); border-radius: 8px; color: var(--qd-text-muted); }

/* White "inverted" chips the site shows in dark mode → recolor to palette */
html.qdark .nicediff,
html.qdark .country,
html.qdark .announcement,
html.qdark .diff_bar div,
html.qdark #progressed1,
html.qdark .running #startbuttondiv,
html.qdark .selectedyear,
html.qdark .transitiondate,
html.qdark section.dst_message .transitiondate,
html.qdark #dayhoverinfo,
html.qdark .tbx a.chosen,
html.qdark .tbx a:hover,
html.qdark .tbx a.chosen:hover,
html.qdark #q.blr,
html.qdark .minihdr #q.blr {
  background-color: var(--qd-bg-elevated) !important;
  color: var(--qd-text) !important;
  border-color: var(--qd-border-strong) !important;
}
html.qdark .announcement a:link, html.qdark .announcement a:visited { color: var(--qd-accent) !important; }
html.qdark #dayhoverinfo div { color: var(--qd-text-muted) !important; }
html.qdark .transitiondate span { color: var(--qd-text) !important; }
html.qdark .selectedyear { color: var(--qd-accent) !important; }

/* Favoured-cities tiles (.tbx) */
html.qdark .tbx a {
  background-color: var(--qd-bg-raised) !important;
  border-color: var(--qd-border-strong) !important;
  color: var(--qd-text) !important;
  border-radius: 8px;
}
html.qdark .tbx a:hover {
  background-color: var(--qd-accent-soft) !important;
  border-color: var(--qd-accent) !important;
  color: var(--qd-accent) !important;
}
html.qdark .tbx span.time { color: var(--qd-text-subtle) !important; }
html.qdark #favs li span { color: var(--qd-text-muted) !important; }

/* Tables: row hover highlight */
html.qdark .infotable tr:hover,
html.qdark .CM tr:hover td,
html.qdark .diff_table tr:hover td,
html.qdark .faqitem:hover,
html.qdark article.open {
  background-color: var(--qd-bg-muted) !important;
  color: var(--qd-text) !important;
}
html.qdark .CM tr:hover td a { color: var(--qd-text) !important; }
html.qdark .CM td { border-left-color: var(--qd-border) !important; border-right-color: var(--qd-bg) !important; }
html.qdark td.value, html.qdark .susdiv td { border-color: var(--qd-border) !important; }

/* Calendar popup */
html.qdark .popc .month, html.qdark .popc table.caln {
  background-color: var(--qd-bg-elevated) !important;
  border-color: var(--qd-border-strong) !important;
  color: var(--qd-text) !important;
}
html.qdark .caln td div { color: var(--qd-text) !important; }
html.qdark .caln .dayheaders th { color: var(--qd-text-muted) !important; border-color: var(--qd-border) !important; }
html.qdark .caln td:hover div { background-color: var(--qd-bg-muted) !important; color: var(--qd-text) !important; }
html.qdark .caln tr td.chosen div,
html.qdark .caln tr td.past.chosen div {
  background-color: var(--qd-accent) !important;
  border-color: var(--qd-accent) !important;
  color: #0c1110 !important;
}
html.qdark .caln td.holiday div,
html.qdark .caln td.d6.holiday div,
html.qdark .caln td.d0.holiday div,
html.qdark .caln td.religious div,
html.qdark .caln td.observance div {
  background-color: rgba(239, 95, 103, 0.18) !important;
  color: #ff9aa0 !important;
}
html.qdark .caln td.half_holiday div {
  background-color: rgba(215, 165, 65, 0.18) !important;
  color: var(--qd-warning) !important;
}
html.qdark .caln td.personal div {
  background-color: rgba(99, 196, 232, 0.16) !important;
  color: var(--qd-info) !important;
}
html.qdark .caln tr td.d6 div, html.qdark .caln tr td.d0 div { color: #ff8ba0 !important; }

/* Forms & inputs */
html.qdark .txtin,
html.qdark .dateinput,
html.qdark input[type="text"], html.qdark input[type="search"],
html.qdark input[type="email"], html.qdark input[type="password"],
html.qdark input[type="number"], html.qdark input[type="tel"],
html.qdark textarea,
html.qdark select,
html.qdark #widgetform .mout,
html.qdark #widgetform #custom_code,
html.qdark #customize,
html.qdark .inputframe input {
  background-color: var(--qd-bg-raised) !important;
  color: var(--qd-text) !important;
  border-color: var(--qd-border-strong) !important;
}
html.qdark select option { background-color: var(--qd-bg-elevated) !important; color: var(--qd-text) !important; }
html.qdark .txtin:focus, html.qdark .txtin:hover,
html.qdark #q.focused, html.qdark #q.hovered,
html.qdark #inputs .txtin:hover, html.qdark #inputs .txtin:focus,
html.qdark .focused {
  background-color: var(--qd-bg-elevated) !important;
  outline: none !important;
  box-shadow: 0 0 0 2px rgba(47, 236, 198, 0.28) !important;
}
html.qdark .button, html.qdark .buttonlink,
html.qdark div.action_buttons a, html.qdark #maptext .action_buttons a {
  background-color: var(--qd-bg-raised) !important;
  border-color: var(--qd-border-strong) !important;
  color: var(--qd-text) !important;
  border-radius: 8px;
}
html.qdark .button:hover, html.qdark .button.focused,
html.qdark .buttonlink:hover,
html.qdark div.action_buttons a:hover,
html.qdark .startstopbutton:hover,
html.qdark #inputs .button:hover, html.qdark #inputs .button:focus,
html.qdark #numberbuttons .flexc div:hover,
html.qdark .social_buttons div:hover {
  background-color: var(--qd-accent-soft) !important;
  border-color: var(--qd-accent) !important;
  color: var(--qd-accent) !important;
}

/* Overlays / modals */
html.qdark #overlayer { background-color: #000 !important; opacity: 0.8 !important; }
html.qdark #popmsgbg { background-color: var(--qd-bg-raised) !important; color: var(--qd-text) !important; }

/* Site brand red kept, but softened for dark bg readability */
html.qdark .lg a:hover, html.qdark a.buttonlink:hover { background-color: #b23a52 !important; }

/* Images & embedded media: slightly dim + desaturate to sit into the dark canvas */
html.qdark img:not([src*=".svg"]):not(#logo):not([id*="flag"]):not([class*="flag"]),
html.qdark video, html.qdark iframe[src*="ads"], html.qdark ins.adsbygoogle,
html.qdark #ads, html.qdark .bsap, html.qdark [id^="google_ads"],
html.qdark [class*="pub_"], html.qdark [id*="pub-"], html.qdark .prebid_ad,
html.qdark [data-ad-slot], html.qdark .adbox {
  filter: brightness(0.82) saturate(0.92);
}
html.qdark #photo { background-color: #000 !important; }

/* Scrollbar (WebKit + Firefox) */
html.qdark * { scrollbar-color: var(--qd-border-strong) transparent; }
@supports selector(::-webkit-scrollbar) {
  html.qdark ::-webkit-scrollbar { width: 10px; height: 10px; }
  html.qdark ::-webkit-scrollbar-track { background: var(--qd-bg); }
  html.qdark ::-webkit-scrollbar-thumb {
    background: var(--qd-border-strong);
    border-radius: 6px;
    border: 2px solid var(--qd-bg);
  }
  html.qdark ::-webkit-scrollbar-thumb:hover { background: var(--qd-accent-strong); }
}

/* Selection colour, like the reference site's mint accent */
html.qdark ::selection { background-color: rgba(47, 236, 198, 0.25); color: var(--qd-text); }

/* ---- floating toggle button ---------------------------------------------- */
#qd-toggle {
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(232, 233, 224, 0.22);
  background: rgba(17, 23, 21, 0.85);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
  color: #f0f1ec;
  font-size: 20px;
  line-height: 1;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  opacity: 0.85;
  padding: 0;
}
#qd-toggle:hover {
  transform: translateY(-2px) scale(1.06);
  opacity: 1;
  background: rgba(24, 32, 29, 0.95);
  box-shadow: 0 0 0 3px rgba(47, 236, 198, 0.28), 0 8px 22px rgba(0, 0, 0, 0.55);
}
#qd-toggle:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(47, 236, 198, 0.55);
}
`;

  /* ---------------- style injection (multi-engine fallback) --------------- */
  function injectStyle(cssText) {
    if (typeof GM_addStyle === 'function') {
      try { GM_addStyle(cssText); return; } catch (e) { /* fall through */ }
    }
    var apply = function () {
      if (!document.documentElement) return;
      var el = document.getElementById('qd-dark-style');
      if (!el) {
        el = document.createElement('style');
        el.id = 'qd-dark-style';
        el.textContent = cssText;
        (document.head || document.documentElement).appendChild(el);
      }
    };
    if (document.head) apply();
    else document.addEventListener('DOMContentLoaded', apply, { once: true });
  }

  /* ---------------- preference handling ----------------------------------- */
  function getPref() {
    var v;
    try { v = (typeof GM_getValue === 'function') ? GM_getValue(STORAGE_KEY, MODE_AUTO) : localStorage.getItem(STORAGE_KEY); }
    catch (e) { v = MODE_AUTO; }
    return (v === MODE_ON || v === MODE_OFF) ? v : MODE_AUTO;
  }

  function setPref(v) {
    try {
      if (typeof GM_setValue === 'function') GM_setValue(STORAGE_KEY, v);
      else localStorage.setItem(STORAGE_KEY, v);
    } catch (e) { /* private mode etc. */ }
  }

  var mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mql && mql.addEventListener) {
    mql.addEventListener('change', function () { applyMode(); });
  }

  function shouldDark(pref) {
    if (pref === MODE_ON) return true;
    if (pref === MODE_OFF) return false;
    return !!(mql && mql.matches); // auto
  }

  function applyMode() {
    var pref = getPref();
    var dark = shouldDark(pref);
    var root = document.documentElement;
    if (!root) return;
    root.classList.toggle('qdark', dark);
    var btn = document.getElementById('qd-toggle');
    if (btn) {
      btn.textContent = dark ? '☀️' : '🌙';
      btn.setAttribute('aria-label', dark ? '切换到浅色模式 (Switch to light mode)' : '切换到深色模式 (Switch to dark mode)');
      btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
      btn.title = 'Time.is Dark Mode — ' +
        (pref === MODE_AUTO ? '跟随系统 (auto)' : dark ? '已开启 (on)' : '已关闭 (off)') +
        ' · 点击切换 (click to toggle)';
    }
  }

  /* Cycle: auto → on → off → auto … then re-evaluate against system pref. */
  function cyclePref() {
    var pref = getPref();
    var next = pref === MODE_AUTO ? MODE_ON : pref === MODE_ON ? MODE_OFF : MODE_AUTO;
    setPref(next);
    applyMode();
  }

  /* ---------------- toggle button mounting --------------------------------- */
  function mountButton() {
    if (!document.body || document.getElementById('qd-toggle')) return;
    var btn = document.createElement('button');
    btn.id = 'qd-toggle';
    btn.type = 'button';
    btn.addEventListener('click', cyclePref);
    document.body.appendChild(btn);
    applyMode();
  }

  /* ---------------- boot ---------------------------------------------------- */
  injectStyle(CSS);
  applyMode(); // as early as document-start, before first paint

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountButton, { once: true });
  } else {
    mountButton();
  }

  // Time.is is largely static, but SPQ/lazy widgets can replace <body> content;
  // MutationObserver keeps the class & button alive across DOM swaps.
  var mo = new MutationObserver(function () {
    if (!document.documentElement.classList.contains('qdark') && shouldDark(getPref())) applyMode();
    if (!document.getElementById('qd-toggle')) mountButton();
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
