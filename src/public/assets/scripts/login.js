const API = "http://localhost:3000/api/v1";
const form = document.querySelector(".auth-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();


        const emailInput = form.querySelector('input[name="email"]');
        const passInput = form.querySelector('input[name="password"]');
        const email = (emailInput?.value || "").trim();
        const password = passInput?.value || "";

        if (!email || !password) {
            alert("Completa correo y contraseña.");
            return;
        }

        try {
            const url =
                `${API}/users?email=${encodeURIComponent(email)}` +
                `&password=${encodeURIComponent(password)}`;

            const res = await fetch(url);
            if (!res.ok) throw new Error("No se pudo conectar con la API.");

            const users = await res.json();
            if (!Array.isArray(users) || users.length === 0) {
                throw new Error("Correo o contraseña incorrectos.");
            }

            const user = users[0];
            localStorage.setItem("quantia_user", JSON.stringify(user));


            alert(`Bienvenido, ${user?.nombre ?? "usuario"} ✅`);


            window.location.href = "dashboard.html";
        } catch (err) {
            alert(err?.message || "Error al iniciar sesión.");
        }
    });
}
