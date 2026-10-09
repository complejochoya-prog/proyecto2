import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const tempDir = await mkdtemp(path.join(tmpdir(), 'proyecto2-smoke-'));
const port = 32000 + Math.floor(Math.random() * 12000);
const baseUrl = `http://127.0.0.1:${port}`;
const child = spawn(process.execPath, ['server/index.js'], {
  cwd: process.cwd(),
  env: {
    ...process.env,
    PORT: String(port),
    DB_PATH: path.join(tempDir, 'smoke.sqlite'),
    NODE_ENV: 'test',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let serverOutput = '';
child.stdout.on('data', (chunk) => { serverOutput += chunk.toString(); });
child.stderr.on('data', (chunk) => { serverOutput += chunk.toString(); });

async function request(pathname, options) {
  const response = await fetch(`${baseUrl}${pathname}`, options);
  const body = await response.text();
  assert.ok(response.ok, `${options?.method || 'GET'} ${pathname} failed: ${response.status} ${body}`);
  return body ? JSON.parse(body) : null;
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (child.exitCode !== null) break;
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  assert.ok(ready, `API did not start in time. Server output: ${serverOutput}`);

  const health = await request('/api/health');
  assert.equal(health.ok, true);
  assert.equal(health.db, 'sqlite');

  const initialProducts = await request('/api/productos');
  assert.ok(Array.isArray(initialProducts), 'GET /api/productos must return an array');

  const product = await request('/api/productos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 'smoke-product',
      name: 'Producto de prueba',
      price: 123,
      stock: 2,
      category: 'smoke-test',
    }),
  });
  assert.equal(product.id, 'smoke-product');

  const updatedProduct = await request('/api/productos/smoke-product', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Producto actualizado', price: 456 }),
  });
  assert.equal(updatedProduct.name, 'Producto actualizado');
  assert.equal(updatedProduct.price, 456);

  const order = await request('/api/pedidos', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 'smoke-order',
      tipoPedido: 'mostrador',
      estado: 'borrador',
      total: 456,
      items: [{
        id: 'smoke-item',
        productoId: 'smoke-product',
        nombre: 'Producto actualizado',
        cantidad: 1,
        precioUnitario: 456,
        subtotal: 456,
      }],
    }),
  });
  assert.equal(order.id, 'smoke-order');
  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].subtotal, 456);

  const updatedOrder = await request('/api/pedidos/smoke-order', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      estado: 'confirmado',
      total: 789,
      items: [{
        id: 'smoke-item-updated',
        productoId: 'smoke-product',
        nombre: 'Producto actualizado',
        cantidad: 1,
        precioUnitario: 789,
        subtotal: 789,
      }],
    }),
  });
  assert.equal(updatedOrder.estado, 'confirmado');
  assert.equal(updatedOrder.total, 789);
  assert.equal(updatedOrder.items[0].id, 'smoke-item-updated');

  const offer = await request('/api/ofertas', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 'smoke-offer',
      titulo: 'Oferta inicial',
      descripcion: 'Debe conservarse',
      descuentoPct: 10,
      descuentoMonto: 100,
      activo: true,
      fechaDesde: '2026-10-01',
      fechaHasta: '2026-10-31',
      diasSemana: [1, 2, 3],
      horaDesde: '10:00',
      horaHasta: '12:00',
    }),
  });
  assert.equal(offer.id, 'smoke-offer');

  const updatedOffer = await request('/api/ofertas/smoke-offer', {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ titulo: 'Oferta editada', activo: false }),
  });
  assert.equal(updatedOffer.titulo, 'Oferta editada');
  assert.equal(updatedOffer.activo, false);
  assert.equal(updatedOffer.descripcion, 'Debe conservarse');
  assert.equal(updatedOffer.descuentoPct, 10);
  assert.deepEqual(updatedOffer.diasSemana, [1, 2, 3]);

  const snapshot = await request('/api/sync');
  assert.ok(Array.isArray(snapshot.productos));
  assert.ok(Array.isArray(snapshot.pedidos));

  await request('/api/ofertas/smoke-offer', { method: 'DELETE' });
  await request('/api/pedidos/smoke-order', { method: 'DELETE' });
  await request('/api/productos/smoke-product', { method: 'DELETE' });
  const remainingOrders = await request('/api/pedidos');
  const remainingOffers = await request('/api/ofertas');
  const remainingProducts = await request('/api/productos');
  assert.ok(!remainingOrders.some((item) => item.id === 'smoke-order'));
  assert.ok(!remainingOffers.some((item) => item.id === 'smoke-offer'));
  assert.ok(!remainingProducts.some((item) => item.id === 'smoke-product'));

  console.log('API smoke tests passed: health, SQLite reads, product CRUD, transactional order/items CRUD, partial offer updates, sync snapshot.');
} finally {
  if (child.exitCode === null) {
    child.kill('SIGTERM');
    await new Promise((resolve) => child.once('exit', resolve));
  }
  await rm(tempDir, { recursive: true, force: true });
}
