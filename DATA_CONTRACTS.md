# DATA_CONTRACTS.md

## Objetivo

Definir os contratos mínimos entre ingestão, validação, normalização, renderização e publicação.

## Princípio

Nenhum painel deve ser renderizado diretamente a partir do Excel original. O Excel deve ser convertido em artefatos intermediários auditáveis.

## Artefatos mínimos

```text
ingestion-report.json
validation-report.json
schema.json
normalized-dataset.json
metrics.json
manifest.json
```

## ingestion-report.json

Descreve o que foi lido do Excel.

Exemplo:

```json
{
  "source_file": "input.xlsx",
  "sheets": [
    {
      "name": "Vendas",
      "rows_read": 1832,
      "columns_read": 12,
      "columns": ["Data", "Região", "Produto", "Valor"]
    }
  ]
}
```

## validation-report.json

Descreve erros e alertas.

Exemplo:

```json
{
  "status": "INVALID_BLOCKED",
  "errors": [
    {
      "sheet": "Vendas",
      "row": 283,
      "column": "Valor",
      "code": "INVALID_NUMBER",
      "message": "Valor numérico inválido."
    }
  ],
  "warnings": []
}
```

Status permitidos no MVP:

```text
VALID
INVALID_BLOCKED
```

## schema.json

Descreve campos disponíveis para o painel.

Exemplo:

```json
{
  "dataset_id": "main",
  "fields": [
    {
      "name": "data",
      "source_name": "Data",
      "type": "date",
      "nullable": false
    },
    {
      "name": "regiao",
      "source_name": "Região",
      "type": "category",
      "nullable": false
    },
    {
      "name": "valor",
      "source_name": "Valor",
      "type": "number",
      "format": "currency",
      "nullable": false
    }
  ]
}
```

Tipos iniciais:

```text
string
category
number
currency
percent
date
boolean
```

## normalized-dataset.json

Contém dados normalizados.

Exemplo:

```json
{
  "dataset_id": "main",
  "rows": [
    {
      "data": "2026-01-01",
      "regiao": "Centro-Oeste",
      "produto": "Produto A",
      "valor": 1500.75
    }
  ]
}
```

## metrics.json

Contém métricas calculadas pelo sistema, não pela IA.

Exemplo:

```json
{
  "receita_total": 1523000,
  "ticket_medio": 438.2,
  "regiao_lider": "Centro-Oeste"
}
```

## manifest.json

Define a composição do painel.

Exemplo:

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
      "id": "receita-total",
      "type": "kpi",
      "metric": "receita_total",
      "title": "Receita total"
    },
    {
      "id": "receita-por-regiao",
      "type": "bar_chart",
      "dataset": "main",
      "dimension": "regiao",
      "metric": "valor",
      "title": "Receita por região"
    }
  ]
}
```

## Contratos iniciais de componentes

### KPI

Requisitos:

```json
{
  "type": "kpi",
  "requires": {
    "metric": "number|currency|percent|string"
  }
}
```

### Bar chart

Requisitos:

```json
{
  "type": "bar_chart",
  "requires": {
    "dimension": "category|string",
    "metric": "number|currency|percent"
  }
}
```

### Line chart

Requisitos:

```json
{
  "type": "line_chart",
  "requires": {
    "x": "date|number",
    "y": "number|currency|percent"
  }
}
```

### Data table

Requisitos:

```json
{
  "type": "data_table",
  "requires": {
    "dataset": "existing_dataset"
  }
}
```

### Filter bar

Requisitos:

```json
{
  "type": "filter_bar",
  "requires": {
    "fields": "category|string|date"
  }
}
```

## Regras de validação antes do build

- Todo dataset referenciado no manifesto deve existir.
- Todo campo referenciado por componente deve existir no schema.
- O tipo do campo deve ser compatível com o contrato do componente.
- Dataset vazio deve bloquear componentes que exigem dados.
- Métricas exibidas devem ser calculadas pelo sistema.
- Texto de IA deve ser armazenado como artefato separado.
