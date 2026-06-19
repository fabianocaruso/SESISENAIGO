# WINDOWS_LOCAL_FLASK_APP.md

## Próxima etapa prática

A próxima etapa é colocar no ar uma aplicação administrativa local em Python para validar o fluxo inicial:

```text
abrir app local → enviar Excel → salvar original → gerar ingestion-report.json
```

Este passo ainda não publica o painel final. Ele cria a base confiável do produto: ingestão determinística e artefato de auditoria.

## Pré-requisitos

- Python 3.11 ou superior.
- Acesso ao terminal no servidor local.
- Repositório clonado no servidor.

## Verificar versão do Python

Antes de instalar, confirme a versão:

```bash
python --version
```

No Windows, se aparecer `Python 3.14`, instale Python 3.12 ou 3.13 e crie o ambiente com `py -3.12 -m venv .venv`.

## Instalação local

Na raiz do repositório:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-local.txt
```

## Subir o app local

```bash
python -m flask --app local_panel_app.main run --host=0.0.0.0 --port=8000 --debug
```

Depois, acesse:

```text
http://localhost:8000
```

Se estiver em outro computador da mesma rede, acesse pelo IP do servidor:

```text
http://IP_DO_SERVIDOR:8000
```

## Endpoints iniciais

- `GET /`: formulário HTML simples para upload de Excel.
- `GET /health`: healthcheck do servidor.
- `POST /api/workbooks`: recebe `.xlsx` ou `.xlsm`, salva o original e gera relatório de ingestão.

## Estrutura criada pelo app

```text
storage/
  original/{project_id}/arquivo.xlsx
  processed/{project_id}/ingestion-report.json
  published/
```

## O que já é validado nesta etapa

- O arquivo precisa ser `.xlsx` ou `.xlsm`.
- O Excel é aberto em modo somente leitura.
- O sistema identifica abas, cabeçalhos, quantidade de linhas e quantidade de colunas.
- O sistema salva um `ingestion-report.json` auditável.

## O que ainda falta implementar

- Validação bloqueante de tipos e campos obrigatórios.
- Geração de `schema.json`.
- Geração de `normalized-dataset.json`.
- Geração de `manifest.json`.
- Renderização estática do painel.
- Publicação em `/published/{slug}` ou domínio próprio.

## Critério de sucesso desta etapa

A etapa está concluída quando um usuário não técnico consegue abrir a página local, enviar um Excel real e receber um relatório informando abas, colunas, linhas e prévia dos dados sem que a IA participe da leitura.


## Windows PowerShell

No Windows, use preferencialmente Python 3.12 ou 3.13 para evitar incompatibilidades de pacotes que ainda não tenham wheels para Python 3.14.

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements-local.txt
python -m flask --app local_panel_app.main run --host=0.0.0.0 --port=8000 --debug
```

Se o comando `flask` não for reconhecido, use sempre `python -m flask`, porque isso executa o Flask instalado dentro do ambiente virtual ativo.

## Por que saímos de Uvicorn/FastAPI nesta etapa

O erro `Failed building wheel for pydantic-core` ocorre porque FastAPI depende de Pydantic/Pydantic Core, que pode exigir wheel compatível ou compilação local em algumas versões novas do Python, como Python 3.14. Para o MVP local, Flask evita essa dependência nativa e simplifica a instalação no Windows.
