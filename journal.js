/* -------------------  Shortcuts & State  ------------------- */
const $ = id => document.getElementById(id);

let currentEditIndex = null;
let entries = JSON.parse(localStorage.getItem('djEntries') || '[]');
const user = JSON.parse(localStorage.getItem('djUser') || 'null');
if (!user) location = 'index.html';

/* -------------------  Initialisation  ------------------- */
window.onload = () => {
  initWallpaperAndTheme();
  initUserInfo();
  initPanels();
  renderEntries();
  updateStats();

  // live word/char counter
  $('entry').addEventListener('input', updateCount);

  // quick‑tag buttons
  document.querySelectorAll('.tags button').forEach(btn =>
    btn.onclick = () => $('entry').value += ` #${btn.dataset.tag}`
  );
};

/* -----------  Wallpaper & Theme (Settings Panel) ---------- */
function initWallpaperAndTheme() {
  // Thumbnails for 20 wallpapers
  for (let i = 1; i <= 20; i++) {
    const thumb = document.createElement('img');
    thumb.src = `wallpapers/w${i}.jpg`;
    thumb.onclick = () => setWallpaper(thumb.src);
    $('wallList').append(thumb);
  }

  // Load saved wallpaper & theme
  setWallpaper(localStorage.getItem('djWall') || 'wallpapers/w1.jpg', false);
  const dark = localStorage.getItem('djTheme') === 'dark';
  applyTheme(dark);
  $('themeToggle').checked = dark;
  $('themeToggle').onchange = e => applyTheme(e.target.checked);
}

function setWallpaper(src, save = true) {
  $('wallpaper').style.backgroundImage = `url('${src}')`;
  if (save) localStorage.setItem('djWall', src);
}

function applyTheme(isDark) {
  document.body.classList.toggle('dark', isDark);
  localStorage.setItem('djTheme', isDark ? 'dark' : 'light');
}

/* -------------------  User Info  ------------------- */
function initUserInfo() {
  $('uName').textContent = user.username;
  $('uEmail').textContent = user.email;
  $('uPhone').textContent = user.phone;
}

/* -------------------  Panels & Mask  ------------------- */
function initPanels() {
  const panels = ['bookPanel', 'settingsPanel', 'userPanel'];
  const buttons = ['bookBtn', 'settingsBtn', 'userBtn'];

  buttons.forEach((btnId, i) => {
    $(btnId).onclick = () => togglePanel(panels[i]);
  });

  // Mask closes any open panel
  $('mask').onclick = () => closePanels();
}

function togglePanel(panelId) {
  const panel = $(panelId);
  const open = !panel.classList.contains('open');
  closePanels();
  if (open) {
    panel.classList.add('open');
    $('mask').classList.add('show');
  }
}

function closePanels() {
  document.querySelectorAll('.sidepanel').forEach(p => p.classList.remove('open'));
  $('mask').classList.remove('show');
}

/* -------------------  Live Word/Char Counter  ------------------- */
function updateCount() {
  const t = $('entry').value;
  const words = (t.match(/\b\w+\b/g) || []).length;
  $('liveCount').textContent = `${words} words • ${t.length} chars`;
}

/* -------------------  CRUD: Save / Edit / Delete  ------------------- */
function saveEntry() {
  const text = $('entry').value.trim();
  if (!text) return alert('Write something!');

  const date = new Date().toISOString().slice(0, 10);
  const obj = {
    date,
    text,
    tags: (text.match(/#\w+/g) || [])
  };

  if (currentEditIndex !== null) {
    entries[currentEditIndex] = obj;
    currentEditIndex = null;
  } else {
    entries.unshift(obj);
  }

  persist();
  $('entry').value = '';
  updateCount();
  renderEntries();
  updateStats();
}

function startEdit(i) {
  currentEditIndex = i;
  $('entry').value = entries[i].text;
  $('entry').scrollIntoView({ behavior: 'smooth' });
  updateCount();
  closePanels();
}

function delEntry(i) {
  if (confirm('Delete this entry?')) {
    entries.splice(i, 1);
    persist();
    renderEntries();
    updateStats();
  }
}

function persist() {
  localStorage.setItem('djEntries', JSON.stringify(entries));
}

/* -------------------  Render Lists  ------------------- */
function cardHTML(e, i) {
  return `<li>
    <strong>${e.date}</strong><br>${e.text.replace(/\n/g, '<br>')}
    <div class="mini-btns">
      <button onclick="startEdit(${i})">✏️</button>
      <button onclick="delEntry(${i})">🗑️</button>
    </div>
  </li>`;
}

function renderEntries() {
  // Preview list (latest 3)
  $('previewList').innerHTML = entries.slice(0, 3).map(cardHTML).join('');

  // Full Book panel list
  $('entriesList').innerHTML = entries.map(cardHTML).join('');
}

/* -------------------  Search & Date Filter  ------------------- */
$('searchBox').oninput = $('dateFilter').onchange = () => {
  const q = $('searchBox').value.toLowerCase();
  const d = $('dateFilter').value;

  $('entriesList').innerHTML = entries
    .filter(e => {
      const okQ = !q || e.text.toLowerCase().includes(q) ||
                  e.tags.some(t => t.toLowerCase().includes(q));
      const okD = !d || e.date === d;
      return okQ && okD;
    })
    .map(cardHTML)
    .join('');
};

/* -------------------  Export (TXT / PDF)  ------------------- */
function exportTXT() {
  const blob = new Blob(
    [entries.map(e => `${e.date}\n${e.text}\n\n`).join('')],
    { type: 'text/plain' }
  );
  download(blob, 'journal.txt');
}

function exportPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;

  entries.forEach(e => {
    doc.text(e.date, 10, y);
    y += 6;
    e.text.split('\n').forEach(line => {
      doc.text(line, 10, y);
      y += 6;
      if (y > 280) { doc.addPage(); y = 10; }
    });
    y += 6;
  });

  doc.save('journal.pdf');
}

function download(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

/* -------------------  Stats & Streak  ------------------- */
function updateStats() {
  // Streak (consecutive days)
  const days = [...new Set(entries.map(e => e.date))];
  let streak = 0;
  let cur = new Date().toISOString().slice(0, 10);
  while (days.includes(cur)) {
    streak++;
    cur = new Date(Date.parse(cur) - 864e5).toISOString().slice(0, 10);
  }
  $('streakCount').textContent = `${streak} 🔥 day${streak !== 1 ? 's' : ''}`;

  // Insights (most active day, avg words)
  const counts = entries.reduce((m, e) => (m[e.date] = (m[e.date] || 0) + 1, m), {});
  const [topDay = '—'] = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []);
  const avg = Math.round(entries.reduce((s, e) => s + e.text.split(/\s+/).length, 0) /
                         (entries.length || 1));

  $('insights').innerHTML = `Most active: <b>${topDay}</b><br>Avg words: <b>${avg}</b>`;
}

/* -------------------  Logout  ------------------- */
function logout() {
  localStorage.clear();
  location = 'index.html';
}


