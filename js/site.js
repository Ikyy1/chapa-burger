// Comanda, envio do pedido, horário de funcionamento e navegação.
// Itens, preços e horários são lidos do index.html (atributos data-*).
(() => {
  "use strict";

  const LOJA = Object.assign({ nome: "", whatsapp: "" }, window.LOJA);
  const CHAVE = "comanda:" + (LOJA.nome || "loja");
  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const reais = (centavos) => brl.format(centavos / 100);
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
  const esc = (txt) => String(txt).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const ICONE = {
    mais: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    menos: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/></svg>',
    tocar: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>',
    pausar: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  };

  const anuncio = $("[data-anuncio]");
  function anunciar(texto) {
    anuncio.textContent = "";
    // pequeno atraso para leitores de tela perceberem a troca de texto
    setTimeout(() => { anuncio.textContent = texto; }, 60);
  }

  $$("[data-loja-nome]").forEach((el) => { if (LOJA.nome) el.textContent = LOJA.nome; });

  /* ---------------------------------------------------------------------
     Cardápio e comanda
     --------------------------------------------------------------------- */

  const itens = new Map();
  $$("[data-item]").forEach((el) => {
    const centavos = Math.round(parseFloat(el.dataset.preco) * 100);
    if (!Number.isFinite(centavos)) return;
    itens.set(el.dataset.item, { id: el.dataset.item, nome: el.dataset.nome, centavos, el });
    // o preço exibido sempre segue o data-preco, inclusive no destaque e na faixa do combo
    [$("[data-valor]", el), ...$$(`[data-valor-de="${el.dataset.item}"]`)].forEach((valor) => {
      if (valor) valor.textContent = reais(centavos);
    });
  });

  let comanda = carregar(); // { idDoItem: quantidade }, na ordem em que foram adicionados

  function carregar() {
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || "{}");
      return Object.fromEntries(
        Object.entries(salvo).filter(([id, q]) => itens.has(id) && Number.isInteger(q) && q > 0)
      );
    } catch {
      return {};
    }
  }

  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(comanda)); } catch { /* navegação privada */ }
  }

  function totais() {
    return Object.entries(comanda).reduce(
      (t, [id, q]) => ({ qtd: t.qtd + q, centavos: t.centavos + q * itens.get(id).centavos }),
      { qtd: 0, centavos: 0 }
    );
  }

  const plural = (n) => (n === 1 ? "1 item" : `${n} itens`);

  // Botão Adicionar ou seletor de quantidade de um item, desenhado em "alvo".
  // data-rotulo no alvo troca o texto do botão (ex.: "Adicionar à comanda").
  function controleDoItem(id, alvo) {
    if (!alvo) return;
    const q = comanda[id] || 0;
    const nome = esc(itens.get(id).nome);
    const rotulo = alvo.dataset.rotulo
      ? `${esc(alvo.dataset.rotulo)}<span class="sr">: ${nome}</span>`
      : `Adicionar<span class="sr"> ${nome}</span>`;
    alvo.innerHTML = q === 0
      ? `<button type="button" class="btn-add" data-acao="mais" data-id="${id}">${ICONE.mais}${rotulo}</button>`
      : `<div class="qtd" role="group" aria-label="Quantidade de ${nome}">
           <button type="button" data-acao="menos" data-id="${id}" aria-label="Tirar um ${nome}">${ICONE.menos}</button>
           <output>${q}</output>
           <button type="button" data-acao="mais" data-id="${id}" aria-label="Adicionar mais um ${nome}">${ICONE.mais}</button>
         </div>`;
  }

  // Cartões com sabor (milkshake, refrigerante): preço e botão seguem o sabor marcado
  const cartoesComSabor = $$("[data-sabores]");

  function desenharSabor(cartao) {
    const marcado = $("input:checked", cartao);
    const id = marcado.dataset.item;
    $("[data-valor]", cartao).textContent = reais(itens.get(id).centavos);
    controleDoItem(id, $(".item__acao", cartao));
    // foto do sabor, quando houver (data-foto e data-foto-alt no botão do sabor)
    const foto = $(".produto__foto", cartao);
    if (!foto.dataset.padrao) Object.assign(foto.dataset, { padrao: foto.getAttribute("src"), padraoAlt: foto.alt });
    const src = marcado.dataset.foto || foto.dataset.padrao;
    if (foto.getAttribute("src") !== src) {
      foto.src = src;
      foto.alt = marcado.dataset.foto ? marcado.dataset.fotoAlt || "" : foto.dataset.padraoAlt;
    }
  }

  cartoesComSabor.forEach((cartao) => {
    // abre no sabor que já está na comanda, se houver
    const naComanda = $$("input[data-item]", cartao).find((r) => comanda[r.dataset.item]);
    if (naComanda) naComanda.checked = true;
    cartao.addEventListener("change", () => desenharSabor(cartao));
  });

  const linhas = $("[data-linhas]");
  const vazia = $("[data-vazia]");
  const limpar = $("[data-limpar]");
  const totalEl = $("[data-total]");
  const contador = $("[data-contador]");
  const linkComanda = $(".topo__comanda");
  const barra = $("[data-barra]");
  const erroVazia = $("[data-erro-vazia]");

  function desenharComanda(novoId) {
    const ids = Object.keys(comanda);
    linhas.innerHTML = ids.map((id) => {
      const it = itens.get(id);
      const q = comanda[id];
      const nome = esc(it.nome);
      return `<li class="linha${id === novoId ? " linha--nova" : ""}">
          <span class="linha__qtd">${q}x</span>
          <span class="linha__nome">${nome}</span>
          <span class="linha__valor">${reais(q * it.centavos)}</span>
          <span class="linha__ctrl">
            <button type="button" class="mini" data-acao="menos" data-id="${id}" aria-label="Tirar um ${nome}">${ICONE.menos}</button>
            <button type="button" class="mini" data-acao="mais" data-id="${id}" aria-label="Adicionar mais um ${nome}">${ICONE.mais}</button>
            <button type="button" class="mini mini--texto" data-acao="remover" data-id="${id}">Remover<span class="sr"> ${nome}</span></button>
          </span>
        </li>`;
    }).join("");

    const { qtd, centavos } = totais();
    vazia.hidden = qtd > 0;
    limpar.hidden = qtd === 0;
    if (qtd > 0) erroVazia.hidden = true;
    totalEl.textContent = reais(centavos);
    contador.textContent = qtd;
    linkComanda.setAttribute("aria-label", `Comanda, ${plural(qtd)}`);
    $("[data-barra-qtd]").textContent = plural(qtd);
    $("[data-barra-total]").textContent = reais(centavos);
    atualizarBarra();
  }

  function desenhar(novoId) {
    itens.forEach((item) => controleDoItem(item.id, $(".item__acao", item.el)));
    $$("[data-controle]").forEach((alvo) => controleDoItem(alvo.dataset.controle, alvo));
    cartoesComSabor.forEach(desenharSabor);
    desenharComanda(novoId);
  }

  // Recoloca o foco no botão equivalente depois que os controles são redesenhados
  function devolverFoco(zona, id, acao) {
    if (!zona) return;
    const alvo = $(`[data-id="${id}"][data-acao="${acao}"]`, zona)
      || $(`[data-id="${id}"][data-acao]`, zona)
      || (zona.matches("[data-zona='comanda']") ? zona : null);
    if (alvo) alvo.focus();
  }

  function mudar(id, acao) {
    const it = itens.get(id);
    if (!it) return;
    const antes = comanda[id] || 0;
    let q = antes;
    if (acao === "mais") q = Math.min(antes + 1, 99);
    if (acao === "menos") q = antes - 1;
    if (acao === "remover") q = 0;
    if (q > 0) comanda[id] = q;
    else delete comanda[id];
    salvar();
    esconderDemo();
    desenhar(antes === 0 && q > 0 ? id : null);
    const { centavos } = totais();
    anunciar(q > 0
      ? `${it.nome}: ${q} na comanda. Total dos itens ${reais(centavos)}.`
      : `${it.nome} saiu da comanda. Total dos itens ${reais(centavos)}.`);
  }

  document.addEventListener("click", (ev) => {
    const botao = ev.target.closest("button[data-acao]");
    if (!botao) return;
    const zona = botao.closest("[data-zona]");
    const { id, acao } = botao.dataset;
    mudar(id, acao);
    // o botão clicado foi redesenhado; sem isto o foco do teclado se perderia
    devolverFoco(zona, id, acao);
  });

  limpar.addEventListener("click", () => {
    comanda = {};
    salvar();
    esconderDemo();
    desenhar();
    $("#comanda").focus();
    anunciar("Comanda limpa.");
  });

  /* Barra fixa no celular: aparece quando há itens e a comanda está fora da tela */
  const telaLarga = window.matchMedia("(min-width: 1024px)");
  let comandaNaTela = false;

  function atualizarBarra() {
    const mostrar = totais().qtd > 0 && !comandaNaTela && !telaLarga.matches;
    barra.hidden = !mostrar;
    document.body.classList.toggle("tem-barra", mostrar);
  }

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entradas) => {
      comandaNaTela = entradas[0].isIntersecting;
      atualizarBarra();
    }, { threshold: 0.15 }).observe($("#comanda"));
  }
  telaLarga.addEventListener("change", atualizarBarra);

  /* ---------------------------------------------------------------------
     Pedido pelo WhatsApp
     --------------------------------------------------------------------- */

  const dialogo = $("[data-dialogo]");
  const botaoFinalizar = $("[data-finalizar]");
  const form = $("[data-form]");
  const campoEndereco = $("[data-so-entrega]");
  const campoTroco = $("[data-so-dinheiro]");
  const demo = $("[data-demo]");
  const enviado = $("[data-enviado]");
  let ultimaMensagem = "";

  function desenharResumo() {
    $("[data-resumo]").innerHTML = Object.entries(comanda).map(([id, q]) => {
      const it = itens.get(id);
      return `<li><span>${q}x</span><span>${esc(it.nome)}</span><span>${reais(q * it.centavos)}</span></li>`;
    }).join("");
    $("[data-resumo-total]").textContent = reais(totais().centavos);
  }

  botaoFinalizar.addEventListener("click", () => {
    if (totais().qtd === 0) {
      erroVazia.textContent = "Adicione pelo menos um item do cardápio para finalizar.";
      erroVazia.hidden = false;
      return;
    }
    desenharResumo();
    esconderDemo();
    dialogo.showModal();
    form.nome.focus();
  });

  $("[data-fechar]").addEventListener("click", () => dialogo.close());
  // clique fora da janela (no fundo escurecido) também fecha
  dialogo.addEventListener("click", (ev) => { if (ev.target === dialogo) dialogo.close(); });
  dialogo.addEventListener("close", () => botaoFinalizar.focus());

  function atualizarCampos() {
    campoEndereco.hidden = form.receber.value !== "entrega";
    campoTroco.hidden = form.pagamento.value !== "Dinheiro";
  }

  function marcar(entrada, idErro, mensagem) {
    const erro = document.getElementById(idErro);
    erro.textContent = mensagem;
    erro.hidden = !mensagem;
    if (entrada) entrada.setAttribute("aria-invalid", mensagem ? "true" : "false");
  }

  function validar() {
    const entrega = form.receber.value === "entrega";
    const r = {
      nome: form.nome.value.trim(),
      entrega,
      endereco: form.endereco.value.trim(),
      pagamento: form.pagamento.value,
      troco: form.troco.value.trim(),
      obs: form.obs.value.trim(),
    };
    const erros = [];
    marcar(form.nome, "p-nome-erro", r.nome ? "" : "Informe seu nome para a loja identificar o pedido.");
    if (!r.nome) erros.push(form.nome);
    const faltaEndereco = entrega && !r.endereco;
    marcar(form.endereco, "p-endereco-erro", faltaEndereco ? "Informe rua, número e bairro para a entrega." : "");
    if (faltaEndereco) erros.push(form.endereco);
    marcar(null, "p-pagamento-erro", r.pagamento ? "" : "Escolha a forma de pagamento.");
    if (!r.pagamento) erros.push(form.querySelector('input[name="pagamento"]'));
    return { r, erros };
  }

  function formatarTroco(txt) {
    const n = parseFloat(txt.replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}\b)/g, "").replace(",", "."));
    return Number.isFinite(n) ? reais(Math.round(n * 100)) : txt;
  }

  function montarMensagem(r) {
    const { centavos } = totais();
    const partes = [
      `Olá! Quero fazer um pedido pelo site${LOJA.nome ? ` da ${LOJA.nome}` : ""}:`,
      "",
      ...Object.entries(comanda).map(([id, q]) => {
        const it = itens.get(id);
        return `${q}x ${it.nome} - ${reais(q * it.centavos)}`;
      }),
      "",
      `*Total dos itens: ${reais(centavos)}*`,
      r.entrega ? "(taxa de entrega a confirmar)" : "",
      "",
      `Nome: ${r.nome}`,
      r.entrega ? `Entrega em: ${r.endereco}` : "Vou retirar no balcão",
      `Pagamento: ${r.pagamento}${r.pagamento === "Dinheiro" && r.troco ? ` (troco para ${formatarTroco(r.troco)})` : ""}`,
      r.obs ? `Observações: ${r.obs}` : "",
    ];
    // remove linhas em branco repetidas
    return partes.filter((l, i) => !(l === "" && partes[i - 1] === "")).join("\n").trim();
  }

  function esconderDemo() {
    demo.hidden = true;
    enviado.hidden = true;
  }

  form.addEventListener("change", (ev) => {
    atualizarCampos();
    if (ev.target.name === "pagamento") marcar(null, "p-pagamento-erro", "");
  });

  form.addEventListener("input", (ev) => {
    const campo = ev.target;
    if (campo.getAttribute("aria-invalid") === "true" && campo.value.trim()) {
      marcar(campo, `${campo.id}-erro`, "");
    }
  });

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    esconderDemo();
    const { r, erros } = validar();
    if (erros.length) {
      erros[0].focus();
      return;
    }
    if (totais().qtd === 0) return;

    ultimaMensagem = montarMensagem(r);
    const numero = String(LOJA.whatsapp).replace(/\D/g, "");
    if (numero) {
      const link = `https://wa.me/${numero}?text=${encodeURIComponent(ultimaMensagem)}`;
      window.open(link, "_blank", "noopener");
      $("[data-link-whats]").href = link;
      enviado.hidden = false;
      enviado.focus();
      return;
    }
    // Modo demonstração: sem número configurado, nada é enviado.
    $("[data-demo-msg]").textContent = ultimaMensagem;
    $("[data-copiado]").textContent = "";
    demo.hidden = false;
    demo.focus();
  });

  $("[data-copiar]").addEventListener("click", async () => {
    const status = $("[data-copiado]");
    try {
      await navigator.clipboard.writeText(ultimaMensagem);
      status.textContent = "Texto copiado.";
    } catch {
      const sel = window.getSelection();
      const faixa = document.createRange();
      faixa.selectNodeContents($("[data-demo-msg]"));
      sel.removeAllRanges();
      sel.addRange(faixa);
      status.textContent = "Texto selecionado. Use Ctrl+C (ou Copiar) para copiar.";
    }
  });

  /* ---------------------------------------------------------------------
     Horário de funcionamento
     --------------------------------------------------------------------- */

  const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
  const paraMinutos = (hhmm) => {
    if (!hhmm) return null;
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + (m || 0);
  };
  const hora = (min) => {
    const m = ((min % 1440) + 1440) % 1440;
    if (m === 0) return "meia-noite";
    const h = Math.floor(m / 60);
    const mm = m % 60;
    return mm ? `${h}h${String(mm).padStart(2, "0")}` : `${h}h`;
  };
  // "às 23h", mas "à meia-noite" e "à 1h"
  const as = (min) => (min % 1440 === 0 || Math.floor((min % 1440) / 60) === 1 ? "à" : "às");

  const turnos = $$("tr[data-dia]").map((tr) => {
    const abre = paraMinutos(tr.dataset.abre);
    let fecha = paraMinutos(tr.dataset.fecha);
    if (abre !== null && fecha !== null && fecha <= abre) fecha += 1440; // passa da meia-noite
    const t = { tr, dia: Number(tr.dataset.dia), abre, fecha };
    const celula = $("td", tr);
    if (celula) {
      celula.textContent = abre === null || fecha === null
        ? "Fechado"
        : `${hora(abre)} ${as(fecha)} ${hora(fecha)}`;
    }
    return t;
  });

  function situacao(agora) {
    const dia = agora.getDay();
    const m = agora.getHours() * 60 + agora.getMinutes();
    const turno = (d) => turnos.find((t) => t.dia === d && t.abre !== null && t.fecha !== null);

    const ontem = turno((dia + 6) % 7);
    if (ontem && ontem.fecha > 1440 && m < ontem.fecha - 1440) return { aberto: true, ate: ontem.fecha };
    const hoje = turno(dia);
    if (hoje && m >= hoje.abre && m < hoje.fecha) return { aberto: true, ate: hoje.fecha };

    for (let i = 0; i < 7; i += 1) {
      const t = turno((dia + i) % 7);
      if (t && (i > 0 || m < t.abre)) return { aberto: false, emDias: i, dia: t.dia, abre: t.abre };
    }
    return null;
  }

  function atualizarHorario() {
    if (!turnos.length) return;
    const agora = new Date();
    const s = situacao(agora);
    let texto = "";
    if (s && s.aberto) {
      texto = `Aberto agora, até ${s.ate % 1440 === 0 ? "a " : ""}${hora(s.ate)}`;
    } else if (s) {
      const quando = s.emDias === 0 ? "hoje" : s.emDias === 1 ? "amanhã" : DIAS[s.dia];
      texto = `Fechado agora. Abre ${quando} ${as(s.abre)} ${hora(s.abre)}`;
    }
    if (texto) {
      $$("[data-status]").forEach((el) => {
        el.dataset.aberto = s.aberto ? "sim" : "nao";
        $("[data-status-texto]", el).textContent = texto;
      });
    }

    turnos.forEach((t) => {
      const ehHoje = t.dia === agora.getDay();
      t.tr.classList.toggle("hoje", ehHoje);
      const th = $("th", t.tr);
      const rotulo = $(".hoje-rotulo", th);
      if (ehHoje && !rotulo) th.insertAdjacentHTML("beforeend", '<span class="hoje-rotulo">(hoje)</span>');
      if (!ehHoje && rotulo) rotulo.remove();
    });
  }

  /* ---------------------------------------------------------------------
     Navegação
     --------------------------------------------------------------------- */

  const navBotao = $(".nav__abrir");
  const navLista = $("#nav-lista");

  function abrirMenu(abrir) {
    navBotao.setAttribute("aria-expanded", String(abrir));
    navLista.classList.toggle("aberta", abrir);
  }
  navBotao.addEventListener("click", () => abrirMenu(navBotao.getAttribute("aria-expanded") !== "true"));
  navLista.addEventListener("click", (ev) => { if (ev.target.closest("a")) abrirMenu(false); });
  document.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape" && navBotao.getAttribute("aria-expanded") === "true") {
      abrirMenu(false);
      navBotao.focus();
    }
  });

  // Categoria atual destacada na barra de categorias
  const categorias = $("[data-categorias]");
  if (categorias && "IntersectionObserver" in window) {
    const links = $$("a", categorias);
    const observador = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => {
          if (a.hash === `#${e.target.id}`) {
            a.setAttribute("aria-current", "true");
            // no celular, rola a barra para a categoria atual ficar à vista
            categorias.scrollTo({ left: a.offsetLeft - (categorias.clientWidth - a.offsetWidth) / 2 });
          } else {
            a.removeAttribute("aria-current");
          }
        });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach((a) => {
      const secao = document.getElementById(a.hash.slice(1));
      if (secao) observador.observe(secao);
    });
  }

  // Destaque: a foto e o texto entram devagar na primeira vez que aparecem
  // (o CSS só anima sem "reduzir movimento")
  const destaque = $(".destaque");
  if (destaque && "IntersectionObserver" in window) {
    destaque.classList.add("revelar");
    const revelador = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      destaque.classList.add("visivel");
      revelador.disconnect();
    }, { threshold: 0.2 });
    revelador.observe(destaque);
  }

  /* ---------------------------------------------------------------------
     Vídeo da primeira tela
     A imagem aparece na hora; o vídeo (mesma cena) baixa depois e entra por
     cima quando começa a tocar. Há uma versão para tela larga e outra para
     celular. Com "reduzir movimento" ou economia de dados, fica a imagem
     parada e o botão permite tocar.
     --------------------------------------------------------------------- */

  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const economiaDeDados = Boolean(navigator.connection && navigator.connection.saveData);
  const telaDeComputador = window.matchMedia("(min-width: 960px)");

  $$("[data-video]").forEach((caixa) => {
    const video = $("video", caixa);
    const botao = $("[data-video-botao]", caixa);
    if (!video || !botao) return;
    let carregado = false;
    let pausadoPelaPessoa = false;

    function tocar() {
      if (!carregado) {
        video.src = telaDeComputador.matches ? video.dataset.srcLarga : video.dataset.srcCelular;
        carregado = true;
      }
      video.play().catch(() => {});
    }

    function atualizarBotao() {
      const parado = video.paused;
      botao.innerHTML = parado ? ICONE.tocar : ICONE.pausar;
      botao.setAttribute("aria-label", parado ? "Reproduzir vídeo" : "Pausar vídeo");
    }

    ["play", "pause"].forEach((evento) => video.addEventListener(evento, atualizarBotao));
    video.addEventListener("playing", () => video.classList.add("tocando"));
    botao.addEventListener("click", () => {
      if (video.paused) {
        pausadoPelaPessoa = false;
        tocar();
      } else {
        pausadoPelaPessoa = true;
        video.pause();
      }
    });
    botao.hidden = false;
    atualizarBotao();

    if (semMovimento || economiaDeDados || !("IntersectionObserver" in window)) return;
    // toca só enquanto a primeira tela estiver à vista
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!pausadoPelaPessoa) tocar();
      } else if (!video.paused) {
        video.pause();
      }
    }, { threshold: 0.25 }).observe(caixa);
  });

  /* ---------------------------------------------------------------------
     Início
     --------------------------------------------------------------------- */

  atualizarCampos();
  desenhar();
  atualizarHorario();
  setInterval(atualizarHorario, 60 * 1000);
})();
