const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");

const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");

const langBtn = document.getElementById("langBtn");
const drawerLangBtn = document.getElementById("drawerLangBtn");
const drawerThemeBtn = document.getElementById("drawerThemeBtn");

function isMobile() {
    return window.matchMedia("(max-width: 980px)").matches;
}

function openDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.add("is-open");
    drawerBackdrop.classList.add("is-show");
    drawerBackdrop.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
    if (!drawer || !drawerBackdrop) return;
    drawer.classList.remove("is-open");
    drawerBackdrop.classList.remove("is-show");
    drawerBackdrop.setAttribute("aria-hidden", "true");
}

(function initTheme() {
    const saved = localStorage.getItem("quantia_theme");
    if (saved === "dark") document.body.classList.add("theme-dark");
    themeBtn?.setAttribute(
        "aria-pressed",
        document.body.classList.contains("theme-dark") ? "true" : "false"
    );
})();

function toggleTheme() {
    document.body.classList.toggle("theme-dark");
    const isDark = document.body.classList.contains("theme-dark");
    localStorage.setItem("quantia_theme", isDark ? "dark" : "light");
    themeBtn?.setAttribute("aria-pressed", isDark ? "true" : "false");
}

themeBtn?.addEventListener("click", toggleTheme);
drawerThemeBtn?.addEventListener("click", () => {
    toggleTheme();
    closeDrawer();
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

function normalizeToFile(href) {
    try {
        const u = new URL(href, window.location.href);
        return (u.pathname.split("/").pop() || "").toLowerCase();
    } catch {
        return String(href || "").toLowerCase();
    }
}

function setActiveByHref() {
    const current = normalizeToFile(window.location.href);

    document.querySelectorAll(".nav__btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".drawer__btn").forEach((b) => b.classList.remove("is-active"));

    document.querySelectorAll(".nav__btn[data-href]").forEach((b) => {
        const f = normalizeToFile(b.getAttribute("data-href"));
        if (f && f === current) b.classList.add("is-active");
    });

    document.querySelectorAll(".drawer__btn[data-href]").forEach((b) => {
        const f = normalizeToFile(b.getAttribute("data-href"));
        if (f && f === current) b.classList.add("is-active");
    });
}

function go(href) {
    if (!href) return;
    if (isMobile()) closeDrawer();
    window.location.href = href;
}

document.querySelectorAll(".nav__btn[data-href]").forEach((btn) => {
    const href = btn.getAttribute("data-href");
    btn.addEventListener("click", () => go(href));
});

document.querySelectorAll(".drawer__btn[data-href]").forEach((btn) => {
    const href = btn.getAttribute("data-href");
    btn.addEventListener("click", () => go(href));
});

window.addEventListener("resize", () => {
    if (!isMobile()) closeDrawer();
});

setActiveByHref();


const form = document.getElementById("contactForm");
const toast = document.getElementById("toast");

function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(() => toast.classList.remove("is-show"), 1700);
}

function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim());
}

form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("cName")?.value?.trim();
    const email = document.getElementById("cEmail")?.value?.trim();
    const msg = document.getElementById("cMsg")?.value?.trim();

    if (!name || name.length < 2) return showToast("Escribe tu nombre.");
    if (!email || !isValidEmail(email)) return showToast("Escribe un email válido.");
    if (!msg || msg.length < 8) return showToast("Cuéntanos un poco más (mín. 8 caracteres).");

    showToast("Mensaje enviado. Te responderemos pronto ✅");
    form.reset();
});
