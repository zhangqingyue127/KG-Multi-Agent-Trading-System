// V5 Agent历史匹配知识图谱 Cypher 查询示例

// 1. 查看图谱规模
MATCH (n) WITH count(n) AS node_count
MATCH ()-[r]->() RETURN node_count, count(r) AS edge_count;

// 2. 查看某资产的完整 Agent 历史关系
MATCH (a:KGEntity {id:'Asset:SPY'})-[r:KG_REL]->(o:KGEntity)
RETURN a.id AS subject, r.predicate AS predicate, o.id AS object
LIMIT 50;

// 3. 查询某资产的交易决策和交易动作
MATCH (d:KGEntity)-[r:KG_REL {predicate:'EXECUTES'}]->(t:KGEntity)
WHERE d.id STARTS WITH 'Decision:SPY'
MATCH (t)-[r2:KG_REL {predicate:'HAS_ACTION'}]->(action:KGEntity)
RETURN d.id AS decision, t.id AS trade, action.id AS action, r.date AS date
ORDER BY date
LIMIT 30;

// 4. 查询 Risk Veto 否决过哪些决策
MATCH (v:KGEntity {id:'Agent:RiskVeto'})-[r:KG_REL {predicate:'VETOES'}]->(d:KGEntity)
RETURN d.id AS vetoed_decision, r.date AS date, r.source_system AS source
ORDER BY date DESC;

// 5. 查询错误预测对应的反思记录
MATCH (m:KGEntity)-[:KG_REL {predicate:'HAS_OUTCOME'}]->(o:KGEntity {id:'Outcome:WrongPrediction'})
MATCH (m)-[:KG_REL {predicate:'GENERATES_REFLECTION'}]->(ref:KGEntity)
MATCH (ref)-[:KG_REL {predicate:'HAS_SUMMARY'}]->(summary:KGEntity)
RETURN m.id AS memory, ref.id AS reflection, summary.id AS summary
LIMIT 20;

// 6. 查询某个 MarketSnapshot 下各 Agent 的权重
MATCH (s:KGEntity)-[:KG_REL {predicate:'ASSIGNS_TRUST_WEIGHT'}]->(w:KGEntity)
WHERE s.id STARTS WITH 'MarketSnapshot:NVDA'
MATCH (w)-[:KG_REL {predicate:'WEIGHT_OF_AGENT'}]->(agent:KGEntity)
MATCH (w)-[:KG_REL {predicate:'HAS_WEIGHT_VALUE'}]->(value:KGEntity)
RETURN s.id AS snapshot, agent.id AS agent, value.id AS weight
LIMIT 40;

// 7. 查询消融实验结果
MATCH (a:KGEntity)-[:KG_REL {predicate:'HAS_ABLATION_RESULT'}]->(result:KGEntity)
MATCH (result)-[:KG_REL {predicate:'HAS_TOTAL_RETURN'}]->(ret:KGEntity)
MATCH (result)-[:KG_REL {predicate:'HAS_SHARPE'}]->(sharpe:KGEntity)
RETURN a.id AS asset, result.id AS variant, ret.id AS total_return, sharpe.id AS sharpe
ORDER BY asset, variant;

// 8. 从决策追溯到记忆反思的闭环路径
MATCH path = (d:KGEntity)-[:KG_REL {predicate:'WRITES_TO_MEMORY'}]->(m:KGEntity)-[:KG_REL {predicate:'GENERATES_REFLECTION'}]->(ref:KGEntity)
WHERE d.id STARTS WITH 'Decision:TSLA'
RETURN path
LIMIT 20;
