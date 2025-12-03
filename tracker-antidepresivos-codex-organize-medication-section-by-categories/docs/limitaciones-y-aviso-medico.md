# Limitaciones y aviso médico

Este proyecto es **una herramienta de registro personal y aprendizaje**, no un producto sanitario ni una recomendación clínica.

---

## 1. Naturaleza del proyecto

- El código está orientado a:
  - practicar JavaScript, modelo de datos y diseño de interfaz,
  - construir un ejemplo de portafolio,
  - explorar cómo se podría estructurar información sobre tratamientos.
- No ha pasado por:
  - validación clínica formal,
  - revisión regulatoria,
  - procesos de certificación como dispositivo médico.

---

## 2. Sobre los datos de `data.js`

- El archivo `data.js` contiene:
  - nombres de fármacos/suplementos,
  - posibles interacciones (`cautionList`),
  - notas de retirada (`taperNote`).
- Esta información debe entenderse como:
  - **ejemplo educativo** para mostrar cómo se relacionan los datos,
  - **punto de partida** para futuros ajustes.

> Tarea pendiente para uso serio: revisar cada entrada con guías oficiales, artículos científicos y/o profesionales de la salud, y documentar las fuentes en un archivo aparte.

---

## 3. Riesgos y limitaciones

1. **No sustituye a un profesional**
   - Las decisiones sobre:
     - cuándo iniciar un fármaco,
     - cómo ajustar dosis,
     - cómo retirar un tratamiento,
   - deben tomarse SIEMPRE con un profesional de salud.

2. **Posibles errores en interacciones**
   - Las interacciones definidas pueden estar:
     - incompletas,
     - desactualizadas,
     - simplificadas.
   - Pueden existir combinaciones importantes que no están recogidas.

3. **Persistencia local sin cifrado**
   - Los datos se guardan en `localStorage` sin encriptar.
   - Cualquier persona con acceso al dispositivo y al navegador puede verlos.
   - No debe usarse para almacenar información extremadamente sensible en ordenadores compartidos.

4. **Sin copia en servidor**
   - No hay sincronización entre dispositivos.
   - Borrar el almacenamiento del navegador elimina toda la información.

---

## 4. Uso responsable (mensaje para el usuario final)

Texto sugerido para mostrar en la interfaz (por ejemplo, en un modal o en el README visible para usuarios):

> Esta herramienta tiene fines informativos y de registro personal.  
> No ofrece diagnóstico, tratamiento ni recomendaciones médicas.  
> No modifiques ningún tratamiento sin consultar a un profesional de la salud.

Puedes adaptar el toque final del mensaje a tu estilo y al contexto en el que presentes el proyecto.

---

## 5. Trabajo pendiente para reforzar seriedad

Si en el futuro quieres acercar este proyecto a algo más “serio”, lo mínimo sería:

- Añadir una capa de:
  - **citas** o referencias por cada interacción relevante.
  - Por ejemplo, un campo `source` en `cautionList` (`guideline`, `paper`, etc.).
- Documentar en un archivo aparte:
  - qué guías o artículos se usaron,
  - fecha de consulta,
  - notas sobre el contexto.
- Separar explícitamente:
  - datos revisados,
  - datos que siguen siendo ejemplos o placeholders.

Todo esto es precisamente el tipo de trabajo que no puede hacerse de forma automática y que añade valor humano a tu proyecto.
