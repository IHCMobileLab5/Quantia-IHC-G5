const sidebar = document.getElementById("sidebar");
const toggleBtn = document.getElementById("toggleBtn");
const contentFrame = document.getElementById("contentFrame");

// Abrir y cerrar sidebar
toggleBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});

// Cargar página dentro del iframe al hacer clic
document.querySelectorAll(".menu a").forEach(link => {
    link.addEventListener("click", () => {
        const page = link.getAttribute("data-page");
        contentFrame.src = page;
    });
});
