// js/ubicaciones.js

function generarFilaUbicacion(ubicacion) {


console.log("📥 Script js/ubicaciones.js cargado");


    return [
        ubicacion.nombre || '-',
        ubicacion.tipo || '-',
        ubicacion.latitud?.toFixed(6) || '-',
        ubicacion.longitud?.toFixed(6) || '-',
        new Date(ubicacion.fechaCreacion).toLocaleString() || '-',
        `<button class="btn btn-sm btn-warning btn-editar" data-id="${ubicacion.id}">Editar</button>
         <button class="btn btn-sm btn-danger btn-eliminar" data-id="${ubicacion.id}">Eliminar</button>`
    ];
}

async function cargarUbicaciones(dataTable) {
    console.log("🔄 Llamando a /ubicaciones paginadas...");
    const token = localStorage.getItem("jwt");
    if (!token) return (window.location.href = "index.html");

    try {
        const res = await fetch(`${baseURL}/ubicaciones?page=0&size=100`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const page = await res.json();
        console.log("✅ Respuesta del backend:", page);

        const ubicaciones = page.content || [];

        dataTable.clear();

        if (!ubicaciones.length) {
            dataTable.row.add(['-', '-', '-', '-', '-', '<span class="text-muted">Sin datos</span>']).draw();
            return;
        }

        ubicaciones.forEach(ubi => dataTable.row.add(generarFilaUbicacion(ubi)));
        dataTable.draw();

    } catch (err) {
        console.error("Error cargando ubicaciones:", err);
        alert("No se pudieron cargar las ubicaciones.");
    }
}


const ubicacionModal = new bootstrap.Modal(document.getElementById('ubicacionModal'));
const ubicacionForm = document.getElementById('ubicacionForm');

function limpiarUbicacionForm() {
    ubicacionForm.reset();
    document.getElementById('ubicacionId').value = "";
}

document.getElementById("btnNuevaUbicacion").addEventListener("click", () => {
    limpiarUbicacionForm();
    document.getElementById("ubicacionModalLabel").textContent = "Crear nueva ubicación";
    ubicacionModal.show();
});

ubicacionForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("jwt");

    const id = document.getElementById("ubicacionId").value;
    const ubicacion = {
        nombre: document.getElementById("nombre").value,
        latitud: parseFloat(document.getElementById("latitud").value),
        longitud: parseFloat(document.getElementById("longitud").value),
        tipo: document.getElementById("tipo").value
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${baseURL}/ubicaciones/${id}` : `${baseURL}/ubicaciones`;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(ubicacion)
        });

        if (!res.ok) throw new Error("Error al guardar ubicación");

        ubicacionModal.hide();
        await cargarUbicaciones($('#ubicacionesTable').DataTable());
    } catch (err) {
        console.error("Error al guardar ubicación:", err);
        alert("Error al guardar ubicación. Verifica los datos.");
    }
});

$(document).on("click", ".btn-editar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");

    try {
        const res = await fetch(`${baseURL}/ubicaciones/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const ubicacion = await res.json();

        document.getElementById("ubicacionId").value = ubicacion.id;
        document.getElementById("nombre").value = ubicacion.nombre;
        document.getElementById("latitud").value = ubicacion.latitud;
        document.getElementById("longitud").value = ubicacion.longitud;
        document.getElementById("tipo").value = ubicacion.tipo;

        document.getElementById("ubicacionModalLabel").textContent = "Editar ubicación";
        ubicacionModal.show();

    } catch (err) {
        console.error("Error cargando ubicación:", err);
        alert("No se pudo cargar la ubicación.");
    }
});

$(document).on("click", ".btn-eliminar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");
    if (!confirm("¿Estás seguro de eliminar esta ubicación?")) return;

    try {
        const res = await fetch(`${baseURL}/ubicaciones/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Error al eliminar ubicación");

        await cargarUbicaciones($('#ubicacionesTable').DataTable());
    } catch (err) {
        console.error("Error eliminando ubicación:", err);
        alert("No se pudo eliminar la ubicación.");
    }
});

$(document).ready(function () {
    console.log("🚀 DOM listo. Ejecutando cargarUbicaciones...");

    const tabla = $('#ubicacionesTable').DataTable();
    cargarUbicaciones(tabla);
});