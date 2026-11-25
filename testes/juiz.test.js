import { test } from 'node:test'
import assert from 'node:assert/strict'
import { girosPelaGeometria, adesivos, aplicaGeometria, estadoResolvido, leEstado } from '../src/juiz.js'
import { resolvido, aplicaSequencia, GIROS } from '../src/ivy.js'

test('18 adesivos: 12 de canto e 6 petalas, 3 de cada cor', () => {
  const a = adesivos()
  assert.equal(a.length, 18)
  assert.equal(a.filter((x) => x.tipo === 'canto').length, 12)
  for (let c = 0; c < 6; c++) assert.equal(a.filter((x) => x.cor === c).length, 3)
})

test('cada giro da geometria mexe 6 adesivos e tem ordem 3', () => {
  for (const g of girosPelaGeometria()) {
    assert.equal(g.filter((d, i) => d !== i).length, 6)
    let e = estadoResolvido().map((_, i) => i)
    const ini = e.slice()
    e = aplicaGeometria(aplicaGeometria(aplicaGeometria(e, g), g), g)
    assert.deepEqual(e, ini)
  }
})

test('giros de cantos diferentes nao comutam', () => {
  const g = girosPelaGeometria()
  const ini = estadoResolvido().map((_, i) => i)
  const ab = aplicaGeometria(aplicaGeometria(ini, g[0]), g[2])
  const ba = aplicaGeometria(aplicaGeometria(ini, g[2]), g[0])
  assert.notDeepEqual(ab, ba)
})

test('a geometria e as coordenadas andam juntas giro por giro', () => {
  const geo = girosPelaGeometria()
  let cores = estadoResolvido()
  let e = resolvido()
  const seq = [0, 3, 5, 6, 1, 2, 7, 4, 0, 0, 6, 3, 5, 1]
  for (const g of seq) {
    cores = aplicaGeometria(cores, geo[g])
    e = aplicaSequencia(e, [GIROS[g].nome])
    assert.deepEqual(leEstado(cores), e)
  }
})
