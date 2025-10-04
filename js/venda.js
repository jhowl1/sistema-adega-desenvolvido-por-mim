document.addEventListener("DOMContentLoaded", function () {
  const lista = document.getElementById("lista-produtos");
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];

  lista.innerHTML = "";

  for (const nome in estoque) {
    const produto = estoque[nome];

    const div = document.createElement("div");
    div.classList.add("produto");

    div.innerHTML = `
      <h2>${nome}</h2>
      <p>Valor: R$ ${produto.valor.toFixed(2)}</p>
      <p>Quantidade disponível: ${produto.quantidade}</p>

      <label>Quantidade:</label>
      <input type="number" class="quantidade-venda" min="1" value="1">

      <label>Valor pago (R$):</label>
      <input type="number" class="valor-pago" step="0.01">

      <button class="botao-venda" data-produto="${nome}">Registrar Venda</button>
    `;

    lista.appendChild(div);
  }

  lista.addEventListener("click", function (e) {
    if (e.target.classList.contains("botao-venda")) {
      const nome = e.target.getAttribute("data-produto");
      const produto = estoque[nome];
      const container = e.target.closest(".produto");

      const qtdInput = container.querySelector(".quantidade-venda");
      const pagoInput = container.querySelector(".valor-pago");

      const quantidadeVendida = parseInt(qtdInput.value);
      const valorPago = parseFloat(pagoInput.value);
      const valorTotal = quantidadeVendida * produto.valor;

      if (isNaN(quantidadeVendida) || quantidadeVendida <= 0) {
        alert("Informe uma quantidade válida.");
        return;
      }

      if (quantidadeVendida > produto.quantidade) {
        alert("Quantidade em estoque insuficiente.");
        return;
      }

      if (isNaN(valorPago) || valorPago < valorTotal) {
        alert(`Valor pago insuficiente. Total da venda: R$ ${valorTotal.toFixed(2)}`);
        return;
      }

      const troco = valorPago - valorTotal;

      // Atualiza estoque
      produto.quantidade -= quantidadeVendida;
      localStorage.setItem("estoque", JSON.stringify(estoque));

      // Registra venda
      vendas.push({
        produto: nome,
        valor: valorTotal,
        quantidade: quantidadeVendida,
        data: new Date().toISOString()
      });
      localStorage.setItem("vendas", JSON.stringify(vendas));

      alert(`Venda registrada: ${quantidadeVendida}x ${nome} por R$ ${valorTotal.toFixed(2)}. Troco: R$ ${troco.toFixed(2)}. Estoque restante: ${produto.quantidade}`);
      location.reload();
    }
  });
});