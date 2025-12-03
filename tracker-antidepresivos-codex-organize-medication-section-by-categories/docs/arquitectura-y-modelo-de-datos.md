# Arquitectura y modelo de datos

Este documento describe:

1. Cómo se organiza el código por módulos.
2. El modelo de datos que se guarda en `localStorage`.
3. La relación entre las distintas vistas (`index.html`, `interacciones.html`, `retiro.html`).

---

## 1. Vista general

La app tiene tres vistas principales:

1. **Principal** – `index.html` + `script.js`
   - Alta de tratamientos.
   - Recordatorios semanales.
   - Historial por semanas.
   - Panel de alertas recientes.
   - Catálogo por categorías.

2. **Interacciones** – `interacciones.html` + `interacciones.js`
   - Lista agregada de interacciones entre entradas de `medDatabase`.
   - Resumen de suplementos y con qué interactúan.

3. **Retirada** – `retiro.html` + `retiro.js`
   - Tarjetas por categoría.
   - Lista de fármacos con `taperNote` definido.

Todas comparten el mismo catálogo farmacológico definido en `data.js`.

---

## 2. Módulos y responsabilidades

### 2.1 `data.js`

Exporta `medDatabase`, un array de objetos:

```js
{
  id: 'sertralina',
  name: 'Sertralina',
  type: 'ISRS',
  category: 'Antidepresivo ISRS',
  classification: 'medication', // o 'supplement', 'substance', etc.
  taperNote: 'Reducción gradual: ...', // opcional
  cautionList: [
    {
      targetId: 'ibuprofeno',
      level: 'low' | 'medium' | 'high',
      msg: 'Texto de advertencia'
    },
    // ...
  ]
}
```

Se usa en:

- `script.js`:
  - para poblar el catálogo,
  - para cruzar interacciones al dar de alta un plan.
- `interacciones.js`:
  - para construir la lista agregada de interacciones.
- `retiro.js`:
  - para agrupar fármacos con `taperNote` por `category`.

---

### 2.2 `script.js` (lógica principal)

Responsabilidades principales:

- Gestión de estado en memoria.
- Lectura/escritura en `localStorage`.
- Lógica de recordatorios.
- Construcción del panel de alertas.
- Renderizado de la UI principal.

Funciones relevantes (simplificadas):

```js
function loadData() { ... }         // lee de localStorage o crea { meds: [], alertsLog: [] }
function saveData(data) { ... }     // guarda en localStorage
function uuid() { ... }             // genera ids
function slugify(name) { ... }      // normaliza nombres

function weeksBetween(start, end) { ... }

function reminderStatus(med) { ... } // decide ok/due/snoozed

function findMedEntry(nameOrId) { ... }

function checkInteractions(newMed, currentMeds) { ... } // construye lista de alertas
function recordAlerts(data, alerts) { ... }             // añade a alertsLog, limita tamaño

function renderStats(data) { ... }       // estadísticas rápidas
function renderReminders(data) { ... }   // tarjetas de recordatorio
function renderMeds(data) { ... }        // tarjetas de tratamientos
function renderTimeline(med) { ... }     // línea de tiempo por semanas

function populateMedOptions() { ... }    // opciones para el formulario
function renderCatalog() { ... }         // catálogo por categorías

function saveAndRender(data) { ... }     // punto único de guardado + repintado

(function init() { ... })();             // arranque de la app
```

El estado global que se pasa entre funciones sigue la estructura descrita en el apartado del modelo de datos.

---

### 2.3 `interacciones.js`

Responsabilidades:

- Construir la lista de interacciones posibles a partir de `medDatabase`.
- Ordenar por severidad.
- Pintar en `interacciones.html`.

Idea clave:

```js
const severityOrder = { high: 0, medium: 1, low: 2 };

function buildInteractions() {
  const seen = new Set();
  const all = [];
  medDatabase.forEach((source) => {
    source.cautionList?.forEach((caution) => {
      const target = medDatabase.find((m) => m.id === caution.targetId);
      if (!target) return;
      const key = [source.id, target.id].sort().join('|');
      if (seen.has(key)) return;
      seen.add(key);
      all.push({
        from: source,
        to: target,
        level: caution.level,
        msg: caution.msg,
      });
    });
  });
  return all;
}
```

Luego se ordena y se renderiza en el DOM (`interactionList`, `supplementHighlight`).

---

### 2.4 `retiro.js`

Responsabilidades:

- Agrupar fármacos con `taperNote` por `category`.
- Renderizar tarjetas en `retiro.html`.

Código clave:

```js
function groupByCategory() {
  return medDatabase
    .filter((item) => item.classification === 'medication' && item.taperNote)
    .reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});
}

function renderTaperCards() {
  taperGrid.innerHTML = '';
  const groups = groupByCategory();
  Object.entries(groups).forEach(([category, meds]) => {
    // Crear tarjeta y lista con <strong>nombre</strong>: taperNote
  });
}
```

---

### 2.5 `adherencia.js`

Archivo reservado para lógica de adherencia:

```js
function calcularSemanaDesdeInicio(fechaInicioISO, ahora = new Date()) { ... }

function calcularAdherencia(registros, diasEsperados) { ... }

function clasificarEstadoAdherencia(porcentaje) { ... }
```

Aquí se debería centralizar la lógica común de adherencia para poder:

- usarla desde `script.js`,
- testearla aparte,
- decidir criterios claros (tu tarea).

---

## 3. Modelo de datos completo en `localStorage`

Ejemplo de estructura:

```js
{
  meds: [
    {
      id: 'uuid-1',
      catalogId: 'sertralina',
      name: 'Sertralina',
      dose: '50 mg por la mañana',
      startDate: '2025-01-01',
      durationWeeks: 24,
      reminderEvery: 1,
      notes: 'Notas generales',
      snoozedUntil: null,
      logs: [
        {
          id: 'uuid-log-1',
          weekNumber: 1,
          mood: 6,
          effects: 'Náuseas leves',
          notes: 'Se tolera bien',
          adherence: true,
          date: '2025-01-08T10:00:00.000Z',
        },
        // ...
      ]
    },
    // ...
  ],
  alertsLog: [
    {
      id: 'uuid-alert-1',
      med1: 'Sertralina',
      med2: 'Ibuprofeno',
      msg: 'Puede aumentar riesgo de sangrado con uso prolongado.',
      level: 'low',
      code: 'sertralina-ibuprofeno',
      date: '2025-01-08T10:05:00.000Z',
    },
    // ...
  ]
}
```

---

## 4. Relación entre vistas

- `index.html`:
  - Usa `script.js`.
  - Es la única vista que lee/escribe `localStorage`.

- `interacciones.html`:
  - Usa `data.js` y `interacciones.js`.
  - Solo lee el catálogo; no toca el estado de usuario.

- `retiro.html`:
  - Usa `data.js` y `retiro.js`.
  - Solo construye tarjetas a partir del catálogo.

Esto separa:

- **datos del usuario** (planes, registros, alertas),
- **catálogo farmacológico** (definido en `data.js`).

Lo segundo es lo que debes revisar con calma a nivel médico.
