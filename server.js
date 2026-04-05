const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const db = require('./database');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

const normalizeString = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
};
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.use(session({
  secret: 'frecuency_secret_key_123',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Auth Middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login');
};

const isAdmin = (req, res, next) => {
  if (req.session.user && req.session.user.rol === 'admin') return next();
  res.status(403).send('Acceso denegado. Solo administradores.');
};

// Routes
app.get('/', isAuthenticated, (req, res) => {
  res.redirect('/dashboard');
});

app.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/dashboard');
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE usuario = ?').get(usuario);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = { id: user.id, nombre: user.nombre, usuario: user.usuario, rol: user.rol };
    return res.redirect('/dashboard');
  }
  res.render('login', { error: 'Usuario o contraseña incorrectos' });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/dashboard', isAuthenticated, (req, res) => {
  // Datos generales con info de favoritos si existen para este usuario
  const data = db.prepare(`
    SELECT d.*, e.nombre as estado_nombre, e.color as estado_color, p.nombre as provincia_nombre, p.codigo_aereo,
           f.memoria_personalizada,
           CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END as es_favorito
    FROM datos d
    LEFT JOIN estados e ON d.id_estado = e.id
    LEFT JOIN provincias p ON d.id_provincia = p.id
    LEFT JOIN favoritos f ON d.id = f.id_dato AND f.id_usuario = ?
    WHERE d.fecha_baja IS NULL
  `).all(req.session.user.id);
  
  const estados = db.prepare('SELECT * FROM estados').all();
  const provincias = db.prepare('SELECT * FROM provincias').all();

  // Cargar últimas 5 notificaciones no leídas
  const notificaciones = db.prepare('SELECT * FROM notificaciones WHERE id_usuario = ? AND leida = 0 ORDER BY fecha DESC LIMIT 5')
                           .all(req.session.user.id);

  // Si es admin, cargar solicitudes pendientes (con datos originales para comparar) y lista de usuarios
  let solicitudes = [];
  let usuarios_lista = [];
  if (req.session.user.rol === 'admin') {
    solicitudes = db.prepare(`
      SELECT s.*, u.nombre as usuario_nombre,
             d.mem as old_mem, d.tx as old_tx, d.rx as old_rx, d.mod as old_mod, 
             d.subt as old_subt, d.signal as old_signal, d.banda as old_banda,
             d.titular as old_titular, d.ciudad as old_ciudad,
             es.nombre as old_estado_nombre, pr.nombre as old_provincia_nombre
      FROM solicitudes_cambios s
      JOIN usuarios u ON s.id_usuario = u.id
      LEFT JOIN datos d ON s.id_dato = d.id
      LEFT JOIN estados es ON d.id_estado = es.id
      LEFT JOIN provincias pr ON d.id_provincia = pr.id
      WHERE s.estado = 'pendiente'
      ORDER BY s.fecha_solicitud DESC
    `).all();
    
    usuarios_lista = db.prepare('SELECT id, nombre, usuario, correo, rol, fecha_alta FROM usuarios ORDER BY nombre ASC').all();
  }
  
  res.render('dashboard', { 
    user: req.session.user, 
    data, 
    estados, 
    provincias, 
    solicitudes,
    usuarios_lista,
    notificaciones,
    msg: req.query.msg
  });
});

// API Endpoints
app.post('/api/datos', isAuthenticated, (req, res) => {
  const { mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia } = req.body;
  
  if (req.session.user.rol === 'admin') {
    const insert = db.prepare(`
      INSERT INTO datos (mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia);
  } else {
    // Usuario regular: crear solicitud
    const stmt = db.prepare('INSERT INTO solicitudes_cambios (id_usuario, tipo, datos_json) VALUES (?, ?, ?)');
    stmt.run(req.session.user.id, 'alta', JSON.stringify(req.body));
  }
  res.redirect('/dashboard?msg=pendiente');
});

app.post('/api/datos/edit/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia } = req.body;
  
  if (req.session.user.rol === 'admin') {
    const update = db.prepare(`
      UPDATE datos 
      SET mem = ?, tx = ?, rx = ?, mod = ?, subt = ?, signal = ?, banda = ?, id_estado = ?, titular = ?, ciudad = ?, id_provincia = ?, fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    update.run(mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia, id);
  } else {
    // Usuario regular: crear solicitud de edición
    const stmt = db.prepare('INSERT INTO solicitudes_cambios (id_dato, id_usuario, tipo, datos_json) VALUES (?, ?, ?, ?)');
    stmt.run(id, req.session.user.id, 'edicion', JSON.stringify(req.body));
  }
  res.redirect('/dashboard?msg=pendiente');
});

app.post('/api/datos/delete/:id', isAuthenticated, (req, res) => {
  const { id } = req.params;
  if (req.session.user.rol === 'admin') {
    const softDelete = db.prepare('UPDATE datos SET fecha_baja = CURRENT_TIMESTAMP WHERE id = ?');
    softDelete.run(id);
  } else {
    // Usuario regular: solicitar baja
    const stmt = db.prepare('INSERT INTO solicitudes_cambios (id_dato, id_usuario, tipo, datos_json) VALUES (?, ?, ?, ?)');
    stmt.run(id, req.session.user.id, 'baja', JSON.stringify({id}));
  }
  res.redirect('/dashboard?msg=pendiente');
});

// Favoritos
app.post('/api/favoritos/toggle', isAuthenticated, (req, res) => {
  const { id_dato } = req.body;
  const userId = req.session.user.id;
  
  const existing = db.prepare('SELECT id FROM favoritos WHERE id_usuario = ? AND id_dato = ?').get(userId, id_dato);
  if (existing) {
    db.prepare('DELETE FROM favoritos WHERE id = ?').run(existing.id);
  } else {
    db.prepare('INSERT INTO favoritos (id_usuario, id_dato) VALUES (?, ?)').run(userId, id_dato);
  }
  res.json({ success: true });
});

app.post('/api/favoritos/update-mem', isAuthenticated, (req, res) => {
  const { id_dato, mem_personalizada } = req.body;
  const userId = req.session.user.id;
  db.prepare('UPDATE favoritos SET memoria_personalizada = ? WHERE id_usuario = ? AND id_dato = ?')
    .run(mem_personalizada, userId, id_dato);
  res.redirect('/dashboard#favoritos');
});

// Administración de Solicitudes
app.post('/api/admin/solicitudes/:id/aprobar', isAdmin, (req, res) => {
  const { id } = req.params;
  const solicitud = db.prepare('SELECT * FROM solicitudes_cambios WHERE id = ?').get(id);
  if (!solicitud) return res.status(404).send('Solicitud no encontrada');
  
  const datos = JSON.parse(solicitud.datos_json);
  
  if (solicitud.tipo === 'alta') {
    const insert = db.prepare(`
      INSERT INTO datos (mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    insert.run(datos.mem, datos.tx, datos.rx, datos.mod, datos.subt, datos.signal, datos.banda, datos.id_estado, datos.titular, datos.ciudad, datos.id_provincia);
  } else if (solicitud.tipo === 'edicion') {
    const update = db.prepare(`
      UPDATE datos 
      SET mem = ?, tx = ?, rx = ?, mod = ?, subt = ?, signal = ?, banda = ?, id_estado = ?, titular = ?, ciudad = ?, id_provincia = ?, fecha_modificacion = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    update.run(datos.mem, datos.tx, datos.rx, datos.mod, datos.subt, datos.signal, datos.banda, datos.id_estado, datos.titular, datos.ciudad, datos.id_provincia, solicitud.id_dato);
  } else if (solicitud.tipo === 'baja') {
    db.prepare('UPDATE datos SET fecha_baja = CURRENT_TIMESTAMP WHERE id = ?').run(solicitud.id_dato);
  }
  
  db.prepare("UPDATE solicitudes_cambios SET estado = 'aprobado' WHERE id = ?").run(id);
  
  // Notificar al usuario
  const signal = datos.signal || 'Registro';
  db.prepare('INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)')
    .run(solicitud.id_usuario, `Solicitud para "${signal}" APROBADA satisfactoriamente.`);
  
  res.redirect('/dashboard?msg=aprobado');
});

app.post('/api/admin/solicitudes/:id/rechazar', isAdmin, (req, res) => {
  const { id } = req.params;
  const solicitud = db.prepare('SELECT id_usuario, datos_json FROM solicitudes_cambios WHERE id = ?').get(id);
  
  db.prepare("UPDATE solicitudes_cambios SET estado = 'rechazado' WHERE id = ?").run(id);
  
  if (solicitud) {
    const datos = JSON.parse(solicitud.datos_json);
    const signal = datos.signal || 'Registro';
    db.prepare('INSERT INTO notificaciones (id_usuario, mensaje) VALUES (?, ?)')
      .run(solicitud.id_usuario, `Solicitud para "${signal}" RECHAZADA por el administrador.`);
  }
  
  res.redirect('/dashboard?msg=rechazado');
});

// Notificaciones
app.post('/api/notificaciones/read-all', isAuthenticated, (req, res) => {
  db.prepare('UPDATE notificaciones SET leida = 1 WHERE id_usuario = ?').run(req.session.user.id);
  res.json({ success: true });
});

// Administración de Usuarios (ABM)
app.post('/api/admin/usuarios', isAdmin, (req, res) => {
  const { nombre, usuario, password, correo, rol } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO usuarios (nombre, usuario, password, correo, rol) VALUES (?, ?, ?, ?, ?)');
    stmt.run(nombre, usuario, hashedPassword, correo, rol);
    res.redirect('/dashboard?msg=user_created#usuarios');
  } catch (err) {
    res.redirect('/dashboard?msg=error_usuario#usuarios');
  }
});

app.post('/api/admin/usuarios/edit/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  const { nombre, usuario, password, correo, rol } = req.body;
  
  if (password && password.trim() !== "") {
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.prepare('UPDATE usuarios SET nombre=?, usuario=?, password=?, correo=?, rol=? WHERE id=?')
      .run(nombre, usuario, hashedPassword, correo, rol, id);
  } else {
    db.prepare('UPDATE usuarios SET nombre=?, usuario=?, correo=?, rol=? WHERE id=?')
      .run(nombre, usuario, correo, rol, id);
  }
  res.redirect('/dashboard?msg=user_updated#usuarios');
});

app.post('/api/admin/usuarios/delete/:id', isAdmin, (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === req.session.user.id) {
    return res.redirect('/dashboard?msg=error_self_delete#usuarios');
  }
  db.prepare('DELETE FROM usuarios WHERE id = ?').run(id);
  res.redirect('/dashboard?msg=user_deleted#usuarios');
});

// Importar CSV
app.post('/api/admin/importar-csv', isAdmin, upload.single('csv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });

  const results = [];
  const imported = [];
  const discarded = [];

  // Cargar mapeos de estados y provincias
  const estados = db.prepare('SELECT id, nombre FROM estados').all();
  const provincias = db.prepare('SELECT id, nombre FROM provincias').all();

  const getEstadoId = (nombre) => {
    const n = normalizeString(nombre);
    const found = estados.find(e => normalizeString(e.nombre) === n);
    return found ? found.id : 1; // Default Ok
  };

  const getProvinciaId = (nombre) => {
    const n = normalizeString(nombre);
    const found = provincias.find(p => normalizeString(p.nombre) === n);
    return found ? found.id : null;
  };

  // Cargar registros existentes para evitar duplicados (TX, RX, SEÑAL)
  const existentes = db.prepare('SELECT tx, rx, signal FROM datos WHERE fecha_baja IS NULL').all();
  const isDuplicate = (tx, rx, signal) => {
    return existentes.some(e => 
      normalizeString(e.tx) === normalizeString(tx) && 
      normalizeString(e.rx) === normalizeString(rx) && 
      normalizeString(e.signal) === normalizeString(signal)
    );
  };

  fs.createReadStream(req.file.path)
    .pipe(csv({ 
       mapHeaders: ({ header }) => header.trim().replace(/^[\uFEFF\u00EF\u00BB\u00BF]+/, "") 
    }))
    .on('data', (data) => results.push(data))
    .on('end', () => {
      const insert = db.prepare(`
        INSERT INTO datos (mem, tx, rx, mod, subt, signal, banda, id_estado, titular, ciudad, id_provincia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      db.transaction(() => {
        for (const row of results) {
          // Normalizar encabezados (a veces vienen con espacios o variaciones)
          // Normalizar encabezados y limpiar datos
          const txRaw = row['TX'] || row['tx'] || '';
          const rxRaw = row['RX'] || row['rx'] || '';
          
          const mem = row['Mem'] || row['mem'] || '';
          const tx = txRaw.toString().replace(',', '.').trim();
          const rx = rxRaw.toString().replace(',', '.').trim();
          const mod = row['Mod'] || row['mod'] || '';
          const subtRaw = row['SubT(Hz)'] || row['SubT'] || row['subt'] || '';
          const subt = subtRaw.toString().replace(',', '.').trim();
          const signal = (row['SEÑAL'] || row['signal'] || '').trim();
          const banda = row['Banda'] || row['banda'] || '';
          const estadoNombre = row['Estado'] || row['estado'] || '';
          const titular = row['TITULAR'] || row['titular'] || '';
          const ciudadRaw = row['CIUDAD / LOCALIDAD'] || row['ciudad'] || '';
          const ciudad = ciudadRaw.toString().replace(/\.+$/, '').trim();
          const provinciaNombre = row['PROVINCIA'] || row['provincia'] || '';

          // Si no hay señal, asignar No-SIGN por defecto
          const signalFinal = signal || 'No-SIGN';
          
          if (!tx || !rx) {
             discarded.push({ signal: signalFinal, reason: 'Faltan frecuencias (TX/RX)' });
             continue;
          }

          if (isDuplicate(tx, rx, signalFinal)) {
            discarded.push({ signal: signalFinal, reason: 'Duplicado (TX/RX/Señal ya existen)' });
          } else {
            const id_estado = getEstadoId(estadoNombre);
            const id_provincia = getProvinciaId(provinciaNombre);
            insert.run(mem, tx, rx, mod, subt, signalFinal, banda, id_estado, titular, ciudad, id_provincia);
            imported.push(signalFinal);
            // Agregar a la lista de existentes dinámicamente para evitar duplicados dentro del mismo CSV
            existentes.push({ tx, rx, signal: signalFinal });
          }
        }
      })();

      // Limpiar archivo temporal
      fs.unlinkSync(req.file.path);

      res.json({
        success: true,
        summary: {
          imported: imported.length,
          discarded: discarded.length
        },
        discardedRecords: discarded
      });
    });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
