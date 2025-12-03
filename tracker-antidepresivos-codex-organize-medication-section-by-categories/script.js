import { medDatabase } from './data.js';
// IMPORTAMOS LAS NUEVAS FUNCIONES DE ADHERENCIA
import { calcularSemanaDesdeInicio, calcularAdherencia, clasificarEstadoAdherencia } from './adherencia.js';

const storageKey = 'med-tracker';
const medForm = document.getElementById('medForm');
const medList = document.getElementById('medList');
const reminderList = document.getElementById('reminderList');
const statActive = document.getElementById('statActive');
const statDue = document.getElementById('statDue');
const statWeek = document.getElementById('statWeek');
const alertCard = document.getElementById('alertCard');
const medOptions = document.getElementById('medOptions');
const medCatalog = document.getElementById('medCatalog');
const suppCatalog = document.getElementById('suppCatalog');
const medSearchInput = document.getElementById('medSearch');
const medFilterStatus = document.getElementById('medFilterStatus');

const medFilters = {
  search: '',
  status: 'all',
};

function loadData() {
  const raw = localStorage.getItem(storageKey);
  const data = raw ? JSON.parse(raw) : { meds: [], alertsLog: [] };
  if (!data.alertsLog) data.alertsLog = [];
  return data;
}

function saveData(data) {
  localStorage.setItem(storageKey, JSON.stringify(data));
}

function uuid() {
  return crypto.randomUUID();
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[^a-z0-9\s_-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
}

function findMedEntry(input) {
  const normalized = slugify(input);
  return medDatabase.find((m) => m.id === normalized || slugify(m.name) === normalized);
}

function checkInteractions(newMedId, currentMedsList) {
  const alerts = [];
  const newMedData = medDatabase.find((m) => m.id === newMedId);

  if (!newMedData) return [];

  currentMedsList.forEach((currentMed) => {
    const conflictInNew = newMedData.cautionList?.find((c) => c.targetId === currentMed.catalogId);
    if (conflictInNew) {
      alerts.push({
        med1: newMedData.name,
        med2: currentMed.name,
        msg: conflictInNew.msg,
        level: conflictInNew.level,
        code: `${newMedData.id}-${currentMed.catalogId}`,
      });
    }

    const currentMedData = medDatabase.find((m) => m.id === currentMed.catalogId);
    const conflictInCurrent = currentMedData?.cautionList?.find((c) => c.targetId === newMedId);

    if (conflictInCurrent && !conflictInNew) {
      alerts.push({
        med1: currentMed.name,
        med2: newMedData.name,
        msg: conflictInCurrent.msg,
        level: conflictInCurrent.level,
        code: `${currentMed.catalogId}-${newMedData.id}`,
      });
    }
  });

  return alerts;
}

function weeksBetween(startDate, endDate = new Date()) {
  const ms = 1000 * 60 * 60 * 24 * 7;
  return Math.max(0, Math.floor((endDate - startDate) / ms));
}

// --- FUNCIÓN ACTUALIZADA CON LÓGICA DE ADHERENCIA ---
function renderStats(data) {
  const today = new Date();
  const active = data.meds.length;
  const due = data.meds.filter((med) => reminderStatus(med).status === 'due').length;
  
  // Usamos la nueva función importada
  const maxWeek = Math.max(0, ...data.meds.map((m) => calcularSemanaDesdeInicio(m.startDate, today)));

  // Cálculo promedio adherencia global
  let totalAdherence = 0;
  let medsWithLogs = 0;
  data.meds.forEach(med => {
      const weeks = calcularSemanaDesdeInicio(med.startDate, today);
      if (med.logs && med.logs.length > 0) {
          totalAdherence += calcularAdherencia(med.logs, weeks);
          medsWithLogs++;
      }
  });
  const globalAvg = medsWithLogs > 0 ? Math.round(totalAdherence / medsWithLogs) : 0;

  statActive.textContent = `${active} ${active === 1 ? 'plan activo' : 'planes activos'}`;
  statDue.textContent = `${due} ${due === 1 ? 'recordatorio pendiente' : 'recordatorios pendientes'}`;
  // Mostramos semana y adherencia
  statWeek.innerHTML = `Semana ${maxWeek} <span style="opacity:0.5">|</span> ${globalAvg}% Adherencia`;
}

function reminderStatus(med) {
  const today = new Date();
  const snoozedUntil = med.snoozedUntil ? new Date(med.snoozedUntil) : null;
  if (snoozedUntil && today < snoozedUntil) {
    return { status: 'snoozed', message: `En pausa hasta ${snoozedUntil.toLocaleDateString()}` };
  }

  const currentWeek = weeksBetween(new Date(med.startDate), today) + 1;
  const lastLog = [...(med.logs || [])].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const lastWeek = lastLog ? lastLog.weekNumber : 0;
  const missingWeeks = currentWeek - lastWeek;
  if (missingWeeks >= med.reminderEvery) {
    const message = lastWeek === 0 ? 'Aún no hay registros' : `Última entrada semana ${lastWeek}`;
    return { status: 'due', message, missingWeeks };
  }
  return { status: 'ok', message: `Al día (semana ${lastWeek})` };
}

function renderAlertPanel(data) {
  alertCard.innerHTML = '';
  const alerts = [...(data.alertsLog || [])].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (!alerts.length) {
    alertCard.classList.add('alert-card--empty');
    alertCard.innerHTML = '<p class="muted">Aún no hay alertas. Añade medicamentos o suplementos para ver recomendaciones.</p>';
    return;
  }

  alertCard.classList.remove('alert-card--empty');

  const header = document.createElement('div');
  header.className = 'alert-card__head';
  header.innerHTML = '<p class="pill-card__title">Posibles temas para conversar con tu médico</p>';
  alertCard.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'alert-list';
  alerts.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'alert-list__item';
    li.innerHTML = `
      <div>
        <strong>${item.med1}</strong> + <strong>${item.med2}</strong>
        <p class="muted" style="margin:2px 0 0 0;">${item.msg}</p>
        <p class="muted" style="margin:2px 0 0 0;font-size:12px;">Registrado: ${new Date(item.date).toLocaleDateString()}</p>
      </div>
      <span class="badge badge-${item.level}">${item.level}</span>
    `;
    list.appendChild(li);
  });
  alertCard.appendChild(list);

  const disclaimer = document.createElement('p');
  disclaimer.className = 'muted';
  disclaimer.style.marginTop = '12px';
  disclaimer.textContent = 'Herramienta informativa con interacciones simuladas. No sustituye el criterio clínico. Consulta cualquier cambio con tu médico.';
  alertCard.appendChild(disclaimer);
}

function renderReminders(data) {
  reminderList.innerHTML = '';
  if (!data.meds.length) {
    reminderList.innerHTML = '<p class="muted">Aún no tienes tratamientos configurados.</p>';
    return;
  }
  const medsToShow = filterMedsForView(data.meds);

  if (!medsToShow.length) {
    reminderList.innerHTML = '<p class="muted">No hay tratamientos que coincidan con los filtros actuales.</p>';
    return;
  }

  medsToShow.forEach((med) => {
    const status = reminderStatus(med);
    const card = document.createElement('div');
    card.className = 'reminder-card';
    const badgeClass = status.status === 'due' ? 'due' : status.status === 'snoozed' ? 'snoozed' : 'ok';
    card.innerHTML = `
      <div class="reminder-card__row">
        <div>
          <p class="pill-card__title">${med.name}</p>
          <p class="muted">${med.dose}</p>
        </div>
        <span class="badge ${badgeClass}">${status.status === 'due' ? 'Pendiente' : status.status === 'snoozed' ? 'Pausado' : 'Al día'}</span>
      </div>
      <p class="muted">${status.message}</p>
      <div class="inline-input">
        <label class="muted" style="font-weight:700;">Intervalo</label>
        <input type="number" min="1" max="6" value="${med.reminderEvery}" data-interval="${med.id}" />
        <button class="ghost" data-snooze="${med.id}">Aplazar 1 semana</button>
      </div>
      <div class="card-actions">
        <button class="primary" data-log="${med.id}">Registrar semana</button>
        <button class="ghost" data-remove="${med.id}">Eliminar</button>
      </div>
    `;
    reminderList.appendChild(card);
  });
}

function renderTimeline(med) {
  const container = document.createElement('div');
  container.className = 'timeline';
  const total = Math.max(med.durationWeeks, med.logs.length + 2);
  const today = new Date();
  const currentWeek = weeksBetween(new Date(med.startDate), today) + 1;
  for (let week = 1; week <= total; week++) {
    const log = med.logs.find((l) => l.weekNumber === week);
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.textContent = week;
    if (log) {
      dot.classList.add('done');
      dot.title = `Semana ${week}: estado ${log.mood}/5`;
    } else if (week <= currentWeek) {
      dot.classList.add('pending');
      dot.title = `Semana ${week}: sin registro`;
    } else {
      dot.classList.add('future');
      dot.title = `Semana ${week}: programada`;
    }
    if (week === currentWeek) {
      dot.classList.add('current');
    }
    container.appendChild(dot);
  }
  return container;
}

function filterMedsForView(meds) {
  return meds.filter((med) => {
    const statusInfo = reminderStatus(med);

    if (medFilters.status === 'due' || medFilters.status === 'snoozed' || medFilters.status === 'ok') {
      if (statusInfo.status !== medFilters.status) return false;
    } else if (medFilters.status === 'noLogs') {
      if ((med.logs || []).length > 0) return false;
    }

    if (medFilters.search) {
      const haystack = `${med.name} ${med.dose || ''} ${med.notes || ''}`.toLowerCase();
      if (!haystack.includes(medFilters.search)) return false;
    }

    return true;
  });
}

// --- RENDERMEDS ACTUALIZADO CON BADGE DE ADHERENCIA ---
function renderMeds(data) {
  medList.innerHTML = '';
  if (!data.meds.length) {
    medList.innerHTML = '<p class="muted">Añade tu primer tratamiento para comenzar.</p>';
    return;
  }
  data.meds.forEach((med) => {
    const card = document.createElement('div');
    card.className = 'med-card';
    const status = reminderStatus(med);
    const badgeClass = status.status === 'due' ? 'due' : status.status === 'snoozed' ? 'snoozed' : 'ok';
    
    // Cálculo adherencia individual
    const weeksRunning = calcularSemanaDesdeInicio(med.startDate);
    const adherencePct = calcularAdherencia(med.logs, weeksRunning);
    const adInfo = clasificarEstadoAdherencia(adherencePct);

    card.innerHTML = `
      <div class="med-card__header">
        <div>
          <h3 style="margin:0;">${med.name}</h3>
          <p class="muted" style="margin:4px 0;">${med.dose}</p>
          <p class="muted" style="font-size:12px; margin-top:4px;">
             Inicio: ${new Date(med.startDate).toLocaleDateString()} · 
             Adherencia: <strong style="color:var(--accent)">${adherencePct}%</strong> (${adInfo.label})
          </p>
        </div>
        <span class="badge ${badgeClass}">${status.status === 'due' ? 'Pendiente' : status.status === 'snoozed' ? 'Pausado' : 'Al día'}</span>
      </div>
      <p class="muted" style="margin:0;">${status.message}</p>
    `;
    const timeline = renderTimeline(med);
    card.appendChild(timeline);

    const actions = document.createElement('div');
    actions.className = 'card-actions';
    const logBtn = document.createElement('button');
    logBtn.className = 'primary';
    logBtn.textContent = 'Añadir registro semanal';
    logBtn.addEventListener('click', () => openProgressForm(med.id, data));
    const removeBtn = document.createElement('button');
    removeBtn.className = 'ghost';
    removeBtn.textContent = 'Eliminar plan';
    removeBtn.addEventListener('click', () => removeMed(med.id));
    actions.append(logBtn, removeBtn);
    card.appendChild(actions);

    if (med.notes) {
      const notes = document.createElement('p');
      notes.className = 'muted';
      notes.textContent = `Notas: ${med.notes}`;
      card.appendChild(notes);
    }

    const history = document.createElement('div');
    history.innerHTML = '<p class="pill-card__title" style="margin:8px 0;">Historial</p>';
    if (med.logs.length === 0) {
      history.innerHTML += '<p class="muted">Sin registros aún.</p>';
    } else {
      const list = document.createElement('ul');
      list.style.paddingLeft = '18px';
      med.logs
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach((log) => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>Semana ${log.weekNumber}</strong>: ánimo ${log.mood}/5 · ${log.adherence ? 'Adherencia completa' : 'Saltos'}${log.effects ? ' · Efectos: ' + log.effects : ''}${log.notes ? ' · ' + log.notes : ''}`;
          li.className = 'muted';
          list.appendChild(li);
        });
      history.appendChild(list);
    }
    card.appendChild(history);

    medList.appendChild(card);
  });
}

function openProgressForm(medId, data) {
  const med = data.meds.find((m) => m.id === medId);
  if (!med) return;
  const template = document.getElementById('progressFormTemplate');
  const form = template.content.firstElementChild.cloneNode(true);
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.inset = '0';
  dialog.style.background = 'rgba(0,0,0,0.65)';
  dialog.style.display = 'grid';
  dialog.style.placeItems = 'center';
  dialog.style.padding = '16px';
  dialog.appendChild(form);
  document.body.appendChild(dialog);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mood = Number(form.querySelector('[name="mood"]').value);
    const effects = form.querySelector('[name="effects"]').value.trim();
    const notes = form.querySelector('[name="notes"]').value.trim();
    const adherence = form.querySelector('[name="adherence"]').checked;
    const snooze = Number(form.querySelector('[name="snooze"]').value || 0);
    const today = new Date();
    const weekNumber = weeksBetween(new Date(med.startDate), today) + 1;
    med.logs.push({
      id: uuid(),
      weekNumber,
      mood,
      effects,
      notes,
      adherence,
      date: today.toISOString(),
    });
    if (snooze > 0) {
      const snoozeDate = new Date();
      snoozeDate.setDate(snoozeDate.getDate() + snooze * 7);
      med.snoozedUntil = snoozeDate.toISOString();
    } else {
      med.snoozedUntil = null;
    }
    saveAndRender(data);
    dialog.remove();
  });

  form.querySelector('[data-close]').addEventListener('click', () => dialog.remove());
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.remove();
  });
}

function showInteractionModal(alerts, onConfirm) {
  const dialog = document.createElement('div');
  dialog.style.position = 'fixed';
  dialog.style.inset = '0';
  dialog.style.background = 'rgba(0,0,0,0.65)';
  dialog.style.display = 'grid';
  dialog.style.placeItems = 'center';
  dialog.style.padding = '16px';

  const card = document.createElement('div');
  card.className = 'alert-modal';
  card.innerHTML = `
    <p class="eyebrow">Posibles interacciones</p>
    <h3 style="margin:4px 0 8px;">Notas para tu próxima cita</h3>
    <p class="muted">Se detectaron combinaciones simuladas (catálogo de ejemplo) que conviene conversar con tu médico antes de confirmar.</p>
  `;

  const list = document.createElement('ul');
  list.className = 'alert-list';
  alerts.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'alert-list__item';
    li.innerHTML = `
      <div>
        <strong>${item.med1}</strong> + <strong>${item.med2}</strong>
        <p class="muted" style="margin:2px 0 0 0;">${item.msg}</p>
      </div>
      <span class="badge badge-${item.level}">${item.level}</span>
    `;
    list.appendChild(li);
  });
  card.appendChild(list);

  const disclaimer = document.createElement('p');
  disclaimer.className = 'muted';
  disclaimer.style.margin = '12px 0 16px';
  disclaimer.textContent = 'Herramienta informativa con interacciones simuladas. No modifica ni sustituye las indicaciones médicas.';
  card.appendChild(disclaimer);

  const actions = document.createElement('div');
  actions.className = 'form-actions';
  const cancel = document.createElement('button');
  cancel.className = 'ghost';
  cancel.textContent = 'Revisar de nuevo';
  cancel.addEventListener('click', () => dialog.remove());
  const confirm = document.createElement('button');
  confirm.className = 'primary';
  confirm.textContent = 'Guardar plan igualmente';
  confirm.addEventListener('click', () => {
    onConfirm();
    dialog.remove();
  });
  actions.append(confirm, cancel);
  card.appendChild(actions);

  dialog.appendChild(card);
  document.body.appendChild(dialog);
}

function recordAlerts(data, alerts) {
  const existing = new Set(data.alertsLog.map((a) => a.code));
  alerts.forEach((a) => {
    if (existing.has(a.code)) return;
    data.alertsLog.push({ ...a, id: uuid(), date: new Date().toISOString() });
  });
  if (data.alertsLog.length > 30) {
    data.alertsLog = data.alertsLog.slice(-30);
  }
}

function removeMed(id) {
  // Pega tu línea aquí:
  if (!confirm("¿Estás seguro de que quieres eliminar este tratamiento y todo su historial? Esta acción no se puede deshacer.")) return;

  const data = loadData();
  data.meds = data.meds.filter((m) => m.id !== id);
  saveAndRender(data);
}

function updateInterval(id, value) {
  const data = loadData();
  const med = data.meds.find((m) => m.id === id);
  if (!med) return;
  med.reminderEvery = Math.max(1, Math.min(6, Number(value)));
  saveAndRender(data);
}

function snoozeReminder(id, weeks = 1) {
  const data = loadData();
  const med = data.meds.find((m) => m.id === id);
  if (!med) return;
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  med.snoozedUntil = date.toISOString();
  saveAndRender(data);
}

function saveAndRender(data) {
  saveData(data);
  renderStats(data);
  renderReminders(data);
  renderMeds(data);
  renderAlertPanel(data);
}

function populateMedOptions() {
  medOptions.innerHTML = '';
  medDatabase
    .filter((med) => med.classification === 'medication')
    .forEach((med) => {
      const option = document.createElement('option');
      option.value = med.name;
      option.label = `${med.name} · ${med.type}`;
      medOptions.appendChild(option);
    });
}

function renderCatalog() {
  if (!medCatalog || !suppCatalog) return;

  const groupByCategory = (items) =>
    items.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item.name);
      return acc;
    }, {});

  const renderTarget = (element, items) => {
    element.innerHTML = '';
    const grouped = groupByCategory(items);
    Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([category, names]) => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `<strong>${category}</strong><br/><span class="muted" style="font-size:12px;">${names.join(', ')}</span>`;
        element.appendChild(chip);
      });
  };

  renderTarget(
    medCatalog,
    medDatabase.filter((item) => item.classification === 'medication')
  );
  renderTarget(
    suppCatalog,
    medDatabase.filter((item) => item.classification !== 'medication')
  );
}

medForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = loadData();
  const formData = new FormData(medForm);
  const name = formData.get('name').trim();
  const catalogEntry = findMedEntry(name);
  const catalogId = catalogEntry?.id || slugify(name);

  const currentMeds = data.meds.map((m) => ({ catalogId: m.catalogId || slugify(m.name), name: m.name }));
  const alerts = checkInteractions(catalogId, currentMeds);

  const persistMed = () => {
    const med = {
      id: uuid(),
      catalogId,
      name,
      dose: formData.get('dose').trim(),
      startDate: formData.get('start'),
      durationWeeks: Number(formData.get('duration')),
      reminderEvery: Number(formData.get('interval')),
      notes: formData.get('notes').trim(),
      logs: [],
      snoozedUntil: null,
    };
    data.meds.push(med);
    if (alerts.length) {
      recordAlerts(data, alerts);
    }
    saveAndRender(data);
    medForm.reset();
  };

  if (alerts.length) {
    showInteractionModal(alerts, persistMed);
  } else {
    persistMed();
  }
});

reminderList.addEventListener('click', (e) => {
  const logId = e.target.getAttribute('data-log');
  const removeId = e.target.getAttribute('data-remove');
  const snoozeId = e.target.getAttribute('data-snooze');
  if (logId) {
    const data = loadData();
    openProgressForm(logId, data);
  }
  if (removeId) removeMed(removeId);
  if (snoozeId) snoozeReminder(snoozeId, 1);
});

reminderList.addEventListener('change', (e) => {
  const intervalId = e.target.getAttribute('data-interval');
  if (intervalId) updateInterval(intervalId, e.target.value);
});

const scrollToFormBtn = document.getElementById('scrollToForm');
const scrollToRemindersBtn = document.getElementById('scrollToReminders');
scrollToFormBtn.addEventListener('click', () => {
  document.getElementById('add').scrollIntoView({ behavior: 'smooth' });
});
scrollToRemindersBtn.addEventListener('click', () => {
  document.getElementById('reminders').scrollIntoView({ behavior: 'smooth' });
});

if (medSearchInput) {
  medSearchInput.addEventListener('input', (e) => {
    medFilters.search = e.target.value.toLowerCase();
    const data = loadData();
    saveAndRender(data);
  });
}

if (medFilterStatus) {
  medFilterStatus.addEventListener('change', (e) => {
    medFilters.status = e.target.value;
    const data = loadData();
    saveAndRender(data);
  });
}

// Marcar cuando la app está lista
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    document.documentElement.classList.add('app-ready');
  });
} else {
  document.documentElement.classList.add('app-ready');
}

// --- FUNCIÓN DE EXPORTACIÓN AÑADIDA ---
window.exportarDatos = function() {
  const data = localStorage.getItem(storageKey);
  if (!data) {
    alert("No hay datos para exportar.");
    return;
  }
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `neurotrack-backup-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

(function init() {
  const data = loadData();
  populateMedOptions();
  renderCatalog();
  saveAndRender(data);

const toggleBtn = document.getElementById('themeToggle');
  toggleBtn.addEventListener('click', () => {
    // CORRECCIÓN: Usar 'light-mode' que es lo que definiste en CSS
    document.body.classList.toggle('light-mode'); 
    
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // Cargar preferencia al inicio
  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
  }
})();
