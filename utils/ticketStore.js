const fs = require('fs');
const path = require('path');

const STORE_PATH = path.join(__dirname, '..', 'data', 'ticketConfig.json');

function ensureDir() {
  const dir = path.dirname(STORE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

/**
 * Default store shape:
 * {
 *   panelChannelId: string | null,
 *   categoryId: string | null,
 *   logsChannelId: string | null,
 *   openTickets: {
 *     [channelId]: {
 *       userId: string,
 *       type: string,
 *       openedAt: number,
 *       ticketNumber: number
 *     }
 *   },
 *   ticketCounter: number
 * }
 */
function defaultStore() {
  return {
    panelChannelId: null,
    categoryId: null,
    logsChannelId: null,
    openTickets: {},
    ticketCounter: 0,
  };
}

function load() {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    const d = defaultStore();
    fs.writeFileSync(STORE_PATH, JSON.stringify(d, null, 2));
    return d;
  }
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch {
    return defaultStore();
  }
}

function save(data) {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2));
}

function clear() {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore(), null, 2));
}

module.exports = { load, save, clear };
