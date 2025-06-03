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
        `<button class="btn btn-sm btn-warning editar-btn" data-id="${usuario.id}">Editar</button>
         <button class="btn btn-sm btn-danger eliminar-btn" data-id="${usuario.id}">Eliminar</button>`
    ];
}

async function cargarUsuarios(dataTable) {
    console.log("⚙️ Ejecutando cargarUsuarios()");

    try {
        console.log("📡 Llamando API usuarios...");
        const res = await fetch("https://backend-mapgenda.onrender.com/usuarios");

        if (!res.ok) throw new Error("Fallo al obtener usuarios");
        const usuarios = await res.json();

        console.log("✅ Respuesta:", usuarios);

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
        alert("Error al cargar usuarios.");
    }
}

function abrirModalEdicion(usuarioId) {
    // Aquí puedes obtener el usuario con ese ID y mostrar un formulario modal
    // Puedes usar Bootstrap Modal o uno personalizado
    alert("Editar usuario: " + usuarioId);
}

$(document).ready(function () {
    const dataTable = $('#dataTable').DataTable();
    cargarUsuarios(dataTable);

    $('#dataTable').on('click', '.editar-btn', function () {
        const userId = $(this).data('id');
        abrirModalEdicion(userId);
    });

    $('#dataTable').on('click', '.eliminar-btn', function () {
        const userId = $(this).data('id');
        alert("Eliminar usuario: " + userId);
        // Aquí puedes implementar la lógica DELETE si quieres
    });
});
