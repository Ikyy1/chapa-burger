# Site da hamburgueria (demonstração)

Site de uma página: cardápio com preços, comanda montada no próprio site e envio do pedido pelo WhatsApp. HTML, CSS e JavaScript puros, sem instalação e sem etapa de build.

Ordem das seções: primeira tela com vídeo, destaque de um lanche (Duplo Cheddar), faixa do combo, cardápio (lanches, combo, bebidas e acompanhamentos) com a comanda ao lado, como pedir, horário e endereço.

## Como abrir

Na pasta `site/`, rode um servidor local e abra o endereço no navegador:

```
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000`. Abrir o `index.html` direto (duplo clique) também funciona, mas os vídeos e o salvamento da comanda se comportam melhor com o servidor.

Para publicar, envie a pasta `site/` inteira para qualquer hospedagem de site estático (Netlify, Vercel, GitHub Pages, Hostinger etc.).

## Onde mudar cada coisa

| O quê | Onde |
|---|---|
| Número do WhatsApp da loja | `js/config.js`, campo `whatsapp` (só dígitos, com 55 e DDD) |
| Nome da loja | `js/config.js` (vai na mensagem do pedido) e no `index.html`: procure por `Chapa Burger` e `Chapa <span>burger</span>` |
| Itens e preços | `index.html`, cada `<li class="item" ...>`. O preço que vale é o `data-preco` (com ponto: `29.90`). O texto exibido é atualizado a partir dele |
| Novo item | Copie um `<li class="item">` da mesma categoria e troque `data-item` (identificador único, só letras e hífen), `data-nome`, `data-preco`, foto e textos |
| Lanche em destaque | `index.html`, seção `id="destaque"`. Preço e botão seguem o item do cardápio indicado em `data-valor-de` e `data-controle`. Para destacar outro lanche, troque esses dois atributos pelo `data-item` dele e reescreva nome, descrição e foto. Se mudar a descrição do Duplo Cheddar no cardápio, mude aqui também |
| Faixa do combo | `index.html`, seção `class="promo"`. O preço vem do item `combo` do cardápio. O botão "Explore os combos" leva ao combo dentro do cardápio |
| Bebidas e acompanhamentos | `index.html`, seção `id="acompanhamentos"`. Batata e anéis são itens comuns. Milkshake e refrigerante são cartões com sabores: cada sabor é um botão de escolha com `data-item`, `data-nome` e `data-preco`. O preço e o Adicionar seguem o sabor marcado. Para outro sabor, copie uma linha `<label class="sabor">` |
| Horários | `index.html`, tabela `horario`: `data-abre` e `data-fecha` em cada dia (0 = domingo … 6 = sábado). Sem `data-abre` = fechado. Fechar à meia-noite = `00:00`. O "Aberto agora / Fechado agora" é calculado sozinho |
| Endereço, área de entrega, Instagram | `index.html`, seção `id="onde"` (remova as etiquetas `exemplo` quando os dados forem reais) |
| Aviso de demonstração | `index.html`, `<p class="aviso-demo">` (apague na versão final) |
| Cores, fontes e espaçamentos | `css/estilo.css`, bloco `:root` no início |
| Tamanho do site em monitores grandes | `css/estilo.css`, regra `html { font-size: ... }`. Até 1366 px fica em 16 px. Em 1920 px chega a ~26 px, e o site inteiro cresce junto. Para deixar menor, diminua o `175%` (limite) ou o `1.8382vw` |
| Fotos | `img/` (WebP). Mantenha a proporção: lanches 4:3, cartões de bebidas e acompanhamentos quadrados, destaque 6:5, faixa do combo 3:2. Prompts para gerar fotos novas no mesmo estilo: `PROMPTS-FOTOS.md` |
| Vídeo da primeira tela | `video/primeira-tela-larga.mp4` (computador, 1388×720) e `video/primeira-tela-celular.mp4` (688×516), com as imagens de mesmo nome em `img/` (aparecem antes do vídeo carregar) |
| Ambiente do fundo (luzes desfocadas) | `css/estilo.css`, bloco `body::before` |

## Como o pedido funciona

1. A pessoa toca em **Adicionar** e a comanda soma os itens (fica salva no navegador dela).
2. Em **Finalizar pedido**, informa nome, entrega ou retirada, endereço, pagamento (com troco, se for dinheiro) e observações.
3. **Enviar pedido pelo WhatsApp** abre a conversa da loja com a mensagem pronta. A pessoa confere e envia por lá. O site não envia nada sozinho.

Enquanto `whatsapp` estiver vazio em `js/config.js`, o site está em **modo demonstração**: mostra a mensagem que seria enviada e permite copiá-la, sem abrir o WhatsApp de ninguém.

A taxa de entrega não é calculada no site. A mensagem avisa que ela é confirmada pela loja.

## Vídeo da primeira tela

- Usa o vídeo `Camera_panning_across_burger_combo`. O logo "Burger Bros" foi apagado em todos os quadros.
- No computador, a cena cobre a tela inteira. O lado esquerdo foi estendido com uma continuação desfocada e escura para o texto, e o lanche fica à direita.
- No celular, a cena aparece inteira acima do texto (lanche e copo).
- O vídeo vai e volta (6,5 s para frente, 6,5 s de volta), então o loop não tem corte.
- Ele é baixado depois da página e entra por cima da imagem quando começa a tocar. Pausa quando sai da tela.
- Com "reduzir movimento" ligado no aparelho, ou em modo de economia de dados, fica só a imagem, com um botão para tocar.
- O botão no canto pausa e retoma o vídeo.

## Pendências para a versão definitiva

- [ ] Nome, logo e cores reais da marca (o nome "Chapa Burger" é provisório)
- [ ] Número do WhatsApp em `js/config.js`
- [ ] Cardápio real: itens, descrições, gramaturas e preços
- [ ] Milkshake de morango e de baunilha: sabores e preço (R$ 21,90, igual ao de chocolate) são provisórios. Confirmar se a loja vende
- [ ] Lanche do destaque: hoje é o Duplo Cheddar, escolhido porque o vídeo e a foto em close são dele. Trocar se a loja preferir outro
- [ ] "Combo it better": título pedido em inglês. Avaliar se combina com o público
- [ ] Endereço, área de entrega, horários e Instagram reais
- [ ] Fotos e vídeos dos produtos da casa. As atuais são imagens geradas por IA e servem só de ilustração. O logo "Burger Bros" foi apagado ou recortado delas. As fotos dos cartões de bebidas e acompanhamentos são pequenas (vieram da colagem). Ver `PROMPTS-FOTOS.md`
- [ ] Confirmar se a loja vende Coca-Cola, porque a marca aparece nas fotos e no cardápio
- [ ] Domínio definitivo, para incluir `og:image` (precisa de endereço completo) e, se fizer sentido, dados estruturados de restaurante com endereço real
- [ ] Opcional: link do iFood ou de outro app, se a loja usar

## Arquivos de origem que não foram usados

- `Gourmet_burger_close-up_detail_*.mp4` e o print "Descrição de fotografia gastronômica": têm a marca d'água de outro site (pyszneokazje.pl), então a imagem não é da loja.
- `Double_cheeseburger_steaming_*.mp4`: o vídeo não é usado, para o site ter um vídeo só. Ele traz a embalagem "BUAGER BROS" e um neon da marca nos primeiros segundos. A foto do destaque (`img/destaque-duplo-cheddar.webp`) é o último quadro dele, recortado sem o neon.
