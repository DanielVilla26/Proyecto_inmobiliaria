const initSqlJs = require("sql.js");
const fs   = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");

const DB_PATH = path.join(__dirname, "data.sqlite");
let db;

async function init() {
  const SQL = await initSqlJs();
  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  // ── Usuarios ────────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre    TEXT NOT NULL,
    email     TEXT UNIQUE NOT NULL,
    password  TEXT NOT NULL,
    rol       TEXT NOT NULL DEFAULT 'usuario',
    avatar    TEXT DEFAULT '',
    telefono  TEXT DEFAULT '',
    bio       TEXT DEFAULT '',
    creado_en TEXT DEFAULT (datetime('now'))
  )`);
  migrateCol("usuarios", "avatar",   "TEXT DEFAULT ''");
  migrateCol("usuarios", "telefono", "TEXT DEFAULT ''");
  migrateCol("usuarios", "bio",      "TEXT DEFAULT ''");

  // ── Propiedades ─────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS propiedades (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo       TEXT NOT NULL,
    ciudad       TEXT NOT NULL,
    precio       INTEGER NOT NULL,
    imagen       TEXT,
    contacto     TEXT,
    descripcion  TEXT,
    tipo         TEXT DEFAULT 'apartamento',
    habitaciones INTEGER DEFAULT 1,
    banos        INTEGER DEFAULT 1,
    metros       INTEGER DEFAULT 0,
    direccion    TEXT DEFAULT '',
    activa       INTEGER DEFAULT 1,
    creado_en    TEXT DEFAULT (datetime('now'))
  )`);
  migrateCol("propiedades", "tipo",         "TEXT DEFAULT 'apartamento'");
  migrateCol("propiedades", "habitaciones", "INTEGER DEFAULT 1");
  migrateCol("propiedades", "banos",        "INTEGER DEFAULT 1");
  migrateCol("propiedades", "metros",       "INTEGER DEFAULT 0");
  migrateCol("propiedades", "direccion",    "TEXT DEFAULT ''");

  // ── Imágenes ─────────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS imagenes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    propiedad_id INTEGER NOT NULL,
    url          TEXT NOT NULL,
    orden        INTEGER DEFAULT 0,
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id)
  )`);

  // ── Favoritos ─────────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS favoritos (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id   INTEGER NOT NULL,
    propiedad_id INTEGER NOT NULL,
    creado_en    TEXT DEFAULT (datetime('now')),
    UNIQUE(usuario_id, propiedad_id)
  )`);

  // ── Reservas ──────────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS reservas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id    INTEGER NOT NULL,
    propiedad_id  INTEGER NOT NULL,
    fecha         TEXT NOT NULL,
    hora          TEXT NOT NULL,
    estado        TEXT DEFAULT 'pendiente',
    nota          TEXT,
    creado_en     TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id),
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id)
  )`);

  // ── Reseñas de propiedades ────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS resenas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id   INTEGER NOT NULL,
    propiedad_id INTEGER NOT NULL,
    puntuacion   INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario   TEXT NOT NULL,
    creado_en    TEXT DEFAULT (datetime('now')),
    actualizado_en TEXT DEFAULT (datetime('now')),
    UNIQUE(usuario_id, propiedad_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (propiedad_id) REFERENCES propiedades(id)
  )`);

  // ── Seeds ─────────────────────────────────────────────────────────────────────
  const admin = db.exec("SELECT id FROM usuarios WHERE rol='admin' LIMIT 1");
  if (!admin.length || !admin[0].values.length) {
    const hash = bcrypt.hashSync("admin123", 10);
    db.run("INSERT INTO usuarios (nombre,email,password,rol) VALUES (?,?,?,?)",
      ["Administrador", "admin@casafacil.com", hash, "admin"]);
  }

  const props = db.exec("SELECT id FROM propiedades LIMIT 1");
  if (!props.length || !props[0].values.length) {
    const seed = [
      ["Apartamento moderno en Bogotá",   "Bogotá",       1200000, "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=600&q=80", "+57 300 111 1111", "Amplio apartamento con vista panorámica.", "apartamento", 2, 1, 65, "Calle 85 #15-20"],
      ["Casa familiar en Medellín",        "Medellín",     2500000, "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80", "+57 300 222 2222", "Casa de 3 habitaciones con jardín.", "casa", 3, 2, 120, "Calle 10 #43-55, El Poblado"],
      ["Apartamento en Cartagena",         "Cartagena",    3000000, "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=600&q=80", "+57 300 333 3333", "A 5 minutos del mar.", "apartamento", 2, 2, 80, "Bocagrande Av. San Martín"],
      ["Casa campestre moderna",           "Cundinamarca", 1800000, "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600&q=80", "+57 300 444 4444", "Rodeada de naturaleza, ideal para familias.", "casa", 4, 3, 200, "Km 12 vía La Calera"],
      ["Estudio céntrico en Cali",         "Cali",          900000, "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&q=80", "+57 300 555 5555", "Ideal para profesionales.", "estudio", 1, 1, 35, "Av. 6N #23-12"],
      ["Penthouse en Barranquilla",        "Barranquilla", 4500000, "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80", "+57 300 666 6666", "Terraza privada con jacuzzi.", "apartamento", 3, 3, 180, "Cra 51B #86-63"]
    ];
    for (const d of seed) {
      db.run("INSERT INTO propiedades (titulo,ciudad,precio,imagen,contacto,descripcion,tipo,habitaciones,banos,metros,direccion) VALUES (?,?,?,?,?,?,?,?,?,?,?)", d);
    }
  }


  // ── Chat mensajes ────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS chat_mensajes (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id   INTEGER NOT NULL,
    propiedad_id INTEGER,
    de_admin     INTEGER DEFAULT 0,
    mensaje      TEXT NOT NULL,
    leido        INTEGER DEFAULT 0,
    creado_en    TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id)   REFERENCES usuarios(id)
  )`);

  // ── Notificaciones ────────────────────────────────────────────────────────────
  db.run(`CREATE TABLE IF NOT EXISTS notificaciones (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id  INTEGER NOT NULL,
    tipo        TEXT NOT NULL,
    titulo      TEXT NOT NULL,
    mensaje     TEXT NOT NULL,
    leida       INTEGER DEFAULT 0,
    link        TEXT DEFAULT '',
    creado_en   TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
  )`);

  // ── Usuarios: activo flag ─────────────────────────────────────────────────────
  migrateCol("usuarios", "activo", "INTEGER DEFAULT 1");

  save();
  console.log("✅ Base de datos lista");
}

function migrateCol(table, col, def) {
  const info = db.exec(`PRAGMA table_info(${table})`);
  if (!info.length) return;
  const cols = info[0].values.map(r => r[1]);
  if (!cols.includes(col)) db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
}

function save() {
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function query(sql, params = []) {
  const res = db.exec(sql, params);
  if (!res.length) return [];
  return res[0].values.map(row =>
    Object.fromEntries(res[0].columns.map((col, i) => [col, row[i]]))
  );
}

function run(sql, params = []) {
  db.run(sql, params);
  save();
}

module.exports = { init, query, run };
