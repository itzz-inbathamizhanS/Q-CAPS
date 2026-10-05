"""Organizations, memberships and the authorization matrix (docs/plans/T2.1_ORGANIZATIONS_PLAN.md, section 7)."""
import json
import uuid

import pytest

import models
from competency.seed import seed_competencies
from competency import requirements

ACTORS = ("padmin", "oadmin", "member", "researcher", "outsider", "otheradmin", "stranger", "owner")


@pytest.fixture
def world(db, make_user):
    seed_competencies(db)
    users = {}
    for name in ACTORS:
        users[name] = make_user(name, "admin" if name == "padmin" else "learner")
    org_a = models.Organization(name="Org A", slug="org-a", kind="organization")
    org_b = models.Organization(name="Org B", slug="org-b", kind="organization")
    db.add_all([org_a, org_b])
    db.flush()
    for name, org, role in (("oadmin", org_a, "org_admin"), ("member", org_a, "member"), ("researcher", org_a, "researcher"),
                            ("outsider", org_b, "member"), ("otheradmin", org_b, "org_admin")):
        db.add(models.OrganizationMembership(organization_id=org.id, user_id=users[name][0].id, org_role=role))

    def asset(**kw):
        a = models.Asset(canonical_target=f"{uuid.uuid4().hex[:6]}.example.org", asset_type="domain", **kw)
        db.add(a)
        db.flush()
        ev = models.Evidence(id=str(uuid.uuid4()), asset_id=a.id, evidence_type="TLS_SCAN", normalized_payload={},
                             payload_hash="h", scanner_version="2", classifier_version="1", confidence=1.0,
                             authorization_context="domain_verified")
        f = models.Finding(id=str(uuid.uuid4()), asset_id=a.id, evidence_id=ev.id, finding_type="pqc.kex.classical_only",
                           severity=0.6, confidence=1.0, status="OPEN", title="Key exchange is not post-quantum protected")
        iv = models.Intervention(id=str(uuid.uuid4()), finding_id=f.id, intervention_type="module")
        db.add_all([ev, f, iv])
        db.flush()
        requirements.derive_requirements(db, f)
        return {"asset": a.id, "evidence": ev.id, "finding": f.id, "intervention": iv.id}

    res = {
        "personal": asset(owner_user_id=users["owner"][0].id),
        "org": asset(organization_id=org_a.id),
        "shared": asset(),
    }
    db.commit()
    return {"users": users, "res": res, "org_a": org_a.id, "org_b": org_b.id}


def H(world, actor):
    return world["users"][actor][1]


# ---------------------------------------------------------------- reads

READ_EXPECT = {
    "personal": {"padmin": 200, "owner": 200},
    "org": {"padmin": 200, "oadmin": 200, "member": 200},
    "shared": {a: 200 for a in ACTORS},
}


@pytest.mark.parametrize("kind", ["personal", "org", "shared"])
@pytest.mark.parametrize("actor", ACTORS)
def test_read_matrix(client, world, kind, actor):
    r = world["res"][kind]
    expected = READ_EXPECT[kind].get(actor, 404)  # not visible: same answer as a missing id
    for url in (f"/api/findings/{r['finding']}", f"/api/findings/{r['finding']}/requirements",
                f"/api/findings/{r['finding']}/interventions", f"/api/evidence/{r['evidence']}",
                f"/api/interventions/{r['intervention']}"):
        assert client.get(url, headers=H(world, actor)).status_code == expected, (url, actor, kind)
    closures = client.get(f"/api/closures/{r['finding']}", headers=H(world, actor))
    assert closures.status_code == 200  # an invisible finding reads as having no closures


# ---------------------------------------------------------------- verify (manage)

VERIFY_EXPECT = {
    "personal": {"padmin": 200, "owner": 200},
    "org": {"padmin": 200, "oadmin": 200, "member": 403},
    "shared": {"padmin": 200},
}


@pytest.mark.parametrize("kind", ["personal", "org", "shared"])
@pytest.mark.parametrize("actor", ACTORS)
def test_verify_matrix(client, world, kind, actor):
    r = world["res"][kind]
    visible = READ_EXPECT[kind].get(actor, 404) == 200
    expected = VERIFY_EXPECT[kind].get(actor, 403 if visible else 404)
    resp = client.post(f"/api/interventions/{r['intervention']}/verify", headers=H(world, actor), json={})
    assert resp.status_code == expected, (actor, kind, resp.text)


# ---------------------------------------------------------------- create interventions

@pytest.mark.parametrize("actor,expected", [
    ("padmin", 200), ("oadmin", 200), ("member", 403), ("researcher", 403),
    ("outsider", 403), ("otheradmin", 403), ("stranger", 403), ("owner", 403),
])
def test_assigning_an_intervention_on_an_org_finding(client, world, actor, expected):
    body = {"finding_id": world["res"]["org"]["finding"], "intervention_type": "module",
            "assigned_user_id": world["users"]["member"][0].id}
    assert client.post("/api/interventions", headers=H(world, actor), json=body).status_code == expected


def test_assignee_must_belong_to_the_organization(client, world):
    body = {"finding_id": world["res"]["org"]["finding"], "intervention_type": "module",
            "assigned_user_id": world["users"]["outsider"][0].id}
    assert client.post("/api/interventions", headers=H(world, "oadmin"), json=body).status_code == 422


def test_assigning_is_audited(client, db, world):
    body = {"finding_id": world["res"]["org"]["finding"], "intervention_type": "module"}
    client.post("/api/interventions", headers=H(world, "oadmin"), json=body)
    ev = db.query(models.AuditEvent).filter_by(action="intervention.create").one()
    assert ev.actor_user_id == world["users"]["oadmin"][0].id and ev.organization_id == world["org_a"]


# ---------------------------------------------------------------- membership management

@pytest.mark.parametrize("actor,expected", [
    ("padmin", 200), ("oadmin", 200), ("member", 403), ("researcher", 403),
    ("outsider", 404), ("otheradmin", 404), ("stranger", 404), ("owner", 404),
])
def test_member_list_matrix(client, world, actor, expected):
    assert client.get(f"/api/organizations/{world['org_a']}/members", headers=H(world, actor)).status_code == expected


def test_org_admin_manages_members_and_the_last_admin_is_kept(client, db, world):
    h = H(world, "oadmin")
    org = world["org_a"]
    assert client.post(f"/api/organizations/{org}/members", headers=h, json={"user_name": "stranger", "org_role": "member"}).status_code == 201
    assert client.post(f"/api/organizations/{org}/members", headers=h, json={"user_name": "stranger", "org_role": "member"}).status_code == 409
    stranger_id = world["users"]["stranger"][0].id
    assert client.patch(f"/api/organizations/{org}/members/{stranger_id}", headers=h, json={"org_role": "researcher"}).json()["org_role"] == "researcher"
    assert client.delete(f"/api/organizations/{org}/members/{stranger_id}", headers=h).status_code == 204
    oadmin_id = world["users"]["oadmin"][0].id
    assert client.delete(f"/api/organizations/{org}/members/{oadmin_id}", headers=h).status_code == 409
    assert client.patch(f"/api/organizations/{org}/members/{oadmin_id}", headers=h, json={"org_role": "member"}).status_code == 409
    actions = [e.action for e in db.query(models.AuditEvent).order_by(models.AuditEvent.id)]
    assert actions == ["membership.add", "membership.role", "membership.remove"]


def test_only_platform_admins_create_organizations(client, world):
    body = {"name": "New Org", "slug": "new-org", "admin_user_id": world["users"]["stranger"][0].id}
    assert client.post("/api/organizations", headers=H(world, "oadmin"), json=body).status_code == 403
    r = client.post("/api/organizations", headers=H(world, "padmin"), json=body)
    assert r.status_code == 201
    mine = client.get("/api/organizations/mine", headers=H(world, "stranger")).json()
    assert [(o["slug"], o["org_role"]) for o in mine] == [("new-org", "org_admin")]


def test_roles_cannot_be_invented_by_the_client(client, world):
    org = world["org_a"]
    r = client.post(f"/api/organizations/{org}/members", headers=H(world, "oadmin"), json={"user_name": "stranger", "org_role": "superadmin"})
    assert r.status_code == 422


# ---------------------------------------------------------------- scans and scopes

def test_only_org_admins_record_scans_for_the_organization(client, world):
    from test_scan_assets import KEX, full_result
    from test_scanner_v2_backend import post_log
    member, mh = world["users"]["member"]
    result = full_result([KEX], target="org-site.example.org")
    r = post_log(client, member, mh, result, organization_id=world["org_a"])
    assert r.status_code == 403
    oadmin, oh = world["users"]["oadmin"]
    assert post_log(client, oadmin, oh, result, organization_id=world["org_a"]).status_code == 200
    assets = client.get("/api/scanner/assets", headers=H(world, "member")).json()
    org_assets = [a for a in assets if a["target"] == "org-site.example.org"]
    assert len(org_assets) == 1 and org_assets[0]["organization_name"] == "Org A"
    assert all(a["target"] != "org-site.example.org" for a in client.get("/api/scanner/assets", headers=H(world, "outsider")).json())


def test_skill_matrix_scope_follows_membership_and_assignment(client, db, world):
    def codes(actor):
        rows = client.get("/api/users/me/skill-matrix", headers=H(world, actor)).json()["rows"]
        return {r["competency_code"] for r in rows if r["required_level"]}
    # The org finding (and the shared one) require PQC.6; outsiders only see the shared one.
    assert "PQC.6" in codes("member")
    # Once the org intervention is assigned to the org admin, it no longer sets the member's requirements; the
    # shared finding still does, so check through the driving findings.
    iv = db.get(models.Intervention, world["res"]["org"]["intervention"])
    iv.assigned_user_id = world["users"]["oadmin"][0].id
    db.commit()
    rows = client.get("/api/users/me/skill-matrix", headers=H(world, "member")).json()["rows"]
    drivers = {f["finding_id"] for r in rows for f in r["driving_findings"]}
    assert world["res"]["org"]["finding"] not in drivers and world["res"]["shared"]["finding"] in drivers
    rows = client.get("/api/users/me/skill-matrix", headers=H(world, "outsider")).json()["rows"]
    assert world["res"]["org"]["finding"] not in {f["finding_id"] for r in rows for f in r["driving_findings"]}


def test_cli_bootstraps_a_lab_and_adds_members(db, make_user):
    from organizations import cli
    make_user("lab-admin")
    make_user("participant")
    org = cli.create_org(db, "Q-CAPS Lab", "qcaps-lab", "lab", "lab-admin")
    cli.add_member(db, "qcaps-lab", "participant", "member")
    roles = {m.user_id: m.org_role for m in db.query(models.OrganizationMembership).filter_by(organization_id=org.id)}
    assert sorted(roles.values()) == ["member", "org_admin"] and org.kind == "lab"
    assert [e.action for e in db.query(models.AuditEvent).order_by(models.AuditEvent.id)] == ["organization.create", "membership.add"]
    with pytest.raises(SystemExit):
        cli.add_member(db, "qcaps-lab", "participant", "member")  # already a member
