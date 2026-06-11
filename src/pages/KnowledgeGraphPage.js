import { useEffect, useMemo, useState } from 'react';
import api from '../api';
import './KnowledgeGraphPage.css';

const graphStats = [
  { label: '资产', value: '20', detail: '股票、ETF、债券、黄金' },
  { label: '日频快照', value: '21,013', detail: '资产-日期级市场状态' },
  { label: '信任权重', value: '84,052', detail: '4类Agent每日权重' },
  { label: 'Agent匹配三元组', value: '12,726', detail: '来自真实Agent历史输出' }
];

const industries = {
  '全部行业': ['SPY', 'QQQ', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMD', 'JPM', 'GLD', 'KO'],
  '宽基ETF': ['SPY', 'QQQ'],
  '科技巨头': ['AAPL', 'MSFT'],
  '半导体AI': ['NVDA', 'AMD'],
  '高波动成长': ['TSLA', 'AMD', 'NVDA'],
  '金融与防御': ['JPM', 'KO', 'GLD']
};

const assetProfiles = {
  SPY: { name: 'SPDR S&P 500 ETF', industry: '宽基ETF', risk: '低', position: 0.42, veto: 0.22, state: 'Sideways', vol: 'LowVolatility', style: 'Index ETF' },
  QQQ: { name: 'Invesco QQQ Trust', industry: '宽基ETF', risk: '中', position: 0.36, veto: 0.31, state: 'Uptrend', vol: 'MediumVolatility', style: 'Growth ETF' },
  AAPL: { name: 'Apple Inc.', industry: '科技巨头', risk: '中', position: 0.29, veto: 0.46, state: 'Sideways', vol: 'LowVolatility', style: 'Quality Growth' },
  MSFT: { name: 'Microsoft Corporation', industry: '科技巨头', risk: '中', position: 0.33, veto: 0.39, state: 'Uptrend', vol: 'LowVolatility', style: 'Quality Growth' },
  NVDA: { name: 'NVIDIA Corporation', industry: '半导体AI', risk: '高', position: 0.22, veto: 0.64, state: 'StrongUptrend', vol: 'HighVolatility', style: 'AI Growth' },
  TSLA: { name: 'Tesla Inc.', industry: '高波动成长', risk: '高', position: 0.18, veto: 0.68, state: 'StrongDowntrend', vol: 'HighVolatility', style: 'High Beta Growth' },
  AMD: { name: 'Advanced Micro Devices', industry: '半导体AI', risk: '高', position: 0.17, veto: 0.68, state: 'Downtrend', vol: 'HighVolatility', style: 'AI Growth' },
  JPM: { name: 'JPMorgan Chase', industry: '金融与防御', risk: '中', position: 0.32, veto: 0.33, state: 'Sideways', vol: 'MediumVolatility', style: 'Value' },
  GLD: { name: 'SPDR Gold Shares', industry: '金融与防御', risk: '中', position: 0.35, veto: 0.24, state: 'Uptrend', vol: 'LowVolatility', style: 'Gold Hedge' },
  KO: { name: 'Coca-Cola Company', industry: '金融与防御', risk: '低', position: 0.29, veto: 0.23, state: 'Sideways', vol: 'LowVolatility', style: 'Defensive' }
};

const tripleTemplates = {
  profile: [
    ['Asset:{symbol}', 'BELONGS_TO_INDUSTRY', 'Industry:{industry}'],
    ['Asset:{symbol}', 'HAS_INVESTMENT_STYLE', 'Style:{style}'],
    ['Asset:{symbol}', 'HAS_RISK_PROFILE', 'RiskProfile:{risk}RiskAsset'],
    ['RiskProfile:{risk}RiskAsset', 'HAS_RISK_RULE', 'RiskRule:MaxPosition']
  ],
  state: [
    ['MarketSnapshot:{symbol}_2025-05-12', 'SNAPSHOT_OF', 'Asset:{symbol}'],
    ['MarketSnapshot:{symbol}_2025-05-12', 'HAS_TREND_STATE', 'MarketState:{state}'],
    ['MarketSnapshot:{symbol}_2025-05-12', 'HAS_VOLATILITY_STATE', 'MarketState:{vol}'],
    ['MarketSnapshot:{symbol}_2025-05-12', 'GENERATES_DECISION', 'Decision:{symbol}_2025-05-12']
  ],
  agent: [
    ['MarketSnapshot:{symbol}_2025-05-12', 'ASSIGNS_TRUST_WEIGHT', 'AgentWeight:{symbol}_RiskAgent'],
    ['AgentWeight:{symbol}_RiskAgent', 'WEIGHT_OF_AGENT', 'Agent:RiskAgent'],
    ['Decision:{symbol}_2025-05-12', 'SUPPORTED_BY_EVIDENCE', 'Evidence:RiskScore'],
    ['Agent:RiskVeto', 'VETOES', 'Decision:{symbol}_2025-05-12']
  ]
};

const relationGroups = [
  { id: 'profile', label: '资产画像', desc: '行业、风格、资产类型、风险档案' },
  { id: 'state', label: '市场状态', desc: '趋势、波动、动量、日期快照' },
  { id: 'agent', label: 'Agent决策', desc: '信任权重、证据、仓位、风控否决' }
];

const nodeColumns = [
  { title: '输入事实层', nodes: ['Asset', 'PriceData', 'TechnicalIndicator', 'RiskProfile'] },
  { title: '状态认知层', nodes: ['MarketSnapshot', 'TrendState', 'VolatilityState', 'MomentumState'] },
  { title: 'Agent推理层', nodes: ['TechnicalAgent', 'BullAgent', 'BearAgent', 'RiskAgent', 'AgentWeight'] },
  { title: '交易控制层', nodes: ['Decision', 'Position', 'RiskRule', 'RiskVeto', 'Evidence'] }
];

const wordCloud = [
  ['RiskVeto', 34], ['MarketSnapshot', 31], ['HighVolatility', 26], ['RiskAgent', 25],
  ['StrongUptrend', 23], ['Decision', 22], ['RSI', 19], ['MACD', 18],
  ['Drawdown', 18], ['TrustWeight', 21], ['NVDA', 20], ['TSLA', 20],
  ['RiskProfile', 24], ['Evidence', 17], ['MaxPosition', 16], ['AgentContest', 15]
];

const closedLoopLayers = [
  {
    title: '金融事件层',
    subtitle: 'Agent 输入',
    nodes: ['Event', 'EventType', 'Sentiment', 'Announcement'],
    triples: [
      ['Asset:NVDA', 'HAS_EVENT', 'Event:NVDA_EarningsBeat'],
      ['Event:NVDA_EarningsBeat', 'HAS_SENTIMENT', 'Sentiment:positive'],
      ['Event:TSLA_EarningsMiss', 'PROVIDES_CONTEXT_TO', 'MarketSnapshot:TSLA_2025-01-29']
    ]
  },
  {
    title: '回测结果层',
    subtitle: 'Agent 输出验证',
    nodes: ['Trade', 'BacktestResult', 'Outcome', 'Return5D'],
    triples: [
      ['Decision:TSLA_2025-05-12', 'EXECUTES', 'Trade:TSLA_2025-05-12'],
      ['Trade:TSLA_2025-05-12', 'PRODUCES', 'BacktestResult:TSLA_2025-05-12'],
      ['BacktestResult:TSLA_2025-05-12', 'HAS_OUTCOME', 'Outcome:WrongPrediction']
    ]
  },
  {
    title: 'Memory & Reflection层',
    subtitle: '下一轮输入',
    nodes: ['Memory', 'Reflection', 'Pattern', 'TrustUpdateRule'],
    triples: [
      ['BacktestResult:AMD_2025-05-06', 'WRITES_TO_MEMORY', 'Memory:AMD_2025-05-06'],
      ['Memory:AMD_2025-05-06', 'GENERATES_REFLECTION', 'Reflection:AMD_2025-05-06'],
      ['Reflection:AMD_2025-05-06', 'UPDATES_TRUST_POLICY', 'TrustUpdateRule:dynamic_agent_reweighting']
    ]
  }
];

const loopSteps = [
  ['图谱输入', 'Asset / Event / RiskProfile / MarketSnapshot'],
  ['Agent分析', 'Technical / Bull / Bear / Risk'],
  ['交易决策', 'Decision + RiskVeto'],
  ['回测验证', 'Trade + BacktestResult + Outcome'],
  ['记忆反思', 'Memory + Reflection + TrustUpdate'],
  ['权重更新', '下一轮Agent信任权重调整']
];

const linkageEdges = [
  ['NVDA', 'SAME_INDUSTRY_AS', 'AMD', 0.95],
  ['AAPL', 'SUPPLY_CHAIN_RELATED_TO', 'NVDA', 0.55],
  ['MSFT', 'AI_ECOSYSTEM_RELATED_TO', 'NVDA', 0.72],
  ['QQQ', 'CONTAINS', 'AAPL', 0.88],
  ['QQQ', 'CONTAINS', 'MSFT', 0.88],
  ['QQQ', 'CONTAINS', 'NVDA', 0.86],
  ['SPY', 'CONTAINS', 'MSFT', 0.72],
  ['SPY', 'CONTAINS', 'NVDA', 0.70],
  ['VOO', 'TRACKS_SIMILAR_INDEX_AS', 'SPY', 0.96],
  ['IVV', 'TRACKS_SIMILAR_INDEX_AS', 'SPY', 0.96]
];

const centralityRows = [
  { asset: 'SPY', pagerank: 0.177, centrality: 1.25, note: 'ETF核心枢纽' },
  { asset: 'NVDA', pagerank: 0.162, centrality: 1.13, note: 'AI半导体风险枢纽' },
  { asset: 'AAPL', pagerank: 0.137, centrality: 1.0, note: '科技权重核心' },
  { asset: 'MSFT', pagerank: 0.132, centrality: 1.0, note: '云计算与ETF核心' },
  { asset: 'AMD', pagerank: 0.101, centrality: 0.63, note: '半导体联动节点' },
  { asset: 'QQQ', pagerank: 0.092, centrality: 0.88, note: '科技ETF聚合节点' }
];

const communities = [
  { name: 'ETF_Core', assets: ['SPY', 'VOO', 'IVV'] },
  { name: 'MegaCap_Tech', assets: ['AAPL', 'MSFT', 'QQQ'] },
  { name: 'AI_Semiconductor', assets: ['NVDA', 'AMD'] },
  { name: 'HighBeta_Growth', assets: ['TSLA', 'NVDA', 'AMD'] }
];

const riskPaths = [
  ['NVDA', 'SPY', 'NVDA -> SPY', 'AI半导体风险影响宽基ETF'],
  ['AMD', 'QQQ', 'AMD -> QQQ', '半导体风险影响科技ETF'],
  ['TSLA', 'SPY', 'TSLA -> SPY', '高波动成长股影响宽基ETF'],
  ['AAPL', 'NVDA', 'AAPL -> NVDA', '科技生态与AI芯片联动']
];

const fallbackLiveKg = {
  ticker: 'NVDA',
  asOf: '静态兜底',
  source: 'frontend fallback when Flask API is not running',
  mode: 'fallback_snapshot',
  snapshot: {
    close: 128.42,
    changePercent: 1.36,
    ma20: 121.86,
    ma60: 112.14,
    ret20: 0.084,
    vol20: 0.514,
    trendState: 'StrongUptrend',
    volatilityState: 'HighVolatility'
  },
  riskProfile: {
    riskBucket: 'high',
    maxPosition: 0.35,
    volLimit: 0.62,
    drawdownLimit: -0.35
  },
  triples: [
    { subject: 'Asset:NVDA', predicate: 'HAS_LIVE_SNAPSHOT', object: 'LiveMarketSnapshot:NVDA_latest' },
    { subject: 'LiveMarketSnapshot:NVDA_latest', predicate: 'HAS_TREND_STATE', object: 'MarketState:StrongUptrend' },
    { subject: 'LiveMarketSnapshot:NVDA_latest', predicate: 'HAS_VOLATILITY_STATE', object: 'MarketState:HighVolatility' },
    { subject: 'LiveMarketSnapshot:NVDA_latest', predicate: 'HAS_CLOSE_PRICE', object: 'Close:128.42' },
    { subject: 'Asset:NVDA', predicate: 'HAS_RISK_BUCKET', object: 'RiskBucket:high' }
  ]
};

const stateDistribution = [
  { label: 'StrongUptrend', count: 4084, color: '#15803d' },
  { label: 'Sideways', count: 3994, color: '#64748b' },
  { label: 'Uptrend', count: 2394, color: '#22c55e' },
  { label: 'Downtrend', count: 1458, color: '#f97316' },
  { label: 'StrongDowntrend', count: 1180, color: '#dc2626' }
];

const queries = [
  {
    title: '按股票查看风险档案',
    desc: '用于说明图谱如何支撑Risk Agent和Risk Veto。',
    code: "MATCH (a:Asset {symbol:'NVDA'})-[:HAS_RISK_PROFILE]->(r:RiskProfile)\nRETURN a.symbol, r.max_position, r.vol_limit, r.drawdown_limit;"
  },
  {
    title: '按行业查看高风险资产',
    desc: '用于比较半导体AI、高波动成长等板块的风险集中度。',
    code: "MATCH (a:Asset)-[:BELONGS_TO_INDUSTRY]->(:Industry {name:'半导体AI'}),\n      (a)-[:HAS_RISK_PROFILE]->(r:RiskProfile)\nWHERE r.risk_level = '高'\nRETURN a.symbol, r.max_position;"
  },
  {
    title: '查看一次决策证据链',
    desc: '用于展示从市场状态到Agent权重再到仓位决策的可解释路径。',
    code: "MATCH (s:MarketSnapshot)-[:GENERATES_DECISION]->(d:Decision),\n      (d)-[:SUPPORTED_BY_EVIDENCE]->(e:Evidence)\nWHERE s.asset = 'TSLA'\nRETURN s.date, d.final_position, e.type, e.score;"
  }
];

function KnowledgeGraphPage({ activeSection = 'overview', onSectionChange }) {
  const [industry, setIndustry] = useState('半导体AI');
  const [symbol, setSymbol] = useState('NVDA');
  const [relationType, setRelationType] = useState('profile');

  const visibleSymbols = industries[industry] || industries['全部行业'];
  const selectedSymbol = visibleSymbols.includes(symbol) ? symbol : visibleSymbols[0];
  const selectedAsset = assetProfiles[selectedSymbol];

  const triples = useMemo(() => {
    const rows = tripleTemplates[relationType].map(([s, p, o]) => [
      hydrate(s, selectedSymbol, selectedAsset),
      p,
      hydrate(o, selectedSymbol, selectedAsset)
    ]);
    return rows;
  }, [relationType, selectedSymbol, selectedAsset]);

  const renderMain = () => {
    if (activeSection === 'explorer') {
      return (
        <ExplorerView
          industry={industry}
          setIndustry={setIndustry}
          symbol={selectedSymbol}
          setSymbol={setSymbol}
          visibleSymbols={visibleSymbols}
          relationType={relationType}
          setRelationType={setRelationType}
          triples={triples}
          asset={selectedAsset}
        />
      );
    }
    if (activeSection === 'live') {
      return <LiveKgView />;
    }
    if (activeSection === 'closedLoop') {
      return <ClosedLoopView />;
    }
    if (activeSection === 'linkage') {
      return <LinkageView />;
    }
    if (activeSection === 'risk') {
      return <RiskView symbol={selectedSymbol} setSymbol={setSymbol} />;
    }
    if (activeSection === 'query') {
      return <QueryView />;
    }
    return <OverviewView onSectionChange={onSectionChange} />;
  };

  return (
    <div className="kg-page">
      <section className="kg-hero">
        <div>
          <span className="kg-kicker">Financial Knowledge Graph</span>
          <h1>市场状态与资产风险知识图谱</h1>
          <p>
            这部分不是独立的静态图，而是多Agent交易框架前置的结构化知识层：
            它把资产画像、日频市场状态、Agent信任权重、决策证据和硬风控规则组织成可查询的图谱。
          </p>
        </div>
        <div className="kg-hero-badge">
          <strong>KG</strong>
          <span>动态金融图谱</span>
        </div>
      </section>

      <div className="kg-section-tabs">
        {[
          ['overview', '图谱总览'],
          ['explorer', '行业/股票探索'],
          ['live', '实时图谱'],
          ['closedLoop', '闭环增强'],
          ['linkage', '联动分析'],
          ['risk', '风险可视化'],
          ['query', '查询与三元组']
        ].map(([id, label]) => (
          <button key={id} className={activeSection === id ? 'active' : ''} onClick={() => onSectionChange?.(id)}>
            {label}
          </button>
        ))}
      </div>

      {renderMain()}
    </div>
  );
}

function OverviewView({ onSectionChange }) {
  return (
    <>
      <section className="kg-stat-grid">
        {graphStats.map((item) => (
          <article className="kg-stat-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.detail}</small>
          </article>
        ))}
      </section>

      <section className="kg-layout">
        <article className="kg-panel">
          <PanelHeader eyebrow="Knowledge Layers" title="四层图谱逻辑" />
          <div className="kg-layer-board">
            {nodeColumns.map((column) => (
              <div className="kg-layer-column" key={column.title}>
                <h3>{column.title}</h3>
                {column.nodes.map((node) => <button key={node} onClick={() => onSectionChange?.('explorer')}>{node}</button>)}
              </div>
            ))}
          </div>
        </article>

        <article className="kg-panel">
          <PanelHeader eyebrow="Pipeline" title="从事实到风控的闭环" />
          <div className="kg-timeline">
            {['行情数据进入', '计算技术指标', '生成MarketSnapshot', '分配Agent权重', '形成Decision', 'RiskVeto检查', '写入复盘记忆'].map((item, index) => (
              <button key={item} onClick={() => onSectionChange?.(index < 3 ? 'explorer' : 'risk')}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <strong>{item}</strong>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="kg-layout balanced">
        <article className="kg-panel">
          <PanelHeader eyebrow="State Distribution" title="市场状态分布" />
          <StateChart />
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Word Cloud" title="图谱关键词云" />
          <WordCloud />
        </article>
      </section>
    </>
  );
}

function ExplorerView({ industry, setIndustry, symbol, setSymbol, visibleSymbols, relationType, setRelationType, triples, asset }) {
  return (
    <>
      <section className="kg-control-panel">
        <div>
          <label>行业筛选</label>
          <div className="kg-chip-row">
            {Object.keys(industries).map((item) => (
              <button
                key={item}
                className={industry === item ? 'active' : ''}
                onClick={() => {
                  setIndustry(item);
                  setSymbol(industries[item][0]);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>股票/资产</label>
          <div className="kg-chip-row">
            {visibleSymbols.map((item) => (
              <button key={item} className={symbol === item ? 'active' : ''} onClick={() => setSymbol(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>三元组侧重点</label>
          <div className="kg-chip-row">
            {relationGroups.map((item) => (
              <button key={item.id} className={relationType === item.id ? 'active' : ''} onClick={() => setRelationType(item.id)}>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="kg-layout">
        <article className="kg-panel">
          <PanelHeader eyebrow="Selected Asset" title={`${symbol} 图谱画像`} />
          <div className="kg-asset-summary">
            <h3>{asset.name}</h3>
            <p>{asset.industry} · {asset.style} · {asset.risk}风险 · 当前状态 {asset.state}</p>
          </div>
          <MiniGraph relationType={relationType} />
        </article>

        <article className="kg-panel">
          <PanelHeader eyebrow="Focused Triples" title="重点三元组示例" />
          <p className="kg-muted">
            当前侧重：{relationGroups.find((item) => item.id === relationType)?.desc}
          </p>
          <TripleTable triples={triples} />
        </article>
      </section>
    </>
  );
}

function RiskView({ symbol, setSymbol }) {
  const assets = Object.entries(assetProfiles).map(([key, value]) => ({ symbol: key, ...value }));
  const selected = assetProfiles[symbol] || assetProfiles.NVDA;
  const maxVeto = Math.max(...assets.map((item) => item.veto));

  return (
    <>
      <section className="kg-layout">
        <article className="kg-panel">
          <PanelHeader eyebrow="Risk Radar" title="资产风险对比" />
          <div className="kg-bar-list">
            {assets.map((asset) => (
              <button key={asset.symbol} className={`kg-bar-row ${asset.symbol === symbol ? 'active' : ''}`} onClick={() => setSymbol(asset.symbol)}>
                <span>{asset.symbol}</span>
                <div><i style={{ width: `${(asset.veto / maxVeto) * 100}%` }} /></div>
                <strong>{Math.round(asset.veto * 100)}%</strong>
              </button>
            ))}
          </div>
        </article>

        <article className="kg-panel">
          <PanelHeader eyebrow="Asset Detail" title={`${symbol} 风控画像`} />
          <div className="kg-profile-grid">
            <InfoItem label="行业" value={selected.industry} />
            <InfoItem label="投资风格" value={selected.style} />
            <InfoItem label="风险等级" value={selected.risk} />
            <InfoItem label="平均仓位" value={`${Math.round(selected.position * 100)}%`} />
            <InfoItem label="Risk Veto触发率" value={`${Math.round(selected.veto * 100)}%`} />
            <InfoItem label="波动状态" value={selected.vol} />
          </div>
        </article>
      </section>

      <section className="kg-layout balanced">
        <article className="kg-panel">
          <PanelHeader eyebrow="Regime Chart" title="市场状态出现次数" />
          <StateChart />
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Agent Focus" title="不同状态下的权重偏移" />
          <div className="kg-weight-cards">
            <InfoItem label="高波动资产" value="RiskAgent权重上升" />
            <InfoItem label="强趋势行情" value="Technical/Bull权重上升" />
            <InfoItem label="下跌行情" value="Bear/Risk权重上升" />
            <InfoItem label="超买状态" value="RiskVeto检查更严格" />
          </div>
        </article>
      </section>
    </>
  );
}

function QueryView() {
  return (
    <>
      <section className="kg-panel">
        <PanelHeader eyebrow="Neo4j Application" title="图数据库导入与路径查询" />
        <p className="kg-muted">
          已生成 Neo4j 导入文件：6227 个节点、12726 条边。导入后可以查询资产、市场状态、Agent权重、
          交易决策、Risk Veto、Memory 与 Reflection 之间的多跳路径。
        </p>
      </section>
      <section className="kg-card-grid">
        {queries.map((query) => (
          <article className="kg-panel" key={query.title}>
            <PanelHeader eyebrow="Cypher Query" title={query.title} />
            <p className="kg-muted">{query.desc}</p>
            <pre className="kg-query"><code>{query.code}</code></pre>
          </article>
        ))}
      </section>
      <section className="kg-panel">
        <PanelHeader eyebrow="Triple Pattern" title="报告中可解释的三类三元组" />
        <TripleTable triples={[
          ['Asset:NVDA', 'HAS_RISK_PROFILE', 'RiskProfile:HighRiskAsset'],
          ['MarketSnapshot:TSLA_2025-05-12', 'HAS_VOLATILITY_STATE', 'MarketState:HighVolatility'],
          ['Decision:AMD_2025-05-12', 'SUPPORTED_BY_EVIDENCE', 'Evidence:RiskScore']
        ]} />
      </section>
    </>
  );
}

function ClosedLoopView() {
  return (
    <>
      <section className="kg-panel">
        <PanelHeader eyebrow="Architecture Diagram" title="知识图谱与多Agent交易框架闭环架构" />
        <ClosedLoopDiagram />
      </section>

      <section className="kg-panel">
        <PanelHeader eyebrow="Step Flow" title="多Agent决策流程：每一步输出如何成为下一步输入" />
        <AgentArrowFlow />
      </section>

      <section className="kg-panel">
        <PanelHeader eyebrow="Input And Output" title="知识图谱在Agent系统中的闭环定位" />
        <div className="kg-loop-strip">
          {loopSteps.map(([title, detail], index) => (
            <div className="kg-loop-step" key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <strong>{title}</strong>
              <p>{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="kg-card-grid">
        {closedLoopLayers.map((layer) => (
          <article className="kg-panel" key={layer.title}>
            <PanelHeader eyebrow={layer.subtitle} title={layer.title} />
            <div className="kg-tag-cloud compact">
              {layer.nodes.map((node) => <span key={node}>{node}</span>)}
            </div>
            <TripleTable triples={layer.triples} />
          </article>
        ))}
      </section>

      <section className="kg-layout balanced">
        <article className="kg-panel">
          <PanelHeader eyebrow="Closed Loop Metrics" title="闭环数据规模" />
          <div className="kg-profile-grid">
            <InfoItem label="真实Agent资产" value="7" />
            <InfoItem label="Daily历史行数" value="1,325" />
            <InfoItem label="交易记录" value="52" />
            <InfoItem label="记忆反思记录" value="70" />
            <InfoItem label="权重记录" value="70" />
            <InfoItem label="匹配三元组" value="12,726" />
          </div>
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Paper Writing" title="论文中怎么表述闭环" />
          <p className="kg-muted">
            该图谱既是Agent决策前的输入知识库，也是Agent决策后的输出记忆库。
            事件、风险档案和市场状态进入Agent；决策、回测结果和反思再写回图谱，
            最终用于下一轮Trust Weight更新。
          </p>
        </article>
      </section>
    </>
  );
}

function ClosedLoopDiagram() {
  const blocks = [
    {
      id: 'kg-input',
      title: '知识图谱输入层',
      subtitle: 'KG → Agents',
      type: 'input',
      items: ['Asset', 'RiskProfile', 'FinancialEvent', 'MarketSnapshot'],
      desc: '提供资产画像、风险档案、事件上下文和实时市场快照。'
    },
    {
      id: 'agent-analysis',
      title: '多Agent分析层',
      subtitle: 'Parallel Analysis',
      type: 'agent',
      items: ['Technical Agent', 'Bull Agent', 'Bear Agent', 'Risk Agent'],
      desc: '不同Agent从图谱读取输入并形成结构化观点。'
    },
    {
      id: 'debate-decision',
      title: '辩论与决策层',
      subtitle: 'Debate → Decision',
      type: 'agent',
      items: ['Debate Judge', 'Trust Weight', 'Decision Agent', 'Risk Veto'],
      desc: '综合多方观点，生成仓位，并执行硬风控。'
    },
    {
      id: 'execution',
      title: '交易执行层',
      subtitle: 'Decision → Trade',
      type: 'output',
      items: ['Decision', 'Target Position', 'Trade', 'Action'],
      desc: '把目标仓位和动作写入交易记录。'
    },
    {
      id: 'backtest',
      title: '回测验证层',
      subtitle: 'Trade → Result',
      type: 'output',
      items: ['BacktestResult', 'Return', 'Drawdown', 'WinRate'],
      desc: '验证交易结果，评估收益、回撤和策略表现。'
    },
    {
      id: 'memory',
      title: '记忆反思层',
      subtitle: 'Memory → Trust Update',
      type: 'feedback',
      items: ['Memory', 'Reflection', 'ErrorPattern', 'TrustUpdateRule'],
      desc: '记录预测对错和错误模式，用于下一轮权重更新。'
    }
  ];

  return (
    <div className="kg-architecture-grid">
      {blocks.map((block, index) => (
        <div className={`kg-arch-block ${block.type}`} key={block.id}>
          <div className="kg-arch-block-head">
            <span>{block.subtitle}</span>
            <h3>{block.title}</h3>
          </div>
          <p>{block.desc}</p>
          <div className="kg-arch-tags">
            {block.items.map((item) => <span key={item}>{item}</span>)}
          </div>
          {index < 5 && <i className="kg-arch-connector next" />}
          {block.id === 'memory' && <i className="kg-arch-connector feedback" />}
        </div>
      ))}
      <div className="kg-arch-feedback-label">Reflection 写回图谱，更新下一轮 Agent 信任权重</div>
      </div>
  );
}

function AgentArrowFlow() {
  const steps = [
    {
      step: '01',
      title: '知识图谱输入',
      agent: 'KG / 数据层',
      input: '行情、技术指标、资产风险档案、事件信息',
      output: 'MarketSnapshot + RiskProfile + EventContext',
      next: '作为市场状态识别和各子Agent的共同输入'
    },
    {
      step: '02',
      title: '市场状态识别',
      agent: 'Market Regime Agent',
      input: 'MarketSnapshot、MA20/MA60、收益率、波动率',
      output: '上涨 / 震荡 / 下跌等市场状态',
      next: '影响各Agent初始权重和仓位下限'
    },
    {
      step: '03',
      title: '分析型子Agent',
      agent: 'Technical / Bull / Bear / Risk',
      input: '市场状态 + 技术指标 + 风险档案 + 事件上下文',
      output: '技术信号、上涨理由、下跌理由、风险评分',
      next: '交给Debate Judge进行观点整合'
    },
    {
      step: '04',
      title: '辩论裁判',
      agent: 'Debate Judge',
      input: 'Bull观点、Bear观点、Risk约束、Technical信号',
      output: '综合评分 + 支撑证据 + 反对证据',
      next: '作为Trust Weight和Decision Agent的依据'
    },
    {
      step: '05',
      title: '信任权重',
      agent: 'Trust Weight Module',
      input: '市场状态、Agent历史正确率、记忆反思',
      output: 'Technical/Bull/Bear/Risk动态权重',
      next: '用于加权生成最终交易建议'
    },
    {
      step: '06',
      title: '最终决策',
      agent: 'Decision Agent',
      input: '综合评分 + 动态权重 + 资产风险档案',
      output: '目标仓位、BUY/SELL/HOLD、置信度',
      next: '进入Risk Veto进行硬风控检查'
    },
    {
      step: '07',
      title: '风险否决',
      agent: 'Risk Veto',
      input: '目标仓位、风险评分、波动率、回撤阈值',
      output: '最终仓位 + 是否降仓/否决',
      next: '进入回测执行，生成每日持仓和交易记录'
    },
    {
      step: '08',
      title: '回测验证',
      agent: 'Backtest Engine',
      input: '最终仓位、价格序列、交易动作',
      output: '收益率、最大回撤、交易记录、胜率',
      next: '写入Memory，判断这次决策是否正确'
    },
    {
      step: '09',
      title: '记忆反思',
      agent: 'Memory & Reflection',
      input: '回测结果、预测对错、风险否决记录',
      output: '反思文本、错误模式、Trust Update信号',
      next: '反馈给下一轮信任权重更新'
    }
  ];

  return (
    <div className="kg-agent-flow">
      {steps.map((item, index) => (
        <div className="kg-agent-flow-item" key={item.step}>
          <article className="kg-agent-flow-card">
            <div className="kg-agent-flow-top">
              <span>{item.step}</span>
              <strong>{item.title}</strong>
            </div>
            <div className="kg-agent-flow-agent">{item.agent}</div>
            <div className="kg-agent-flow-grid">
              <div>
                <label>输入</label>
                <p>{item.input}</p>
              </div>
              <div>
                <label>输出</label>
                <p>{item.output}</p>
              </div>
            </div>
            <div className="kg-agent-flow-next">
              <label>传给下一步</label>
              <p>{item.next}</p>
            </div>
          </article>
          {index < steps.length - 1 && <div className="kg-agent-flow-arrow" aria-hidden="true">→</div>}
        </div>
      ))}
      <div className="kg-agent-flow-feedback">
        <span>反馈闭环</span>
        Memory & Reflection 会把预测对错和错误模式写回图谱，下一轮 Trust Weight Module 会据此调整各Agent权重。
      </div>
    </div>
  );
}

function LinkageView() {
  return (
    <>
      <section className="kg-layout">
        <article className="kg-panel">
          <PanelHeader eyebrow="Industry Linkage" title="行业、ETF与供应链联动关系" />
          <TripleTable triples={linkageEdges.slice(0, 8).map(([s, p, o]) => [`Asset:${s}`, p, `Asset:${o}`])} />
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Risk Path" title="最短风险传播路径" />
          <div className="kg-path-list">
            {riskPaths.map(([src, dst, path, desc]) => (
              <div className="kg-path-card" key={`${src}-${dst}`}>
                <span>{src} to {dst}</span>
                <strong>{path}</strong>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="kg-layout balanced">
        <article className="kg-panel">
          <PanelHeader eyebrow="PageRank & Centrality" title="关键资产与风险枢纽" />
          <div className="kg-centrality-list">
            {centralityRows.map((row, index) => (
              <div className="kg-centrality-row" key={row.asset}>
                <span>{index + 1}</span>
                <strong>{row.asset}</strong>
                <div><i style={{ width: `${row.pagerank * 520}%` }} /></div>
                <em>{row.note}</em>
              </div>
            ))}
          </div>
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Community Detection" title="板块聚类结果" />
          <div className="kg-community-grid">
            {communities.map((community) => (
              <div className="kg-community-card" key={community.name}>
                <h3>{community.name}</h3>
                <div className="kg-tag-cloud compact">
                  {community.assets.map((asset) => <span key={asset}>{asset}</span>)}
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="kg-panel">
        <PanelHeader eyebrow="Paper Conclusion" title="可写入论文的分析结论" />
        <p className="kg-muted">
          图算法结果显示，NVDA 同时连接半导体同行 AMD、科技成长 ETF QQQ、宽基 ETF SPY 以及 AI 生态相关的 MSFT，
          因此在 PageRank 和中心性分析中呈现较强的风险枢纽特征。该结果说明知识图谱不仅能够保存三元组，
          还可以通过图算法识别行业联动和风险传播路径。
        </p>
      </section>
    </>
  );
}

function LiveKgView() {
  const [ticker, setTicker] = useState('NVDA');
  const [liveData, setLiveData] = useState(fallbackLiveKg);
  const [status, setStatus] = useState('fallback');
  const [loading, setLoading] = useState(false);

  const loadLiveKg = async (symbol = ticker) => {
    setLoading(true);
    try {
      const data = await api.getLiveKg(symbol);
      setLiveData(data);
      setStatus('live');
    } catch (error) {
      setLiveData({ ...fallbackLiveKg, ticker: symbol });
      setStatus('fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLiveKg(ticker);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const snapshot = liveData.snapshot || {};
  const risk = liveData.riskProfile || {};

  return (
    <>
      <section className="kg-control-panel live">
        <div>
          <label>实时股票</label>
          <div className="kg-chip-row">
            {['SPY', 'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMD', 'QQQ'].map((item) => (
              <button
                key={item}
                className={ticker === item ? 'active' : ''}
                onClick={() => {
                  setTicker(item);
                  loadLiveKg(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>数据状态</label>
          <div className={`kg-live-status ${status}`}>
            {loading ? '正在刷新...' : status === 'live' ? '已接入后端实时快照' : '静态预览兜底'}
          </div>
        </div>
        <div>
          <label>操作</label>
          <button className="kg-refresh-btn" onClick={() => loadLiveKg(ticker)} disabled={loading}>
            刷新实时图谱
          </button>
        </div>
      </section>

      <section className="kg-layout">
        <article className="kg-panel">
          <PanelHeader eyebrow="Dynamic Snapshot" title={`${liveData.ticker || ticker} 实时/准实时市场快照`} />
          <div className="kg-profile-grid">
            <InfoItem label="日期" value={liveData.asOf || '-'} />
            <InfoItem label="来源" value={liveData.source || '-'} />
            <InfoItem label="最新收盘" value={snapshot.close ?? '-'} />
            <InfoItem label="日涨跌幅" value={snapshot.changePercent !== undefined ? `${snapshot.changePercent}%` : '-'} />
            <InfoItem label="趋势状态" value={snapshot.trendState || '-'} />
            <InfoItem label="波动状态" value={snapshot.volatilityState || '-'} />
            <InfoItem label="MA20 / MA60" value={`${snapshot.ma20 || '-'} / ${snapshot.ma60 || '-'}`} />
            <InfoItem label="风险档案" value={`${risk.riskBucket || '-'} / max ${risk.maxPosition || '-'}`} />
          </div>
        </article>
        <article className="kg-panel">
          <PanelHeader eyebrow="Live Triples" title="实时生成三元组" />
          <TripleTable triples={(liveData.triples || []).map((row) => [row.subject, row.predicate, row.object])} />
        </article>
      </section>

      <section className="kg-panel">
        <PanelHeader eyebrow="Dynamic KG Note" title="动态知识图谱怎么理解" />
        <p className="kg-muted">
          知识图谱的本体结构可以是静态的，例如 Asset、MarketSnapshot、RiskProfile、Decision 等实体类型保持稳定；
          但金融市场中的价格、指标、事件和状态会持续变化，因此可以周期性生成新的 LiveMarketSnapshot，并把它写入图谱。
          这就是动态知识图谱：静态 schema + 持续更新的时间快照。
        </p>
      </section>
    </>
  );
}

function StateChart() {
  const max = Math.max(...stateDistribution.map((item) => item.count));
  return (
    <div className="kg-state-bars">
      {stateDistribution.map((item) => (
        <div className="kg-state-row" key={item.label}>
          <span>{item.label}</span>
          <div><i style={{ width: `${(item.count / max) * 100}%`, background: item.color }} /></div>
          <strong>{item.count}</strong>
        </div>
      ))}
    </div>
  );
}

function WordCloud() {
  return (
    <div className="kg-word-cloud">
      {wordCloud.map(([word, size], index) => (
        <span key={word} style={{ fontSize: `${size}px`, transform: `rotate(${index % 3 === 0 ? -5 : index % 3 === 1 ? 4 : 0}deg)` }}>
          {word}
        </span>
      ))}
    </div>
  );
}

function MiniGraph({ relationType }) {
  const active = relationType;
  return (
    <div className="kg-mini-graph">
      <div className={`kg-mini-node ${active === 'profile' ? 'active' : ''}`}>Asset</div>
      <div className={`kg-mini-node ${active === 'profile' ? 'active' : ''}`}>RiskProfile</div>
      <div className={`kg-mini-node ${active === 'state' ? 'active' : ''}`}>MarketSnapshot</div>
      <div className={`kg-mini-node ${active === 'state' ? 'active' : ''}`}>MarketState</div>
      <div className={`kg-mini-node ${active === 'agent' ? 'active' : ''}`}>AgentWeight</div>
      <div className={`kg-mini-node ${active === 'agent' ? 'active' : ''}`}>Decision</div>
      <div className={`kg-mini-node ${active === 'agent' ? 'active danger' : ''}`}>RiskVeto</div>
    </div>
  );
}

function TripleTable({ triples }) {
  return (
    <div className="kg-triple-table">
      <div className="kg-triple-head">
        <span>Subject</span>
        <span>Predicate</span>
        <span>Object</span>
      </div>
      {triples.map(([s, p, o]) => (
        <div className="kg-triple-row" key={`${s}-${p}-${o}`}>
          <code>{s}</code>
          <strong>{p}</strong>
          <code>{o}</code>
        </div>
      ))}
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="kg-info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function PanelHeader({ eyebrow, title }) {
  return (
    <div className="kg-panel-header">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
    </div>
  );
}

function hydrate(text, symbol, asset) {
  return text
    .replaceAll('{symbol}', symbol)
    .replaceAll('{industry}', asset.industry)
    .replaceAll('{style}', asset.style.replaceAll(' ', ''))
    .replaceAll('{risk}', asset.risk)
    .replaceAll('{state}', asset.state)
    .replaceAll('{vol}', asset.vol);
}

export default KnowledgeGraphPage;
