document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const nomeInput = document.getElementById("nome");
  const quantidadeInput = document.getElementById("quantidade");
  const valorInput = document.getElementById("valor");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const quantidade = parseInt(quantidadeInput.value);
    const valor = parseFloat(valorInput.value);

    if (nome === "" || isNaN(quantidade) || quantidade <= 0 || isNaN(valor) || valor <= 0) {
      alert("Preencha todos os campos corretamente.");
      return;
    }

    // Recupera estoque atual ou inicia vazio
    const estoque = JSON.parse(localStorage.getItem("estoque")) || {};

    // Se o produto já existe, soma a quantidade e atualiza o valor
    if (estoque[nome]) {
      estoque[nome].quantidade += quantidade;
      estoque[nome].valor = valor; // atualiza o valor unitário
    } else {
      estoque[nome] = {
        quantidade: quantidade,
        valor: valor
      };
    }

    // Salva no localStorage
    localStorage.setItem("estoque", JSON.stringify(estoque));

    alert(`Produto "${nome}" adicionado com sucesso!`);
    form.reset();
  });
});