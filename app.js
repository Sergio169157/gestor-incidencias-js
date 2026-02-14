const API_URL = "http://127.0.0.1:3000/api";

const formulario = document.getElementById("form-incidencia");
const lista = document.getElementById("lista-incidencias");
const buscador = document.getElementById("buscador");

const btnLogin = document.getElementById("btn-login");
const btnLogout = document.getElementById("btn-logout");
const usuarioInfo = document.getElementById("usuario-info");

let incidenciasGlobal = [];

// ===============================
// LOGIN
// ===============================

async function hacerLogin() {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "admin",
      password: "1234"
    })
  });

  const data = await res.json();

  if (res.ok) {
    localStorage.setItem("token", data.token);
    actualizarUIAuth();
    cargarIncidencias();
  }
}

btnLogin.addEventListener("click", hacerLogin);

btnLogout.addEventListener("click", () => {
  localStorage.removeItem("token");
  actualizarUIAuth();
  cargarIncidencias();
});

function actualizarUIAuth() {
  const token = localStorage.getItem("token");

  if (token) {
    btnLogin.style.display = "none";
    btnLogout.style.display = "inline-block";

    const payload = JSON.parse(atob(token.split(".")[1]));
    usuarioInfo.textContent = "Conectado como: " + payload.username;
  } else {
    btnLogin.style.display = "inline-block";
    btnLogout.style.display = "none";
    usuarioInfo.textContent = "No autenticado";
  }
}

actualizarUIAuth();

// ===============================
// CARGAR INCIDENCIAS
// ===============================

async function cargarIncidencias() {
  const res = await fetch(`${API_URL}/incidencias`);
  incidenciasGlobal = await res.json();
  renderizarIncidencias(incidenciasGlobal);
  actualizarContador(incidenciasGlobal);
}

cargarIncidencias();

// ===============================
// CREAR INCIDENCIA
// ===============================

formulario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value;
  const descripcion = document.getElementById("descripcion").value;
  const prioridad = document.getElementById("prioridad").value;

  await fetch(`${API_URL}/incidencias`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ titulo, descripcion, prioridad })
  });

  formulario.reset();
  cargarIncidencias();
});

// ===============================
// RENDERIZAR
// ===============================

function renderizarIncidencias(listaFiltrada) {
  lista.innerHTML = "";
  const token = localStorage.getItem("token");

  listaFiltrada.forEach(incidencia => {

    const fechaFormateada = new Date(incidencia.fecha)
      .toLocaleString("es-ES");

    const div = document.createElement("div");
    div.classList.add("incidencia");

    div.innerHTML = `
      <h3>${incidencia.titulo}</h3>
      <p>${incidencia.descripcion}</p>
      <p><strong>Prioridad:</strong> ${incidencia.prioridad}</p>
      <p><strong>Estado:</strong> ${incidencia.estado}</p>
      <p><small>Creada: ${fechaFormateada}</small></p>
      ${token ? '<button class="btn-eliminar">Eliminar</button>' : ''}
      ${token ? '<button class="btn-estado">Cambiar Estado</button>' : ''}
    `;

    if (token) {
      div.querySelector(".btn-eliminar").addEventListener("click", async () => {
        await fetch(`${API_URL}/incidencias/${incidencia.id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
        cargarIncidencias();
      });

      div.querySelector(".btn-estado").addEventListener("click", async () => {
        await fetch(`${API_URL}/incidencias/${incidencia.id}/estado`, {
          method: "PUT",
          headers: { "Authorization": `Bearer ${token}` }
        });
        cargarIncidencias();
      });
    }

    lista.appendChild(div);
  });
}

// ===============================
// BUSCADOR
// ===============================

buscador.addEventListener("input", () => {
  const texto = buscador.value.toLowerCase();

  const filtradas = incidenciasGlobal.filter(i =>
    i.titulo.toLowerCase().includes(texto) ||
    i.descripcion.toLowerCase().includes(texto)
  );

  renderizarIncidencias(filtradas);
});

// ===============================
// CONTADOR
// ===============================

function actualizarContador(incidencias) {
  document.getElementById("count-pendiente").textContent =
    incidencias.filter(i => i.estado === "pendiente").length;

  document.getElementById("count-proceso").textContent =
    incidencias.filter(i => i.estado === "en-proceso").length;

  document.getElementById("count-resuelta").textContent =
    incidencias.filter(i => i.estado === "resuelta").length;
}