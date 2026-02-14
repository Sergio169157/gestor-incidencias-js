const KEY = "incidencias";

export function getIncidencias() {
  const data = localStorage.getItem(KEY);
  return data ? JSON.parse(data) : [];
}

export function agregarIncidencia(nueva) {
  const incidencias = getIncidencias();

  nueva.fecha = Date.now(); // 🔥 fecha automática

  incidencias.push(nueva);
  localStorage.setItem(KEY, JSON.stringify(incidencias));
}

export function eliminarIncidencia(id) {
  const incidencias = getIncidencias();
  const nuevas = incidencias.filter(i => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(nuevas));
}

export function cambiarEstado(id) {
  const incidencias = getIncidencias();

  const incidencia = incidencias.find(i => i.id === id);
  if (!incidencia) return;

  const flujo = {
    pendiente: "en-proceso",
    "en-proceso": "resuelta",
    resuelta: "pendiente"
  };

  incidencia.estado = flujo[incidencia.estado];

  localStorage.setItem(KEY, JSON.stringify(incidencias));
}

export function actualizarIncidencia(id, nuevosDatos) {
  const incidencias = getIncidencias();

  const incidencia = incidencias.find(i => i.id === id);
  if (!incidencia) return;

  incidencia.titulo = nuevosDatos.titulo;
  incidencia.descripcion = nuevosDatos.descripcion;
  incidencia.prioridad = nuevosDatos.prioridad;

  localStorage.setItem(KEY, JSON.stringify(incidencias));
}
