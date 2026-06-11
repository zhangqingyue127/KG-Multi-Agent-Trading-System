# 市场状态与资产风险知识图谱闭环样例

本目录是一套已跑通的简化闭环流程，面向“先分析、再辩论、再决策、再复盘”的多 Agent 量化交易框架中的市场状态、资产风险档案、信任权重和 Risk Veto 模块。

## 数据范围

- 资产：SPY, AAPL, MSFT, NVDA, TSLA
- 时间：2024-01-01 至 2025-06-06
- 数据来源：优先 Stooq 日线数据，若网络不可用则自动使用 SyntheticFallback 合成行情。

## 闭环流程

1. 读取行情数据：生成 `01_raw_market_data.csv`
2. 配置资产风险档案：生成 `02_asset_risk_profiles.csv`
3. 计算技术指标：MA20、MA60、20日收益率、20日波动率、60日最大回撤、RSI、MACD
4. 识别市场状态：Uptrend、Sideways、Downtrend，以及 Low/Medium/HighVolatility
5. 根据信号和状态分配 Agent 信任权重
6. Decision Agent 生成原始目标仓位
7. Risk Veto 根据资产风险档案进行硬风控
8. 输出知识图谱三元组和 Neo4j 导入脚本

## 文件说明

- `01_raw_market_data.csv`：原始行情数据
- `02_asset_risk_profiles.csv`：资产风险档案
- `03_technical_indicators.csv`：技术指标样本
- `04_market_states.csv`：市场状态识别结果
- `05_agent_trust_weights.csv`：Agent 信任权重
- `06_decision_and_risk_veto.csv`：仓位决策与 Risk Veto 结果
- `07_kg_triples.csv`：知识图谱三元组
- `08_neo4j_import.cypher`：Neo4j 导入脚本
- `09_query_examples.cypher`：图数据库查询样例

## 适合作业展示的核心图谱关系

```text
Asset - HAS_RISK_PROFILE -> RiskProfile
Asset - IN_MARKET_STATE -> MarketState
Asset - IN_VOLATILITY_STATE -> MarketState
Asset - ASSIGNS_TRUST_WEIGHT -> Agent
Decision - TARGETS_ASSET -> Asset
RiskVeto - VETOES -> Decision
```

## 可写进报告的结论

该知识图谱把量化交易中的行情事实、技术状态、资产风险规则和多 Agent 信任权重连接起来，使 Decision Agent 与 Risk Veto 不再只依赖临时计算结果，而是可以通过图谱查询获得资产风险画像、市场状态和历史信任配置，从而形成一个可解释、可追踪、可扩展的交易决策闭环。
