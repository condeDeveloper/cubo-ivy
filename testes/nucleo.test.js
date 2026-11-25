import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  GIROS, resolvido, aplica, aplicaSequencia, indice, estadoDoIndice, postoPerm, permDoPosto,
  paridade, buscaEmLargura, resolve, TAMANHO, cicloDoCanto,
} from '../src/ivy.js'

test('o posto da permutacao vai e volta nas 720', () => {
  for (let r = 0; r < 720; r++) assert.equal(postoPerm(permDoPosto(r)), r)
})

test('o indice vai e volta em todo o espaco', () => {
  for (let i = 0; i < TAMANHO; i += 7) assert.equal(indice(estadoDoIndice(i)), i)
})

test('cada canto cicla tres faces diferentes, uma de cada eixo', () => {
  for (let c = 0; c < 4; c++) {
    const f = cicloDoCanto(c)
    assert.deepEqual(f.map((x) => x >> 1), [0, 1, 2])
  }
})

test('todo giro tem ordem 3 e e desfeito pelo contrario', () => {
  const e0 = aplicaSequencia(resolvido(), ['A', "B'", 'C', 'D', "A'"])
  for (let c = 0; c < 4; c++) {
    const mais = GIROS[c * 2], menos = GIROS[c * 2 + 1]
    assert.deepEqual(aplica(aplica(aplica(e0, mais), mais), mais), e0)
    assert.deepEqual(aplica(aplica(e0, mais), menos), e0)
  }
})

test('as petalas so sofrem permutacao par', () => {
  const { dist } = buscaEmLargura()
  for (let i = 0; i < TAMANHO; i++) if (dist[i] >= 0) assert.equal(paridade(estadoDoIndice(i).petalas), 0)
})

test('o caminho do resolve tem o tamanho da distancia e resolve mesmo', () => {
  const { dist } = buscaEmLargura()
  for (let i = 0; i < TAMANHO; i += 97) {
    if (dist[i] < 0) continue
    const e = estadoDoIndice(i)
    const c = resolve(e)
    assert.equal(c.length, dist[i])
    assert.deepEqual(aplicaSequencia(e, c), resolvido())
  }
})
