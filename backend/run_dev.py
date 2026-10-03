"""Start a Q-CAPS backend service for local development with backend/.env loaded.

    python backend/run_dev.py main      # FastAPI on :8000 (database path is relative to backend/main_api)
    python backend/run_dev.py scanner   # Flask scanner on :5000

Values already in the environment win over .env. This is a development convenience only; production
should inject real environment variables.
"""
import os
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def load_env(path: Path) -> None:
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


def main() -> int:
    service = sys.argv[1] if len(sys.argv) > 1 else ""
    load_env(HERE / ".env")
    if service == "main":
        cmd = [sys.executable, "-m", "uvicorn", "main:app", "--port", os.environ.get("QCAPS_API_PORT", "8000")]
        cwd = HERE / "main_api"
    elif service == "scanner":
        cmd = [sys.executable, "api.py"]
        cwd = HERE / "scanner_api"
    else:
        print(__doc__)
        return 2
    return subprocess.call(cmd, cwd=cwd)


if __name__ == "__main__":
    raise SystemExit(main())
