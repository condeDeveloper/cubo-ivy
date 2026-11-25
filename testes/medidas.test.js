// Os numeros do README presos. Se o codigo mudar e o numero mudar, quebra.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as M from '../src/medidas.js'

test('29.160 posicoes, numero de Deus 8, 110 no extremo', () => {
  const d = M.distancias()
  assert.deepEqual(d.porDistancia, [1, 8, 48, 288, 1640, 7582, 15262, 4221, 110])
  assert.equal(d.total, 29160)
  assert.equal(d.total, 81 * 360)
  assert.equal(d.deus, 8)
  assert.equal(d.media.toFixed(4), '5.7420')
})

test('ate 3 giros nada se repete; no 4o faltam 88', () => {
  const d = M.distancias()
  for (let i = 1; i <= 3; i++) assert.equal(d.porDistancia[i], d.semRepetir[i])
  assert.equal(d.semRepetir[4] - d.porDistancia[4], 88)
})

test('so torcao: 81 posicoes, nenhuma abaixo de 6 giros, um canto sozinho custa 7', () => {
  const t = M.soTorcao()
  assert.equal(t.n, 81)
  assert.deepEqual(t.porDistancia, [1, 0, 0, 0, 0, 0, 32, 32, 16])
  assert.deepEqual(t.umCanto, [7, 7, 7, 7, 7, 7, 7, 7])
})

test('so petalas: 360 posicoes, nenhuma a 5 giros, 40 no extremo', () => {
  const p = M.soPetalas()
  assert.equal(p.n, 360)
  assert.deepEqual(p.porDistancia, [1, 0, 0, 0, 32, 0, 248, 39, 40])
})

test('antipodas: 40 sem canto torcido, 8 com tres, 62 com quatro, nenhuma com um ou dois', () => {
  const a = M.antipodas()
  assert.deepEqual(a.porTorcidos, [40, 0, 0, 8, 62])
  assert.deepEqual(a.maxPorTorcidos, [8, 7, 7, 8, 8])
  assert.deepEqual(a.totalPorTorcidos, [360, 2880, 8640, 11520, 5760])
})

test('1.260 posicoes essencialmente diferentes, por orbitas e por Burnside', () => {
  const c = M.classes()
  assert.equal(c.simetrias, 24)
  assert.equal(c.classes, 1260)
  assert.equal(c.burnside, 1260)
  assert.deepEqual(c.porDistancia, [1, 1, 2, 12, 69, 323, 647, 194, 11])
  assert.equal(c.distanciaQuebrada, 0)
})

test('o juiz concorda nas 29.160 e o controle discorda em 15.788', () => {
  const j = M.conferencia()
  assert.equal(j.total, 29160)
  assert.equal(j.iguais, 29160)
  assert.equal(j.diferentes, 0)
  assert.equal(j.controle, 15788)
})
