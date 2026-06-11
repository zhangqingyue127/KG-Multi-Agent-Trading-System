// Neo4j 导入脚本：通用三元组模型
// 使用方式：
// 1. 将 neo4j_nodes.csv 和 neo4j_edges.csv 放入 Neo4j import 目录
// 2. 在 Neo4j Browser 中执行本脚本

CREATE CONSTRAINT kg_entity_id IF NOT EXISTS
FOR (n:KGEntity) REQUIRE n.id IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///neo4j_nodes.csv' AS row
MERGE (n:KGEntity {id: row.id})
SET n.name = row.name,
    n.entity_type = row.label;

LOAD CSV WITH HEADERS FROM 'file:///neo4j_edges.csv' AS row
MATCH (s:KGEntity {id: row.source})
MATCH (o:KGEntity {id: row.target})
MERGE (s)-[r:KG_REL {edge_id: row.edge_id}]->(o)
SET r.predicate = row.predicate,
    r.date = row.date,
    r.source_system = row.source_system,
    r.confidence = toFloat(row.confidence);

CREATE INDEX kg_entity_type IF NOT EXISTS
FOR (n:KGEntity) ON (n.entity_type);

CREATE INDEX kg_rel_predicate IF NOT EXISTS
FOR ()-[r:KG_REL]-() ON (r.predicate);
