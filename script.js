// Chave para identificarr os dados salvos pela nossa aplicação no navegador.
const STORAGE_KEY = 'prompts_storage';

//Estado carregar os prompts salvos e exibir.
const state = {
  prompts: [],
  selectedId: null,
}


// Seletores dos elementos HTML por ID.
const elements = {
  promptTitle: document.getElementById('prompt-title'),
  promptContent: document.getElementById('prompt-content'),
  titleWrapper: document.getElementById('title-wrapper'),
  contentWrapper: document.getElementById('content-wrapper'),
  btnOpen: document.getElementById('btn-open'),
  btnCollapse: document.getElementById('btn-collapse'),
  sidebar: document.querySelector('.sidebar'),
  btnSave: document.getElementById('btn-save'),
  list: document.getElementById('prompt-list'),
  search: document.getElementById('search-input'),
  btnNew: document.getElementById('btn-new'),
  btnCopy: document.getElementById('btn-copy'),
};


// Atualiza o estado do wrapper conforme o conteúdo do elemento.
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0;
  wrapper.classList.toggle('is-empty', !hasText);
}


// Abre a barra lateral.
function openSidebar() {
  elements.sidebar.classList.add("open");
  elements.sidebar.classList.remove("collapsed");
}


// Colapsa a barra lateral.
function collapseSidebar() {
  elements.sidebar.classList.remove("open");
  elements.sidebar.classList.add("collapsed");
}


// Atualiza o estado de todos os elementos.
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
}


// Anexa os manipuladores de eventos para todos os elementos editáveis.
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper);
  });

  elements.promptContent.addEventListener('input', () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper);
  });
}


// Salva o prompt atual.
function save() {
  const title = elements.promptTitle.textContent.trim();
  const content = elements.promptContent.innerHTML.trim();
  const hasContent = elements.promptContent.textContent.trim();

  if (!title || !hasContent) {
    alert('Título e conteúdo não podem estar vazios.');
    return;
  }

  if (state.selectedId) {
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId);

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título";
      existingPrompt.content = content || "Sem conteúdo";
    }
  } else {
    const newPrompt = {
      id: Date.now().toString(36),
      title,
      content,
  }
  state.prompts.unshift(newPrompt);
  state.selectedId = newPrompt.id;
  }

  renderList(elements.search.value);
  persist();
  alert('Prompt salvo com sucesso!');
}


// Persiste os dados no localStorage.
function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts));
  } catch (error) {
    console.log('Erro ao salvar no localStorage:', error);
  }
}


// Carrega os dados do localStorage.
function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY);
    state.prompts = storage ? JSON.parse(storage) : [];
    state.selectedId = null;
  } catch (error) {
    console.log('Erro ao carregar do localStorage:', error);
  }
}


// Cria o HTML de um item de prompt.
function createPromptItem(prompt) {
  const tmp = document.createElement('div');
  tmp.innerHTML = prompt.content;
  return `
      <li class="prompt-item" data-id="${prompt.id}" data-action="select">
        <div class="prompt-item-content">
          <span class="prompt-item-title">${prompt.title}</span>
          <span class="prompt-item-description">${tmp.textContent}</span>
        </div>
        
        <button class="btn-icon" title="Remover" data-action="remove">
          <img src="assets/remove.svg" alt="Remover" class="icon icon-trash" />
        </button>
      </li>
  `
}


// Renderiza a lista de prompts, opcionalmente filtrando por texto.
function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("");

  elements.list.innerHTML = filteredPrompts;
}


// Cria um novo prompt.
function newPrompt() {
  state.selectedId = null;
  elements.promptTitle.textContent = "";
  elements.promptContent.innerHTML = "";
  updateAllEditableStates();
  elements.promptTitle.focus();
}


function copySelected() {
  try {
    const content = elements.promptContent;

    if (!navigator.clipboard) {
      console.error('A API de área de transferência não é suportada neste navegador.');
      return;
    }

    navigator.clipboard.writeText(content.innerText);

    alert('Conteúdo copiado para a área de transferência!');
  } catch (error) {
    console.log('Erro ao copiar para a área de transferência:', error);
  }
}


// Eventos.
elements.btnSave.addEventListener('click', save);
elements.btnNew.addEventListener('click', newPrompt);
elements.btnCopy.addEventListener('click', copySelected);

elements.search.addEventListener('input', (event) => {
  renderList(event.target.value);
});

elements.list.addEventListener('click', function (event) {
  const removeBtn = event.target.closest("[data-action='remove']");
  const item = event.target.closest("[data-id]");

  if (!item) return;

  const id = item.getAttribute('data-id');
  state.selectedId = id;

  if (removeBtn) {
    state.prompts = state.prompts.filter((p) => p.id !== id);
    renderList(elements.search.value);
    persist();
    return;
  }
  if (event.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id ===id);

    if (prompt) {
      elements.promptTitle.textContent = prompt.title;
      elements.promptContent.innerHTML = prompt.content;
      updateAllEditableStates();
    }
  }
});


// Inicializa a aplicação.
function init() {
  load();
  renderList("");
  attachAllEditableHandlers();
  updateAllEditableStates();

  elements.sidebar.classList.remove("open");
  elements.sidebar.classList.remove("collapsed");

  elements.btnOpen.addEventListener('click', openSidebar);
  elements.btnCollapse.addEventListener('click', collapseSidebar);
}


init();
