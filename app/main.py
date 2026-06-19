from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from uuid import uuid4

from flask import Flask, Response, abort, jsonify, request, send_from_directory

from app.services.excel_ingestion import inspect_workbook

BASE_DIR = Path(__file__).resolve().parent.parent
STORAGE_DIR = BASE_DIR / "storage"
ORIGINAL_DIR = STORAGE_DIR / "original"
PROCESSED_DIR = STORAGE_DIR / "processed"
PUBLISHED_DIR = STORAGE_DIR / "published"

for directory in (ORIGINAL_DIR, PROCESSED_DIR, PUBLISHED_DIR):
    directory.mkdir(parents=True, exist_ok=True)

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024


@app.get("/health")
def health() -> Response:
    return jsonify({"status": "ok"})


@app.get("/")
def home() -> str:
    return """
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Gerador Confiável de Painéis</title>
      </head>
      <body>
        <main style="font-family: Arial, sans-serif; max-width: 760px; margin: 40px auto; line-height: 1.5;">
          <h1>Gerador Confiável de Painéis</h1>
          <p>Envie um arquivo Excel para gerar o primeiro relatório de ingestão determinística.</p>
          <form action="/api/workbooks" method="post" enctype="multipart/form-data">
            <input type="file" name="file" accept=".xlsx,.xlsm" required />
            <button type="submit">Inspecionar Excel</button>
          </form>
          <p>Healthcheck: <a href="/health">/health</a></p>
        </main>
      </body>
    </html>
    """


@app.post("/api/workbooks")
def upload_workbook() -> Response:
    uploaded_file = request.files.get("file")
    if uploaded_file is None or uploaded_file.filename == "":
        abort(400, description="Envie um arquivo Excel .xlsx ou .xlsm.")

    suffix = Path(uploaded_file.filename).suffix.lower()
    if suffix not in {".xlsx", ".xlsm"}:
        abort(400, description="Envie um arquivo Excel .xlsx ou .xlsm.")

    project_id = str(uuid4())
    project_original_dir = ORIGINAL_DIR / project_id
    project_processed_dir = PROCESSED_DIR / project_id
    project_original_dir.mkdir(parents=True, exist_ok=True)
    project_processed_dir.mkdir(parents=True, exist_ok=True)

    safe_name = Path(uploaded_file.filename).name
    workbook_path = project_original_dir / safe_name
    uploaded_file.save(workbook_path)

    report = inspect_workbook(workbook_path)
    report["project_id"] = project_id
    report["created_at"] = datetime.now(timezone.utc).isoformat()

    report_path = project_processed_dir / "ingestion-report.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

    return jsonify(
        {
            "project_id": project_id,
            "ingestion_report": report,
            "next_step": "Implementar validação bloqueante e normalização para schema/dataset.",
        }
    )


@app.get("/published/<path:filename>")
def published_file(filename: str):
    return send_from_directory(PUBLISHED_DIR, filename)
