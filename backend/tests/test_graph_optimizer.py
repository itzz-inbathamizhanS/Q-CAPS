import pytest
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'main_api'))
from graph.schema import Graph, Node, Edge
from graph.optimizer import optimize_intervention_paths

def test_optimizer_selects_high_risk_path():
    graph = Graph(
        nodes=[
            Node(id="user_1", type="Learner", properties={}),
            Node(id="asset_1", type="Asset", properties={"criticality": 1.0, "confidentiality_lifetime": 3650}), # 10 years
            Node(id="finding_1", type="Finding", properties={"severity": 10.0, "confidence": 1.0, "migration_urgency": 1.5}),
            Node(id="comp_1", type="Competency", properties={})
        ],
        edges=[
            Edge(source_id="finding_1", target_id="asset_1", relationship="AFFECTS", properties={}),
            Edge(source_id="finding_1", target_id="comp_1", relationship="REQUIRES", properties={"minimum_score": 0.9}),
            Edge(source_id="user_1", target_id="comp_1", relationship="HAS_CAPABILITY", properties={"knowledge_score": 0.2})
        ]
    )
    
    interventions = optimize_intervention_paths(graph, user_id=1, available_time_hours=4.0)
    
    assert len(interventions) == 1
    assert interventions[0]["finding_id"] == "finding_1"
    assert interventions[0]["risk_score"] > 0
    assert interventions[0]["competency_deficit"] == pytest.approx(0.7) # 0.9 required - 0.2 actual
