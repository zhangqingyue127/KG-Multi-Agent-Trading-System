import React, { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import api from '../api';
import '../AgentPage.css';

const TICKERS = ['SPY', 'AAPL', 'MSFT', 'NVDA', 'TSLA'];

const STEPS = [
  { id: 'overview', index: '01', title: '框架总览', short: '系统结果' },
  { id: 'regime', index: '02', title: '市场与子Agent', short: '行情判断' },
  { id: 'trust', index: '03', title: '辩论与信任', short: '动态权重' },
  { id: 'decision', index: '04', title: '决策与风控', short: '仓位控制' },
  { id: 'backtest', index: '05', title: '回测结果', short: '收益表现' },
  { id: 'memory', index: '06', title: '记忆反思', short: '学习记录' }
];

function AgentPage({ activeStep: controlledStep, onStepChange, showStepRail = true }) {
  const [ticker, setTicker] = useState('SPY');
  const [internalStep, setInternalStep] = useState('overview');
  const [agentData, setAgentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const activeStep = controlledStep || internalStep;

  const changeStep = (stepId) => {
    setInternalStep(stepId);
    if (onStepChange) {
      onStepChange(stepId);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    api.getAgentResults(ticker)
      .then((data) => {
        if (!active) return;
        setAgentData(normalizeAgentData(data));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message || 'Failed to load agent results');
        setAgentData(null);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [ticker]);

  const latestTrade = useMemo(() => {
    const trades = agentData?.trades || [];
    return trades.length ? trades[trades.length - 1] : null;
  }, [agentData]);

  const latestMemory = useMemo(() => {
    const memory = agentData?.memory || [];
    return memory.length ? memory[memory.length - 1] : null;
  }, [agentData]);

  const latestWeights = useMemo(() => {
    const weights = agentData?.weights || [];
    return weights.length ? weights[weights.length - 1] : null;
  }, [agentData]);

  return (
    <div className="agent-page">
      <div className="agent-shell">
        <section className="agent-hero">
          <div className="agent-hero-copy">
            <span className="agent-kicker">DeepSeek 多Agent</span>
            <h1 className="agent-title">Agent优先交易框架</h1>
            <p className="agent-subtitle">
              按流程展示资产风险档案、市场状态识别、多Agent分析、辩论裁判、信任权重、最终决策、风险否决、回测、记忆反思和消融实验。
            </p>
          </div>

          <div className="agent-controls" aria-label="股票选择">
            {TICKERS.map((item) => (
              <button
                key={item}
                className={`agent-ticker-btn ${ticker === item ? 'active' : ''}`}
                onClick={() => setTicker(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {loading && (
          <div className="agent-surface agent-loading">
            <div className="spinner"></div>
            <p>正在加载 DeepSeek Agent 结果...</p>
          </div>
        )}

        {!loading && error && (
          <div className="agent-surface agent-error">
            <h2>Agent 结果暂不可用</h2>
            <p>{error}</p>
          </div>
        )}

        {!loading && agentData && (
          <div className={`agent-workspace ${showStepRail ? '' : 'without-step-rail'}`}>
            {showStepRail && (
              <aside className="agent-step-rail" aria-label="Agent framework steps">
                {STEPS.map((step) => (
                  <button
                    key={step.id}
                    className={`agent-step-btn ${activeStep === step.id ? 'active' : ''}`}
                    onClick={() => changeStep(step.id)}
                  >
                    <span>{step.index}</span>
                    <strong>{step.title}</strong>
                    <small>{step.short}</small>
                  </button>
                ))}
              </aside>
            )}

            <main className="agent-step-content">
              {renderStep(activeStep, {
                ticker,
                agentData,
                latestTrade,
                latestMemory,
                latestWeights
              })}
            </main>
          </div>
        )}
      </div>
    </div>
  );
}

function renderStep(stepId, context) {
  const { ticker, agentData, latestTrade, latestMemory, latestWeights } = context;
  const metrics = agentData.summary.metrics || {};
  const agentMetrics = metrics.agent_trust_strategy || {};
  const benchmarkMetrics = metrics.buy_and_hold || {};
  const assetProfile = agentData.summary.asset_profile || {};
  const interpretation = agentData.summary.interpretation || {};

  if (stepId === 'regime') {
    return (
      <StepFrame
        eyebrow="步骤 02"
        title="市场状态与分析型子Agent"
        why="单一模型容易只看到一个角度，所以系统先判断市场环境，再让多个子Agent分别从技术面、上涨理由、下跌风险和风控角度分析。"
        logic="市场状态Agent判断当前环境；Technical看指标；Bull寻找上涨证据；Bear寻找下跌证据；Risk估计风险和仓位限制。"
        effect="最新的记忆记录保存了这些中间结果，后面的决策Agent会基于它们继续计算。"
      >
        <section className="agent-detail-grid secondary">
          <article className="agent-surface">
            <SurfaceHeader title="最新Agent快照" subtitle="市场状态识别和子Agent分析后的结构化结果。" />
            <div className="agent-insight-list">
              <InsightLine label="市场状态" value={translateValue(latestMemory?.market_regime)} />
              <InsightLine label="技术信号" value={translateValue(latestMemory?.technical_signal)} />
              <InsightLine label="Bull评分" value={fmtNum(latestMemory?.bull_score)} />
              <InsightLine label="Bear评分" value={fmtNum(latestMemory?.bear_score)} />
              <InsightLine label="风险评分" value={fmtNum(latestMemory?.risk_score)} />
              <InsightLine label="综合建议" value={fmtNum(latestMemory?.recommendation_score)} />
            </div>
          </article>

          <article className="agent-surface">
            <SurfaceHeader title="资产风险档案" subtitle="不同资产使用不同的仓位和风控标准。" />
            <div className="agent-profile-grid">
              <MetricCard label="资产类型" value={translateValue(assetProfile.asset_class || 'adaptive')} detail={ticker} />
              <MetricCard label="风险风格" value={translateValue(assetProfile.risk_style || 'adaptive')} detail="由资产档案模块给出" />
              <MetricCard label="趋势最低仓位" value={fmtPct(assetProfile.trend_floor)} detail="强趋势下的最低仓位" />
              <MetricCard label="最高仓位" value={fmtPct(assetProfile.max_position)} detail="该资产允许的上限" />
            </div>
          </article>
        </section>
      </StepFrame>
    );
  }

  if (stepId === 'trust') {
    return (
      <StepFrame
        eyebrow="步骤 03"
        title="辩论裁判与信任权重"
        why="Bull和Bear可能给出相反观点，所以需要一个裁判把双方理由转成分数，再用信任权重决定谁的话更重要。"
        logic="权重由市场状态、近期预测正确率和资产风险档案共同决定。高波动资产会让Risk Agent拥有更高影响力。"
        effect="图表展示各Agent权重如何随时间变化，而不是一直固定。"
      >
        <section className="agent-detail-grid secondary">
          <article className="agent-surface">
            <SurfaceHeader title="信任权重变化" subtitle="每个Agent在决策中的动态影响力。" />
            <ResponsiveContainer width="100%" height={330}>
              <LineChart data={agentData.weights}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" minTickGap={18} />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={[0, 0.4]} />
                <Tooltip formatter={(value) => fmtPct(value)} />
                <Legend />
                <Line type="monotone" dataKey="weight_technical" name="技术Agent" stroke="#2563eb" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="weight_bull" name="Bull" stroke="#059669" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="weight_bear" name="Bear" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="weight_risk" name="风控Agent" stroke="#9333ea" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </article>

          <article className="agent-surface">
            <SurfaceHeader title="最新权重" subtitle="最近一次的信任分配。" />
            <div className="agent-profile-grid">
              <MetricCard label="技术Agent" value={fmtPct(latestWeights?.weight_technical)} detail="指标分析" />
              <MetricCard label="Bull Agent" value={fmtPct(latestWeights?.weight_bull)} detail="上涨观点" />
              <MetricCard label="Bear Agent" value={fmtPct(latestWeights?.weight_bear)} detail="下跌观点" />
              <MetricCard label="风控Agent" value={fmtPct(latestWeights?.weight_risk)} detail="风险约束" />
            </div>
          </article>
        </section>
      </StepFrame>
    );
  }

  if (stepId === 'decision') {
    return (
      <StepFrame
        eyebrow="步骤 04"
        title="决策Agent与风险否决"
        why="最终仓位不应该直接听某一个LLM回答，而是要综合结构化评分、信任权重和资产本身的风险限制。"
        logic="决策Agent先给出目标仓位；Risk Veto再检查置信度、极端风险、波动率和资产仓位上限。"
        effect="交易记录展示最终BUY/SELL/HOLD动作，以及仓位如何变化。"
      >
        <section className="agent-detail-grid">
          <article className="agent-surface">
            <SurfaceHeader title="最新最终决策" subtitle="经过信任加权和风险否决后的最终仓位。" />
            {latestTrade ? (
              <div className="agent-decision-card">
                <div className={`agent-action ${String(latestTrade.action).toLowerCase()}`}>{translateValue(latestTrade.action)}</div>
                <div className="agent-decision-position">{fmtPct(latestTrade.target_position)} 目标仓位</div>
                <p>{translateValue(latestTrade.reason)}</p>
                <dl>
                  <div><dt>日期</dt><dd>{latestTrade.date}</dd></div>
                  <div><dt>原仓位</dt><dd>{fmtPct(latestTrade.position_before)}</dd></div>
                  <div><dt>置信度</dt><dd>{fmtPct(latestTrade.confidence)}</dd></div>
                </dl>
              </div>
            ) : (
              <p className="agent-muted">暂无交易记录。</p>
            )}
          </article>

          <article className="agent-surface">
            <SurfaceHeader title="交易记录" subtitle="最近几次最终动作。" />
            <DataTable
              columns={['date', 'action', 'position_before', 'target_position', 'confidence']}
              rows={agentData.trades}
              formatters={{ action: translateValue, position_before: fmtPct, target_position: fmtPct, confidence: fmtPct }}
            />
          </article>
        </section>
      </StepFrame>
    );
  }

  if (stepId === 'backtest') {
    return (
      <StepFrame
        eyebrow="步骤 05"
        title="回测与表现对比"
        why="交易Agent不能只看推理是否合理，最终还是要看组合表现。"
        logic="回测把每次最终目标仓位应用到下一期收益，并和买入持有策略对比净值曲线。"
        effect="这些指标能看出系统有没有改善收益、回撤、波动和风险收益比。"
      >
        <section className="agent-metric-grid compact">
          <MetricCard label="Agent收益" value={fmtPct(agentMetrics.total_return)} detail={`夏普 ${fmtNum(agentMetrics.sharpe)}`} />
          <MetricCard label="买入持有" value={fmtPct(benchmarkMetrics.total_return)} detail={`夏普 ${fmtNum(benchmarkMetrics.sharpe)}`} />
          <MetricCard label="最大回撤" value={fmtPct(agentMetrics.max_drawdown)} detail={`基准 ${fmtPct(benchmarkMetrics.max_drawdown)}`} />
          <MetricCard label="平均仓位" value={fmtPct(agentMetrics.average_position)} detail={`${agentData.summary.trade_count || 0} 次交易`} />
        </section>

        <section className="agent-detail-grid">
          <article className="agent-surface agent-primary-chart">
            <SurfaceHeader title={`${ticker} 净值曲线`} subtitle="Agent Trust策略与买入持有策略对比。" />
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={agentData.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" minTickGap={32} />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" domain={['dataMin * 0.98', 'dataMax * 1.02']} />
                <Tooltip formatter={(value) => Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 })} />
                <Legend />
                <Line type="monotone" dataKey="agent_value" name="Agent策略" stroke="#2563eb" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="buy_hold_value" name="买入持有" stroke="#059669" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </article>

          <article className="agent-surface">
            <SurfaceHeader title="结果解读" subtitle="根据回测结果自动生成的总结。" />
            <div className="agent-insight-list">
              <InsightLine label="主要发现" value={translateValue(interpretation.main_finding)} />
              <InsightLine label="优势" value={translateValue(interpretation.strength)} />
              <InsightLine label="局限" value={translateValue(interpretation.limitation)} />
            </div>
          </article>
        </section>
      </StepFrame>
    );
  }

  if (stepId === 'memory') {
    return (
      <StepFrame
        eyebrow="步骤 06"
        title="记忆、反思与消融实验"
        why="系统需要记住每次决策后的真实结果，再用反馈更新信任权重，而不是每次都从零开始。"
        logic="Memory记录下一期收益、预测是否正确、风险否决状态和反思；Ablation逐个移除模块，测试每个模块的贡献。"
        effect="这样既能展示学习记录，也能说明为什么每个架构模块有必要存在。"
      >
        <section className="agent-detail-grid secondary">
          <article className="agent-surface">
            <SurfaceHeader title="记忆与反思" subtitle="最近几条学习记录。" />
            <DataTable
              columns={['date', 'market_regime', 'technical_signal', 'target_position', 'correct_or_not']}
              rows={agentData.memory}
              formatters={{ market_regime: translateValue, technical_signal: translateValue, target_position: fmtPct, correct_or_not: translateValue }}
            />
          </article>

          <article className="agent-surface">
            <SurfaceHeader title="消融实验" subtitle="对比不同模块组合对收益的影响。" />
            <ResponsiveContainer width="100%" height={330}>
              <BarChart data={agentData.ablation} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} stroke="#64748b" />
                <YAxis type="category" dataKey="label" width={120} tick={{ fontSize: 11 }} stroke="#64748b" />
                <Tooltip formatter={(value) => fmtPct(value)} />
                <Bar dataKey="total_return" name="总收益" fill="#2563eb" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </article>
        </section>
      </StepFrame>
    );
  }

  return (
    <StepFrame
      eyebrow="步骤 01"
      title="框架总览"
      why="目标不是做一个纯RL黑箱策略，而是做一个能解释、能回测、能逐步展示的多Agent交易框架。"
      logic="数据依次经过市场状态识别、分析型子Agent、辩论裁判、信任权重、决策Agent、风险否决、回测、记忆和信任更新。"
      effect="最终页面不仅展示收益结果，还展示每次决策背后的推理链条。"
    >
      <section className="agent-flow-strip">
        {['市场数据', '市场状态', '子Agent', '辩论裁判', '信任权重', '最终决策', '风险否决', '回测', '记忆反思'].map((item, index) => (
          <div className="agent-flow-node" key={item}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </section>

      <section className="agent-metric-grid">
        <MetricCard label="Agent收益" value={fmtPct(agentMetrics.total_return)} detail={`夏普 ${fmtNum(agentMetrics.sharpe)}`} />
        <MetricCard label="买入持有" value={fmtPct(benchmarkMetrics.total_return)} detail={`夏普 ${fmtNum(benchmarkMetrics.sharpe)}`} />
        <MetricCard label="最大回撤" value={fmtPct(agentMetrics.max_drawdown)} detail={`基准 ${fmtPct(benchmarkMetrics.max_drawdown)}`} />
        <MetricCard label="平均仓位" value={fmtPct(agentMetrics.average_position)} detail={`${agentData.summary.trade_count || 0} 次交易`} />
        <MetricCard label="资产档案" value={translateValue(assetProfile.risk_style || 'adaptive')} detail={translateValue(assetProfile.asset_class || '资产自适应规则')} />
      </section>
    </StepFrame>
  );
}

function StepFrame({ eyebrow, title, why, logic, effect, children }) {
  return (
    <>
      <section className="agent-step-hero agent-surface">
        <span>{eyebrow}</span>
        <h2>{title}</h2>
        <div className="agent-explain-grid">
          <InsightBlock label="为什么" text={why} />
          <InsightBlock label="怎么做" text={logic} />
          <InsightBlock label="效果" text={effect} />
        </div>
      </section>
      {children}
    </>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <article className="agent-metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function SurfaceHeader({ title, subtitle }) {
  return (
    <div className="agent-surface-header">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function InsightBlock({ label, text }) {
  return (
    <div className="agent-insight-block">
      <span>{label}</span>
      <p>{text || '暂无解读。'}</p>
    </div>
  );
}

function InsightLine({ label, value }) {
  return (
    <div className="agent-insight-item">
      <span className="agent-insight-label">{label}</span>
      <strong>{value || '暂无'}</strong>
    </div>
  );
}

function DataTable({ columns, rows, formatters = {} }) {
  const visibleRows = rows.slice(-8).reverse();
  return (
    <div className="agent-table-wrap">
      <table className="agent-table">
        <thead>
          <tr>{columns.map((column) => <th key={column}>{columnLabel(column)}</th>)}</tr>
        </thead>
        <tbody>
          {visibleRows.map((row, index) => (
            <tr key={`${row.date}-${index}`}>
              {columns.map((column) => (
                <td key={column}>{formatters[column] ? formatters[column](row[column]) : String(row[column] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeAgentData(data) {
  return {
    ...data,
    daily: (data.daily || []).map(numberizeRow),
    trades: (data.trades || []).map(numberizeRow),
    memory: (data.memory || []).map(numberizeRow),
    weights: (data.weights || []).map(numberizeRow),
    ablation: (data.ablation || []).map((row) => ({
      ...numberizeRow(row),
      label: ablationLabel(row.variant)
    }))
  };
}

function numberizeRow(row) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => {
      const numeric = Number(value);
      if (value !== '' && value !== null && !Number.isNaN(numeric)) {
        return [key, numeric];
      }
      return [key, value];
    })
  );
}

function ablationLabel(value) {
  const labels = {
    single_agent_baseline: '单Agent',
    multi_agent_without_debate: '多Agent',
    multi_agent_with_debate: '加入辩论',
    debate_plus_trust: '加入信任',
    debate_plus_trust_plus_risk_veto: '加入风控否决'
  };
  return labels[value] || value;
}

function columnLabel(column) {
  const labels = {
    date: '日期',
    action: '动作',
    position_before: '原仓位',
    target_position: '目标仓位',
    confidence: '置信度',
    market_regime: '市场状态',
    technical_signal: '技术信号',
    correct_or_not: '是否正确'
  };
  return labels[column] || column.replaceAll('_', ' ');
}

function translateValue(value) {
  if (value === null || value === undefined || value === '') return value;
  const key = String(value);
  const labels = {
    adaptive: '自适应',
    'ETF benchmark': 'ETF基准',
    ETF: 'ETF',
    low_volatility: '低波动',
    medium_volatility: '中等波动',
    high_volatility: '高波动',
    very_high_volatility: '极高波动',
    'mega-cap stock': '大型科技股',
    'high-growth stock': '高成长股',
    'high-volatility growth stock': '高波动成长股',
    bullish: '上涨',
    bearish: '下跌',
    sideways: '震荡',
    neutral: '中性',
    buy: '买入',
    BUY: '买入',
    sell: '卖出',
    SELL: '卖出',
    hold: '持有',
    HOLD: '持有',
    true: '正确',
    false: '错误',
    True: '正确',
    False: '错误'
  };
  return labels[key] || key.replaceAll('_', ' ');
}

function fmtPct(value) {
  const number = Number(value || 0);
  return `${(number * 100).toFixed(2)}%`;
}

function fmtNum(value) {
  return Number(value || 0).toFixed(2);
}

export default AgentPage;
