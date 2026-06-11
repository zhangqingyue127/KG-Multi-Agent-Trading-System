// Neo4j import script for market-state and asset-risk knowledge graph
// Put the CSV files in Neo4j import directory, then run these commands.

CREATE CONSTRAINT asset_symbol IF NOT EXISTS FOR (a:Asset) REQUIRE a.symbol IS UNIQUE;
CREATE CONSTRAINT risk_profile_name IF NOT EXISTS FOR (r:RiskProfile) REQUIRE r.name IS UNIQUE;
CREATE CONSTRAINT market_state_name IF NOT EXISTS FOR (m:MarketState) REQUIRE m.name IS UNIQUE;
CREATE CONSTRAINT agent_name IF NOT EXISTS FOR (a:Agent) REQUIRE a.name IS UNIQUE;

LOAD CSV WITH HEADERS FROM 'file:///02_asset_risk_profiles.csv' AS row
MERGE (a:Asset {symbol: row.asset})
SET a.asset_type = row.asset_type, a.vol_bucket = row.vol_bucket, a.data_source = row.data_source
MERGE (r:RiskProfile {name: row.risk_profile})
SET r.min_position = toFloat(row.min_position),
    r.max_position = toFloat(row.max_position),
    r.max_drawdown_limit = toFloat(row.max_drawdown_limit),
    r.vol_limit = toFloat(row.vol_limit)
MERGE (a)-[:HAS_RISK_PROFILE]->(r);

LOAD CSV WITH HEADERS FROM 'file:///04_market_states.csv' AS row
MERGE (a:Asset {symbol: row.asset})
MERGE (trend:MarketState {name: row.trend_state})
MERGE (vol:MarketState {name: row.vol_state})
MERGE (a)-[:IN_MARKET_STATE {date: row.date}]->(trend)
MERGE (a)-[:IN_VOLATILITY_STATE {date: row.date}]->(vol);

LOAD CSV WITH HEADERS FROM 'file:///05_agent_trust_weights.csv' AS row
MERGE (agent:Agent {name: row.agent})
MERGE (a:Asset {symbol: row.asset})
MERGE (a)-[:ASSIGNS_TRUST_WEIGHT {date: row.date, weight: toFloat(row.weight), trend_state: row.trend_state, vol_state: row.vol_state}]->(agent);

LOAD CSV WITH HEADERS FROM 'file:///06_decision_and_risk_veto.csv' AS row
MERGE (a:Asset {symbol: row.asset})
MERGE (d:Decision {id: row.asset + '_' + row.date})
SET d.date = row.date,
    d.raw_position = toFloat(row.raw_position),
    d.final_position = toFloat(row.final_position),
    d.veto_applied = row.veto_applied,
    d.veto_reason = row.veto_reason,
    d.technical_score = toFloat(row.technical_score),
    d.bull_score = toFloat(row.bull_score),
    d.bear_score = toFloat(row.bear_score),
    d.risk_score = toFloat(row.risk_score)
MERGE (d)-[:TARGETS_ASSET]->(a);
