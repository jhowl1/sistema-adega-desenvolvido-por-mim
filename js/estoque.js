document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const fotoPerfil = document.getElementById("fotoPerfil");
  const menuSair = document.getElementById("menuSair");

  // Foto clicável abre/fecha menu sair
  if (fotoPerfil && menuSair) {
    fotoPerfil.addEventListener("click", function () {
      menuSair.style.display = menuSair.style.display === "block" ? "none" : "block";
    });
  }

  // Cadastro de produto
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const produto = {
      nome: document.getElementById("nome").value.trim(),
      quantidade: Number(document.getElementById("quantidade").value) || 0,
      valor: Number(document.getElementById("valor").value) || 0,
      valorPago: Number(document.getElementById("valorPago").value) || 0,
      volumeGarrafa: Number(document.getElementById("volumeGarrafa").value) || 0,
      volumeDose: Number(document.getElementById("volumeDose").value) || 0,
      precoDose: Number(document.getElementById("precoDose").value) || 0
    };

    if (!produto.nome || produto.quantidade <= 0 || produto.valor <= 0 ||
        produto.valorPago <= 0 || produto.volumeGarrafa <= 0 ||
        produto.volumeDose <= 0 || produto.precoDose <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
    estoque[produto.nome] = produto;
    localStorage.setItem("estoque", JSON.stringify(estoque));

    form.reset();
    atualizarTabela();
    alert("Produto salvo com sucesso!");
  });

  atualizarTabela();
});

function atualizarTabela() {
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  const tbody = document.querySelector("#tabela-estoque tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  let totalVenda = 0;
  let totalPago = 0;

  Object.keys(estoque).forEach(nome => {
    const p = estoque[nome];
    totalVenda += (p.quantidade || 0) * (p.valor || 0);
    totalPago += (p.quantidade || 0) * (p.valorPago || 0);

    const tr = document.createElement("tr");
    tr.innerHTML =
      '<td>' + p.nome + '</td>' +
      '<td>' + p.quantidade + '</td>' +
      '<td>R$ ' + (p.valor || 0).toFixed(2) + '</td>' +
      '<td>R$ ' + (p.valorPago || 0).toFixed(2) + '</td>' +
      '<td>' + p.volumeGarrafa + ' ml</td>' +
      '<td>' + p.volumeDose + ' ml</td>' +
      '<td>R$ ' + (p.precoDose || 0).toFixed(2) + '</td>' +
      '<td><button class="botao-remover" onclick="removerProduto(\'' + nome + '\')">Remover</button></td>';
    tbody.appendChild(tr);
  });

  const totalDiv = document.getElementById("total-estoque");
  if (totalDiv) {
    totalDiv.innerText =
      'Valor total de venda: R$ ' + totalVenda.toFixed(2) +
      ' | Valor total pago: R$ ' + totalPago.toFixed(2) +
      ' | Lucro potencial: R$ ' + (totalVenda - totalPago).toFixed(2);
  }
}

function removerProduto(nome) {
  const estoque = JSON.parse(localStorage.getItem("estoque")) || {};
  delete estoque[nome];
  localStorage.setItem("estoque", JSON.stringify(estoque));
  atualizarTabela();
}

function sair() {
  window.location.href = "index.html";
}

