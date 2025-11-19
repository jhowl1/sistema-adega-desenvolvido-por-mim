document.addEventListener("DOMContentLoaded", function () {
  // Elementos
  const form = document.getElementById("form-contabilidade");
  const inputGasto = document.getElementById("gasto-dia");
  const totalGastosSpan = document.getElementById("total-gastos");
  const listaGastos = document.getElementById("lista-gastos");

  const ganhoMesSpan = document.getElementById("ganho-mes");
  const ganhoAnoSpan = document.getElementById("ganho-ano");
  const ganhoTotalSpan = document.getElementById("ganho-total");
  const lucroRealSpan = document.getElementById("lucro-real");

  const gastoMesSpan = document.getElementById("gasto-mes");
  const gastoAnoSpan = document.getElementById("gasto-ano");

  const ganhoDiaSpan = document.getElementById("ganho-dia");
  const gastoDiaTotalSpan = document.getElementById("gasto-dia-total");
  const lucroDiaSpan = document.getElementById("lucro-dia");

  const tabelaBody = document.querySelector("#tabela-vendas tbody");
  const resumoPagamentoUl = document.getElementById("resumo-pagamento");

  // Dados
  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();
  const diaAtual = agora.getDate();

  let gastos = JSON.parse(localStorage.getItem("gastosDia")) || [];
  // Normaliza formato antigo (se houver números soltos)
  gastos = gastos.map(g => typeof g === "number" ? { valor: g, data: new Date().toISOString() } : g);

  // Helpers
  function numero(n) { return typeof n === "number" ? n : Number(n) || 0; }

  function custoUnitarioVenda(venda) {
    const prod = estoque[venda.produto];
    if (!prod) return 0;
    if (venda.tipo === "garrafa") {
      return numero(prod.valorPago);
    } else {
      const dosesPorGarrafa = Math.floor(numero(prod.volumeGarrafa) / Math.max(numero(prod.volumeDose), 1));
      return dosesPorGarrafa > 0 ? numero(prod.valorPago) / dosesPorGarrafa : 0;
    }
  }

  function atualizarTotais() {
    let receitaMes = 0, receitaAno = 0, receitaDia = 0;
    let gastoDia = 0, gastoMes = 0, gastoAno = 0;
    let custoAno = 0;

    const resumoPagamento = { pix: 0, debito: 0, credito: 0, dinheiro: 0 };

    // Limpa tabela
    tabelaBody.innerHTML = "";

    // Vendas
    vendas.forEach(venda => {
      // data salva como string pt-BR, usa Date para parse básico
      const dataVenda = new Date(venda.data);
      const totalVenda = numero(venda.quantidade) * numero(venda.precoUnitario);

      // Acúmulos por período
      if (dataVenda.getFullYear() === anoAtual) {
        receitaAno += totalVenda;
        custoAno += custoUnitarioVenda(venda) * numero(venda.quantidade);

        if (dataVenda.getMonth() === mesAtual) {
          receitaMes += totalVenda;

          if (dataVenda.getDate() === diaAtual) {
            receitaDia += totalVenda;
          }
        }
      }

      // Resumo por forma de pagamento
      if (resumoPagamento[venda.formaPagamento] !== undefined) {
        resumoPagamento[venda.formaPagamento] += totalVenda;
      } else {
        // Outras formas não previstas
        resumoPagamento[venda.formaPagamento] = (resumoPagamento[venda.formaPagamento] || 0) + totalVenda;
      }

      // Linha na tabela
      const tr = document.createElement("tr");
      tr.innerHTML =
        `<td>${venda.data}</td>
         <td>${venda.produto}</td>
         <td>${venda.tipo}</td>
         <td>${venda.quantidade}</td>
         <td>R$ ${numero(venda.precoUnitario).toFixed(2)}</td>
         <td>R$ ${totalVenda.toFixed(2)}</td>
         <td>${venda.formaPagamento}</td>
         <td>${venda.parcelas || "-"}</td>`;
      tabelaBody.appendChild(tr);
    });

    // Gastos
    gastos.forEach(gasto => {
      const data = new Date(gasto.data);
      const v = numero(gasto.valor);
      if (data.getFullYear() === anoAtual) {
        gastoAno += v;
        if (data.getMonth() === mesAtual) {
          gastoMes += v;
          if (data.getDate() === diaAtual) {
            gastoDia += v;
          }
        }
      }
    });

    // Totais
    ganhoMesSpan.textContent = receitaMes.toFixed(2);
    ganhoAnoSpan.textContent = receitaAno.toFixed(2);
    ganhoTotalSpan.textContent = receitaAno.toFixed(2); // total geral = ano
    lucroRealSpan.textContent = (receitaAno - custoAno).toFixed(2);

    totalGastosSpan.textContent = gastoDia.toFixed(2);
    gastoMesSpan.textContent = gastoMes.toFixed(2);
    gastoAnoSpan.textContent = gastoAno.toFixed(2);

    ganhoDiaSpan.textContent = receitaDia.toFixed(2);
    gastoDiaTotalSpan.textContent = gastoDia.toFixed(2);
    lucroDiaSpan.textContent = (receitaDia - gastoDia).toFixed(2);

    // Resumo pagamento
    resumoPagamentoUl.innerHTML = "";
    Object.keys(resumoPagamento).forEach(fp => {
      const valor = resumoPagamento[fp];
      if (valor && valor > 0) {
        const li = document.createElement("li");
        li.textContent = `${fp}: R$ ${valor.toFixed(2)}`;
        resumoPagamentoUl.appendChild(li);
      }
    });
  }

  function renderizarListaGastos() {
    listaGastos.innerHTML = "";
    // Ordena gastos por data decrescente
    const gastosOrdenados = [...gastos].sort((a, b) => new Date(b.data) - new Date(a.data));
    gastosOrdenados.forEach((gasto, index) => {
      const li = document.createElement("li");
      const dataBR = new Date(gasto.data).toLocaleString("pt-BR");
      li.innerHTML =
        `<span>${dataBR}</span> — R$ ${numero(gasto.valor).toFixed(2)}
         <button class="botao-editar" data-index="${index}">Editar</button>
         <button class="botao-remover" data-index="${index}">Remover</button>`;
      listaGastos.appendChild(li);
    });
  }

  // Inicializa
  atualizarTotais();
  renderizarListaGastos();

  // Registrar gasto
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const valor = parseFloat(inputGasto.value);
    if (isNaN(valor) || valor <= 0) {
      alert("Digite um valor válido.");
      return;
    }
    gastos.push({ valor, data: new Date().toISOString() });
    localStorage.setItem("gastosDia", JSON.stringify(gastos));
    atualizarTotais();
    renderizarListaGastos();
    alert(`Gasto de R$ ${valor.toFixed(2)} registrado com sucesso.`);
    form.reset();
  });

  // Editar/Remover gasto
  listaGastos.addEventListener("click", function (e) {
    const indexAttr = e.target.getAttribute("data-index");
    if (indexAttr === null) return;
    const index = parseInt(indexAttr, 10);
    // Mapear índice visual para índice real na lista original
    // Como ordenamos para exibir, vamos reconstruir o mapeamento:
    const ordenados = [...gastos].sort((a, b) => new Date(b.data) - new Date(a.data));
    const item = ordenados[index];
    const realIndex = gastos.findIndex(g => g.data === item.data && g.valor === item.valor);

    if (e.target.classList.contains("botao-remover")) {
      if (confirm("Deseja remover este gasto?")) {
        gastos.splice(realIndex, 1);
        localStorage.setItem("gastosDia", JSON.stringify(gastos));
        atualizarTotais();
        renderizarListaGastos();
      }
    }

    if (e.target.classList.contains("botao-editar")) {
      const novoValor = parseFloat(prompt("Novo valor para este gasto:", item.valor));
      if (!isNaN(novoValor) && novoValor > 0) {
        gastos[realIndex].valor = novoValor;
        localStorage.setItem("gastosDia", JSON.stringify(gastos));
        atualizarTotais();
        renderizarListaGastos();
      } else {
        alert("Valor inválido. A edição foi cancelada.");
      }
    }
  });
});
