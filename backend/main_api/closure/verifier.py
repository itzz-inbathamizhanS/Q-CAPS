from typing import Dict, Any

def verify_technical_delta(before_evidence: Dict[str, Any], after_evidence: Dict[str, Any]) -> Dict[str, Any]:
    """
    Compares before and after scan evidence to verify if a finding was remediated.
    """
    delta = {
        "remediated": False,
        "same_asset": False,
        "details": {}
    }
    
    # Check if we are scanning the same asset
    # This is critical for preventing false competency
    if before_evidence.get("asset_id") == after_evidence.get("asset_id"):
        delta["same_asset"] = True
    else:
        return delta
        
    # Example check: look for PQC algorithms
    before_algo = before_evidence.get("normalized_payload", {}).get("pqc_algorithm")
    after_algo = after_evidence.get("normalized_payload", {}).get("pqc_algorithm")
    
    delta["details"]["before_algo"] = before_algo
    delta["details"]["after_algo"] = after_algo
    
    # Remediated if after scan has a PQC algo but before didn't, or similar logic
    # Real logic would check if the specific vulnerability type is gone
    if after_algo is not None and after_algo != before_algo:
        delta["remediated"] = True
        
    return delta
