# CLOUDFLARE_PAGES_DEPLOYMENT.md

## Resposta curta

Sim, é possível usar Cloudflare Pages para publicar os painéis, especialmente porque o produto desejado gera painéis públicos e estáticos sob demanda.

Atenção: Cloudflare Pages não deve ser tratado como um servidor Python Flask. Ele é ideal para hospedar o painel final estático e pode usar Pages Functions para lógica serverless em JavaScript/TypeScript. O processamento Python de Excel deve acontecer fora do runtime do Pages, por exemplo em GitHub Actions, em uma máquina controlada, ou em um serviço backend separado.

## Melhor caminho para restrições no computador do trabalho

Se o computador do trabalho tem restrições para rodar servidor local, a melhor arquitetura inicial é:

```text
GitHub repo
→ GitHub Actions roda Python para processar Excel
→ gera arquivos estáticos em dist/
→ Cloudflare Pages publica dist/
→ usuário acessa https://paineis.suaempresa.com/slug
```

Nesse modelo, seu computador não precisa executar Flask, Uvicorn, servidor local ou processamento pesado. Ele só precisa conseguir enviar arquivos para o GitHub ou usar uma interface futura de upload.

## O que Cloudflare Pages faz bem

- Hospedar HTML, CSS, JavaScript, imagens e JSON estáticos.
- Publicar cada painel em uma URL pública.
- Usar domínio próprio, como `paineis.suaempresa.com`.
- Fazer deploy automático a partir de GitHub.
- Fazer Direct Upload de arquivos já gerados.
- Rodar Pages Functions para pequenas APIs serverless em JavaScript/TypeScript.

## O que Cloudflare Pages não substitui sozinho

- Um servidor Python Flask persistente.
- Processamento Python de Excel diretamente no runtime do Pages.
- Banco de dados relacional tradicional.
- Pipeline completo de validação/normalização se ele depender de bibliotecas Python executadas no servidor.

## Arquitetura recomendada para MVP sem servidor local

### Etapa 1 — Repositório como entrada controlada

Criar uma pasta para arquivos de entrada:

```text
input-workbooks/
  primeiro-painel.xlsx
```

Criar uma pasta para saída estática:

```text
dist/
  index.html
  paineis/
    primeiro-painel/
      index.html
      data/
        ingestion-report.json
        normalized-dataset.json
```

### Etapa 2 — GitHub Actions processa o Excel

O GitHub Actions deve:

1. instalar Python;
2. instalar dependências;
3. ler os Excel em `input-workbooks/`;
4. gerar relatórios de ingestão;
5. futuramente validar e normalizar dados;
6. gerar HTML/JSON estático em `dist/`;
7. acionar deploy no Cloudflare Pages.

### Etapa 3 — Cloudflare Pages publica o diretório estático

Configuração inicial sugerida:

```text
Build command: vazio ou comando de build futuro
Build output directory: dist
```

Se a geração acontecer no GitHub Actions, o deploy pode ser feito por Direct Upload usando Wrangler.

## Fluxo operacional sugerido para você

### MVP 1: sem upload web

```text
1. Você adiciona Excel ao repositório ou via GitHub web.
2. GitHub Actions processa o arquivo.
3. Cloudflare Pages publica o painel.
4. Você acessa a URL final.
```

Vantagem: não exige servidor local nem backend próprio.

Limitação: ainda não é uma interface amigável para usuários não técnicos.

### MVP 2: com upload web

```text
1. Usuário acessa admin.suaempresa.com.
2. Upload vai para Cloudflare Pages Functions ou Worker.
3. Arquivo é salvo em R2.
4. Um job externo processa o Excel.
5. Resultado estático é publicado no Cloudflare Pages.
```

Vantagem: fluxo mais próximo de produto.

Limitação: mais complexo, porque processamento Excel em Python não roda diretamente como servidor Flask no Pages.

## Decisão recomendada agora

Para sair do bloqueio do computador do trabalho, faça o MVP com GitHub Actions + Cloudflare Pages:

```text
Excel no GitHub
→ processamento Python em GitHub Actions
→ geração de dist/
→ deploy no Cloudflare Pages
```

Isso preserva os princípios do produto:

- leitura determinística;
- validação futura bloqueante;
- painel final estático;
- publicação em domínio próprio;
- sem IA no caminho crítico;
- sem depender do computador local como servidor.

## Próximos arquivos a implementar

1. `scripts/build_static_site.py`
   - lê arquivos Excel em `input-workbooks/`;
   - gera índice estático em `dist/index.html`;
   - gera painéis em `dist/paineis/{slug}/`;
   - salva `data/ingestion-report.json` para auditoria.

2. `.github/workflows/deploy-cloudflare-pages.yml`
   - instala Python;
   - executa o build;
   - publica no Cloudflare Pages.

3. `input-workbooks/.gitkeep`
   - pasta inicial para planilhas de teste.

4. `dist/.gitkeep`
   - pasta de saída local ignorável ou gerada em CI.

## Build estático local ou em CI

Quando houver arquivos Excel em `input-workbooks/`, o build inicial pode ser executado com:

```bash
python scripts/build_static_site.py --input input-workbooks --output dist
```

A saída `dist/` é o diretório que deve ser publicado no Cloudflare Pages.

## Variáveis/secrets necessários no GitHub

Para deploy via Wrangler, normalmente serão necessários secrets como:

```text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_PROJECT_NAME
```

Esses valores não devem ser commitados no repositório.

## Arquivos gerados e versionamento

Como `.gitignore` pode variar na branch principal, esta proposta não depende de alterar esse arquivo. A recomendação é não versionar planilhas reais nem builds gerados. Em uma etapa futura, adicione regras equivalentes a estas na `.gitignore` da branch principal:

```text
input-workbooks/*
!input-workbooks/.gitkeep
dist/*
!dist/.gitkeep
storage/original/*
!storage/original/.gitkeep
storage/processed/*
!storage/processed/.gitkeep
storage/published/*
!storage/published/.gitkeep
```

## Recomendação de segurança

Como os painéis serão públicos, Cloudflare Pages é adequado para a camada de publicação. Se futuramente houver painéis privados, será necessário adicionar autenticação real, por exemplo com Cloudflare Access, aplicação administrativa protegida, ou outro mecanismo de controle de acesso.
