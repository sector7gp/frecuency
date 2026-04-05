const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'frecuency.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    usuario TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    correo TEXT NOT NULL,
    rol TEXT DEFAULT 'usuario',
    fecha_alta DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS estados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    color TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS provincias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    codigo_aereo TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS datos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mem TEXT,
    tx TEXT,
    rx TEXT,
    mod TEXT,
    subt TEXT,
    signal TEXT,
    banda TEXT,
    id_estado INTEGER,
    titular TEXT,
    ciudad TEXT,
    id_provincia INTEGER,
    id_usuario_creador INTEGER, 
    es_privada INTEGER DEFAULT 0, -- 0: Pública, 1: Privada
    fecha_alta DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_baja DATETIME,
    FOREIGN KEY(id_estado) REFERENCES estados(id),
    FOREIGN KEY(id_provincia) REFERENCES provincias(id),
    FOREIGN KEY(id_usuario_creador) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS solicitudes_cambios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_dato INTEGER, -- NULL para altas nuevas
    id_usuario INTEGER NOT NULL,
    tipo TEXT NOT NULL, -- 'alta', 'edicion', 'baja'
    datos_json TEXT NOT NULL,
    estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'aprobado', 'rechazado'
    mensaje_admin TEXT,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_dato) REFERENCES datos(id),
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
  );

  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    id_dato INTEGER NOT NULL,
    memoria_personalizada TEXT,
    fecha_agregado DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id),
    FOREIGN KEY(id_dato) REFERENCES datos(id),
    UNIQUE(id_usuario, id_dato)
  );

  CREATE TABLE IF NOT EXISTS notificaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    id_usuario INTEGER NOT NULL,
    mensaje TEXT NOT NULL,
    leida INTEGER DEFAULT 0,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(id_usuario) REFERENCES usuarios(id)
  );
`);

// Insert initial lookup data
const insertEstado = db.prepare('INSERT OR IGNORE INTO estados (id, nombre, color) VALUES (?, ?, ?)');
insertEstado.run(1, 'Ok', 'success');
insertEstado.run(2, 'Ver', 'warning');
insertEstado.run(3, 'Fs', 'danger');

const insertProvincia = db.prepare('INSERT OR IGNORE INTO provincias (nombre, codigo_aereo) VALUES (?, ?)');
const provinciasData = [
    ['Buenos Aires', 'BUE'],
    ['CABA', 'BUE'],
    ['Catamarca', 'CTC'],
    ['Chaco', 'CHQ'],
    ['Chubut', 'CHB'],
    ['Córdoba', 'COR'],
    ['Corrientes', 'CRR'],
    ['Entre Ríos', 'ERS'],
    ['Formosa', 'FOR'],
    ['Jujuy', 'JUJ'],
    ['La Pampa', 'LPA'],
    ['La Rioja', 'LRJ'],
    ['Mendoza', 'MDZ'],
    ['Misiones', 'MSN'],
    ['Neuquén', 'NQN'],
    ['Río Negro', 'RNG'],
    ['Salta', 'SLA'],
    ['San Juan', 'SJN'],
    ['San Luis', 'SLU'],
    ['Santa Cruz', 'SCZ'],
    ['Santa Fe', 'SFE'],
    ['Santiago del Estero', 'SDE'],
    ['Tierra del Fuego', 'TDF'],
    ['Tucumán', 'TUC']
];

const provCount = db.prepare('SELECT count(*) as count FROM provincias').get();
if (provCount.count === 0) {
    for (const [nombre, codigo] of provinciasData) {
        insertProvincia.run(nombre, codigo);
    }
}

// Insert initial users if they don't exist
const adminPassword = bcrypt.hashSync('admin123', 10);
const userPassword = bcrypt.hashSync('user123', 10);

const insertUser = db.prepare('INSERT OR IGNORE INTO usuarios (nombre, usuario, password, correo, rol) VALUES (?, ?, ?, ?, ?)');
insertUser.run('Administrador', 'admin', adminPassword, 'admin@frecuency.com', 'admin');
insertUser.run('Usuario Regular', 'usuario', userPassword, 'user@frecuency.com', 'usuario');

// Insert initial data if table is empty
const dataCount = db.prepare('SELECT count(*) as count FROM datos').get();
if (dataCount.count === 0) {
  const insertData = db.prepare(`
    INSERT INTO datos (mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Map values to IDs
  const initialData = [
    ['9', '147,270', '147,870', '', '71,9', 'LU5DVB', '2', 1, 'R C VIILLA BALLESTER', 'Villa Ballester', 1],
    ['11', '145,420', '144,820', '', '114,8', 'LU4EV', '2', 1, 'R C CASEROS', 'Caseros', 1],
    ['12', '147,105', '147,705', '', '123,0', 'LU5DA', '2', 1, 'R C RIO DE LA PLATA', 'Olivos', 1]
  ];

  for (const row of initialData) {
    insertData.run(...row);
  }
}

module.exports = db;
