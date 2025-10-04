document.addEventListener("DOMContentLoaded", function () {
  const btnCadastrar = document.querySelector(".submit-button");
  const nomeInput = document.getElementById("name");
  const celularInput = document.getElementById("celular");
  const senhaInput = document.getElementById("Senha"); // respeita o "S" maiúsculo do HTML

  btnCadastrar.addEventListener("click", function () {
    const nome = nomeInput.value.trim();
    const celular = celularInput.value.trim();
    const senha = senhaInput.value.trim();

    if (nome === "" || celular === "" || senha === "") {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    // Simula cadastro e redireciona
    alert("Cadastro realizado com sucesso!");
    window.location.href = "./index.html"; // volta para login
  });
});