from typing import List, Dict, Any

def select_intervention(
    finding: Dict[str, Any],
    capabilities: List[Dict[str, Any]],
    required_competencies: List[str]
) -> Dict[str, Any]:
    """
    Selects the appropriate intervention for a learner given a finding and their capabilities.
    """
    # Simple prototype selector
    # In a real system, this evaluates capability gaps
    
    # Just return a mock intervention plan
    return {
        "intervention_type": "LAB",
        "module_id": "MOD_MIGRATE_101",
        "lab_template_id": "lab-tls-migration",
        "minimum_score": 0.8
    }
