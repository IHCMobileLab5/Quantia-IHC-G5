const API_BASE = "http://localhost:3000/api/v1";
const USERS_URL = `${API_BASE}/users`;

// Config “profe-friendly”
const MAX_ATTEMPTS = 3;
const LOCK_MS = 60_000; // 1 min (cámbialo si quieres)
let toastTimer = null;

function $(sel) { return document.querySelector(sel); }

function showToast({ title = "Listo", message = "", ms = 2600, type = "success" } = {}) {
    const toast = $("#toast");
    const tTitle = $("#toastTitle");
    const tMsg = $("#toastMsg");
    const tClose = $("#toastClose");
    if (!toast || !tTitle || !tMsg || !tClose) return;

    toast.dataset.type = type;
    tTitle.textContent = title;
    tMsg.textContent = message;

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

function normEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function attemptsKey(email) {
    return `quantia_attempts:${normEmail(email)}`;
}

function lockKey(email) {
    return `quantia_lock_until:${normEmail(email)}`;
}

function getAttempts(email) {
    return Number(localStorage.getItem(attemptsKey(email)) || "0");
}

function setAttempts(email, n) {
    localStorage.setItem(attemptsKey(email), String(Math.max(0, n)));
}

function clearAttempts(email) {
    localStorage.removeItem(attemptsKey(email));
}

function getLockUntil(email) {
    return Number(localStorage.getItem(lockKey(email)) || "0");
}

function setLockUntil(email, ts) {
    localStorage.setItem(lockKey(email), String(ts));
}

function clearLock(email) {
    localStorage.removeItem(lockKey(email));
}

function msToHuman(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return `${s}s`;
}

async function findUserByEmail(email) {
    const url = `${USERS_URL}?email=${encodeURIComponent(normEmail(email))}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error("No se pudo conectar con la API (json-server).");
    const data = await res.json();
    return Array.isArray(data) && data.length ? data[0] : null;
}

function setLoading(form, isLoading) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = isLoading;
    btn.textContent = isLoading ? "VALIDANDO..." : "Iniciar sesión";
}

document.addEventListener("DOMContentLoaded", () => {
    const form = $("#loginForm");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = normEmail(form.querySelector('input[name="email"]')?.value);
        const password = String(form.querySelector('input[name="password"]')?.value || "");

        if (!email || !password) {
            showToast({
                type: "error",
                title: "Faltan datos",
                message: "Completa correo y contraseña para continuar.",
                ms: 2800,
            });
            return;
        }

        setLoading(form, true);

        try {
            // 1) Ver si existe usuario
            const user = await findUserByEmail(email);

            if (!user) {
                // genérico (no damos pistas)
                showToast({
                    type: "error",
                    title: "Acceso denegado",
                    message: "Correo o contraseña incorrectos.",
                    ms: 3000,
                });
                return;
            }

            // 2) Bloqueo por intentos (simulado)
            const lockUntil = getLockUntil(email);
            const now = Date.now();
            if (lockUntil && lockUntil > now) {
                showToast({
                    type: "error",
                    title: "Cuenta bloqueada",
                    message: `Demasiados intentos. Intenta de nuevo en ${msToHuman(lockUntil - now)}.`,
                    ms: 3500,
                });
                return;
            } else if (lockUntil && lockUntil <= now) {
                // expiró bloqueo
                clearLock(email);
                clearAttempts(email);
            }

            // 3) Validar password (ojo: demo, porque json-server no encripta)
            if (String(user.password || "") !== password) {
                const next = getAttempts(email) + 1;
                setAttempts(email, next);

                const left = MAX_ATTEMPTS - next;

                if (next >= MAX_ATTEMPTS) {
                    setLockUntil(email, Date.now() + LOCK_MS);

                    showToast({
                        type: "error",
                        title: "Cuenta bloqueada",
                        message: `Has superado ${MAX_ATTEMPTS} intentos. Bloqueo temporal por ${msToHuman(LOCK_MS)}.`,
                        ms: 4200,
                    });
                } else {
                    showToast({
                        type: "error",
                        title: "Acceso denegado",
                        message: `Correo o contraseña incorrectos. Te quedan ${left} intento(s).`,
                        ms: 3600,
                    });
                }
                return;
            }

            // 4) OK: reset intentos + sesión
            clearAttempts(email);
            clearLock(email);

            localStorage.setItem("quantia_user", JSON.stringify(user));

            showToast({
                type: "success",
                title: "Bienvenido",
                message: `Hola, ${user.name || "usuario"} 👋 Redirigiendo…`,
                ms: 1600,
            });

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1600);

        } catch (err) {
            showToast({
                type: "error",
                title: "Error",
                message: err?.message || "Ocurrió un error inesperado.",
                ms: 3200,
            });
        } finally {
            setLoading(form, false);
        }
    });
});
