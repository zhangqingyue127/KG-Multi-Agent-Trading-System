// V2 enhanced graph query examples

// 1. 查询某资产某日决策的完整上下文：市场快照 -> 状态 -> 决策 -> 证据
MATCH (snapshot {subject:'MarketSnapshot:TSLA_2025-05-12'})
RETURN snapshot;

// 如果以 Neo4j 实体导入三元组，可使用类似关系：
// (:MarketSnapshot)-[:HAS_TREND_STATE]->(:MarketState)
// (:MarketSnapshot)-[:GENERATES_DECISION]->(:Decision)
// (:Decision)-[:SUPPORTED_BY_EVIDENCE]->(:Evidence)

// 2. 查询 Agent 团队分工
MATCH (a:Agent)-[:BELONGS_TO_TEAM]->(team:AgentTeam),
      (a)-[:HAS_ROLE]->(role:AgentRole)
RETURN team.name, a.name, role.name
ORDER BY team.name;

// 3. 查询每次 Agent 竞赛中被选中的最高权重 Agent
MATCH (contest:AgentContest)-[:SELECTS_TOP_AGENT]->(agent:Agent)
RETURN contest.id, agent.name;

// 4. 查询被 Risk Veto 影响的决策及触发原因
MATCH (d:Decision)-[:TRIGGERED_RISK_REASON]->(reason:RiskReason)
RETURN d.id, reason.name;
