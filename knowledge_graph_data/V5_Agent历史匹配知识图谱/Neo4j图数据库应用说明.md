# Neo4j 图数据库应用说明

为体现知识图谱应用，本项目将真实 Agent 历史结果转换为节点和边，并提供 Neo4j 导入脚本与 Cypher 查询示例。

## 文件

- `neo4j_nodes.csv`：Neo4j 节点文件，共 6227 个节点。
- `neo4j_edges.csv`：Neo4j 边文件，共 12726 条边。
- `neo4j_import_generic.cypher`：通用导入脚本。
- `neo4j_demo_queries.cypher`：演示查询脚本。

## 为什么使用 Neo4j

CSV 适合保存原始表格数据，但不适合多跳关系查询。Neo4j 图数据库可以直接表达 Asset、MarketSnapshot、AgentWeight、Decision、Trade、Memory、Reflection 之间的路径关系，适合回答：

1. 某资产有哪些 Agent 历史关系？
2. 某次交易决策执行了什么动作？
3. 哪些决策被 Risk Veto 否决？
4. 错误预测对应了哪些反思记录？
5. 某个 MarketSnapshot 下各 Agent 权重是多少？
6. 消融实验中不同策略表现如何？
7. 如何从 Decision 追溯到 Memory 与 Reflection？

## 论文表述建议

本文将多 Agent 交易系统的历史输出转换为知识图谱三元组，并进一步导入 Neo4j 图数据库。相比普通 CSV 表格，Neo4j 能够支持路径查询和关系推理，例如从资产节点追溯到市场状态、Agent 权重、交易决策、回测结果和记忆反思，从而体现知识图谱在可解释交易决策和系统复盘中的应用价值。
