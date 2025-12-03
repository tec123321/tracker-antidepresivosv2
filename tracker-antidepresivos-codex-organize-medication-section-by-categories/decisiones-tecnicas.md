# Decisiones técnicas

Este documento resume las decisiones técnicas del proyecto **Tracker de progreso de medicación**, rama `codex/organize-medication-section-by-categories`.

---

## 1. Objetivo técnico

Construir una aplicación web **sin backend**, que:

- Sea usable abriendo solo `index.html` en un navegador moderno.
- Persista datos en `localStorage`.
- Mantenga la lógica en JavaScript modular.
- Exponga claramente:
  - modelo de datos,
  - flujo de recordatorios,
  - manejo de alertas de interacción.

---

## 2. Stack elegido

- **Frontend**
  - HTML5 semántico.
  - CSS con clases utilitarias simples.
  - JavaScript vanilla ES Modules.

- **Persistencia**
  - `localStorage` con clave fija `med-tracker`.
  - Estructura raíz:

    ```js
    {
      meds: [],      // planes de medicación
      alertsLog: []  // historial de alertas de interacción
    }
    ```

  - En `script.js`:

    ```js
    const raw = localStorage.getItem(storageKey);
    const data = raw ? JSON.parse(raw) : { meds: [], alertsLog: [] };
    if (!data.alertsLog) data.alertsLog = [];
    ```

- **Módulos JS**
  - `script.js`: lógica principal.
  - `data.js`: catálogo de medicamentos/suplementos e interacciones.
  - `interacciones.js`: lista agregada de interacciones.
  - `retiro.js`: vista de retirada gradual.
  - `adherencia.js`: reservado para cálculo de adherencia.

---

## 3. Modelo de datos (resumen)

En `localStorage` se guarda un objeto con dos colecciones:

- `meds`: planes de medicación.
- `alertsLog`: alertas de interacción.

### 3.1 Plan de medicación (`meds[]`)

Estructura aproximada de cada entrada:

```js
{
  id: 'uuid-123',
  catalogId: 'sertralina', // o slug de nombre si no existe en catálogo
  name: 'Sertralina',
  dose: '50 mg/día',
  startDate: '2025-01-01',  // ISO string
  durationWeeks: 24,
  reminderEvery: 1,         // semanas entre recordatorios
  notes: 'Notas generales',
  logs: [
    {
      id: 'uuid-log-1',
      weekNumber: 1,
      mood: 6,
      effects: 'Náuseas leves',
      notes: 'Texto libre',
      adherence: true,
      date: '2025-01-08T10:00:00.000Z',
    },
    // ...
  ],
  snoozedUntil: null // o fecha ISO si está aplazado
}
```

### 3.2 Alertas de interacción (`alertsLog[]`)

Generadas a partir de `checkInteractions` cuando se da de alta un plan nuevo.

```js
{
  id: 'uuid-alert-1',
  med1: 'Sertralina',
  med2: 'Ibuprofeno',
  msg: 'Puede aumentar riesgo de sangrado con uso prolongado.',
  level: 'low',                   // 'low' | 'medium' | 'high'
  code: 'sertralina-ibuprofeno',  // combinación única de ids
  date: '2025-01-08T10:05:00.000Z'
}
```

En `script.js` se limita el tamaño del historial:

```js
if (data.alertsLog.length > 30) {
  data.alertsLog = data.alertsLog.slice(-30);
}
```

---

## 4. Funciones clave en `script.js` (visión)

- `loadData` / `saveData`:
  - Capa única de acceso a `localStorage`.
- `uuid`:
  - Generación de ids para planes, logs y alertas.
- `slugify`:
  - Normalización de nombres para poder mapearlos a `medDatabase`.
- `weeksBetween`:
  - Calcular semanas entre dos fechas.
- `reminderStatus`:
  - Determina si un plan está:
    - al día (`ok`),
    - atrasado (`due`),
    - aplazado (`snoozed`).
- `findMedEntry`:
  - Buscar un elemento en `medDatabase` por `id` o nombre normalizado.
- `checkInteractions`:
  - Recorre `cautionList` y arma las posibles interacciones.
- `recordAlerts`:
  - Inserta las alertas en `alertsLog` evitando duplicados por `code`.
- `renderStats`, `renderReminders`, `renderMeds`, `renderTimeline`:
  - Capa de presentación (DOM) de estadísticas, recordatorios y planes.
- `populateMedOptions`, `renderCatalog`:
  - Construyen el catálogo a partir de `medDatabase`.
- `saveAndRender`:
  - Único punto donde se:
    - persiste `data`,
    - repinta la UI.
- `init` (IIFE):
  - Carga los datos, inicializa catálogo y UI.

---

## 5. Decisiones de diseño

1. **Separar catálogo (`data.js`) de lógica**
   - Permite cambiar entradas médicas sin modificar la lógica de la app.
   - Hace más claro qué parte requiere validación por expertos.

2. **Alertas recortadas a las últimas 30**
   - Mantiene manejable el historial.
   - Evita que el panel se vuelva ilegible tras mucho tiempo de uso.

3. **Interacciones bidireccionales**
   - `checkInteractions` trata las interacciones A–B y B–A de forma uniforme.
   - Evita duplicados con un `Set` de códigos (`code`).

4. **Sin backend por ahora**
   - Menos fricción para probar el proyecto.
   - Fácil de mostrar en entrevistas.

---

## 6. Próximos pasos técnicos posibles

- Implementar `adherencia.js` y reutilizar sus funciones desde `script.js`.
- Extraer parte de la lógica de recordatorios a funciones puras testeables.
- Añadir un pequeño módulo de exportación (CSV/JSON).
- Explorar una segunda versión con:
  - autenticación,
  - sincronización entre dispositivos,
  - backend real.
