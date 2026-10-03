def calculate_path_risk(
    asset_criticality: float,
    confidentiality_lifetime_factor: float,
    exposure_confidence: float,
    migration_urgency: float,
    competency_deficit: float
) -> float:
    """
    Calculates the multi-dimensional risk of a cryptographic exposure path.
    """
    # Base risk is driven by the asset and finding severity
    technical_risk = (
        asset_criticality *
        confidentiality_lifetime_factor *
        exposure_confidence *
        migration_urgency
    )
    
    # Human element acts as a multiplier. If deficit is 0, risk is somewhat mitigated.
    # We use a baseline of 0.2 + deficit to show that even with perfect knowledge, 
    # a technical exposure carries inherent risk until remediated.
    human_risk_multiplier = 0.2 + (0.8 * competency_deficit)
    
    return technical_risk * human_risk_multiplier

def evaluate_competency_deficit(required_score: float, actual_score: float) -> float:
    """
    Deficit is bound between 0 and 1.
    """
    return max(0.0, min(1.0, required_score - actual_score))
