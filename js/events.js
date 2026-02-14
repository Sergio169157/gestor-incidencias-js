import { renderizar, actualizarContador } from "./render.js";

const API = "http://127.0.0.1:3000/api/incidencias";

document.addEventListener("DOMContentLoaded", () => {

  const formulario = document.getElementById("form-incidencia");
  const lista = document.getElementById("lista-incidencias");

  const inputTitulo = document.getElementById("titulo");
  const inputDescripcion = document.getElementById("descripcion");
  const inputPrioridad = document.getElementById("prioridad");

  async function cargarIncidencias() {
    const res = await fetch(API);
    const datos = await res.json();

    renderizar(datos, lista);
    actualizarContador(datos);
  }

  cargarIncidencias();

  // CREAR
  formulario.addEventListener("submit", async (e) => {
    e.preventDefault();

    const titulo = inputTitulo.value.trim();
    const descripcion = inputDescripcion.value.trim();
    const prioridad = inputPrioridad.value;

    if (!titulo || !descripcion) {
      alert("Título y descripción obligatorios");
      return;
    }

    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, descripcion, prioridad })
    });

    formulario.reset();
    cargarIncidencias();
  });

  // BOTONES DINÁMICOS (delegación de eventos)
  lista.addEventListener("click", async (e) => {
    const contenedor = e.target.closest(".incidencia");
    if (!contenedor) return;

    const id = contenedor.dataset.id;

    // ELIMINAR
    if (e.target.classList.contains("btn-eliminar")) {
      await fetch(`${API}/${id}`, { method: "DELETE" });
      cargarIncidencias();
    }

    // CAMBIAR ESTADO
    if (e.target.classList.contains("btn-estado")) {
      await fetch(`${API}/${id}/estado`, { method: "PUT" });
      cargarIncidencias();
    }
  });

});