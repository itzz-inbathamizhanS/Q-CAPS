from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class Node(BaseModel):
    id: str
    type: str # 'Asset', 'Algorithm', 'Finding', 'Competency', 'Learner', 'Intervention'
    properties: Dict[str, Any]

class Edge(BaseModel):
    source_id: str
    target_id: str
    relationship: str # 'AFFECTS', 'REQUIRES', 'HAS_CAPABILITY', 'MITIGATES'
    properties: Dict[str, Any]

class Graph(BaseModel):
    nodes: List[Node]
    edges: List[Edge]
