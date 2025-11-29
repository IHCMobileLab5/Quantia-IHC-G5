const API = "http://localhost:3000/api/v1";
async function registerUser({ nombre, email, password }) {
    const existsRes = await fetch(`${API}/users?email=${encodeURIComponent(email)}`);
    const exists = await existsRes.json();
    if (exists.length) throw new Error("Este correo ya está registrado.");

    const res = await fetch(`${API}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            nombre,
            email,
            password,
            createdAt: new Date().toISOString()
        })
    });

    if (!res.ok) throw new Error("No se pudo crear el usuario.");
    return res.json();
}

async function loginUser({ email, password }) {
    const res = await fetch(`${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
    const users = await res.json();
    if (!users.length) throw new Error("Correo o contraseña incorrectos.");
    return users[0];
}


const registerForm = document.querySelector("#register-form");
if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.querySelector("#nombre").value.trim();
        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;
        const confirm = document.querySelector("#confirmPassword").value;

        if (password !== confirm) return alert("Las contraseñas no coinciden.");

        try {
            await registerUser({ nombre, email, password });
            alert("Cuenta creada ✅ Ahora inicia sesión.");
            window.location.href = "./login.html";
        } catch (err) {
            alert(err.message);
        }
    });
}

const loginForm = document.querySelector("#login-form");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        try {
            const user = await loginUser({ email, password });
            localStorage.setItem("quantia_user", JSON.stringify(user));
            window.location.href = "./start.html"; // o a donde quieras entrar
        } catch (err) {
            alert(err.message);
        }
    });
}
