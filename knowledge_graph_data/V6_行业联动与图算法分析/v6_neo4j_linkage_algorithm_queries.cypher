// V6 行业联动与图算法 Cypher 查询示例

// 1. 查询同行业联动关系
MATCH (a:KGEntity)-[r:KG_REL {predicate:'SAME_INDUSTRY_AS'}]->(b:KGEntity)
RETURN a.id, r.predicate, b.id;

// 2. 查询 ETF 对成分股的影响路径
MATCH (etf:KGEntity)-[r:KG_REL {predicate:'CONTAINS'}]->(stock:KGEntity)
RETURN etf.id, stock.id, r.confidence
ORDER BY r.confidence DESC;

// 3. 查询 PageRank 最高的风险枢纽资产
MATCH (a:KGEntity)-[:KG_REL {predicate:'HAS_PAGERANK_SCORE'}]->(score:KGEntity)
RETURN a.id, score.id
ORDER BY score.id DESC
LIMIT 10;

// 4. 查询社区聚类结果
MATCH (a:KGEntity)-[:KG_REL {predicate:'BELONGS_TO_COMMUNITY'}]->(c:KGEntity)
RETURN c.id AS community, collect(a.id) AS assets;

// 5. 查询风险传播路径
MATCH (src:KGEntity)-[:KG_REL {predicate:'HAS_RISK_PROPAGATION_PATH_TO'}]->(dst:KGEntity)
RETURN src.id, dst.id;
