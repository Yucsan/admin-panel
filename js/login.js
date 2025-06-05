// js/login.js

document.getElementById("loginForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const res = await fetch(`${baseURL}/usuarios/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        if (res.status === 403) {
            showError("Solo administradores pueden ingresar.");
            return;
        }
        if (res.status === 401) {
            showError("Credenciales incorrectas.");
            return;
        }

        if (!res.ok) {
            showError("Error en el servidor.");
            return;
        }

        const data = await res.json();
        localStorage.setItem("jwt", data.token);
        window.location.href = "dashboard.html";
    } catch (err) {
        showError("Error al conectar con el servidor.");
        console.error(err);
    }
});

function showError(msg) {
    const div = document.getElementById("errorMessage");
    div.textContent = msg;
    div.style.display = "block";
}
