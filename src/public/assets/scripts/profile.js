document.querySelector(".editar").addEventListener("click", () => {
    alert("Modo edición activado");
});

document.querySelector(".kyc").addEventListener("click", () => {
    alert("Verificación KYC iniciada");
});

const confirmCheck = document.getElementById("confirmDelete");
const deleteBtn = document.getElementById("deleteBtn");

confirmCheck.addEventListener("change", () => {
    deleteBtn.disabled = !confirmCheck.checked;
});

function goBack() {
    window.history.back();
}
