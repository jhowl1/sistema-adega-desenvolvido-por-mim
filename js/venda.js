document.addEventListener("DOMContentLoaded", () => {
  const listaProdutos = document.getElementById("lista-produtos");
  const buscaInput = document.getElementById("busca");
  const form = document.getElementById("form-venda");
  const produtoSelecionadoEl = document.getElementById("produto-selecionado");
  const precoUnitarioInput = document.getElementById("precoUnitario");
  const formaPagamentoSelect = document.getElementById("formaPagamento");
  const campoParcelas = document.getElementById("campo-parcelas");
  const parcelasInput = document.getElementById("parcelas");
  const campoValorRecebido = document.getElementById("campo-valor-recebido");
  const valorRecebidoInput = document.getElementById("valorRecebido");
  const resumoDiv = document.getElementById("resumo-compra");
  const tipoVendaSelect = document.getElementById("tipoVenda");
  const quantidadeInput = document.getElementById("quantidade");

  let estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  let produtoAtual = null;

  // Helpers de preço conforme tipo
  function getPrecoDose(prod) {
    return typeof prod.precoDose === "number" && prod.precoDose > 0 ? prod.precoDose : 0;
  }
  function getPrecoGarrafa(prod) {
    return typeof prod.valor === "number" && prod.valor > 0 ? prod.valor : 0;
  }

  // Doses máximas possíveis (garrafas inteiras, sem parcial)
  function getMaxDoses(prod) {
    const q = Number(prod.quantidade) || 0;
    const vg = Number(prod.volumeGarrafa) || 0;
    const vd = Number(prod.volumeDose) || 0;
    if (q <= 0 || vg <= 0 || vd <= 0) return 0;
    const dosesPorGarrafa = Math.floor(vg / vd);
    return dosesPorGarrafa * q;
  }

  // Renderizar cards
  function renderCards(filtro = "") {
    listaProdutos.innerHTML = "";
    const nomes = Object.keys(estoque);

    if (nomes.length === 0) {
      listaProdutos.innerHTML = '<p>Nenhum produto cadastrado no estoque.</p>';
      form.style.display = "none";
      produtoAtual = null;
      return;
    }

    nomes.forEach(nome => {
      if (filtro && !nome.toLowerCase().includes(filtro.toLowerCase())) return;
      const prod = estoque[nome];
      const precoDose = getPrecoDose(prod);
      const precoGarrafa = getPrecoGarrafa(prod);
      const volumeDose = prod.volumeDose || 0;
      const quantidade = prod.quantidade || 0;

      const card = document.createElement("div");
      card.className = "card-produto";
      card.innerHTML =
        '<h3>' + nome + '</h3>' +
        '<p>Preço da dose: R$ ' + precoDose.toFixed(2) + '</p>' +
        '<p>Preço da garrafa: R$ ' + precoGarrafa.toFixed(2) + '</p>' +
        '<p>Volume da dose: ' + volumeDose + ' ml</p>' +
        '<p>Qtd em estoque (garrafas): ' + quantidade + '</p>';
      card.addEventListener("click", () => selecionarProduto(nome));
      listaProdutos.appendChild(card);
    });
  }
  renderCards();

  // Busca
  buscaInput.addEventListener("input", () => renderCards(buscaInput.value));

  // Selecionar produto e configurar preço conforme tipo
  function selecionarProduto(nome) {
    produtoAtual = nome;
    const prod = estoque[nome];
    if (!prod) {
      alert("Produto não encontrado.");
      return;
    }
    produtoSelecionadoEl.textContent = 'Produto: ' + nome;
    form.style.display = "block";
    resumoDiv.innerHTML = "";

    aplicarPrecoPorTipo(prod);
    atualizarPlaceholderQuantidade(prod);
  }

  // Muda preço ao trocar tipo de venda
  tipoVendaSelect.addEventListener("change", () => {
    if (!produtoAtual) return;
    const prod = estoque[produtoAtual];
    aplicarPrecoPorTipo(prod);
    atualizarPlaceholderQuantidade(prod);
  });

  function aplicarPrecoPorTipo(prod) {
    const tipo = tipoVendaSelect.value; // 'dose' ou 'garrafa'
    const preco = tipo === "dose" ? getPrecoDose(prod) : getPrecoGarrafa(prod);
    precoUnitarioInput.value = preco.toFixed(2);
  }

  function atualizarPlaceholderQuantidade(prod) {
    const tipo = tipoVendaSelect.value;
    if (tipo === "dose") {
      const maxDoses = getMaxDoses(prod);
      quantidadeInput.placeholder = `Ex: 2 (máx ${maxDoses} doses)`;
    } else {
      quantidadeInput.placeholder = `Ex: 1 (máx ${prod.quantidade || 0} garrafas)`;
    }
  }

  // Campos extras pagamento
  formaPagamentoSelect.addEventListener("change", () => {
    const fp = formaPagamentoSelect.value;
    campoParcelas.style.display = fp === "credito" ? "block" : "none";
    campoValorRecebido.style.display = fp === "dinheiro" ? "block" : "none";
  });

  // Resumo
  document.getElementById("btnResumo").addEventListener("click", () => {
    if (!produtoAtual) {
      alert("Selecione um produto.");
      return;
    }
    const quantidade = parseInt(quantidadeInput.value, 10);
    const precoUnitario = parseFloat(precoUnitarioInput.value);
    const formaPagamento = formaPagamentoSelect.value;
    const tipo = tipoVendaSelect.value;
    const prod = estoque[produtoAtual];

    if (isNaN(quantidade) || quantidade <= 0) {
      alert("Informe uma quantidade válida.");
      return;
    }

    // Validação de limites
    if (tipo === "garrafa") {
      const maxGarrafas = Number(prod.quantidade) || 0;
      if (quantidade > maxGarrafas) {
        alert(`Quantidade maior que o estoque. Máx: ${maxGarrafas} garrafas.`);
        return;
      }
    } else {
      const maxDoses = getMaxDoses(prod);
      if (quantidade > maxDoses) {
        alert(`Quantidade maior que o estoque. Máx: ${maxDoses} doses.`);
        return;
      }
    }

    const total = quantidade * precoUnitario;
    let resumo =
      '<p><strong>Produto:</strong> ' + produtoAtual + '</p>' +
      '<p><strong>Tipo:</strong> ' + (tipo === 'dose' ? 'Dose' : 'Garrafa') + '</p>' +
      '<p><strong>Quantidade:</strong> ' + quantidade + '</p>' +
      '<p><strong>Total:</strong> R$ ' + total.toFixed(2) + '</p>' +
      '<p><strong>Forma de pagamento:</strong> ' + formaPagamento + '</p>';

    if (formaPagamento === "credito") {
      const parcelas = parseInt(parcelasInput.value, 10) || 1;
      const valorParcela = total / parcelas;
      resumo += '<p><strong>Parcelas:</strong> ' + parcelas + 'x de R$ ' + valorParcela.toFixed(2) + '</p>';
    }

    if (formaPagamento === "dinheiro") {
      const recebido = parseFloat(valorRecebidoInput.value);
      if (!isNaN(recebido) && recebido > 0) {
        const troco = recebido - total;
        resumo += '<p><strong>Valor recebido:</strong> R$ ' + recebido.toFixed(2) + '</p>';
        resumo += '<p><strong>Troco:</strong> R$ ' + troco.toFixed(2) + '</p>';
      }
    }

    resumoDiv.innerHTML = resumo;
  });

  // Finalizar venda
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!produtoAtual) {
      alert("Selecione um produto.");
      return;
    }

    const prod = estoque[produtoAtual];
    const tipo = tipoVendaSelect.value;
    const quantidadeVendida = parseInt(quantidadeInput.value, 10);
    const precoUnitario = parseFloat(precoUnitarioInput.value);
    const formaPagamento = formaPagamentoSelect.value;
    const parcelas = formaPagamento === "credito" ? parseInt(parcelasInput.value, 10) || 1 : null;

    if (!quantidadeVendida || quantidadeVendida <= 0) {
      alert("Quantidade inválida.");
      return;
    }

    // Validação de estoque
    if (tipo === "garrafa") {
      const maxGarrafas = Number(prod.quantidade) || 0;
      if (quantidadeVendida > maxGarrafas) {
        alert(`Quantidade maior que o estoque. Máx: ${maxGarrafas} garrafas.`);
        return;
      }
      // Abate garrafas
      prod.quantidade = maxGarrafas - quantidadeVendida;
    } else {
      const maxDoses = getMaxDoses(prod);
      if (quantidadeVendida > maxDoses) {
        alert(`Quantidade maior que o estoque. Máx: ${maxDoses} doses.`);
        return;
      }
      // Abate por doses convertendo em garrafas inteiras consumidas
      // Usamos uma aproximação: calcular garrafas consumidas inteiras por doses
      const dosesPorGarrafa = Math.floor((Number(prod.volumeGarrafa) || 0) / (Number(prod.volumeDose) || 1));
      const garrafasConsumidas = Math.floor(quantidadeVendida / (dosesPorGarrafa || 1));
      const restoDoses = quantidadeVendida % (dosesPorGarrafa || 1);

      // Se houver resto de doses, consideramos que mais uma garrafa foi aberta e comprometida.
      const garrafasTotaisAbatidas = garrafasConsumidas + (restoDoses > 0 ? 1 : 0);

      const qtdEstoque = Number(prod.quantidade) || 0;
      if (garrafasTotaisAbatidas > qtdEstoque) {
        alert("Estoque insuficiente ao converter doses em garrafas.");
        return;
      }
      prod.quantidade = qtdEstoque - garrafasTotaisAbatidas;

      // Observação: não controlamos saldo parcial de garrafa. Se quiser manter saldo parcial,
      // posso adicionar um campo `mlParcial` por produto para tratar doses restantes.
    }

    // Persistir estoque
    localStorage.setItem("estoque", JSON.stringify(estoque));
    renderCards(buscaInput.value);

    // Registrar venda
    const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
    vendas.push({
      produto: produtoAtual,
      tipo: tipo, // dose ou garrafa
      quantidade: quantidadeVendida,
      precoUnitario: precoUnitario,
      formaPagamento: formaPagamento,
      parcelas: parcelas,
      data: new Date().toLocaleString("pt-BR")
    });
    localStorage.setItem("vendas", JSON.stringify(vendas));

    alert("Venda registrada com sucesso!");
    form.reset();
    form.style.display = "none";
    resumoDiv.innerHTML = "";
    produtoSelecionadoEl.textContent = "";
    produtoAtual = null;
  });
});
