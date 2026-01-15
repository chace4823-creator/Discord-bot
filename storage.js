// Simple JSON file storage. Not super concurrent-safe but small and effective for demos.
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function ensure() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({ tickets: {}, events: {} }, null, 2));
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function write(data) {
  ensure();
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = {
  getDB() { return read(); },
  saveDB(db) { write(db); },
  getTicket(id) { const db = read(); return db.tickets[id]; },
  addTicket(id, payload) { const db = read(); db.tickets[id] = payload; write(db); },
  removeTicket(id) { const db = read(); delete db.tickets[id]; write(db); },
  addEvent(id, payload) { const db = read(); db.events[id] = payload; write(db); }
};