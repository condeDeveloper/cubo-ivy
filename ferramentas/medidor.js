// node ferramentas/medidor.js [distancias|torcao|petalas|antipodas|classes|juiz]
// Imprime as tabelas do README. Sem argumento, todas.
import * as M from '../src/medidas.js'

const fmt = (n) => n.toLocaleString('pt-BR')
const qual = process.argv[2]
const quer = (t) => !qual || qual === t

if (quer('distancias')) {
  const d = M.distancias()
  console.log('## giros ate o resolvido')
  console.log('giros | posicoes | 8*6^(d-1)')
  d.porDistancia.forEach((n, i) => console.log(`${i} | ${fmt(n)} | ${i ? fmt(d.semRepetir[i]) : ''}`))
  console.log(`total ${fmt(d.total)}, numero de Deus ${d.deus}, media ${d.media.toFixed(4)}`)
}
if (quer('torcao')) {
  const t = M.soTorcao()
  console.log('## so os cantos torcidos (petalas no lugar)')
  console.log(`${t.n} posicoes; por distancia: ${t.porDistancia.join(', ')}`)
  console.log(`um canto so torcido: ${t.umCanto.join(', ')} giros`)
}
if (quer('petalas')) {
  const p = M.soPetalas()
  console.log('## so as petalas (cantos sem torcao)')
  console.log(`${p.n} posicoes; por distancia: ${p.porDistancia.join(', ')}`)
}
if (quer('antipodas')) {
  const a = M.antipodas()
  console.log('## por numero de cantos torcidos')
  console.log('torcidos | posicoes | pior | no extremo')
  for (let k = 0; k <= 4; k++) console.log(`${k} | ${fmt(a.totalPorTorcidos[k])} | ${a.maxPorTorcidos[k]} | ${a.porTorcidos[k]}`)
}
if (quer('classes')) {
  const c = M.classes()
  console.log('## posicoes essencialmente diferentes')
  console.log(`${c.simetrias} simetrias; orbitas ${fmt(c.classes)}, Burnside ${fmt(c.burnside)}`)
  console.log(`classes por distancia: ${c.porDistancia.join(', ')}`)
  console.log(`imagens com distancia diferente: ${c.distanciaQuebrada}`)
}
if (quer('juiz')) {
  const j = M.conferencia()
  console.log('## o juiz pela geometria')
  console.log(`juiz: ${j.juiz.join(', ')} (${fmt(j.total)})`)
  console.log(`posicao por posicao: ${fmt(j.iguais)} iguais, ${j.diferentes} diferentes`)
  console.log(`controle (sentido da torcao trocado): ${fmt(j.controle)} diferentes`)
}
