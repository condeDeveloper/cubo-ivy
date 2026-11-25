// As posicoes "essencialmente diferentes": duas posicoes sao a mesma se uma
// simetria do Ivy leva uma na outra. As simetrias sao as 24 do cubo que levam
// o tetraedro dos cantos nele mesmo (12 rotacoes e 12 reflexoes).
//
// Contado de dois jeitos: orbita por orbita (cada posicao vai na menor imagem)
// e por Burnside (media dos pontos fixos), que so olha a estrutura de ciclos
// de cada simetria.

import { CANTOS, TAMANHO, indice, estadoDoIndice, buscaEmLargura, paridade } from './ivy.js'

function todasMatrizes() {
  const perms = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
  const ms = []
  for (const p of perms) {
    for (let s = 0; s < 8; s++) {
      const sinais = [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1]
      // linha i: coordenada i da imagem = sinais[i] * x[p[i]]
      ms.push({ p, sinais })
    }
  }
  return ms
}

function aplicaM(m, v) {
  return [0, 1, 2].map((i) => m.sinais[i] * v[m.p[i]])
}

function det(m) {
  let inv = 0
  for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) if (m.p[i] > m.p[j]) inv++
  return (inv & 1 ? -1 : 1) * m.sinais[0] * m.sinais[1] * m.sinais[2]
}

const chave = (v) => v.join(',')

// cada simetria como (permutacao dos cantos, permutacao das faces, det)
export function simetrias() {
  const idCanto = new Map(CANTOS.map((v, i) => [chave(v), i]))
  const lista = []
  for (const m of todasMatrizes()) {
    const canto = CANTOS.map((v) => idCanto.get(chave(aplicaM(m, v))))
    if (canto.some((x) => x === undefined)) continue
    const face = []
    for (let f = 0; f < 6; f++) {
      const v = [0, 0, 0]
      v[f >> 1] = f & 1 ? -1 : 1
      const w = aplicaM(m, v)
      const a = w.findIndex((x) => x !== 0)
      face.push(a * 2 + (w[a] > 0 ? 0 : 1))
    }
    lista.push({ canto, face, det: det(m) })
  }
  return lista
}

// a imagem de uma posicao pela simetria g (conjugacao: g . X . g^-1)
export function conjuga(g, e) {
  const torcao = [0, 0, 0, 0]
  for (let c = 0; c < 4; c++) torcao[g.canto[c]] = g.det > 0 ? e.torcao[c] : (3 - e.torcao[c]) % 3
  const petalas = new Array(6)
  for (let f = 0; f < 6; f++) petalas[g.face[f]] = g.face[e.petalas[f]]
  return { torcao, petalas }
}

export function orbitas() {
  const G = simetrias()
  const { dist } = buscaEmLargura()
  let classes = 0
  let distanciaQuebrada = 0
  const porDistancia = []
  for (let i = 0; i < TAMANHO; i++) {
    if (dist[i] < 0) continue
    const e = estadoDoIndice(i)
    let menor = i
    for (const g of G) {
      const j = indice(conjuga(g, e))
      if (dist[j] !== dist[i]) distanciaQuebrada++
      if (j < menor) menor = j
    }
    if (menor === i) {
      classes++
      porDistancia[dist[i]] = (porDistancia[dist[i]] || 0) + 1
    }
  }
  return { simetrias: G.length, classes, porDistancia, distanciaQuebrada }
}

// Burnside: pontos fixos de cada simetria contados sem olhar a busca.
// Uma posicao e fixa por g quando a torcao e constante nos ciclos de cantos de
// g (com o sinal trocado nas reflexoes) e a permutacao das petalas comuta com
// a permutacao das faces de g. Conta so permutacoes pares, que e a unica
// restricao do Ivy.
export function burnside() {
  const G = simetrias()
  const perms = []
  const p = [0, 1, 2, 3, 4, 5]
  const gera = (k) => {
    if (k === 6) { if (!paridade(p)) perms.push(p.slice()); return }
    for (let i = k; i < 6; i++) { [p[k], p[i]] = [p[i], p[k]]; gera(k + 1); [p[k], p[i]] = [p[i], p[k]] }
  }
  gera(0)
  let soma = 0
  const fixos = []
  for (const g of G) {
    let petalas = 0
    for (const q of perms) {
      let ok = true
      for (let f = 0; f < 6 && ok; f++) if (q[g.face[f]] !== g.face[q[f]]) ok = false
      if (ok) petalas++
    }
    let torcoes = 0
    for (let t = 0; t < 81; t++) {
      const tor = [Math.floor(t / 27) % 3, Math.floor(t / 9) % 3, Math.floor(t / 3) % 3, t % 3]
      let ok = true
      for (let c = 0; c < 4 && ok; c++) {
        const img = g.det > 0 ? tor[c] : (3 - tor[c]) % 3
        if (tor[g.canto[c]] !== img) ok = false
      }
      if (ok) torcoes++
    }
    fixos.push(petalas * torcoes)
    soma += petalas * torcoes
  }
  return { classes: soma / G.length, fixos }
}
