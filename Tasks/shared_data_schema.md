# The Global Data Schema (API Contract)

To ensure that Niranjan's Frontend, Vishnu Priya's Backend, Inba's Scanner, and Aasif's Quizzes all connect perfectly without breaking, **everyone must use these exact variable names.** 

Whenever your code sends or receives data about a user, it must look exactly like the JSON examples below.

---

## 1. The Common "User Profile" Object
*This is what Vishnu Priya's backend will send to Niranjan's frontend to display on the User Dashboard.*

```json
{
  "user_id": "U-992400",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "readiness_score": 85,
  "total_xp": 1250,
  "global_rank": 4,
  "unlocked_badges": ["Quantum Novice", "RSA Hacker"],
  "recommended_next_module": "Module 3: PQC Mitigation"
}
```

## 2. The Common "Quiz Submission" Object
*This is the exact format Aasif must use when designing quizzes, and Niranjan must use when sending quiz answers to Vishnu Priya.*

```json
{
  "user_id": "U-992400",
  "module_id": "module_1_basics",
  "questions_answered": 10,
  "correct_answers": 8,
  "time_taken_seconds": 120,
  "passed": true
}
```

## 3. The Common "Scanner Mission" Object
*This is the exact output Inba's Python script must generate, which Vishnu Priya's math algorithm will read.*

```json
{
  "target_url": "https://example.com",
  "scan_timestamp": "2026-08-22T10:00:00Z",
  "encryption_detected": "RSA-2048",
  "is_quantum_safe": false,
  "vulnerabilities_found": [
    "Vulnerable to Shor's Algorithm",
    "Outdated TLS Version"
  ],
  "mission_xp_awarded": 50
}
```

---

### ⚠️ Important Rule for the Team:
If anyone wants to add a new variable (for example, if Niranjan wants to add a "profile_picture_url"), you must **all agree on the exact spelling of the variable** before adding it. If Niranjan types `profile_picture_url` and Vishnu Priya types `profile_pic`, the website will break!
