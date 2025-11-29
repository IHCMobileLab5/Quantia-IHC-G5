const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const menuBtn = document.getElementById("menuBtn");

const drawer = document.getElementById("drawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const drawerCloseBtn = document.getElementById("drawerCloseBtn");

const langBtn = document.getElementById("langBtn");
const drawerLangBtn = document.getElementById("drawerLangBtn");

const indexSel = document.getElementById("indexSel");
const indexTitle = document.getElementById("indexTitle");

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
    themeBtn?.setAttribute("aria-pressed", document.body.classList.contains("theme-dark") ? "true" : "false");
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

function setActiveByHref(href) {
    document.querySelectorAll(".nav__btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelectorAll(".drawer__btn").forEach((b) => b.classList.remove("is-active"));
    document.querySelector(`.nav__btn[data-href="${href}"]`)?.classList.add("is-active");
    document.querySelector(`.drawer__btn[data-href="${href}"]`)?.classList.add("is-active");
}

function go(href) {
    if (!href) return;
    setActiveByHref(href);
    if (isMobile()) closeDrawer();
    window.location.href = href;
}

document.querySelectorAll(".nav__btn").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.getAttribute("data-href")));
});

document.querySelectorAll(".drawer__btn").forEach((btn) => {
    btn.addEventListener("click", () => go(btn.getAttribute("data-href")));
});

(function initActiveFromUrl() {
    const file = (location.pathname.split("/").pop() || "").trim();
    if (!file) return;
    setActiveByHref(file);
})();

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

window.addEventListener("resize", () => {
    if (!isMobile()) closeDrawer();
});

document.querySelectorAll(".range__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".range__btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
    });
});

document.querySelectorAll(".seg__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".seg__btn").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
    });
});

function syncIndexTitle() {
    if (!indexSel || !indexTitle) return;
    const opt = indexSel.options[indexSel.selectedIndex];
    indexTitle.textContent = opt ? opt.textContent : "Índice";
}

indexSel?.addEventListener("change", syncIndexTitle);
syncIndexTitle();
