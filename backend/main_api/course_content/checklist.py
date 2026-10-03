"""Publish checklist for a section. Single implementation: the admin API returns it with
every section, and refuses to publish a section while any item fails."""
from typing import Any, Dict, List


def publish_checklist(title: str, blocks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Each item: {id, label, ok, detail}. Only items that apply to the section are returned."""
    items: List[Dict[str, Any]] = [
        {"id": "title", "label": "Title filled in", "ok": bool((title or "").strip()), "detail": None},
        {
            "id": "content", "label": "At least one content block",
            "ok": len(blocks) > 0, "detail": None if blocks else "Add a block before publishing.",
        },
    ]

    videos = [b for b in blocks if b.get("type") == "video"]
    if videos:
        missing = [b.get("title") or b.get("id") for b in videos if not b.get("captions_url")]
        items.append({
            "id": "video_captions", "label": "Every video has captions", "ok": not missing,
            "detail": f"Missing captions: {', '.join(missing)}" if missing else None,
        })

    checkpoints = [b for b in blocks if b.get("type") == "checkpoint"]
    if checkpoints:
        missing = [b.get("question", b.get("id"))[:60] for b in checkpoints if not (b.get("explanation") or "").strip()]
        items.append({
            "id": "checkpoint_explanation", "label": "Every checkpoint has an explanation", "ok": not missing,
            "detail": f"Needs an explanation: {'; '.join(missing)}" if missing else None,
        })

    visuals = [b for b in blocks if b.get("type") == "visual"]
    if visuals:
        unlabelled = [
            b.get("title") or b.get("kind")
            for b in visuals
            if "simulat" in f"{b.get('title') or ''} {b.get('description') or ''}".lower() and not b.get("simulation")
        ]
        items.append({
            "id": "simulation_label", "label": "Simulated visuals are labelled SIMULATION", "ok": not unlabelled,
            "detail": f"Not labelled: {', '.join(unlabelled)}" if unlabelled else None,
        })
    return items


def failing(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    return [i for i in items if not i["ok"]]
