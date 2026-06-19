# ARCHITECTURE.md

## Objetivo arquitetural

Separar responsabilidades para transformar a geração de painéis em um processo confiável, auditável e repetível.

A arquitetura deve impedir que a IA seja responsável pelo caminho crítico de dados e renderização. A IA pode auxiliar, mas o sistema deve validar, normalizar, renderizar e publicar de forma determinística.

## Visão geral

```text
┌────────────────────────┐
│ Interface administrativa│
│ upload, revisão, aprovar│
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Ingestão de Excel       │
│ leitura determinística  │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Validação bloqueante    │
│ schema, tipos, erros    │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Normalização            │
│ dataset + schema        │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│ Manifesto do painel     │
│ layout + componentes    │
└──────┬───────────┬─────┘
       │           │
       ▼           ▼
┌────────────┐  ┌──────────────────┐
│ IA assistiva│  │ Renderizador      │
│ textos/sug. │  │ templates estáveis│
└──────┬─────┘  └─────────┬────────┘
       │                  │
       └──────────┬───────┘
                  ▼
        ┌──────────────────┐
        │ Build estático    │
        │ HTML/CSS/JS/data  │
        └─────────┬────────┘
                  ▼
        ┌──────────────────┐
        │ Publicação        │
        │ /slug-do-painel   │
        └──────────────────┘
```

## Camadas

### 1. Interface administrativa

Responsável por:

- upload de Excel;
- cadastro de nome e slug do painel;
- seleção de tipo de painel;
- exibição de erros de validação;
- mapeamento assistido de colunas;
- prévia do painel;
- aprovação e publicação.

A interface administrativa é dinâmica e pode exigir backend. Ela é separada do painel publicado.

### 2. Ingestão

Responsável por ler o Excel sem perda silenciosa.

Saídas esperadas:

- lista de abas;
- contagem de linhas por aba;
- contagem de colunas por aba;
- nomes de colunas;
- amostra de dados;
- relatório de ingestão.

Regras:

- Não descartar dados sem registrar.
- Não corrigir dados automaticamente no MVP.
- Não depender da IA para leitura de planilhas.

### 3. Validação

Responsável por bloquear dados incompatíveis com o painel.

Validações iniciais:

- tipo de coluna;
- células obrigatórias vazias;
- datas inválidas;
- números inválidos;
- colunas ausentes;
- duplicidades quando relevante;
- estrutura não tabular;
- células mescladas em regiões de dados, quando isso impedir leitura confiável.

Resultado possível:

```text
VALID
INVALID_BLOCKED
```

### 4. Normalização

Responsável por converter Excel em dados canônicos.

Artefatos:

```text
schema.json
normalized-dataset.json
validation-report.json
ingestion-report.json
```

O painel nunca deve depender diretamente do Excel original em runtime.

### 5. Manifesto do painel

Define como os dados serão apresentados.

Exemplo conceitual:

```json
{
  "title": "Painel Comercial",
  "slug": "painel-comercial",
  "template": "commercial-dashboard@1.0.0",
  "theme": "institutional@1.0.0",
  "datasets": [
    {
      "id": "main",
      "path": "data/normalized-dataset.json",
      "schema": "data/schema.json"
    }
  ],
  "components": [
    {
      "type": "kpi",
      "metric": "receita_total"
    },
    {
      "type": "bar_chart",
      "dimension": "regiao",
      "metric": "receita"
    },
    {
      "type": "data_table",
      "dataset": "main"
    }
  ]
}
```

### 6. IA assistiva

A IA pode receber apenas dados calculados, amostras controladas ou metadados.

Usos permitidos:

- sugerir visualizações;
- sugerir mapeamento de colunas;
- gerar textos analíticos;
- gerar títulos e descrições;
- explicar padrões detectados.

Usos proibidos no caminho crítico:

- gerar HTML/CSS/JS final;
- corrigir dados automaticamente;
- omitir dados;
- decidir publicação;
- calcular métricas sem validação do sistema.

### 7. Renderizador

Responsável por transformar manifesto e dados em arquivos estáticos.

Entradas:

- `manifest.json`;
- `schema.json`;
- `normalized-dataset.json`;
- biblioteca de componentes;
- tema institucional.

Saídas:

```text
index.html
assets/*
data/*
```

### 8. Publicação

O MVP deve publicar painéis como sites estáticos.

URL desejada:

```text
https://paineis.suaempresa.com/{slug}
```

Opções compatíveis:

- servidor próprio/DigitalOcean servindo arquivos estáticos;
- GitHub Pages;
- Netlify;
- Vercel;
- Cloudflare Pages.

A aplicação administrativa pode residir em outro subdomínio:

```text
https://admin.suaempresa.com
```

## Estrutura sugerida de artefatos por painel

```text
projects/{project-id}/
  original/
    input.xlsx
  processed/
    ingestion-report.json
    validation-report.json
    schema.json
    normalized-dataset.json
    metrics.json
    ai-summary.json
    manifest.json
  published/
    index.html
    assets/
    data/
  logs/
    build.log
    publish.log
```

## Contratos de componente

Cada componente deve declarar os campos exigidos.

Exemplo:

```json
{
  "component": "bar_chart",
  "requires": {
    "dimension": "category|string",
    "metric": "number"
  }
}
```

Antes do build, o sistema deve validar:

- campos existem;
- tipos são compatíveis;
- dataset não está vazio;
- componente possui estado vazio/erro;
- configuração é válida.

## Estratégia de repetibilidade

Um painel publicado deve ser reprodutível a partir de:

- Excel original;
- schema;
- dataset normalizado;
- manifesto;
- versão do template;
- versão do tema;
- versão do código;
- textos de IA arquivados, quando usados.

## Decisões arquiteturais iniciais

1. O painel final será estático no MVP.
2. A aplicação administrativa será separada do painel publicado.
3. A IA não gerará HTML/CSS/JS final.
4. A validação bloqueará publicação em caso de erro.
5. Não haverá correção automática de dados no MVP.
6. O primeiro foco será em painéis comerciais e financeiros.
7. Mapas e geocodificação ficam fora do MVP, salvo necessidade do primeiro caso real.
