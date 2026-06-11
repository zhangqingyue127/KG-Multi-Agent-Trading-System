// V3 full graph import idea
// Recommended: import v3_07_kg_triples_full.csv as generic triple edges first.
// For a polished Neo4j model, split subject/object prefixes before import.

LOAD CSV WITH HEADERS FROM 'file:///v3_07_kg_triples_full.csv' AS row
MERGE (s:KGEntity {id: row.subject})
MERGE (o:KGEntity {id: row.object})
MERGE (s)-[r:KG_REL {predicate: row.predicate, date: row.date, source: row.source}]->(o)
SET r.confidence = toFloat(row.confidence);

// Query: latest high-volatility decisions with risk veto
MATCH (veto:KGEntity {id:'Agent:RiskVeto'})-[r:KG_REL {predicate:'VETOES'}]->(d:KGEntity)
RETURN d.id, r.date, r.source
ORDER BY r.date DESC
LIMIT 20;
