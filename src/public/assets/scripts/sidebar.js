const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const contentFrame = document.getElementById("contentFrame");

toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        const page = link.getAttribute("data-page");
        contentFrame.src = page;
    });
});

window.addEventListener("DOMContentLoaded", () => {
    contentFrame.src = "profile.html";

    const defaultLink = document.querySelector('.menu a[data-page="profile.html"]');
    if (defaultLink) defaultLink.classList.add("active");
});