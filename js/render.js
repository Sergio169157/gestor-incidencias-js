export function renderizar(lista, contenedor) {
  contenedor.innerHTML = "";

  lista.forEach(incidencia => {
    const div = document.createElement("div");

    // Clase base + estado + prioridad
    div.classList.add("incidencia", incidencia.estado, incidencia.prioridad);
    div.dataset.id = incidencia.id;

    div.innerHTML = `
      <h3>${incidencia.titulo}</h3>
      <p>${incidencia.descripcion}</p>

      <p>
        <strong>Prioridad:</strong>
        <span class="badge ${incidencia.prioridad}">
          ${incidencia.prioridad}
        </span>
      </p>

      <p class="estado">
        Estado: ${incidencia.estado.replace("-", " ")}
      </p>

      <button class="btn-eliminar">Eliminar</button>
    `;

    contenedor.appendChild(div);
  });
}