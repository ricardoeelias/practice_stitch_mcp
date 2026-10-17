// Ejecutar sin dependencias: Get-Content tests/favoritas.test.cjs -Raw | node
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const code = fs.readFileSync('views/js/favoritas.js', 'utf8');
const data = new Map(), nodes = new Map();
let storageFails = false, copyFails = false, copied = '';
const context = {
  window: {},
  localStorage: {
    getItem: key => data.get(key) || null,
    setItem: (key, value) => { if (storageFails) throw Error('quota'); data.set(key, value); }
  },
  document: {
    getElementById: id => nodes.get(id),
    createElement: () => ({ style: {}, setAttribute() {}, select() {}, remove() {} }),
    body: { appendChild: node => nodes.set(node.id, node) },
    execCommand: () => !copyFails
  },
  navigator: { clipboard: { writeText: async text => { if (copyFails) throw Error('denied'); copied = text; } } },
  setTimeout: () => 1, clearTimeout() {}
};
vm.runInNewContext(code, context);
const api = context.window.ExcusifyFavorites, key = 'excusify.favorites.v1';
(async () => {
  assert.equal(api.read().length, 0);
  data.set(key, '{broken'); assert.equal(api.read().length, 0);
  data.set(key, JSON.stringify([null, { text: 'a', category: 'Invalid' }])); assert.equal(api.read().length, 0);
  const item = { text: 'Mi gato cerró la laptop.', category: 'Trabajo', absurdity: 4 };
  api.add(item); api.add(item); assert.equal(api.read().length, 1);
  assert.equal(api.read()[0].absurdity, 4);
  vm.runInNewContext(code, context); assert.equal(context.window.ExcusifyFavorites.read().length, 1);
  storageFails = true; api.add({ ...item, text: 'Otra excusa' }); assert.equal(api.read().length, 1);
  assert.match(nodes.get('favoritesNotice').textContent, /No se pudo guardar/);
  storageFails = false;
  await api.copy(item.text); assert.equal(copied, item.text);
  copyFails = true; await api.copy(item.text); assert.match(nodes.get('favoritesNotice').textContent, /No se pudo copiar/);
  assert.equal(api.write([]), true); assert.equal(api.read().length, 0);
  console.log('OK: almacenamiento, recarga, validación, duplicados, eliminación y errores de copia.');
})().catch(error => { console.error(error); process.exitCode = 1; });
