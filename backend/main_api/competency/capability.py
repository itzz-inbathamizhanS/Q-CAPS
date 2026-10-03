from typing import Dict, Any

def update_capability_state(
    current_state: Dict[str, Any],
    learner_result: Dict[str, Any],
    technical_verification: bool
) -> Dict[str, Any]:
    """
    Updates a learner's capability state based on a new intervention attempt and technical verification.
    """
    new_state = current_state.copy()
    
    # Update scores with moving average or just taking the latest if it's better
    new_knowledge = learner_result.get("knowledge_score", 0.0)
    new_procedural = learner_result.get("procedural_score", 0.0)
    
    new_state["knowledge_score"] = max(new_state.get("knowledge_score", 0.0), new_knowledge)
    new_state["procedural_score"] = max(new_state.get("procedural_score", 0.0), new_procedural)
    
    if technical_verification:
        new_state["operational_score"] = 1.0  # Or some incremental value
        new_state["confidence"] = min(1.0, new_state.get("confidence", 0.0) + 0.2)
    else:
        new_state["confidence"] = max(0.0, new_state.get("confidence", 0.0) - 0.2)
        
    return new_state
