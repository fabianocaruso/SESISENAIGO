# MVP_IMPLEMENTATION_PLAN.md

## Objetivo

Orientar o início da implementação do produto de geração confiável de painéis a partir de Excel.

## Fase 0 — Preparação

### Entregáveis

- Confirmar primeiro Excel real para MVP.
- Definir domínio/subdomínios iniciais.
- Definir se a publicação inicial será em DigitalOcean, GitHub Pages, Netlify ou Vercel.
- Definir stack inicial.

### Recomendação inicial de stack

- Backend: Python + Flask.
- Processamento de Excel: openpyxl e/ou pandas.
- Validação de contratos: validações próprias ou biblioteca dedicada em etapa futura.
- Frontend administrativo: React, Vue ou Svelte.
- Renderização: componentes versionados e build estático.
- Testes de interface: Playwright.
- Hospedagem: DigitalOcean para aplicação administrativa e arquivos estáticos.


## Fase 0.1 — App local em Python

### Objetivo

Colocar no ar um servidor local em Python para validar o primeiro fluxo executável do produto.

### Entregáveis

- Aplicação Flask inicial.
- Página simples para upload de Excel.
- Endpoint de healthcheck.
- Endpoint para inspecionar workbook.
- Salvamento do Excel original.
- Geração de `ingestion-report.json`.

### Critérios de aceite

- O app sobe localmente com `python -m flask --app local_panel_app.main run --host=0.0.0.0 --port=8000 --debug`.
- Um usuário consegue enviar `.xlsx` ou `.xlsm`.
- O sistema gera relatório com abas, cabeçalhos, linhas, colunas e prévia.
- Nenhuma IA participa da leitura do arquivo.

## Fase 1 — Ingestão e validação

### Objetivo

Garantir que o sistema leia o Excel de forma determinística e bloqueie erros.

### Entregáveis

- Endpoint ou comando para upload/leitura de Excel.
- Relatório de ingestão.
- Relatório de validação.
- Detecção de abas, linhas e colunas.
- Validação inicial de tipos.
- Bloqueio de publicação se houver erro.

### Critérios de aceite

- O sistema informa quantas abas foram lidas.
- O sistema informa quantas linhas e colunas existem por aba.
- O sistema não descarta dados silenciosamente.
- O sistema bloqueia dados inválidos.

## Fase 2 — Normalização e schema

### Objetivo

Criar o contrato entre dados e painel.

### Entregáveis

- `schema.json`.
- `normalized-dataset.json`.
- `ingestion-report.json`.
- `validation-report.json`.

### Critérios de aceite

- O painel não depende diretamente do Excel.
- O dataset normalizado preserva os dados lidos.
- O schema descreve campos e tipos.

## Fase 3 — Manifesto do painel

### Objetivo

Representar o painel como configuração, não como HTML artesanal.

### Entregáveis

- `manifest.json`.
- Modelo inicial para painel comercial.
- Modelo inicial para painel financeiro.
- Validação de componentes contra schema.

### Critérios de aceite

- Componentes inválidos bloqueiam o build.
- O manifesto identifica template, tema, datasets e componentes.

## Fase 4 — Renderização estática

### Objetivo

Gerar painel HTML5 a partir de componentes estáveis.

### Componentes iniciais

- KPI card.
- Bar chart.
- Line chart.
- Data table.
- Filter bar.
- Insight box.
- CSV export.

### Critérios de aceite

- O mesmo input gera o mesmo painel.
- O layout segue padrão institucional.
- O painel funciona sem backend em runtime.
- O painel carrega dados de arquivos estáticos.

## Fase 5 — IA assistiva

### Objetivo

Adicionar IA sem comprometer dados ou renderização.

### Entregáveis

- Sugestão de visualizações.
- Geração de resumo analítico.
- Registro do prompt, entrada e saída.
- Exibição do texto para revisão antes da publicação.

### Critérios de aceite

- IA não altera dataset.
- IA não gera HTML final.
- Textos são arquivados.
- Afirmações usam métricas calculadas pelo sistema.

## Fase 6 — Publicação

### Objetivo

Publicar painel em URL estável.

### Entregáveis

- Publicação em `paineis.suaempresa.com/{slug}`.
- Build estático arquivado.
- Logs de publicação.
- Tela de aprovação.

### Critérios de aceite

- Painel fica acessível por URL pública.
- Publicação só ocorre após validação e aprovação.
- Artefatos ficam arquivados.

## Backlog pós-MVP

- Histórico de versões.
- Comparação entre versões de dados.
- Mapas e geocodificação.
- Login e permissões.
- Filas assíncronas.
- Banco de dados para projetos.
- Templates customizáveis por instituição.
- Testes visuais automatizados com screenshot.
- Monitoramento de painéis publicados.
