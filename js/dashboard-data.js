document.addEventListener("DOMContentLoaded", () => {
  

    const token = localStorage.getItem("jwt");
    if (!token) {
        alert("Sesión expirada. Por favor inicia sesión nuevamente.");
        window.location.href = "index.html";
        return;
    }

    const endpoints = {
        usuarios: `${baseURL}/usuarios/count`,
        lugares: `${baseURL}/lugares/count`,
        ubicaciones: `${baseURL}/ubicaciones/count`,
        rutas: `${baseURL}/rutas/count`,
        usuariosPorMes: `${baseURL}/usuarios/estadisticas-mensuales`,
        lugaresPorTipo: `${baseURL}/lugares/tipo-distribucion`
    };

    async function fetchConToken(url) {
        const res = await fetch(url, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 401 || res.status === 403) {
                alert("Sesión expirada o no autorizada.");
                localStorage.removeItem("jwt");
                window.location.href = "index.html";
            }
            throw new Error(`Error en fetch: ${res.status}`);
        }

        return res.json();
    }

    // 🔢 Cargar tarjetas
    fetchConToken(endpoints.usuarios)
        .then(data => document.getElementById("cardUsuarios").textContent = data)
        .catch(err => console.error("❌ Usuarios:", err));

    fetchConToken(endpoints.lugares)
        .then(data => document.getElementById("cardLugares").textContent = data)
        .catch(err => console.error("❌ Lugares:", err));

    fetchConToken(endpoints.ubicaciones)
        .then(data => document.getElementById("cardUbicaciones").textContent = data)
        .catch(err => console.error("❌ Ubicaciones:", err));

    fetchConToken(endpoints.rutas)
        .then(data => document.getElementById("cardRutas").textContent = data)
        .catch(err => console.error("❌ Rutas:", err));

    // 📈 Usuarios por mes (gráfico de línea)
    fetchConToken(endpoints.usuariosPorMes)
        .then(data => {
            const orderedMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthMap = new Map(data.map(item => [item.mes, item.cantidad]));
            const labels = orderedMonths;
            const values = orderedMonths.map(m => monthMap.get(m) || 0);

            const ctx = document.getElementById("myAreaChart").getContext("2d");


            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Usuarios por mes",
                        data: values,
                        fill: true,
                        borderColor: "#4e73df",
                        backgroundColor: "rgba(78, 115, 223, 0.05)",
                        pointBackgroundColor: "#4e73df"
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

    // Gráfico de dona: tipos de lugares
    fetchConToken(endpoints.lugaresPorTipo)
        .then(data => {
            const labels = Object.keys(data);
            const values = Object.values(data);

            const ctx = document.getElementById("myPieChart").getContext("2d");
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'],
                        hoverOffset: 4, // <- Suaviza el efecto de hover
                        hoverBorderColor: "rgba(234, 236, 244, 1)",
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    cutout: '65%', // Ajuste más natural y menos brusco
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        });


    fetchConToken(`${baseURL}/lugares/estadisticas-mensuales`)
        .then(data => {
            const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const valoresPorMes = new Map(Object.entries(data));

            const labels = monthOrder;
            const values = monthOrder.map(m => valoresPorMes.get(m) || 0);

            const ctx = document.getElementById("myBarChart").getContext("2d");
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Lugares creados",
                        backgroundColor: "#4e73df",
                        hoverBackgroundColor: "#2e59d9",
                        borderColor: "#4e73df",
                        data: values
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    layout: {
                        padding: { left: 10, right: 25, top: 25, bottom: 0 }
                    },
                    scales: {
                        x: {
                            grid: { display: false, drawBorder: false },
                            ticks: { maxTicksLimit: 6 }
                        },
                        y: {
                            ticks: {
                                beginAtZero: true,
                                callback: value => value + " lugares"
                            },
                            grid: {
                                color: "rgb(234, 236, 244)",
                                zeroLineColor: "rgb(234, 236, 244)",
                                drawBorder: false
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: context => `Cantidad: ${context.raw}`
                            }
                        }
                    }
                }
            });
        });



});

