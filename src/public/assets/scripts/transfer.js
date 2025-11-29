const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");
const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");
const langBtn = document.getElementById("langBtn");
const drawerLangBtn = document.getElementById("drawerLangBtn");
const toast = document.getElementById("toast");

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
    showToast(next === "es" ? "Idioma: Español (demo)" : "Language: English (demo)");
}

applyLangLabel();
langBtn?.addEventListener("click", toggleLang);
drawerLangBtn?.addEventListener("click", () => {
    toggleLang();
    closeDrawer();
});


function go(href) {
    if (!href) return;
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


function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove("is-show"), 1700);
}


const tabs = Array.from(document.querySelectorAll(".t-tab"));
const depositPanel = document.getElementById("depositPanel");
const withdrawPanel = document.getElementById("withdrawPanel");
const savedPanel = document.getElementById("savedPanel");
const historyPanel = document.getElementById("historyPanel");

function showPanel(key) {
    [depositPanel, withdrawPanel, savedPanel, historyPanel].forEach((p) => p?.classList.remove("is-show"));

    if (key === "deposit") depositPanel?.classList.add("is-show");
    if (key === "withdraw") withdrawPanel?.classList.add("is-show");
    if (key === "saved") savedPanel?.classList.add("is-show");
    if (key === "history") historyPanel?.classList.add("is-show");
}

function setActiveTab(key) {
    tabs.forEach((t) => {
        const active = t.dataset.tab === key;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", active ? "true" : "false");
    });
    showPanel(key);
}

tabs.forEach((t) => t.addEventListener("click", () => setActiveTab(t.dataset.tab || "deposit")));


const bankRef = document.getElementById("bankRef");
function genRef() {
    const n = Math.floor(100000 + Math.random() * 900000);
    return `QNT-${n}`;
}
if (bankRef) bankRef.textContent = genRef();

const copyAddrBtn = document.getElementById("copyAddrBtn");
const newAddrBtn = document.getElementById("newAddrBtn");
const cryptoAddr = document.getElementById("cryptoAddress");

copyAddrBtn?.addEventListener("click", async () => {
    const text = cryptoAddr?.value || "";
    try {
        await navigator.clipboard.writeText(text);
        showToast("Dirección copiada ✓");
    } catch {
        showToast("No se pudo copiar (demo).");
    }
});

newAddrBtn?.addEventListener("click", () => {
    if (!cryptoAddr) return;
    const rnd = Math.random().toString(16).slice(2, 8);
    cryptoAddr.value = `TQnTiaDemo_${rnd}...${Math.random().toString(16).slice(2, 4)}`;
    showToast("Nueva dirección generada ✓");
});

document.getElementById("cardDepositBtn")?.addEventListener("click", () => showToast("Depósito por tarjeta enviado ✓ (demo)"));
document.getElementById("bankDepositBtn")?.addEventListener("click", () => showToast("Depósito por transferencia enviado ✓ (demo)"));

document.getElementById("withdrawBankBtn")?.addEventListener("click", () => showToast("Solicitud de retiro bancario ✓ (demo)"));
document.getElementById("withdrawCryptoBtn")?.addEventListener("click", () => showToast("Solicitud de retiro cripto ✓ (demo)"));

["verify2faBtn1", "verify2faBtn2", "verify2faBtn3"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => showToast("Verificación 2FA solicitada ✓ (demo)"));
});

document.getElementById("saveMethodBtn")?.addEventListener("click", () => showToast("Método guardado ✓ (demo)"));


document.getElementById("savedList")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='delete']");
    if (!btn) return;
    const item = btn.closest(".t-item");
    item?.remove();
    showToast("Método eliminado ✓ (demo)");
});


document.getElementById("applyFilterBtn")?.addEventListener("click", () => {
    const type = document.getElementById("histType")?.value || "all";
    const status = document.getElementById("histStatus")?.value || "all";
    const q = (document.getElementById("histQuery")?.value || "").trim().toLowerCase();

    document.querySelectorAll("#historyList .t-move").forEach((row) => {
        const rt = row.getAttribute("data-type") || "";
        const rs = row.getAttribute("data-status") || "";
        const txt = row.textContent.toLowerCase();

        const okType = type === "all" || rt === type;
        const okStatus = status === "all" || rs === status;
        const okQuery = !q || txt.includes(q);

        row.style.display = okType && okStatus && okQuery ? "" : "none";
    });

    showToast("Filtro aplicado ✓");
});

setActiveTab("deposit");
