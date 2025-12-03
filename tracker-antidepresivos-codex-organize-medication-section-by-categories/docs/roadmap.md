# Roadmap

Lista de posibles mejoras y líneas de trabajo futuras para el Tracker de progreso de medicación.

---

## 1. Corto plazo

### 1.1 Completar lógica de adherencia

- Implementar en `adherencia.js`:

  - `calcularSemanaDesdeInicio(fechaInicioISO, ahora)`
  - `calcularAdherencia(registros, diasEsperados)`
  - `clasificarEstadoAdherencia(porcentaje)`

- Integrar estas funciones en `script.js` para:
  - mostrar un indicador de adherencia por plan,
  - usarlo en las estadísticas.

> Trabajo para ti: decidir criterios y umbrales (porcentajes y mensajes).

---

### 1.2 Mejorar UX de recordatorios

- Añadir microcopys más claros en tarjetas de recordatorio.
- Diferenciar visualmente:
  - plan al día,
  - plan atrasado,
  - plan en pausa (snoozed).
- Añadir filtros:
  - mostrar solo “pendientes”,
  - mostrar todos.

---

### 1.3 Datos de ejemplo

- Crear un pequeño conjunto de datos de ejemplo (2–3 planes):
  - pensado para demo/entrevista.
- Opciones:
  - script que precargue datos si `localStorage` está vacío y se pasa un parámetro en la URL,
  - botón “cargar datos de ejemplo” que cree planes ficticios.

---

## 2. Medio plazo

### 2.1 Exportación de datos

- Exportar a:
  - JSON (para inspección técnica),
  - CSV (para usar en hojas de cálculo),
  - texto plano (para copiar/pegar en un correo).
- Añadir un pequeño resumen tipo:

  > “Últimas 4 semanas: estado de ánimo medio, adherencia, efectos más frecuentes…”

---

### 2.2 Tests automáticos

- Extraer lógica pura (sin DOM) de:
  - cálculo de semanas,
  - lógica de recordatorios,
  - deduplicación de alertas,
  - construcción de interacciones.
- Añadir tests (por ejemplo, con Jest) para esa parte.
- Documentar en el README cómo correrlos.

---

### 2.3 Refinar `data.js`

- Revisar las entradas actuales con fuentes fiables.
- Añadir campos opcionales:
  - `source`: referencia muy corta (“Guía X, 2023”, “Artículo Y”).
  - `notesForDoctor`: mensajes destinados a la conversación clínica y no al usuario.

---

## 3. Largo plazo

### 3.1 Backend y autenticación

- Diseño de una API sencilla:
  - endpoints para planes, registros, alertas.
- Autenticación básica (por ejemplo, email + contraseña o login social).
- Guardar los datos en un servidor:
  - sincronización entre dispositivos,
  - backup.

### 3.2 Dashboard avanzado

- Gráficas de evolución:
  - estado de ánimo,
  - adherencia,
  - frecuencia de efectos.
- Filtros por rango de fechas y por tratamiento.

### 3.3 Internacionalización

- Soporte multi-idioma:
  - español / inglés.
- Separar textos en un archivo de traducciones.

---

## 4. Cómo usar el roadmap en entrevistas

Puedes usar este archivo para mostrar que:

- No solo construiste una demo rápida,
- sino que piensas en:
  - escalabilidad,
  - calidad (tests),
  - riesgos (datos sensibles),
  - UX a largo plazo,
  - y posibles evoluciones técnicas (backend, gráficas, i18n).
