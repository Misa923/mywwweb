// File: /scripts.js
// Purpose: Behavior for theming, palette, overlays, sections, charts, tables, live demo, and forms.

(function () {
  "use strict";

  /**
   * Persist and apply theme (light/dark) and palette.
   * Why: users expect their choices to stick and reflect across views.
   */
  const Theme = (() => {
    const html = document.documentElement;
    const STORAGE_KEYS = { theme: "c23m9:theme", palette: "c23m9:palette", lang: "c23m9:lang" };

    function getInitialTheme() {
      const saved = localStorage.getItem(STORAGE_KEYS.theme);
      if (saved === "light" || saved === "dark") return saved;
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }

    function applyTheme(mode) {
      html.setAttribute("data-theme", mode);
      localStorage.setItem(STORAGE_KEYS.theme, mode);
    }

    function toggleTheme() {
      const current = html.getAttribute("data-theme") || getInitialTheme();
      const next = current === "dark" ? "light" : "dark";
      applyTheme(next);
    }

    function applyPalette(name) {
      if (name === "spidey") {
        html.setAttribute("data-palette", "spidey");
      } else {
        html.removeAttribute("data-palette");
      }
      localStorage.setItem(STORAGE_KEYS.palette, name || "");
    }

    function init() {
      applyTheme(getInitialTheme());
      const savedPalette = localStorage.getItem(STORAGE_KEYS.palette);
      if (savedPalette) applyPalette(savedPalette);

      const themeToggle = document.getElementById("themeToggle");
      const techThemeBtn = document.getElementById("techThemeBtn");
      const spideyToggle = document.getElementById("spideyToggle");
      themeToggle && themeToggle.addEventListener("click", toggleTheme);
      techThemeBtn && techThemeBtn.addEventListener("click", toggleTheme);
      spideyToggle && spideyToggle.addEventListener("click", () => {
        const next = html.getAttribute("data-palette") === "spidey" ? "" : "spidey";
        applyPalette(next);
      });
    }

    return { init };
  })();

  /**
   * Language selection (persist + reflect on <html lang>).
   * Why: basic i18n affordance without heavy runtime translation.
   */
  const Language = (() => {
    const html = document.documentElement;
    const STORAGE_KEY = "c23m9:lang";

    function init() {
      const select = document.getElementById("langSelect");
      if (!select) return;
      const saved = localStorage.getItem(STORAGE_KEY) || html.getAttribute("lang") || "en";
      html.setAttribute("lang", saved);
      select.value = saved;
      select.addEventListener("change", () => {
        const lang = select.value || "en";
        html.setAttribute("lang", lang);
        localStorage.setItem(STORAGE_KEY, lang);
      });
    }

    return { init };
  })();

  /**
   * Collapsible section content using the section toggle button.
   * Why: lets users reduce page length without losing context.
   */
  const Sections = (() => {
    function setHidden(el, hidden) {
      if (!el) return;
      el.style.display = hidden ? "none" : "";
      el.setAttribute("aria-hidden", hidden ? "true" : "false");
    }

    function toggleFor(btn) {
      const section = btn.closest(".section-block");
      if (!section) return;
      const title = section.querySelector(".section-title");
      let firstContent = null;
      for (const child of section.children) {
        if (child === title) continue;
        firstContent = child; break;
      }
      if (!firstContent) return;

      const isExpanded = btn.getAttribute("aria-expanded") !== "false";
      btn.setAttribute("aria-expanded", isExpanded ? "false" : "true");
      btn.textContent = isExpanded ? "Show" : "Hide";

      // Hide/show all siblings after title.
      let seenTitle = false;
      for (const child of section.children) {
        if (!seenTitle && child === title) { seenTitle = true; continue; }
        if (seenTitle) setHidden(child, isExpanded);
      }
    }

    function init() {
      document.querySelectorAll(".section-toggle").forEach((btn) => {
        btn.addEventListener("click", () => toggleFor(btn));
      });
    }

    return { init };
  })();

  /**
   * Simple bar and sparkline drawing on <canvas> without external deps.
   * Why: avoids bundle weight and keeps demo self-contained.
   */
  const Charts = (() => {
    /** @param {HTMLCanvasElement} canvas */
   function clear(canvas) {
  const dpr = window.devicePixelRatio || 1;

  // Use CSS size (stable), not backing size or rect that might reflect prior writes
  const cssW = canvas.clientWidth  || canvas.getBoundingClientRect().width;
  const cssH = canvas.clientHeight || canvas.getBoundingClientRect().height;

  // Set backing store only; CSS height is fixed via CSS above
  canvas.width  = Math.max(1, Math.floor(cssW * dpr));
  canvas.height = Math.max(1, Math.floor(cssH * dpr));

  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, cssW, cssH);
  return { ctx, w: cssW, h: cssH };
}

    /** Draw bars with labels. */
    function drawBars(canvas, rows, metricKey, options = {}) {
      const { ctx, w, h } = clear(canvas);
      const padding = 28; // why: readable axes
      const labelH = 16;
      const innerW = w - padding * 2;
      const innerH = h - padding * 2 - labelH;
      const maxVal = Math.max(1, ...rows.map((r) => Number(r[metricKey]) || 0));
      const barGap = 10;
      const barW = Math.max(8, (innerW - barGap * (rows.length - 1)) / Math.max(1, rows.length));

      ctx.font = "12px Inter, system-ui, sans-serif";
      ctx.textBaseline = "middle";
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text") || "#e5e7eb";

      ctx.save();
      ctx.translate(padding, padding);

      // Axis
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(0, innerH);
      ctx.lineTo(innerW, innerH);
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--border") || "#1f2937";
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Bars
      rows.forEach((r, i) => {
        const v = Number(r[metricKey]) || 0;
        const x = i * (barW + barGap);
        const hPix = Math.round((v / maxVal) * (innerH - 4));
        const y = innerH - hPix;
        ctx.fillStyle = i % 2 ? (getComputedStyle(document.documentElement).getPropertyValue("--brand-2") || "#a78bfa") : (getComputedStyle(document.documentElement).getPropertyValue("--brand") || "#60a5fa");
        ctx.fillRect(x, y, barW, hPix);
        // Labels
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--text") || "#e5e7eb";
        const label = String(r.platform);
        const tw = ctx.measureText(label).width;
        ctx.save();
        ctx.translate(x + barW / 2, innerH + labelH / 2);
        ctx.rotate(0);
        ctx.fillText(label, -tw / 2, 0);
        ctx.restore();
      });

      // Max tick label
      ctx.globalAlpha = 0.65;
      const maxLbl = `${maxVal}`;
      ctx.fillText(maxLbl, innerW - ctx.measureText(maxLbl).width, -6);
      ctx.restore();
    }

    /** Draw a minimalist sparkline. */
    function drawSpark(canvas, data) {
      const { ctx, w, h } = clear(canvas);
      const pad = 6;
      const min = Math.min(...data);
      const max = Math.max(...data);
      const range = Math.max(1, max - min);
      ctx.beginPath();
      data.forEach((v, i) => {
        const x = pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
        const y = h - pad - ((v - min) / range) * (h - pad * 2);
        (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      });
      ctx.lineWidth = 2;
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--brand") || "#60a5fa";
      ctx.stroke();
    }

    return { drawBars, drawSpark };
  })();

  /**
   * Insights (Main + Tech): data, filters, sorting, table + bar chart.
   * Why: interactive demo matching copy in the page.
   */
  const Insights = (() => {
    const DATA = [
      { platform: "Facebook", mau_bil: 3.07, ad_aud_bil: 2.2, us_news_pct: 30, roi_top: true },
      { platform: "YouTube", mau_bil: 2.70, ad_aud_bil: 2.5, us_news_pct: 31, roi_top: true },
      { platform: "WhatsApp", mau_bil: 2.78, ad_aud_bil: 0.0, us_news_pct: 3, roi_top: false },
      { platform: "Instagram", mau_bil: 2.5, ad_aud_bil: 2.0, us_news_pct: 16, roi_top: true },
      { platform: "TikTok", mau_bil: 1.7, ad_aud_bil: 1.6, us_news_pct: 12, roi_top: true },
      { platform: "X", mau_bil: 0.6, ad_aud_bil: 0.6, us_news_pct: 17, roi_top: false },
      { platform: "LinkedIn", mau_bil: 0.7, ad_aud_bil: 0.7, us_news_pct: 4, roi_top: true },
      { platform: "Snapchat", mau_bil: 0.8, ad_aud_bil: 0.6, us_news_pct: 4, roi_top: false },
    ];

    /** @typedef {{metric:"mau_bil"|"ad_aud_bil"|"us_news_pct", gte2b:boolean, roi:boolean, sortKey: keyof InsightRow, sortDir: 1|-1}} InsightState */
    /** @typedef {{platform:string, mau_bil:number, ad_aud_bil:number, us_news_pct:number, roi_top:boolean}} InsightRow */

    /** Create an instance bound to element suffix (Main|Tech). */
    function attach(suffix) {
      /** @type {InsightState} */
      const state = { metric: "mau_bil", gte2b: false, roi: false, sortKey: "platform", sortDir: 1 };
      const el = (id) => document.getElementById(id + suffix);
      const dom = {
        select: el("metricSelect"),
        chk2b: el("filter2b"),
        chkROI: el("filterROI"),
        reset: el("resetFilters"),
        canvas: document.getElementById("barChart" + suffix),
        table: document.getElementById("dataTable" + suffix),
      };
      if (!dom.select || !dom.canvas || !dom.table) return;

      function filtered() {
        return DATA.filter((r) => (!state.gte2b || r.mau_bil >= 2) && (!state.roi || r.roi_top));
      }

      function sorted(rows) {
        return [...rows].sort((a, b) => {
          const k = state.sortKey;
          const av = a[k]; const bv = b[k];
          if (typeof av === "number" && typeof bv === "number") return (av - bv) * state.sortDir;
          return String(av).localeCompare(String(bv)) * state.sortDir;
        });
      }

      function renderTable(rows) {
        const tbody = dom.table.querySelector("tbody");
        if (!tbody) return;
        tbody.innerHTML = rows.map((r) => `
          <tr>
            <td>${r.platform}</td>
            <td>${fmt(r.mau_bil)}</td>
            <td>${fmt(r.ad_aud_bil)}</td>
            <td>${fmt(r.us_news_pct)}</td>
            <td>${r.roi_top ? "Yes" : "No"}</td>
          </tr>`).join("");
      }

      function renderChart(rows) {
        Charts.drawBars(dom.canvas, rows, state.metric);
      }

      function update() {
        const rows = sorted(filtered());
        renderTable(rows);
        renderChart(rows);
      }

      function fmt(v) {
        return typeof v === "number" ? (Math.round(v * 100) / 100).toString() : String(v);
      }

      // Interactions
      dom.select.addEventListener("change", () => { state.metric = /** @type any */(dom.select.value); update(); });
      dom.chk2b && dom.chk2b.addEventListener("change", () => { state.gte2b = dom.chk2b.checked; update(); });
      dom.chkROI && dom.chkROI.addEventListener("change", () => { state.roi = dom.chkROI.checked; update(); });
      dom.reset && dom.reset.addEventListener("click", () => {
        state.metric = "mau_bil"; state.gte2b = false; state.roi = false; state.sortKey = "platform"; state.sortDir = 1;
        dom.select.value = "mau_bil"; if (dom.chk2b) dom.chk2b.checked = false; if (dom.chkROI) dom.chkROI.checked = false; update();
      });

      // Sort on header click
      dom.table.querySelectorAll("th[data-key]").forEach((th) => {
        th.addEventListener("click", () => {
          const key = th.getAttribute("data-key");
          if (!key) return;
          if (state.sortKey === key) state.sortDir = /** @type any */(-state.sortDir);
          state.sortKey = /** @type any */(key);
          update();
        });
      });

      update();
    }

    function init() {
      attach("Main");
      attach("Tech");
    }

    return { init };
  })();

  /**
   * Live panel demo: synthetic metrics + sparkline with controls.
   * Why: shows responsiveness without external services.
   */
  const LiveDemo = (() => {
  const state = {
    latencies: Array.from({ length: 60 }, () => 120 + Math.random() * 80),
    replyMin: 8, uptimePct: 99.97, p95: 280, deploys: 3, incidents: 0,
    abUplift: 5, spikeUntil: 0,
  };

  let canvas, intervalId = null, initialized = false;

  function percentile(arr, p) {
    const a = [...arr].sort((x, y) => x - y);
    const idx = Math.floor((a.length - 1) * p);
    return a[idx];
  }
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val);
  }
  function updateDom() {
    setText("lmReply", state.replyMin);
    setText("lmUptime", state.uptimePct.toFixed(2));
    setText("lmP95", state.p95);
    setText("lmDeploys", state.deploys);
    setText("lmIncidents", state.incidents);
    setText("lmAB", state.abUplift.toFixed(1));
  }

  function draw() {
    if (!canvas) return;
    // If canvas hasn’t been laid out yet, try next frame
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) { requestAnimationFrame(draw); return; }
    Charts.drawSpark(canvas, state.latencies);
    updateDom();
  }

  function tick() {
    const now = Date.now();
    const base = 120 + Math.random() * 80;
    const spike = now < state.spikeUntil ? (200 + Math.random() * 400) : 0;
    const v = base + spike;
    state.latencies.push(v);
    state.latencies.shift();
    state.p95 = Math.round(percentile(state.latencies, 0.95));
    draw();
  }

  function init() {
    if (initialized) return;
    initialized = true;

    canvas = document.getElementById("liveSpark");
    if (!canvas) return;

    // Buttons
    document.getElementById("simulateSpike")?.addEventListener("click", () => {
      state.spikeUntil = Date.now() + 12000;
      state.incidents += 1;
      const svc = document.getElementById("svcHealth");
      if (svc) { svc.textContent = "Degraded"; svc.classList.remove('ok'); }
      draw();
    });
    document.getElementById("simulateDeploy")?.addEventListener("click", () => {
      state.deploys += 1;
      state.replyMin = Math.max(3, state.replyMin - 1);
      state.abUplift = Math.min(12, state.abUplift + 0.5);
      draw();
    });

    // SLA badge
    const sla = document.getElementById("slaBadge");
    if (sla) sla.textContent = "SLA 99.95%";

    // First paint & start timer
    requestAnimationFrame(() => { draw(); });
    if (!intervalId) intervalId = setInterval(tick, 1000);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { clearInterval(intervalId); intervalId = null; }
      else if (!intervalId) intervalId = setInterval(tick, 1000);
    });

    window.addEventListener("resize", draw);
  }

  return { init };
})();



  /**
   * Overlay for the Tech page, opened via "+TECH LOVERS" seal.
   * Why: lets audience switch without leaving the main page.
   */
  const TechOverlay = (() => {
  function init() {
    const openBtn = document.getElementById("sealTechBtn");
    const closeBtn = document.getElementById("techBackBtn");
    const techSite = document.getElementById("techSite");
    const html = document.documentElement;

    openBtn && openBtn.addEventListener("click", () => {
      window.location.href = "tech.html"; // Redirect instead of overlay
    });

    closeBtn && closeBtn.addEventListener("click", () => {
      html.setAttribute("data-audience", "biz");
      if (techSite) techSite.setAttribute("aria-hidden", "true");
      const target = document.getElementById("home");
      target && target.scrollIntoView({ behavior: "smooth" });
    });
  }
  return { init };
})();


  /**
   * Forms and misc utilities.
   * Why: improve UX for common actions.
   */
  const Forms = (() => {
    function initCopy(idBtn, idStatus) {
      const btn = document.getElementById(idBtn);
      const status = document.getElementById(idStatus);
      if (!btn) return;
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText("misa@c23m9.com");
          if (status) { status.textContent = "Copied email: misa@c23m9.com"; setTimeout(() => status.textContent = "We reply within one business day.", 2200); }
        } catch {
          if (status) status.textContent = "Copy failed. Email: misa@c23m9.com";
        }
      });
    }

    function initForm(idForm, idStatus) {
      const form = document.getElementById(idForm);
      const status = document.getElementById(idStatus);
      if (!form) return;
      form.addEventListener("submit", () => { if (status) status.textContent = "Sending…"; });
    }

    function init() {
      // Year
      const year = document.getElementById("year");
      if (year) year.textContent = String(new Date().getFullYear());

      // Copy-to-clipboard buttons and statuses
      initCopy("copyEmail", "formStatus");
      initCopy("copyEmailTech", "formStatusTech");

      // Forms submit feedback
      initForm("contactForm", "formStatus");
      initForm("contactFormTech", "formStatusTech");
    }

    return { init };
  })();








  // Init all on ready
  document.addEventListener("DOMContentLoaded", () => {
    Theme.init();
    Language.init();
    Sections.init();
    Insights.init();
    LiveDemo.init();
    TechOverlay.init();
    Forms.init();
    LaserRibbons.init();
  });
})();















/* Back to top (guard if absent) */
(() => {
  const backTop = document.querySelector('.back-to-top');
  if (!backTop) return;

  const revealAt = 200;
  function toggleBackTop(){
    const show = window.scrollY > revealAt;
    backTop.classList.toggle('is-visible', show);
    backTop.setAttribute('aria-hidden', String(!show));
  }
  window.addEventListener('scroll', toggleBackTop, { passive: true });
  toggleBackTop();

  backTop.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();



  
       /* fix chart labels */

// Helper: shorten or wrap tick labels
const wrapTick = (label) => {
  if (!label) return label;
  // ejemplo split on space for 2-line labels (Chart.js supports arrays for multi-line ticks)
  const words = label.split(' ');
  if (words.join('').length <= 10) return label;
  // Try to make at most ~10 chars per line
  let line = '';
  const lines = [];
  for (const w of words){
    if ((line + ' ' + w).trim().length > 10){
      lines.push(line.trim());
      line = w;
    } else {
      line += ' ' + w;
    }
  }
  if (line) lines.push(line.trim());
  return lines;
};


let barChartMain; // hold the instance

function initBarChart(labels, dataset) {
  const ctx = document.getElementById('barChartMain').getContext('2d');

  // Destroy if it exists (prevents “growing” canvases)
  if (barChartMain) barChartMain.destroy();

  barChartMain = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,                // e.g., ['Facebook','YouTube',...]
      datasets: [{
        label: 'Value',
        data: dataset,       // numbers
        borderWidth: 0,
        borderRadius: 6,
        maxBarThickness: 54, // avoids mega-wide bars on few items
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // respect the fixed CSS height
      animation: false,
      layout: { padding: { top: 8, right: 8, bottom: 0, left: 8 } },
      plugins: {
        legend: { display: false }, // fewer wraps = stable height
        tooltip: { mode: 'index', intersect: false },
        // If you use ChartDataLabels, move labels to the top and simplify:
        // datalabels: {
        //   anchor: 'end', align: 'end', offset: 4, clamp: true,
        //   formatter: v => (v >= 1 ? v.toFixed(1) + 'B' : v)
        // }
      },
      scales: {
        x: {
          ticks: {
            autoSkip: true,
            maxRotation: 0,
            minRotation: 0,
            padding: 6,
            callback: (val, idx) => wrapTick(this.getLabelForValue ? this.getLabelForValue(val) : labels[idx]),
          },
          grid: { display: false },
          offset: true
        },
        y: {
          beginAtZero: true,
          grace: '5%',
          grid: { color: 'rgba(255,255,255,0.08)' },
          ticks: {
            callback: v => v >= 1 ? v + '' : v // tweak if you want “B”, “M”, etc.
          }
        }
      }
    }
  });
}

function updateBarChart(labels, dataset){
  // Update in-place (no re-create)
  barChartMain.data.labels = labels;
  barChartMain.data.datasets[0].data = dataset;
  barChartMain.update('none'); // no animation => no height jitter
}

document.getElementById('filter2bMain').addEventListener('change', applyFilters);
document.getElementById('filterROIMain').addEventListener('change', applyFilters);
document.getElementById('metricSelectMain').addEventListener('change', applyFilters);
document.getElementById('resetFiltersMain').addEventListener('click', () => {
  document.getElementById('filter2bMain').checked = false;
  document.getElementById('filterROIMain').checked = false;
  applyFilters();
});

function applyFilters(){
  const twoB = document.getElementById('filter2bMain').checked;
  const roi  = document.getElementById('filterROIMain').checked;
  const metric = document.getElementById('metricSelectMain').value;

  // …derive filtered arrays from your source data…
  const { labels, data } = getFilteredData(twoB, roi, metric);

  updateBarChart(labels, data);
}
