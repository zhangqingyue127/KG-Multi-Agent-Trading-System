# V5 Agent历史匹配知识图谱

本版本直接读取真实多 Agent 输出文件，而不是使用网页静态样例或模拟回测样本。

## 是否实时

当前生成方式是离线批处理，不是网页实时抓取。它从 `deepseek_agent_system/outputs` 中读取已保存的 Agent 历史结果，并转换为知识图谱三元组。

## 匹配的数据量

- 资产数量：7
- daily 行数：1325
- trades 行数：52
- memory 行数：70
- weights 行数：70
- ablation 行数：35
- 三元组数量：12726

## 闭环

```text
MarketSnapshot / RiskStyle / MarketRegime
        ↓
AgentWeight / AgentTrust
        ↓
Decision / Trade
        ↓
DailyBacktest / AblationResult
        ↓
Memory / Reflection
        ↓
下一轮 Trust Update
```
