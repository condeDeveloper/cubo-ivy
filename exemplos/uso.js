import { resolvido, aplicaSequencia, resolve, buscaEmLargura } from '../src/index.js'

const { total, deus } = buscaEmLargura()
console.log(`${total} posicoes, nenhuma a mais de ${deus} giros`)

// torce o canto A sozinho: quanto custa desfazer?
const torcido = { torcao: [1, 0, 0, 0], petalas: [0, 1, 2, 3, 4, 5] }
console.log('canto A torcido sozinho:', resolve(torcido).join(' '))

const embaralhado = aplicaSequencia(resolvido(), ['A', 'B', "C'", 'D', 'A', "B'"])
console.log('embaralhado:', JSON.stringify(embaralhado))
console.log('resolve em:', resolve(embaralhado).join(' '))
