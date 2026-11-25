// O Ivy Cube em coordenadas.
//
// O Ivy e um Skewb com so metade dos eixos: gira em volta de 4 vertices do
// cubo, os 4 que formam um tetraedro. Cada vertice desses e um canto que
// nunca sai do lugar, so torce. Cada face tem uma petala no meio, e as 6
// petalas andam: o giro de um canto leva junto as 3 petalas das faces que
// encostam nele.
//
// Estado = a torcao de cada canto (0, 1 ou 2) + qual petala esta em cada face.

// Os quatro cantos que giram: os vertices com produto dos sinais +1.
export const CANTOS = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
]

// Face f: eixo = f >> 1, sinal = f & 1 ? -1 : +1.
// 0:+x 1:-x 2:+y 3:-y 4:+z 5:-z
export const FACES = ['+x', '-x', '+y', '-y', '+z', '-z']

const face = (eixo, sinal) => eixo * 2 + (sinal > 0 ? 0 : 1)

// O giro de +120 graus em volta do canto (sx, sy, sz) leva a face x dele na
// face y, a y na z e a z na x. Para (1,1,1) isso e o x -> y -> z de sempre; os
// outros tres cantos sao (1,1,1) girado de 180 graus em volta de um eixo, que
// leva sinal em sinal sem trocar o sentido do giro.
export function cicloDoCanto(c) {
  const [sx, sy, sz] = CANTOS[c]
  return [face(0, sx), face(1, sy), face(2, sz)]
}

// Os 8 giros: canto c, sentido +1 ou -1.
export const GIROS = []
for (let c = 0; c < 4; c++) for (const s of [1, -1]) GIROS.push({ canto: c, sentido: s, nome: 'ABCD'[c] + (s > 0 ? '' : "'") })

export function resolvido() {
  return { torcao: [0, 0, 0, 0], petalas: [0, 1, 2, 3, 4, 5] }
}

export function aplica(estado, giro) {
  const { canto, sentido } = giro
  const torcao = estado.torcao.slice()
  const petalas = estado.petalas.slice()
  torcao[canto] = (torcao[canto] + (sentido > 0 ? 1 : 2)) % 3
  const [a, b, c] = cicloDoCanto(canto)
  const p = estado.petalas
  if (sentido > 0) {
    // a -> b -> c -> a
    petalas[b] = p[a]; petalas[c] = p[b]; petalas[a] = p[c]
  } else {
    petalas[a] = p[b]; petalas[b] = p[c]; petalas[c] = p[a]
  }
  return { torcao, petalas }
}

// ---------- indice: torcao em base 3 (81) x posto da permutacao (720)

const FAT = [1, 1, 2, 6, 24, 120, 720]

export function postoPerm(p) {
  let r = 0
  const n = p.length
  for (let i = 0; i < n; i++) {
    let menores = 0
    for (let j = i + 1; j < n; j++) if (p[j] < p[i]) menores++
    r += menores * FAT[n - 1 - i]
  }
  return r
}

export function permDoPosto(r, n = 6) {
  const livres = []
  for (let i = 0; i < n; i++) livres.push(i)
  const p = []
  for (let i = 0; i < n; i++) {
    const f = FAT[n - 1 - i]
    const k = Math.floor(r / f)
    r %= f
    p.push(livres.splice(k, 1)[0])
  }
  return p
}

export const TAMANHO = 81 * 720

export function indice(e) {
  const t = ((e.torcao[0] * 3 + e.torcao[1]) * 3 + e.torcao[2]) * 3 + e.torcao[3]
  return t * 720 + postoPerm(e.petalas)
}

export function estadoDoIndice(i) {
  let t = Math.floor(i / 720)
  const petalas = permDoPosto(i % 720)
  const torcao = [0, 0, 0, 0]
  for (let k = 3; k >= 0; k--) { torcao[k] = t % 3; t = Math.floor(t / 3) }
  return { torcao, petalas }
}

export function paridade(p) {
  let inv = 0
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) if (p[i] > p[j]) inv++
  return inv & 1
}

// ---------- busca em largura no espaco de indices

let _tabela = null

// Tabela de giros: proximo[i * 8 + g] = indice depois do giro g.
export function tabelaDeGiros() {
  if (_tabela) return _tabela
  const t = new Int32Array(TAMANHO * 8).fill(-1)
  for (let i = 0; i < TAMANHO; i++) {
    const e = estadoDoIndice(i)
    for (let g = 0; g < 8; g++) t[i * 8 + g] = indice(aplica(e, GIROS[g]))
  }
  _tabela = t
  return t
}

let _largura = null

export function buscaEmLargura() {
  if (_largura) return _largura
  const prox = tabelaDeGiros()
  const dist = new Int8Array(TAMANHO).fill(-1)
  const inicio = indice(resolvido())
  dist[inicio] = 0
  let fila = [inicio]
  const porDistancia = [1]
  while (fila.length) {
    const nova = []
    for (const i of fila) {
      for (let g = 0; g < 8; g++) {
        const j = prox[i * 8 + g]
        if (dist[j] < 0) { dist[j] = dist[i] + 1; nova.push(j) }
      }
    }
    if (nova.length) porDistancia.push(nova.length)
    fila = nova
  }
  let total = 0
  for (const n of porDistancia) total += n
  _largura = { dist, porDistancia, total, deus: porDistancia.length - 1 }
  return _largura
}

// Um caminho mais curto ate o resolvido, descendo a distancia.
export function resolve(estado) {
  const { dist } = buscaEmLargura()
  const prox = tabelaDeGiros()
  let i = indice(estado)
  if (dist[i] < 0) return null
  const caminho = []
  while (dist[i] > 0) {
    let achou = false
    for (let g = 0; g < 8; g++) {
      const j = prox[i * 8 + g]
      if (dist[j] === dist[i] - 1) { caminho.push(GIROS[g].nome); i = j; achou = true; break }
    }
    if (!achou) throw new Error('distancia sem descida')
  }
  return caminho
}

export function aplicaSequencia(estado, nomes) {
  let e = estado
  for (const n of nomes) {
    const g = GIROS.find((x) => x.nome === n)
    if (!g) throw new Error('giro desconhecido: ' + n)
    e = aplica(e, g)
  }
  return e
}
