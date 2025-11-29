const confirmCheck = document.getElementById("confirmDelete");
const deleteBtn = document.getElementById("deleteBtn");

confirmCheck.addEventListener("change", () => {
    deleteBtn.disabled = !confirmCheck.checked;
});

function goBack() {
    window.history.back();
}
