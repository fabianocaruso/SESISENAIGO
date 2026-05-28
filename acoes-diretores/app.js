// Estado Global da Aplicação
const state = {
  actions: [],
  viewMode: 'date',   // 'date' ou 'monthly'
  activeStartDate: '', // Formato YYYY-MM-DD
  activeEndDate: '',   // Formato YYYY-MM-DD
  activeStartMonth: '',// Formato YYYY-MM
  activeEndMonth: '',  // Formato YYYY-MM
  directorName: 'Fabiano Sousa',
  schoolUnit: 'SESI Vila Leopoldina',
  photoBase64: '',    // Armazena a imagem ativa em processamento
  photoMeta: {
    name: '',
    originalSizeKb: 0,
    compressedSizeKb: 0,
    reductionPercent: 0
  }
};

// Dados Mockados Iniciais de Alta Qualidade (Já atendendo ao tamanho do sumário)
const defaultActions = [
  {
    id: "action-1",
    titulo: "Workshop de Metodologias Ativas e Ensino Híbrido",
    assunto: "Pedagógico",
    sumario: "Realização do workshop de Metodologias Ativas para todo o corpo docente do Ensino Médio. Foco especial no uso prático da rotação por estações e ferramentas digitais. Os professores planejaram e entregaram 5 projetos de ensino integrado para serem aplicados já no próximo bimestre, beneficiando cerca de 450 alunos do 1º ao 3º ano.",
    escola: "SESI Vila Leopoldina",
    diretor: "Fabiano Sousa",
    data: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 dias atrás
    evidencia: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop",
    status: "Enviada para Consolidação"
  },
  {
    id: "action-2",
    titulo: "Instalação de Lousas Interativas nas salas do Fundamental II",
    assunto: "Tecnologia",
    sumario: "Implementação e calibração de 5 novas lousas digitais interativas nas salas de aula do Ensino Fundamental II. A equipe de TI ministrou um treinamento prático focado nos recursos didáticos integrados para os professores de Ciências e Matemática, promovendo maior interatividade pedagógica.",
    escola: "SESI Vila Leopoldina",
    diretor: "Fabiano Sousa",
    data: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 dias atrás
    evidencia: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop",
    status: "Enviada para Consolidação"
  },
  {
    id: "action-3",
    titulo: "Reforma Estrutural e Pintura de Segurança da Quadra Poliesportiva",
    assunto: "Infraestrutura",
    sumario: "Finalização das obras de segurança na quadra principal, incluindo reparo nas arquibancadas, troca de tabelas de basquete e pintura antiderrapante de demarcação de segurança. A quadra foi liberada para o torneio de vôlei interescolar, garantindo a segurança física dos alunos e da comunidade participante.",
    escola: "SESI Vila Leopoldina",
    diretor: "Fabiano Sousa",
    data: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 dias atrás (semana passada)
    evidencia: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format&fit=crop",
    status: "Enviada para Consolidação"
  },
  {
    id: "action-4",
    titulo: "Conselho de Classe Participativo - Mapeamento Pedagógico",
    assunto: "Pedagógico",
    sumario: "Reunião pedagógica de fechamento de bimestre envolvendo professores, coordenação e representantes de classe. Mapeamos os alunos com baixo rendimento em exatas e língua portuguesa e traçamos planos individuais de recuperação paralela direcionada para o contraturno escolar.",
    escola: "SESI Vila Leopoldina",
    diretor: "Fabiano Sousa",
    data: new Date().toISOString().split('T')[0], // Hoje
    evidencia: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop",
    status: "Rascunho"
  }
];

// ==========================================================================
// OPERAÇÕES DE SEMANA E MÊS
// ==========================================================================

// Retorna semana no formato YYYY-Www (ex: 2026-W22)
function getWeekCode(dateStr) {
  const date = new Date(dateStr);
  const tempDate = new Date(date.valueOf());
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
  return `${tempDate.getFullYear()}-W${weekNo.toString().padStart(2, '0')}`;
}

// Retorna mês no formato YYYY-MM
function getMonthCode(dateStr) {
  const date = new Date(dateStr);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${date.getFullYear()}-${month}`;
}

// Retorna o intervalo textual de uma semana (Segunda a Domingo)
function getWeekDatesLabel(weekStr) {
  if (!weekStr) return "";
  const parts = weekStr.split('-W');
  const year = parseInt(parts[0], 10);
  const week = parseInt(parts[1], 10);
  
  const jan1 = new Date(year, 0, 1);
  const dayMS = 24 * 60 * 60 * 1000;
  const jan1Day = jan1.getDay() || 7;
  
  let firstMondayMS = jan1.getTime();
  if (jan1Day <= 4) {
    firstMondayMS -= (jan1Day - 1) * dayMS;
  } else {
    firstMondayMS += (8 - jan1Day) * dayMS;
  }
  
  const monday = new Date(firstMondayMS + (week - 1) * 7 * dayMS);
  const sunday = new Date(monday.getTime() + 6 * dayMS);
  
  const fmt = (d) => d.toLocaleDateString('pt-BR');
  return `${fmt(monday)} a ${fmt(sunday)}`;
}

// Retorna o intervalo textual de um mês
function getMonthDatesLabel(monthStr) {
  if (!monthStr) return "";
  const parts = monthStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  const fmt = (d) => d.toLocaleDateString('pt-BR');
  return `${fmt(firstDay)} a ${fmt(lastDay)}`;
}

function formatDateToBr(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatMonthToBr(monthStr) {
  if (!monthStr) return "";
  const [year, month] = monthStr.split('-');
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const monthName = months[parseInt(month, 10) - 1];
  return monthName && year ? `${monthName} de ${year}` : monthStr;
}

function getDateRangeLabel(startDate, endDate) {
  if (!startDate && !endDate) return "Período não definido";
  if (startDate && !endDate) return `A partir de ${formatDateToBr(startDate)}`;
  if (!startDate && endDate) return `Até ${formatDateToBr(endDate)}`;
  return `${formatDateToBr(startDate)} a ${formatDateToBr(endDate)}`;
}

function getMonthRangeLabel(startMonth, endMonth) {
  if (!startMonth && !endMonth) return "Período não definido";
  if (startMonth && !endMonth) return `A partir de ${formatMonthToBr(startMonth)}`;
  if (!startMonth && endMonth) return `Até ${formatMonthToBr(endMonth)}`;
  return `${formatMonthToBr(startMonth)} a ${formatMonthToBr(endMonth)}`;
}

function isDateInActiveRange(dateStr) {
  if (!dateStr) return false;
  const start = state.activeStartDate || '0000-01-01';
  const end = state.activeEndDate || '9999-12-31';
  return dateStr >= start && dateStr <= end;
}

function isMonthInActiveRange(dateStr) {
  if (!dateStr) return false;
  const monthCode = getMonthCode(dateStr);
  const start = state.activeStartMonth || '0000-01';
  const end = state.activeEndMonth || '9999-12';
  return monthCode >= start && monthCode <= end;
}

function getFirstDayOfMonth(monthStr) {
  if (!monthStr) return '';
  return `${monthStr}-01`;
}

function getLastDayOfMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${monthStr}-${String(lastDay).padStart(2, '0')}`;
}

// ==========================================================================
// COMPRESSÃO E EVIDÊNCIA FOTOGRÁFICA
// ==========================================================================

function handleImageCompression(file) {
  const originalSizeKb = Math.round(file.size / 1024);
  state.photoMeta.name = file.name;
  state.photoMeta.originalSizeKb = originalSizeKb;

  const reader = new FileReader();
  reader.onload = function(event) {
    const img = new Image();
    img.onload = function() {
      // Redimensionamento máximo
      const maxDim = 900;
      let width = img.width;
      let height = img.height;
      
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);
      
      // Comprimir como JPEG 70%
      const base64Data = canvas.toDataURL('image/jpeg', 0.7);
      
      // Estimar tamanho comprimido em KB a partir do base64
      const headSize = base64Data.indexOf(',') + 1;
      const compressedSizeKb = Math.round(((base64Data.length - headSize) * 0.75) / 1024);
      const reduction = Math.round((1 - (compressedSizeKb / originalSizeKb)) * 100);
      
      state.photoBase64 = base64Data;
      state.photoMeta.compressedSizeKb = compressedSizeKb;
      state.photoMeta.reductionPercent = reduction > 0 ? reduction : 0;
      
      // Atualizar a UI
      document.getElementById('image-preview').src = base64Data;
      document.getElementById('meta-name').textContent = file.name;
      document.getElementById('meta-size-orig').textContent = `${originalSizeKb} KB`;
      document.getElementById('meta-size-comp').textContent = `${compressedSizeKb} KB`;
      document.getElementById('meta-percent').textContent = `${state.photoMeta.reductionPercent}%`;
      
      document.getElementById('preview-container').classList.remove('hidden');
      document.querySelector('.drop-zone-content').classList.add('hidden');
      
      // Ocultar mensagem de erro se houver
      document.getElementById('photo-error').classList.add('hidden');
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// ==========================================================================
// QUALIDADE DE ESCRITA DO SUMÁRIO (MEDIDOR)
// ==========================================================================

function updateSummaryQuality(text) {
  const len = text.length;
  const indicator = document.getElementById('quality-indicator');
  const label = document.getElementById('quality-text');
  
  if (len < 60) {
    indicator.style.width = "20%";
    indicator.style.backgroundColor = "var(--danger)";
    label.textContent = "Qualidade: Muito curto (mínimo de 60)";
    label.style.color = "var(--danger)";
  } else if (len >= 60 && len < 150) {
    indicator.style.width = "45%";
    indicator.style.backgroundColor = "var(--amber)";
    label.textContent = "Qualidade: Razoável (adicione mais contexto)";
    label.style.color = "var(--amber)";
  } else if (len >= 150 && len < 800) {
    indicator.style.width = "85%";
    indicator.style.backgroundColor = "var(--success)";
    label.textContent = "Qualidade: Excelente (ótimo nível de detalhamento)";
    label.style.color = "var(--success)";
  } else {
    indicator.style.width = "100%";
    indicator.style.backgroundColor = "var(--blue)";
    label.textContent = "Qualidade: Longo (resumido e executivo)";
    label.style.color = "var(--blue)";
  }
}

// ==========================================================================
// RENDERIZAÇÃO DA INTERFACE (DASHBOARD)
// ==========================================================================

function render() {
  const grid = document.getElementById('actions-grid');
  const emptyState = document.getElementById('empty-state');
  
  // Filtros
  const filterSubject = document.getElementById('filter-subject').value;
  const filterStatus = document.getElementById('filter-status').value;
  const searchQuery = document.getElementById('search-query').value.toLowerCase().trim();
  
  // Atualizar textos e metadados de impressão
  const labelPeriod = document.getElementById('label-active-period');
  const printPeriodDates = document.getElementById('print-period-dates');
  
  if (state.viewMode === 'date') {
    const range = getDateRangeLabel(state.activeStartDate, state.activeEndDate);
    labelPeriod.innerHTML = `<i data-lucide="calendar"></i> Exibindo relatório por <strong>intervalo de datas</strong> (${range})`;
    printPeriodDates.textContent = range;
    document.getElementById('print-period-badge').textContent = 'Por Data';
  } else {
    const monthRange = getMonthRangeLabel(state.activeStartMonth, state.activeEndMonth);
    const dateRange = getDateRangeLabel(state.activeStartDate, state.activeEndDate);
    labelPeriod.innerHTML = `<i data-lucide="calendar"></i> Exibindo relatório por <strong>intervalo de meses</strong>: ${monthRange} &mdash; <span class="period-date-range">${dateRange}</span>`;
    printPeriodDates.textContent = `${monthRange} — ${dateRange}`;
    document.getElementById('print-period-badge').textContent = 'Por Mês';
  }

  // Filtrar dados por período (ambos os modos usam intervalo de datas)
  let filtered = state.actions.filter(a => isDateInActiveRange(a.data));
  
  // Calcular KPIs no período selecionado
  const total = filtered.length;
  const sent = filtered.filter(a => a.status === 'Enviada para Consolidação').length;
  const photos = filtered.filter(a => a.evidencia && a.evidencia.trim() !== '').length;
  const rate = total > 0 ? Math.round((sent / total) * 100) : 0;
  
  document.getElementById('kpi-total').textContent = total;
  document.getElementById('kpi-sent').textContent = sent;
  document.getElementById('kpi-photos').textContent = photos;
  document.getElementById('kpi-rate').textContent = `${rate}%`;
  
  // Filtros Secundários
  if (filterSubject !== 'todos') {
    filtered = filtered.filter(a => a.assunto === filterSubject);
  }
  if (filterStatus !== 'todos') {
    filtered = filtered.filter(a => a.status === filterStatus);
  }
  if (searchQuery) {
    filtered = filtered.filter(a => 
      a.titulo.toLowerCase().includes(searchQuery) ||
      a.sumario.toLowerCase().includes(searchQuery)
    );
  }
  
  grid.innerHTML = "";
  
  if (filtered.length === 0) {
    grid.classList.add('hidden');
    emptyState.classList.remove('hidden');
  } else {
    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');
    
    // Injetar Cards
    filtered.forEach(action => {
      const card = document.createElement('div');
      card.className = "action-card";
      
      const badgeClass = `badge-${action.assunto.toLowerCase().split('/')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, "")}`;
      
      let imgHtml = '';
      if (action.evidencia) {
        imgHtml = `
          <div class="card-image-wrapper" onclick="openLightbox('${action.evidencia}', '${action.titulo.replace(/'/g, "\\'")}')">
            <img src="${action.evidencia}" class="card-image" alt="Foto Evidência">
          </div>
        `;
      } else {
        imgHtml = `
          <div class="card-image-wrapper">
            <div class="card-no-image">
              <i data-lucide="image-off"></i>
              <span>Sem evidência anexada</span>
            </div>
          </div>
        `;
      }
      
      const isSent = action.status === 'Enviada para Consolidação';
      const statusClass = isSent ? 'status-enviada' : 'status-rascunho';
      const statusText = isSent ? 'Enviada' : 'Rascunho';
      
      card.innerHTML = `
        ${imgHtml}
        <div class="card-body">
          <div class="card-header-info">
            <span class="badge ${badgeClass}">${action.assunto}</span>
            <span class="card-date">
              <i data-lucide="calendar"></i>
              ${formatDateToBr(action.data)}
            </span>
          </div>
          <h3 class="card-title">${action.titulo}</h3>
          <p class="card-summary">${action.sumario.replace(/\n/g, '<br>')}</p>
          <div class="card-footer">
            <div class="status-badge ${statusClass}">
              <div class="status-dot"></div>
              <span>${statusText}</span>
            </div>
            <div class="card-actions no-print">
              <button class="btn-card-action btn-print-card" onclick="printIndividualAction('${action.id}')" title="Imprimir Ação">
                <i data-lucide="printer"></i>
              </button>
              <button class="btn-card-action btn-edit" onclick="editAction('${action.id}')" title="Editar Ação">
                <i data-lucide="edit-2"></i>
              </button>
              <button class="btn-card-action btn-delete" onclick="deleteAction('${action.id}')" title="Excluir Ação">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  }
  
  lucide.createIcons();
}

// ==========================================================================
// EXCLUSÃO E EDIÇÃO
// ==========================================================================

window.editAction = function(id) {
  const action = state.actions.find(a => a.id === id);
  if (!action) return;
  
  clearValidationMessages();
  
  document.getElementById('action-id').value = action.id;
  document.getElementById('action-title').value = action.titulo;
  document.getElementById('action-subject').value = action.assunto;
  document.getElementById('action-date').value = action.data;
  document.getElementById('action-status').value = action.status;
  
  const txtArea = document.getElementById('action-summary');
  txtArea.value = action.sumario;
  document.getElementById('char-count').textContent = action.sumario.length;
  updateSummaryQuality(action.sumario);
  
  document.getElementById('action-modal-title').textContent = "Editar Ação Estratégica";
  
  // Imagem
  if (action.evidencia) {
    state.photoBase64 = action.evidencia;
    document.getElementById('image-preview').src = action.evidencia;
    document.getElementById('meta-name').textContent = "Arquivo salvo";
    document.getElementById('meta-size-orig').textContent = "-";
    document.getElementById('meta-size-comp').textContent = "-";
    document.getElementById('meta-percent').textContent = "-";
    document.getElementById('preview-container').classList.remove('hidden');
    document.querySelector('.drop-zone-content').classList.add('hidden');
  } else {
    state.photoBase64 = "";
    document.getElementById('preview-container').classList.add('hidden');
    document.querySelector('.drop-zone-content').classList.remove('hidden');
  }
  
  document.getElementById('action-modal').classList.remove('hidden');
};

window.deleteAction = function(id) {
  if (confirm("Deseja realmente remover esta ação estratégica?")) {
    state.actions = state.actions.filter(a => a.id !== id);
    localStorage.setItem('acoes_estrategicas_db', JSON.stringify(state.actions));
    render();
  }
};

// ==========================================================================
// OPERAÇÃO DE IMPRESSÃO
// ==========================================================================

// Imprimir Ação Individual em layout de uma página estruturado
window.printIndividualAction = function(id) {
  const card = state.actions.find(a => a.id === id);
  if (!card) return;
  
  // Criar div temporária
  const printDiv = document.createElement('div');
  printDiv.className = 'temp-print-area';
  
  const imgHtml = card.evidencia ? `
    <div class="print-img-container">
      <img src="${card.evidencia}" alt="Foto de evidência da ação">
    </div>
  ` : '<p><em>Nenhuma evidência fotográfica registrada.</em></p>';
  
  const dateFormatted = formatDateToBr(card.data);
  const badgeClass = `badge-${card.assunto.toLowerCase().split('/')[0].normalize('NFD').replace(/[\u0300-\u036f]/g, "")}`;
  
  printDiv.innerHTML = `
    <div class="print-header">
      <div class="print-header-top">
        <h2>Relatório de Ação Estratégica Individual</h2>
        <span class="print-badge">${card.assunto}</span>
      </div>
      <div class="print-header-details">
        <div><strong>Unidade Escolar:</strong> ${card.escola}</div>
        <div><strong>Diretor(a):</strong> ${card.diretor}</div>
        <div><strong>Data da Ação:</strong> ${dateFormatted}</div>
        <div><strong>Status da Ação:</strong> ${card.status}</div>
      </div>
    </div>
    
    <div class="print-body-content">
      <h3 class="print-action-title">${card.titulo}</h3>
      
      <div class="print-section">
        <h4>Sumário Executivo</h4>
        <p class="print-summary-text">${card.sumario.replace(/\n/g, '<br>')}</p>
      </div>
      
      <div class="print-section">
        <h4>Evidência Fotográfica</h4>
        ${imgHtml}
      </div>
    </div>
    
    <div class="print-signature-block">
      <div class="signature-line">
        <div class="line"></div>
        <p class="name">${card.diretor}</p>
        <p class="role">Diretor(a) da Unidade Escolar</p>
      </div>
      <div class="signature-line">
        <div class="line"></div>
        <p class="name">______________________________________</p>
        <p class="role">Supervisor(a) de Ensino Regional</p>
      </div>
    </div>
    <img src="marca-fieg.svg" alt="Sistema FIEG SESI SENAI IEL" class="print-footer-logo">
  `;
  
  document.body.appendChild(printDiv);
  document.body.classList.add('printing-individual');
  
  // Chamar o prompt de impressão
  setTimeout(() => {
    window.print();
    document.body.removeChild(printDiv);
    document.body.classList.remove('printing-individual');
  }, 100);
};

// ==========================================================================
// EXPORTAÇÕES (CSV COMPATÍVEL COM EXCEL BRASILEIRO)
// ==========================================================================

function exportToCSV() {
  let periodActions = state.actions.filter(a => {
    if (state.viewMode === 'date') {
      return isDateInActiveRange(a.data);
    } else {
      return isMonthInActiveRange(a.data);
    }
  });
  
  if (periodActions.length === 0) {
    alert("Nenhuma ação cadastrada neste período para exportação.");
    return;
  }
  
  const headers = ['ID', 'Data da Ação', 'Categoria', 'Título da Ação', 'Sumário Executivo', 'Unidade Escolar', 'Diretor Responsável', 'Status'];
  
  const rows = [headers.join(';')];
  
  periodActions.forEach(action => {
    // Sanitização e formatação para Excel
    // Substituir aspas por aspas duplas, quebras de linhas por espaços simples
    const cleanTitle = action.titulo.replace(/"/g, '""');
    const cleanSummary = action.sumario.replace(/"/g, '""').replace(/\n/g, ' ');
    const cleanSchool = action.escola.replace(/"/g, '""');
    const cleanDirector = action.diretor.replace(/"/g, '""');
    
    const row = [
      action.id,
      formatDateToBr(action.data),
      action.assunto,
      `"${cleanTitle}"`,
      `"${cleanSummary}"`,
      `"${cleanSchool}"`,
      `"${cleanDirector}"`,
      action.status
    ];
    rows.push(row.join(';'));
  });
  
  // Utilizar o cabeçalho UTF-8 BOM (\uFEFF) para garantir leitura de acentos no Excel Windows
  const csvContent = "\uFEFF" + rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const filePeriod = state.viewMode === 'date'
    ? `Datas-${state.activeStartDate || 'inicio'}-a-${state.activeEndDate || 'fim'}`
    : `Meses-${state.activeStartMonth || 'inicio'}-a-${state.activeEndMonth || 'fim'}`;
  link.setAttribute("download", `Acoes-Estrategicas-${state.schoolUnit.replace(/\s+/g, '-')}-${filePeriod}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================================================
// VALIDAÇÃO DE CAMPOS E SUBMISSÃO
// ==========================================================================

function clearValidationMessages() {
  document.querySelectorAll('.validation-message').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.input-control').forEach(el => el.classList.remove('invalid'));
  document.getElementById('drop-zone').style.borderColor = "var(--border-color)";
}

function validateActionForm() {
  clearValidationMessages();
  let isValid = true;
  let firstErrorField = null;
  
  // Título (10 a 100 caracteres)
  const title = document.getElementById('action-title');
  if (title.value.trim().length < 10 || title.value.trim().length > 100) {
    document.getElementById('title-error').classList.remove('hidden');
    title.classList.add('invalid');
    isValid = false;
    if (!firstErrorField) firstErrorField = title;
  }
  
  // Categoria
  const subject = document.getElementById('action-subject');
  if (!subject.value) {
    document.getElementById('subject-error').classList.remove('hidden');
    subject.classList.add('invalid');
    isValid = false;
    if (!firstErrorField) firstErrorField = subject;
  }
  
  // Data
  const date = document.getElementById('action-date');
  if (!date.value) {
    document.getElementById('date-error').classList.remove('hidden');
    date.classList.add('invalid');
    isValid = false;
    if (!firstErrorField) firstErrorField = date;
  }
  
  // Sumário (mínimo 60 caracteres)
  const summary = document.getElementById('action-summary');
  if (summary.value.trim().length < 60) {
    document.getElementById('summary-error').classList.remove('hidden');
    summary.classList.add('invalid');
    isValid = false;
    if (!firstErrorField) firstErrorField = summary;
  }
  
  // Evidência Fotográfica Obrigatória
  if (!state.photoBase64) {
    document.getElementById('photo-error').classList.remove('hidden');
    document.getElementById('drop-zone').style.borderColor = "var(--danger)";
    isValid = false;
    if (!firstErrorField) firstErrorField = document.getElementById('drop-zone');
  }
  
  if (firstErrorField) {
    firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  
  return isValid;
}

// ==========================================================================
// INICIALIZAÇÃO DA APLICAÇÃO
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Configurações de Perfil
  const cachedName = localStorage.getItem('diretor_nome');
  const cachedSchool = localStorage.getItem('diretor_escola');
  
  if (cachedName) state.directorName = cachedName;
  if (cachedSchool) state.schoolUnit = cachedSchool;
  
  // Atualizar visual do perfil
  document.getElementById('sidebar-director-name').textContent = state.directorName;
  document.getElementById('sidebar-school-name').textContent = state.schoolUnit;
  document.getElementById('print-school-name').textContent = state.schoolUnit;
  document.getElementById('print-director-name').textContent = state.directorName;
  document.getElementById('print-sig-director-name').textContent = state.directorName;
  
  document.getElementById('user-name').value = state.directorName;
  document.getElementById('user-school').value = state.schoolUnit;
  
  // Carregar dados de ações do LocalStorage
  const stored = localStorage.getItem('acoes_estrategicas_db');
  if (stored) {
    state.actions = JSON.parse(stored);
  } else {
    state.actions = [...defaultActions];
    localStorage.setItem('acoes_estrategicas_db', JSON.stringify(state.actions));
  }
  
  // Inicializar períodos padrão (semana atual para datas e mês atual para meses)
  const today = new Date();
  const todayIso = today.toISOString().split('T')[0];
  const dayOfWeek = today.getDay() || 7;
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek + 1);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  state.activeStartDate = startOfWeek.toISOString().split('T')[0];
  state.activeEndDate = endOfWeek.toISOString().split('T')[0];
  state.activeStartMonth = getMonthCode(todayIso);
  state.activeEndMonth = getMonthCode(todayIso);

  document.getElementById('date-start-picker').value = state.activeStartDate;
  document.getElementById('date-end-picker').value = state.activeEndDate;
  document.getElementById('month-start-picker').value = state.activeStartMonth;
  document.getElementById('month-end-picker').value = state.activeEndMonth;

  // Inicializar refinamento de datas para o modo mensal (primeiro/último dia do mês atual)
  const monthRefineStart = getFirstDayOfMonth(state.activeStartMonth);
  const monthRefineEnd = getLastDayOfMonth(state.activeEndMonth);
  const refineStartEl = document.getElementById('month-refine-start');
  const refineEndEl = document.getElementById('month-refine-end');
  refineStartEl.value = monthRefineStart;
  refineEndEl.value = monthRefineEnd;
  refineStartEl.min = monthRefineStart;
  refineStartEl.max = monthRefineEnd;
  refineEndEl.min = monthRefineStart;
  refineEndEl.max = monthRefineEnd;
  
  render();
  
  // --- EVENT BINDING ---
  
  // Toggle de visualização (Data vs Mês)
  document.getElementById('btn-view-weekly').addEventListener('click', (e) => {
    e.target.classList.add('active');
    document.getElementById('btn-view-monthly').classList.remove('active');
    document.getElementById('group-date-range').classList.remove('hidden');
    document.getElementById('group-month-range').classList.add('hidden');
    state.viewMode = 'date';
    // Restaurar datas do modo de data
    state.activeStartDate = document.getElementById('date-start-picker').value;
    state.activeEndDate = document.getElementById('date-end-picker').value;
    render();
  });

  document.getElementById('btn-view-monthly').addEventListener('click', (e) => {
    e.target.classList.add('active');
    document.getElementById('btn-view-weekly').classList.remove('active');
    document.getElementById('group-month-range').classList.remove('hidden');
    document.getElementById('group-date-range').classList.add('hidden');
    state.viewMode = 'monthly';
    // Ao entrar no modo mensal, usar as datas refinadas do modo mensal
    const refineStart = document.getElementById('month-refine-start').value;
    const refineEnd = document.getElementById('month-refine-end').value;
    if (refineStart) state.activeStartDate = refineStart;
    if (refineEnd) state.activeEndDate = refineEnd;
    render();
  });

  // Inputs de Período (modo Por Data)
  document.getElementById('date-start-picker').addEventListener('change', (e) => {
    state.activeStartDate = e.target.value;
    if (state.activeEndDate && state.activeStartDate > state.activeEndDate) {
      state.activeEndDate = state.activeStartDate;
      document.getElementById('date-end-picker').value = state.activeEndDate;
    }
    render();
  });

  document.getElementById('date-end-picker').addEventListener('change', (e) => {
    state.activeEndDate = e.target.value;
    if (state.activeStartDate && state.activeEndDate < state.activeStartDate) {
      state.activeStartDate = state.activeEndDate;
      document.getElementById('date-start-picker').value = state.activeStartDate;
    }
    render();
  });

  // Seletores de Mês — ao mudar, recalcula os limites e reseta os campos de refinamento
  document.getElementById('month-start-picker').addEventListener('change', (e) => {
    state.activeStartMonth = e.target.value;
    if (state.activeEndMonth && state.activeStartMonth > state.activeEndMonth) {
      state.activeEndMonth = state.activeStartMonth;
      document.getElementById('month-end-picker').value = state.activeEndMonth;
    }
    // Recalcular e atualizar refinamento de datas
    const newStart = getFirstDayOfMonth(state.activeStartMonth);
    const newEnd = getLastDayOfMonth(state.activeEndMonth);
    state.activeStartDate = newStart;
    state.activeEndDate = newEnd;
    document.getElementById('month-refine-start').value = newStart;
    document.getElementById('month-refine-end').value = newEnd;
    document.getElementById('month-refine-start').min = newStart;
    document.getElementById('month-refine-start').max = newEnd;
    document.getElementById('month-refine-end').min = newStart;
    document.getElementById('month-refine-end').max = newEnd;
    render();
  });

  document.getElementById('month-end-picker').addEventListener('change', (e) => {
    state.activeEndMonth = e.target.value;
    if (state.activeStartMonth && state.activeEndMonth < state.activeStartMonth) {
      state.activeStartMonth = state.activeEndMonth;
      document.getElementById('month-start-picker').value = state.activeStartMonth;
    }
    // Recalcular e atualizar refinamento de datas
    const newStart = getFirstDayOfMonth(state.activeStartMonth);
    const newEnd = getLastDayOfMonth(state.activeEndMonth);
    state.activeStartDate = newStart;
    state.activeEndDate = newEnd;
    document.getElementById('month-refine-start').value = newStart;
    document.getElementById('month-refine-end').value = newEnd;
    document.getElementById('month-refine-start').min = newStart;
    document.getElementById('month-refine-start').max = newEnd;
    document.getElementById('month-refine-end').min = newStart;
    document.getElementById('month-refine-end').max = newEnd;
    render();
  });

  // Refinamento de datas dentro do intervalo de meses
  document.getElementById('month-refine-start').addEventListener('change', (e) => {
    state.activeStartDate = e.target.value;
    if (state.activeEndDate && state.activeStartDate > state.activeEndDate) {
      state.activeEndDate = state.activeStartDate;
      document.getElementById('month-refine-end').value = state.activeEndDate;
    }
    render();
  });

  document.getElementById('month-refine-end').addEventListener('change', (e) => {
    state.activeEndDate = e.target.value;
    if (state.activeStartDate && state.activeEndDate < state.activeStartDate) {
      state.activeStartDate = state.activeEndDate;
      document.getElementById('month-refine-start').value = state.activeStartDate;
    }
    render();
  });
  
  // Filtros de seleção
  document.getElementById('filter-subject').addEventListener('change', render);
  document.getElementById('filter-status').addEventListener('change', render);
  document.getElementById('search-query').addEventListener('input', render);
  
  // Botões de Novo Cadastro
  document.getElementById('btn-new-action').addEventListener('click', () => {
    clearValidationMessages();
    document.getElementById('form-action').reset();
    document.getElementById('action-id').value = "";
    document.getElementById('action-modal-title').textContent = "Cadastrar Ação Estratégica";
    document.getElementById('char-count').textContent = "0";
    updateSummaryQuality("");
    
    state.photoBase64 = "";
    document.getElementById('preview-container').classList.add('hidden');
    document.querySelector('.drop-zone-content').classList.remove('hidden');
    
    document.getElementById('action-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('action-modal').classList.remove('hidden');
  });
  
  document.getElementById('btn-empty-new-action').addEventListener('click', () => {
    document.getElementById('btn-new-action').click();
  });
  
  // Fechar Modais
  document.querySelectorAll('.btn-close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    });
  });
  
  // Perfil / Identificação do Diretor
  document.getElementById('btn-open-user-modal').addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('user-modal').classList.remove('hidden');
  });
  
  document.getElementById('btn-edit-user').addEventListener('click', () => {
    document.getElementById('user-modal').classList.remove('hidden');
  });
  
  document.getElementById('form-user').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('user-name').value.trim();
    const school = document.getElementById('user-school').value.trim();
    
    if (name && school) {
      state.directorName = name;
      state.schoolUnit = school;
      
      localStorage.setItem('diretor_nome', name);
      localStorage.setItem('diretor_escola', school);
      
      document.getElementById('sidebar-director-name').textContent = name;
      document.getElementById('sidebar-school-name').textContent = school;
      document.getElementById('print-school-name').textContent = school;
      document.getElementById('print-director-name').textContent = name;
      document.getElementById('print-sig-director-name').textContent = name;
      
      document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
      
      // Sobrescrever também diretor/escola das ações padrão se necessário para exibição
      state.actions.forEach(a => {
        if (a.diretor === "Fabiano Sousa") a.diretor = name;
        if (a.escola === "SESI Vila Leopoldina") a.escola = school;
      });
      localStorage.setItem('acoes_estrategicas_db', JSON.stringify(state.actions));
      
      render();
    }
  });
  
  // Guia contextual de ajuda do sumário
  document.getElementById('btn-toggle-guide').addEventListener('click', () => {
    document.getElementById('guide-box').classList.toggle('hidden');
  });
  
  // Evento de input do sumário para qualidade e contagem
  document.getElementById('action-summary').addEventListener('input', (e) => {
    const text = e.target.value;
    document.getElementById('char-count').textContent = text.length;
    updateSummaryQuality(text);
  });
  
  // Drag & Drop
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('file-input');
  
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  
  ['dragleave', 'dragend'].forEach(type => {
    dropZone.addEventListener(type, () => dropZone.classList.remove('dragover'));
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      handleImageCompression(files[0]);
    }
  });
  
  fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleImageCompression(files[0]);
    }
  });
  
  // Remover foto ativa do formulário
  document.getElementById('btn-remove-photo').addEventListener('click', (e) => {
    e.stopPropagation();
    state.photoBase64 = "";
    document.getElementById('preview-container').classList.add('hidden');
    document.querySelector('.drop-zone-content').classList.remove('hidden');
    fileInput.value = "";
  });
  
  // Submissão do Formulário de Cadastro
  document.getElementById('form-action').addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!validateActionForm()) return;
    
    const id = document.getElementById('action-id').value;
    const titulo = document.getElementById('action-title').value.trim();
    const assunto = document.getElementById('action-subject').value;
    const data = document.getElementById('action-date').value;
    const status = document.getElementById('action-status').value;
    const sumario = document.getElementById('action-summary').value.trim();
    
    const actionObj = {
      titulo,
      assunto,
      data,
      status,
      sumario,
      escola: state.schoolUnit,
      diretor: state.directorName,
      evidencia: state.photoBase64
    };
    
    if (id) {
      // Editar existente
      actionObj.id = id;
      state.actions = state.actions.map(a => a.id === id ? actionObj : a);
    } else {
      // Criar nova
      actionObj.id = `action-${Date.now()}`;
      state.actions.push(actionObj);
    }
    
    localStorage.setItem('acoes_estrategicas_db', JSON.stringify(state.actions));
    
    document.querySelectorAll('.modal-overlay').forEach(el => el.classList.add('hidden'));
    render();
  });
  
  // Exportações
  document.getElementById('btn-export-csv').addEventListener('click', exportToCSV);
  document.getElementById('btn-export-pdf').addEventListener('click', () => {
    // Definir metadados finais de impressão
    document.getElementById('print-school-name').textContent = state.schoolUnit;
    document.getElementById('print-director-name').textContent = state.directorName;
    document.getElementById('print-generation-date').textContent = new Date().toLocaleDateString('pt-BR');
    window.print();
  });
  
  // Lightbox Imagem
  window.openLightbox = function(src, caption) {
    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const cap = document.getElementById('lightbox-caption');
    
    img.src = src;
    cap.textContent = caption;
    modal.classList.remove('hidden');
  };
  
  document.querySelector('.btn-close-lightbox').addEventListener('click', () => {
    document.getElementById('lightbox-modal').classList.add('hidden');
  });
  
  document.getElementById('lightbox-modal').addEventListener('click', (e) => {
    if (e.target.id === 'lightbox-modal') {
      document.getElementById('lightbox-modal').classList.add('hidden');
    }
  });
});
