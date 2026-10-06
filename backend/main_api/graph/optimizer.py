from typing import List, Dict, Any
from .schema import Graph
from .risk_paths import calculate_path_risk, evaluate_competency_deficit

def get_node(graph: Graph, node_id: str):
    for n in graph.nodes:
        if n.id == node_id:
            return n
    return None

def get_edges_by_source(graph: Graph, source_id: str, rel_type: str = None):
    return [e for e in graph.edges if e.source_id == source_id and (rel_type is None or e.relationship == rel_type)]

def optimize_intervention_paths(graph: Graph, user_id: int, available_time_hours: float) -> List[Dict[str, Any]]:
    """
    Greedy optimizer that finds the highest risk paths and selects interventions to mitigate them,
    subject to the available_time_hours constraint.
    """
    user_node_id = f"user_{user_id}"
    
    # 1. Identify all findings in the graph
    findings = [n for n in graph.nodes if n.type == "Finding"]
    
    risk_paths = []
    
    for finding in findings:
        # Find affected asset
        affects_edges = get_edges_by_source(graph, finding.id, "AFFECTS")
        if not affects_edges:
            continue
            
        asset = get_node(graph, affects_edges[0].target_id)
        if not asset:
            continue
            
        # Find required competency
        requires_edges = get_edges_by_source(graph, finding.id, "REQUIRES")
        if not requires_edges:
            continue
            
        required_comp_id = requires_edges[0].target_id
        min_score = requires_edges[0].properties.get("minimum_score", 0.8)
        
        # Determine learner's current capability for this competency
        user_capability_edges = get_edges_by_source(graph, user_node_id, "HAS_CAPABILITY")
        cap_edge = next((e for e in user_capability_edges if e.target_id == required_comp_id), None)
        
        actual_score = 0.0
        capability_known = cap_edge is not None
        if cap_edge:
            actual_score = cap_edge.properties.get("knowledge_score", 0.0) # simplify to knowledge score for now
            
        competency_deficit = evaluate_competency_deficit(min_score, actual_score)
        
        # Calculate Confidentiality Lifetime Factor
        # Heuristic: 1.0 base, +0.1 for every year of required confidentiality.
        # So a 50-year HNDL (Harvest Now Decrypt Later) risk yields a 6.0 multiplier.
        lifetime_years = asset.properties.get("confidentiality_lifetime", 0) / 365.0
        lifetime_factor = 1.0 + (0.1 * lifetime_years)
        
        risk = calculate_path_risk(
            asset_criticality=float(asset.properties.get("criticality", 1.0)),
            confidentiality_lifetime_factor=float(lifetime_factor),
            exposure_confidence=float(finding.properties.get("confidence", 1.0)),
            migration_urgency=float(finding.properties.get("migration_urgency", 1.0)),
            competency_deficit=float(competency_deficit)
        )
        
        # If risk is greater than 0, propose an intervention
        if risk > 0 and competency_deficit > 0:
            # We assume a fixed time cost for interventions in this prototype
            time_cost = 2.0 
            
            risk_paths.append({
                "finding_id": finding.id,
                "asset_id": asset.id,
                "competency_id": required_comp_id,
                "finding_type": finding.properties.get("finding_type"),
                "finding_title": finding.properties.get("title"),
                "minimum_score": min_score,
                "actual_score": actual_score if capability_known else None,  # None = never assessed
                "rationale": requires_edges[0].properties.get("rationale"),
                "risk_score": risk,
                "competency_deficit": competency_deficit,
                "time_cost_hours": time_cost,
                "proposed_intervention_type": "LAB_REMEDIATION" if competency_deficit > 0.5 else "THEORY_MODULE"
            })
            
    # 2. Greedy optimization: Sort by risk descending
    risk_paths.sort(key=lambda x: x["risk_score"], reverse=True)
    
    # 3. Knapsack (Greedy): Select paths that fit into available_time
    selected_interventions = []
    time_spent = 0.0
    
    for path in risk_paths:
        if time_spent + path["time_cost_hours"] <= available_time_hours:
            selected_interventions.append(path)
            time_spent += path["time_cost_hours"]
            
    return selected_interventions
