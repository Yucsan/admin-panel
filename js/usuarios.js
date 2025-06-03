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
            `<button class="btn btn-sm btn-warning">Editar</button>
             <button class="btn btn-sm btn-danger">Eliminar</button>`
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

    $(document).ready(function () {
        const dataTable = $('#dataTable').DataTable(); // inicializa una vez
        cargarUsuarios(dataTable); // carga los datos en tabla
    });