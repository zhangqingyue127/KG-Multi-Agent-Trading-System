// Example queries

// 1. 查询每个资产的风险档案和仓位上限
MATCH (a:Asset)-[:HAS_RISK_PROFILE]->(r:RiskProfile)
RETURN a.symbol, r.name, r.max_position, r.vol_limit, r.max_drawdown_limit;

// 2. 查询高波动状态下 RiskAgent 的信任权重
MATCH (a:Asset)-[w:ASSIGNS_TRUST_WEIGHT]->(agent:Agent {name:'RiskAgent'})
WHERE w.vol_state = 'HighVolatility'
RETURN a.symbol, w.date, w.weight
ORDER BY w.weight DESC;

// 3. 查询被 Risk Veto 降仓的决策
MATCH (d:Decision)-[:TARGETS_ASSET]->(a:Asset)
WHERE d.veto_applied = 'True'
RETURN a.symbol, d.date, d.raw_position, d.final_position, d.veto_reason
ORDER BY d.date DESC;
