import { medDatabase } from './data.js';
// Cargar preferencia de tema guardada
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
}
// --------------------------

const interactionList = document.getElementById('interactionList');
const supplementHighlight = document.getElementById('supplementHighlight');

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
        level: caution.level,
        msg: caution.msg,
        from: source,
        to: target,
      });
    });
  });
  return all.sort((a, b) => {
    if (severityOrder[a.level] !== severityOrder[b.level]) {
      return severityOrder[a.level] - severityOrder[b.level];
    }
    return a.from.name.localeCompare(b.from.name);
  });
}

function renderInteractions() {
  const entries = buildInteractions();
  interactionList.innerHTML = '';
  if (!entries.length) {
    interactionList.innerHTML = '<p class="muted">No hay datos para mostrar.</p>';
    return;
  }
  entries.forEach((item) => {
    const li = document.createElement('div');
    li.className = 'alert-list__item';
    li.innerHTML = `
      <div>
        <strong>${item.from.name}</strong> + <strong>${item.to.name}</strong>
        <p class="muted" style="margin:2px 0 0 0;">${item.msg}</p>
        <p class="muted" style="margin:4px 0 0 0; font-size:12px;">Categorías: ${item.from.category} · ${item.to.category}</p>
      </div>
      <span class="badge badge-${item.level}">${item.level}</span>
    `;
    interactionList.appendChild(li);
  });
}

function renderSupplements() {
  const nonMeds = medDatabase.filter((item) => item.classification !== 'medication');
  const interactions = buildInteractions();
  supplementHighlight.innerHTML = '';

  nonMeds.forEach((entry) => {
    const withEntry = interactions.filter(
      (i) => i.from.id === entry.id || i.to.id === entry.id
    );
    const chip = document.createElement('div');
    chip.className = 'chip';
    if (!withEntry.length) {
      chip.innerHTML = `<strong>${entry.name}</strong><br/><span class="muted" style="font-size:12px;">Sin registros relevantes</span>`;
    } else {
      const partners = withEntry
        .map((i) => (i.from.id === entry.id ? i.to.name : i.from.name))
        .join(', ');
      chip.innerHTML = `<strong>${entry.name}</strong><br/><span class="muted" style="font-size:12px;">Interacción con: ${partners}</span>`;
    }
    supplementHighlight.appendChild(chip);
  });
}

renderInteractions();
renderSupplements();
