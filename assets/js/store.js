// Data layer localStorage — CRUD untuk profile, experiences, skills, projects, messages
// Sepenuhnya di sisi browser, tanpa backend. Key: "portofolio_refin_v1"

const STORE_KEY = "portofolio_refin_v1";
const SESSION_KEY = "portofolio_refin_session";
const THEME_KEY = "portofolio_refin_theme";

let DB = null;

// --- util
const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

const todayISO = () => new Date().toISOString().slice(0, 10);

// hash sederhana untuk password demo (BUKAN produksi)
function demoHash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return "h" + h.toString(16);
}

function loadDB() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      DB = JSON.parse(raw);
      // pastikan password hash ada
      if (DB.auth && DB.auth.email && !DB.auth.password_hash) {
        DB.auth.password_hash = demoHash("refin124140126");
        saveDB();
      }
      return DB;
    }
  } catch (e) { /* korup, reseed */ }
  DB = JSON.parse(JSON.stringify(SEED));
  DB.auth.password_hash = demoHash("refin124140126");
  saveDB();
  return DB;
}

function saveDB() {
  localStorage.setItem(STORE_KEY, JSON.stringify(DB));
}

function resetDB() {
  localStorage.removeItem(STORE_KEY);
  loadDB();
}

// --- generic CRUD
function list(coll, { publikOnly = false } = {}) {
  if (!DB) loadDB();
  let items = [...DB[coll]];
  if (publikOnly) items = items.filter((it) => it.status !== "draft");
  items.sort((a, b) => (a.sort_order ?? 9e9) - (b.sort_order ?? 9e9));
  return items;
}

function get(coll, id) {
  return DB[coll].find((x) => x.id === id) || null;
}

function insert(coll, data) {
  const item = { id: uid(), sort_order: DB[coll].length + 1, ...data };
  DB[coll].push(item);
  saveDB();
  return item;
}

function update(coll, id, patch) {
  const idx = DB[coll].findIndex((x) => x.id === id);
  if (idx === -1) return null;
  DB[coll][idx] = { ...DB[coll][idx], ...patch, id };
  saveDB();
  return DB[coll][idx];
}

function remove(coll, id) {
  const before = DB[coll].length;
  DB[coll] = DB[coll].filter((x) => x.id !== id);
  if (DB[coll].length !== before) saveDB();
  return before !== DB[coll].length;
}

// --- profil
function getProfile() { return DB.profile; }
function updateProfile(patch) {
  DB.profile = { ...DB.profile, ...patch };
  saveDB();
  return DB.profile;
}

// --- auth (demo: satu akun, hash demo)
function login(email, password) {
  if (!DB.auth.password_hash) DB.auth.password_hash = demoHash("refin124140126");
  const ok = email.trim().toLowerCase() === DB.auth.email && demoHash(password) === DB.auth.password_hash;
  if (!ok) return false;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now() }));
  return true;
}
function logout() { sessionStorage.removeItem(SESSION_KEY); }
function isAuthed() { return !!sessionStorage.getItem(SESSION_KEY); }

// --- foto (dipanggil dari admin)
function addPhoto(expID, photo) {
  const exp = DB.experiences.find((x) => x.id === expID);
  if (!exp) return null;
  photo = { id: uid(), is_cover: false, sort_order: exp.photos.length + 1, caption: "", ...photo };
  exp.photos.push(photo);
  saveDB();
  return photo;
}
function updatePhoto(expID, photoID, patch) {
  const exp = DB.experiences.find((x) => x.id === expID);
  if (!exp) return null;
  const idx = exp.photos.findIndex((p) => p.id === photoID);
  if (idx === -1) return null;
  exp.photos[idx] = { ...exp.photos[idx], ...patch, id: photoID };
  saveDB();
  return exp.photos[idx];
}
function removePhoto(expID, photoID) {
  const exp = DB.experiences.find((x) => x.id === expID);
  if (!exp) return false;
  const before = exp.photos.length;
  exp.photos = exp.photos.filter((p) => p.id !== photoID);
  if (exp.photos.length !== before) saveDB();
  return exp.photos.length !== before;
}
function setCover(expID, photoID) {
  const exp = DB.experiences.find((x) => x.id === expID);
  if (!exp) return;
  exp.photos.forEach((p) => (p.is_cover = p.id === photoID));
  saveDB();
}
function coverOf(exp) {
  if (!exp || !exp.photos || !exp.photos.length) return "";
  return exp.photos.find((p) => p.is_cover)?.url || exp.photos[0].url;
}

// --- pesan
function addMessage(data) {
  return insert("messages", { read: false, created_at: new Date().toISOString(), ...data });
}
function unreadCount() { return DB.messages.filter((m) => !m.read).length; }

// --- export global
window.DB = null;
window.Store = {
  init: loadDB, save: saveDB, reset: resetDB, db: () => DB,
  list, get, insert, update, remove,
  profile: { get: getProfile, update: updateProfile },
  login, logout, isAuthed,
  photos: { add: addPhoto, update: updatePhoto, remove: removePhoto, setCover, coverOf },
  messages: { add: addMessage, unread: unreadCount },
  uid, demoHash, todayISO, STORE_KEY
};
