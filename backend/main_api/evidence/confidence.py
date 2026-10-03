def weighted_confidence(
    protocol_evidence: float,
    certificate_evidence: float,
    source_code_evidence: float,
    repeated_observation: float,
    freshness: float
) -> float:
    """
    Calculates the confidence score of a cryptographic finding based on multiple evidence sources.
    Uses a weighted sum.
    """
    # Define weights for different types of evidence
    w_protocol = 0.40
    w_cert = 0.40
    w_source = 0.10
    w_repeat = 0.10
    
    base_confidence = (
        (protocol_evidence * w_protocol) +
        (certificate_evidence * w_cert) +
        (source_code_evidence * w_source) +
        (repeated_observation * w_repeat)
    )
    
    # Scale by freshness
    return min(1.0, base_confidence * freshness)

def freshness_factor(age_days: float, half_life_days: float = 30.0) -> float:
    """
    Calculates a decay factor based on the age of the evidence.
    """
    if half_life_days <= 0:
        return 0.0
    return 0.5 ** (age_days / half_life_days)
