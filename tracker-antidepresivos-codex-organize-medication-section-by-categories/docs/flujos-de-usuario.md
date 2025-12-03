# Flujos de usuario

Este documento describe los flujos principales de uso de la app, pensados para explicar el proyecto a otras personas (entrevista, revisión de portafolio, etc.).

---

## 1. Crear un plan de medicación

**Objetivo**: empezar a seguir un tratamiento nuevo.

1. El usuario abre `index.html`.
2. Pulsa el botón “Añadir medicación”.
3. Rellena:
   - nombre del medicamento (idealmente existente en `medDatabase`),
   - dosis,
   - fecha de inicio,
   - duración estimada en semanas,
   - frecuencia de recordatorio semanal.
4. Opcionalmente escribe notas generales.
5. Al enviar el formulario:
   - la app construye un objeto `med` con esa información,
   - llama a la lógica de interacciones (`checkInteractions`) pasando el nuevo plan y los existentes,
   - si hay interacciones relevantes:
     - muestra un resumen y pide confirmación.
6. Si el usuario confirma:
   - se guarda el plan en `data.meds`,
   - se registran las alertas en `data.alertsLog`,
   - se actualiza el panel de recordatorios y estadísticas.

---

## 2. Registrar el progreso semanal

**Objetivo**: dejar constancia de cómo ha ido la semana con el tratamiento.

1. El usuario ve en la sección de **recordatorios** los planes activos.
2. Para un plan concreto:
   - pulsa el botón de registrar progreso (o similar).
3. Se abre un formulario con campos como:
   - estado de ánimo,
   - efectos secundarios,
   - notas libres,
   - adherencia (sí/no).
4. Al guardar:
   - se añade un registro en `logs` dentro del plan correspondiente,
   - se recalcula el estado del recordatorio (ok/due),
   - la línea de tiempo refleja que esa semana está completada.

---

## 3. Gestionar recordatorios

**Objetivo**: ajustar la frecuencia y manejar periodos en los que se quiere pausar el seguimiento.

1. Desde la tarjeta de cada plan en la sección de recordatorios:
   - el usuario puede:
     - cambiar el intervalo de recordatorio (por ejemplo, de 1 semana a 2),
     - aplazar (snooze) el recordatorio durante un tiempo determinado.
2. Al aplazar:
   - se actualiza `snoozedUntil`,
   - el estado del recordatorio pasa a “en pausa”,
   - el plan deja de contar como “pendiente” hasta que pase la fecha de `snoozedUntil`.

---

## 4. Revisar interacciones

**Objetivo**: tener una vista global de las combinaciones sensibles entre tratamientos y suplementos.

1. El usuario abre `interacciones.html`.
2. La página:
   - recorre `medDatabase`,
   - construye una lista de interacciones únicas (sin duplicar A–B y B–A),
   - ordena por severidad (high, medium, low).
3. Se muestra:
   - una lista principal con los pares y su mensaje,
   - un bloque adicional que resalta suplementos y con qué interactúan.
4. Esta vista es independiente del estado del usuario; se basa solo en el catálogo.

---

## 5. Consultar pautas de retirada

**Objetivo**: visualizar las notas de retirada asociadas a cada fármaco, agrupadas por tipo.

1. El usuario abre `retiro.html`.
2. La página:
   - filtra `medDatabase` por:
     - `classification === 'medication'`,
     - `taperNote` definido,
   - agrupa por `category`.
3. Para cada categoría, se genera una tarjeta con:
   - título de la categoría,
   - lista de `<nombre del fármaco>: taperNote`.
4. Esta información es descriptiva y no sustituye ninguna pauta médica real.

---

## 6. Flujo de revisión médica (escenario de uso ideal)

**Escenario hipotético**:

1. El usuario usa la app durante varias semanas, registrando:
   - síntomas,
   - efectos secundarios,
   - adherencia.
2. Antes de una cita con el profesional:
   - revisa el historial de su(s) tratamiento(s),
   - consulta las alertas registradas,
   - revisa las notas más importantes.
3. Lleva al profesional:
   - un resumen verbal basado en estos registros,
   - eventualmente una exportación (futura funcionalidad).

Este flujo explica por qué el foco está en:

- semanas (no días),
- notas y adherencia,
- alertas de interacción.
