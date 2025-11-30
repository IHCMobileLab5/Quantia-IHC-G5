const API_BASE = "http://localhost:3000/api/v1";
const USERS_URL = `${API_BASE}/users`;

function readSessionUser() {
    try { return JSON.parse(localStorage.getItem("quantia_user") || "null"); }
    catch { return null; }
}

let sessionUser = readSessionUser();
let userFresh = null;

function get2faKey(userId) { return `quantia_2fa_${userId}`; }

function generate6DigitCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function save2fa(userId, code, ttlMs = 2 * 60 * 1000) {
    localStorage.setItem(get2faKey(userId), JSON.stringify({ code, exp: Date.now() + ttlMs }));
}

function read2fa(userId) {
    try { return JSON.parse(localStorage.getItem(get2faKey(userId)) || "null"); }
    catch { return null; }
}

function is2faValid(userId, inputCode) {
    const data = read2fa(userId);
    if (!data?.code || !data?.exp) return { ok: false, reason: "NO_CODE" };
    if (Date.now() > Number(data.exp)) return { ok: false, reason: "EXPIRED" };
    if (String(inputCode).trim() !== String(data.code)) return { ok: false, reason: "WRONG" };
    return { ok: true };
}

async function fetchUserById(id) {
    const res = await fetch(`${USERS_URL}/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo obtener tu usuario.");
    return res.json();
}

async function deleteUser(id) {
    const res = await fetch(`${USERS_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "No se pudo eliminar la cuenta.");
    }
    return true;
}

function getUserBalance(u) {
    const v = u?.balance ?? u?.saldo ?? 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}

function clearSessionAndGoLogin() {
    localStorage.removeItem("quantia_user");
    if (sessionUser?.id) localStorage.removeItem(get2faKey(sessionUser.id));
    window.location.href = "login.html";
}

let toastTimer = null;
function showToast(title, message, ms = 2200) {
    const toast = document.getElementById("toast");
    const tTitle = document.getElementById("toastTitle");
    const tMsg = document.getElementById("toastMsg");
    const tClose = document.getElementById("toastClose");
    if (!toast || !tTitle || !tMsg || !tClose) return;

    tTitle.textContent = title || "Listo";
    tMsg.textContent = message || "";

    clearTimeout(toastTimer);
    toast.hidden = false;

    toastTimer = setTimeout(() => (toast.hidden = true), ms);
    tClose.onclick = () => (toast.hidden = true);
}

function modalOpen(modalEl, focusEl) {
    if (!modalEl) return;
    modalEl.hidden = false;
    modalEl.style.display = "grid";
    modalEl.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    setTimeout(() => focusEl?.focus?.(), 0);
}

function modalClose(modalEl) {
    if (!modalEl) return;
    modalEl.hidden = true;
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
}

document.addEventListener("DOMContentLoaded", async () => {

    const backBtn = document.getElementById("backBtn");
    const balanceValue = document.getElementById("balanceValue");

    const confirmCheck = document.getElementById("confirmDelete");
    const deleteBtn = document.getElementById("deleteBtn");

    const genCodeBtn = document.getElementById("genCodeBtn");
    const genHint = document.getElementById("genHint");

    const codeInput = document.getElementById("codeInput");
    const codeError = document.getElementById("codeError");

    const passModal = document.getElementById("passModal");
    const passInput = document.getElementById("passInput");
    const passError = document.getElementById("passError");
    const cancelPassBtn = document.getElementById("cancelPassBtn");
    const confirmPassBtn = document.getElementById("confirmPassBtn");

    if (passModal) passModal.style.display = "none";

    if (!sessionUser?.id) {
        window.location.href = "login.html";
        return;
    }

    backBtn?.addEventListener("click", () => window.history.back());

    try {
        userFresh = await fetchUserById(sessionUser.id);
        balanceValue.textContent = String(getUserBalance(userFresh));

        const data = read2fa(sessionUser.id);
        if (data?.code && Date.now() < Number(data.exp || 0)) {
            genHint.textContent = `Código activo (demo): ${data.code}`;
        }
    } catch (err) {
        balanceValue.textContent = "—";
        showToast("Error", err?.message || "No se pudo cargar tu información.", 2600);
    }

    function updateDeleteBtnState() {
        deleteBtn.disabled = !confirmCheck.checked;
    }
    confirmCheck?.addEventListener("change", updateDeleteBtnState);
    updateDeleteBtnState();

    genCodeBtn?.addEventListener("click", () => {
        passError.textContent = "";
        passInput.value = "";
        modalOpen(passModal, passInput);
    });

    cancelPassBtn?.addEventListener("click", (e) => {
        e.preventDefault();
        modalClose(passModal);
    });

    passModal?.addEventListener("click", (ev) => {
        if (ev.target === passModal) modalClose(passModal);
    });

    document.addEventListener("keydown", (e) => {
        if (!passModal.hidden && e.key === "Escape") modalClose(passModal);
    });

    confirmPassBtn?.addEventListener("click", async (e) => {
        e.preventDefault();
        passError.textContent = "";

        const pass = String(passInput.value || "");
        if (!pass) {
            passError.textContent = "Ingresa tu contraseña.";
            return;
        }

        try {
            const fresh = userFresh || (await fetchUserById(sessionUser.id));
            const realPass = String(fresh?.password ?? "");

            if (pass !== realPass) {
                passError.textContent = "Contraseña incorrecta.";
                showToast("Acción no permitida", "La contraseña no coincide.", 2200);
                return;
            }

            const code = generate6DigitCode();
            save2fa(sessionUser.id, code);


            modalClose(passModal);

            genHint.textContent = `Código generado (demo): ${code}`;
            showToast("2FA listo", "Código generado. Ingresa el código para continuar.", 2400);
        } catch (err) {
            showToast("Error", err?.message || "No se pudo validar la contraseña.", 2600);
        }
    });

    deleteBtn?.addEventListener("click", async () => {
        codeError.textContent = "";

        if (!confirmCheck.checked) {
            showToast("Falta confirmar", "Marca la casilla para continuar.", 2200);
            return;
        }

        const bal = getUserBalance(userFresh);
        if (bal !== 0) {
            showToast("Saldo no permitido", "Tu saldo debe ser 0 para eliminar la cuenta.", 2600);
            return;
        }

        const inputCode = String(codeInput.value || "").trim();
        if (!/^\d{6}$/.test(inputCode)) {
            codeError.textContent = "Código inválido (debe tener 6 dígitos).";
            showToast("Revisa el código", "Ingresa un 2FA válido.", 2400);
            return;
        }

        const v = is2faValid(sessionUser.id, inputCode);
        if (!v.ok) {
            if (v.reason === "NO_CODE") {
                codeError.textContent = "Primero genera un código 2FA.";
                showToast("Genera tu 2FA", "Presiona “Generar código”.", 2400);
                return;
            }
            if (v.reason === "EXPIRED") {
                codeError.textContent = "Tu código expiró. Genera uno nuevo.";
                showToast("Código expirado", "Genera un nuevo 2FA.", 2400);
                return;
            }
            codeError.textContent = "Código incorrecto.";
            showToast("Código incorrecto", "Revisa e intenta otra vez.", 2400);
            return;
        }

        deleteBtn.disabled = true;
        genCodeBtn.disabled = true;
        confirmCheck.disabled = true;
        codeInput.readOnly = true;

        showToast("Hasta pronto 👋", "Gracias por usar Quantia.", 5000);

        setTimeout(async () => {
            try {
                await deleteUser(sessionUser.id);
                clearSessionAndGoLogin();
            } catch (err) {
                showToast("Error", err?.message || "No se pudo eliminar.", 2600);

                deleteBtn.disabled = !confirmCheck.checked;
                genCodeBtn.disabled = false;
                confirmCheck.disabled = false;
                codeInput.readOnly = false;
            }
        }, 5000);
    });
});
