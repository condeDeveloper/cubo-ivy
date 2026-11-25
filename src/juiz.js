// O juiz: o Ivy montado de adesivos no espaco, sem nada do ivy.js.
//
// Cada adesivo e um ponto na superficie do cubo [-1, 1]^3. O giro do canto v
// gira de 120 graus, pela formula de Rodrigues, todo adesivo do lado de v do
// corte, e o programa procura o adesivo que ficou no lugar. Se a rotacao nao
// cair exatamente num adesivo, ou se o resultado nao for uma permutacao, para
// com erro. Nenhuma tabela de giro e escrita a mao.

const VERTICES_A = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
]

function corDoPonto(p) {
  // a face e a coordenada que vale +-1 (as outras ficam dentro do cubo)
  for (let a = 0; a < 3; a++) if (Math.abs(Math.abs(p[a]) - 1) < 1e-9) return a * 2 + (p[a] > 0 ? 0 : 1)
  throw new Error('ponto fora da superficie')
}

export function adesivos() {
  const lista = []
  // os 3 adesivos de cada canto: na face a do canto, perto do vertice
  for (const v of VERTICES_A) {
    for (let a = 0; a < 3; a++) {
      const p = v.map((x, k) => (k === a ? x : 0.6 * x))
      lista.push({ p, tipo: 'canto' })
    }
  }
  // a petala: o centro da face
  for (let a = 0; a < 3; a++) {
    for (const s of [1, -1]) {
      const p = [0, 0, 0]
      p[a] = s
      lista.push({ p, tipo: 'petala' })
    }
  }
  for (const x of lista) x.cor = corDoPonto(x.p)
  return lista
}

function rodrigues(p, k, ang) {
  const c = Math.cos(ang), s = Math.sin(ang)
  const kp = k[0] * p[0] + k[1] * p[1] + k[2] * p[2]
  const kx = [k[1] * p[2] - k[2] * p[1], k[2] * p[0] - k[0] * p[2], k[0] * p[1] - k[1] * p[0]]
  return [0, 1, 2].map((i) => p[i] * c + kx[i] * s + k[i] * kp * (1 - c))
}

// permutacao de adesivos de cada um dos 8 giros: destino[i] = para onde vai o adesivo i
export function girosPelaGeometria() {
  const ad = adesivos()
  const giros = []
  for (const v of VERTICES_A) {
    const n = Math.sqrt(3)
    const k = v.map((x) => x / n)
    for (const sentido of [1, -1]) {
      const destino = []
      for (let i = 0; i < ad.length; i++) {
        const p = ad[i].p
        const lado = p[0] * v[0] + p[1] * v[1] + p[2] * v[2]
        if (lado <= 0.5) { destino.push(i); continue }
        const q = rodrigues(p, k, (sentido * 2 * Math.PI) / 3)
        let melhor = -1
        for (let j = 0; j < ad.length; j++) {
          const d = Math.hypot(q[0] - ad[j].p[0], q[1] - ad[j].p[1], q[2] - ad[j].p[2])
          if (d < 1e-9) melhor = j
        }
        if (melhor < 0) throw new Error('rotacao nao caiu num adesivo')
        destino.push(melhor)
      }
      if (new Set(destino).size !== ad.length) throw new Error('giro nao e permutacao')
      giros.push(destino)
    }
  }
  return giros
}

export function estadoResolvido() {
  return adesivos().map((a) => a.cor)
}

export function aplicaGeometria(cores, destino) {
  const nova = new Array(cores.length)
  for (let i = 0; i < cores.length; i++) nova[destino[i]] = cores[i]
  return nova
}

// Busca em largura com as cores dos adesivos como chave de um Map.
export function larguraPelaGeometria() {
  const giros = girosPelaGeometria()
  const ini = estadoResolvido()
  const visto = new Map([[ini.join(','), 0]])
  let fila = [ini]
  const porDistancia = [1]
  let d = 0
  while (fila.length) {
    d++
    const nova = []
    for (const e of fila) {
      for (const g of giros) {
        const f = aplicaGeometria(e, g)
        const chave = f.join(',')
        if (!visto.has(chave)) { visto.set(chave, d); nova.push(f) }
      }
    }
    if (nova.length) porDistancia.push(nova.length)
    fila = nova
  }
  return { porDistancia, total: visto.size, visto }
}

// Le, das cores dos adesivos, o que o ivy.js chama de estado: a petala que
// esta em cada face e a torcao de cada canto.
export function leEstado(cores) {
  const ad = adesivos()
  const petalas = new Array(6)
  const torcao = [0, 0, 0, 0]
  for (let i = 0; i < ad.length; i++) {
    if (ad[i].tipo === 'petala') petalas[ad[i].cor] = cores[i]
  }
  for (let c = 0; c < 4; c++) {
    // os adesivos do canto c sao 3c, 3c+1, 3c+2 (faces x, y, z dele). No
    // adesivo da face x, a cor e a da face x, y ou z do canto: k = 0, 1, 2.
    const corX = cores[3 * c]
    const k = [0, 1, 2].findIndex((j) => ad[3 * c + j].cor === corX)
    if (k < 0) throw new Error('canto com cor estranha')
    // Um giro +120 leva o adesivo z para a face x: k = 2 depois de um giro.
    torcao[c] = (3 - k) % 3
  }
  return { torcao, petalas }
}
