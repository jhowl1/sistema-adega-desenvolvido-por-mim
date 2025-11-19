document.addEventListener("DOMContentLoaded", function () {
  const tabela = document.getElementById("tabela-estoque");
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

  // Renderizar tabela de estoque
  function renderTabela() {
    tabela.innerHTML = "";
    for (const nome in estoque) {
      const produto = estoque[nome];
      const dosesPorGarrafa = produto.volumeDose > 0 ? Math.floor(produto.volumeGarrafa / produto.volumeDose) : 0;
      const totalDoses = produto.quantidade * dosesPorGarrafa;

      let status = "OK";
      const linha = document.createElement("tr");
      if (produto.quantidade <= 2 || totalDoses <= 10) {
        status = "⚠️ Baixo estoque";
        linha.classList.add("baixo-estoque");
      }

      linha.innerHTML = `
        <td>${nome}</td>
        <td>${produto.quantidade}</td>
        <td>R$ ${produto.valor.toFixed(2)}</td>
        <td>${totalDoses}</td>
        <td>${status}</td>
        <td>
          <button class="botao-editar" data-produto="${nome}">Editar</button>
          <button class="botao-remover" data-produto="${nome}">Remover</button>
        </td>
      `;
      tabela.appendChild(linha);
    }
  }

  renderTabela();

  // Remover produto
  tabela.addEventListener("click", function (e) {
    if (e.target.classList.contains("botao-remover")) {
      const nome = e.target.getAttribute("data-produto");
      if (confirm(`Deseja remover o produto "${nome}" do estoque?`)) {
        delete estoque[nome];
        localStorage.setItem("estoque", JSON.stringify(estoque));
        renderTabela();
      }
    }
  });

  // Editar produto
  tabela.addEventListener("click", function (e) {
    if (e.target.classList.contains("botao-editar")) {
      const nome = e.target.getAttribute("data-produto");
      const novoValor = parseFloat(prompt("Novo valor unitário (R$):", estoque[nome].valor));
      if (!isNaN(novoValor) && novoValor > 0) {
        estoque[nome].valor = novoValor;
        localStorage.setItem("estoque", JSON.stringify(estoque));
        renderTabela();
      }
    }
  });

  // Busca
  document.getElementById("busca").addEventListener("input", e => {
    const termo = e.target.value.toLowerCase();
    [...tabela.rows].forEach(row => {
      const nome = row.cells[0].textContent.toLowerCase();
      row.style.display = nome.includes(termo) ? "" : "none";
    });
  });

  // Exportar CSV
  document.getElementById("exportar").addEventListener("click", () => {
    let csv = "Produto,Quantidade,Valor Unitário,Doses\n";
    for (const nome in estoque) {
      const p = estoque[nome];
      const doses = p.volumeDose > 0 ? Math.floor(p.volumeGarrafa / p.volumeDose) * p.quantidade : 0;
      csv += `${nome},${p.quantidade},${p.valor},${doses}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "estoque.csv";
    a.click();
  });

  // Gráfico de estoque
  const ctxEstoque = document.getElementById("graficoEstoque").getContext("2d");
  const labelsEstoque = Object.keys(estoque);
  const garrafas = labelsEstoque.map(nome => estoque[nome].quantidade);
  const doses = labelsEstoque.map(nome => {
    const p = estoque[nome];
    return p.volumeDose > 0 ? Math.floor(p.volumeGarrafa / p.volumeDose) * p.quantidade : 0;
  });

  new Chart(ctxEstoque, {
    type: "bar",
    data: {
      labels: labelsEstoque,
      datasets: [
        { label: "Garrafas", data: garrafas, backgroundColor: "#FFD700" },
        { label: "Doses", data: doses, backgroundColor: "#000" }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: "#FFD700" } } },
      scales: {
        x: { ticks: { color: "#FFD700" } },
        y: { ticks: { color: "#FFD700" } }
      }
    }
  });

  // Ranking dos mais vendidos
  function renderMaisVendidos() {
    const ranking = {};
    vendas.forEach(v => {
      ranking[v.produto] = (ranking[v.produto] || 0) + v.quantidade;
    });
    const ordenados = Object.entries(ranking).sort((a, b) => b[1] - a[1]);

    const tabelaRanking = document.getElementById("tabela-vendidos");
    tabelaRanking.innerHTML = "";
    ordenados.forEach(([produto, qtd]) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${produto}</td><td>${qtd}</td>`;
      tabelaRanking.appendChild(tr);
    });

    const ctxVendidos = document.getElementById("graficoVendidos").getContext("2d");
    new Chart(ctxVendidos, {
      type: "pie",
      data: {
        labels: ordenados.map(([p]) => p),
        datasets: [{
          data: ordenados.map(([_, q]) => q),
          backgroundColor: ["#FFD700", "#000", "#444", "#999", "#e6c200"]
        }]
      },
      options: { plugins: { legend: { labels: { color: "#FFD700" } } } }
    });
  }

  renderMaisVendidos();
});

