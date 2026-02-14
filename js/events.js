import {
  getIncidencias,
  agregarIncidencia,
  eliminarIncidencia,
  cambiarEstado,
  actualizarIncidencia
} from "./state.js";

import { renderizar, actualizarContador } from "./render.js";

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("form-incidencia");
  const lista = document.getElementById("lista-incidencias");

  const inputTitulo = document.getElementById("titulo");
  const inputDescripcion = document.getElementById("descripcion");
  const inputPrioridad = document.getElementById("prioridad");
  const botonSubmit = formulario.querySelector("button");

  let modoEdicion = false;
  let idEditando = null;

  function refrescar() {
    const datos = getIncidencias();
    renderizar(datos, lista);
    actualizarContador(datos);
  }

  refrescar();

  // SUBMIT FORM
  formulario.addEventListener("submit", function(e) {
    e.preventDefault();

    const titulo = inputTitulo.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const prioridad = inputPrioridad.value;

    if (!titulo || !descripcion) {
      alert("El título y la descripción son obligatorios.");
      return;
    }

    if (modoEdicion) {
      actualizarIncidencia(idEditando, {
        titulo,
        descripcion,
        prioridad
      });

      modoEdicion = false;
      idEditando = null;
      botonSubmit.textContent = "Crear";
    } else {
      agregarIncidencia({
        id: Date.now(),
        titulo,
        descripcion,
        prioridad,
        estado: "pendiente"
      });
    }

    formulario.reset();
    refrescar();
  });

  // EVENTOS EN LISTA
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

    // EDITAR
    if (e.target.classList.contains("btn-editar")) {
      const incidencia = getIncidencias().find(i => i.id === id);
      if (!incidencia) return;

      inputTitulo.value = incidencia.titulo;
      inputDescripcion.value = incidencia.descripcion;
      inputPrioridad.value = incidencia.prioridad;

      modoEdicion = true;
      idEditando = id;
      botonSubmit.textContent = "Guardar cambios";
    }
  });

});