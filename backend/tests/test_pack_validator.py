import copy
import json
from pathlib import Path

import pytest

from course_content.validate_pack import Report, main, validate_pack

EXAMPLE = Path(__file__).resolve().parents[2] / "docs" / "content-authoring" / "example_pack.json"


@pytest.fixture
def pack():
    return json.loads(EXAMPLE.read_text(encoding="utf-8"))


def run(pack):
    report = Report()
    validate_pack(pack, report, "t")
    return report


def section(pack):
    return pack["modules"][0]["sections"][0]


def test_example_pack_is_valid(pack):
    report = run(pack)
    assert report.errors == [] and report.warnings == []


def has(report, text):
    assert any(text in e for e in report.errors), report.errors


def test_source_must_cite_a_listed_book_with_a_locator(pack):
    section(pack)["sources"] = [{"book": "B99", "locator": "p. 1"}]
    has(run(pack), "not listed in 'books'")
    section(pack)["sources"] = [{"book": "B01", "locator": " "}]
    has(run(pack), "locator")
    section(pack)["sources"] = []
    has(run(pack), "at least one source")


def test_publish_checklist_is_enforced(pack):
    del section(pack)["blocks"][3]["explanation"]
    has(run(pack), "Every checkpoint has an explanation")


def test_only_pack_block_types_allowed(pack):
    section(pack)["blocks"].append({"type": "video", "title": "v", "url": "https://example.org/a.mp4"})
    has(run(pack), "block types not allowed")


def test_slug_and_action_rules(pack):
    section(pack)["slug"] = "Bad Slug"
    has(run(pack), "slug 'Bad Slug'")
    section(pack)["slug"] = "sec-7"           # exists already, but action says new
    has(run(pack), "already exists; use 'replace'")
    section(pack)["action"] = "replace"
    assert run(pack).errors == []
    section(pack)["slug"] = "sec-77"          # replace of a section that does not exist
    has(run(pack), "does not exist in this module")
    section(pack)["action"] = "new"
    section(pack)["after"] = "nope"
    has(run(pack), "'after' refers to unknown section")


def test_module_rules(pack):
    pack["modules"][0]["slug"] = "no_such_module"
    has(run(pack), "no module has this slug")
    secs = section_copy(pack)
    del secs[0]["after"]  # a brand-new module has no existing section to go after
    pack["modules"] = [{"slug": "track_b_b99_new", "action": "new", "sections": secs}]
    report = run(pack)
    for key in ("track", "code", "title", "level", "estimated_minutes", "learning_objectives"):
        has(report, f"need '{key}'")
    pack["modules"][0].update(track="track-b", code="B99", title="New", level="Beginner",
                              estimated_minutes=60, learning_objectives=["a", "b", "c"])
    assert run(pack).errors == [] and any("sections" in w for w in run(pack).warnings)
    pack["modules"][0]["prerequisites"] = ["nonexistent"]
    has(run(pack), "prerequisite 'nonexistent'")


def section_copy(pack):
    return copy.deepcopy(pack["modules"][0]["sections"])


def test_unknown_fields_are_rejected(pack):
    section(pack)["body"] = "x"
    pack["extra"] = 1
    report = run(pack)
    has(report, "unknown field 'body'")
    has(report, "unknown field 'extra'")


def test_quiz_rules(pack):
    quiz = pack["modules"][0]["quiz"]
    quiz[0]["correct_index"] = 9
    has(run(pack), "correct_index")
    quiz[0]["correct_index"] = 0
    quiz[1]["explanation"] = ""
    has(run(pack), "explanation is required")
    pack["modules"][0]["quiz"] = quiz[:2]
    has(run(pack), "3 to 12 NEW questions")


def test_long_quotation_is_a_warning(pack):
    section(pack)["blocks"][0]["markdown"] += ' "' + "word " * 40 + '"'
    report = run(pack)
    assert report.errors == [] and any("long quotation" in w for w in report.warnings)


def test_needs_verification_requires_reason(pack):
    section(pack)["needs_verification"] = {"reason": ""}
    has(run(pack), "needs_verification")


def test_cli_exit_codes(tmp_path, pack, capsys):
    good = tmp_path / "good.json"
    good.write_text(json.dumps(pack), encoding="utf-8")
    assert main([str(good)]) == 0
    bad = tmp_path / "bad.json"
    bad.write_text("{not json", encoding="utf-8")
    assert main([str(bad)]) == 1
    assert "cannot read as JSON" in capsys.readouterr().out


def test_structure_export_matches_the_course():
    from course_content.export_structure import build_markdown
    md = build_markdown()
    assert "- Modules: 36" in md and "- Sections (lessons): 340" in md
    assert "track_b_b9_pqc_fundamentals" in md and "`sec-7` 3.7 HTTP/HTTPS" in md
    assert "NO MATCHING MODULE" not in md  # every escape room links to a real module
    assert "Inba" not in md and "teammate" not in md
