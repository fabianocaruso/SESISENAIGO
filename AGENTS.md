# AGENTS.md

## Contexto do produto
Este repositório deve evoluir para um produto interno para geração confiável de painéis interativos de inteligência a partir de planilhas Excel.

O objetivo central não é gerar HTML artesanal com IA, mas construir um pipeline determinístico:

```text
Excel → validação → normalização → manifesto → renderização por componentes → publicação estática
```

## Princípios obrigatórios

1. **Fidelidade dos dados em primeiro lugar**
   - Nunca descartar linhas, colunas ou abas silenciosamente.
   - Toda transformação deve ser explícita, auditável e registrada.
   - Erros de dados devem bloquear a publicação no MVP.

2. **IA não deve gerar a aplicação final**
   - A IA pode sugerir visualizações, textos analíticos, títulos e interpretações.
   - A IA não deve gerar HTML/CSS/JS cru para produção.
   - A IA não deve corrigir dados automaticamente.
   - A IA não deve decidir sozinha quais dados entram no painel.

3. **Renderização por componentes versionados**
   - Painéis devem ser montados a partir de templates e componentes estáveis.
   - Cada componente deve declarar seu contrato de dados.
   - Layout institucional deve ser preservado entre painéis.

4. **Processo repetível**
   - O mesmo input, schema, manifesto, template e versão de código devem produzir o mesmo output.
   - Builds devem gerar artefatos rastreáveis.

5. **Publicação estática quando possível**
   - O painel publicado deve funcionar como site estático sempre que os dados forem públicos e atualizados sob demanda.
   - A aplicação administrativa pode ser dinâmica; o painel final deve ser estático no MVP.

## Convenções de documentação

- Mantenha documentação em Markdown na raiz ou em `docs/`.
- Escreva documentação primariamente em português do Brasil.
- Prefira exemplos concretos de fluxo, contratos JSON e critérios de aceite.
- Registre decisões arquiteturais importantes em documentos específicos ou em uma seção de decisões.

## Convenções de implementação futuras

- Separar claramente módulos de ingestão, validação, normalização, renderização, IA e publicação.
- Não misturar regras de dados com componentes visuais.
- Não fazer correção automática de dados sem decisão explícita de produto.
- Toda etapa crítica deve produzir logs ou relatórios.
- Componentes visuais devem ter estados para carregamento, vazio e erro.
- Antes de publicar um painel, validar que todos os componentes possuem os campos exigidos.

## Critérios mínimos para mudanças futuras

Qualquer mudança que afete ingestão, validação, normalização, renderização ou publicação deve considerar:

- risco de perda de dados;
- impacto no contrato de dados;
- impacto na repetibilidade;
- impacto no layout institucional;
- impacto nos artefatos de auditoria;
- compatibilidade com painéis já publicados.
