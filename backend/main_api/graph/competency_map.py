"""Which competency a scanner finding requires, and which course teaches it.

DRAFT FOR REVIEW. This table is a methodological claim: it states that closing a given kind of exposure
needs a given body of knowledge. It is deliberately conservative:

* Competencies are the existing quiz topics, because those are the only competencies the platform can
  currently measure (QuizScore) and the only ones with a course.
* A finding type is mapped only where a module in that topic actually teaches the subject. Everything
  else is left unmapped and is handled by the score-based recommender; no requirement is invented.
* MINIMUM_SCORE reuses the 0.8 default the optimizer already applied (the "Strong" band of
  recommendation_scores.get_priority). It is a placeholder until the item bank is calibrated.
"""
from typing import Dict, NamedTuple, Optional

MINIMUM_SCORE = 0.8


class Competency(NamedTuple):
    topic: str
    name: str
    course_id: str
    course_title: str


class Requirement(NamedTuple):
    competency: str  # key into COMPETENCIES
    minimum_score: float
    rationale: str


COMPETENCIES: Dict[str, Competency] = {
    "pqc": Competency("pqc", "Post-quantum cryptography", "track_b_b9_pqc_fundamentals", "PQC Fundamentals"),
    "practical_security": Competency(
        "practical_security", "Practical cryptographic security", "track_d_e4_crypto_agility", "Cryptographic Agility"),
}

# (finding_type prefix, requirement). First match wins, so list specific prefixes before general ones.
# Not mapped: http.* and dns.* (header and mail-policy hygiene), and the info/low findings that are never tracked.
_REQUIREMENTS = (
    ("pqc.kex.", Requirement(
        "pqc", MINIMUM_SCORE, "Classical-only key exchange is exposed to harvest-now-decrypt-later; PQC modules cover hybrid KEMs.")),
    ("tls.kex.", Requirement(
        "practical_security", MINIMUM_SCORE, "Key-exchange configuration is covered by the network-security and crypto-agility modules.")),
    ("tls.version.", Requirement(
        "practical_security", MINIMUM_SCORE, "Protocol-version hardening is covered by the network-security engineering module.")),
    ("tls.legacy.", Requirement(
        "practical_security", MINIMUM_SCORE, "Disabling legacy protocol versions is covered by the network-security engineering module.")),
    ("cert.", Requirement(
        "practical_security", MINIMUM_SCORE, "Certificate lifecycle is covered by the cryptographic-discovery and crypto-agility modules.")),
    ("exposure.port.", Requirement(
        "practical_security", MINIMUM_SCORE, "Reducing exposed services is covered by the networking and network-security modules.")),
)


def requirement_for(finding_type: str) -> Optional[Requirement]:
    for prefix, requirement in _REQUIREMENTS:
        if finding_type.startswith(prefix):
            return requirement
    return None
