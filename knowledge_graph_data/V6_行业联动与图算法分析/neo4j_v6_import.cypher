// V6 Neo4j 导入脚本：包含行业联动与图算法结果

CREATE CONSTRAINT kg_entity_id IF NOT EXISTS
FOR (n:KGEntity) REQUIRE n.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///neo4j_v6_nodes.csv' AS row
MERGE (n:KGEntity {id: row.id})
SET n.name = row.name,
    n.entity_type = row.label;

LOAD CSV WITH HEADERS FROM 'file:///neo4j_v6_edges.csv' AS row
MATCH (s:KGEntity {id: row.source})
MATCH (o:KGEntity {id: row.target})
MERGE (s)-[r:KG_REL {edge_id: row.edge_id}]->(o)
SET r.predicate = row.predicate,
    r.date = row.date,
    r.source_system = row.source_system,
    r.confidence = toFloat(row.confidence);
