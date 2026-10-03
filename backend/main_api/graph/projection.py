from sqlalchemy.orm import Session
from models import Asset, Finding, Competency, LearnerCapability, Intervention, User
from .schema import Graph, Node, Edge

def build_graph_projection(db: Session, user_id: int) -> Graph:
    nodes = []
    edges = []
    
    # 1. Learner Node
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        nodes.append(Node(id=f"user_{user.id}", type="Learner", properties={"name": user.name}))
        
        # 2. Competency Nodes & Capability Edges
        caps = db.query(LearnerCapability).filter(LearnerCapability.user_id == user.id).all()
        for cap in caps:
            comp = db.query(Competency).filter(Competency.id == cap.competency_id).first()
            if comp:
                comp_node_id = f"comp_{comp.id}"
                if not any(n.id == comp_node_id for n in nodes):
                    nodes.append(Node(id=comp_node_id, type="Competency", properties={"name": comp.name}))
                
                edges.append(Edge(
                    source_id=f"user_{user.id}",
                    target_id=comp_node_id,
                    relationship="HAS_CAPABILITY",
                    properties={
                        "knowledge_score": cap.knowledge_score,
                        "procedural_score": cap.procedural_score,
                        "operational_score": cap.operational_score,
                        "confidence": cap.confidence
                    }
                ))
    
    # 3. Asset and Finding Nodes
    # In a real scenario we'd filter by organization/RBAC.
    assets = db.query(Asset).all()
    for asset in assets:
        asset_id = f"asset_{asset.id}"
        nodes.append(Node(
            id=asset_id, 
            type="Asset", 
            properties={
                "criticality": asset.criticality,
                "confidentiality_lifetime": asset.confidentiality_lifetime
            }
        ))
        
        findings = db.query(Finding).filter(Finding.asset_id == asset.id, Finding.status == 'OPEN').all()
        for finding in findings:
            finding_id = f"finding_{finding.id}"
            nodes.append(Node(
                id=finding_id,
                type="Finding",
                properties={
                    "severity": finding.severity,
                    "confidence": finding.confidence,
                    "migration_urgency": finding.migration_urgency,
                    "algorithm": finding.algorithm
                }
            ))
            
            edges.append(Edge(
                source_id=finding_id,
                target_id=asset_id,
                relationship="AFFECTS",
                properties={}
            ))
            
            # Simulated linkage: Which competencies does this finding require?
            # Ideally this uses the competency mapper. We'll simulate it linking to comp_1 for this projection.
            req_comp_id = "comp_1" # In a full system, dynamically map finding_type -> competency_id
            edges.append(Edge(
                source_id=finding_id,
                target_id=req_comp_id,
                relationship="REQUIRES",
                properties={"minimum_score": 0.8}
            ))
            
    return Graph(nodes=nodes, edges=edges)
