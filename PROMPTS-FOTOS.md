# Prompts para gerar as fotos do site

As fotos atuais servem de ilustração. As dos cartões de bebidas e acompanhamentos vieram da colagem e são pequenas (cerca de 220 px), por isso ficam um pouco moles em telas grandes. Os prompts abaixo servem para gerar fotos novas no mesmo estilo e substituir as atuais.

Se a loja tiver fotos reais dos produtos, use as reais. Para bebidas de marca (Coca-Cola, Guaraná), use foto real ou a imagem oficial do fornecedor, porque imagem gerada com logotipo de marca pode dar problema.

## Estilo comum

Cole este trecho no início de cada prompt para as fotos combinarem entre si:

> Fotografia gastronômica profissional e realista, para o cardápio de uma hamburgueria. Fundo escuro de salão à noite, fora de foco, com luzes âmbar desfocadas. Bancada de madeira escura e gasta. Luz principal suave e quente vinda do alto à esquerda, com contraluz leve marcando as bordas do alimento. Pretos profundos, cores quentes e naturais. Lente 85 mm, f/2.8, produto nítido e fundo bem desfocado. Sem pessoas, sem mãos, sem texto, sem logotipo, sem marca d'água e sem embalagem com marca.

## Fotos

### 1. Destaque: Duplo Cheddar
- Arquivo: `img/destaque-duplo-cheddar.webp`
- Tamanho: 1290 × 1080 px (proporção 6:5)

> Hambúrguer duplo em close, ângulo de 45 graus, levemente de cima, ocupando quase todo o quadro. Pão com gergelim dourado e brilhante, alface crespa, rodelas de tomate, cebola roxa, duas carnes grelhadas de 120 g com cheddar derretendo e escorrendo entre elas, maionese aparecendo na base. Vapor subindo do lanche. Nenhum outro objeto em cena.

### 2. Faixa do combo
- Arquivos: `img/combo-1200.webp` (1200 × 800 px) e `img/combo-720.webp` (720 × 480 px), mesma foto
- No computador, o terço esquerdo da foto some no fundo da faixa. Mantenha o lanche e o copo nos dois terços da direita.

> Combo de hamburgueria sobre uma tábua de madeira: hambúrguer com cheddar em primeiro plano, batata frita palito crocante ao lado esquerdo e copo de vidro com refrigerante de cola, gelo e gotas de condensação ao lado direito, copo sem marca. Composição horizontal com o combo nos dois terços da direita.

### 3. Batata frita com cheddar
- Arquivo: `img/batata-cheddar.webp`
- Tamanho: 600 × 600 px (quadrada)

> Porção de batata frita palito, dourada e crocante, sobre uma tábua de madeira, com um pote preto de molho cheddar cremoso na frente. Vista em ângulo de 45 graus.

### 4. Anéis de cebola
- Arquivo: `img/aneis-cebola.webp`
- Tamanho: 600 × 600 px

> Porção de anéis de cebola empanados, dourados e crocantes, empilhados sobre a bancada de madeira, com algumas migalhas de empanado em volta. Vista em ângulo de 45 graus.

### 5, 6 e 7. Milkshakes
Gere as três com o mesmo copo, o mesmo ângulo e o mesmo enquadramento.

- Chocolate: `img/milkshake.webp` (a atual)
- Morango: `img/milkshake-morango.webp`
- Baunilha: `img/milkshake-baunilha.webp`
- Tamanho: 600 × 600 px

> Copo alto de vidro com milkshake de 400 ml, coberto de chantilly, centralizado sobre a bancada. Vista frontal, levemente de cima.

Acrescente o sabor ao final do prompt:
- Chocolate: "milkshake de chocolate, calda de chocolate escorrendo pelo copo, biscoito recheado de chocolate em cima do chantilly e outro apoiado ao lado do copo".
- Morango: "milkshake rosa de morango, calda de morango escorrendo pelo copo, um morango fresco em cima do chantilly".
- Baunilha: "milkshake de baunilha cor creme, com pontinhos de baunilha, uma fava de baunilha apoiada ao lado do copo".

### 8. Refrigerante
- Arquivo: `img/refrigerante.webp`
- Tamanho: 600 × 600 px

> Copo de vidro com refrigerante, muito gelo e gotas de condensação por fora, centralizado sobre a bancada. Vista frontal. Copo sem marca.

## Depois de gerar

1. Converta para WebP com qualidade perto de 82. Programas como Squoosh (squoosh.app) fazem isso no navegador.
2. Salve na pasta `img/` com o nome indicado, substituindo a foto atual.
3. Se a foto nova tiver outro tamanho em pixels, atualize `width` e `height` da tag `<img>` no `index.html`.
4. Para os sabores de milkshake, o cartão troca a foto quando a pessoa escolhe o sabor. Coloque `data-foto` e `data-foto-alt` no botão do sabor, no `index.html`:

```html
<input type="radio" name="sabor-milkshake" data-item="milkshake-morango" ...
       data-foto="img/milkshake-morango.webp"
       data-foto-alt="Milkshake de morango com chantilly e calda de morango">
```

Sem `data-foto`, o cartão mostra a foto padrão dele (hoje, a de chocolate).
