from sqlalchemy import or_
from sqlalchemy.orm import Session
from models import Asset, Finding, Competency, LearnerCapability, Intervention, QuizScore, User
from . import competency_map
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
    
        # 2b. Quiz-measured capability. The latest result per topic is the learner's current knowledge; a topic
        # that was never attempted gets no edge, so the optimizer can tell "unassessed" from "scored zero".
        latest = {}
        for qs in db.query(QuizScore).filter(QuizScore.user_id == user.id).order_by(QuizScore.created_at, QuizScore.id):
            latest[qs.topic] = qs
        for topic, comp in competency_map.COMPETENCIES.items():
            node_id = f"comp_{topic}"
            nodes.append(Node(id=node_id, type="Competency", properties={"name": comp.name, "topic": topic}))
            if topic in latest:
                edges.append(Edge(
                    source_id=f"user_{user.id}",
                    target_id=node_id,
                    relationship="HAS_CAPABILITY",
                    properties={"knowledge_score": latest[topic].score / 100.0}
                ))

    # 3. Asset and Finding Nodes
    # In a real scenario we'd filter by organization/RBAC.
    # Assets from the verified scans of another user are private; ownerless assets are shared records.
    assets = db.query(Asset).filter(or_(Asset.owner_user_id.is_(None), Asset.owner_user_id == user_id)).all()
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
                    "algorithm": finding.algorithm,
                    "finding_type": finding.finding_type,
                    "title": finding.title
                }
            ))
            
            edges.append(Edge(
                source_id=finding_id,
                target_id=asset_id,
                relationship="AFFECTS",
                properties={}
            ))
            
            # Only finding types with a defined competency (competency_map) get a REQUIRES edge; the rest are
            # covered by the score-based recommender rather than given an invented requirement.
            requirement = competency_map.requirement_for(finding.finding_type)
            if requirement and user:
                edges.append(Edge(
                    source_id=finding_id,
                    target_id=f"comp_{requirement.competency}",
                    relationship="REQUIRES",
                    properties={"minimum_score": requirement.minimum_score, "rationale": requirement.rationale}
                ))

    return Graph(nodes=nodes, edges=edges)
