# Tracker de progreso de medicación

Aplicación web ligera (sin backend) para **registrar el progreso de tratamientos** de salud mental con:

- Seguimiento semanal estructurado.
- Recordatorios personalizables.
- Panel de alertas de posibles interacciones.
- Vistas auxiliares para interacciones y pautas de retirada gradual.

> Proyecto orientado a portafolio: muestra diseño de modelo de datos, manejo de `localStorage`, modularización en JavaScript y enfoque en UX para seguimiento a medio/largo plazo.

---

## Visión rápida

La app está pensada como una herramienta **offline en el navegador** para ayudar a preparar la información que una persona lleva a su cita con el profesional (no para decidir tratamientos por sí sola).

Concretamente permite:

- Crear planes de medicación con:
  - nombre, dosis, fecha de inicio,
  - duración estimada,
  - intervalo de recordatorio semanal.
- Registrar cada semana:
  - estado de ánimo,
  - efectos secundarios,
  - adherencia,
  - notas libres.
- Ver:
  - qué planes tienen registros pendientes,
  - un historial por semanas,
  - un pequeño panel de alertas de posibles interacciones.
- Consultar:
  - una vista global de interacciones (medicamentos + suplementos),
  - una vista agrupada de notas de retirada (por categoría).

---

## Uso rápido

1. Clona o descarga el repositorio.
2. Abre `index.html` en tu navegador (no requiere servidor).
3. (Opcional) Abre también:
   - `interacciones.html` para ver la vista de interacciones,
   - `retiro.html` para ver las notas de retirada agrupadas por categoría.
4. En la página principal:
   - Pulsa “Añadir medicación”.
   - Completa los campos básicos (nombre, dosis, fecha, intervalo).
   - Guarda el plan.
5. Usa la sección de **recordatorios** para registrar el progreso de cada semana:
   - estado de ánimo,
   - efectos,
   - adherencia,
   - notas.
6. Si un plan se te está recordando demasiado:
   - ajusta el intervalo, o
   - usa el botón de “aplazar” para pausarlo temporalmente.
7. Los datos se guardan en `localStorage` bajo la clave `med-tracker`, por lo que:
   - permanecen en tu navegador,
   - no se envían a ningún servidor.

> Detalles de modelo de datos y arquitectura: ver `docs/arquitectura-y-modelo-de-datos.md` y `decisiones-tecnicas.md`.

---

## Funcionalidades principales

- **Recordatorios semanales**
  - Cálculo automático de si estás al día (`ok`) o con registros atrasados (`due`).
  - Opción de **aplazar** (snooze) un recordatorio durante un tiempo definido.
  - Ajuste del intervalo de recordatorio por plan.

- **Línea de tiempo por semanas**
  - Visualización de semanas pasadas, actual y futuras.
  - Diferencia entre semanas con registro y sin registro.
  - Diseño pensado para tratamientos de varias semanas/meses.

- **Historial estructurado**
  - Registro semanal con:
    - estado de ánimo,
    - efectos secundarios,
    - notas libres,
    - adherencia.
  - Historial vinculado a cada plan de medicación.

- **Panel de alertas de interacciones**
  - Al dar de alta un nuevo plan:
    - se cruza con otros planes activos usando la base de datos `medDatabase` (`data.js`),
    - se generan alertas con nivel (`high`, `medium`, `low`) cuando hay coincidencias.
  - El panel muestra las últimas alertas almacenadas en `alertsLog` (limitado en longitud).

- **Catálogo por categorías**
  - Listado de medicamentos y suplementos agrupados por `category`.
  - Separación entre:
    - `classification === "medication"` (medicación),
    - otros valores (`supplement`, `substance`, etc.).

- **Vista de interacciones (`interacciones.html`)**
  - Construida a partir de `medDatabase` y sus `cautionList`.
  - Cada interacción muestra:
    - par implicado,
    - nivel,
    - mensaje asociado.
  - Bloque adicional resaltando suplementos y con qué fármacos interactúan.

- **Vista de retirada (`retiro.html`)**
  - Agrupa solo los elementos con:
    - `classification === 'medication'`,
    - `taperNote` definido.
  - Muestra tarjetas por categoría con las notas de retirada para cada fármaco.

---

## Tecnologías y decisiones

- **HTML5 + CSS + JavaScript vanilla**
  - Sin dependencias externas ni build.
  - Pensado para poder abrir el proyecto en entrevista sin entorno extra.

- **Persistencia en `localStorage`**
  - Clave: `med-tracker`.
  - Estructura raíz aproximada:

    ```js
    {
      meds: [...],
      alertsLog: [...]
    }
    ```

- **Módulos JS separados**
  - `script.js`: lógica principal (estado, recordatorios, alertas, renderizado).
  - `data.js`: catálogo de medicamentos/suplementos e interacciones.
  - `interacciones.js`: vista agregada de interacciones.
  - `retiro.js`: vista de notas de retirada por categoría.
  - `adherencia.js`: funciones de adherencia previstas (por implementar).

Más detalle técnico: `decisiones-tecnicas.md`.

---

## Estructura del proyecto

```text
.
├─ index.html                # Vista principal (registro + recordatorios + catálogo)
├─ interacciones.html        # Vista de interacciones
├─ retiro.html               # Vista de retirada gradual
├─ script.js                 # Lógica principal de la app
├─ interacciones.js          # Lógica de vista de interacciones
├─ retiro.js                 # Lógica de vista de retirada
├─ data.js                   # Catálogo de medicamentos/suplementos e interacciones
├─ adherencia.js             # Lugar para funciones de adherencia (pendiente)
├─ styles.css                # Estilos
├─ README.md                 # Este archivo
├─ decisiones-tecnicas.md    # Decisiones técnicas de diseño
└─ docs/
   ├─ arquitectura-y-modelo-de-datos.md
   ├─ plan-pruebas-manuales.md
   ├─ flujos-de-usuario.md
   ├─ limitaciones-y-aviso-medico.md
   └─ roadmap.md
```

---

## Limitaciones e importante aviso médico

- La app trabaja **solo con datos locales** en tu navegador.
- No está pensada para uso clínico real sin supervisión.
- El contenido de `data.js` (interacciones, notas de retirada) es **material de ejemplo** y debe revisarse con fuentes fiables.

> Ver `docs/limitaciones-y-aviso-medico.md` para el aviso completo.

---

## Roadmap (resumen)

Algunas líneas de trabajo planteadas (detalladas en `docs/roadmap.md`):

- Implementar lógica de adherencia en `adherencia.js`.
- Exportar datos a JSON/CSV para compartir con el profesional.
- Añadir tests automáticos para la lógica pura.
- Posible migración futura a un framework o backend con autenticación.

---

## Cómo usar este proyecto en una entrevista

Al presentar este repo, puedes destacar:

- Cómo modelaste los datos (`meds`, `logs`, `alertsLog`).
- Cómo separaste:
  - lógica de negocio,
  - renderizado,
  - catálogo farmacológico (`data.js`).
- Cómo pensaste en:
  - usabilidad (recordatorios semanales claros),
  - trazabilidad (historial por semanas),
  - riesgos (limitaciones y aviso médico).

El objetivo es mostrar que **no solo generas código con IA**, sino que entiendes el problema, diseñas el modelo y piensas en riesgos/limitaciones.
