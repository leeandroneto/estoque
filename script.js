  // --- Lógica Frontend ---
  let allProducts = []; // Armazena os produtos globalmente para filtro local
  
  // IMPORTANTE: Substitua pela URL gerada ao implantar o Apps Script
  const API_URL = "https://script.google.com/macros/s/AKfycbwV1A-jhtWiXtEmkeJDXyqohcT3dO6mPe2vxpw_lMTCw5D_i1YJZvPdq70fR8u-a-iQyg/exec";

  // Inicialização
  window.onload = function() {
    loadProducts();
    loadHistory();
    setupModal();
  };

  // Carrega Produtos do Backend
  async function loadProducts() {
    try {
      const response = await fetch(`${API_URL}?action=getProducts&t=${new Date().getTime()}`);
      const text = await response.text(); // Lê como texto primeiro para debug
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Erro: A resposta não é um JSON válido. Resposta recebida:", text);
        throw new Error("Erro de Permissão ou Script (Verifique o Console)");
      }

      populateProductSelect(data);
    } catch (error) {
      showError(error);
    }
  }

  function populateProductSelect(products) {
    const input = document.getElementById('produto');
    const list = document.getElementById('suggestions-list');
    
    if (!Array.isArray(products) || products.length === 0) {
      input.placeholder = "Nenhum produto encontrado";
      return;
    }

    allProducts = products; // Salva na variável global
    input.disabled = false;
    input.placeholder = "Digite para buscar...";

    // Configura o Autocomplete
    setupAutocomplete(input, list);
  }

  function setupAutocomplete(input, list) {
    const filterAndShow = (value) => {
      list.innerHTML = '';
      const term = value.toLowerCase();
      const filtered = allProducts.filter(p => p.toLowerCase().includes(term));

      if (filtered.length > 0) {
        filtered.forEach(prod => {
          const li = document.createElement('li');
          li.textContent = prod;
          li.onclick = () => {
            input.value = prod;
            list.classList.remove('show');
          };
          list.appendChild(li);
        });
        list.classList.add('show');
      } else {
        list.classList.remove('show');
      }
    };

    // Eventos: Digitar, Focar e Clicar fora
    input.addEventListener('input', (e) => filterAndShow(e.target.value));
    input.addEventListener('focus', (e) => filterAndShow(e.target.value));
    
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !list.contains(e.target)) {
        list.classList.remove('show');
      }
    });
  }

  // Carrega Histórico do Backend
  async function loadHistory() {
    try {
      const response = await fetch(`${API_URL}?action=getHistory&t=${new Date().getTime()}`);
      const text = await response.text();
      
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("Erro no Histórico:", text);
        return; // Falha silenciosa no histórico para não travar a tela
      }

      renderHistory(data);
    } catch (error) {
      console.error("Erro ao carregar histórico", error);
    }
  }

  function renderHistory(data) {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';

    if (!Array.isArray(data) || data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Nenhum lançamento recente.</td></tr>';
      return;
    }

    data.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.data}</td>
        <td>${row.produto}</td>
        <td style="font-weight:bold;">${row.quantidade}</td>
        <td>${row.responsavel}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // --- Lógica do Modal e Histórico Completo ---
  function setupModal() {
    const modal = document.getElementById('historyModal');
    const btn = document.getElementById('btnViewAll');
    const span = document.getElementsByClassName("close-btn")[0];

    btn.onclick = function() {
      modal.classList.add('show');
      loadFullHistory();
    }

    span.onclick = function() {
      modal.classList.remove('show');
    }

    window.onclick = function(event) {
      if (event.target == modal) {
        modal.classList.remove('show');
      }
    }
  }

  async function loadFullHistory() {
    const tbody = document.getElementById('fullHistoryBody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';

    try {
      // Chama a nova ação 'getAllHistory' (Necessário atualizar o Backend)
      const response = await fetch(`${API_URL}?action=getAllHistory&t=${new Date().getTime()}`);
      const data = await response.json();

      tbody.innerHTML = '';
      
      if (data.error) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red;">Erro: ${data.error}<br><small>Verifique se criou uma 'Nova Versão' na implantação.</small></td></tr>`;
        return;
      }

      if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Nenhum registro encontrado.</td></tr>';
        return;
      }

      data.forEach(row => {
        const tr = document.createElement('tr');
        
        // Renderiza bolinha de status
        let statusHtml = row.status;
        const st = (row.status || '').toLowerCase();
        if (st.includes('pendente')) {
          statusHtml = '<span class="status-dot status-pendente" title="Pendente"></span>';
        } else if (st.includes('lançado')) {
          statusHtml = '<span class="status-dot status-lancado" title="Lançado"></span>';
        }

        tr.innerHTML = `
          <td>${row.data}</td>
          <td>${row.produto}</td>
          <td style="font-weight:bold;">${row.quantidade}</td>
          <td>${row.responsavel}</td>
          <td style="text-align: center;">${statusHtml}</td>
        `;
        tbody.appendChild(tr);
      });

    } catch (error) {
      console.error(error);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Erro ao carregar.</td></tr>';
    }
  }

  // Função para atualizar o histórico localmente (sem chamar o servidor)
  function updateLocalHistory(data) {
    const tbody = document.getElementById('historyBody');
    
    // Remove mensagem de "Nenhum lançamento" ou "Carregando"
    if (tbody.rows.length === 1 && tbody.rows[0].cells.length === 1) {
      tbody.innerHTML = '';
    }

    const now = new Date();
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0');
    const hora = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const dataFormatada = `${dia}/${mes} ${hora}:${min}`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${dataFormatada}</td>
      <td>${data.produto}</td>
      <td style="font-weight:bold;">${data.quantidade}</td>
      <td>${data.responsavel}</td>
    `;

    // Insere no topo
    tbody.insertBefore(tr, tbody.firstChild);

    // Mantém apenas 5 itens
    if (tbody.rows.length > 5) {
      tbody.removeChild(tbody.lastChild);
    }
  }

  // Envio do Formulário
  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const btn = document.getElementById('btnSubmit');
    const loading = document.getElementById('loading');
    const form = document.getElementById('entryForm');

    // UI Feedback
    btn.disabled = true;
    btn.innerText = "Processando...";
    loading.style.display = 'block';

    const formData = {
      responsavel: form.responsavel.value,
      produto: form.produto.value,
      quantidade: form.quantidade.value
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();

      loading.style.display = 'none';
      btn.disabled = false;
      btn.innerText = "Confirmar Entrada";

      if (result.success) {
        showToast(result.message, 'success');
        updateLocalHistory(formData); // Atualiza visualmente na hora
        form.reset();
      } else {
        showToast(result.message, 'error');
      }
    } catch (error) {
      loading.style.display = 'none';
      btn.disabled = false;
      btn.innerText = "Confirmar Entrada";
      showToast("Erro de conexão: " + error.message, 'error');
    }
  }

  // Utilitários
  function showToast(message, type) {
    const toast = document.getElementById("toast");
    toast.className = "toast show " + type;
    toast.innerText = message;
    setTimeout(function(){ toast.className = toast.className.replace("show", ""); }, 3000);
  }

  function showError(error) {
    console.error(error);
    showToast("Erro ao carregar dados.", 'error');
  }