const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const backdrop = document.getElementById("backdrop");
const contentFrame = document.getElementById("contentFrame");
const home = document.getElementById("home");
const backBtn = document.getElementById("backBtn");
const themeBtn = document.getElementById("themeBtn");
const signOutBtn = document.getElementById("signOutBtn");

function isMobile() {
    return window.matchMedia("(max-width: 1023px)").matches;
}

function openSidebar() {
    sidebar.classList.add("open");
    if (isMobile()) backdrop.classList.add("show");
}

function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("show");
}

toggleBtn?.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) closeSidebar();
    else openSidebar();
});

backdrop?.addEventListener("click", closeSidebar);


function loadPage(page) {
    if (!page) return;

    home.hidden = true;
    contentFrame.hidden = false;
    contentFrame.src = page;

    localStorage.setItem("quantia_last_page", page);

    document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));
    const activeLink = document.querySelector(`.menu a[data-page="${page}"]`);
    activeLink?.classList.add("active");

    if (isMobile()) closeSidebar();
}

document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        const page = link.getAttribute("data-page");
        loadPage(page);
    });
});

backBtn?.addEventListener("click", () => {
    try {
        if (!contentFrame.hidden && contentFrame.contentWindow?.history?.length > 1) {
            contentFrame.contentWindow.history.back();
            return;
        }
    } catch (_) {}
    history.back();
});


(function initTheme() {
    const saved = localStorage.getItem("quantia_theme");
    if (saved === "dark") document.body.classList.add("theme-dark");
})();

themeBtn?.addEventListener("click", () => {
    document.body.classList.toggle("theme-dark");
    localStorage.setItem("quantia_theme", document.body.classList.contains("theme-dark") ? "dark" : "light");
});


signOutBtn?.addEventListener("click", () => {
    localStorage.removeItem("quantia_user");
    localStorage.removeItem("quantia_last_page");
    window.location.href = "login.html";
});


const last = localStorage.getItem("quantia_last_page");
if (last) loadPage(last);
