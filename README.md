# Cubo Ivy

O Ivy Cube varrido inteiro por busca em largura, em Node puro, sem dependência nenhuma. O Ivy é um Skewb com metade dos eixos: gira em volta de só 4 dos 8 vértices do cubo, os 4 de um tetraedro. Esses 4 cantos nunca saem do lugar, só torcem; as 6 pétalas do meio das faces é que andam, três de cada vez.

---

## Os quatro achados

**1. São 29.160 posições, e nenhuma está a mais de 8 giros.** A busca a partir do resolvido alcança exatamente `81 × 360` posições: a torção dos quatro cantos é **livre** (3⁴) e a única restrição é que as pétalas só sofrem permutação **par** (6!/2). Só **110** posições estão no extremo, e a distância média é **5,74** giros.

**2. As piores posições não torcem canto nenhum.** Das 110 posições a 8 giros, **40 têm os quatro cantos no lugar**, só com as pétalas trocadas. Nenhuma tem exatamente um ou dois cantos torcidos: as outras são 8 com três e 62 com os quatro.

**3. Torcer um canto sozinho custa 7 giros.** Com as pétalas no lugar há 81 posições, e nenhuma delas, fora a resolvida, fica a menos de **6** giros: são 32 a 6, 32 a 7 e 16 a 8. Cada um dos oito "um canto torcido, todo o resto resolvido" custa exatamente 7, por exemplo `A B A' B' C' A' C`.

**4. São 1.260 posições essencialmente diferentes.** Juntando as posições que uma simetria do Ivy leva uma na outra (as 24 simetrias do cubo que preservam o tetraedro dos cantos, 12 rotações e 12 reflexões), sobram **1.260** classes, contadas órbita por órbita e por Burnside, sem um de diferença. No extremo são só **11**.

---

## As tabelas

Todos os números saem de `node ferramentas/medidor.js` e estão presos em `testes/medidas.test.js`.

### Giros até o resolvido

| giros | posições | 8·6^(d−1) | classes |
| --- | --- | --- | --- |
| 0 | 1 | | 1 |
| 1 | 8 | 8 | 1 |
| 2 | 48 | 48 | 2 |
| 3 | 288 | 288 | 12 |
| 4 | 1.640 | **1.728** | 69 |
| 5 | 7.582 | | 323 |
| 6 | 15.262 | | 647 |
| 7 | 4.221 | | 194 |
| 8 | **110** | | **11** |

Até 3 giros cada sequência nova cai numa posição nova (8 giros, depois 6 que não desfazem o anterior). No 4º giro aparecem as primeiras coincidências: faltam 88.

### Pelo número de cantos torcidos

| cantos torcidos | posições | pior | no extremo |
| --- | --- | --- | --- |
| 0 | 360 | 8 | **40** |
| 1 | 2.880 | 7 | 0 |
| 2 | 8.640 | 7 | 0 |
| 3 | 11.520 | 8 | 8 |
| 4 | 5.760 | 8 | 62 |

### Só um dos lados embaralhado

| | posições | por distância (0, 1, 2, ...) |
| --- | --- | --- |
| só a torção (pétalas no lugar) | 81 | 1, 0, 0, 0, 0, 0, 32, 32, 16 |
| só as pétalas (cantos sem torção) | 360 | 1, 0, 0, 0, 32, 0, 248, 39, 40 |

Embaralhar só as pétalas nunca dá uma posição a 5 giros.

---

## Os juízes

**A geometria.** `src/juiz.js` não importa nada do núcleo. Ele monta o Ivy com 18 adesivos no espaço (3 em cada canto, 1 em cada pétala) e faz cada giro girando os pontos de 120°, pela fórmula de Rodrigues, em volta do eixo do canto. Para onde vai cada adesivo é achado procurando o adesivo que ficou no lugar; se a rotação não cair exatamente num adesivo, ou o resultado não for permutação, ele para com erro. A busca dele usa as cores dos adesivos como chave de um `Map`.

**Posição por posição.** As 29.160 posições do juiz são lidas de volta para coordenadas (pétala em cada face, torção de cada canto), e a distância dele bate com a do núcleo em **todas**.

**O controle.** A mesma comparação com o sentido da torção trocado discorda em **15.788** posições. É a prova de que a comparação enxerga um erro de sentido. Um juiz que concorda sempre só vale alguma coisa se dá para vê-lo discordar.

**Burnside contra órbitas.** As 1.260 classes saem de dois jeitos: varrendo as órbitas (cada posição contra suas 24 imagens) e pela média de pontos fixos de Burnside, que só olha os ciclos de cada simetria e não usa a busca. As 24 imagens de cada posição têm sempre a mesma distância.

---

## O que as medidas me corrigiram

Nada quebrou neste projeto: o núcleo, a geometria e as duas contagens de classes concordaram de primeira, e não vou inventar um erro para preencher a seção.

O que fiz por desconfiança foi o controle. Um juiz que concorda desde a primeira rodada pode estar medindo nada, então medi a mesma comparação com a torção lida ao contrário. Ela discorda em mais da metade das posições, então a concordância não é de graça.

---

## Como usar

Node 20 ou mais novo. Sem dependência.

```bash
npm test
npm run medir
node exemplos/uso.js
```

```js
import { buscaEmLargura, resolve } from 'cubo-ivy'

buscaEmLargura().porDistancia       // [1, 8, 48, 288, 1640, 7582, 15262, 4221, 110]
resolve({ torcao: [1, 0, 0, 0], petalas: [0, 1, 2, 3, 4, 5] })
// [ 'A', 'B', "A'", "B'", "C'", "A'", 'C' ]
```

## Os arquivos

- `src/ivy.js`: o estado em coordenadas, os 8 giros, o índice, a busca e o `resolve`.
- `src/juiz.js`: os adesivos no espaço, os giros pela rotação e a busca pelas cores.
- `src/simetria.js`: as 24 simetrias, as órbitas e Burnside.
- `src/medidas.js`: as tabelas do README, cada uma calculada uma vez só.
- `ferramentas/medidor.js`: imprime as tabelas.
- `exemplos/uso.js`: o pacote em uso.
- `testes/`: 17 testes, com os números do README presos.

## Licença

MIT.
