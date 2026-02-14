export function renderizar(lista, contenedor) {
  contenedor.innerHTML = "";

  lista.forEach(incidencia => {
    const div = document.createElement("div");

    div.classList.add("incidencia", incidencia.prioridad);
    div.dataset.id = incidencia.id;

    // Texto dinámico del botón de estado
    let textoBoton = "";

    if (incidencia.estado === "pendiente") {
      textoBoton = "Pasar a En proceso";
    } else if (incidencia.estado === "en-proceso") {
      textoBoton = "Marcar como Resuelta";
    } else {
      textoBoton = "Reabrir";
    }

    div.innerHTML = `
      <h3>${incidencia.titulo}</h3>
      <p>${incidencia.descripcion}</p>
      <p><strong>Prioridad:</strong> ${incidencia.prioridad}</p>
      <p><strong>Estado:</strong> ${incidencia.estado.replace("-", " ")}</p>

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
