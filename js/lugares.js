// js/lugares.js

function generarFilaLugar(lugar) {
    const foto = lugar.fotoUrl
        ? `<img src="${lugar.fotoUrl}" class="img-thumbnail" width="50" height="50">`
        : '<span class="text-muted">Sin imagen</span>';

    const abierto = lugar.abiertoAhora
        ? '<span class="badge badge-success">Sí</span>'
        : '<span class="badge badge-secondary">No</span>';

    return [
        foto,
        lugar.nombre || '-',
        lugar.direccion || '-',
        lugar.tipo || '-',
        lugar.calificacion?.toFixed(1) || '-',
        abierto,
        lugar.duracionEstimadaMinutos + ' min',
        `${lugar.latitud}, ${lugar.longitud}`,
        `<button class="btn btn-sm btn-warning btn-editar" data-id="${lugar.id}">Editar</button>
         <button class="btn btn-sm btn-danger btn-eliminar" data-id="${lugar.id}">Eliminar</button>`
    ];
}

async function cargarLugares(dataTable) {
    const token = localStorage.getItem("jwt");
    if (!token) return (window.location.href = "index.html");

    try {
        const res = await fetch(`${baseURL}/lugares`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const lugares = await res.json();
        dataTable.clear();

        if (!lugares.length) {
            dataTable.row.add([
                '-', '-', '-', '-', '-', '-', '-', '-', '<span class="text-muted">Sin datos</span>'
            ]).draw();
            return;
        }

        lugares.forEach(lugar => dataTable.row.add(generarFilaLugar(lugar)));
        dataTable.draw();

    } catch (err) {
        console.error("Error cargando lugares:", err);
        alert("No se pudieron cargar los lugares.");
    }
}

const lugarModal = new bootstrap.Modal(document.getElementById('lugarModal'));
const lugarForm = document.getElementById('lugarForm');

function limpiarLugarForm() {
    lugarForm.reset();
    document.getElementById('lugarId').value = "";
}

document.getElementById("btnNuevoLugar").addEventListener("click", () => {
    limpiarLugarForm();
    document.getElementById("lugarModalLabel").textContent = "Crear nuevo lugar";
    lugarModal.show();
});

lugarForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("jwt");
    const id = document.getElementById("lugarId").value;

    const lugar = {
        nombre: document.getElementById("nombre").value,
        direccion: document.getElementById("direccion").value,
        latitud: parseFloat(document.getElementById("latitud").value),
        longitud: parseFloat(document.getElementById("longitud").value),
        tipo: document.getElementById("tipo").value,
        calificacion: parseFloat(document.getElementById("calificacion").value),
        duracionEstimadaMinutos: parseInt(document.getElementById("duracion").value),
        fotoUrl: document.getElementById("fotoUrl").value,
        abiertoAhora: document.getElementById("abiertoAhora").checked
    };

    const method = id ? "PUT" : "POST";
    const url = id ? `${baseURL}/lugares/${id}` : `${baseURL}/lugares`;

    try {
        const res = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(lugar)
        });

        if (!res.ok) throw new Error("Error al guardar el lugar");

        lugarModal.hide();
        await cargarLugares($('#lugaresTable').DataTable());
    } catch (err) {
        console.error("Error al guardar lugar:", err);
        alert("Error al guardar lugar. Verifica consola.");
    }
});

$(document).on("click", ".btn-editar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");

    try {
        const res = await fetch(`${baseURL}/lugares/${id}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        const lugar = await res.json();

        document.getElementById("lugarId").value = lugar.id;
        document.getElementById("nombre").value = lugar.nombre;
        document.getElementById("direccion").value = lugar.direccion;
        document.getElementById("latitud").value = lugar.latitud;
        document.getElementById("longitud").value = lugar.longitud;
        document.getElementById("tipo").value = lugar.tipo;
        document.getElementById("calificacion").value = lugar.calificacion.toFixed(1);
        document.getElementById("duracion").value = lugar.duracionEstimadaMinutos;
        document.getElementById("fotoUrl").value = lugar.fotoUrl;
        document.getElementById("abiertoAhora").checked = !!lugar.abiertoAhora;

        document.getElementById("lugarModalLabel").textContent = "Editar lugar";
        lugarModal.show();

    } catch (err) {
        console.error("Error al cargar lugar:", err);
        alert("No se pudo cargar el lugar.");
    }
});

$(document).on("click", ".btn-eliminar", async function () {
    const id = $(this).data("id");
    const token = localStorage.getItem("jwt");
    if (!confirm("¿Estás seguro de eliminar este lugar?")) return;

    try {
        const res = await fetch(`${baseURL}/lugares/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Error al eliminar lugar");

        await cargarLugares($('#lugaresTable').DataTable());
    } catch (err) {
        console.error("Error eliminando lugar:", err);
        alert("No se pudo eliminar el lugar.");
    }
});

$(document).ready(function () {
    const tabla = $('#lugaresTable').DataTable();
    cargarLugares(tabla);
});
