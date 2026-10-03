"""Read and write the quiz JSON files under content/Quizzes (the source of truth for quiz items).

The database copy is produced from these files by seed_quizzes.seed(). Items are never edited in
place once published: a question that changes meaning is retired (active: false) and replaced by a
new id, so past responses keep the meaning they were given under.
"""
import json
import os
import re
from pathlib import Path
from typing import Any, Dict, Optional, Tuple

DEFAULT_QUIZ_DIR = Path(os.getenv("QCAPS_QUIZ_DIR", Path(__file__).resolve().parents[3] / "content" / "Quizzes"))

_EXPANDED = re.compile(r'"questions": \[\s*\n\s*\{\s*\n')


def find_quiz_file(module_slug: str, quiz_dir: Path = DEFAULT_QUIZ_DIR) -> Optional[Tuple[Path, Dict[str, Any]]]:
    for path in sorted(Path(quiz_dir).glob("*/*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        if data.get("module_id") == module_slug:
            return path, data
    return None


def format_quiz(data: Dict[str, Any], expanded: bool = False) -> str:
    """Serialise in the style the quiz files already use, so an import only shows the lines it changed.

    Compact (most files): header keys on their own lines and one question per line.
    Expanded (some files): json.dumps with indent=2."""
    if expanded:
        return json.dumps(data, indent=2, ensure_ascii=False) + "\n"
    lines = ["{"]
    for key, value in data.items():
        if key != "questions":
            lines.append(f"  {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)},")
    lines.append('  "questions": [')
    lines.append(",\n".join("    { " + json.dumps(q, ensure_ascii=False)[1:-1] + " }" for q in data["questions"]))
    lines += ["  ]", "}"]
    return "\n".join(lines) + "\n"


def write_quiz_file(path: Path, data: Dict[str, Any]) -> None:
    """Rewrite a quiz file keeping its current layout and line endings."""
    raw = path.read_bytes().decode("utf-8")
    text = format_quiz(data, expanded=_EXPANDED.search(raw) is not None)
    if not raw.endswith("\n"):
        text = text.rstrip("\n")
    if "\r\n" in raw:
        text = text.replace("\n", "\r\n")
    path.write_bytes(text.encode("utf-8"))


def same_item(existing: Dict[str, Any], new: Dict[str, Any]) -> bool:
    """True when `new` says the same thing as `existing` (prompt, options and key)."""
    return (
        existing.get("prompt") == new.get("prompt")
        and existing.get("options") == new.get("options")
        and existing.get("correct_index") == new.get("correct_index")
    )
