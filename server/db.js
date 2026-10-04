import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'giovanni.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS productos (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    stock INTEGER DEFAULT 0,
    category TEXT,
    icon TEXT,
    destinoComanda TEXT DEFAULT 'cocina',
    disponible INTEGER DEFAULT 1,
    description TEXT,
    imageUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS mesas (
    id TEXT PRIMARY KEY,
    numero INTEGER NOT NULL,
    sector TEXT,
    capacidad INTEGER DEFAULT 4,
    estado TEXT DEFAULT 'libre',
    mozoAsignadoId TEXT
  );

  CREATE TABLE IF NOT EXISTS espacios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT,
    status TEXT DEFAULT 'libre',
    precioHora REAL,
    isActive INTEGER DEFAULT 1,
    currentReservationId TEXT
  );

  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    isFrequent INTEGER DEFAULT 0,
    isSanctioned INTEGER DEFAULT 0,
    totalReservations INTEGER DEFAULT 0,
    noShows INTEGER DEFAULT 0,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id TEXT PRIMARY KEY,
    courtId TEXT,
    clientId TEXT,
    clientName TEXT,
    clientPhone TEXT,
    date TEXT,
    startTime TEXT,
    endTime TEXT,
    paymentStatus TEXT,
    paymentMethod TEXT,
    amount REAL,
    paidAmount REAL DEFAULT 0,
    notes TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS pedidos (
    id TEXT PRIMARY KEY,
    tipoPedido TEXT,
    mesaId TEXT,
    mozoId TEXT,
    clienteNombre TEXT,
    clienteTelefono TEXT,
    direccionDelivery TEXT,
    estado TEXT DEFAULT 'borrador',
    total REAL DEFAULT 0,
    createdAt TEXT,
    updatedAt TEXT
  );

  CREATE TABLE IF NOT EXISTS pedido_items (
    id TEXT PRIMARY KEY,
    pedidoId TEXT NOT NULL,
    productoId TEXT,
    nombre TEXT,
    cantidad INTEGER,
    precioUnitario REAL,
    subtotal REAL,
    notas TEXT,
    estadoItem TEXT DEFAULT 'pendiente',
    destinoComanda TEXT,
    FOREIGN KEY (pedidoId) REFERENCES pedidos(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ofertas (
    id TEXT PRIMARY KEY,
    titulo TEXT,
    descripcion TEXT,
    descuentoPct REAL,
    descuentoMonto REAL,
    activo INTEGER DEFAULT 1,
    fechaDesde TEXT,
    fechaHasta TEXT,
    diasSemana TEXT,
    horaDesde TEXT,
    horaHasta TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS caja_movimientos (
    id TEXT PRIMARY KEY,
    type TEXT,
    amount REAL,
    method TEXT,
    description TEXT,
    relatedPedidoId TEXT,
    createdAt TEXT
  );

  CREATE TABLE IF NOT EXISTS caja_sesion (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    status TEXT DEFAULT 'cerrada',
    openedAt TEXT,
    openingAmount REAL DEFAULT 0,
    closedAt TEXT,
    closingAmount REAL DEFAULT 0,
    expectedAmount REAL DEFAULT 0,
    openedBy TEXT
  );

  CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);

// Migrations for existing DBs
const safeAlter = (sql) => {
  try {
    db.exec(sql);
  } catch {
    // Column already exists or error ignored
  }
};
safeAlter('ALTER TABLE productos ADD COLUMN description TEXT');
safeAlter('ALTER TABLE productos ADD COLUMN imageUrl TEXT');
safeAlter('ALTER TABLE clientes ADD COLUMN email TEXT');
safeAlter('ALTER TABLE clientes ADD COLUMN totalReservations INTEGER DEFAULT 0');
safeAlter('ALTER TABLE clientes ADD COLUMN noShows INTEGER DEFAULT 0');
safeAlter('ALTER TABLE caja_sesion ADD COLUMN closedAt TEXT');
safeAlter('ALTER TABLE caja_sesion ADD COLUMN closingAmount REAL DEFAULT 0');
safeAlter('ALTER TABLE caja_sesion ADD COLUMN expectedAmount REAL DEFAULT 0');
safeAlter('ALTER TABLE caja_sesion ADD COLUMN openedBy TEXT');

// Seed if empty
const productCount = db.prepare('SELECT COUNT(*) as c FROM productos').get().c;
if (productCount === 0) {
  console.log('Seeding database...');
  const seed = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed.json'), 'utf8'));

  const insProd = db.prepare(
    `INSERT INTO productos (id,name,price,stock,category,icon,destinoComanda,disponible) VALUES (?,?,?,?,?,?,?,?)`
  );
  for (const p of seed.productos) {
    insProd.run(p.id, p.name, p.price, p.stock, p.category, p.icon, p.destinoComanda, p.disponible ? 1 : 0);
  }

  const insMesa = db.prepare(
    `INSERT INTO mesas (id,numero,sector,capacidad,estado) VALUES (?,?,?,?,?)`
  );
  for (const m of seed.mesas) {
    insMesa.run(m.id, m.numero, m.sector, m.capacidad, m.estado);
  }

  const insEsp = db.prepare(
    `INSERT INTO espacios (id,name,type,status,precioHora,isActive) VALUES (?,?,?,?,?,?)`
  );
  for (const e of seed.espacios) {
    insEsp.run(e.id, e.name, e.type, e.status, e.precioHora, e.isActive ? 1 : 0);
  }

  db.prepare(`INSERT OR IGNORE INTO caja_sesion (id, status) VALUES (1, 'cerrada')`).run();
  console.log('Seed complete.');
}

export default db;
