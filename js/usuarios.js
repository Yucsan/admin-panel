function generarFilaData(usuario) {
    const foto = usuario.fotoPerfilUrl
        ? `<img src="${usuario.fotoPerfilUrl}" class="img-thumbnail" width="50" height="50">`
        : `<!-- Sin foto -->`;

    return [
        foto,
        usuario.nombre || "-",
        usuario.email || "-",
        usuario.rol || "-",
        usuario.verificado ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-secondary">No</span>',
        usuario.conectado ? '<span class="badge badge-success">Sí</span>' : '<span class="badge badge-secondary">No</span>',
        usuario.fechaRegistro || "-",
        `<button class="btn btn-sm btn-warning btn-editar" data-id="${usuario.id}">Editar</button>
             <button class="btn btn-sm btn-danger">Eliminar</button>`
    ];
}

async function cargarUsuarios(dataTable) {
    console.log("⚙️ Ejecutando cargarUsuarios()");

    const token = localStorage.getItem("jwt");
    if (!token) {
        console.warn("⚠️ No hay token, redirigiendo al login");
        window.location.href = "index.html";
        return;
    }

    try {
        console.log("📡 Llamando API usuarios con token...");
        const res = await fetch(`${baseURL}/usuarios`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status === 401 || res.status === 403) {
            console.warn("🚫 Token inválido o expirado");
            localStorage.removeItem("jwt");
            window.location.href = "index.html";
            return;
        }

        if (!res.ok) throw new Error("Fallo al obtener usuarios");

        const usuarios = await res.json();
        console.log("✅ Usuarios cargados:", usuarios);

        dataTable.clear();

        if (!usuarios.length) {
            dataTable.row.add([
                '-', '-', '-', '-', '-', '-', '-',
                '<span class="text-muted">Sin datos</span>'
            ]).draw();
            return;
        }

        usuarios.forEach(usuario => {
            dataTable.row.add(generarFilaData(usuario));
        });

        dataTable.draw();

    } catch (err) {
        console.error("❌ Error cargando usuarios:", err);
        alert("Error al cargar usuarios. Ver consola.");
    }
}

$(document).ready(function () {
    const dataTable = $('#dataTable').DataTable(); // inicializa una vez
    cargarUsuarios(dataTable); // carga los datos en tabla
});


// guardar

let usuarioModal = new bootstrap.Modal(document.getElementById('usuarioModal'));
const usuarioForm = document.getElementById("usuarioForm");

document.getElementById("btnNuevoUsuario").addEventListener("click", () => {
    limpiarFormulario();
    document.getElementById("usuarioModalLabel").textContent = "Crear nuevo usuario";
    usuarioModal.show();
});

function limpiarFormulario() {
    usuarioForm.reset();
    document.getElementById("usuarioId").value = "";
    document.getElementById("email").disabled = false;
}

usuarioForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = localStorage.getItem("jwt");
    if (!token) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        window.location.href = "index.html";
        return;
    }

    const id = document.getElementById("usuarioId").value;
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const rol = document.getElementById("rol").value;
    const verificado = document.getElementById("verificado").checked;
    const contrasena = document.getElementById("contrasena").value;

    // Armar objeto de datos
    const usuarioData = { nombre, email, rol, verificado };

    if (contrasena) {
        usuarioData.contrasena = contrasena; // solo se envía si hay algo
    }

    try {
        let res;
        if (id) {
            // Editar (PUT)
            res = await fetch(`${baseURL}/usuarios/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(usuarioData)
            });
        } else {
            // Crear (POST)
            res = await fetch(`${baseURL}/usuarios/registrar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(usuarioData)
            });
        }

        if (!res.ok) throw new Error("Error al guardar usuario");

        usuarioModal.hide();
        const tabla = $('#dataTable').DataTable();
        await cargarUsuarios(tabla);
    } catch (err) {
        console.error("❌ Error al guardar usuario:", err);
        alert("Error al guardar usuario. Verifica consola.");
    }
});


//editar
$(document).on("click", ".btn-editar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");

    try {
        const res = await fetch(`${baseURL}/usuarios/get/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("No se pudo cargar el usuario");

        const usuario = await res.json();

        // Rellenar formulario
        document.getElementById("usuarioId").value = usuario.id;
        document.getElementById("nombre").value = usuario.nombre || "";
        document.getElementById("email").value = usuario.email || "";
        document.getElementById("email").disabled = true; // no editable en edición
        document.getElementById("rol").value = usuario.rol || "USER";
        document.getElementById("verificado").checked = !!usuario.verificado;

        document.getElementById("usuarioModalLabel").textContent = "Editar usuario";
        usuarioModal.show();

    } catch (err) {
        console.error("❌ Error al cargar usuario:", err);
        alert("Error al cargar datos del usuario.");
    }
});


$(document).on("click", ".btn-eliminar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");

    const confirmar = confirm("¿Estás seguro de que deseas eliminar este usuario?");
    if (!confirmar) return;

    try {
        const res = await fetch(`${baseURL}/usuarios/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (res.status !== 204 && !res.ok) throw new Error("No se pudo eliminar");

        const tabla = $('#dataTable').DataTable();
        await cargarUsuarios(tabla);

    } catch (err) {
        console.error("❌ Error al eliminar:", err);
        alert("No se pudo eliminar el usuario.");
    }
});





