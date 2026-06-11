# V4 闭环增强知识图谱

## 定位

该知识图谱既是 Agent 的输入，也是 Agent 的输出记忆层。

- 作为输入：Agent 查询 Asset、RiskProfile、MarketSnapshot、FinancialEvent、历史 Outcome。
- 作为输出：Agent 将 Decision、Trade、BacktestResult、Memory、Reflection、TrustUpdate 写回图谱。

## 新增三层

1. 金融事件层：Event、EventType、Sentiment。
2. 回测结果层：Trade、BacktestResult、Outcome、Return5D。
3. Memory & Reflection 层：Memory、Reflection、Pattern、TrustUpdateRule。

## 闭环路径

```text
Asset / RiskProfile / Event / MarketSnapshot
        ↓
Technical / Bull / Bear / Risk Agent
        ↓
Decision
        ↓
RiskVeto
        ↓
Trade / BacktestResult
        ↓
Memory / Reflection
        ↓
TrustUpdateRule
        ↓
下一轮 Agent 权重调整
```

## 数据规模

- 金融事件：9 条
- 回测样本：143 条
- 记忆反思：143 条
- 闭环增强三元组：514221 条
