# Status do Projeto — Gerador Confiável de Painéis

## 1. Objetivo do produto

O objetivo do projeto é transformar o fluxo atual de geração artesanal de painéis em um produto confiável, repetível e auditável para criação de painéis interativos a partir de planilhas Excel.

O fluxo-alvo é:

```text
Excel → ingestão determinística → validação → normalização → geração estática → publicação no Cloudflare Pages
```

A IA não deve ser responsável por ler dados, corrigir planilhas ou gerar HTML final de produção. O papel da IA será assistivo: textos analíticos, sugestões de visualização e apoio à interpretação, sempre com dados calculados pelo sistema.

## 2. O que já foi implementado

### 2.1. Aplicação local Flask

Foi criada uma aplicação local isolada em `local_panel_app/` para testes de ingestão.

Recursos disponíveis:

- `GET /health`: verifica se o app está ativo.
- `GET /`: página simples com formulário para upload de Excel.
- `POST /api/workbooks`: recebe `.xlsx` ou `.xlsm`, salva o arquivo original e gera um relatório de ingestão.

O app salva arquivos em:

```text
storage/original/{project_id}/
storage/processed/{project_id}/ingestion-report.json
```

### 2.2. Serviço de inspeção de Excel

Foi criado o serviço `inspect_workbook`, que abre a planilha em modo somente leitura com `openpyxl`.

Ele gera um relatório com:

- nome do arquivo de origem;
- abas detectadas;
- cabeçalhos;
- quantidade de linhas lidas;
- quantidade de colunas lidas;
- pequena prévia dos dados.

Esta etapa ainda não valida tipos, não normaliza dados e não corrige erros. Ela existe para garantir a primeira camada de auditoria.

### 2.3. Gerador estático inicial

Foi criado `scripts/build_static_site.py`.

Esse script lê arquivos Excel em:

```text
input-workbooks/
```

E gera uma saída publicável em:

```text
dist/
```

A saída inicial inclui:

```text
dist/index.html
dist/paineis/{slug}/index.html
dist/paineis/{slug}/data/ingestion-report.json
```

Esse é o primeiro passo para publicar painéis estáticos no Cloudflare Pages sem depender de servidor local.

### 2.4. Documentação de produto e arquitetura

Foram adicionados documentos de referência:

- `PRODUCT.md`: visão de produto, requisitos, escopo do MVP e fora de escopo.
- `ARCHITECTURE.md`: arquitetura em camadas e separação de responsabilidades.
- `DATA_CONTRACTS.md`: contratos de dados e exemplos de artefatos JSON.
- `AGENTS.md`: regras para contribuições futuras e agentes.
- `docs/MVP_IMPLEMENTATION_PLAN.md`: plano de implementação incremental.
- `docs/WINDOWS_LOCAL_FLASK_APP.md`: instruções para rodar o app local no Windows.
- `docs/CF_PAGES_MVP_GUIDE.md`: estratégia de publicação com Cloudflare Pages.

### 2.5. Exemplo de deploy para Cloudflare Pages

Foi criado o arquivo:

```text
.github/workflows/cf-pages-deploy-example.yml.sample
```

Ele mostra como um workflow futuro pode:

1. instalar Python 3.12;
2. instalar dependências;
3. executar `scripts/build_static_site.py`;
4. publicar `dist/` no Cloudflare Pages usando Wrangler.

Esse arquivo ainda é um exemplo e não está ativado como workflow real.

## 3. O que você precisa fazer agora

### 3.1. Confirmar o caminho de publicação

Como o computador do trabalho tem restrições para rodar servidor local, o caminho recomendado é:

```text
GitHub Actions → geração de dist/ → Cloudflare Pages
```

Isso evita depender de Flask rodando localmente.

### 3.2. Criar ou confirmar o projeto no Cloudflare Pages

No painel da Cloudflare, é normal aparecer em `Workers & Pages`.

Você deve garantir que o projeto seja um projeto Pages para site estático, com saída em:

```text
dist
```

### 3.3. Configurar secrets no GitHub

Para deploy automatizado via Wrangler, serão necessários secrets:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_PROJECT_NAME
```

Esses valores não devem ser colocados diretamente no código.

### 3.4. Colocar um Excel real de teste

Adicionar uma primeira planilha real em:

```text
input-workbooks/
```

Essa planilha será usada para validar a ingestão e a primeira geração estática.

### 3.5. Ativar o workflow quando estiver pronto

Quando o projeto Cloudflare e os secrets estiverem prontos, o arquivo de exemplo poderá ser transformado em workflow real.

## 4. Próximos passos técnicos

### Passo 1 — Validar geração estática no CI

Criar ou ativar um workflow real para executar:

```bash
python scripts/build_static_site.py --input input-workbooks --output dist
```

Critério de sucesso:

- `dist/index.html` é gerado;
- cada Excel gera uma página em `dist/paineis/{slug}/`;
- cada painel possui `data/ingestion-report.json`.

### Passo 2 — Publicar no Cloudflare Pages

Conectar o deploy ao Cloudflare Pages.

Critério de sucesso:

- o site abre em URL pública;
- o índice de painéis aparece;
- cada painel possui link para seu relatório de ingestão.

### Passo 3 — Implementar validação bloqueante

Adicionar validações antes da publicação:

- tipo de coluna;
- datas inválidas;
- números inválidos;
- células obrigatórias vazias;
- abas sem cabeçalho;
- estruturas não tabulares.

Critério de sucesso:

- Excel inválido bloqueia o build;
- o erro é registrado em `validation-report.json`.

### Passo 4 — Implementar normalização

Gerar:

```text
schema.json
normalized-dataset.json
metrics.json
```

Critério de sucesso:

- o painel deixa de depender diretamente da estrutura original do Excel;
- os componentes passam a consumir dados normalizados.

### Passo 5 — Evoluir componentes visuais

A versão atual mostra uma visualização simples de abas, linhas, colunas e cabeçalhos.

Depois, adicionar:

- KPIs;
- tabelas filtráveis;
- gráficos de barras;
- gráficos de linha;
- filtros;
- blocos de texto analítico.

### Passo 6 — Adicionar IA assistiva

Somente depois da validação e normalização, adicionar IA para:

- sugerir visualizações;
- gerar resumo textual;
- explicar métricas calculadas pelo sistema.

A IA não deve alterar dados nem gerar o HTML final de produção.

## 5. Decisão recomendada

A recomendação é seguir com Cloudflare Pages para publicação estática e GitHub Actions para processamento Python.

Fluxo recomendado:

```text
Excel no GitHub
→ GitHub Actions processa com Python
→ scripts/build_static_site.py gera dist/
→ Cloudflare Pages publica dist/
→ painel público fica disponível no domínio configurado
```

Esse caminho reduz dependência do computador local, mantém baixo custo e preserva a arquitetura confiável.

## 6. Estado atual do MVP

O projeto já possui uma base inicial funcional para:

- ler Excel de forma determinística;
- gerar relatório de ingestão;
- criar saída estática inicial;
- preparar deploy para Cloudflare Pages;
- documentar arquitetura, produto e contratos.

Ainda faltam:

- validação bloqueante;
- normalização de dados;
- componentes visuais reais;
- workflow real ativado;
- deploy Cloudflare configurado;
- testes automatizados.
