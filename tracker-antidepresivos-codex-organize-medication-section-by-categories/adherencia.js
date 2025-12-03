// adherencia.js
// Lógica reutilizable para calcular adherencia a tratamientos.
// Este archivo no depende del DOM y se puede probar desde consola.

/**
 * Devuelve el número de semana (1, 2, 3, ...) transcurrida desde la fecha de inicio.
 * La semana 1 corresponde a los primeros 7 días desde `fechaInicioISO`.
 *
 * @param {string} fechaInicioISO - Fecha de inicio en formato ISO (YYYY-MM-DD o equivalente).
 * @param {Date} [ahora=new Date()] - Fecha de referencia para el cálculo.
 * @returns {number} Número de semana (mínimo 1).
 */
function calcularSemanaDesdeInicio(fechaInicioISO, ahora = new Date()) {
  if (!fechaInicioISO) return 1;

  const inicio = new Date(fechaInicioISO);
  if (Number.isNaN(inicio.getTime())) {
    // Si la fecha no es válida, devolvemos 1 para no romper la UI.
    return 1;
  }

  // Normalizar a medianoche para evitar desajustes por husos horarios u horas.
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

/**
 * Calcula el porcentaje de adherencia (0–100) en un periodo.
 *
 * `registros` debe ser un array de objetos con la propiedad booleana `adherence`
 * (por ejemplo, los `logs` de un plan en localStorage).
 *
 * `diasEsperados` representa cuántos registros se esperaban en el periodo
 * (en tu caso, normalmente el número de semanas transcurridas desde el inicio).
 *
 * La función:
 * - Cuenta cuántos registros tienen `adherence === true`.
 * - Usa como denominador el máximo entre `diasEsperados` y `registros.length`
 *   para no superar nunca el 100% y seguir penalizando semanas sin registro.
 *
 * @param {Array<{adherence?: boolean}>} registros
 * @param {number} diasEsperados
 * @returns {number} Porcentaje de adherencia redondeado (0–100).
 */
function calcularAdherencia(registros, diasEsperados) {
  const lista = Array.isArray(registros) ? registros : [];

  const esperadoBase =
    Number.isFinite(diasEsperados) && diasEsperados > 0 ? diasEsperados : 0;

  // Nos quedamos con el máximo para:
  // - no superar 100%,
  // - penalizar semanas sin registro (esperado > registros.length).
  const esperado = Math.max(esperadoBase, lista.length);

  if (esperado <= 0) return 0;

  const tomados = lista.filter((r) => r && r.adherence === true).length;
  const porcentaje = (tomados / esperado) * 100;

  return Math.round(porcentaje);
}

/**
 * Clasifica un porcentaje de adherencia en niveles para la UI.
 *
 * Los umbrales son educativos, no clínicos:
 * - >= 90%  → "alta"
 * - 70–89%  → "media"
 * - 1–69%   → "baja"
 * - 0%      → "nula"
 *
 * Puedes modificar estos umbrales más adelante según tu criterio.
 *
 * @param {number} porcentaje
 * @returns {{ level: string, label: string }}
 */
function clasificarEstadoAdherencia(porcentaje) {
  if (!Number.isFinite(porcentaje) || porcentaje < 0) {
    return { level: 'sin_datos', label: 'Sin datos suficientes' };
  }

  if (porcentaje >= 90) {
    return { level: 'alta', label: 'Adherencia alta' };
  }

  if (porcentaje >= 70) {
    return { level: 'media', label: 'Adherencia media' };
  }

  if (porcentaje > 0) {
    return { level: 'baja', label: 'Adherencia baja' };
  }

  return { level: 'nula', label: 'Sin adherencia registrada' };
}

// Exponer utilidades en `window` para poder llamarlas desde la consola o módulos.
if (typeof window !== 'undefined') {
  window.calcularSemanaDesdeInicio = calcularSemanaDesdeInicio;
  window.calcularAdherencia = calcularAdherencia;
  window.clasificarEstadoAdherencia = clasificarEstadoAdherencia;
  window.adherenciaUtils = {
    calcularSemanaDesdeInicio,
    calcularAdherencia,
    clasificarEstadoAdherencia,
  };
}
