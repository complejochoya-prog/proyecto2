import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;
const allowedOrigins = (process.env.API_ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use(cors({
  origin(origin, callback) {
    // Non-browser clients (health checks/server-to-server) do not send Origin.
    if (!origin) return callback(null, true);
    // Keep local development convenient; production requires an explicit allowlist.
    if (process.env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
}));
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(express.json({ limit: '2mb' }));
// Owner login is configured only through server-side environment variables; never commit credentials.
app.post('/api/auth/login', (req, res) => {
  const { email, password, pin, scope } = req.body || {};
  const ownerEmail = (process.env.OWNER_EMAIL || '').trim().toLowerCase();
  const ownerPassword = process.env.OWNER_PASSWORD || '';
  const ownerPin = process.env.OWNER_PIN || '';
  if (!ownerEmail || !ownerPassword || !ownerPin) {
    return res.status(503).json({ error: 'owner_auth_not_configured', message: 'El acceso del propietario aún no está configurado en el servidor.' });
  }
  const emailMatches = typeof email === 'string' && email.trim().toLowerCase() === ownerEmail;
  const passwordMatches = typeof password === 'string' && password === ownerPassword;
  const pinMatches = typeof pin === 'string' && pin === ownerPin;
  if (!emailMatches || (password !== undefined ? !passwordMatches : !pinMatches)) {
    return res.status(401).json({ error: 'invalid_credentials', message: 'Credenciales incorrectas.' });
  }
  const isSuperadmin = scope === 'superadmin';
  return res.json({
    id: isSuperadmin ? 'owner-superadmin' : 'owner-giovanni',
    negocioId: isSuperadmin ? null : 'giovanni',
    email: ownerEmail,
    nombre: 'Propietario',
    rol: isSuperadmin ? 'superadmin' : 'admin',
    isActive: true
  });
});

app.use('/api', (req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();
  const body = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({
      error: 'invalid_request',
      message: 'El cuerpo de la solicitud debe ser un objeto JSON.',
    });
  }
  next();
});

// Helpers
const rowProducto = (r) =>
  r && {
    id: r.id,
    name: r.name,
    price: r.price,
    stock: r.stock,
    category: r.category,
    icon: r.icon,
    destinoComanda: r.destinoComanda,
    disponible: !!r.disponible,
    description: r.description || '',
    imageUrl: r.imageUrl || '',
  };

const rowMesa = (r) =>
  r && {
    id: r.id,
    negocioId: 'giovanni',
    numero: r.numero,
    sector: r.sector,
    capacidad: r.capacidad,
    estado: r.estado,
    mozoAsignadoId: r.mozoAsignadoId || undefined,
  };

const rowEspacio = (r) =>
  r && {
    id: r.id,
    negocioId: 'giovanni',
    name: r.name,
    type: r.type,
    status: r.status,
    precioHora: r.precioHora,
    isActive: !!r.isActive,
    currentReservationId: r.currentReservationId || undefined,
  };

// ========== PRODUCTOS ==========
app.get('/api/productos', (_req, res) => {
  const rows = db.prepare('SELECT * FROM productos ORDER BY category, name').all();
  res.json(rows.map(rowProducto));
});

app.post('/api/productos', (req, res) => {
  const p = req.body;
  const id = p.id || String(Date.now()).slice(-8);
  db.prepare(
    `INSERT INTO productos (id,name,price,stock,category,icon,destinoComanda,disponible,description,imageUrl)
     VALUES (?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    p.name,
    p.price,
    p.stock ?? 0,
    p.category,
    p.icon || 'restaurant',
    p.destinoComanda || 'cocina',
    p.disponible !== false ? 1 : 0,
    p.description || '',
    p.imageUrl || ''
  );
  res.json(rowProducto(db.prepare('SELECT * FROM productos WHERE id=?').get(id)));
});

app.put('/api/productos/:id', (req, res) => {
  const p = req.body;
  const cur = db.prepare('SELECT * FROM productos WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  db.prepare(
    `UPDATE productos SET name=?, price=?, stock=?, category=?, icon=?, destinoComanda=?, disponible=?, description=?, imageUrl=? WHERE id=?`
  ).run(
    p.name ?? cur.name,
    p.price ?? cur.price,
    p.stock ?? cur.stock,
    p.category ?? cur.category,
    p.icon ?? cur.icon,
    p.destinoComanda ?? cur.destinoComanda,
    p.disponible !== undefined ? (p.disponible ? 1 : 0) : cur.disponible,
    p.description !== undefined ? p.description : cur.description,
    p.imageUrl !== undefined ? p.imageUrl : cur.imageUrl,
    req.params.id
  );
  res.json(rowProducto(db.prepare('SELECT * FROM productos WHERE id=?').get(req.params.id)));
});

app.delete('/api/productos/:id', (req, res) => {
  db.prepare('DELETE FROM productos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== MESAS ==========
app.get('/api/mesas', (_req, res) => {
  res.json(db.prepare('SELECT * FROM mesas ORDER BY numero').all().map(rowMesa));
});

app.post('/api/mesas', (req, res) => {
  const m = req.body;
  const id = m.id || `m${Date.now()}`;
  db.prepare(`INSERT INTO mesas (id,numero,sector,capacidad,estado) VALUES (?,?,?,?,?)`).run(
    id, m.numero, m.sector || 'salon', m.capacidad || 4, m.estado || 'libre'
  );
  res.json(rowMesa(db.prepare('SELECT * FROM mesas WHERE id=?').get(id)));
});

app.put('/api/mesas/:id', (req, res) => {
  const m = req.body;
  const cur = db.prepare('SELECT * FROM mesas WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  db.prepare(
    `UPDATE mesas SET numero=?, sector=?, capacidad=?, estado=?, mozoAsignadoId=? WHERE id=?`
  ).run(
    m.numero ?? cur.numero,
    m.sector ?? cur.sector,
    m.capacidad ?? cur.capacidad,
    m.estado ?? cur.estado,
    m.mozoAsignadoId ?? cur.mozoAsignadoId,
    req.params.id
  );
  res.json(rowMesa(db.prepare('SELECT * FROM mesas WHERE id=?').get(req.params.id)));
});

app.delete('/api/mesas/:id', (req, res) => {
  db.prepare('DELETE FROM mesas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== ESPACIOS ==========
app.get('/api/espacios', (_req, res) => {
  res.json(db.prepare('SELECT * FROM espacios ORDER BY name').all().map(rowEspacio));
});

app.post('/api/espacios', (req, res) => {
  const e = req.body;
  const id = e.id || `esp-${Date.now()}`;
  db.prepare(
    `INSERT INTO espacios (id,name,type,status,precioHora,isActive) VALUES (?,?,?,?,?,?)`
  ).run(id, e.name, e.type, e.status || 'libre', e.precioHora || 0, e.isActive !== false ? 1 : 0);
  res.json(rowEspacio(db.prepare('SELECT * FROM espacios WHERE id=?').get(id)));
});

app.put('/api/espacios/:id', (req, res) => {
  const e = req.body;
  const cur = db.prepare('SELECT * FROM espacios WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  db.prepare(
    `UPDATE espacios SET name=?, type=?, status=?, precioHora=?, isActive=?, currentReservationId=? WHERE id=?`
  ).run(
    e.name ?? cur.name,
    e.type ?? cur.type,
    e.status ?? cur.status,
    e.precioHora ?? cur.precioHora,
    e.isActive !== undefined ? (e.isActive ? 1 : 0) : cur.isActive,
    e.currentReservationId !== undefined ? e.currentReservationId : cur.currentReservationId,
    req.params.id
  );
  res.json(rowEspacio(db.prepare('SELECT * FROM espacios WHERE id=?').get(req.params.id)));
});

app.delete('/api/espacios/:id', (req, res) => {
  db.prepare('DELETE FROM espacios WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== RESERVAS ==========
app.get('/api/reservas', (_req, res) => {
  const rows = db.prepare('SELECT * FROM reservas ORDER BY date DESC, startTime').all();
  res.json(rows);
});

app.post('/api/reservas', (req, res) => {
  const r = req.body;
  const id = r.id || `res-${Date.now()}`;
  db.prepare(
    `INSERT INTO reservas (id,courtId,clientId,clientName,clientPhone,date,startTime,endTime,paymentStatus,paymentMethod,amount,paidAmount,notes,createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, r.courtId, r.clientId, r.clientName, r.clientPhone, r.date, r.startTime, r.endTime,
    r.paymentStatus || 'pendiente', r.paymentMethod, r.amount, r.paidAmount || 0, r.notes,
    r.createdAt || new Date().toISOString()
  );
  res.json(db.prepare('SELECT * FROM reservas WHERE id=?').get(id));
});

app.put('/api/reservas/:id', (req, res) => {
  const r = req.body;
  const cur = db.prepare('SELECT * FROM reservas WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  db.prepare(
    `UPDATE reservas SET
      courtId=?, clientId=?, clientName=?, clientPhone=?, date=?, startTime=?, endTime=?,
      paymentStatus=?, paymentMethod=?, amount=?, paidAmount=?, notes=?
     WHERE id=?`
  ).run(
    r.courtId ?? cur.courtId,
    r.clientId ?? cur.clientId,
    r.clientName ?? cur.clientName,
    r.clientPhone ?? cur.clientPhone,
    r.date ?? cur.date,
    r.startTime ?? cur.startTime,
    r.endTime ?? cur.endTime,
    r.paymentStatus ?? cur.paymentStatus,
    r.paymentMethod ?? cur.paymentMethod,
    r.amount ?? cur.amount,
    r.paidAmount ?? cur.paidAmount,
    r.notes ?? cur.notes,
    req.params.id
  );
  res.json(db.prepare('SELECT * FROM reservas WHERE id=?').get(req.params.id));
});

app.delete('/api/reservas/:id', (req, res) => {
  db.prepare('DELETE FROM reservas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== PEDIDOS ==========
app.get('/api/pedidos', (_req, res) => {
  const pedidos = db.prepare('SELECT * FROM pedidos ORDER BY createdAt DESC').all();
  const itemsStmt = db.prepare('SELECT * FROM pedido_items WHERE pedidoId=?');
  res.json(
    pedidos.map((p) => ({
      ...p,
      items: itemsStmt.all(p.id).map((i) => ({
        id: i.id,
        productoId: i.productoId,
        nombre: i.nombre,
        cantidad: i.cantidad,
        precioUnitario: i.precioUnitario,
        subtotal: i.subtotal,
        notas: i.notas || undefined,
        estadoItem: i.estadoItem,
        destinoComanda: i.destinoComanda,
      })),
    }))
  );
});

app.post('/api/pedidos', (req, res) => {
  const p = req.body;
  const id = p.id || `ped-${Date.now()}`;
  const now = new Date().toISOString();
  const savePedido = db.transaction(() => {
    db.prepare(
      `INSERT INTO pedidos (id,tipoPedido,mesaId,mozoId,clienteNombre,clienteTelefono,direccionDelivery,estado,total,createdAt,updatedAt)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`
    ).run(
      id, p.tipoPedido, p.mesaId, p.mozoId, p.clienteNombre, p.clienteTelefono,
      p.direccionDelivery, p.estado || 'borrador', p.total || 0, now, now
    );
    if (p.items?.length) {
    const ins = db.prepare(
      `INSERT INTO pedido_items (id,pedidoId,productoId,nombre,cantidad,precioUnitario,subtotal,notas,estadoItem,destinoComanda)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    );
      for (const i of p.items) {
        ins.run(
          i.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          id, i.productoId, i.nombre, i.cantidad, i.precioUnitario, i.subtotal,
          i.notas, i.estadoItem || 'pendiente', i.destinoComanda
        );
      }
    }
  });
  savePedido();
  const pedido = db.prepare('SELECT * FROM pedidos WHERE id=?').get(id);
  const items = db.prepare('SELECT * FROM pedido_items WHERE pedidoId=?').all(id);
  res.json({ ...pedido, items });
});

app.put('/api/pedidos/:id', (req, res) => {
  const p = req.body;
  const cur = db.prepare('SELECT * FROM pedidos WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  const now = new Date().toISOString();
  const updatePedido = db.transaction(() => {
    db.prepare(
      `UPDATE pedidos SET estado=?, total=?, clienteNombre=?, clienteTelefono=?, direccionDelivery=?, updatedAt=? WHERE id=?`
    ).run(
      p.estado ?? cur.estado,
      p.total ?? cur.total,
      p.clienteNombre ?? cur.clienteNombre,
      p.clienteTelefono ?? cur.clienteTelefono,
      p.direccionDelivery ?? cur.direccionDelivery,
      now,
      req.params.id
    );

    // Replace items if provided
  if (Array.isArray(p.items)) {
    db.prepare('DELETE FROM pedido_items WHERE pedidoId=?').run(req.params.id);
    const ins = db.prepare(
      `INSERT INTO pedido_items (id,pedidoId,productoId,nombre,cantidad,precioUnitario,subtotal,notas,estadoItem,destinoComanda)
       VALUES (?,?,?,?,?,?,?,?,?,?)`
    );
      for (const i of p.items) {
        ins.run(
          i.id || `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          req.params.id, i.productoId, i.nombre, i.cantidad, i.precioUnitario, i.subtotal,
          i.notas, i.estadoItem || 'pendiente', i.destinoComanda
        );
      }
    }
  });
  updatePedido();

  const pedido = db.prepare('SELECT * FROM pedidos WHERE id=?').get(req.params.id);
  const items = db.prepare('SELECT * FROM pedido_items WHERE pedidoId=?').all(req.params.id);
  res.json({ ...pedido, items });
});

app.delete('/api/pedidos/:id', (req, res) => {
  db.prepare('DELETE FROM pedido_items WHERE pedidoId=?').run(req.params.id);
  db.prepare('DELETE FROM pedidos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== CLIENTES ==========
const rowCliente = (r) =>
  r && {
    id: r.id,
    name: r.name,
    phone: r.phone,
    email: r.email || '',
    isFrequent: !!r.isFrequent,
    isSanctioned: !!r.isSanctioned,
    totalReservations: r.totalReservations || 0,
    noShows: r.noShows || 0,
    createdAt: r.createdAt,
  };

app.get('/api/clientes', (_req, res) => {
  res.json(db.prepare('SELECT * FROM clientes ORDER BY name').all().map(rowCliente));
});

app.post('/api/clientes', (req, res) => {
  const c = req.body;
  const id = c.id || `cl${Date.now()}`;
  db.prepare(
    `INSERT INTO clientes (id,name,phone,email,isFrequent,isSanctioned,totalReservations,noShows,createdAt)
     VALUES (?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    c.name,
    c.phone,
    c.email || '',
    c.isFrequent ? 1 : 0,
    c.isSanctioned ? 1 : 0,
    c.totalReservations || 0,
    c.noShows || 0,
    c.createdAt || new Date().toISOString()
  );
  res.json(rowCliente(db.prepare('SELECT * FROM clientes WHERE id=?').get(id)));
});

app.put('/api/clientes/:id', (req, res) => {
  const c = req.body;
  const cur = db.prepare('SELECT * FROM clientes WHERE id=?').get(req.params.id);
  if (!cur) return res.status(404).json({ error: 'not found' });
  db.prepare(
    `UPDATE clientes SET name=?, phone=?, email=?, isFrequent=?, isSanctioned=?, totalReservations=?, noShows=? WHERE id=?`
  ).run(
    c.name ?? cur.name,
    c.phone ?? cur.phone,
    c.email !== undefined ? c.email : cur.email,
    c.isFrequent !== undefined ? (c.isFrequent ? 1 : 0) : cur.isFrequent,
    c.isSanctioned !== undefined ? (c.isSanctioned ? 1 : 0) : cur.isSanctioned,
    c.totalReservations !== undefined ? c.totalReservations : cur.totalReservations,
    c.noShows !== undefined ? c.noShows : cur.noShows,
    req.params.id
  );
  res.json(rowCliente(db.prepare('SELECT * FROM clientes WHERE id=?').get(req.params.id)));
});

app.delete('/api/clientes/:id', (req, res) => {
  db.prepare('DELETE FROM clientes WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== OFERTAS ==========
app.get('/api/ofertas', (_req, res) => {
  const rows = db.prepare('SELECT * FROM ofertas ORDER BY createdAt DESC').all();
  res.json(
    rows.map((o) => ({
      ...o,
      activo: !!o.activo,
      diasSemana: o.diasSemana ? JSON.parse(o.diasSemana) : undefined,
    }))
  );
});

app.post('/api/ofertas', (req, res) => {
  const o = req.body;
  const id = o.id || `of${Date.now()}`;
  db.prepare(
    `INSERT INTO ofertas (id,titulo,descripcion,descuentoPct,descuentoMonto,activo,fechaDesde,fechaHasta,diasSemana,horaDesde,horaHasta,createdAt)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id, o.titulo, o.descripcion, o.descuentoPct, o.descuentoMonto, o.activo !== false ? 1 : 0,
    o.fechaDesde, o.fechaHasta, o.diasSemana ? JSON.stringify(o.diasSemana) : null,
    o.horaDesde, o.horaHasta, new Date().toISOString()
  );
  res.json({ id, ...o });
});

app.put('/api/ofertas/:id', (req, res) => {
  const o = req.body;
  const current = db.prepare('SELECT * FROM ofertas WHERE id=?').get(req.params.id);
  if (!current) return res.status(404).json({ error: 'not_found' });

  db.prepare(
    `UPDATE ofertas SET titulo=?, descripcion=?, descuentoPct=?, descuentoMonto=?, activo=?, fechaDesde=?, fechaHasta=?, diasSemana=?, horaDesde=?, horaHasta=? WHERE id=?`
  ).run(
    o.titulo ?? current.titulo,
    o.descripcion ?? current.descripcion,
    o.descuentoPct ?? current.descuentoPct,
    o.descuentoMonto ?? current.descuentoMonto,
    o.activo !== undefined ? (o.activo ? 1 : 0) : current.activo,
    o.fechaDesde ?? current.fechaDesde,
    o.fechaHasta ?? current.fechaHasta,
    o.diasSemana !== undefined ? (o.diasSemana ? JSON.stringify(o.diasSemana) : null) : current.diasSemana,
    o.horaDesde ?? current.horaDesde,
    o.horaHasta ?? current.horaHasta,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM ofertas WHERE id=?').get(req.params.id);
  res.json({
    ...updated,
    activo: !!updated.activo,
    diasSemana: updated.diasSemana ? JSON.parse(updated.diasSemana) : undefined,
  });
});

app.delete('/api/ofertas/:id', (req, res) => {
  db.prepare('DELETE FROM ofertas WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ========== CAJA ==========
app.get('/api/caja/sesion', (_req, res) => {
  res.json(db.prepare('SELECT * FROM caja_sesion WHERE id=1').get());
});

app.put('/api/caja/sesion', (req, res) => {
  const s = req.body;
  db.prepare(
    `UPDATE caja_sesion SET status=?, openedAt=?, openingAmount=?, closedAt=?, closingAmount=?, expectedAmount=?, openedBy=? WHERE id=1`
  ).run(
    s.status,
    s.openedAt,
    s.openingAmount ?? 0,
    s.closedAt || null,
    s.closingAmount ?? 0,
    s.expectedAmount ?? 0,
    s.openedBy || null
  );
  res.json(db.prepare('SELECT * FROM caja_sesion WHERE id=1').get());
});

app.get('/api/caja/movimientos', (_req, res) => {
  res.json(db.prepare('SELECT * FROM caja_movimientos ORDER BY createdAt DESC').all());
});

app.post('/api/caja/movimientos', (req, res) => {
  const m = req.body;
  const id = m.id || `mov-${Date.now()}`;
  db.prepare(
    `INSERT INTO caja_movimientos (id,type,amount,method,description,relatedPedidoId,createdAt) VALUES (?,?,?,?,?,?,?)`
  ).run(id, m.type, m.amount, m.method, m.description, m.relatedPedidoId, new Date().toISOString());
  res.json(db.prepare('SELECT * FROM caja_movimientos WHERE id=?').get(id));
});

// ========== HEALTH ==========
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, db: 'sqlite', time: new Date().toISOString() });
});

// Full snapshot (útil para sync inicial)
app.get('/api/sync', (_req, res) => {
  const productos = db.prepare('SELECT * FROM productos').all().map(rowProducto);
  const mesas = db.prepare('SELECT * FROM mesas ORDER BY numero').all().map(rowMesa);
  const espacios = db.prepare('SELECT * FROM espacios').all().map(rowEspacio);
  const reservas = db.prepare('SELECT * FROM reservas').all();
  const clientes = db.prepare('SELECT * FROM clientes').all();
  const pedidosRaw = db.prepare('SELECT * FROM pedidos').all();
  const itemsStmt = db.prepare('SELECT * FROM pedido_items WHERE pedidoId=?');
  const pedidos = pedidosRaw.map((p) => ({
    ...p,
    items: itemsStmt.all(p.id),
  }));
  const ofertas = db.prepare('SELECT * FROM ofertas').all().map((o) => ({
    ...o,
    activo: !!o.activo,
    diasSemana: o.diasSemana ? JSON.parse(o.diasSemana) : undefined,
  }));
  const cajaSesion = db.prepare('SELECT * FROM caja_sesion WHERE id=1').get();
  const cajaMovimientos = db.prepare('SELECT * FROM caja_movimientos ORDER BY createdAt DESC').all();
  res.json({ productos, mesas, espacios, reservas, clientes, pedidos, ofertas, cajaSesion, cajaMovimientos });
});

// Consistent JSON responses for unknown API routes and database/JSON errors.
app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'not_found' });
});

app.use((err, _req, res, _next) => {
  const constraintError = typeof err.code === 'string' && err.code.startsWith('SQLITE_CONSTRAINT');
  const status = Number.isInteger(err.status) ? err.status : constraintError ? 400 : 500;
  if (status >= 500) console.error('API error:', err);
  res.status(status).json({
    error: status >= 500 ? 'internal_server_error' : 'invalid_request',
    message: status >= 500 ? 'Error interno del servidor' : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`\n🗄️  Giovanni API + SQLite → http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
