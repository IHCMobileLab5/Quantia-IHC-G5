const API_BASE = "http://localhost:3000/api/v1";
const USERS_URL = `${API_BASE}/users`;

let toastTimer = null;

function toastIconSvg(type) {
    if (type === "error") {
        return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 8v5" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M12 17h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
        <path d="M10.3 3.3h3.4L22 21H2L10.3 3.3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
      </svg>`;
    }
    if (type === "info") {
        return `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22a10 10 0 1 0-10-10 10 10 0 0 0 10 10Z" fill="none" stroke="currentColor" stroke-width="2"/>
        <path d="M12 10v6" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
        <path d="M12 7h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
      </svg>`;
    }
    return `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 7 10.5 16.5 4 10" fill="none" stroke="currentColor" stroke-width="2.8"
            stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
}

function showToast({ title = "Listo", message = "", ms = 2400, type = "success" } = {}) {
    const toast = document.querySelector("#toast");
    const tTitle = document.querySelector("#toastTitle");
    const tMsg = document.querySelector("#toastMsg");
    const tClose = document.querySelector("#toastClose");
    const tIcon = document.querySelector("#toastIcon");
    if (!toast || !tTitle || !tMsg || !tClose || !tIcon) return;

    tTitle.textContent = title;
    tMsg.textContent = message;
    tIcon.innerHTML = toastIconSvg(type);

    toast.dataset.type = type;
    clearTimeout(toastTimer);

    toast.hidden = false;
    toast.classList.remove("is-hide");
    toast.classList.add("is-show");

    const hide = () => {
        toast.classList.remove("is-show");
        toast.classList.add("is-hide");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.hidden = true;
            toast.classList.remove("is-hide");
        }, 220);
    };

    tClose.onclick = hide;
    toastTimer = setTimeout(hide, ms);
}

function readSessionUser() {
    try {
        return JSON.parse(localStorage.getItem("quantia_user") || "null");
    } catch {
        return null;
    }
}
function saveSessionUser(user) {
    localStorage.setItem("quantia_user", JSON.stringify(user));
}

function splitName(fullName) {
    const t = String(fullName || "").trim().split(/\s+/).filter(Boolean);
    if (t.length === 0) return { nombre: "", apellido: "" };
    if (t.length === 1) return { nombre: t[0], apellido: "" };
    return { nombre: t[0], apellido: t.slice(1).join(" ") };
}

function isValidGmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return /^[a-z0-9._%+-]+@gmail\.com$/.test(e);
}
function isValidDni(dni) {
    const d = String(dni || "").trim();
    return d === "" || /^\d{8}$/.test(d);
}
function isValidPhone(phone) {
    const p = String(phone || "").trim();
    return p === "" || /^\d{9}$/.test(p);
}

function setReadOnly(isReadOnly) {
    ["nombre", "apellido", "telefono", "dni", "email"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.readOnly = isReadOnly;
    });
}

function clearFieldErrors() {
    ["nombre","apellido","telefono","dni","email","confirmPassword"].forEach((k) => {
        const err = document.getElementById(`${k}Error`);
        if (err) err.textContent = "";
    });
    document.querySelectorAll(".field").forEach((f) => f.classList.remove("has-error"));
}

function setFieldError(inputId, msg) {
    const input = document.getElementById(inputId);
    const err = document.getElementById(`${inputId}Error`);
    if (err) err.textContent = msg || "";
    if (input) input.closest(".field")?.classList.toggle("has-error", Boolean(msg));
}

function getFormValues() {
    return {
        nombre: String(document.getElementById("nombre")?.value || "").trim(),
        apellido: String(document.getElementById("apellido")?.value || "").trim(),
        telefono: String(document.getElementById("telefono")?.value || "").trim(),
        dni: String(document.getElementById("dni")?.value || "").trim(),
        email: String(document.getElementById("email")?.value || "").trim().toLowerCase(),
    };
}

async function fetchUserById(id) {
    const res = await fetch(`${USERS_URL}/${encodeURIComponent(id)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo leer tu perfil desde la API.");
    return res.json();
}

async function emailExistsForAnotherUser(email, currentId) {
    const url = `${USERS_URL}?email=${encodeURIComponent(String(email).trim().toLowerCase())}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo validar el correo.");
    const data = await res.json();
    return Array.isArray(data) && data.some((u) => String(u.id) !== String(currentId));
}

async function patchUser(id, payload) {
    if (!payload || typeof payload !== "object") {
        throw new Error("Nada por guardar.");
    }
    const res = await fetch(`${USERS_URL}/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "No se pudo actualizar el perfil.");
    }
    return res.json();
}

let sessionUser = readSessionUser();
let originalSnapshot = null;
let pendingPayload = null;
let isEditing = false;
let lastFocusEl = null;

function setVerificationBadge(user) {
    const badge = document.getElementById("verificationBadge");
    if (!badge) return;
    const status = String(user?.verificationStatus || "UNKNOWN").toUpperCase();
    badge.textContent = `VERIFICACIÓN: ${status}`;
    badge.dataset.status = status;
}

function fillFormFromUser(user) {
    const fromSeparate = { nombre: user?.nombre ?? "", apellido: user?.apellido ?? "" };
    const fromName = splitName(user?.name ?? "");
    const nombre = String(fromSeparate.nombre || fromName.nombre || "").trim();
    const apellido = String(fromSeparate.apellido || fromName.apellido || "").trim();

    const nombreEl = document.getElementById("nombre");
    const apellidoEl = document.getElementById("apellido");
    const telefonoEl = document.getElementById("telefono");
    const dniEl = document.getElementById("dni");
    const emailEl = document.getElementById("email");

    if (nombreEl) nombreEl.value = nombre;
    if (apellidoEl) apellidoEl.value = apellido;
    if (telefonoEl) telefonoEl.value = String(user?.telefono ?? "");
    if (dniEl) dniEl.value = String(user?.dni ?? "");
    if (emailEl) emailEl.value = String(user?.email ?? "");
}

function refreshPhoneCallout(user) {
    const callout = document.getElementById("phoneCallout");
    if (!callout) return;
    const phone = String(user?.telefono ?? "").trim();
    callout.hidden = phone.length > 0;
}

function openConfirmModal() {
    const m = document.getElementById("confirmModal");
    const p = document.getElementById("confirmPassword");
    if (!m) return;

    lastFocusEl = document.activeElement;

    m.hidden = false;
    m.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    setTimeout(() => {
        if (p) {
            p.value = "";
            p.focus();
        } else {
            m.querySelector('[tabindex="-1"]')?.focus();
        }
    }, 0);
}

function closeConfirmModal() {
    const m = document.getElementById("confirmModal");
    if (!m) return;

    m.hidden = true;
    m.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
        lastFocusEl.focus();
    }
}

function startEditMode() {
    isEditing = true;
    setReadOnly(false);

    document.getElementById("editBtn")?.setAttribute("hidden", "true");
    document.getElementById("saveBtn")?.removeAttribute("hidden");

    showToast({ title: "Modo edición", message: "Edita y luego guarda tus cambios.", type: "info", ms: 1600 });
}

function stopEditMode() {
    isEditing = false;
    setReadOnly(true);

    document.getElementById("saveBtn")?.setAttribute("hidden", "true");
    document.getElementById("editBtn")?.removeAttribute("hidden");
}

async function onSubmitProfile(e) {
    e.preventDefault();

    if (!sessionUser?.id) {
        window.location.href = "login.html";
        return;
    }
    if (!isEditing) {
        showToast({ title: "Primero edita", message: "Presiona “Editar” para habilitar cambios.", type: "info", ms: 1800 });
        return;
    }

    clearFieldErrors();

    const { nombre, apellido, telefono, dni, email } = getFormValues();

    let ok = true;
    if (!nombre) { setFieldError("nombre", "El nombre es obligatorio."); ok = false; }
    if (!apellido) { setFieldError("apellido", "El apellido es obligatorio."); ok = false; }
    if (!isValidPhone(telefono)) { setFieldError("telefono", "Teléfono inválido (usa 9 dígitos)."); ok = false; }
    if (!isValidDni(dni)) { setFieldError("dni", "DNI inválido (8 dígitos)."); ok = false; }
    if (!email) { setFieldError("email", "El correo es obligatorio."); ok = false; }
    else if (!isValidGmail(email)) { setFieldError("email", "Usa un Gmail válido (usuario@gmail.com)."); ok = false; }

    if (!ok) {
        showToast({ title: "Revisa los campos", message: "Corrige los errores marcados.", type: "error", ms: 2400 });
        return;
    }

    const prevEmail = String(originalSnapshot?.email ?? "").trim().toLowerCase();
    const prevPhone = String(originalSnapshot?.telefono ?? "").trim();

    const phoneChanged = telefono !== prevPhone;
    const emailChanged = email !== prevEmail;

    const currentName = `${String(sessionUser?.nombre ?? splitName(sessionUser?.name ?? "").nombre ?? "").trim()} ${String(sessionUser?.apellido ?? splitName(sessionUser?.name ?? "").apellido ?? "").trim()}`.trim();
    const newName = `${nombre} ${apellido}`.trim();

    const dniChanged = String(dni) !== String(sessionUser?.dni ?? "");
    const nameChanged = newName !== currentName;

    const anyChanged = phoneChanged || emailChanged || dniChanged || nameChanged;

    if (!anyChanged) {
        showToast({ title: "Nada por confirmar", message: "No hiciste cambios. Vuelve a editar y guarda otra vez.", type: "info", ms: 2200 });
        return;
    }

    if (emailChanged) {
        const exists = await emailExistsForAnotherUser(email, sessionUser.id);
        if (exists) {
            setFieldError("email", "Ese correo ya está registrado.");
            showToast({ title: "Correo ya registrado", message: "Prueba con otro Gmail.", type: "error", ms: 2600 });
            return;
        }
    }

    const willUpdate = {
        nombre,
        apellido,
        telefono,
        dni,
        email,
        name: newName,
    };

    if (phoneChanged || emailChanged) {
        pendingPayload = {
            ...willUpdate,
            ...(emailChanged ? { verificationStatus: "PENDING", verificationHint: "Simulado: se enviaría un correo de verificación." } : {}),
        };
        openConfirmModal();
        return;
    }

    await doPatchAndRefresh(willUpdate, { showVerifyToast: false });
}

async function doPatchAndRefresh(payload, { showVerifyToast }) {
    const saveBtn = document.getElementById("saveBtn");
    const oldText = saveBtn?.textContent || "Guardar cambios";

    try {
        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "GUARDANDO..."; }

        const updated = await patchUser(sessionUser.id, payload);

        sessionUser = updated;
        saveSessionUser(updated);

        originalSnapshot = {
            email: String(updated?.email ?? "").trim().toLowerCase(),
            telefono: String(updated?.telefono ?? "").trim(),
        };

        fillFormFromUser(updated);
        setVerificationBadge(updated);
        refreshPhoneCallout(updated);

        showToast({
            title: "Cambios guardados",
            message: showVerifyToast
                ? "Perfil actualizado. Verificación de correo: pendiente (simulado)."
                : "Tu perfil se actualizó correctamente.",
            type: "success",
            ms: 2400,
        });

        stopEditMode();
    } catch (err) {
        showToast({ title: "Error", message: err?.message || "No se pudo guardar.", type: "error", ms: 2800 });
    } finally {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = oldText; }
    }
}

async function onConfirmSave() {
    clearFieldErrors();

    if (!pendingPayload || typeof pendingPayload !== "object") {
        showToast({ title: "Nada por confirmar", message: "No hay cambios pendientes.", type: "info", ms: 2000 });
        closeConfirmModal();
        return;
    }

    const pass = String(document.getElementById("confirmPassword")?.value || "");
    if (!pass) {
        setFieldError("confirmPassword", "Ingresa tu contraseña actual.");
        return;
    }

    try {
        const current = await fetchUserById(sessionUser.id);
        const realPass = String(current?.password ?? "");

        if (pass !== realPass) {
            setFieldError("confirmPassword", "Contraseña incorrecta.");
            showToast({ title: "Acción no permitida", message: "Contraseña incorrecta.", type: "error", ms: 2200 });
            return;
        }

        const emailPrev = String(originalSnapshot?.email ?? "").trim().toLowerCase();
        const emailNow = String(pendingPayload?.email ?? "").trim().toLowerCase();
        const emailChanged = emailNow && emailNow !== emailPrev;

        closeConfirmModal();
        await doPatchAndRefresh(pendingPayload, { showVerifyToast: emailChanged });
        pendingPayload = null;
    } catch (err) {
        showToast({ title: "Error", message: err?.message || "No se pudo validar.", type: "error", ms: 2600 });
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    document.getElementById("backBtn")?.addEventListener("click", () => window.history.back());

    if (!sessionUser?.id) {
        window.location.href = "login.html";
        return;
    }

    setReadOnly(true);

    try {
        const fresh = await fetchUserById(sessionUser.id);
        sessionUser = fresh;
        saveSessionUser(fresh);

        originalSnapshot = {
            email: String(fresh?.email ?? "").trim().toLowerCase(),
            telefono: String(fresh?.telefono ?? "").trim(),
        };

        fillFormFromUser(fresh);
        setVerificationBadge(fresh);
        refreshPhoneCallout(fresh);
    } catch (err) {
        showToast({ title: "Error", message: err?.message || "No se pudo cargar perfil.", type: "error", ms: 2800 });
    }

    document.getElementById("editBtn")?.addEventListener("click", startEditMode);
    document.getElementById("profileForm")?.addEventListener("submit", onSubmitProfile);

    document.getElementById("cancelConfirmBtn")?.addEventListener("click", () => {
        pendingPayload = null;
        closeConfirmModal();
    });

    document.getElementById("confirmSaveBtn")?.addEventListener("click", onConfirmSave);

    document.getElementById("confirmModal")?.addEventListener("click", (ev) => {
        if (ev.target?.id === "confirmModal") {
            pendingPayload = null;
            closeConfirmModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            pendingPayload = null;
            closeConfirmModal();
        }
    });

    document.getElementById("addPhoneBtn")?.addEventListener("click", () => {
        startEditMode();
        document.getElementById("telefono")?.focus();
    });

    document.getElementById("kycBtn")?.addEventListener("click", () => {
        showToast({ title: "KYC", message: "Verificación KYC iniciada (demo).", type: "info", ms: 2000 });
    });

    document.getElementById("plusBtn")?.addEventListener("click", () => {
        showToast({ title: "Acción rápida", message: "Próximamente 👀", type: "info", ms: 1600 });
    });

    document.getElementById("deleteAccountBtn")?.addEventListener("click", () => {
        window.location.href = "delete-account.html";
    });

    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        localStorage.removeItem("quantia_user");
        showToast({ title: "Sesión cerrada", message: "Hasta pronto.", type: "success", ms: 1200 });
        setTimeout(() => (window.location.href = "login.html"), 900);
    });
});
