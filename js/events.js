import {
  getIncidencias,
  agregarIncidencia,
  eliminarIncidencia,
  cambiarEstado
} from "./state.js";

import { renderizar, actualizarContador } from "./render.js";

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("form-incidencia");
  const lista = document.getElementById("lista-incidencias");

  function refrescar() {
    const datos = getIncidencias();
    renderizar(datos, lista);
    actualizarContador(datos);
  }

  refrescar();

  formulario.addEventListener("submit", function(e) {
  e.preventDefault();
  console.log("SUBMIT FUNCIONA");
    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;
    const prioridad = document.getElementById("prioridad").value;

    agregarIncidencia({
      id: Date.now(),
      titulo,
      descripcion,
      prioridad,
      estado: "pendiente"
    });

    formulario.reset();
    refrescar();
  });

  lista.addEventListener("click", function(e) {
    const contenedor = e.target.closest(".incidencia");
    if (!contenedor) return;

    const id = Number(contenedor.dataset.id);

    if (e.target.classList.contains("btn-eliminar")) {
      eliminarIncidencia(id);
      refrescar();
    }

    if (e.target.classList.contains("estado")) {
      cambiarEstado(id);
      refrescar();
    }
  });

});
