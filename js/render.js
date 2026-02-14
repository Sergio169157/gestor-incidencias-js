export function renderizar(lista, contenedor) {
  contenedor.innerHTML = "";

  lista.forEach(incidencia => {
    const div = document.createElement("div");
    div.classList.add("incidencia", incidencia.estado);
    div.dataset.id = incidencia.id;

    div.innerHTML = `
      <h3>${incidencia.titulo}</h3>
      <p>${incidencia.descripcion}</p>
      <p><strong>Prioridad:</strong> ${incidencia.prioridad}</p>
      <p class="estado">Estado: ${incidencia.estado.replace("-", " ")}</p>
      <button class="btn-eliminar">Eliminar</button>
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