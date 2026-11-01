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

function renderHome() {
  const reservedCount = foods.filter(food => food.reservedBy !== '').length;
  $('statSaved').textContent = 250 + reservedCount;
  $('statUsers').textContent = 120 + users.length;

  const featured = availableFoods().sort((a, b) => a.deadline.localeCompare(b.deadline)).slice(0, 3);
  showList('featured', featured.map(food => foodCard(food, reserveButton(food))).join(''), 'Jelenleg nincs átvehető étel.');
}

function renderBrowse() {
  let list = availableFoods();

  const searchText = $('search').value.toLowerCase();
  if (searchText) {
    list = list.filter(food => (food.name + ' ' + food.desc).toLowerCase().includes(searchText));
  }

  const category = $('filterCategory').value;
  if (category) {
    list = list.filter(food => food.category === category);
  }

  const place = $('filterCity').value.toLowerCase();
  if (place) {
    list = list.filter(food => (food.city + ' ' + food.address).toLowerCase().includes(place));
  }

  if ($('sortBy').value === 'deadline') {
    list.sort((a, b) => a.deadline.localeCompare(b.deadline));
  } else {
    list.sort((a, b) => b.id - a.id);
  }

  showList('foodList', list.map(food => foodCard(food, reserveButton(food))).join(''), 'Nincs a keresésnek megfelelő találat.');
}

function renderAccount() {
  const user = getCurrentUser();
  $('authBox').hidden = !!user;
  $('profileBox').hidden = !user;
  if (!user) return;

  const myOffers = foods.filter(food => food.owner === user.email);
  const myReservations = foods.filter(food => food.reservedBy === user.email);

  $('profileInfo').innerHTML = `
    <p><b>Név:</b> ${esc(user.name)}</p>
    <p><b>E-mail:</b> ${esc(user.email)}</p>
    <p><b>Fiók típusa:</b> ${user.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}</p>
    <p><b>Felajánlások:</b> ${myOffers.length} db · <b>Foglalások:</b> ${myReservations.length} db</p>
    <button type="button" class="btn red small" style="margin-top:1rem;" data-action="logout">Kijelentkezés</button>
  `;

  const offersHtml = myOffers.map(food => {
    let state = '<span class="tag">Elérhető</span>';
    if (food.status === 'pending') state = '<span class="tag wait">Jóváhagyásra vár</span>';
    if (food.reservedBy !== '') state = '<span class="tag price">Lefoglalták</span>';
    const deleteBtn = `<button type="button" class="btn small red" data-action="delete" data-id="${food.id}">Törlés</button>`;
    return foodCard(food, state + ' ' + deleteBtn);
  }).join('');
  showList('myOffers', offersHtml, 'Még nem töltöttél fel ételt.');

  const reservationsHtml = myReservations.map(food => {
    const contactInfo = `<p style="color:var(--primary); font-weight:bold;">Átvételhez kapcsolattartó: ${esc(food.contact)}</p>`;
    const cancelBtn = `<button type="button" class="btn small red" data-action="cancel" data-id="${food.id}">Foglalás lemondása</button>`;
    return foodCard(food, contactInfo + cancelBtn);
  }).join('');
  showList('myReservations', reservationsHtml, 'Még nem foglaltál le semmit.');
}

function renderAdmin() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') {
    $('adminList').innerHTML = '<p class="empty">Ez az oldal csak adminisztrátorok számára érhető el.</p>';
    return;
  }

  const sorted = [...foods].sort((a, b) => (a.status === 'pending' ? -1 : 1));
  const html = sorted.map(food => {
    let buttons = '';
    if (food.status === 'pending') {
      buttons += `<button type="button" class="btn small" data-action="approve" data-id="${food.id}">Jóváhagyom</button> `;
    } else {
      buttons += '<span class="tag">Jóváhagyva</span> ';
    }
    buttons += `<button type="button" class="btn small red" data-action="delete" data-id="${food.id}">Törlés</button>`;
    return foodCard(food, buttons);
  }).join('');
  showList('adminList', html, 'Nincs megjeleníthető felajánlás.');
}

function renderPage(pageId) {
  if (pageId === 'home') renderHome();
  if (pageId === 'browse') renderBrowse();
  if (pageId === 'account') renderAccount();
  if (pageId === 'admin') renderAdmin();
}

function showPage(pageId) {
  currentPage = pageId;
  document.querySelectorAll('.page').forEach(page => page.hidden = true);
  $(pageId).hidden = false;
  $('menu').classList.remove('open');
  updateMenu();
  renderPage(pageId);
  window.scrollTo(0, 0);
}

