document.addEventListener("DOMContentLoaded", function () {
  const btnEntrar = document.getElementById("button"); // usa o id do botão
  const nomeInput = document.getElementById("name");
  const senhaInput = document.getElementById("Senha"); // respeita o "S" maiúsculo do HTML

  btnEntrar.addEventListener("click", function () {
    const nome = nomeInput.value.trim();
    const senha = senhaInput.value.trim();

    if (nome === "" || senha === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Abre a página de vendas em nova aba
    window.open("./vendas.html", "_blank");
  });
});