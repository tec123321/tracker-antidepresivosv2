// adherencia.js - Lógica reutilizable para calcular adherencia
// Actualizado para funcionar como módulo ES

export function calcularSemanaDesdeInicio(fechaInicioISO, ahora = new Date()) {
  if (!fechaInicioISO) return 1;

  const inicio = new Date(fechaInicioISO);
  if (Number.isNaN(inicio.getTime())) {
    return 1;
  }

  // Normalizar a medianoche
  const start = new Date(
    inicio.getFullYear(),
    inicio.getMonth(),
    inicio.getDate()
  );
  const end = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );

  const diffMs = end - start;
  const msPerWeek = 1000 * 60 * 60 * 24 * 7;
  const diffWeeks = Math.floor(diffMs / msPerWeek);

  // Semana 1 = primeros 7 días
  return Math.max(1, diffWeeks + 1);
}

export function calcularAdherencia(registros, diasEsperados) {
  const lista = Array.isArray(registros) ? registros : [];
  const esperadoBase = Number.isFinite(diasEsperados) && diasEsperados > 0 ? diasEsperados : 0;
  
  // Usamos el máximo para no superar 100% y penalizar la falta de registros
  const esperado = Math.max(esperadoBase, lista.length);

  if (esperado <= 0) return 0;

  const tomados = lista.filter((r) => r && r.adherence === true).length;
  const porcentaje = (tomados / esperado) * 100;

  return Math.round(porcentaje);
}

export function clasificarEstadoAdherencia(porcentaje) {
  if (!Number.isFinite(porcentaje) || porcentaje < 0) {
    return { level: 'sin_datos', label: 'Sin datos', class: 'ok' };
  }
  if (porcentaje >= 90) return { level: 'alta', label: 'Excelente', class: 'ok' };
  if (porcentaje >= 70) return { level: 'media', label: 'Buena', class: 'ok' };
  if (porcentaje >= 50) return { level: 'regular', label: 'Regular', class: 'snoozed' };
  
  return { level: 'baja', label: 'Baja', class: 'due' };
