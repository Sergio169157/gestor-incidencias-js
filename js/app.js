const API = "https://gestor-incidencias-js.onrender.com";

// ==========================
// UTILIDADES
// ==========================
function getToken() {
  return localStorage.getItem("token");
}

function getHeaders(json = false) {
  const headers = {};

  if (json) headers["Content-Type"] = "application/json";

  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  return headers;
}

// ==========================
// INICIO APP
// ==========================
document.addEventListener("DOMContentLoaded", () => {

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  if (usuario) {
    document.getElementById("userStatus").innerText =
      "Logueado como " + usuario.usuario;
  }

  if (getToken()) {
    cargarIncidencias();
  }

  const lista = document.getElementById("lista-incidencias");
  if (lista) {
    lista.addEventListener("click", manejarClicksIncidencias);
  }

  document.addEventListener("click", manejarClicksGlobal);
});

// ==========================
// EVENTOS GLOBALES
// ==========================
function manejarClicksGlobal(e) {

  if (e.target.matches("#loginBtn")) {
    document.getElementById("loginBox").style.display = "block";
  }

  if (e.target.matches("#btn-login")) {
    login();
  }

  if (e.target.matches("#nav-dashboard")) {
    mostrarVista("dashboardView");
  }

  if (e.target.matches("#nav-incidencias")) {
    mostrarVista("incidenciasView");
    cargarIncidencias();
  }

  if (e.target.matches("#nav-estadisticas")) {
    mostrarVista("estadisticasView");
    cargarIncidencias();
  }
}

// ==========================
// LOGIN
// ==========================
async function login() {
  const usuario = document.getElementById("usuario").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(API + "/api/auth/login", {
      method: "POST",
      headers: getHeaders(true),
      body: JSON.stringify({ usuario, password })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || "Error en login");
      return;
    }

    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.user));

    document.getElementById("userStatus").innerText =
      "Logueado como " + data.user.usuario;

    document.getElementById("loginBox").style.display = "none";

    cargarIncidencias();

  } catch (error) {
    console.error(error);
    alert("Error de conexión");
  }
}

// ==========================
// INCIDENCIAS - CLICK
// ==========================
function manejarClicksIncidencias(e) {
  const id = e.target.dataset.id;
  if (!id) return;

  if (e.target.classList.contains("btn-delete")) {
    eliminarIncidencia(id);
  }

  if (e.target.classList.contains("btn-proceso")) {
    cambiarEstado(id, "proceso");
  }

  if (e.target.classList.contains("btn-resuelta")) {
    cambiarEstado(id, "resuelta");
  }

  if (e.target.classList.contains("btn-pendiente")) {
    cambiarEstado(id, "pendiente");
  }
}

// ==========================
// ELIMINAR
// ==========================
async function eliminarIncidencia(id) {

  if (!confirm("¿Eliminar incidencia?")) return;

  try {
    const res = await fetch(API + "/api/incidencias/" + id, {
      method: "DELETE",
      headers: getHeaders()
    });

    if (res.status === 401) {
      cerrarSesion();
      return;
    }

    if (!res.ok) {
      alert("Error al eliminar");
      return;
    }

    cargarIncidencias();

  } catch (error) {
    console.error(error);
  }
}

// ==========================
// CAMBIAR ESTADO
// ==========================
async function cambiarEstado(id, estado) {

  try {
    const res = await fetch(API + "/api/incidencias/" + id, {
      method: "PUT",
      headers: getHeaders(true),
      body: JSON.stringify({ estado })
    });

    if (res.status === 401) {
      cerrarSesion();
      return;
    }

    cargarIncidencias();

  } catch (error) {
    console.error(error);
  }
}

// ==========================
// CARGAR INCIDENCIAS
// ==========================
async function cargarIncidencias() {

  const token = getToken();

  const url = token
    ? API + "/api/incidencias"
    : API + "/api/incidencias/public";

  try {
    const res = await fetch(url, {
      headers: getHeaders()
    });

    if (res.status === 401) {
      cerrarSesion();
      return;
    }

    const data = await res.json();

    renderStats(data);
    renderIncidencias(data);

  } catch (error) {
    console.error(error);
  }
}

// ==========================
// RENDER STATS
// ==========================
function renderStats(data) {

  let pendientes = 0;
  let proceso = 0;
  let resueltas = 0;

  data.forEach(i => {
    if (i.estado === "pendiente") pendientes++;
    if (i.estado === "proceso") proceso++;
    if (i.estado === "resuelta") resueltas++;
  });

  document.getElementById("pendientes").textContent = pendientes;
  document.getElementById("proceso").textContent = proceso;
  document.getElementById("resueltas").textContent = resueltas;

  document.getElementById("pendientes2").textContent = pendientes;
  document.getElementById("proceso2").textContent = proceso;
  document.getElementById("resueltas2").textContent = resueltas;
}

// ==========================
// RENDER LISTA
// ==========================
function renderIncidencias(data) {

  const lista = document.getElementById("lista-incidencias");
  if (!lista) return;

  lista.innerHTML = "";

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  data.forEach(i => {

    const div = document.createElement("div");
    div.className = "incidencia";

    let botones = "";

    if (i.estado !== "pendiente") {
      botones += `<button class="btn-pendiente" data-id="${i.id}">Pendiente</button>`;
    }

    if (i.estado !== "proceso") {
      botones += `<button class="btn-proceso" data-id="${i.id}">Proceso</button>`;
    }

    if (i.estado !== "resuelta") {
      botones += `<button class="btn-resuelta" data-id="${i.id}">Resuelta</button>`;
    }

    if (usuario && usuario.rol === "admin") {
      botones += `<button class="btn-delete" data-id="${i.id}" style="background:red;color:white;">Eliminar</button>`;
    }

    div.innerHTML = `
      <strong>${i.titulo}</strong>
      <p>${i.descripcion}</p>
      <span class="estado ${i.estado}">${i.estado}</span>
      <div class="actions">${botones}</div>
    `;

    lista.appendChild(div);
  });
}

// ==========================
// CREAR INCIDENCIA
// ==========================
document.addEventListener("submit", async (e) => {

  if (e.target.matches("#formIncidencia")) {
    e.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const descripcion = document.getElementById("descripcion").value;

    try {
      const res = await fetch(API + "/api/incidencias", {
        method: "POST",
        headers: getHeaders(true),
        body: JSON.stringify({ titulo, descripcion })
      });

      if (res.status === 401) {
        cerrarSesion();
        return;
      }

      if (!res.ok) {
        alert("Error al crear incidencia");
        return;
      }

      alert("Incidencia creada");

      e.target.reset();
      cargarIncidencias();

    } catch (error) {
      console.error(error);
    }
  }
});

// ==========================
// UTIL
// ==========================
function cerrarSesion() {
  alert("Sesión expirada");
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  location.reload();
}

// ==========================
// VISTAS
// ==========================
function mostrarVista(id) {
  document.querySelectorAll(".view").forEach(v => {
    v.classList.remove("active-view");
  });

  document.getElementById(id).classList.add("active-view");
}