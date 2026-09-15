from recommendation import get_recommendation_from_scores

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

def print_rec(rec):
    print(f"    course_id    = {rec.get('course_id')}")
    print(f"    title        = {rec.get('title')}")
    print(f"    topic        = {rec.get('topic')}")
    print(f"    priority     = {rec.get('priority')}")
    print(f"    quiz_score   = {rec.get('quiz_score')}")
    print(f"    scanner_risk = {rec.get('scanner_risk')}")
    print(f"    status       = {rec.get('status')}")
    print(f"    reason       = {rec.get('reason')}")


def run_tests():
    print("=" * 60)
    print("Recommendation Engine Tests")
    print("=" * 60)

    # ------------------------------------------------------------------
    # Test 1: Low PQC score is recommended first
    # ------------------------------------------------------------------
    print("\nTest 1: Low PQC score (35%) is recommended")
    scores = {
        "quantum_fundamentals": 90,
        "classical_crypto": 75,
        "pqc": 35,
        "practical_security": 50
    }
    rec = get_recommendation_from_scores(scores)
    print_rec(rec)
    check("course_id == tc_pqc", rec["course_id"] == "tc_pqc",
          f"got {rec['course_id']}")
    check("priority == Critical", rec["priority"] == "Critical",
          f"got {rec['priority']}")
    check("quiz_score == 35", rec["quiz_score"] == 35,
          f"got {rec['quiz_score']}")
    check("status == recommendation", rec["status"] == "recommendation")

    # ------------------------------------------------------------------
    # Test 2: Unattempted topics
    # ------------------------------------------------------------------
    print("\nTest 2: Unattempted topics handled correctly")
    scores = {
        "quantum_fundamentals": 85,
    }
    rec = get_recommendation_from_scores(scores)
    print_rec(rec)
    check("recommended topic is unattempted",
          rec["topic"] in ("pqc", "practical_security"),
          f"got {rec['topic']}")
    check("quiz_score is None (not 0)",
          rec["quiz_score"] is None,
          f"got {rec['quiz_score']}")
    check("priority == not_attempted",
          rec["priority"] == "not_attempted",
          f"got {rec['priority']}")
    check("reason does NOT claim 0%",
          "0%" not in rec["reason"],
          f"reason: {rec['reason']}")
    check("status == recommendation", rec["status"] == "recommendation")

    # ------------------------------------------------------------------
    # Test 3: All scores are Strong (80+) and all attempted → no gap
    # ------------------------------------------------------------------
    print("\nTest 3: All Strong scores -> no_major_skill_gap")
    scores = {
        "quantum_fundamentals": 95,
        "pqc": 88,
        "practical_security": 82,
    }
    rec = get_recommendation_from_scores(scores)
    print_rec(rec)
    check("status == no_major_skill_gap",
          rec["status"] == "no_major_skill_gap",
          f"got {rec['status']}")
    check("priority == Strong", rec["priority"] == "Strong",
          f"got {rec['priority']}")
    check("course_id is None", rec["course_id"] is None,
          f"got {rec['course_id']}")

    # ------------------------------------------------------------------
    # Test 4: Critical RSA scanner finding + weak PQC score
    # ------------------------------------------------------------------
    print("\nTest 4: Critical RSA scanner + weak PQC score")
    scores = {
        "quantum_fundamentals": 80,
        "pqc": 55,
        "practical_security": 70,
    }
    scanner = [
        {"algorithm": "RSA-2048", "severity": "Critical", "threat": "Shor's Algorithm"},
    ]
    rec = get_recommendation_from_scores(scores, scanner_findings=scanner)
    print_rec(rec)
    check("recommended topic is pqc or practical_security",
          rec["topic"] in ("pqc", "practical_security"),
          f"got {rec['topic']}")
    check("priority is Critical or Weak (boosted by scanner)",
          rec["priority"] in ("Critical", "Weak"),
          f"got {rec['priority']}")
    check("scanner_risk is not None",
          rec["scanner_risk"] is not None,
          f"got {rec['scanner_risk']}")
    check("status == recommendation", rec["status"] == "recommendation")

    # ------------------------------------------------------------------
    # Test 5: AES-256 low-risk finding does NOT create urgency
    # ------------------------------------------------------------------
    print("\nTest 5: AES-256 Low-risk finding does not boost urgency")
    scores = {
        "quantum_fundamentals": 80,
        "pqc": 80,
        "practical_security": 80,
    }
    scanner = [
        {"algorithm": "AES-256-GCM", "severity": "Low"},
    ]
    rec = get_recommendation_from_scores(scores, scanner_findings=scanner)
    print_rec(rec)
    check("status == no_major_skill_gap",
          rec["status"] == "no_major_skill_gap",
          f"got {rec['status']}")
    check("scanner_risk is None (AES not mapped)",
          rec.get("scanner_risk") is None,
          f"got {rec.get('scanner_risk')}")

    # ------------------------------------------------------------------
    # Test 6: classical_crypto weak score — not recommended directly
    # ------------------------------------------------------------------
    print("\nTest 6: classical_crypto weak (10%) but no course exists")
    scores = {
        "quantum_fundamentals": 80,
        "classical_crypto": 10,
        "pqc": 90,
        "practical_security": 85,
    }
    rec = get_recommendation_from_scores(scores)
    print_rec(rec)
    check("course_id is NOT classical_crypto",
          rec.get("course_id") != "classical_crypto",
          f"got {rec.get('course_id')}")
    check("topic is NOT classical_crypto",
          rec.get("topic") != "classical_crypto",
          f"got {rec.get('topic')}")
    # All available courses are Strong → no_major_skill_gap
    check("status == no_major_skill_gap (available courses all strong)",
          rec["status"] == "no_major_skill_gap",
          f"got {rec['status']}")

    # ------------------------------------------------------------------
    # Test 7: Scanner boosts unattempted topic above attempted weak topic
    # ------------------------------------------------------------------
    print("\nTest 7: Scanner boosts unattempted PQC above attempted weak QF")
    scores = {
        "quantum_fundamentals": 55,
        "practical_security": 70,
    }
    scanner = [
        {"algorithm": "RSA-2048", "severity": "Critical", "threat": "Shor's Algorithm"},
    ]
    rec = get_recommendation_from_scores(scores, scanner_findings=scanner)
    print_rec(rec)
    check("recommended topic is pqc (scanner-boosted unattempted)",
          rec["topic"] == "pqc",
          f"got {rec['topic']}")
    check("priority is Critical (scanner-driven)",
          rec["priority"] == "Critical",
          f"got {rec['priority']}")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    print("\n" + "=" * 60)
    total = passed + failed
    print(f"Results: {passed}/{total} passed, {failed}/{total} failed")
    if failed == 0:
        print("All recommendation engine tests passed successfully!")
    else:
        print("SOME TESTS FAILED — see above for details.")
    print("=" * 60)
    return failed


if __name__ == "__main__":
    exit_code = run_tests()
    raise SystemExit(exit_code)
