# V3 完整版市场状态与资产风险知识图谱

本版本用于提升数据量和完整度，保留原始样例不动，新增完整日频图谱数据。

## 数据规模

- 资产数量：20
- 时间范围：2022-01-01 至 2026-06-06
- 行情优先来源：Yahoo Finance，失败时使用 SyntheticFallback
- 日频技术指标行数：21013
- 日频状态行数：21013
- 日频信任权重行数：84052
- 日频决策行数：21013
- 知识图谱三元组数：513032

## 相比前一版的增强

1. 资产池从 5 个扩展到 20 个，覆盖宽基 ETF、债券、黄金、科技、半导体、金融、能源、医疗、消费等。
2. 指标和决策从抽样点扩展为每日数据。
3. 新增趋势、波动、动量三类市场状态。
4. 新增行业、资产类型、投资风格、风险预算等资产画像字段。
5. 每日生成 Agent 信任权重、仓位决策、Risk Veto 和结构化证据节点。
6. 三元组改为资产-日期级动态知识图谱，更适合 Neo4j 展示和报告说明。

## 主要文件

- `v3_01_raw_market_data.csv`
- `v3_02_assets_and_risk_profiles.csv`
- `v3_03_daily_technical_indicators.csv`
- `v3_04_daily_market_states.csv`
- `v3_05_daily_agent_trust_weights.csv`
- `v3_06_daily_decision_and_risk_veto.csv`
- `v3_07_kg_triples_full.csv`
- `v3_08_schema_design.csv`
- `v3_09_neo4j_import_and_queries.cypher`
