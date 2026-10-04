"""Pack importer: sections, citations, quiz additions and retirement, ownership rules."""
import json
import re
import shutil
from pathlib import Path

import pytest

import models
import seed_quizzes
from course_content import import_curriculum
from course_content.import_pack import PackError, import_pack
from course_content.validate_pack import BUILT_VISUAL_KINDS, Report, validate_pack

A3 = "track_a_a3_networking_foundations"
REPO = Path(__file__).resolve().parents[2]
PUBLIC = "/api/content"

BOOK = {"id": "B01", "title": "Test Book", "authors": "A. Author", "edition": "2nd", "year": 2024, "publisher": "Press"}
TEXT = " ".join(["Packets travel across networks in small pieces"] * 30)


def _section(slug="pk-new", action="new", after="sec-7", extra_blocks=()):
    return {
        "slug": slug, "action": action, "after": after, "title": "A pack section", "summary": "What it covers.",
        "estimated_minutes": 12,
        "blocks": [
            {"type": "text", "id": "t1", "markdown": TEXT},
            {"type": "checkpoint", "id": "cp1", "question": "Which is right?",
             "options": ["wrong", "right", "also wrong"], "correct_index": 1, "explanation": "Because."},
            *extra_blocks,
        ],
        "sources": [{"book": "B01", "locator": "Ch. 4, pp. 61-68", "note": "supports the example"}],
    }


def _quiz_item(n, **kw):
    item = {"id": f"a3-pk{n:02d}", "prompt": f"Question {n}?", "options": ["a", "b", "c", "d"], "correct_index": n % 4,
            "explanation": "Because.", "source": {"book": "B01", "locator": "Ch. 4"}}
    item.update(kw)
    return item


def _pack(sections=None, quiz=None, retire=None):
    mod = {"slug": A3, "action": "modify", "sections": sections if sections is not None else [_section()]}
    if quiz is not None:
        mod["quiz"] = quiz
    if retire is not None:
        mod["retire_quiz_items"] = retire
    return {"pack_version": 1, "books": [BOOK], "modules": [mod]}


@pytest.fixture
def quiz_dir(tmp_path):
    target = tmp_path / "Quizzes"
    shutil.copytree(REPO / "content" / "Quizzes", target)
    return target


@pytest.fixture
def course(db, quiz_dir):
    import_curriculum.import_curriculum(db)
    seed_quizzes.seed(db, quiz_dir)


@pytest.fixture
def admin_user(make_user):
    return make_user("pack-admin", "admin")[0]


def _a3_section(db, slug):
    return (db.query(models.CourseSection).join(models.CourseModule)
            .filter(models.CourseModule.slug == A3, models.CourseSection.slug == slug).first())


def _a3_quiz_file(quiz_dir):
    return next(quiz_dir.glob("*/A3_*.json"))


def test_new_section_is_created_after_anchor_with_resolved_sources(db, course, admin_user, quiz_dir):
    result = import_pack(db, _pack(), "pack-admin", quiz_dir=quiz_dir)
    assert result["created"] == [f"{A3}/pk-new"]
    row = _a3_section(db, "pk-new")
    assert row.status == "published" and row.imported_hash.startswith("pack:")
    assert row.sources[0]["title"] == "Test Book" and row.sources[0]["locator"] == "Ch. 4, pp. 61-68"
    ordered = (db.query(models.CourseSection).filter_by(module_id=row.module_id)
               .order_by(models.CourseSection.sort_order).all())
    slugs = [s.slug for s in ordered]
    assert slugs[slugs.index("sec-7") + 1] == "pk-new"
    assert [s.sort_order for s in ordered] == list(range(len(ordered)))


def test_public_api_shows_sources_but_never_checkpoint_answers(client, db, course, admin_user, quiz_dir):
    import_pack(db, _pack(), "pack-admin", quiz_dir=quiz_dir)
    data = client.get(f"{PUBLIC}/modules/{A3}").json()
    sec = next(s for s in data["sections"] if s["slug"] == "pk-new")
    assert sec["sources"][0]["book_id"] == "B01"
    cp = next(b for b in sec["blocks"] if b["type"] == "checkpoint")
    assert "correct_index" not in cp and "explanation" not in cp


def test_rerun_changes_nothing_and_adds_no_audit_rows(db, course, admin_user, quiz_dir):
    import_pack(db, _pack(), "pack-admin", quiz_dir=quiz_dir)
    audit = db.query(models.ContentAuditLog).count()
    again = import_pack(db, _pack(), "pack-admin", quiz_dir=quiz_dir)
    assert again["unchanged"] == [f"{A3}/pk-new"] and not again["created"] and not again["replaced"]
    assert db.query(models.ContentAuditLog).count() == audit


def test_replace_keeps_section_id_and_reports_learners_with_progress(db, course, admin_user, learner, quiz_dir):
    row = _a3_section(db, "sec-2")
    db.add(models.SectionCompletion(user_id=learner[0].id, section_id=row.id))
    db.commit()
    result = import_pack(db, _pack([_section("sec-2", "replace", after=None)]), "pack-admin", quiz_dir=quiz_dir)
    assert result["replaced"] == [{"section": f"{A3}/sec-2", "learners_with_progress": 1}]
    assert _a3_section(db, "sec-2").id == row.id
    assert db.query(models.SectionCompletion).filter_by(section_id=row.id).count() == 1


def test_replace_with_after_moves_the_section_and_keeps_its_id(db, course, admin_user, quiz_dir):
    row = _a3_section(db, "sec-2")
    moved = _section("sec-2", "replace", after="sec-5")
    import_pack(db, _pack([moved]), "pack-admin", quiz_dir=quiz_dir)
    ordered = [s.slug for s in db.query(models.CourseSection).filter_by(module_id=row.module_id)
               .order_by(models.CourseSection.sort_order)]
    assert ordered.index("sec-2") == ordered.index("sec-5") + 1
    assert _a3_section(db, "sec-2").id == row.id


def test_curriculum_reimport_does_not_overwrite_pack_sections(db, course, admin_user, quiz_dir):
    import_pack(db, _pack([_section("sec-2", "replace", after=None)]), "pack-admin", quiz_dir=quiz_dir)
    stats = import_curriculum.import_curriculum(db)
    assert stats["sections"]["skipped_pack_owned"] >= 1
    assert _a3_section(db, "sec-2").title == "A pack section"


def test_admin_edited_section_is_skipped_unless_overwrite_requested(db, course, admin_user, quiz_dir):
    row = _a3_section(db, "sec-3")
    row.imported_hash = None
    row.title = "Edited by an admin"
    db.commit()
    pack = _pack([_section("sec-3", "replace", after=None)])
    skipped = import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir)
    assert skipped["skipped_admin_edited"] == [f"{A3}/sec-3"]
    assert _a3_section(db, "sec-3").title == "Edited by an admin"
    import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir, overwrite_admin=True)
    assert _a3_section(db, "sec-3").title == "A pack section"


def test_invalid_pack_writes_nothing(db, course, admin_user, quiz_dir):
    bad = _pack()
    bad["modules"][0]["sections"][0]["sources"][0]["book"] = "B99"
    before = db.query(models.CourseSection).count()
    with pytest.raises(PackError, match="not listed in 'books'"):
        import_pack(db, bad, "pack-admin", quiz_dir=quiz_dir)
    assert db.query(models.CourseSection).count() == before


def test_dry_run_writes_nothing(db, course, admin_user, quiz_dir):
    pack = _pack(quiz=[_quiz_item(1), _quiz_item(2), _quiz_item(3)])
    quiz_file = _a3_quiz_file(quiz_dir)
    before = quiz_file.read_text(encoding="utf-8")
    result = import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir, dry_run=True)
    assert result["dry_run"] and result["created"] and result["quiz_added"] == ["a3-pk01", "a3-pk02", "a3-pk03"]
    assert _a3_section(db, "pk-new") is None
    assert quiz_file.read_text(encoding="utf-8") == before


def test_actor_must_be_an_admin(db, course, learner, quiz_dir):
    with pytest.raises(PackError, match="must be an existing admin"):
        import_pack(db, _pack(), "learner-user", quiz_dir=quiz_dir)


def test_quiz_items_are_added_to_file_and_database(db, course, admin_user, quiz_dir):
    items = [_quiz_item(1), _quiz_item(2), _quiz_item(3)]
    result = import_pack(db, _pack(quiz=items), "pack-admin", quiz_dir=quiz_dir)
    assert result["quiz_added"] == ["a3-pk01", "a3-pk02", "a3-pk03"]
    assert db.get(models.QuizItem, "a3-pk02").correct_index == 2
    saved = json.loads(_a3_quiz_file(quiz_dir).read_text(encoding="utf-8"))
    added = next(q for q in saved["questions"] if q["id"] == "a3-pk01")
    assert added["source"]["title"] == "Test Book"
    again = import_pack(db, _pack(quiz=items), "pack-admin", quiz_dir=quiz_dir)
    assert again["quiz_added"] == []


def test_retired_question_stays_in_database_but_is_never_issued(db, course, admin_user, quiz_dir, client, learner):
    first = db.query(models.QuizItem).filter_by(module_id=A3).order_by(models.QuizItem.id).first().id
    items = [_quiz_item(n) for n in (1, 2, 3)]
    import_pack(db, _pack(sections=[], quiz=items, retire=[first]), "pack-admin", quiz_dir=quiz_dir)
    assert db.get(models.QuizItem, first).active is False
    r = client.post(f"/api/quizzes/{A3}/attempts", headers=learner[1])
    assert r.status_code in (200, 201), r.text
    issued = json.dumps(r.json())
    assert first not in issued and "Question 1?" in issued


def test_existing_question_cannot_change_meaning(db, course, admin_user, quiz_dir):
    existing = db.query(models.QuizItem).filter_by(module_id=A3).first()
    clash = _quiz_item(1, id=existing.id)
    with pytest.raises(PackError, match="already exists with different content"):
        import_pack(db, _pack(sections=[], quiz=[clash, _quiz_item(2), _quiz_item(3)]), "pack-admin", quiz_dir=quiz_dir)


def test_quiz_cannot_be_retired_below_five_active_questions(db, course, admin_user, quiz_dir):
    ids = [q.id for q in db.query(models.QuizItem).filter_by(module_id=A3)]
    with pytest.raises(PackError, match="at least 5"):
        import_pack(db, _pack(sections=[], retire=ids[:len(ids) - 4]), "pack-admin", quiz_dir=quiz_dir)


def test_quiz_tags_must_be_complete_and_known(db, course, admin_user, quiz_dir):
    items = [_quiz_item(1, competency_id="NOPE.1", depth="Explain", lesson_id="A5.L1"),
             _quiz_item(2, depth="Explain"), _quiz_item(3)]
    with pytest.raises(PackError) as err:
        import_pack(db, _pack(sections=[], quiz=items), "pack-admin", quiz_dir=quiz_dir)
    assert "unknown competency_id NOPE.1" in str(err.value) and "must be set together" in str(err.value)


def test_visual_blocks_must_have_a_built_component():
    pack = _pack([_section(extra_blocks=[{"type": "visual", "kind": "not-built", "description": "d"}])])
    report = Report()
    validate_pack(pack, report)
    assert any("has no built component" in e for e in report.errors)


def test_built_visual_kinds_match_the_frontend_registry():
    path = REPO / "frontend" / "src" / "features" / "lesson" / "blocks" / "visualRegistry.ts"
    body = path.read_text(encoding="utf-8").split("VISUALS", 1)[1].split("};", 1)[0]
    assert set(re.findall(r"'([a-z0-9-]+)':", body)) == BUILT_VISUAL_KINDS


def test_new_modules_are_refused(db, course, admin_user, quiz_dir):
    pack = _pack()
    pack["modules"][0].update(action="new", slug="track_a_brand_new", track="track-a", code="A99", title="x",
                              level="Beginner", estimated_minutes=10, learning_objectives=["a", "b", "c"])
    with pytest.raises(PackError):
        import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir)


def test_quiz_writer_reproduces_every_existing_quiz_file_byte_for_byte(tmp_path):
    from course_content.quiz_files import write_quiz_file
    files = sorted((REPO / "content" / "Quizzes").glob("*/*.json"))
    assert len(files) == 36
    for path in files:
        original = path.read_bytes()
        copy = tmp_path / path.name
        copy.write_bytes(original)
        write_quiz_file(copy, json.loads(original.decode("utf-8")))
        assert copy.read_bytes() == original, f"{path.name} would change layout when rewritten"


def test_module_fields_update_and_survive_curriculum_reimport(db, course, admin_user, quiz_dir):
    pack = _pack()
    pack["modules"][0].update(estimated_minutes=200, learning_objectives=["First goal", "Second goal", "Third goal"])
    result = import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir)
    assert result["module_updated"] == [A3]
    module = db.query(models.CourseModule).filter_by(slug=A3).first()
    assert module.estimated_minutes == 200 and module.learning_objectives[0] == "First goal"
    import_curriculum.import_curriculum(db)
    db.refresh(module)
    assert module.estimated_minutes == 200
    again = import_pack(db, pack, "pack-admin", quiz_dir=quiz_dir)
    assert again["module_updated"] == []
    assert db.query(models.ContentAuditLog).filter_by(entity_type="module").count() == 1


def test_module_minutes_must_be_a_whole_number():
    pack = _pack()
    pack["modules"][0]["estimated_minutes"] = "soon"
    report = Report()
    validate_pack(pack, report)
    assert any("estimated_minutes must be a whole number" in e for e in report.errors)
