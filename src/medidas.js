// Uma funcao por tabela do README. Cada uma calculada uma vez so.

import { TAMANHO, buscaEmLargura, estadoDoIndice, indice } from './ivy.js'
import { larguraPelaGeometria, leEstado } from './juiz.js'
import { orbitas, burnside } from './simetria.js'

const guarda = (f) => { let v; return () => (v === undefined ? (v = f()) : v) }

export const distancias = guarda(() => {
  const { porDistancia, total, deus } = buscaEmLargura()
  let soma = 0
  porDistancia.forEach((n, d) => { soma += n * d })
  return {
    porDistancia,
    total,
    deus,
    media: soma / total,
    semRepetir: porDistancia.map((_, d) => (d === 0 ? 1 : 8 * 6 ** (d - 1))),
  }
})

// histograma de distancia de um subconjunto de posicoes
function histograma(filtro) {
  const { dist } = buscaEmLargura()
  const h = []
  let n = 0
  for (let i = 0; i < TAMANHO; i++) {
    if (dist[i] < 0) continue
    const e = estadoDoIndice(i)
    if (!filtro(e)) continue
    h[dist[i]] = (h[dist[i]] || 0) + 1
    n++
  }
  for (let d = 0; d < h.length; d++) h[d] = h[d] || 0
  return { n, porDistancia: h }
}

const petalasNoLugar = (e) => e.petalas.every((p, f) => p === f)
const cantosNoLugar = (e) => e.torcao.every((t) => t === 0)
const torcidos = (e) => e.torcao.filter((t) => t).length

// so os cantos torcidos, petalas no lugar
export const soTorcao = guarda(() => {
  const r = histograma(petalasNoLugar)
  const { dist } = buscaEmLargura()
  // um canto so torcido, o resto no lugar
  const umCanto = []
  for (let c = 0; c < 4; c++) for (const t of [1, 2]) {
    const torcao = [0, 0, 0, 0]
    torcao[c] = t
    umCanto.push(dist[indice({ torcao, petalas: [0, 1, 2, 3, 4, 5] })])
  }
  return { ...r, umCanto }
})

// so as petalas embaralhadas, cantos sem torcao
export const soPetalas = guarda(() => histograma(cantosNoLugar))

// as antipodas, por quantos cantos estao torcidos
export const antipodas = guarda(() => {
  const { dist, deus } = buscaEmLargura()
  const porTorcidos = [0, 0, 0, 0, 0]
  const maxPorTorcidos = [0, 0, 0, 0, 0]
  const totalPorTorcidos = [0, 0, 0, 0, 0]
  for (let i = 0; i < TAMANHO; i++) {
    if (dist[i] < 0) continue
    const k = torcidos(estadoDoIndice(i))
    totalPorTorcidos[k]++
    if (dist[i] > maxPorTorcidos[k]) maxPorTorcidos[k] = dist[i]
    if (dist[i] === deus) porTorcidos[k]++
  }
  return { porTorcidos, maxPorTorcidos, totalPorTorcidos }
})

export const classes = guarda(() => {
  const o = orbitas()
  const b = burnside()
  return { ...o, burnside: b.classes, fixos: b.fixos }
})

// O juiz posicao por posicao, e o controle: a mesma leitura com o sentido da
// torcao trocado, para provar que a comparacao enxerga um erro de sentido.
export const conferencia = guarda(() => {
  const { dist } = buscaEmLargura()
  const j = larguraPelaGeometria()
  let iguais = 0, diferentes = 0, controle = 0
  for (const [k, d] of j.visto) {
    const e = leEstado(k.split(',').map(Number))
    if (dist[indice(e)] === d) iguais++
    else diferentes++
    const trocado = { torcao: e.torcao.map((t) => (3 - t) % 3), petalas: e.petalas }
    if (dist[indice(trocado)] !== d) controle++
  }
  return { juiz: j.porDistancia, total: j.total, iguais, diferentes, controle }
})
