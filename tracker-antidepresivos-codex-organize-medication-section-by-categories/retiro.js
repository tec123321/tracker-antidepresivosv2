import { medDatabase } from './data.js';
// Cargar preferencia de tema guardada
if (localStorage.getItem('theme') === 'light') {
  document.body.classList.add('light-mode');
}
// --------------------------

const taperGrid = document.getElementById('taperGrid');

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
  const grouped = groupByCategory();
  const categories = Object.keys(grouped).sort();

  if (!categories.length) {
    taperGrid.innerHTML = '<p class="muted">No hay información disponible.</p>';
    return;
  }

  categories.forEach((category) => {
    const card = document.createElement('div');
    card.className = 'med-card';
    card.innerHTML = `
      <div class="med-card__header">
        <div>
          <h3 style="margin:0;">${category}</h3>
          <p class="muted" style="margin:4px 0 0 0;">${grouped[category].length} referencia(s)</p>
        </div>
      </div>
    `;

    const list = document.createElement('ul');
    list.style.paddingLeft = '18px';
    grouped[category]
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((med) => {
        const li = document.createElement('li');
        li.className = 'muted';
        li.innerHTML = `<strong>${med.name}</strong>: ${med.taperNote}`;
        list.appendChild(li);
      });

    card.appendChild(list);
    taperGrid.appendChild(card);
  });
}

renderTaperCards();
