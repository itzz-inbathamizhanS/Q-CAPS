import json
from fastapi.testclient import TestClient
from main import app
from database import Base, engine

client = TestClient(app)

passed = 0
failed = 0

def check(label, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  PASS: {label}")
    else:
        failed += 1
        print(f"  FAIL: {label}  {detail}")

def run_api_tests():
    print("=" * 60)
    print("API Integration Tests")
    print("=" * 60)

    # 1. Test Root
    res_root = client.get("/")
    check("Root status code == 200", res_root.status_code == 200)
    check("Root message in response", "message" in res_root.json())

    # 2. Test Health Check
    res_health = client.get("/api/health")
    check("Health status code == 200", res_health.status_code == 200)
    check("Health status is healthy", res_health.json().get("status") == "healthy")

    # 3. Create Users
    res_user1 = client.post("/api/users", json={"name": "Alice"})
    check("Create Alice status code == 200", res_user1.status_code == 200)
    user_1 = res_user1.json()
    u1_id = user_1["id"]

    res_user2 = client.post("/api/users", json={"name": "Bob"})
    check("Create Bob status code == 200", res_user2.status_code == 200)
    user_2 = res_user2.json()
    u2_id = user_2["id"]

    res_user3 = client.post("/api/users", json={"name": "Charlie"})
    check("Create Charlie status code == 200", res_user3.status_code == 200)
    user_3 = res_user3.json()
    u3_id = user_3["id"]

    res_user4 = client.post("/api/users", json={"name": "Dave"})
    check("Create Dave status code == 200", res_user4.status_code == 200)
    user_4 = res_user4.json()
    u4_id = user_4["id"]

    # 4. Submit Quiz Scores for Alice (Standard Case)
    # Alice gets 9/10 on Quantum Fundamentals (90%) -> 450 XP
    res_q1 = client.post("/api/quizzes/submit", json={
        "user_id": u1_id,
        "topic": "quantum_fundamentals",
        "correct_answers": 9,
        "total_questions": 10
    })
    check("Alice Q1 submission status == 200", res_q1.status_code == 200)
    check("Alice Q1 score == 90.0", res_q1.json().get("score") == 90.0)

    # Alice gets 3/10 on PQC (30%) -> 150 XP
    res_q2 = client.post("/api/quizzes/submit", json={
        "user_id": u1_id,
        "topic": "pqc",
        "correct_answers": 3,
        "total_questions": 10
    })
    check("Alice Q2 submission status == 200", res_q2.status_code == 200)
    check("Alice Q2 score == 30.0", res_q2.json().get("score") == 30.0)

    # Alice gets 5/10 on Practical Security (50%) -> 250 XP
    res_q3 = client.post("/api/quizzes/submit", json={
        "user_id": u1_id,
        "topic": "practical_security",
        "correct_answers": 5,
        "total_questions": 10
    })
    check("Alice Q3 submission status == 200", res_q3.status_code == 200)
    check("Alice Q3 score == 50.0", res_q3.json().get("score") == 50.0)
    # Total Alice XP: 450 + 150 + 250 = 850 XP

    # 5. Submit Quiz Scores for Bob (Strong Case)
    # Bob gets 10/10 on QF (100%), 9/10 on PQC (90%), 8/10 on PS (80%)
    client.post("/api/quizzes/submit", json={
        "user_id": u2_id,
        "topic": "quantum_fundamentals",
        "correct_answers": 10,
        "total_questions": 10
    })
    client.post("/api/quizzes/submit", json={
        "user_id": u2_id,
        "topic": "pqc",
        "correct_answers": 9,
        "total_questions": 10
    })
    client.post("/api/quizzes/submit", json={
        "user_id": u2_id,
        "topic": "practical_security",
        "correct_answers": 8,
        "total_questions": 10
    })
    # Total Bob XP: 500 + 450 + 400 = 1350 XP

    # 6. Submit Scanner Log for Charlie (Unattempted + Critical RSA Scanner Finding)
    charlie_scan = {
        "user_id": u3_id,
        "endpoint": "https://charlie-vulnerable.com",
        "status": "Vulnerable to Shor's Algorithm",
        "vulnerabilities_found": 1,
        "details": json.dumps([
            {"algorithmDetected": "RSA-2048", "threatLevel": "Critical (Shor's Algorithm)"}
        ])
    }
    res_s_charlie = client.post("/api/scanner/log", json=charlie_scan)
    check("Charlie scanner log status == 200", res_s_charlie.status_code == 200)
    check("Charlie log vulnerabilities_found == 1", res_s_charlie.json().get("vulnerabilities_found") == 1)

    # 7. Submit Quiz + Scanner Log for Dave (Weak PQC + Critical RSA Scanner Finding)
    # Dave gets 55% (Weak) on PQC
    res_q_dave = client.post("/api/quizzes/submit", json={
        "user_id": u4_id,
        "topic": "pqc",
        "correct_answers": 11,
        "total_questions": 20
    })
    check("Dave quiz score == 55.0", abs(res_q_dave.json().get("score", 0) - 55.0) < 0.1)

    # Submit practical_security quiz for Dave to avoid it being recommended instead of pqc, but keep XP low
    res_q_dave_ps = client.post("/api/quizzes/submit", json={
        "user_id": u4_id,
        "topic": "practical_security",
        "correct_answers": 1,
        "total_questions": 1
    })
    check("Dave practical_security quiz submission status == 200", res_q_dave_ps.status_code == 200)

    dave_scan = {
        "user_id": u4_id,
        "endpoint": "https://dave-legacy.com",
        "status": "Vulnerable",
        "vulnerabilities_found": 1,
        "details": json.dumps([
            {"algorithmDetected": "RSA-2048", "threatLevel": "Critical (Shor's Algorithm)"}
        ])
    }
    res_s_dave = client.post("/api/scanner/log", json=dave_scan)
    check("Dave scanner log status == 200", res_s_dave.status_code == 200)

    # 8. Get Recommendations and verify logic
    # Alice: pqc is 30% (lowest score) -> tc_pqc (Critical)
    res_alice_rec = client.get(f"/api/users/{u1_id}/recommendation")
    alice_rec = res_alice_rec.json()
    check("Alice recommended course == tc_pqc", alice_rec.get("course_id") == "tc_pqc")
    check("Alice recommendation priority == Critical", alice_rec.get("priority") == "Critical")

    # Bob: QF (100%), PQC (90%), PS (80%) -> No major skill gap
    res_bob_rec = client.get(f"/api/users/{u2_id}/recommendation")
    bob_rec = res_bob_rec.json()
    check("Bob status == no_major_skill_gap", bob_rec.get("status") == "no_major_skill_gap")
    check("Bob recommended course is None", bob_rec.get("course_id") is None)

    # Charlie: Unattempted + Critical RSA → Critical recommendation for PQC (tc_pqc)
    res_charlie_rec = client.get(f"/api/users/{u3_id}/recommendation")
    charlie_rec = res_charlie_rec.json()
    check("Charlie recommended course == tc_pqc", charlie_rec.get("course_id") == "tc_pqc")
    check("Charlie priority == Critical", charlie_rec.get("priority") == "Critical")
    check("Charlie quiz_score is None", charlie_rec.get("quiz_score") is None)
    check("Charlie scanner_risk == High", charlie_rec.get("scanner_risk") == "High")

    # Dave: Weak PQC (55%) + Critical RSA → Combined Critical priority recommendation
    res_dave_rec = client.get(f"/api/users/{u4_id}/recommendation")
    dave_rec = res_dave_rec.json()
    check("Dave recommended course == tc_pqc", dave_rec.get("course_id") == "tc_pqc")
    check("Dave priority == Critical (Weak 55% boosted to Critical by RSA)", dave_rec.get("priority") == "Critical")
    check("Dave quiz_score == 55.0", abs(dave_rec.get("quiz_score", 0) - 55.0) < 0.1)
    check("Dave scanner_risk == High", dave_rec.get("scanner_risk") == "High")

    # 9. Verify Leaderboard Rankings
    res_leaderboard = client.get("/api/leaderboard")
    leaderboard = res_leaderboard.json()
    check("Leaderboard returns correct size", len(leaderboard) == 4)
    # Bob (1350 XP) -> Rank 1, Alice (850 XP) -> Rank 2, Dave (550 XP) -> Rank 3, Charlie (0 XP) -> Rank 4
    check("Leaderboard Rank 1 is Bob", leaderboard[0]["name"] == "Bob" and leaderboard[0]["rank"] == 1)
    check("Leaderboard Rank 2 is Alice", leaderboard[1]["name"] == "Alice" and leaderboard[1]["rank"] == 2)
    check("Leaderboard Rank 3 is Dave", leaderboard[2]["name"] == "Dave" and leaderboard[2]["rank"] == 3)
    check("Leaderboard Rank 4 is Charlie", leaderboard[3]["name"] == "Charlie" and leaderboard[3]["rank"] == 4)

    # 10. Verify Profile Endpoint output formats
    res_alice_profile = client.get(f"/api/users/{u1_id}/profile")
    alice_profile = res_alice_profile.json()
    check("Profile U-ID is correct format", alice_profile.get("user_id") == "U-000001")
    check("Profile email matches name", alice_profile.get("email") == "alice@example.com")
    check("Profile readiness score is computed", alice_profile.get("readiness_score") == 43) # (90+30+50+0)/4 = 42.5 -> rounds to 43
    check("Profile global rank is 2", alice_profile.get("global_rank") == 2)
    check("Profile unlocked badges contains Quantum Novice", "Quantum Novice" in alice_profile.get("unlocked_badges", []))
    check("Profile recommended next module is pqc", alice_profile.get("recommended_next_module") == "Introduction to Post-Quantum Cryptography")

    print("\n" + "=" * 60)
    total = passed + failed
    print(f"API Integration Results: {passed}/{total} passed, {failed}/{total} failed")
    if failed == 0:
        print("All API integration tests passed successfully!")
    else:
        print("SOME API TESTS FAILED — see above for details.")
    print("=" * 60)
    return failed

if __name__ == "__main__":
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    exit_code = run_api_tests()
    raise SystemExit(exit_code)
