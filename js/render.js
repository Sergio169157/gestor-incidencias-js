export function renderizar(lista, contenedor) {
  contenedor.innerHTML = "";

  const ordenadas = [...lista].sort((a, b) => {
    return (b.fecha || 0) - (a.fecha || 0);
  });

  ordenadas.forEach(incidencia => {
    const div = document.createElement("div");

    div.classList.add("incidencia", incidencia.prioridad);
    div.dataset.id = incidencia.id;

    let textoBoton = "";

    if (incidencia.estado === "pendiente") {
      textoBoton = "Pasar a En proceso";
    } else if (incidencia.estado === "en-proceso") {
      textoBoton = "Marcar como Resuelta";
    } else {
      textoBoton = "Reabrir";
    }

    // 🔥 Manejo seguro de fecha
    let fechaFormateada = "Sin fecha";

    if (incidencia.fecha) {
      fechaFormateada = new Date(incidencia.fecha).toLocaleString();
    }

    div.innerHTML = `
      <h3>${incidencia.titulo}</h3>
      <p>${incidencia.descripcion}</p>
      <p><strong>Prioridad:</strong> ${incidencia.prioridad}</p>
      <p><strong>Estado:</strong> ${incidencia.estado.replace("-", " ")}</p>
      <p><small>Creada: ${fechaFormateada}</small></p>

      <button class="btn-eliminar">Eliminar</button>
      <button class="btn-estado">${textoBoton}</button>
      <button class="btn-editar">Editar</button>
    `;

    contenedor.appendChild(div);
  });
}

export function actualizarContador(lista) {
  document.getElementById("count-pendiente").textContent =
    lista.filter(i => i.estado === "pendiente").length;

  document.getElementById("count-proceso").textContent =
    lista.filter(i => i.estado === "en-proceso").length;

  document.getElementById("count-resuelta").textContent =
    lista.filter(i => i.estado === "resuelta").length;
}