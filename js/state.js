let incidencias = JSON.parse(localStorage.getItem("incidencias")) || [];

export function getIncidencias() {
  return incidencias;
}

export function agregarIncidencia(incidencia) {
  incidencias.push(incidencia);
  guardar();
}

export function eliminarIncidencia(id) {
  incidencias = incidencias.filter(i => i.id !== id);
  guardar();
}

export function cambiarEstado(id) {
  const incidencia = incidencias.find(i => i.id === id);

  if (!incidencia) return;

  if (incidencia.estado === "pendiente") {
    incidencia.estado = "en-proceso";
  } else if (incidencia.estado === "en-proceso") {
    incidencia.estado = "resuelta";
  } else {
    incidencia.estado = "pendiente";
  }

  guardar();
}

function guardar() {
  localStorage.setItem("incidencias", JSON.stringify(incidencias));
}