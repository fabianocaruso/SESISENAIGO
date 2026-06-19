# PRODUCT.md

## Visão

Construir um produto interno para gerar, revisar e publicar painéis interativos de inteligência a partir de planilhas Excel, com foco em confiabilidade, repetibilidade, consistência visual e fidelidade integral dos dados.

O produto substitui um fluxo manual e não determinístico no qual planilhas são enviadas para uma IA que gera HTML/CSS/JS completo. Esse fluxo atual causa perda de dados, quebra de interface e resultados inconsistentes.

## Problema

O processo atual é frágil porque a IA é usada como leitora de dados, validadora, designer, programadora frontend, geradora de gráficos e analista ao mesmo tempo.

Principais problemas:

1. **Perda de dados**
   - Abas, linhas, colunas ou valores podem ser ignorados.
   - Números podem ser arredondados ou alterados.
   - A IA pode resumir dados em vez de preservá-los.

2. **Interface inconsistente**
   - Cada painel pode ter HTML, CSS e JavaScript diferentes.
   - Filtros, gráficos e layouts podem quebrar entre gerações.
   - Não há biblioteca de componentes estáveis.

3. **Processo não repetível**
   - O mesmo Excel pode gerar resultados diferentes.
   - Não há contrato formal entre dados e visualizações.
   - Não há rastreabilidade suficiente dos artefatos.

## Público-alvo inicial

- Ferramenta interna.
- Operada por usuários não técnicos.
- Aprovação final feita pelo responsável pelo produto antes da publicação.
- Painéis públicos, acessados por URL própria.

## Casos de uso iniciais

1. Gerar painel comercial a partir de Excel.
2. Gerar painel financeiro a partir de Excel.
3. Validar dados antes da publicação.
4. Revisar prévia do painel.
5. Publicar em endereço estável, como `paineis.suaempresa.com/nome-do-painel`.
6. Arquivar artefatos para auditoria.

## Requisitos funcionais

### Upload e cadastro do painel

- Permitir upload de arquivo Excel.
- Permitir informar nome do painel.
- Permitir definir slug/URL do painel.
- Permitir selecionar tipo inicial de painel, como comercial ou financeiro.

### Ingestão

- Ler planilhas Excel de forma determinística.
- Identificar abas, colunas e linhas.
- Preservar contagens de linhas, colunas e abas.
- Gerar relatório de ingestão.

### Validação

- Detectar erros de tipo, formato e estrutura.
- Bloquear publicação em caso de erro.
- Não corrigir dados automaticamente no MVP.
- Exibir mensagens compreensíveis para usuários não técnicos.

### Normalização

- Converter dados lidos para formato canônico.
- Gerar schema do dataset.
- Gerar dataset normalizado.
- Gerar manifesto do painel.

### Configuração de visualizações

- Sugerir componentes adequados aos dados.
- Permitir confirmação humana do mapeamento de colunas.
- Validar que cada componente recebe os campos necessários.

### IA assistiva

- Gerar textos analíticos opcionais.
- Sugerir visualizações.
- Sugerir títulos e descrições.
- Citar evidências calculadas pelo sistema.
- Não gerar HTML/CSS/JS final.
- Não corrigir dados automaticamente.

### Renderização

- Renderizar painel por templates/componentes versionados.
- Aplicar padrão institucional.
- Suportar versão desktop e experiência responsiva/mobile.
- Evitar HTML artesanal gerado por IA.

### Publicação

- Publicar painel estático em URL própria.
- Suportar domínio como `paineis.suaempresa.com`.
- Manter painel final independente de banco de dados no runtime do MVP.

### Auditoria

- Guardar Excel original.
- Guardar dataset normalizado.
- Guardar schema.
- Guardar manifesto.
- Guardar relatório de validação.
- Guardar logs de build e publicação.
- Guardar textos gerados por IA, quando houver.

## Requisitos não funcionais

- Repetibilidade: mesmo input e mesma configuração devem produzir o mesmo painel.
- Confiabilidade: erros devem ser detectados antes da publicação.
- Baixo custo operacional.
- Fácil operação por usuários não técnicos.
- Publicação pública por link.
- Contraste visual adequado.
- Separação clara entre dados, visualização, IA e publicação.

## Fora do escopo do MVP

- Login público para visitantes dos painéis.
- Painéis privados com controle de permissão.
- Atualização em tempo real.
- Correção automática de dados.
- Edição avançada de layout livre.
- Geração de HTML/CSS/JS completo por IA.
- Versionamento completo de histórico de dados, salvo artefatos mínimos de auditoria.
- Mapas complexos com geocodificação automática, salvo se o primeiro caso real exigir.

## MVP proposto

### Objetivo

Reduzir retrabalho manual e eliminar as causas principais de perda de dados e quebra de interface.

### Fluxo do MVP

```text
Upload do Excel
→ diagnóstico de abas/linhas/colunas
→ validação bloqueante
→ mapeamento assistido de colunas
→ geração de schema/dataset/manifesto
→ renderização com template comercial ou financeiro
→ prévia
→ aprovação
→ publicação estática
→ arquivamento dos artefatos
```

### Componentes iniciais

- Cards de KPI.
- Gráfico de barras.
- Gráfico de linha temporal.
- Tabela filtrável.
- Filtros básicos.
- Bloco de texto analítico.
- Exportação CSV.

### Métrica de sucesso do MVP

- Menos retrabalho manual.
- Nenhuma perda silenciosa de dados.
- Publicação bloqueada quando houver erro.
- Painel visualmente consistente.
- Mesmo input produz mesmo output.
