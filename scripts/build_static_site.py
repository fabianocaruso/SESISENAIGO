from __future__ import annotations

import argparse
import html
import json
import re
import shutil
from pathlib import Path
from typing import Any

from local_panel_app.services.excel_ingestion import inspect_workbook

SUPPORTED_EXTENSIONS = {".xlsx", ".xlsm"}


def slugify(value: str) -> str:
    """Create a stable URL slug for a workbook name."""
    normalized = value.lower().strip()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = normalized.strip("-")
    return normalized or "painel"


def write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def render_panel_html(title: str, report: dict[str, Any]) -> str:
    sheet_cards = []
    for sheet in report.get("sheets", []):
        headers = sheet.get("headers", [])
        header_items = "".join(f"<li>{html.escape(str(header))}</li>" for header in headers if header is not None)
        if not header_items:
            header_items = "<li>Nenhum cabeçalho detectado</li>"

        sheet_cards.append(
            f"""
            <section class="card">
              <h2>{html.escape(str(sheet.get('name', 'Aba sem nome')))}</h2>
              <dl class="metrics">
                <div><dt>Linhas lidas</dt><dd>{html.escape(str(sheet.get('rows_read', 0)))}</dd></div>
                <div><dt>Colunas lidas</dt><dd>{html.escape(str(sheet.get('columns_read', 0)))}</dd></div>
              </dl>
              <h3>Cabeçalhos detectados</h3>
              <ul>{header_items}</ul>
            </section>
            """
        )

    sheets_html = "\n".join(sheet_cards) or "<p>Nenhuma aba detectada.</p>"

    return f"""<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{html.escape(title)}</title>
    <style>
      :root {{ color-scheme: light; font-family: Arial, sans-serif; }}
      body {{ margin: 0; background: #f5f7fb; color: #1d2733; }}
      header {{ background: #003f7d; color: white; padding: 32px; }}
      main {{ max-width: 1120px; margin: 0 auto; padding: 24px; }}
      .grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }}
      .card {{ background: white; border: 1px solid #d9e2ec; border-radius: 12px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,.06); }}
      .metrics {{ display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }}
      .metrics div {{ background: #eef5ff; border-radius: 10px; padding: 12px; }}
      dt {{ font-size: .85rem; color: #536271; }}
      dd {{ font-size: 1.5rem; font-weight: 700; margin: 4px 0 0; }}
      a {{ color: #005eb8; }}
    </style>
  </head>
  <body>
    <header>
      <h1>{html.escape(title)}</h1>
      <p>Primeira visualização estática gerada a partir do relatório de ingestão determinística.</p>
    </header>
    <main>
      <p><a href="data/ingestion-report.json">Baixar ingestion-report.json</a></p>
      <div class="grid">{sheets_html}</div>
    </main>
  </body>
</html>
"""


def render_index_html(panels: list[dict[str, str]]) -> str:
    panel_items = "".join(
        f"<li><a href=\"paineis/{html.escape(panel['slug'])}/\">{html.escape(panel['title'])}</a></li>"
        for panel in panels
    )
    if not panel_items:
        panel_items = "<li>Nenhum painel gerado. Adicione arquivos Excel em input-workbooks/.</li>"

    return f"""<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Índice de Painéis</title>
    <style>
      body {{ font-family: Arial, sans-serif; max-width: 880px; margin: 40px auto; line-height: 1.5; color: #1d2733; }}
      a {{ color: #005eb8; }}
    </style>
  </head>
  <body>
    <h1>Índice de Painéis</h1>
    <p>Saída estática pronta para publicação no Cloudflare Pages.</p>
    <ul>{panel_items}</ul>
  </body>
</html>
"""


def build_static_site(input_dir: Path, output_dir: Path) -> list[dict[str, str]]:
    output_dir.mkdir(parents=True, exist_ok=True)
    panels_dir = output_dir / "paineis"
    if panels_dir.exists():
        shutil.rmtree(panels_dir)
    panels_dir.mkdir(parents=True, exist_ok=True)

    workbooks = sorted(
        path for path in input_dir.iterdir() if path.is_file() and path.suffix.lower() in SUPPORTED_EXTENSIONS
    ) if input_dir.exists() else []

    panels: list[dict[str, str]] = []
    for workbook_path in workbooks:
        title = workbook_path.stem.replace("_", " ").replace("-", " ").strip().title()
        slug = slugify(workbook_path.stem)
        panel_dir = panels_dir / slug
        data_dir = panel_dir / "data"
        data_dir.mkdir(parents=True, exist_ok=True)

        report = inspect_workbook(workbook_path)
        write_json(data_dir / "ingestion-report.json", report)
        (panel_dir / "index.html").write_text(render_panel_html(title, report), encoding="utf-8")
        panels.append({"title": title, "slug": slug})

    (output_dir / "index.html").write_text(render_index_html(panels), encoding="utf-8")
    return panels


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Gera site estático inicial a partir de workbooks Excel.")
    parser.add_argument("--input", type=Path, default=Path("input-workbooks"), help="Pasta com arquivos .xlsx/.xlsm")
    parser.add_argument("--output", type=Path, default=Path("dist"), help="Pasta de saída estática")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    panels = build_static_site(args.input, args.output)
    print(f"Painéis gerados: {len(panels)}")
    print(f"Saída: {args.output.resolve()}")


if __name__ == "__main__":
    main()
