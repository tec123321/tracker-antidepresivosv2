# Plan de pruebas manuales

Este documento recoge un conjunto de pruebas manuales para verificar el comportamiento básico de la app.

La idea es:

- Ejecutar estos casos en un navegador real.
- Anotar qué pasa en cada uno.
- Crear issues o TODOs si algo falla.

---

## 1. Preparación

1. Abre `index.html` en un navegador de escritorio.
2. Abre las herramientas de desarrollo (F12) para ver la consola.
3. Limpia el estado anterior:

   - En la consola, ejecuta:

     ```js
     localStorage.removeItem('med-tracker');
     ```

   - Recarga la página.

---

## 2. Alta de tratamiento y guardado

**Caso 2.1 – Alta básica**

1. En el formulario “Añadir medicación”:
   - Nombre: `Sertralina`
   - Dosis: `50 mg`
   - Fecha de inicio: hoy.
   - Duración (semanas): `12`.
   - Recordatorio cada: `1` semana.
   - Notas: cualquier texto.
2. Guarda.
3. Verifica:
   - Aparece una tarjeta en recordatorios.
   - Aparece en el listado de tratamientos.
   - En consola:

     ```js
     JSON.parse(localStorage.getItem('med-tracker'))
     ```

     contiene:
     - `meds` con 1 elemento.
     - Ese elemento tiene `id`, `name`, `startDate`, `durationWeeks`, `logs` (array), etc.

---

## 3. Estadísticas

**Caso 3.1 – Una medicación**

1. Con un solo plan:
   - `statActive` muestra 1 plan activo (texto coherente).
   - `statDue` y `statWeek` tienen valores numéricos razonables (no `NaN`).

**Caso 3.2 – Dos medicaciones**

1. Añade otra (por ejemplo `Mirtazapina`).
2. Comprueba:
   - `statActive` pasa a 2.
   - `statWeek` refleja la semana máxima entre ambos planes.

---

## 4. Recordatorios y registros

**Caso 4.1 – Registrar una semana**

1. En el panel de recordatorios, abre el formulario de registro de progreso para un plan.
2. Rellena:
   - Estado de ánimo.
   - Efectos.
   - Notas.
   - Adherencia (marca/desmarca).
3. Guarda.
4. Verifica:
   - Aparece la entrada en el historial del plan.
   - En `localStorage`, el plan tiene `logs.length === 1`.

**Caso 4.2 – Cambio de estado del recordatorio**

1. Después de registrar una semana:
   - El estado del recordatorio debería cambiar (por ejemplo de “pendiente” a “al día”).
2. Verifica que el texto/mensaje asociado refleja que la última semana está registrada.

**Caso 4.3 – Aplazar recordatorio**

1. Usa la acción de aplazar (snooze) en un recordatorio.
2. Comprueba:
   - El recordatorio cambia a estado equivalente a “en pausa”.
   - En los datos, `snoozedUntil` tiene una fecha futura.

---

## 5. Alertas de interacción

**Caso 5.1 – Generación de alerta**

1. Asegúrate de tener un plan con un fármaco que tenga `cautionList` en `data.js`.
2. Crea un segundo plan que, según `data.js`, interactúe con el primero.
3. Verifica:
   - Durante la alta aparece un aviso/modal (según tu implementación).
   - Tras confirmarlo, el panel de alertas muestra la nueva alerta.
   - En `localStorage`:

     ```js
     JSON.parse(localStorage.getItem('med-tracker')).alertsLog
     ```

     contiene al menos una entrada con `med1`, `med2`, `msg`, `level`, `code`, `date`.

**Caso 5.2 – Sin duplicados**

1. Repite la creación de un plan que genere la misma interacción.
2. Comprueba que:
   - No se generan alertas duplicadas con el mismo `code`.

---

## 6. Catálogo por categorías

**Caso 6.1 – Separación medicación/suplementos**

1. En `index.html`, baja hasta la sección de catálogo.
2. Verifica:
   - El bloque de medicamentos solo contiene elementos con `classification === 'medication'`.
   - Los suplementos y similares aparecen en el bloque correspondiente.

**Caso 6.2 – Agrupación por categoría**

1. Comprueba que los elementos están agrupados visualmente por `category`.
2. Dentro de cada grupo, los nombres aparecen ordenados de forma coherente (alfabético, etc.).

---

## 7. Página de interacciones

**Caso 7.1 – Lista de interacciones**

1. Abre `interacciones.html`.
2. Verifica:
   - La lista no está vacía (si `data.js` tiene `cautionList`).
   - Cada entrada muestra:
     - par implicado,
     - nivel,
     - mensaje.

**Caso 7.2 – Resumen de suplementos**

1. Revisa el bloque de suplementos.
2. Cada suplemento debería indicar:
   - si tiene o no interacciones relevantes,
   - con qué nombres interactúa.

---

## 8. Página de retirada

**Caso 8.1 – Tarjetas por categoría**

1. Abre `retiro.html`.
2. Verifica:
   - Aparecen tarjetas por categoría.
   - Dentro de cada tarjeta, una lista de `<nombre>: taperNote`.

**Caso 8.2 – Sin categorías vacías**

1. Comprueba que no haya tarjetas sin elementos dentro.
2. Si las hay, revisar `groupByCategory()` en `retiro.js`.

---

## 9. Pruebas de regresión mínimas

Cada vez que cambies algo importante en:

- `script.js`,
- `data.js`,
- `interacciones.js`,
- `retiro.js`,

repite como mínimo:

- Caso 2.1
- Caso 4.1
- Caso 5.1
- Caso 7.1
- Caso 8.1

Si algo falla, anótalo en un issue o deja un `TODO` en el código con fecha.
