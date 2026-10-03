from .schema import Graph
import json

def snapshot_graph(graph: Graph) -> str:
    """
    Serializes the graph state into a JSON snapshot for reproducibility and ablation studies.
    """
    return graph.json()
    
def load_snapshot(snapshot_json: str) -> Graph:
    """
    Deserializes a graph snapshot.
    """
    return Graph.parse_raw(snapshot_json)
