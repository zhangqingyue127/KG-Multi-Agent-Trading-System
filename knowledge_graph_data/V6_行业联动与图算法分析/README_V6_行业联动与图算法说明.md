# V6 行业联动与图算法分析

本版本在 V5 真实 Agent 历史匹配知识图谱基础上，新增行业联动关系和图算法分析。

## 新增关系

- SAME_INDUSTRY_AS：同行业关系，例如 NVDA 与 AMD。
- SUPPLY_CHAIN_RELATED_TO：供应链/生态关联，例如 AAPL 与 NVDA。
- CONTAINS：ETF 成分股关系，例如 QQQ 包含 AAPL、MSFT、NVDA。
- TRACKS_SIMILAR_INDEX_AS：ETF 指数相似关系，例如 VOO 与 SPY。

## 图算法

- PageRank：识别关键资产和风险枢纽。
- Degree centrality：识别连接度高的资产。
- Community detection：按规则形成 ETF_Core、MegaCap_Tech、AI_Semiconductor、HighBeta_Growth。
- Shortest path：识别风险传播路径，例如 NVDA -> SPY。

## 数据规模

- 行业联动边：19
- 中心性结果：9
- 社区归属记录：11
- 风险传播路径：4
- 增强后三元组：12809

## 论文可写结论

通过图算法可以识别半导体板块中的风险中心节点，并分析其对 ETF 和相关股票的传导影响。例如 NVDA 同时连接 AI 半导体社区、科技成长 ETF QQQ 和宽基 ETF SPY，因此在 PageRank 和中心性指标上更容易成为风险枢纽节点。
