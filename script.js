const categories = ['Pékáru', 'Zöldség-gyümölcs', 'Tejtermék', 'Készétel', 'Egyéb'];
const icons = { 'Pékáru': '🥖', 'Zöldség-gyümölcs': '🥕', 'Tejtermék': '🧀', 'Készétel': '🍲', 'Egyéb': '🍱' };

function loadData(key, fallback) {
  const text = localStorage.getItem(key);
  return text ? JSON.parse(text) : fallback;
}

function saveData(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    alert('Nem sikerült menteni. Próbálj meg kisebb méretű képet feltölteni.');
  }
}

function daysFromNow(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return date.toISOString().slice(0, 10);
}

const demoFoods = [
  { id: 1, name: 'Friss kifli', desc: 'A mai napról megmaradt, még puha kifli.', category: 'Pékáru', quantity: '20 db',
    city: 'Debrecen', address: 'Piac utca 5.', deadline: daysFromNow(1), donor: 'Aranykalász Pékség',
    contact: 'pekseg@example.hu', price: 0, image: '', status: 'approved', reservedBy: '', owner: 'demo' },
  { id: 2, name: 'Vegyes zöldség', desc: 'Répa, krumpli és paprika, kisebb formahibákkal.', category: 'Zöldség-gyümölcs', quantity: '5 kg',
    city: 'Debrecen', address: 'Csapó utca 12.', deadline: daysFromNow(3), donor: 'Zöld Kosár Bolt',
    contact: '+36 30 111 2222', price: 0, image: '', status: 'approved', reservedBy: '', owner: 'demo' },
  { id: 3, name: 'Joghurt (3 nap a lejáratig)', desc: 'Natúr joghurt, bontatlan, hűtve tárolva.', category: 'Tejtermék', quantity: '12 doboz',
    city: 'Budapest', address: 'Fő utca 8.', deadline: daysFromNow(2), donor: 'Tej-Mix Kisbolt',
    contact: 'tejmix@example.hu', price: 100, image: '', status: 'approved', reservedBy: '', owner: 'demo' },
  { id: 4, name: 'Gulyásleves', desc: 'Az ebédről megmaradt, házi gulyásleves dobozolva.', category: 'Készétel', quantity: '8 adag',
    city: 'Szeged', address: 'Kossuth tér 3.', deadline: daysFromNow(1), donor: 'Vörös Csárda',
    contact: 'csarda@example.hu', price: 300, image: '', status: 'approved', reservedBy: '', owner: 'demo' }
];

let users = loadData('fs_users', [
  { name: 'Adminisztrátor', email: 'admin@foodshare.hu', password: 'admin123', role: 'admin' }
]);
let foods = loadData('fs_foods', demoFoods);
let currentEmail = localStorage.getItem('fs_current') || ''; 
let currentPage = 'home';

function $(id) {
  return document.getElementById(id);
}

function esc(text) {
  const box = document.createElement('div');
  box.textContent = text;
  return box.innerHTML;
}

function getCurrentUser() {
  return users.find(user => user.email === currentEmail);
}

function availableFoods() {
  const today = daysFromNow(0);
  return foods.filter(food => food.status === 'approved' && food.reservedBy === '' && food.deadline >= today);
}

function foodCard(food, buttonsHtml) {
  const picture = food.image
    ? `<img src="${food.image}" alt="${esc(food.name)}">`
    : `<div class="emoji">${icons[food.category] || '🍱'}</div>`;

  const priceTag = food.price > 0
    ? `<span class="tag price">${food.price} Ft</span>`
    : '<span class="tag">Ingyenes</span>';

  return `
    <div class="card">
      ${picture}
      <div class="body">
        <h3>${esc(food.name)}</h3>
        <p>${priceTag} <span class="tag">${esc(food.category)}</span></p>
        <p>${esc(food.desc)}</p>
        <p><b>Mennyiség:</b> ${esc(food.quantity)}</p>
        <p><b>Átvétel:</b> ${esc(food.city)}, ${esc(food.address)}</p>
        <p><b>Határidő:</b> ${food.deadline}</p>
        <p><b>Felajánló:</b> ${esc(food.donor)}</p>
        <div style="margin-top: 1rem;">${buttonsHtml}</div>
      </div>
    </div>`;
}

function showList(elementId, cardsHtml, emptyText) {
  $(elementId).innerHTML = cardsHtml || `<p class="empty">${emptyText}</p>`;
}

function reserveButton(food) {
  return `<button type="button" class="btn small" data-action="reserve" data-id="${food.id}">Lefoglalom</button>`;
}

function updateMenu() {
  const user = getCurrentUser();
  $('accountLink').textContent = user ? '👤 ' + user.name : 'Belépés';
  $('adminLink').hidden = !(user && user.role === 'admin');
}

