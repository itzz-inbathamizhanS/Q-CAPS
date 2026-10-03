from typing import Dict, Any
from .state_machine import ClosureStatus
from .verifier import verify_technical_delta

def process_closure_verification(
    intervention: Dict[str, Any],
    learner_result: Dict[str, Any],
    before_evidence: Dict[str, Any],
    after_evidence: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluates whether an intervention can be closed based on technical verification.
    """
    technical_delta = verify_technical_delta(before_evidence, after_evidence)
    
    knowledge_ok = learner_result.get("knowledge_score", 0) >= intervention.get("minimum_score", 0.8)
    practical_ok = learner_result.get("procedural_score", 0) >= intervention.get("minimum_score", 0.8)
    
    technical_ok = technical_delta.get("remediated", False) and technical_delta.get("same_asset", False)
    
    if knowledge_ok and practical_ok and technical_ok:
        status = ClosureStatus.CLOSED
    elif knowledge_ok or practical_ok or technical_ok:
        status = ClosureStatus.PARTIALLY_CLOSED
    else:
        status = ClosureStatus.OPEN
        
    return {
        "status": status,
        "technical_delta": technical_delta,
        "learner_result_ok": knowledge_ok and practical_ok,
        "technical_ok": technical_ok
    }
