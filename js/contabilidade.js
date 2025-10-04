document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("form-contabilidade");
  const inputGasto = document.getElementById("gasto-dia");
  const totalGastosSpan = document.getElementById("total-gastos");
  const listaGastos = document.getElementById("lista-gastos");
  const ganhoMesSpan = document.getElementById("ganho-mes");
  const ganhoAnoSpan = document.getElementById("ganho-ano");
  const ganhoTotalSpan = document.getElementById("ganho-total");
  const gastoMesSpan = document.getElementById("gasto-mes");
  const gastoAnoSpan = document.getElementById("gasto-ano");
  const ganhoDiaSpan = document.getElementById("ganho-dia");
  const gastoDiaTotalSpan = document.getElementById("gasto-dia-total");
  const lucroDiaSpan = document.getElementById("lucro-dia");

  const vendas = JSON.parse(localStorage.getItem("vendas")) || [];
  const agora = new Date();
  const anoAtual = agora.getFullYear();
  const mesAtual = agora.getMonth();
  const diaAtual = agora.getDate();

  let gastos = JSON.parse(localStorage.getItem("gastosDia")) || [];

  // Corrige formato antigo dos gastos
  gastos = gastos.map(g => typeof g === "number" ? { valor: g, data: new Date().toISOString() } : g);

  function atualizarTotais() {
    let ganhoMes = 0;
    let ganhoAno = 0;
    let ganhoDia = 0;
    let gastoDia = 0;
    let gastoMes = 0;
    let gastoAno = 0;

    vendas.forEach(venda => {
      const dataVenda = new Date(venda.data);
      if (dataVenda.getFullYear() === anoAtual) {
        ganhoAno += venda.valor;
        if (dataVenda.getMonth() === mesAtual) {
          ganhoMes += venda.valor;
          if (dataVenda.getDate() === diaAtual) {
            ganhoDia += venda.valor;
          }
        }
      }
    });

    gastos.forEach(gasto => {
      const data = new Date(gasto.data);
      if (data.getFullYear() === anoAtual) {
        gastoAno += gasto.valor;
        if (data.getMonth() === mesAtual) {
          gastoMes += gasto.valor;
          if (data.getDate() === diaAtual) {
            gastoDia += gasto.valor;
          }
        }
      }
    });

    ganhoMesSpan.textContent = ganhoMes.toFixed(2);
    ganhoAnoSpan.textContent = ganhoAno.toFixed(2);
    ganhoTotalSpan.textContent = (ganhoMes + ganhoAno).toFixed(2);

    totalGastosSpan.textContent = gastoDia.toFixed(2);
    gastoMesSpan.textContent = gastoMes.toFixed(2);
    gastoAnoSpan.textContent = gastoAno.toFixed(2);

    ganhoDiaSpan.textContent = ganhoDia.toFixed(2);
    gastoDiaTotalSpan.textContent = gastoDia.toFixed(2);
    lucroDiaSpan.textContent = (ganhoDia - gastoDia).toFixed(2);
  }

  function renderizarLista() {
    listaGastos.innerHTML = "";
    gastos.forEach((gasto, index) => {
      const li = document.createElement("li");
      li.innerHTML = `
        R$ ${gasto.valor.toFixed(2)}
        <button class="botao-editar" data-index="${index}">Editar</button>
        <button class="botao-remover" data-index="${index}">Remover</button>
      `;
      listaGastos.appendChild(li);
    });
  }

  atualizarTotais();
  renderizarLista();

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const valor = parseFloat(inputGasto.value);
    if (isNaN(valor) || valor <= 0) {
      alert("Digite um valor válido.");
      return;
    }

    gastos.push({
      valor,
      data: new Date().toISOString()
    });

    localStorage.setItem("gastosDia", JSON.stringify(gastos));
    atualizarTotais();
    renderizarLista();

    alert(`Gasto de R$ ${valor.toFixed(2)} registrado com sucesso.`);
    form.reset();
  });

  listaGastos.addEventListener("click", function (e) {
    const index = parseInt(e.target.getAttribute("data-index"));
    if (e.target.classList.contains("botao-remover")) {
      if (confirm("Deseja remover este gasto?")) {
        gastos.splice(index, 1);
        localStorage.setItem("gastosDia", JSON.stringify(gastos));
        atualizarTotais();
        renderizarLista();
      }
    }

    if (e.target.classList.contains("botao-editar")) {
      const novoValor = parseFloat(prompt("Novo valor para este gasto:", gastos[index].valor));
      if (!isNaN(novoValor) && novoValor > 0) {
        gastos[index].valor = novoValor;
        localStorage.setItem("gastosDia", JSON.stringify(gastos));
        atualizarTotais();
        renderizarLista();
      } else {
        alert("Valor inválido. A edição foi cancelada.");
      }
    }
  });
});