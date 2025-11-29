const API_BASE = "http://localhost:3000/api/v1";
const USERS_URL = `${API_BASE}/users`;

let toastTimer = null;

function showToast({ title = "Listo", message = "", ms = 2200, type = "success" } = {}) {
    const toast = document.querySelector("#toast");
    const tTitle = document.querySelector("#toastTitle");
    const tMsg = document.querySelector("#toastMsg");
    const tClose = document.querySelector("#toastClose");
    if (!toast || !tTitle || !tMsg || !tClose) return;

    tTitle.textContent = title;
    tMsg.textContent = message;
    toast.dataset.type = type;

    const hide = () => {
        toast.classList.remove("is-show");
        toast.classList.add("is-hide");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.hidden = true;
            toast.classList.remove("is-hide");
        }, 500);
    };

    clearTimeout(toastTimer);
    toast.hidden = false;
    toast.classList.remove("is-hide");
    toast.classList.add("is-show");

    tClose.onclick = hide;
    toastTimer = setTimeout(hide, ms);
}

function setupPasswordToggles() {
    document.querySelectorAll(".eye[data-toggle]").forEach((btn) => {
        const sel = btn.getAttribute("data-toggle");
        const input = document.querySelector(sel);
        if (!input) return;

        const setState = (isHidden) => {
            btn.classList.toggle("is-hidden", isHidden);
            btn.setAttribute("aria-label", isHidden ? "Mostrar contraseña" : "Ocultar contraseña");
        };

        setState(true);

        btn.addEventListener("click", () => {
            const hiddenNow = input.type === "password";
            input.type = hiddenNow ? "text" : "password";
            setState(!hiddenNow);
            input.focus();
        });
    });
}

/* =========================
   VALIDACIONES (tests)
   ========================= */
function isValidGmail(email) {
    const e = String(email || "").trim().toLowerCase();
    return /^[a-z0-9._%+-]+@gmail\.com$/.test(e);
}

function passwordMeetsRule(password) {
    const p = String(password || "");
    return p.length >= 8 && /[a-zA-Z]/.test(p) && /[0-9]/.test(p);
}

function getPasswordRuleMessage() {
    return "La contraseña debe tener mínimo 8 caracteres e incluir letras y números.";
}

async function emailExists(email) {
    const url = `${USERS_URL}?email=${encodeURIComponent(String(email).trim().toLowerCase())}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudo validar el correo.");
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
}

async function createUser({ name, email, password }) {
    const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        createdAt: new Date().toISOString(),
        verificationStatus: "PENDING",
        verificationHint: "Simulado: se enviaría un correo de verificación.",
    };

    const res = await fetch(USERS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "No se pudo crear la cuenta.");
    }

    return res.json();
}

function setupRegisterForm() {
    const form = document.querySelector("#registerForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const fd = new FormData(form);
        const name = String(fd.get("name") || "");
        const email = String(fd.get("email") || "");
        const password = String(fd.get("password") || "");
        const confirmPassword = String(fd.get("confirmPassword") || "");
        const terms = fd.get("terms") === "on";

        if (!name.trim() || !email.trim() || !password || !confirmPassword) {
            showToast({ title: "Faltan datos", message: "Completa todos los campos para continuar.", ms: 2400, type: "error" });
            return;
        }

        if (!isValidGmail(email)) {
            showToast({ title: "Correo inválido", message: "Usa un correo Gmail válido (ej: usuario@gmail.com).", ms: 2600, type: "error" });
            return;
        }

        if (!passwordMeetsRule(password)) {
            showToast({ title: "Contraseña débil", message: getPasswordRuleMessage(), ms: 3000, type: "error" });
            return;
        }

        if (password !== confirmPassword) {
            showToast({ title: "Contraseñas", message: "Las contraseñas no coinciden. Revísalas.", ms: 2400, type: "error" });
            return;
        }

        if (!terms) {
            showToast({ title: "Términos", message: "Debes aceptar los términos y condiciones.", ms: 2400, type: "error" });
            return;
        }

        const submitBtn = document.querySelector("#submitBtn");
        const oldText = submitBtn ? submitBtn.textContent : "";
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "CREANDO...";
        }

        try {
            const exists = await emailExists(email);
            if (exists) {
                showToast({ title: "Correo ya registrado", message: "Ese correo ya existe. Prueba con otro.", ms: 2600, type: "error" });
                return;
            }

            await createUser({ name, email, password });

            showToast({
                title: "Cuenta creada con éxito",
                message: "Cuenta creada. Verificación por correo: simulado. Redirigiendo en 5 segundos…",
                ms: 4500,
                type: "success",
            });

            setTimeout(() => {
                window.location.href = "login.html";
            }, 5000);

        } catch (err) {
            showToast({ title: "Error", message: err?.message || "Ocurrió un error inesperado.", ms: 2600, type: "error" });
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = oldText || "REGISTRARSE";
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    setupPasswordToggles();
    setupRegisterForm();
});
