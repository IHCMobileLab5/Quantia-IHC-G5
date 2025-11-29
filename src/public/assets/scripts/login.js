const API = "http://localhost:3000/api/v1";

const form = document.querySelector("#login-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.querySelector("#email").value.trim();
        const password = document.querySelector("#password").value;

        if (!email || !password) return alert("Completa correo y contraseña.");

        try {
            const url = `${API}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error("No se pudo conectar con la API.");

            const users = await res.json();
            if (!users.length) throw new Error("Correo o contraseña incorrectos.");

            const user = users[0];
            localStorage.setItem("quantia_user", JSON.stringify(user));

            alert(`Bienvenido, ${user.nombre ?? "usuario"} ✅`);
            window.location.href = "start.html";
        } catch (err) {
            alert(err.message);
        }
    });
}
