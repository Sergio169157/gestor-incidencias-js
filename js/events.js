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

  // FORMULARIO
  formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const prioridad = document.getElementById("prioridad").value;

    if (!titulo || !descripcion) {
      alert("El título y la descripción son obligatorios.");
      return;
    }

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

  // CLICK EN LISTA
  lista.addEventListener("click", function(e) {
    const contenedor = e.target.closest(".incidencia");
    if (!contenedor) return;

    const id = Number(contenedor.dataset.id);

    // ELIMINAR
    if (e.target.classList.contains("btn-eliminar")) {
      if (confirm("¿Seguro que quieres eliminar esta incidencia?")) {
        eliminarIncidencia(id);
        refrescar();
      }
    }

    // CAMBIAR ESTADO
    if (e.target.classList.contains("btn-estado")) {
      cambiarEstado(id);
      refrescar();
    }
  });

});