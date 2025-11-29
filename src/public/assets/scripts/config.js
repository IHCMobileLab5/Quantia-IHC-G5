document.querySelectorAll(".config-item").forEach(item => {
    item.addEventListener("click", () => {
        const page = item.getAttribute("data-page");

            if (window.parent && window.parent.document.getElementById("contentFrame")) {
            window.parent.document.getElementById("contentFrame").src = page;
        }
    });
});
