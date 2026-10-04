"""Loads lab scenarios and missions from the content folder. Answer keys never leave the server."""
import json
import os
from functools import lru_cache
from pathlib import Path
from typing import Dict, Optional


def content_root() -> Path:
    override = os.environ.get("QCAPS_CONTENT_ROOT")
    return Path(override) if override else Path(__file__).resolve().parents[3] / "content"


@lru_cache(maxsize=1)
def _load() -> Dict[str, Dict[str, dict]]:
    root = content_root()
    labs: Dict[str, dict] = {}
    lab_file = root / "Labs" / "escape_room_scenarios.json"
    if lab_file.exists():
        for s in json.loads(lab_file.read_text(encoding="utf-8")).get("scenarios", []):
            labs[s["id"]] = s
    missions: Dict[str, dict] = {}
    for f in sorted((root / "Mission").glob("mission_*.json")):
        m = json.loads(f.read_text(encoding="utf-8"))
        missions[m["mission_id"]] = m
    return {"labs": labs, "missions": missions}


def get_lab(scenario_id: str) -> Optional[dict]:
    return _load()["labs"].get(scenario_id)


def get_mission(mission_id: str) -> Optional[dict]:
    return _load()["missions"].get(mission_id)


def reset_cache() -> None:
    _load.cache_clear()
