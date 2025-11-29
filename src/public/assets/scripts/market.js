// ===== Topbar / Drawer / Theme / Lang =====
const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");

const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");

const langBtn = document.getElementById("langBtn");
const drawerLangBtn = document.getElementById("drawerLangBtn");

function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
}

function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.add("is-open");
    drawerBackdrop.classList.add("is-show");
}

function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("is-open");
    drawerBackdrop.classList.remove("is-show");
}

(function initTheme() {
    const saved = localStorage.getItem("quantia_theme");
    if (saved === "dark") document.body.classList.add("theme-dark");
    themeBtn?.setAttribute(
        "aria-pressed",
        document.body.classList.contains("theme-dark") ? "true" : "false"
    );
})();

themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    const isDark = document.body.classList.contains("theme-dark");
    localStorage.setItem("quantia_theme", isDark ? "dark" : "light");
    themeBtn.setAttribute("aria-pressed", isDark ? "true" : "false");
});

backBtn?.addEventListener("click", () => history.back());

menuBtn?.addEventListener("click", () => {
    if (!isMobile()) return;
    if (drawer?.classList.contains("is-open")) closeDrawer();
    else openDrawer();
});

drawerBackdrop?.addEventListener("click", closeDrawer);
drawerCloseBtn?.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDrawer();
});

function applyLangLabel() {
    const current = localStorage.getItem("quantia_lang") || "es";
    const label = current === "es" ? "ES/EN" : "EN/ES";
    if (langBtn) langBtn.textContent = label;
    if (drawerLangBtn) drawerLangBtn.textContent = label;
}

function toggleLang() {
    const current = localStorage.getItem("quantia_lang") || "es";
    const next = current === "es" ? "en" : "es";
    localStorage.setItem("quantia_lang", next);
    applyLangLabel();
}

applyLangLabel();
langBtn?.addEventListener("click", toggleLang);
drawerLangBtn?.addEventListener("click", () => {
    toggleLang();
    closeDrawer();
});

// ===== Nav routing + active =====
function normalizeToFile(href) {
    try {
        const u = new URL(href, window.location.href);
        return (u.pathname.split("/").pop() || "").toLowerCase();
    } catch {
        return String(href || "").toLowerCase();
    }
}

function setActiveByHref(href) {
    const current = normalizeToFile(window.location.href);

    document.querySelectorAll(".nav__btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".drawer__btn").forEach((b) => b.classList.remove("is-active"));

    document.querySelectorAll(`.nav__btn[data-href]`).forEach((b) => {
        if (normalizeToFile(b.getAttribute("data-href")) === current) b.classList.add("is-active");
    });

    document.querySelectorAll(`.drawer__btn[data-href]`).forEach((b) => {
        if (normalizeToFile(b.getAttribute("data-href")) === current) b.classList.add("is-active");
    });

    // Si llaman setActiveByHref manual, también marca ese target
    const top = document.querySelector(`.nav__btn[data-href="${href}"]`);
    const mob = document.querySelector(`.drawer__btn[data-href="${href}"]`);
    top?.classList.add("is-active");
    mob?.classList.add("is-active");
}

function go(href) {
    if (!href) return;
    setActiveByHref(href);
    if (isMobile()) closeDrawer();
    window.location.href = href;
}

document.querySelectorAll(".nav__btn").forEach((btn) => {
    const href = btn.getAttribute("data-href");
    if (!href) return;
    btn.addEventListener("click", () => go(href));
});

document.querySelectorAll(".drawer__btn").forEach((btn) => {
    const href = btn.getAttribute("data-href");
    if (!href) return;
    btn.addEventListener("click", () => go(href));
});

window.addEventListener("resize", () => {
    if (!isMobile()) closeDrawer();
});

// marcar activo al cargar (Market)
setActiveByHref("market.html");

// ===== Tool Tabs (SL / TP / LEV / DOM) =====
const tabs = Array.from(document.querySelectorAll(".m-tab"));
const orderPanel = document.getElementById("orderPanel");
const levPanel = document.getElementById("levPanel");
const domPanel = document.getElementById("domPanel");

function showPanel(panelKey) {
    [orderPanel, levPanel, domPanel].forEach((p) => p?.classList.remove("is-show"));
    if (panelKey === "order") orderPanel?.classList.add("is-show");
    if (panelKey === "lev") levPanel?.classList.add("is-show");
    if (panelKey === "dom") domPanel?.classList.add("is-show");
}

function setActiveTab(key) {
    tabs.forEach((t) => t.classList.toggle("is-active", t.dataset.tab === key));

    if (key === "sl") {
        showPanel("order");
        setStopLoss(true);
        setTakeProfit(false);
    } else if (key === "tp") {
        showPanel("order");
        setTakeProfit(true);
        setStopLoss(false);
    } else if (key === "lev") {
        showPanel("lev");
    } else if (key === "dom") {
        showPanel("dom");
    }
}

tabs.forEach((t) => {
    t.addEventListener("click", () => setActiveTab(t.dataset.tab));
});

// ===== Order Form (Buy/Sell + SL/TP + Metrics) =====
const buyBtn = document.getElementById("buyBtn");
const sellBtn = document.getElementById("sellBtn");

const qty = document.getElementById("qty");
const price = document.getElementById("price");

const slBtn = document.getElementById("slBtn");
const slInline = document.getElementById("slInline");
const slInput = document.getElementById("slInput");
const slVal = document.getElementById("slVal");

const tpBtn = document.getElementById("tpBtn");
const tpInline = document.getElementById("tpInline");
const tpInput = document.getElementById("tpInput");
const tpVal = document.getElementById("tpVal");

const totalVal = document.getElementById("totalVal");
const feeVal = document.getElementById("feeVal");
const marginVal = document.getElementById("marginVal");

const confirmBtn = document.getElementById("confirmBtn");
const toast = document.getElementById("toast");

let side = "buy"; // buy | sell
function setSide(next) {
    side = next;
    buyBtn?.classList.toggle("is-active", side === "buy");
    sellBtn?.classList.toggle("is-active", side === "sell");
}

buyBtn?.addEventListener("click", () => setSide("buy"));
sellBtn?.addEventListener("click", () => setSide("sell"));

function money(n) {
    if (!Number.isFinite(n)) return "—";
    return n.toFixed(2);
}

function updateMetrics() {
    const q = parseFloat(qty?.value || "0");
    const p = parseFloat(price?.value || "0");
    if (!Number.isFinite(q) || !Number.isFinite(p) || q <= 0 || p <= 0) {
        if (totalVal) totalVal.textContent = "—";
        if (feeVal) feeVal.textContent = "—";
        if (marginVal) marginVal.textContent = "—";
        return;
    }

    const total = q * p;
    const fee = total * 0.001; // 0.10%
    const margin = total; // demo

    if (totalVal) totalVal.textContent = money(total);
    if (feeVal) feeVal.textContent = money(fee);
    if (marginVal) marginVal.textContent = money(margin);
}

qty?.addEventListener("input", () => {
    updateMetrics();
    updateLev();
});
price?.addEventListener("input", () => {
    updateMetrics();
    updateLev();
});

function setStopLoss(enabled) {
    if (!slBtn || !slInline) return;
    slBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    slInline.hidden = !enabled;
}

function setTakeProfit(enabled) {
    if (!tpBtn || !tpInline) return;
    tpBtn.setAttribute("aria-pressed", enabled ? "true" : "false");
    tpInline.hidden = !enabled;
}

slBtn?.addEventListener("click", () => {
    const pressed = slBtn.getAttribute("aria-pressed") === "true";
    setStopLoss(!pressed);
});

tpBtn?.addEventListener("click", () => {
    const pressed = tpBtn.getAttribute("aria-pressed") === "true";
    setTakeProfit(!pressed);
});

slInput?.addEventListener("input", () => {
    const v = parseFloat(slInput.value || "0");
    if (slVal) slVal.textContent = Number.isFinite(v) ? v.toFixed(2) : "—";
});

tpInput?.addEventListener("input", () => {
    const v = parseFloat(tpInput.value || "0");
    if (tpVal) tpVal.textContent = Number.isFinite(v) ? v.toFixed(2) : "—";
});

function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove("is-show"), 1700);
}

confirmBtn?.addEventListener("click", () => {
    const q = parseFloat(qty?.value || "0");
    const p = parseFloat(price?.value || "0");
    if (!Number.isFinite(q) || !Number.isFinite(p) || q <= 0 || p <= 0) {
        showToast("Completa cantidad y precio.");
        return;
    }
    showToast(`Orden ${side === "buy" ? "de compra" : "de venta"} enviada ✓`);
});

// ===== Leverage panel demo =====
const levRange = document.getElementById("levRange");
const levOut = document.getElementById("levOut");
const levMargin = document.getElementById("levMargin");
const levFee = document.getElementById("levFee");
const levExposure = document.getElementById("levExposure");

function updateLev() {
    const lev = parseInt(levRange?.value || "5", 10);
    if (levOut) levOut.textContent = String(lev);

    const q = parseFloat(qty?.value || "0");
    const p = parseFloat(price?.value || "0");
    const exposure = Number.isFinite(q) && Number.isFinite(p) ? q * p : NaN;
    const fee = Number.isFinite(exposure) ? exposure * 0.001 : NaN;
    const margin = Number.isFinite(exposure) ? exposure / Math.max(1, lev) : NaN;

    if (levExposure) levExposure.textContent = money(exposure);
    if (levFee) levFee.textContent = money(fee);
    if (levMargin) levMargin.textContent = money(margin);
}

levRange?.addEventListener("input", updateLev);

// ===== Chart click => portfolio-performance.html =====
// IMPORTANTE: asegura que el contenedor del canvas tenga id="chartStage"
const chartStage = document.getElementById("chartStage") || document.querySelector(".m-chartStage");
if (chartStage) {
    chartStage.classList.add("is-clickable");
    chartStage.setAttribute("role", "button");
    chartStage.setAttribute("tabindex", "0");

    chartStage.addEventListener("click", () => {
        window.location.href = "portfolio-performance.html";
    });

    chartStage.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            window.location.href = "portfolio-performance.html";
        }
    });
}

// ===== Draw candlestick (ANIMADO, no quieto) =====
const canvas = document.getElementById("chart");
const ctx = canvas?.getContext?.("2d");

let candles = [];
const MAX_CANDLES = 44;
let lastClose = 0.00925;
let chartTimer = null;

function fitCanvas() {
    if (!canvas || !ctx) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    const w = Math.max(10, Math.floor(rect.width));
    const h = Math.max(10, Math.floor(rect.height));

    if (canvas._cssW === w && canvas._cssH === h && canvas._dpr === dpr) return;

    canvas._cssW = w;
    canvas._cssH = h;
    canvas._dpr = dpr;

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeNextCandle() {
    const open = lastClose;
    const delta = (Math.random() - 0.48) * 0.00014; // volatilidad
    const close = Math.max(0.0001, open + delta);

    const high = Math.max(open, close) + Math.random() * 0.00011;
    const low = Math.min(open, close) - Math.random() * 0.00011;

    lastClose = close;
    return { open, close, high, low };
}

function seedCandles() {
    candles = [];
    lastClose = 0.00925;
    for (let i = 0; i < MAX_CANDLES; i++) candles.push(makeNextCandle());
}

function drawChart() {
    if (!ctx || !canvas) return;

    fitCanvas();

    const W = canvas._cssW || canvas.width;
    const H = canvas._cssH || canvas.height;

    const pad = 18;
    const chartW = W - pad * 2;
    const chartH = H - pad * 2;

    const minL = Math.min(...candles.map((c) => c.low));
    const maxH = Math.max(...candles.map((c) => c.high));
    const y = (v) => pad + (maxH - v) * (chartH / (maxH - minL || 1));

    ctx.clearRect(0, 0, W, H);

    // grid
    ctx.strokeStyle = "rgba(15,23,42,.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
        const yy = pad + (chartH / 8) * i;
        ctx.beginPath();
        ctx.moveTo(pad, yy);
        ctx.lineTo(W - pad, yy);
        ctx.stroke();
    }
    for (let i = 0; i <= 12; i++) {
        const xx = pad + (chartW / 12) * i;
        ctx.beginPath();
        ctx.moveTo(xx, pad);
        ctx.lineTo(xx, H - pad);
        ctx.stroke();
    }

    // candles
    const gap = 6;
    const cw = Math.max(
        6,
        Math.floor((chartW - gap * (candles.length - 1)) / candles.length)
    );

    candles.forEach((c, i) => {
        const x = pad + i * (cw + gap);
        const isUp = c.close >= c.open;

        // wick
        ctx.strokeStyle = isUp ? "#18b576" : "#ef4444";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + cw / 2, y(c.high));
        ctx.lineTo(x + cw / 2, y(c.low));
        ctx.stroke();

        // body
        const top = y(Math.max(c.open, c.close));
        const bot = y(Math.min(c.open, c.close));
        const bh = Math.max(3, bot - top);

        ctx.fillStyle = isUp ? "#18b576" : "#ef4444";
        ctx.fillRect(x, top, cw, bh);
    });

    // OHLC (última vela)
    const last = candles[candles.length - 1];
    const oEl = document.getElementById("oVal");
    const lEl = document.getElementById("lVal");
    const hEl = document.getElementById("hVal");
    const cEl = document.getElementById("cVal");
    if (oEl) oEl.textContent = last.open.toFixed(5);
    if (lEl) lEl.textContent = last.low.toFixed(5);
    if (hEl) hEl.textContent = last.high.toFixed(5);
    if (cEl) cEl.textContent = last.close.toFixed(5);
}

function startChartAnimation() {
    if (!ctx || !canvas) return;
    if (chartTimer) window.clearInterval(chartTimer);

    seedCandles();
    drawChart();

    chartTimer = window.setInterval(() => {
        candles.push(makeNextCandle());
        if (candles.length > MAX_CANDLES) candles.shift();
        drawChart();
    }, 900);
}

// ===== init =====
updateMetrics();
updateLev();
setActiveTab("sl"); // empieza como tu 2da imagen (Stop-Loss activo)
startChartAnimation();
window.addEventListener("resize", () => drawChart());
