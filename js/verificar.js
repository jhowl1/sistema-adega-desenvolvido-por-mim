document.addEventListener("DOMContentLoaded", function () {
  const tabela = document.getElementById("tabela-estoque");
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};

  tabela.innerHTML = "";

  for (const nome in estoque) {
    const produto = estoque[nome];
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${nome}</td>
      <td>${produto.quantidade}</td>
      <td>${produto.valor.toFixed(2)}</td>
      <td>
        <button class="botao-editar" data-produto="${nome}">Editar</button>
        <button class="botao-remover" data-produto="${nome}">Remover</button>
      </td>
    `;

    tabela.appendChild(linha);
  }

  // Remover produto
  tabela.addEventListener("click", function (e) {
    if (e.target.classList.contains("botao-remover")) {
      const nome = e.target.getAttribute("data-produto");
      if (confirm(`Deseja remover o produto "${nome}" do estoque?`)) {
        delete estoque[nome];
        localStorage.setItem("estoque", JSON.stringify(estoque));
        location.reload();
      }
    }
  });

  // Editar produto (exemplo simples com prompt)
  tabela.addEventListener("click", function (e) {
    if (e.target.classList.contains("botao-editar")) {
      const nome = e.target.getAttribute("data-produto");
      const novoValor = parseFloat(prompt("Novo valor unitário (R$):", estoque[nome].valor));
      if (!isNaN(novoValor) && novoValor > 0) {
        estoque[nome].valor = novoValor;
        localStorage.setItem("estoque", JSON.stringify(estoque));
        location.reload();
      }
    }
  });
});