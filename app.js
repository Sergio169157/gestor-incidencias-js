const formulario = document.getElementById("form-incidencia");
const lista = document.getElementById("lista-incidencias");

// ===============================
// CARGAR DATOS
// ===============================
let incidencias = JSON.parse(localStorage.getItem("incidencias")) || [];

renderizarIncidencias();
actualizarContador();

// ===============================
// CREAR INCIDENCIA
// ===============================
formulario.addEventListener("submit", function(e) {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const prioridad = document.getElementById("prioridad").value;

  const incidencia = {
    id: Date.now(),
    titulo,
    descripcion,
    prioridad,
    estado: "pendiente"
  };

  incidencias.push(incidencia);
  guardarEnLocalStorage();
  renderizarIncidencias();
  actualizarContador();

  formulario.reset();
});

// ===============================
// RENDERIZAR TODAS LAS INCIDENCIAS
// ===============================
function renderizarIncidencias(listaFiltrada = incidencias) {
  lista.innerHTML = "";

  listaFiltrada.forEach(incidencia => {
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

    const botonEliminar = div.querySelector(".btn-eliminar");
    const estadoTexto = div.querySelector(".estado");

    // ELIMINAR
    botonEliminar.addEventListener("click", function() {
      incidencias = incidencias.filter(item => item.id !== incidencia.id);
      guardarEnLocalStorage();
      renderizarIncidencias();
      actualizarContador();
    });

    // CAMBIAR ESTADO
    estadoTexto.addEventListener("click", function() {

      if (incidencia.estado === "pendiente") {
        incidencia.estado = "en-proceso";
      } else if (incidencia.estado === "en-proceso") {
        incidencia.estado = "resuelta";
      } else {
        incidencia.estado = "pendiente";
      }

      guardarEnLocalStorage();
      renderizarIncidencias();
      actualizarContador();
    });

    lista.appendChild(div);
  });
}

// ===============================
// FILTROS
// ===============================
let filtroActual = "todas";

const botonesFiltro = document.querySelectorAll(".filtros button");

botonesFiltro.forEach(boton => {
  boton.addEventListener("click", function() {

    botonesFiltro.forEach(b => b.classList.remove("activo"));
    boton.classList.add("activo");

    filtroActual = boton.dataset.estado;
    aplicarFiltros();
  });
});

// BUSCADOR
const buscador = document.getElementById("buscador");

buscador.addEventListener("input", function() {
  aplicarFiltros();
  const texto = buscador.value.toLowerCase();

  const filtradas = incidencias.filter(incidencia =>
    incidencia.titulo.toLowerCase().includes(texto) ||
    incidencia.descripcion.toLowerCase().includes(texto)
  );

  renderizarIncidencias(filtradas);
});

// ordenar por fecha o prioridad
const selectorOrden = document.getElementById("ordenar");

selectorOrden.addEventListener("change", function() {

  if (selectorOrden.value === "fecha") {
    incidencias.sort((a, b) => b.id - a.id);
  }

  if (selectorOrden.value === "prioridad") {

    const ordenPrioridad = {
      alta: 3,
      media: 2,
      baja: 1
    };

    incidencias.sort((a, b) =>
      ordenPrioridad[b.prioridad] - ordenPrioridad[a.prioridad]
    );
  }

  renderizarIncidencias();
});

// ===============================
// CONTADOR
// ===============================
function actualizarContador() {
  const pendientes = incidencias.filter(i => i.estado === "pendiente").length;
  const enProceso = incidencias.filter(i => i.estado === "en-proceso").length;
  const resueltas = incidencias.filter(i => i.estado === "resuelta").length;

  document.getElementById("count-pendiente").textContent = pendientes;
  document.getElementById("count-proceso").textContent = enProceso;
  document.getElementById("count-resuelta").textContent = resueltas;
}

// ===============================
// GUARDAR DATOS
// ===============================
function guardarEnLocalStorage() {
  localStorage.setItem("incidencias", JSON.stringify(incidencias));
}
// APLICAR FILTROS

function aplicarFiltros() {

  let resultado = [...incidencias];

  if (filtroActual !== "todas") {
    resultado = resultado.filter(
      incidencia => incidencia.estado === filtroActual
    );
  }

  const texto = buscador.value.toLowerCase();

  if (texto) {
    resultado = resultado.filter(incidencia =>
      incidencia.titulo.toLowerCase().includes(texto) ||
      incidencia.descripcion.toLowerCase().includes(texto)
    );
  }

  renderizarIncidencias(resultado);
}