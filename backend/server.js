const Database = require("better-sqlite3");
const db = new Database("marketplace.db");

// Sync helpers to match our existing code
db.run_ = (sql, params = []) =>
  new Promise((res, rej) => {
    try {
      const result = db.prepare(sql).run(...params);
      res(result);
    } catch (err) { rej(err); }
  });

db.all_ = (sql, params = []) =>
  new Promise((res, rej) => {
    try {
      const rows = db.prepare(sql).all(...params);
      res(rows);
    } catch (err) { rej(err); }
  });

db.get_ = (sql, params = []) =>
  new Promise((res, rej) => {
    try {
      const row = db.prepare(sql).get(...params);
      res(row);
    } catch (err) { rej(err); }
  });

// Init tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    category TEXT,
    image_url TEXT,
    seller_id INTEGER NOT NULL,
    stock INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    buyer_id INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (buyer_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);