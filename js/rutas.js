$(document).ready(function () {
    const tabla = $('#tablaRutas').DataTable();
    cargarRutas(tabla);
});

async function cargarRutas(tabla) {
    const token = localStorage.getItem("jwt");
    if (!token) {
        alert("No autenticado. Redirigiendo...");
        window.location.href = "login.html";
        return;
    }

    try {
        const res = await fetch(`${baseURL}/rutas/usuario`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("No se pudo obtener rutas");

        const rutas = await res.json();
        tabla.clear();

        rutas.forEach(r => {
            const origen = `${r.origenLat?.toFixed(4)}, ${r.origenLng?.toFixed(4)}`;
            const destino = `${r.destinoLat?.toFixed(4)}, ${r.destinoLng?.toFixed(4)}`;
            tabla.row.add([
                r.nombre || "-",
                r.categoria || "-",
                r.modoTransporte || "-",
                origen || "-",
                destino || "-",
                `<a href="ruta-detalle.html?id=${r.id}" class="btn btn-sm btn-info">Ver</a>
                 <button class="btn btn-sm btn-danger" onclick="eliminarRuta(${r.id})">Eliminar</button>`
            ]);
        });

        tabla.draw();
    } catch (err) {
        console.error("❌ Error al cargar rutas:", err);
        alert("Error al cargar rutas.");
    }
}

async function eliminarRuta(id) {
    const token = localStorage.getItem("jwt");
    if (!confirm("¿Eliminar esta ruta?")) return;

    try {
        const res = await fetch(`${baseURL}/rutas/${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("No se pudo eliminar");

        const tabla = $('#tablaRutas').DataTable();
        await cargarRutas(tabla);
    } catch (err) {
        console.error("❌ Error al eliminar ruta:", err);
        alert("Error al eliminar ruta.");
    }
}
