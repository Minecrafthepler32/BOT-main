const fs = require('fs');
const path = require('path');

const HELP_FILE = path.join(__dirname, '..', 'help.json');

function loadHelp() {
  if (!fs.existsSync(HELP_FILE)) {
    const defaults = { public: [], staff: [], owner: [] };
    fs.writeFileSync(HELP_FILE, JSON.stringify(defaults, null, 2));
    return defaults;
  }
  return JSON.parse(fs.readFileSync(HELP_FILE, 'utf8'));
}

function saveHelp(data) {
  fs.writeFileSync(HELP_FILE, JSON.stringify(data, null, 2));
}

function addEntry(roleKey, text) {
  const data = loadHelp();
  if (!data[roleKey]) data[roleKey] = [];
  if (!data[roleKey].includes(text)) {
    data[roleKey].push(text);
    saveHelp(data);
  }
  return true;
}

function removeEntry(roleKey, text) {
  const data = loadHelp();
  if (!data[roleKey]) return false;
  const idx = data[roleKey].indexOf(text);
  if (idx === -1) return false;
  data[roleKey].splice(idx, 1);
  // Clean up empty role keys (but keep public/staff/owner always)
  const defaults = ['public', 'staff', 'owner'];
  if (data[roleKey].length === 0 && !defaults.includes(roleKey)) {
    delete data[roleKey];
  }
  saveHelp(data);
  return true;
}

module.exports = { loadHelp, saveHelp, addEntry, removeEntry };
